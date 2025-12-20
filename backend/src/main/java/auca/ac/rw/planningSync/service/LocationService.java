package auca.ac.rw.planningSync.service;

import auca.ac.rw.planningSync.model.ELocation;
import auca.ac.rw.planningSync.model.Location;
import auca.ac.rw.planningSync.model.User;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import auca.ac.rw.planningSync.repository.LocationRepository;

@Service
public class LocationService {
    @Autowired
    private LocationRepository locationRepository;

    public Location getLocation(String name) {
        Location location = locationRepository.findByName(name)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No location with name : " + name + " found!"));
        return location;
    }

    public String addLocation(Location location) {
        if (locationRepository.existsByName(location.getName())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Location " + location.getName() + " already exists");
        }

        if (location.getParentLocation() != null && location.getParentLocation().getName() != null) {
            if (location.getType() == ELocation.PROVINCE) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid parent. A " + location.getType() +
                                " shouldn't have a parent");
            }
            Location parent = locationRepository.findByName(location.getParentLocation().getName())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Parent location " + location.getParentLocation().getName() + " doesn't exist"));

            if (!location.getType().isValidParent(parent.getType())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid parent. A " + location.getType() +
                                " must have a parent of type " + location.getType().expectedParent());
            }

            location.setParentLocation(parent);
        } else if (location.getType() != ELocation.PROVINCE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No parent. A " + location.getType() +
                            " must have a parent of type " + location.getType().expectedParent());
        }

        locationRepository.save(location);
        return "Location " + location.getName() + " saved successfully";
    }

    public String updateLocation(String name, Location locationInfo) {
        if (locationRepository.existsByName(locationInfo.getName())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Location " + locationInfo.getName() + " already exists");
        }
        Location location = locationRepository.findByName(name).orElseThrow(
                () -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Location " + name + " not found!"));

        if (locationInfo.getParentLocation() != null && locationInfo.getParentLocation().getName() != null) {
            if (locationInfo.getType() == ELocation.PROVINCE) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid parent. A " + location.getType() +
                                " shouldn't have a parent");
            }
            Location parent = locationRepository.findByName(locationInfo.getParentLocation().getName())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Parent location " + locationInfo.getParentLocation().getName() + " doesn't exist"));

            if (!locationInfo.getType().isValidParent(parent.getType())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid parent. A " + locationInfo.getType() +
                                " must have a parent of type " + locationInfo.getType().expectedParent());
            }
            location.setParentLocation(parent);
        } else if (location.getType() != ELocation.PROVINCE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No parent. A " + location.getType() +
                            " must have a parent of type " + location.getType().expectedParent());
        }
        location.setName(name);
        location.setType(locationInfo.getType());

        locationRepository.save(location);
        return "Location " + location.getName() + " updated successfully";
    }

    public String deleteLocation(String name) {
        Location location = locationRepository.findByName(name)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No location with name : " + name + " found!"));

        if (!location.getChildren().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Location has child locations");
        }
        if (!location.getUsers().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Location has users");
        }

        locationRepository.delete(location);
        return "Location " + location.getName() + " deleted successfully";

    }

    public List<User> getUsersByLocation(String locationName) {
        Location location = locationRepository.findByName(locationName)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Location " + locationName + " not found"));

        List<User> users = new ArrayList<>();
        collectUsers(location, users);
        return users;
    }

    private void collectUsers(Location location, List<User> users) {
        users.addAll(location.getUsers());

        if (location.getType() != ELocation.VILLAGE) {
            for (Location child : location.getChildren()) {
                collectUsers(child, users);
            }
        }
    }

    public List<Location> getAllLocations() {
        return locationRepository.findAll();
    }

    public long countLocations() {
        return locationRepository.count();
    }
}
