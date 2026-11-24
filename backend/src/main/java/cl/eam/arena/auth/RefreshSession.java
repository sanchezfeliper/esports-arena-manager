package cl.eam.arena.auth;

import cl.eam.arena.user.AppUser;
import jakarta.persistence.*;
import java.time.Instant;

@Entity @Table(name="refresh_sessions")
public class RefreshSession {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
  @Column(nullable=false,unique=true,length=64) private String tokenHash;
  @ManyToOne(optional=false,fetch=FetchType.EAGER) @JoinColumn(name="usuario_id") private AppUser usuario;
  @Column(nullable=false) private Instant expiresAt;
  protected RefreshSession() {}
  public RefreshSession(String tokenHash,AppUser usuario,Instant expiresAt){this.tokenHash=tokenHash;this.usuario=usuario;this.expiresAt=expiresAt;}
  public Long getId(){return id;} public String getTokenHash(){return tokenHash;} public AppUser getUsuario(){return usuario;} public Instant getExpiresAt(){return expiresAt;}
}
