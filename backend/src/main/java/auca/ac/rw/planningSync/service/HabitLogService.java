package auca.ac.rw.planningSync.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
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
                        HttpStatus.NOT_FOUND, "Habit with ID " + habitId + " not found"));

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        return habitLogRepository.findByHabit(habit, pageable);
    }

    public Page<HabitLog> getHabitLogsByUser(
            String username, int page, int size, String sortBy, String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        return habitLogRepository.findByHabitUserUsername(username, pageable);
    }

    public String addHabitLog(UUID habitId, HabitLog habitLog) {
        Habit habit = habitRepository.findById(habitId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No habit with this id found!"));
        habitLog.setHabit(habit);
        habitLogRepository.save(habitLog);
        return "Log successfully saved!";
    }

    public String toggleHabitLog(UUID habitId, LocalDate date) {
        Habit habit = habitRepository.findById(habitId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Habit not found"));

        Optional<HabitLog> existingLog = habitLogRepository.findByHabitIdAndDate(habitId, date);

        if (existingLog.isPresent()) {
            HabitLog log = existingLog.get();
            log.setCompleted(!log.isCompleted());
            habitLogRepository.save(log);
            return "Log updated";
        } else {
            HabitLog newLog = new HabitLog(date, true, habit);
            habitLogRepository.save(newLog);
            return "Log created";
        }
    }

    public int calculateStreak(UUID habitId) {
        List<HabitLog> logs = habitLogRepository.findAllByHabitIdOrderByDateDesc(habitId);
        if (logs.isEmpty())
            return 0;

        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);

        int streak = 0;
        LocalDate expectedDate = null;

        // Check if any log is for today or yesterday to start the streak
        boolean hasActivityRecently = false;
        for (HabitLog log : logs) {
            if (log.isCompleted() && (log.getDate().equals(today) || log.getDate().equals(yesterday))) {
                hasActivityRecently = true;
                expectedDate = log.getDate();
                break;
            }
        }

        if (!hasActivityRecently)
            return 0;

        for (HabitLog log : logs) {
            if (!log.isCompleted()) {
                // If we find an uncompleted log for the expected date or earlier, stop
                if (log.getDate().equals(expectedDate))
                    break;
                continue;
            }

            if (expectedDate == null) {
                expectedDate = log.getDate();
                streak = 1;
            } else if (log.getDate().equals(expectedDate)) {
                streak++;
                expectedDate = expectedDate.minusDays(1);
            } else if (log.getDate().isBefore(expectedDate)) {
                // Gap found
                break;
            }
        }

        return streak;
    }

}
