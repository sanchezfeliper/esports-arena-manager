package cl.eam.arena.config;

import cl.eam.arena.tournament.*;
import cl.eam.arena.game.*;
import cl.eam.arena.user.*;
import java.time.LocalDate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class SeedData {
  @Bean CommandLineRunner seed(UserRepository users, TournamentRepository tournaments, GameRepository games, PasswordEncoder encoder,
      @Value("${app.admin.email}") String adminEmail, @Value("${app.admin.password}") String adminPassword) {
    return args -> {
      if (!users.existsByEmailIgnoreCase(adminEmail)) users.save(new AppUser("Administración", adminEmail, encoder.encode(adminPassword), Role.ADMINISTRADOR));
      if (games.count() == 0) games.saveAll(java.util.List.of(
        new Game("League of Legends","MOBA","5v5",5,7,"#C89B3C"), new Game("Valorant","Shooter","5v5",5,7,"#FF4655"),
        new Game("Rocket League","Deportivo","3v3",3,5,"#F79B14"), new Game("Street Fighter VI","Pelea","1v1",1,1,"#E63946"),
        new Game("Dota 2","MOBA","5v5",5,7,"#9146FF"), new Game("Counter-Strike 2","Shooter","5v5",5,7,"#00A8E8")));
      if (tournaments.count() == 0) tournaments.saveAll(java.util.List.of(
        new Tournament("Copa Arena LoL 2026",1L,"Eliminación directa",8,LocalDate.of(2026,6,10),LocalDate.of(2026,6,8),TournamentStatus.FINALIZADO,"Torneo de cierre de temporada.","Mejor de tres desde semifinales."),
        new Tournament("Valorant Winter Clash",2L,"Eliminación directa",16,LocalDate.of(2026,9,4),LocalDate.of(2026,9,2),TournamentStatus.EN_CURSO,"Clash invernal de Valorant.","Mejor de tres mapas."),
        new Tournament("Rocket League Spring Cup",3L,"Fase de grupos + eliminatoria",12,LocalDate.of(2027,2,15),LocalDate.of(2027,2,10),TournamentStatus.ABIERTO,"Copa para equipos de Rocket League.","Fase de grupos y playoffs."),
        new Tournament("Street Fighter Showdown",4L,"Eliminación directa",32,LocalDate.of(2027,3,10),LocalDate.of(2027,3,5),TournamentStatus.ABIERTO,"Torneo individual de pelea.","Eliminación directa a mejor de tres."),
        new Tournament("Dota 2 Masters League",5L,"Round robin",8,LocalDate.of(2027,4,25),LocalDate.of(2027,4,20),TournamentStatus.ABIERTO,"Liga round-robin para equipos de Dota 2.","Todos contra todos y final."),
        new Tournament("CS2 Pro Series",6L,"Eliminación directa",16,LocalDate.of(2027,5,1),LocalDate.of(2027,4,28),TournamentStatus.ABIERTO,"Serie profesional de Counter-Strike 2.","Mapas elegidos por veto.")));
    };
  }
}
