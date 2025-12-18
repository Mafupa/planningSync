package auca.ac.rw.planningSync.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import auca.ac.rw.planningSync.model.Location;
import auca.ac.rw.planningSync.model.User;
import auca.ac.rw.planningSync.service.LocationService;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequestMapping(value = "/api/location")
public class LocationController {
    @Autowired
    private LocationService locationService;

    @GetMapping(value = "/{name}")
    public ResponseEntity<?> getLocation(@PathVariable String name) {
        Location location = locationService.getLocation(name);
        return new ResponseEntity<>(location, HttpStatus.OK);
    }

    @PostMapping(value = "/")
    public ResponseEntity<?> addLocation(@RequestBody Location location) {
        String message = locationService.addLocation(location);
        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    @PutMapping(value = "/{name}")
    public ResponseEntity<?> putLocation(@PathVariable String name, @RequestBody Location location) {
        String message = locationService.updateLocation(name, location);
        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    @DeleteMapping(value = "/{name}")
    public ResponseEntity<?> deleteLocation(@PathVariable String name) {
        String message = locationService.deleteLocation(name);
        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    @GetMapping(value = "/{name}/allusers")
    public ResponseEntity<?> getAllUsersFromLocation(@PathVariable String name) {
        List<User> users = locationService.getUsersByLocation(name);
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @GetMapping(value = "/all")
    public ResponseEntity<?> getAllLocations() {
        List<Location> locations = locationService.getAllLocations();
        return new ResponseEntity<>(locations, HttpStatus.OK);
    }
}
