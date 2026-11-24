package cl.eam.arena.user;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController @RequestMapping("/api/v1/usuarios")
public class UserController {
  private final UserRepository users;
  public UserController(UserRepository users){this.users=users;}
  public record UserSummary(Long id,String nombre,String email,Role role) { static UserSummary of(AppUser u){return new UserSummary(u.getId(),u.getNombre(),u.getEmail(),u.getRole());} }
  public record PlayerSummary(Long id,String nombre) { static PlayerSummary of(AppUser u){return new PlayerSummary(u.getId(),u.getNombre());} }
  public record RoleRequest(Role role) {}
  @GetMapping @SecurityRequirement(name="bearerAuth") public List<UserSummary> list(){return users.findAll().stream().map(UserSummary::of).toList();}
  @GetMapping("/jugadores") @SecurityRequirement(name="bearerAuth")
  public List<PlayerSummary> players(){return users.findAllByRoleOrderByNombreAsc(Role.JUGADOR).stream().map(PlayerSummary::of).toList();}
  @PatchMapping("/{id}/role") @SecurityRequirement(name="bearerAuth") public UserSummary updateRole(@PathVariable Long id,@RequestBody RoleRequest request){
    if(request.role()==null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Rol obligatorio.");
    AppUser user=users.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Usuario no encontrado."));
    user.setRole(request.role());return UserSummary.of(users.save(user));
  }
}
