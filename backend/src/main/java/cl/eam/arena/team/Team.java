package cl.eam.arena.team;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.ArrayList;
import java.util.List;

@Entity @Table(name="equipos")
public class Team {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @JsonProperty(access=JsonProperty.Access.READ_ONLY) private Long id;
  @NotBlank @Size(min=3,max=30) @Column(nullable=false,unique=true,length=30) private String nombre;
  @NotNull @Column(nullable=false) private Long juegoId;
  @NotNull @Column(nullable=false) private Long capitanId;
  @Column(nullable=false) private boolean activo=true;
  @ElementCollection(fetch=FetchType.EAGER) @CollectionTable(name="equipo_integrantes",joinColumns=@JoinColumn(name="equipo_id"))
  private List<TeamMember> integrantes=new ArrayList<>();
  protected Team() {}
  public Team(String nombre,Long juegoId,Long capitanId,boolean activo,List<TeamMember> integrantes){this.nombre=nombre;this.juegoId=juegoId;this.capitanId=capitanId;this.activo=activo;this.integrantes=integrantes==null?new ArrayList<>():integrantes;}
  public Long getId(){return id;} public String getNombre(){return nombre;} public Long getJuegoId(){return juegoId;}
  public Long getCapitanId(){return capitanId;} public boolean isActivo(){return activo;} public List<TeamMember> getIntegrantes(){return integrantes;}
  public void setNombre(String v){this.nombre=v;} public void setJuegoId(Long v){this.juegoId=v;}
  public void setCapitanId(Long v){this.capitanId=v;} public void setActivo(boolean v){this.activo=v;} public void setIntegrantes(List<TeamMember> v){this.integrantes=v;}
  public void updateFrom(Team t){nombre=t.nombre;juegoId=t.juegoId;capitanId=t.capitanId;activo=t.activo;integrantes=t.integrantes;}
}
