package auca.ac.rw.planningSync.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import auca.ac.rw.planningSync.model.Event;

@Repository
public interface EventRepository extends JpaRepository<Event, UUID> {
    @Query("SELECT e FROM Event e WHERE e.publicEvent = true")
    List<Event> findByPublicEventTrue();

    @Query("SELECT e FROM Event e JOIN e.participants p WHERE p.username = :username AND LOWER(e.title) LIKE LOWER(CONCAT('%', :title, '%'))")
    List<Event> findByTitleContainingIgnoreCaseAndParticipantsUsername(@Param("title") String title,
            @Param("username") String username);
}
