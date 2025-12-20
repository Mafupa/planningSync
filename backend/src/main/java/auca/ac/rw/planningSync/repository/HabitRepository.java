package auca.ac.rw.planningSync.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import auca.ac.rw.planningSync.model.Habit;

@Repository
public interface HabitRepository extends JpaRepository<Habit, UUID> {
    @Query("SELECT h FROM Habit h WHERE h.user.username = :username AND LOWER(h.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Habit> findByNameContainingIgnoreCaseAndUserUsername(@Param("name") String name,
            @Param("username") String username);
}
