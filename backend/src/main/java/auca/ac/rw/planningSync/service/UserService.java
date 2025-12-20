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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    private Map<String, String> twoFactorOtpStorage = new HashMap<>();

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
            User user = userRepository.findByUsername(username).orElseThrow();
            if (user.getUserInfo() != null && user.getUserInfo().isTwoFactorEnabled()) {
                String otp = OTPUtil.generateOTP(6);
                String email = user.getUserInfo().getEmail();
                if (email == null) {
                    return jwtService.generateToken(username); // Fallback if no email? Or error? For now fallback or
                                                               // logic to fetch email safely
                }
                emailService.sendLoginOTP(email, otp);
                twoFactorOtpStorage.put(username, otp);
                return "2FA_REQUIRED";
            }
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
        BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        passwordResetOtpStorage.remove(email);
        return "password_reset";
    }

    public Page<User> getAllUsers(String search, Pageable pageable) {
        if (search != null && !search.trim().isEmpty()) {
            return userRepository.searchUsers(search, pageable);
        }
        return userRepository.findAll(pageable);
    }

    public String updateUser(String username, String newPassword, String newVillageName) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found with username: " + username));

        if (newPassword != null && !newPassword.trim().isEmpty()) {
            BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
            user.setPassword(passwordEncoder.encode(newPassword));
        }

        if (newVillageName != null && !newVillageName.trim().isEmpty()) {
            Location village = locationRepository.findByName(newVillageName)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Provided village/location does not exist"));
            user.setVillage(village);
        }

        userRepository.save(user);
        return "User updated successfully";
    }

    public String verifyTwoFactor(String username, String otp) {
        if (!twoFactorOtpStorage.containsKey(username) || !twoFactorOtpStorage.get(username).equals(otp)) {
            return "invalid_otp";
        }
        twoFactorOtpStorage.remove(username);
        return jwtService.generateToken(username);
    }

    public long countUsers() {
        return userRepository.count();
    }
}
