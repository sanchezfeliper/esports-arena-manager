package cl.eam.arena.tournament;

import cl.eam.arena.game.GameRepository;
import cl.eam.arena.registration.RegistrationRepository;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/v1/torneos")
public class TournamentController {
  private final TournamentRepository tournaments;
  private final GameRepository games;
  private final RegistrationRepository registrations;
  public TournamentController(TournamentRepository tournaments, GameRepository games, RegistrationRepository registrations) { this.tournaments=tournaments; this.games=games; this.registrations=registrations; }
  public record TournamentView(Long id,String nombre,Long juegoId,String modalidad,Integer cupoMaximo,java.time.LocalDate fechaInicio,
    java.time.LocalDate fechaCierreInscripcion,TournamentStatus estado,String descripcion,String reglas,long inscritosCount) {
    static TournamentView of(Tournament t,long inscritos){return new TournamentView(t.getId(),t.getNombre(),t.getJuegoId(),t.getModalidad(),t.getCupoMaximo(),t.getFechaInicio(),t.getFechaCierreInscripcion(),t.getEstado(),t.getDescripcion(),t.getReglas(),inscritos);}
  }
  @GetMapping public List<TournamentView> list() { return tournaments.findAllByOrderByFechaInicioAsc().stream().map(t->TournamentView.of(t,registrations.countByTorneo_Id(t.getId()))).toList(); }
  @GetMapping("/{id}") public TournamentView get(@PathVariable Long id) { Tournament t=find(id); return TournamentView.of(t,registrations.countByTorneo_Id(t.getId())); }
  @PostMapping @ResponseStatus(HttpStatus.CREATED) @SecurityRequirement(name="bearerAuth") public TournamentView create(@Valid @RequestBody Tournament body) {
    validateDates(body); Tournament t=tournaments.save(body); return TournamentView.of(t,0);
  }
  @PutMapping("/{id}") @SecurityRequirement(name="bearerAuth") @Transactional public TournamentView update(@PathVariable Long id, @Valid @RequestBody Tournament body) {
    Tournament current=tournaments.findByIdForUpdate(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Torneo no encontrado.")); validateDates(body);
    long inscritos = registrations.countByTorneo_Id(id);
    if (body.getCupoMaximo() < inscritos) throw new ResponseStatusException(HttpStatus.CONFLICT, "El cupo no puede ser menor que las inscripciones existentes.");
    if (inscritos > 0 && !current.getJuegoId().equals(body.getJuegoId())) throw new ResponseStatusException(HttpStatus.CONFLICT, "No se puede cambiar el juego de un torneo con inscripciones.");
    current.updateFrom(body); Tournament saved=tournaments.save(current); return TournamentView.of(saved,inscritos);
  }
  @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) @SecurityRequirement(name="bearerAuth") @Transactional public void delete(@PathVariable Long id) {
    Tournament tournament = tournaments.findByIdForUpdate(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Torneo no encontrado."));
    if (registrations.existsByTorneo_Id(id)) throw new ResponseStatusException(HttpStatus.CONFLICT, "No se puede eliminar un torneo con inscripciones; cámbialo a cancelado.");
    tournaments.delete(tournament);
  }
  private Tournament find(Long id) { return tournaments.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Torneo no encontrado.")); }
  private void validateDates(Tournament t) {
    if (t.getFechaCierreInscripcion().isAfter(t.getFechaInicio())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El cierre de inscripción no puede ser posterior al inicio.");
    if (!games.existsById(t.getJuegoId())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"El juego seleccionado no existe.");
  }
}
