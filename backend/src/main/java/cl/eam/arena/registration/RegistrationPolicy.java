package cl.eam.arena.registration;

import cl.eam.arena.game.Game;
import cl.eam.arena.team.Team;
import cl.eam.arena.tournament.Tournament;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public final class RegistrationPolicy {
  private RegistrationPolicy() {}

  public static String normalizeType(String type) {
    return type == null ? "individual" : type.trim().toLowerCase(Locale.ROOT);
  }

  public static void validate(String type, Tournament tournament, Game game, Long userId, Team team) {
    boolean soloGame = "1v1".equalsIgnoreCase(game.getModalidad().trim());
    if ("individual".equals(type)) {
      if (!soloGame) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Este juego requiere inscripción por equipo.");
      if (team != null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Una inscripción individual no puede incluir un equipo.");
      return;
    }
    if (!"equipo".equals(type)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El tipo debe ser individual o equipo.");
    if (soloGame) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Este juego requiere inscripción individual.");
    if (team == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecciona un equipo.");
    if (!team.isActivo()) throw new ResponseStatusException(HttpStatus.CONFLICT, "El equipo está inactivo.");
    if (!tournament.getJuegoId().equals(team.getJuegoId())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El equipo pertenece a otro juego.");
    if (team.getIntegrantes().size() < game.getMinIntegrantes()) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "El equipo todavía no cumple el mínimo de integrantes del juego.");
    }
    boolean belongsToTeam = team.getIntegrantes().stream().anyMatch(member -> userId.equals(member.getJugadorId()));
    if (!belongsToTeam) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Debes pertenecer al equipo para inscribirlo.");
  }
}
