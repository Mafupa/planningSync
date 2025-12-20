package auca.ac.rw.planningSync.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import auca.ac.rw.planningSync.model.User;
import auca.ac.rw.planningSync.model.UserInfo;
import auca.ac.rw.planningSync.repository.UserInfoRepository;
import auca.ac.rw.planningSync.repository.UserRepository;

@Service
public class UserInfoService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserInfoRepository userInfoRepository;

    public UserInfo getUserInfo(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found with username: " + username));
        return userInfoRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("UserInfo not found for user: " + username));
    }

    public String addOrUpdateUserInfo(String username, UserInfo newInfo) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No user with this username!"));

        UserInfo userInfo = userInfoRepository.findByUserId(user.getId()).orElse(new UserInfo());

        userInfo.setEmail(newInfo.getEmail());
        userInfo.setPhone(newInfo.getPhone());
        userInfo.setTwoFactorEnabled(newInfo.isTwoFactorEnabled());

        userInfo.setUser(user);
        user.setUserInfo(userInfo);

        userInfoRepository.save(userInfo);

        return "User's information saved successfully";
    }

    public String deleteUserInfo(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found with username: " + username));
        UserInfo userInfo = userInfoRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "UserInfo not found for user: " + username));

        userInfoRepository.delete(userInfo);

        user.setUserInfo(null);
        userRepository.save(user);

        return "User info deleted successfully for user: " + username;
    }

}
