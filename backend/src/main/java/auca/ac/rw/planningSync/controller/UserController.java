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
import auca.ac.rw.planningSync.model.User;
import auca.ac.rw.planningSync.service.UserService;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

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
    public ResponseEntity<?> deleteUser(@PathVariable String username) {
        String message = userService.deleteUser(username);
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
    public ResponseEntity<?> getAllUsers() {
        return new ResponseEntity<>(userService.getAllUsers(), HttpStatus.OK);
    }

}