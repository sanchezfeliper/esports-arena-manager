/* ==========================================================================
   pages/HomePage.jsx — Inicio. Torneos destacados, próximos cierres y video.

   ========================================================================== */

import { Link } from 'react-router-dom';
import { obtenerTorneosDestacados, obtenerTorneosAbiertosPorCierre } from '@domain/tournaments';
import { obtenerJuego } from '@data/mockData';
import { formatearFecha, diasRestantes } from '@domain/dates';
import TournamentCard from '@components/TournamentCard';
import EmptyState from '@components/EmptyState';

export default function HomePage() {
  const destacados = obtenerTorneosDestacados();
  const proximosCierres = obtenerTorneosAbiertosPorCierre();

  return (
    <div className="contenedor">
      {/* HERO */}
      <section className="hero" aria-labelledby="hero-titulo">
        <h1 className="hero__titulo" id="hero-titulo">eSports Arena Manager</h1>
        <p className="hero__texto">
          Organiza y compite en torneos de videojuegos competitivos. Gestiona juegos,
          jugadores, equipos, inscripciones, partidas, resultados, rankings y premios
          en una sola plataforma.
        </p>
        <div className="hero__acciones">
          <Link to="/torneos" className="boton boton-primario">Ver torneos disponibles</Link>
          <Link to="/inscripcion" className="boton boton-secundario">Inscríbete ahora</Link>
        </div>
      </section>

      {/* Imagen ilustrativa */}
      <section className="seccion" aria-labelledby="ilus-titulo">
        <h2 className="sr-only" id="ilus-titulo">Ilustración de la arena de torneos</h2>
        <figure>
          <img
            src="/img/hero.svg"
            alt="Ilustración de una arena de torneos eSports con un trofeo dorado central sobre una tarima y dos banderas de equipos a los lados"
            width="800"
            height="450"
            style={{ width: '100%', borderRadius: 'var(--radio-borde)', border: '1px solid var(--color-borde)' }}
          />
          <figcaption className="texto-muted texto-centrado" style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
            Arena competitiva: los torneos disponibles aparecen en la sección de abajo.
          </figcaption>
        </figure>
      </section>

      {/* Torneos destacados */}
      <section className="seccion" aria-labelledby="destacados-titulo">
        <div className="seccion__encabezado">
          <div>
            <h2 className="seccion__titulo" id="destacados-titulo">
              <span className="seccion__titulo-icono" aria-hidden="true">🏆</span>
              Torneos destacados
            </h2>
            <p className="seccion__subtitulo">Torneos abiertos y en curso generados desde datos simulados.</p>
          </div>
          <Link to="/torneos" className="boton boton-secundario boton--sm">Ver todos</Link>
        </div>

        <div className="grid grid--tarjetas" id="torneos-destacados" aria-live="polite">
          {destacados.length === 0 ? (
            <EmptyState
              icono="🏁"
              titulo="No hay torneos destacados"
              mensaje="Vuelve pronto para nuevas competencias."
            />
          ) : (
            destacados.map((t) => (
              <TournamentCard key={t.id} torneo={t} />
            ))
          )}
        </div>
      </section>

      {/* Próximos cierres de inscripción */}
      <section className="seccion" aria-labelledby="cierres-titulo">
        <div className="seccion__encabezado">
          <h2 className="seccion__titulo" id="cierres-titulo">
            <span className="seccion__titulo-icono" aria-hidden="true">⏰</span>
            Próximos cierres de inscripción
          </h2>
        </div>

        <div className="lista" id="proximos-cierres" aria-live="polite">
          {proximosCierres.length === 0 ? (
            <EmptyState
              icono="🗓️"
              titulo="No hay inscripciones abiertas"
              mensaje="No hay cierres próximos porque todos los torneos están en curso o finalizados."
            />
          ) : (
            proximosCierres.map((torneo) => {
              const juego = obtenerJuego(torneo.juegoId);
              const dias = diasRestantes(torneo.fechaCierreInscripcion);
              let textoDias;
              let clase = 'texto-acierto';
              if (dias < 0) { textoDias = 'Cierre vencido'; clase = 'texto-error'; }
              else if (dias === 0) { textoDias = 'Cierra hoy'; clase = 'texto-error'; }
              else if (dias === 1) { textoDias = 'Cierra mañana'; clase = 'texto-adv'; }
              else { textoDias = `Cierra en ${dias} días`; clase = dias <= 5 ? 'texto-adv' : 'texto-acierto'; }

              return (
                <div key={torneo.id} className="lista__item">
                  <span
                    className="lista__avatar"
                    style={{ backgroundColor: juego.color }}
                    aria-hidden="true"
                  >
                    {juego.icono}
                  </span>
                  <div className="lista__contenido">
                    <p className="lista__nombre">
                      <Link to={`/torneos/${torneo.id}`}>{torneo.nombre}</Link>
                    </p>
                    <p className="lista__detalle">
                      {juego.nombre} · Cierre: {formatearFecha(torneo.fechaCierreInscripcion)}
                    </p>
                  </div>
                  <span className={clase} style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                    {textoDias}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Video embebido */}
      <section className="seccion" aria-labelledby="video-titulo">
        <div className="seccion__encabezado">
          <h2 className="seccion__titulo" id="video-titulo">
            <span className="seccion__titulo-icono" aria-hidden="true">🎬</span>
            Final destacada
          </h2>
        </div>
        <p className="seccion__subtitulo mb-2">
          Revive una final reciente como presentación del formato de competencia.
        </p>
        <div className="video-contenedor">
          <iframe
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            title="Video de presentación de una final de torneo eSports"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        </div>
      </section>
    </div>
  );
}
