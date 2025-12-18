package auca.ac.rw.planningSync.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import auca.ac.rw.planningSync.model.Location;

@Repository
public interface LocationRepository  extends JpaRepository<Location, UUID>{
    Boolean existsByName(String name);

    Optional<Location> findByName(String name);
}