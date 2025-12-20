package auca.ac.rw.planningSync.controller;

import auca.ac.rw.planningSync.dto.SearchResultDTO;
import auca.ac.rw.planningSync.model.Event;
import auca.ac.rw.planningSync.model.Habit;
import auca.ac.rw.planningSync.repository.EventRepository;
import auca.ac.rw.planningSync.repository.HabitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/search")
@CrossOrigin(origins = "*")
public class SearchController {

    private final EventRepository eventRepository;
    private final HabitRepository habitRepository;

    @Autowired
    public SearchController(EventRepository eventRepository, HabitRepository habitRepository) {
        this.eventRepository = eventRepository;
        this.habitRepository = habitRepository;
    }

    @GetMapping
    public List<SearchResultDTO> search(@RequestParam("q") String query, Authentication authentication) {
        String username = authentication.getName();
        List<SearchResultDTO> results = new ArrayList<>();

        if (query == null || query.trim().isEmpty()) {
            return results;
        }

        String lowerQuery = query.toLowerCase();

        // 1. Search Events
        List<Event> events = eventRepository.findByTitleContainingIgnoreCaseAndParticipantsUsername(query, username);
        for (Event e : events) {
            results.add(new SearchResultDTO("EVENT", e.getTitle(), e.getDescription(), "/events"));
        }

        // 2. Search Habits
        List<Habit> habits = habitRepository.findByNameContainingIgnoreCaseAndUserUsername(query, username);
        for (Habit h : habits) {
            results.add(new SearchResultDTO("HABIT", h.getName(), h.getDescription(), "/habits"));
        }

        // 3. Search Pages
        List<SearchResultDTO> pages = Arrays.asList(
                new SearchResultDTO("PAGE", "Dashboard", "View your daily overview", "/"),
                new SearchResultDTO("PAGE", "Events", "Manage your events", "/events"),
                new SearchResultDTO("PAGE", "Habits", "Track your habits", "/habits"),
                new SearchResultDTO("PAGE", "Settings", "Configure your profile and security", "/settings"),
                new SearchResultDTO("SETTING", "Email", "Update your contact email address", "/settings"),
                new SearchResultDTO("SETTING", "Phone Number", "Update your contact phone number", "/settings"),
                new SearchResultDTO("SETTING", "Two-Factor Authentication", "Enable or disable 2FA security",
                        "/settings"));

        results.addAll(pages.stream()
                .filter(p -> p.getTitle().toLowerCase().contains(lowerQuery)
                        || p.getDescription().toLowerCase().contains(lowerQuery))
                .collect(Collectors.toList()));

        return results;
    }
}
