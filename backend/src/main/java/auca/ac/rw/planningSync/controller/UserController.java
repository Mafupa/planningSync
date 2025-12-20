package auca.ac.rw.planningSync.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import auca.ac.rw.planningSync.dto.LoginRequest;
import auca.ac.rw.planningSync.dto.UpdateUserRequest;
import auca.ac.rw.planningSync.model.User;
import auca.ac.rw.planningSync.service.UserService;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequestMapping(value = "/api/user")
public class UserController {
    @Autowired
    private UserService userService;

    @GetMapping(value = "/{username}")
    public ResponseEntity<?> getUser(@PathVariable String username) {
        User user = userService.getUser(username);
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @PostMapping(value = "/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        String message = userService.registerUser(user);
        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    @PostMapping(value = "/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
        String message = userService.loginUser(loginRequest.getUsername(), loginRequest.getPassword());
        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    @DeleteMapping(value = "/{username}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable String username) {
        String message = userService.deleteUser(username);
        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    @PutMapping(value = "/{username}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUser(@PathVariable String username, @RequestBody UpdateUserRequest updateRequest) {
        String message = userService.updateUser(username, updateRequest.getPassword(), updateRequest.getVillageName());
        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    @PostMapping("/request-password-reset")
    public ResponseEntity<?> requestReset(@RequestParam String email) {
        String message = userService.requestPasswordReset(email);
        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> verifyOtp(@RequestParam String email, @RequestParam String password,
            @RequestParam String otp) {
        String message = userService.resetPassword(email, password, otp);
        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return new ResponseEntity<>(userService.getAllUsers(search, pageable), HttpStatus.OK);
    }

    @PostMapping("/verify-2fa")
    public ResponseEntity<?> verifyTwoFactor(@RequestParam String username, @RequestParam String otp) {
        String token = userService.verifyTwoFactor(username, otp);
        if ("invalid_otp".equals(token)) {
            return new ResponseEntity<>("Invalid OTP", HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(token, HttpStatus.OK);
    }

}