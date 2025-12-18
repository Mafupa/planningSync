package auca.ac.rw.planningSync.controller;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import auca.ac.rw.planningSync.model.HabitLog;
import auca.ac.rw.planningSync.service.HabitLogService;

@RestController
@RequestMapping(value="/api/habitlog")
public class HabitLogController {

    @Autowired
    private HabitLogService habitLogService;

    @PostMapping(value="/{habitId}")
    public ResponseEntity<?> addHabitLog(
            @PathVariable UUID habitId,
            @RequestBody HabitLog habitLog) {
        String message = habitLogService.addHabitLog(habitId, habitLog);
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
}
