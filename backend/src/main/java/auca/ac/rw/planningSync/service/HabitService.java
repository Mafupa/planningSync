package auca.ac.rw.planningSync.service;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import auca.ac.rw.planningSync.model.Habit;
import auca.ac.rw.planningSync.model.User;
import auca.ac.rw.planningSync.repository.HabitRepository;
import auca.ac.rw.planningSync.repository.UserRepository;

@Service
public class HabitService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HabitRepository habitRepository;

    public String addHabit(String username, Habit habit){
        User user = userRepository.findByUsername(username)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Error: No user with this username!"
        ));

        habit.setUser(user);

        habitRepository.save(habit);
        return "Habbit "+habit.getName()+" saved successfully!";
    }

    public Habit getHabit(UUID id) {
        return habitRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Habit with ID " + id + " not found"
            ));
    }

    public List<Habit> getHabitsFromUser(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "User with username " + username + " not found"
            ));

        return user.getHabits();
    }

    public String updateHabit(UUID id, Habit habitInfo) {
        Habit habit = habitRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Habit with ID " + id + " not found"
            ));

        habit.setName(habitInfo.getName());
        habit.setDescription(habitInfo.getDescription());
        habit.setRecurrenceType(habitInfo.getRecurrenceType());
        habit.setDayOfWeek(habitInfo.getDayOfWeek());
        habit.setTimeOfDay(habit.getTimeOfDay());

        habitRepository.save(habit);

        return "Habit " + habit.getName() + " updated successfully!";
    }

    public String deleteHabit(UUID id) {
        Habit habit = habitRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Habit with ID " + id + " not found"
            ));

        habitRepository.delete(habit);
        return "Habit " + habit.getName() + " deleted successfully!";
    }
    
}
