package cl.eam.arena.team;

import cl.eam.arena.game.Game;
import java.util.HashSet;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public final class TeamPolicy {
  private TeamPolicy() {}

  public static void validate(Team team, Game game, Set<Long> playerIds) {
    if (team.getCapitanId() == null || !playerIds.contains(team.getCapitanId())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El capitán debe ser un jugador registrado.");
    }
    if (team.getIntegrantes() == null || team.getIntegrantes().isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Agrega al menos un integrante al equipo.");
    }
    Set<Long> memberIds = new HashSet<>();
    for (TeamMember member : team.getIntegrantes()) {
      if (member.getJugadorId() == null || !playerIds.contains(member.getJugadorId())) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Todos los integrantes deben ser jugadores registrados.");
      }
      if (!memberIds.add(member.getJugadorId())) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No se puede repetir un integrante en el equipo.");
      }
      if (member.getRol() == null || member.getRol().isBlank() || member.getRol().trim().length() > 20) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cada integrante debe tener un rol de hasta 20 caracteres.");
      }
    }
    if (!memberIds.contains(team.getCapitanId())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El capitán también debe estar en la lista de integrantes.");
    }
    if (memberIds.size() > game.getMaxIntegrantes()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El equipo supera el máximo de integrantes permitido para el juego.");
    }
  }
}
