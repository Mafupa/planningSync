package auca.ac.rw.planningSync.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import auca.ac.rw.planningSync.model.Habit;

@Repository
public interface HabitRepository extends JpaRepository<Habit, UUID>{
    
}
