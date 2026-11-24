package cl.eam.arena.tournament;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;

@Entity
@Table(name = "torneos")
public class Tournament {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @JsonProperty(access=JsonProperty.Access.READ_ONLY) private Long id;
  @NotBlank @Size(min = 3, max = 100) @Column(nullable = false, length = 100) private String nombre;
  @NotNull @Column(nullable = false) private Long juegoId;
  @NotBlank @Column(nullable = false, length = 60) private String modalidad;
  @NotNull @Min(1) @Max(512) @Column(nullable = false) private Integer cupoMaximo;
  @NotNull @Column(nullable = false) private LocalDate fechaInicio;
  @NotNull @Column(nullable = false) private LocalDate fechaCierreInscripcion;
  @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private TournamentStatus estado = TournamentStatus.ABIERTO;
  @Column(length = 2000) private String descripcion;
  @Column(length = 4000) private String reglas;

  protected Tournament() {}
  public Tournament(String nombre, Long juegoId, String modalidad, Integer cupoMaximo, LocalDate fechaInicio,
                    LocalDate fechaCierreInscripcion, TournamentStatus estado, String descripcion, String reglas) {
    this.nombre=nombre; this.juegoId=juegoId; this.modalidad=modalidad; this.cupoMaximo=cupoMaximo;
    this.fechaInicio=fechaInicio; this.fechaCierreInscripcion=fechaCierreInscripcion;
    this.estado=estado; this.descripcion=descripcion; this.reglas=reglas;
  }
  public Long getId(){return id;} public String getNombre(){return nombre;} public Long getJuegoId(){return juegoId;}
  public String getModalidad(){return modalidad;} public Integer getCupoMaximo(){return cupoMaximo;}
  public LocalDate getFechaInicio(){return fechaInicio;} public LocalDate getFechaCierreInscripcion(){return fechaCierreInscripcion;}
  public TournamentStatus getEstado(){return estado;} public String getDescripcion(){return descripcion;} public String getReglas(){return reglas;}
  public void setNombre(String v){this.nombre=v;} public void setJuegoId(Long v){this.juegoId=v;}
  public void setModalidad(String v){this.modalidad=v;} public void setCupoMaximo(Integer v){this.cupoMaximo=v;}
  public void setFechaInicio(LocalDate v){this.fechaInicio=v;} public void setFechaCierreInscripcion(LocalDate v){this.fechaCierreInscripcion=v;}
  public void setEstado(TournamentStatus v){this.estado=v;} public void setDescripcion(String v){this.descripcion=v;} public void setReglas(String v){this.reglas=v;}
  public void updateFrom(Tournament data){this.nombre=data.nombre;this.juegoId=data.juegoId;this.modalidad=data.modalidad;
    this.cupoMaximo=data.cupoMaximo;this.fechaInicio=data.fechaInicio;this.fechaCierreInscripcion=data.fechaCierreInscripcion;
    this.estado=data.estado;this.descripcion=data.descripcion;this.reglas=data.reglas;}
}
