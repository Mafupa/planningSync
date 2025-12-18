package auca.ac.rw.planningSync.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import auca.ac.rw.planningSync.model.UserInfo;

@Repository
public interface UserInfoRepository  extends JpaRepository<UserInfo, UUID>{

    Optional<UserInfo> findByUserId(UUID userId);
}
