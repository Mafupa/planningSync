package auca.ac.rw.planningSync.service;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import auca.ac.rw.planningSync.model.Habit;
import auca.ac.rw.planningSync.model.HabitLog;
import auca.ac.rw.planningSync.repository.HabitLogRepository;
import auca.ac.rw.planningSync.repository.HabitRepository;

@Service
public class HabitLogService {

    @Autowired
    private HabitRepository habitRepository;
    @Autowired
    private HabitLogRepository habitLogRepository;

    public Page<HabitLog> getHabitLogsByHabit(UUID habitId, int page,
     int size, String sortBy, String sortDir) {
        
        Habit habit = habitRepository.findById(habitId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Habit with ID " + habitId + " not found"
            ));

        Sort sort = sortDir.equalsIgnoreCase("desc") ?
                Sort.by(sortBy).descending() :
                Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        return habitLogRepository.findByHabit(habit, pageable);
    }

    public Page<HabitLog> getHabitLogsByUser(
        String username, int page, int size, String sortBy, String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ?
                Sort.by(sortBy).descending() :
                Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        return habitLogRepository.findByHabitUserUsername(username, pageable);
    }

    public String addHabitLog(UUID habitId, HabitLog habitLog){
        Habit habit = habitRepository.findById(habitId)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "No habit with this id found!"
        ));
        habitLog.setHabit(habit);
        habitLogRepository.save(habitLog);
        return "Log successfully saved!";
    }
    
}
