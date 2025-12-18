package auca.ac.rw.planningSync.service;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import auca.ac.rw.planningSync.model.Event;
import auca.ac.rw.planningSync.model.User;
import auca.ac.rw.planningSync.repository.EventRepository;
import auca.ac.rw.planningSync.repository.UserRepository;

@Service
public class EventService {
    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    public String createEvent(UUID userId, Event event){
        User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "No user with this ID found"
        ));
        event.getParticipants().add(user);
        user.getEvents().add(event);

        eventRepository.save(event);
        return "Event "+event.getTitle()+" saved successfully!";
    }

    public Event getEvent(UUID eventId) {
        return eventRepository.findById(eventId)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Event with ID " + eventId + " not found"
        ));
    }

    public List<Event> getPublicEvents(){
        return eventRepository.findByPublicEventTrue();
    }

    public String updateEvent(UUID eventId, Event eventInfo) {
        Event event = eventRepository.findById(eventId)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Event with ID " + eventId + " not found"
        ));

        event.setTitle(eventInfo.getTitle());
        event.setDescription(eventInfo.getDescription());
        event.setDateTime(eventInfo.getDateTime());
        event.setPublicEvent(eventInfo.getPublicEvent());

        eventRepository.save(event);
        return "Event " + event.getTitle() + " updated successfully!";
    }

    public String deleteEvent(UUID eventId) {
        Event event = eventRepository.findById(eventId)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Event with ID " + eventId + " not found"
        ));

        eventRepository.delete(event);
        return "Event " + event.getTitle() + " deleted successfully!";
    }


    public String addUserToEvent(UUID userId, UUID eventId) {
        User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "User with ID " + userId + " not found"));

        Event event = eventRepository.findById(eventId)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Event with ID " + eventId + " not found"));

        if (event.getParticipants().contains(user)) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "User '" + user.getUsername() + "' is already attending event '" + event.getTitle() + "'"
            );
        }

        event.getParticipants().add(user);
        user.getEvents().add(event);

        eventRepository.save(event);
        userRepository.save(user);

        return "User '" + user.getUsername() + "' added to event '" + event.getTitle() + "'";
    }

    public String removeUserFromEvent(UUID userId, UUID eventId) {
        User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND, "User with ID " + userId + " not found"
        ));

        Event event = eventRepository.findById(eventId)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND, "Event with ID " + eventId + " not found"
        ));

        if (!event.getParticipants().contains(user)) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "User '" + user.getUsername() + "' is not attending event '" + event.getTitle() + "'"
            );
        }

        event.getParticipants().remove(user);
        user.getEvents().remove(event);

        eventRepository.save(event);
        userRepository.save(user);

        return "User '" + user.getUsername() + "' removed from event '" + event.getTitle() + "'";
    }

    public Set<Event> getUserEvents(UUID userId) {
        User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND, "User with ID " + userId + " not found"
        ));
        return user.getEvents();
    }

    
}
