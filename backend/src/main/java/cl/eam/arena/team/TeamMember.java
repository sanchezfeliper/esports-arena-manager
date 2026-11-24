package cl.eam.arena.team;

import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

@Embeddable
public class TeamMember {
  @NotNull @Positive private Long jugadorId;
  @NotBlank @Size(max=20) private String rol;
  protected TeamMember() {}
  public TeamMember(Long jugadorId, String rol) { this.jugadorId=jugadorId; this.rol=rol; }
  public Long getJugadorId(){return jugadorId;} public String getRol(){return rol;}
  public void setJugadorId(Long jugadorId){this.jugadorId=jugadorId;} public void setRol(String rol){this.rol=rol;}
}
