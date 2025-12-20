package auca.ac.rw.planningSync.repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import auca.ac.rw.planningSync.model.Habit;
import auca.ac.rw.planningSync.model.HabitLog;

@Repository
public interface HabitLogRepository extends JpaRepository<HabitLog, UUID> {
    Page<HabitLog> findByHabit(Habit habit, Pageable pageable);

    Page<HabitLog> findByHabitUserUsername(String username, Pageable pageable);

    Optional<HabitLog> findByHabitIdAndDate(UUID habitId, LocalDate date);
}
