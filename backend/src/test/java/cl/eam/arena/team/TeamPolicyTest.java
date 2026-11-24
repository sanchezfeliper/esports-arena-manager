package cl.eam.arena.team;

import cl.eam.arena.game.Game;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import static org.junit.jupiter.api.Assertions.*;

class TeamPolicyTest {
  private final Game game = new Game("Rocket League", "Deportivo", "3v3", 3, 5, "#F79B14");

  @Test void acceptsDraftTeamWithCaptainAsAPlayerMember() {
    Team team = team(List.of(new TeamMember(1L, "Capitán"), new TeamMember(2L, "Atacante")));
    assertDoesNotThrow(() -> TeamPolicy.validate(team, game, Set.of(1L, 2L)));
  }

  @Test void rejectsUnknownOrDuplicateMembersAndCaptainOutsideTheRoster() {
    assertThrows(ResponseStatusException.class, () -> TeamPolicy.validate(
        team(List.of(new TeamMember(1L, "Capitán"), new TeamMember(9L, "Atacante"))), game, Set.of(1L)));
    assertThrows(ResponseStatusException.class, () -> TeamPolicy.validate(
        team(List.of(new TeamMember(1L, "Capitán"), new TeamMember(1L, "Atacante"))), game, Set.of(1L)));
    assertThrows(ResponseStatusException.class, () -> TeamPolicy.validate(
        team(List.of(new TeamMember(2L, "Atacante"))), game, Set.of(1L, 2L)));
  }

  @Test void rejectsRosterLargerThanTheGamesMaximum() {
    List<TeamMember> members = List.of(new TeamMember(1L, "Capitán"), new TeamMember(2L, "A"),
        new TeamMember(3L, "B"), new TeamMember(4L, "C"), new TeamMember(5L, "D"), new TeamMember(6L, "E"));
    assertThrows(ResponseStatusException.class, () -> TeamPolicy.validate(team(members), game, Set.of(1L, 2L, 3L, 4L, 5L, 6L)));
  }

  private static Team team(List<TeamMember> members) { return new Team("Equipo", 3L, 1L, true, members); }
}
