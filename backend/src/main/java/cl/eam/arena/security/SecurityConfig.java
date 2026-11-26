package cl.eam.arena.security;

import java.util.List;
import jakarta.servlet.DispatcherType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {
  @Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
  @Bean SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtFilter) throws Exception {
    return http.csrf(csrf -> csrf.disable())
      .cors(Customizer.withDefaults())
      .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
      .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
      .authorizeHttpRequests(auth -> auth
        .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()
        .requestMatchers("/api/v1/auth/register", "/api/v1/auth/login", "/api/v1/auth/refresh", "/api/v1/auth/logout", "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html", "/h2-console/**").permitAll()
        .requestMatchers(HttpMethod.GET, "/api/v1/torneos/**", "/api/v1/juegos/**", "/api/v1/equipos/**").permitAll()
        .requestMatchers("/api/v1/auth/me").authenticated()
        .requestMatchers("/api/v1/inscripciones/**").hasAnyRole("JUGADOR", "ADMINISTRADOR")
        .requestMatchers("/api/v1/usuarios/jugadores").hasAnyRole("ORGANIZADOR", "ADMINISTRADOR")
        .requestMatchers("/api/v1/usuarios/**").hasRole("ADMINISTRADOR")
        .requestMatchers("/api/v1/torneos/**", "/api/v1/equipos/**").hasAnyRole("ORGANIZADOR", "ADMINISTRADOR")
              .requestMatchers("/api/auth/**", "/error", "/actuator/health")
              .permitAll()
        .anyRequest().authenticated())
      .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class).build();
  }
  @Bean CorsConfigurationSource corsConfigurationSource(@Value("${app.cors.allowed-origin}") String origin) {
    CorsConfiguration config = new CorsConfiguration(); config.setAllowedOrigins(List.of(origin));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("Authorization", "Content-Type")); config.setAllowCredentials(false);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource(); source.registerCorsConfiguration("/**", config); return source;
  }
}
