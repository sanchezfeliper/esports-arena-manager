package cl.eam.arena.registration;

import cl.eam.arena.game.Game;
import cl.eam.arena.game.GameRepository;
import cl.eam.arena.team.Team;
import cl.eam.arena.team.TeamRepository;
import cl.eam.arena.tournament.Tournament;
import cl.eam.arena.tournament.TournamentRepository;
import cl.eam.arena.tournament.TournamentStatus;
import cl.eam.arena.user.AppUser;
import cl.eam.arena.user.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController @RequestMapping("/api/v1/inscripciones")
public class RegistrationController {
  private final RegistrationRepository registrations;
  private final TournamentRepository tournaments;
  private final UserRepository users;
  private final TeamRepository teams;
  private final GameRepository games;

  public RegistrationController(RegistrationRepository registrations, TournamentRepository tournaments,
      UserRepository users, TeamRepository teams, GameRepository games) {
    this.registrations = registrations; this.tournaments = tournaments; this.users = users;
    this.teams = teams; this.games = games;
  }

  public record CreateRequest(@NotNull Long torneoId, String tipo, Long equipoId) {}
  public record RegistrationView(Long id, Long torneoId, Long usuarioId, Long equipoId, String tipo, java.time.Instant createdAt) {
    static RegistrationView of(TournamentRegistration registration) {
      return new RegistrationView(registration.getId(), registration.getTorneoId(), registration.getUsuarioId(),
          registration.getEquipoId(), registration.getTipo(), registration.getCreatedAt());
    }
  }

  @GetMapping @SecurityRequirement(name="bearerAuth")
  public List<RegistrationView> mine(Authentication auth) {
    AppUser user = user(auth);
    return registrations.findAllByUsuario_IdOrderByCreatedAtDesc(user.getId()).stream().map(RegistrationView::of).toList();
  }

  @PostMapping @ResponseStatus(HttpStatus.CREATED) @SecurityRequirement(name="bearerAuth") @Transactional
  public RegistrationView create(@Valid @RequestBody CreateRequest request, Authentication auth) {
    AppUser user = user(auth);
    Tournament tournament = tournaments.findByIdForUpdate(request.torneoId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Torneo no encontrado."));
    if (tournament.getEstado() != TournamentStatus.ABIERTO
        || tournament.getFechaCierreInscripcion().isBefore(LocalDate.now())) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "El periodo de inscripción está cerrado.");
    }
    if (registrations.existsByTorneo_IdAndUsuario_Id(tournament.getId(), user.getId())) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya tienes una inscripción en este torneo.");
    }
    String type = RegistrationPolicy.normalizeType(request.tipo());
    Team team = null;
    if (request.equipoId() != null) {
      team = teams.findById(request.equipoId())
          .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "El equipo seleccionado no existe."));
    }
    Game game = games.findById(tournament.getJuegoId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "El juego del torneo no existe."));
    RegistrationPolicy.validate(type, tournament, game, user.getId(), team);
    if (team != null && registrations.existsByTorneo_IdAndEquipoId(tournament.getId(), team.getId())) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Este equipo ya está inscrito en el torneo.");
    }
    if (registrations.countByTorneo_Id(tournament.getId()) >= tournament.getCupoMaximo()) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "El torneo alcanzó su cupo máximo.");
    }
    try {
      TournamentRegistration registration = registrations.saveAndFlush(new TournamentRegistration(tournament, user, team == null ? null : team.getId(), type));
      return RegistrationView.of(registration);
    } catch (DataIntegrityViolationException duplicate) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "El jugador o equipo ya está inscrito en este torneo.");
    }
  }

  private AppUser user(Authentication auth) {
    return users.findByEmailIgnoreCase(auth.getName())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
  }
}
