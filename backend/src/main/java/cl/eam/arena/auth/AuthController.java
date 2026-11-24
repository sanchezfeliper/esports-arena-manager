package cl.eam.arena.auth;

import cl.eam.arena.security.JwtService;
import cl.eam.arena.user.AppUser;
import cl.eam.arena.user.Role;
import cl.eam.arena.user.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.Map;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Locale;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
  private final UserRepository users; private final PasswordEncoder encoder; private final JwtService jwt; private final RefreshSessionRepository refreshSessions;
  public AuthController(UserRepository users, PasswordEncoder encoder, JwtService jwt, RefreshSessionRepository refreshSessions) { this.users=users; this.encoder=encoder; this.jwt=jwt; this.refreshSessions=refreshSessions; }
  public record RegisterRequest(@NotBlank @Size(min=2,max=80) String nombre, @Email @NotBlank String email,
                                @NotBlank @Size(min=10,max=72) String password) {}
  public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}
  public record UserView(Long id, String nombre, String email, String role) {
    static UserView of(AppUser u) { return new UserView(u.getId(), u.getNombre(), u.getEmail(), u.getRole().name()); }
  }
  public record AuthResponse(String token, String refreshToken, UserView user) {}

  @PostMapping("/register") @ResponseStatus(HttpStatus.CREATED)
  public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
    String email = normalizeEmail(request.email());
    if (users.existsByEmailIgnoreCase(email)) throw new ResponseStatusException(HttpStatus.CONFLICT, "El correo ya está registrado.");
    try {
      AppUser user = users.saveAndFlush(new AppUser(request.nombre(), email, encoder.encode(request.password()), Role.JUGADOR));
      return response(user);
    } catch (DataIntegrityViolationException duplicate) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "El correo ya está registrado.");
    }
  }
  @PostMapping("/login")
  public AuthResponse login(@Valid @RequestBody LoginRequest request) {
    AppUser user = users.findByEmailIgnoreCase(normalizeEmail(request.email())).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Correo o contraseña incorrectos."));
    if (!encoder.matches(request.password(), user.getPasswordHash())) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Correo o contraseña incorrectos.");
    return response(user);
  }
  @PostMapping("/refresh") @Transactional
  public AuthResponse refresh(@RequestBody Map<String,String> request) {
    try {
      String oldToken=request.getOrDefault("refreshToken","");
      jwt.parseRefresh(oldToken);
      RefreshSession current=refreshSessions.findByTokenHash(sha256(oldToken)).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED,"El refresh token ya fue utilizado o revocado."));
      if(current.getExpiresAt().isBefore(Instant.now())) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"La sesión expiró.");
      AppUser user=current.getUsuario();
      refreshSessions.delete(current);
      return response(user);
    } catch (ResponseStatusException error) { throw error; }
    catch (RuntimeException error) { throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"El refresh token no es válido o expiró."); }
  }
  @PostMapping("/logout") @ResponseStatus(HttpStatus.NO_CONTENT) @Transactional
  public void logout(@RequestBody Map<String,String> request) {
    String token=request.getOrDefault("refreshToken","");
    if(token.isBlank()) return;
    try { refreshSessions.findByTokenHash(sha256(token)).ifPresent(refreshSessions::delete); }
    catch (RuntimeException ignored) { /* Logout remains idempotent for expired or malformed refresh tokens. */ }
  }
  private AuthResponse response(AppUser user) {
    String refreshToken=jwt.issueRefresh(user);
    refreshSessions.save(new RefreshSession(sha256(refreshToken),user,Instant.now().plus(7,ChronoUnit.DAYS)));
    return new AuthResponse(jwt.issue(user),refreshToken,UserView.of(user));
  }
  private String sha256(String value) {
    try { byte[] digest=MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
      return java.util.HexFormat.of().formatHex(digest);
    } catch (NoSuchAlgorithmException error) { throw new IllegalStateException("SHA-256 no está disponible.",error); }
  }
  private String normalizeEmail(String email) { return email.trim().toLowerCase(Locale.ROOT); }
  @GetMapping("/me") @SecurityRequirement(name="bearerAuth")
  public UserView me(Authentication authentication) {
    AppUser user = users.findByEmailIgnoreCase(authentication.getName()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    return UserView.of(user);
  }
}
