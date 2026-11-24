package cl.eam.arena.registration;

import cl.eam.arena.tournament.Tournament;
import cl.eam.arena.user.AppUser;
import jakarta.persistence.*;
import java.time.Instant;

@Entity @Table(name="inscripciones", uniqueConstraints={
    @UniqueConstraint(columnNames={"torneo_id","usuario_id"}),
    @UniqueConstraint(columnNames={"torneo_id","equipo_id"})
})
public class TournamentRegistration {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
  @ManyToOne(optional=false,fetch=FetchType.EAGER) @JoinColumn(name="torneo_id") private Tournament torneo;
  @ManyToOne(optional=false,fetch=FetchType.EAGER) @JoinColumn(name="usuario_id") private AppUser usuario;
  @Column(name="equipo_id") private Long equipoId;
  @Column(nullable=false,length=16) private String tipo;
  @Column(nullable=false) private Instant createdAt=Instant.now();
  protected TournamentRegistration() {}
  public TournamentRegistration(Tournament torneo,AppUser usuario,Long equipoId,String tipo){this.torneo=torneo;this.usuario=usuario;this.equipoId=equipoId;this.tipo=tipo;}
  public Long getId(){return id;} public Long getTorneoId(){return torneo.getId();} public Long getUsuarioId(){return usuario.getId();}
  public Long getEquipoId(){return equipoId;} public String getTipo(){return tipo;} public Instant getCreatedAt(){return createdAt;}
}
