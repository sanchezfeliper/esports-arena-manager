package cl.eam.arena;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
        "app.jwt.secret=01234567890123456789012345678901",
        "app.admin.password=TestAdminPassword123",
        "spring.datasource.url=jdbc:h2:mem:arena-context-test;DB_CLOSE_DELAY=-1"
    })
class ArenaApplicationContextTest {
  @Test void applicationContextStartsWithRepositoriesConfigured() {}
}
