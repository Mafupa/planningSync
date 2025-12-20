package auca.ac.rw.planningSync.controller;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import auca.ac.rw.planningSync.model.Event;
import auca.ac.rw.planningSync.service.EventService;

@RestController
@RequestMapping(value = "/api/event")
public class EventController {
    @Autowired
    private EventService eventService;

    @GetMapping(value = "/")
    public ResponseEntity<?> getPublicEvents() {
        List<Event> events = eventService.getPublicEvents();
        return new ResponseEntity<>(events, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getEvent(@PathVariable UUID id) {
        Event event = eventService.getEvent(id);
        return new ResponseEntity<>(event, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEvent(@PathVariable UUID id, @RequestBody Event eventInfo) {
        String message = eventService.updateEvent(id, eventInfo);
        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable UUID id) {
        String message = eventService.deleteEvent(id);
        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    @PostMapping(value = "/create/{userId}")
    public ResponseEntity<?> saveEvent(@PathVariable UUID userId, @RequestBody Event event) {
        String message = eventService.createEvent(userId, event);
        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    @PostMapping(value = "/{eventId}/join/{userId}")
    public ResponseEntity<?> addUserToEvent(
            @PathVariable UUID userId,
            @PathVariable UUID eventId) {
        String message = eventService.addUserToEvent(userId, eventId);
        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    @DeleteMapping(value = "/{eventId}/leave/{userId}")
    public ResponseEntity<?> removeUserFromEvent(
            @PathVariable UUID userId,
            @PathVariable UUID eventId) {
        String message = eventService.removeUserFromEvent(userId, eventId);
        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    @GetMapping(value = "/user/{userId}")
    public ResponseEntity<Set<Event>> getUserEvents(@PathVariable UUID userId) {
        Set<Event> events = eventService.getUserEvents(userId);
        return new ResponseEntity<>(events, HttpStatus.OK);
    }

    @GetMapping(value = "/count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getEventCount() {
        return new ResponseEntity<>(eventService.countEvents(), HttpStatus.OK);
    }
}
