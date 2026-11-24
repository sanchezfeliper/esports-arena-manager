package cl.eam.arena.auth;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
public interface RefreshSessionRepository extends JpaRepository<RefreshSession,Long> { Optional<RefreshSession> findByTokenHash(String tokenHash); }
