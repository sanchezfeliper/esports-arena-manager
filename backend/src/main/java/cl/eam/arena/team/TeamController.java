package cl.eam.arena.team;

import cl.eam.arena.game.Game;
import cl.eam.arena.game.GameRepository;
import cl.eam.arena.registration.RegistrationRepository;
import cl.eam.arena.user.Role;
import cl.eam.arena.user.UserRepository;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController @RequestMapping("/api/v1/equipos")
public class TeamController {
  private final TeamRepository teams;
  private final GameRepository games;
  private final UserRepository users;
  private final RegistrationRepository registrations;

  public TeamController(TeamRepository teams, GameRepository games, UserRepository users, RegistrationRepository registrations) {
    this.teams = teams; this.games = games; this.users = users; this.registrations = registrations;
  }

  @GetMapping public List<Team> list() { return teams.findAll(); }
  @GetMapping("/{id}") public Team get(@PathVariable Long id) { return find(id); }

  @PostMapping @ResponseStatus(HttpStatus.CREATED) @SecurityRequirement(name="bearerAuth")
  public Team create(@Valid @RequestBody Team team) {
    Game game = game(team.getJuegoId());
    String nombre = normalizedName(team.getNombre());
    if (teams.existsByNombreIgnoreCase(nombre)) throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un equipo con ese nombre.");
    team.setNombre(nombre);
    TeamPolicy.validate(team, game, registeredPlayerIds());
    try {
      return teams.saveAndFlush(team);
    } catch (DataIntegrityViolationException duplicate) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un equipo con ese nombre.");
    }
  }

  @PutMapping("/{id}") @SecurityRequirement(name="bearerAuth")
  public Team update(@PathVariable Long id, @Valid @RequestBody Team body) {
    Team current = find(id);
    Game game = game(body.getJuegoId());
    if (registrations.existsByEquipoId(id) && !current.getJuegoId().equals(body.getJuegoId())) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "No se puede cambiar el juego de un equipo con inscripciones.");
    }
    String nombre = normalizedName(body.getNombre());
    if (teams.existsByNombreIgnoreCaseAndIdNot(nombre, id)) throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un equipo con ese nombre.");
    body.setNombre(nombre);
    current.updateFrom(body);
    TeamPolicy.validate(current, game, registeredPlayerIds());
    try {
      return teams.saveAndFlush(current);
    } catch (DataIntegrityViolationException duplicate) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un equipo con ese nombre.");
    }
  }

  @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) @SecurityRequirement(name="bearerAuth")
  public void delete(@PathVariable Long id) {
    Team team = find(id);
    if (registrations.existsByEquipoId(id)) throw new ResponseStatusException(HttpStatus.CONFLICT, "No se puede eliminar un equipo inscrito en un torneo.");
    teams.delete(team);
  }

  private Set<Long> registeredPlayerIds() {
    return users.findAllByRoleOrderByNombreAsc(Role.JUGADOR).stream().map(user -> user.getId()).collect(Collectors.toSet());
  }
  private Game game(Long id) {
    if (id == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecciona un juego.");
    return games.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "El juego seleccionado no existe."));
  }
  private String normalizedName(String name) {
    if (name == null || name.trim().length() < 3 || name.trim().length() > 30) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El nombre debe tener entre 3 y 30 caracteres.");
    return name.trim();
  }
  private Team find(Long id) { return teams.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Equipo no encontrado.")); }
}
