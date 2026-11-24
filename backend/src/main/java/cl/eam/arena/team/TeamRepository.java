package cl.eam.arena.team;
import org.springframework.data.jpa.repository.JpaRepository;
public interface TeamRepository extends JpaRepository<Team,Long> {
  boolean existsByNombreIgnoreCase(String nombre);
  boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Long id);
}
