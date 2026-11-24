package cl.eam.arena.game;
import java.util.List;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/v1/juegos")
public class GameController {
  private final GameRepository games;
  public GameController(GameRepository games){this.games=games;}
  @GetMapping public List<Game> list(){return games.findAll();}
}
