package auca.ac.rw.planningSync.service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import auca.ac.rw.planningSync.model.Location;
import auca.ac.rw.planningSync.model.User;
import auca.ac.rw.planningSync.repository.LocationRepository;
import auca.ac.rw.planningSync.repository.UserRepository;
import auca.ac.rw.planningSync.util.OTPUtil;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    AuthenticationManager authManager;

    @Autowired
    private JWTService jwtService;

    private Map<String, String> passwordResetOtpStorage = new HashMap<>();

    public User getUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found with username: " + username));
        return user;
    }

    public String registerUser(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Username already exists");
        }

        if (user.getVillage() == null || user.getVillage().getName() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "User must have a village name");
        }

        BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        Location village = locationRepository.findByName(user.getVillage().getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Provided village/location does not exist"));

        user.setVillage(village);
        userRepository.save(user);

        return "User saved successfully";
    }

    public String loginUser(String username, String password) {
        Authentication authentication = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password));
        if (authentication.isAuthenticated()) {
            return jwtService.generateToken(username);
        }
        return "Invalid credentials";
    }

    public String deleteUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found with username: " + username));

        userRepository.delete(user);

        return "User " + username + " deleted successfully!";
    }

    public String requestPasswordReset(String email) {
        Optional<User> userOpt = userRepository.findByUserInfoEmail(email);

        if (!userOpt.isPresent()) {
            return "email_not_found";
        }
        String otp = OTPUtil.generateOTP(6);
        emailService.sendPasswordResetOTP(email, otp);
        passwordResetOtpStorage.put(email, otp);

        return "email_sent";
    }

    public String resetPassword(String email, String newPassword, String otp) {
        if (!passwordResetOtpStorage.containsKey(email) || !passwordResetOtpStorage.get(email).equals(otp)) {
            return "invalid_otp";
        }
        passwordResetOtpStorage.remove(email);
        User user = userRepository.findByUserInfoEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found with email: " + email));
        user.setPassword(newPassword);
        userRepository.save(user);
        passwordResetOtpStorage.remove(email);
        return "password_reset";
    }
}
