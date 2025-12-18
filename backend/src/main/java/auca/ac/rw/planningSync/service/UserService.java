package auca.ac.rw.planningSync.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import auca.ac.rw.planningSync.model.Location;
import auca.ac.rw.planningSync.model.User;
import auca.ac.rw.planningSync.repository.LocationRepository;
import auca.ac.rw.planningSync.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LocationRepository locationRepository;

    public User getUser(String username){
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
                "Username already exists"
            );
        }

        if (user.getVillage() == null || user.getVillage().getName() == null) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "User must have a village name"
            );
        }

        Location village = locationRepository.findByName(user.getVillage().getName())
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Provided village/location does not exist"
            ));

        user.setVillage(village);
        userRepository.save(user);

        return "User saved successfully";
    }

    public String deleteUser(String username) {
        User user = userRepository.findByUsername(username)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "User not found with username: " + username));
       
        userRepository.delete(user);

        return "User "+username+" deleted successfully!";
    }
}
