package cl.eam.arena.registration;

import cl.eam.arena.game.Game;
import cl.eam.arena.team.Team;
import cl.eam.arena.team.TeamMember;
import cl.eam.arena.tournament.Tournament;
import cl.eam.arena.tournament.TournamentStatus;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import static org.junit.jupiter.api.Assertions.*;

class RegistrationPolicyTest {
  private final Game teamGame = new Game("Rocket League", "Deportivo", "3v3", 3, 5, "#F79B14");
  private final Game soloGame = new Game("Street Fighter", "Pelea", "1v1", 1, 1, "#E63946");
  private final Tournament tournament = new Tournament("Copa", 1L, "Eliminación directa", 8,
      LocalDate.of(2027, 2, 15), LocalDate.of(2027, 2, 10), TournamentStatus.ABIERTO, "", "");

  @Test void acceptsIndividualRegistrationOnlyForOneVsOneGames() {
    assertDoesNotThrow(() -> RegistrationPolicy.validate("individual", tournament, soloGame, 1L, null));
    assertThrows(ResponseStatusException.class,
        () -> RegistrationPolicy.validate("individual", tournament, teamGame, 1L, null));
  }

  @Test void requiresAnActiveTeamForTheSameGameAndAPlayerMember() {
    Team team = team(true, 1L, List.of(new TeamMember(1L, "Capitán"),
        new TeamMember(2L, "Atacante"), new TeamMember(3L, "Defensor")));
    assertDoesNotThrow(() -> RegistrationPolicy.validate("equipo", tournament, teamGame, 1L, team));
    assertThrows(ResponseStatusException.class,
        () -> RegistrationPolicy.validate("equipo", tournament, teamGame, 1L, team(false, 1L, team.getIntegrantes())));
    assertThrows(ResponseStatusException.class,
        () -> RegistrationPolicy.validate("equipo", tournament, teamGame, 1L, team(true, 2L, team.getIntegrantes())));
    assertThrows(ResponseStatusException.class,
        () -> RegistrationPolicy.validate("equipo", tournament, teamGame, 1L, team(true, 1L,
            List.of(new TeamMember(2L, "Capitán"), new TeamMember(3L, "Atacante"), new TeamMember(4L, "Defensor")))));
  }

  @Test void requiresTheGameMinimumRosterSize() {
    Team small = team(true, 1L, List.of(new TeamMember(1L, "Capitán"), new TeamMember(2L, "Atacante")));
    assertThrows(ResponseStatusException.class,
        () -> RegistrationPolicy.validate("equipo", tournament, teamGame, 1L, small));
  }

  private static Team team(boolean active, Long gameId, List<TeamMember> members) {
    return new Team("Equipo", gameId, 1L, active, members);
  }
}
