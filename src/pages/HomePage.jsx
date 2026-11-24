/* ==========================================================================
   pages/HomePage.jsx — Inicio. Torneos destacados, próximos cierres y video.

   ========================================================================== */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, normalizarEstadoTorneo } from '@services/api';
import { formatearFecha, diasRestantes } from '@domain/dates';
import TournamentCard from '@components/TournamentCard';
import EmptyState from '@components/EmptyState';

export default function HomePage() {
  const [torneos, setTorneos] = useState([]);
  const [juegos, setJuegos] = useState([]);
  const [errorApi, setErrorApi] = useState('');
  useEffect(() => {
    Promise.all([api.tournaments(), api.games()])
      .then(([data, catalog]) => {
        setTorneos(data.map(t => ({ ...t, estado: normalizarEstadoTorneo(t.estado), formato: t.modalidad })));
        setJuegos(catalog);
      })
      .catch(error => setErrorApi(error.message));
  }, []);
  const destacados = torneos.filter(t => t.estado === 'abierto' || t.estado === 'en curso');
  const proximosCierres = torneos.filter(t => t.estado === 'abierto').sort((a,b) => a.fechaCierreInscripcion.localeCompare(b.fechaCierreInscripcion));

  return (
    <div className="container py-4">
      {/* HERO */}
      <section className="hero" aria-labelledby="hero-titulo">
        <h1 className="hero__titulo" id="hero-titulo">eSports Arena Manager</h1>
        <p className="hero__texto">
          Consulta torneos disponibles, organiza equipos e inscribe a jugadores
          en competencias de videojuegos.
        </p>
        <div className="hero__acciones">
          <Link to="/torneos" className="btn btn-primary">Ver torneos disponibles</Link>
          <Link to="/inscripcion" className="btn btn-outline-secondary">Inscríbete ahora</Link>
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
          <figcaption className="texto-muted text-center" style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
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
            <p className="seccion__subtitulo">Torneos abiertos y en curso cargados desde la API.</p>
          </div>
          <Link to="/torneos" className="btn btn-outline-secondary btn-sm">Ver todos</Link>
        </div>

        {errorApi && <div className="alert alert-danger" role="alert">No se pudo conectar con el servidor: {errorApi}</div>}
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3" id="torneos-destacados" aria-live="polite">
          {destacados.length === 0 ? (
            <EmptyState
              icono="🏁"
              titulo="No hay torneos destacados"
              mensaje="Vuelve pronto para nuevas competencias."
            />
          ) : (
            destacados.map((t) => (
              <TournamentCard key={t.id} torneo={t} juego={juegos.find(game => game.id === t.juegoId)} />
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
              const juego = juegos.find(item => item.id === torneo.juegoId);
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
                    style={{ backgroundColor: juego?.color || '#9146FF' }}
                    aria-hidden="true"
                  >
                    {juego?.icono || '🎮'}
                  </span>
                  <div className="lista__contenido">
                    <p className="lista__nombre">
                      <Link to={`/torneos/${torneo.id}`}>{torneo.nombre}</Link>
                    </p>
                    <p className="lista__detalle">
                      {juego?.nombre || 'Juego no disponible'} · Cierre: {formatearFecha(torneo.fechaCierreInscripcion)}
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

    </div>
  );
}
