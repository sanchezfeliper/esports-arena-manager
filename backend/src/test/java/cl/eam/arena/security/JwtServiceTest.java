package cl.eam.arena.security;

import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import cl.eam.arena.user.AppUser;
import cl.eam.arena.user.Role;
import org.junit.jupiter.api.Test;

class JwtServiceTest {
  private final JwtService jwt = new JwtService("local-test-secret-32-bytes-minimum-000000000000", 120);

  @Test
  void issuesDistinctRefreshTokensForTheSameUserWithinOneSecond() {
    AppUser user = new AppUser("Test User", "test@example.com", "hash", Role.JUGADOR);

    String firstToken = jwt.issueRefresh(user);
    String secondToken = jwt.issueRefresh(user);

    String firstId = jwt.parseRefresh(firstToken).getId();
    String secondId = jwt.parseRefresh(secondToken).getId();

    assertNotNull(firstId);
    assertNotNull(secondId);
    assertNotEquals(firstId, secondId);
  }
}
