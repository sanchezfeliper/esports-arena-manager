package cl.eam.arena.security;

import cl.eam.arena.user.AppUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
  private final SecretKey key;
  private final long expirationMinutes;
  public JwtService(@Value("${app.jwt.secret}") String secret,
                    @Value("${app.jwt.expiration-minutes:120}") long expirationMinutes) {
    this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    this.expirationMinutes = expirationMinutes;
  }
  public String issue(AppUser user) {
    Instant now = Instant.now();
    return Jwts.builder().id(UUID.randomUUID().toString()).subject(user.getEmail()).claim("role", user.getRole().name()).claim("tokenType","access")
      .issuedAt(Date.from(now)).expiration(Date.from(now.plusSeconds(expirationMinutes * 60)))
      .signWith(key).compact();
  }
  public String issueRefresh(AppUser user) {
    Instant now=Instant.now();
    return Jwts.builder().id(UUID.randomUUID().toString()).subject(user.getEmail()).claim("tokenType","refresh")
      .issuedAt(Date.from(now)).expiration(Date.from(now.plusSeconds(7L*24*60*60))).signWith(key).compact();
  }
  public Claims parseAccess(String token) {
    Claims claims=parse(token);
    if(!"access".equals(claims.get("tokenType",String.class))) throw new IllegalArgumentException("Se requiere un access token.");
    return claims;
  }
  public Claims parseRefresh(String token) {
    Claims claims=parse(token);
    if(!"refresh".equals(claims.get("tokenType",String.class))) throw new IllegalArgumentException("Se requiere un refresh token.");
    return claims;
  }
  private Claims parse(String token) { return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload(); }
}
