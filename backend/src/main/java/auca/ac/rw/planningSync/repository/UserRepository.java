package auca.ac.rw.planningSync.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import auca.ac.rw.planningSync.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Boolean existsByUsername(String username);

    Optional<User> findByUsername(String username);

    Optional<User> findByUserInfoEmail(String email);
}
