package auca.ac.rw.planningSync.controller;

import java.time.LocalDate;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import auca.ac.rw.planningSync.model.HabitLog;
import auca.ac.rw.planningSync.service.HabitLogService;

@RestController
@RequestMapping(value = "/api/habitlog")
public class HabitLogController {

    @Autowired
    private HabitLogService habitLogService;

    @PostMapping(value = "/{habitId}")
    public ResponseEntity<?> addHabitLog(
            @PathVariable UUID habitId,
            @RequestBody HabitLog habitLog) {
        String message = habitLogService.addHabitLog(habitId, habitLog);
        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    @PostMapping("/toggle/{habitId}")
    public ResponseEntity<?> toggleHabitLog(
            @PathVariable UUID habitId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        LocalDate toggleDate = (date != null) ? date : LocalDate.now();
        String message = habitLogService.toggleHabitLog(habitId, toggleDate);
        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    @GetMapping("/by-habit/{habitId}")
    public ResponseEntity<?> getLogsByHabit(
            @PathVariable UUID habitId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "date") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Page<HabitLog> logs = habitLogService.getHabitLogsByHabit(habitId, page, size, sortBy, sortDir);
        return new ResponseEntity<>(logs, HttpStatus.OK);
    }

    @GetMapping("/by-user/{username}")
    public ResponseEntity<?> getLogsByUser(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "date") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Page<HabitLog> logs = habitLogService.getHabitLogsByUser(username, page, size, sortBy, sortDir);
        return new ResponseEntity<>(logs, HttpStatus.OK);
    }

    @GetMapping("/streak/{habitId}")
    public ResponseEntity<Integer> getStreak(@PathVariable UUID habitId) {
        int streak = habitLogService.calculateStreak(habitId);
        return new ResponseEntity<>(streak, HttpStatus.OK);
    }
}
