package auca.ac.rw.planningSync.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import auca.ac.rw.planningSync.model.UserInfo;
import auca.ac.rw.planningSync.service.UserInfoService;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/userinfo")
public class UserInfoController {

    @Autowired
    private UserInfoService userInfoService;

    @GetMapping("/{username}")
    public ResponseEntity<?> getUserInfo(@PathVariable String username) {

        UserInfo userInfo = userInfoService.getUserInfo(username);
        return new ResponseEntity<>(userInfo, HttpStatus.OK);
    }

    @PostMapping("/{username}")
    public ResponseEntity<?> addOrUpdateUserInfo(
            @PathVariable String username,
            @RequestBody UserInfo userInfo) {

        String message = userInfoService.addOrUpdateUserInfo(username, userInfo);
        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    @DeleteMapping("/{username}")
    public ResponseEntity<?> deleteUserInfo(@PathVariable String username) {
        String message = userInfoService.deleteUserInfo(username);
        return new ResponseEntity<>(message, HttpStatus.OK);
    }
}
