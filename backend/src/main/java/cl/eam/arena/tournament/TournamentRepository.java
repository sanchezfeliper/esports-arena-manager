package cl.eam.arena.tournament;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.Optional;

public interface TournamentRepository extends JpaRepository<Tournament, Long> {
  List<Tournament> findAllByOrderByFechaInicioAsc();
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select t from Tournament t where t.id = :id")
  Optional<Tournament> findByIdForUpdate(@Param("id") Long id);
}
