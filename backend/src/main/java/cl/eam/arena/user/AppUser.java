package cl.eam.arena.user;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.Locale;

@Entity
@Table(name = "usuarios", uniqueConstraints = @UniqueConstraint(columnNames = "email"))
public class AppUser {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  @Column(nullable = false, length = 80) private String nombre;
  @Column(nullable = false, length = 160) private String email;
  @Column(nullable = false) private String passwordHash;
  @Enumerated(EnumType.STRING) @Column(nullable = false, length = 24) private Role role;
  @Column(nullable = false) private Instant createdAt = Instant.now();

  protected AppUser() {}
  public AppUser(String nombre, String email, String passwordHash, Role role) {
    this.nombre = nombre.trim(); this.email = email.trim().toLowerCase(Locale.ROOT); this.passwordHash = passwordHash; this.role = role;
  }
  public Long getId() { return id; }
  public String getNombre() { return nombre; }
  public String getEmail() { return email; }
  public String getPasswordHash() { return passwordHash; }
  public Role getRole() { return role; }
  public Instant getCreatedAt() { return createdAt; }
  public void setRole(Role role) { this.role = role; }
  public void setNombre(String nombre) { this.nombre = nombre; }
}
