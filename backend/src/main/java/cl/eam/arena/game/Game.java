package cl.eam.arena.game;

import jakarta.persistence.*;

@Entity @Table(name="juegos")
public class Game {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
  @Column(nullable=false,unique=true,length=80) private String nombre;
  @Column(nullable=false,length=40) private String categoria;
  @Column(nullable=false,length=20) private String modalidad;
  @Column(nullable=false) private int minIntegrantes;
  @Column(nullable=false) private int maxIntegrantes;
  @Column(length=12) private String color;
  protected Game() {}
  public Game(String nombre,String categoria,String modalidad,int minIntegrantes,int maxIntegrantes,String color){this.nombre=nombre;this.categoria=categoria;this.modalidad=modalidad;this.minIntegrantes=minIntegrantes;this.maxIntegrantes=maxIntegrantes;this.color=color;}
  public Long getId(){return id;} public String getNombre(){return nombre;} public String getCategoria(){return categoria;}
  public String getModalidad(){return modalidad;} public int getMinIntegrantes(){return minIntegrantes;} public int getMaxIntegrantes(){return maxIntegrantes;} public String getColor(){return color;}
}
