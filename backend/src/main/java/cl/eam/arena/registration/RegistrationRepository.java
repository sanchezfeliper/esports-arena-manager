package cl.eam.arena.registration;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
public interface RegistrationRepository extends JpaRepository<TournamentRegistration,Long> {
  long countByTorneo_Id(Long torneoId);
  boolean existsByTorneo_IdAndUsuario_Id(Long torneoId,Long usuarioId);
  boolean existsByTorneo_IdAndEquipoId(Long torneoId,Long equipoId);
  boolean existsByEquipoId(Long equipoId);
  boolean existsByTorneo_Id(Long torneoId);
  List<TournamentRegistration> findAllByUsuario_IdOrderByCreatedAtDesc(Long usuarioId);
}
