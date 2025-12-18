package auca.ac.rw.planningSync.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import auca.ac.rw.planningSync.model.Habit;
import auca.ac.rw.planningSync.service.HabitService;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;



@RestController
@RequestMapping(value="/api/habits")
public class HabitController {
    
    @Autowired
    private HabitService habitService;

	

    @GetMapping(value="/{id}")
    public ResponseEntity<?> getMethodName(@PathVariable UUID id) {
        Habit habit = habitService.getHabit(id);
        return new ResponseEntity<>(habit, HttpStatus.OK);
    }
    
    @GetMapping(value="/allfrom/{username}")
    public ResponseEntity<?> getMethodName(@PathVariable String username) {
        List<Habit> habits = habitService.getHabitsFromUser(username);
        return new ResponseEntity<>(habits, HttpStatus.OK);
    }

    @PostMapping(value="/{username}")
	public ResponseEntity<?> addHabit(
		@PathVariable String username,
		@RequestBody Habit habit
		){
		String message = habitService.addHabit(username, habit);
		return new ResponseEntity<>(message, HttpStatus.OK);
	}

    @PutMapping("/{id}")
    public ResponseEntity<?> updateHabit(@PathVariable UUID id, @RequestBody Habit habitInfo) {
        String message = habitService.updateHabit(id, habitInfo);
		return new ResponseEntity<>(message, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteHabit(@PathVariable UUID id) {
        String message = habitService.deleteHabit(id);
		return new ResponseEntity<>(message, HttpStatus.OK);
    }

	


}
