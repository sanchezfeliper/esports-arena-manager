/* ==========================================================================
   pages/TournamentDetailPage.jsx — Detalle de torneo.

   ========================================================================== */

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { obtenerTorneo, obtenerJuego, obtenerEquipo, obtenerJugador, PARTIDAS } from '@data/mockData';
import { cuposDisponibles, inscripcionFueraDePlazo, ordenarRanking, estadoTorneoTexto } from '@domain/tournaments';
import { formatearFecha, formatearFechaHora } from '@domain/dates';
import Breadcrumb from '@components/Breadcrumb';
import StatusBadge from '@components/StatusBadge';
import EmptyState from '@components/EmptyState';

export default function TournamentDetailPage() {
  const { id } = useParams();
  const torneo = obtenerTorneo(id);
  const [rondaActiva, setRondaActiva] = useState(null);

  if (!torneo) {
    return (
      <div className="container py-4">
        <div className="estado-vacio">
          <div className="estado-vacio__icono" aria-hidden="true">❓</div>
          <p className="estado-vacio__titulo">Torneo no encontrado</p>
          <p>El identificador no corresponde a un torneo disponible.</p>
          <Link to="/torneos" className="btn btn-primary mt-3">Ver listado de torneos</Link>
        </div>
      </div>
    );
  }

  const juego = obtenerJuego(torneo.juegoId);
  const cuposDisp = cuposDisponibles(torneo);
  const ocupados = torneo.inscritos.length;
  const porcentaje = (ocupados / torneo.cupoMaximo) * 100;
  const estaLleno = cuposDisp === 0;
  const partidas = PARTIDAS.filter(p => p.torneoId === torneo.id);
  const rondas = [...new Set(partidas.map(p => p.ronda))];
  const rondaVisible = rondas.includes(rondaActiva) ? rondaActiva : (rondas[0] || null);

  // Render inscritos
  const inscritos = torneo.inscritos.map((equipoId) => {
    const equipo = obtenerEquipo(equipoId);
    if (!equipo) return null;
    const eqJuego = obtenerJuego(equipo.juegoId);
    return (
      <div key={equipo.id} className="lista__item">
        <span
          className="lista__avatar"
          style={{ backgroundColor: eqJuego.color }}
          aria-hidden="true"
        >
          {torneo.inscritos.indexOf(equipoId) + 1}
        </span>
        <div className="lista__contenido">
          <p className="lista__nombre">
            {equipo.nombre}
            {!equipo.activo && (
              <span className="badge-estado badge-estado--cancelado ms-1">Inactivo</span>
            )}
          </p>
          <p className="lista__detalle">
            {equipo.integrantes.length} integrante(s) · Capitán: {obtenerJugador(equipo.capitanId)?.apodo || 'N/A'}
          </p>
        </div>
        <Link to="/equipos" className="btn btn-outline-secondary btn-sm">Ver equipos</Link>
      </div>
    );
  });

  // Render llaves de la ronda activa
  const partidasRonda = partidas.filter(p => p.ronda === rondaVisible);

  // Render ranking
  const ranking = ordenarRanking(torneo.ranking || []);

  // Render premios (solo si finalizado)
  const mostrarPremios = torneo.estado === 'finalizado';

  // Acción de inscripción
  let accionHtml;
  if (torneo.estado !== 'abierto') {
    if (torneo.estado === 'en curso') {
      accionHtml = (
        <span className="texto-adv">⚠ Las inscripciones están cerradas porque el torneo ya está en curso.</span>
      );
    } else if (torneo.estado === 'finalizado') {
      accionHtml = (
        <span className="texto-muted">🏁 Torneo finalizado. Revisa los resultados y premios.</span>
      );
    }
  } else {
    const fueraPlazo = inscripcionFueraDePlazo(torneo);
    if (fueraPlazo) {
      accionHtml = (
        <span className="texto-adv">⚠ El plazo de inscripción ya cerró.</span>
      );
    } else if (cuposDisp === 0) {
      accionHtml = (
        <span className="texto-error">● Cupo máximo alcanzado.</span>
      );
    } else {
      accionHtml = (
        <>
          <span>Quedan {cuposDisp} cupo(s) disponible(s).</span>
          <Link
            to={`/inscripcion/${torneo.id}`}
            className="btn btn-primary"
            id="btn-inscribir"
          >
            Inscribirse
          </Link>
        </>
      );
    }
  }

  return (
    <div className="container py-4">
      <Breadcrumb items={[
        { label: 'Inicio', to: '/' },
        { label: 'Torneos', to: '/torneos' },
        { label: torneo.nombre }
      ]} />

      {/* Cabecera del torneo */}
      <section className="seccion" aria-labelledby="torneo-titulo">
        <div
          className="card"
          style={{
            background: `radial-gradient(circle at 15% 30%, ${juego.color}22, transparent 60%), var(--color-superficie)`
          }}
        >
          <div className="d-flex align-items-center gap-3" style={{ flexWrap: 'wrap' }}>
            <span
              className="tarjeta-torneo__icono"
              style={{
                backgroundColor: `${juego.color}33`,
                color: juego.color,
                width: '56px',
                height: '56px',
                fontSize: '1.8rem'
              }}
              aria-hidden="true"
            >
              {juego.icono}
            </span>
            <div>
              <StatusBadge estado={torneo.estado} />
              <h1 className="seccion__titulo mt-2" id="torneo-titulo" style={{ fontSize: '1.75rem' }}>
                {torneo.nombre}
              </h1>
              <p className="texto-muted">
                {juego.nombre} · {torneo.formato} · {torneo.modalidad}
              </p>
            </div>
          </div>
          <p className="mt-3">{torneo.descripcion}</p>
        </div>
      </section>

      {/* Grid detalle: contenido + resumen */}
      <div className="row g-3">
        {/* Columna principal */}
        <div className="col-lg-8">
          {/* Resumen del torneo */}
          <section className="card mb-3" aria-labelledby="resumen-titulo">
            <h2 className="resumen__titulo" id="resumen-titulo">
              <span aria-hidden="true">📋</span> Resumen del torneo
            </h2>
            <div className="resumen__lista">
              <div className="resumen__item"><span className="resumen__clave">Juego</span><span className="resumen__valor">{juego.nombre}</span></div>
              <div className="resumen__item"><span className="resumen__clave">Modalidad</span><span className="resumen__valor">{torneo.modalidad}</span></div>
              <div className="resumen__item"><span className="resumen__clave">Formato</span><span className="resumen__valor">{torneo.formato}</span></div>
              <div className="resumen__item"><span className="resumen__clave">Fecha de inicio</span><span className="resumen__valor">{formatearFecha(torneo.fechaInicio)}</span></div>
              <div className="resumen__item"><span className="resumen__clave">Cierre de inscripción</span><span className="resumen__valor">{formatearFecha(torneo.fechaCierreInscripcion)}</span></div>
              <div className="resumen__item"><span className="resumen__clave">Cupos ocupados</span><span className="resumen__valor">{ocupados} / {torneo.cupoMaximo}</span></div>
              <div className="resumen__item"><span className="resumen__clave">Cupos disponibles</span><span className="resumen__valor {estaLleno ? 'texto-error' : 'texto-acierto'}">{cuposDisp}</span></div>
              <div className="mt-3">
                <div className={`progreso ${estaLleno ? 'progreso--lleno' : ''}`}>
                  <div className="progreso__barra" style={{ width: `${porcentaje}%` }}></div>
                </div>
              </div>
              <div className="mt-3">
                <p className="texto-muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Reglas</p>
                <p style={{ fontSize: '0.88rem' }}>{torneo.reglas}</p>
              </div>
            </div>
          </section>

          {/* Participantes inscritos */}
          <section className="seccion" aria-labelledby="inscritos-titulo">
            <h2 className="seccion__titulo" id="inscritos-titulo">
              <span className="seccion__titulo-icono" aria-hidden="true">🎟️</span>
              Participantes inscritos ({torneo.inscritos.length})
            </h2>
            <div className="lista" aria-live="polite">
              {torneo.inscritos.length === 0 ? (
                <EmptyState
                  icono="🎟️"
                  titulo="Aún no hay inscritos"
                  mensaje="Los participantes aparecerán aquí a medida que se inscriban."
                />
              ) : inscritos}
            </div>
          </section>

          {/* Selector de ronda */}
          {rondas.length > 0 && (
            <section className="seccion" aria-labelledby="ronda-titulo">
              <h2 className="seccion__titulo" id="ronda-titulo">
                <span className="seccion__titulo-icono" aria-hidden="true">🗓️</span>
                Partidas por ronda
              </h2>
              <div
                className="d-flex gap-2"
                role="tablist"
                aria-label="Rondas del torneo"
                style={{ flexWrap: 'wrap' }}
              >
                {rondas.map((ronda, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`btn btn-sm ${ronda === rondaVisible ? 'btn btn-primary' : 'btn btn-outline-secondary'}`}
                    role="tab"
                    aria-selected={ronda === rondaVisible}
                    id={`tab-ronda-${i}`}
                    onClick={() => setRondaActiva(ronda)}
                  >
                    {ronda}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Llaves de partidas */}
          <section className="seccion" aria-labelledby="llaves-titulo">
            <h2 className="seccion__titulo" id="llaves-titulo">
              <span className="seccion__titulo-icono" aria-hidden="true">🎮</span>
              {rondas.length > 0 ? `Llave - ${rondaVisible || ''}` : 'Partidas'}
            </h2>
            <div className="llave" aria-live="polite">
              {partidasRonda.length === 0 ? (
                <EmptyState
                  icono="🗓️"
                  titulo="Sin partidas programadas"
                  mensaje="Las partidas de este torneo aparecerán cuando sean generadas por el organizador."
                />
              ) : (
                partidasRonda.map(partida => (
                  <PartidaItem key={partida.id} partida={partida} />
                ))
              )}
            </div>
          </section>
        </div>

        {/* Columna lateral */}
        <aside className="d-flex flex-column gap-3 col-lg-4">
          {/* Acción de inscripción */}
          <section className="card" aria-label="Acción de inscripción">
            <div className="resumen__lista">
              {accionHtml}
            </div>
          </section>

          {/* Premios (solo si finalizado) */}
          {mostrarPremios && (
            <section className="card" id="card-premios" aria-labelledby="premios-titulo">
              <h2 className="resumen__titulo" id="premios-titulo">
                <span aria-hidden="true">🏆</span> Premios
              </h2>
              <div className="resumen__lista" id="lista-premios">
                {torneo.premios.map((premio) => (
                  <div key={premio.posicion} className="lista__item">
                    <span style={{ fontSize: '1.8rem' }} aria-hidden="true">{premio.icono}</span>
                    <div className="lista__contenido">
                      <p className="lista__nombre">{premio.posicion}° lugar</p>
                      <p className="lista__detalle">{premio.descripcion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>

      {/* Tabla de posiciones */}
      <section className="seccion" aria-labelledby="ranking-titulo">
        <h2 className="seccion__titulo" id="ranking-titulo">
          <span className="seccion__titulo-icono" aria-hidden="true">📊</span>
          Tabla de posiciones
        </h2>
        <div className="table-responsive">
          <table className="table" aria-label="Ranking del torneo">
            <caption className="sr-only">Ranking del torneo {torneo.nombre}</caption>
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Equipo</th>
                <th scope="col">Victorias</th>
                <th scope="col">Derrotas</th>
                <th scope="col">Diferencia</th>
                <th scope="col">Puntos</th>
              </tr>
            </thead>
            <tbody id="ranking-cuerpo">
              {ranking.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <EmptyState
                      icono="📊"
                      titulo="Tabla sin datos"
                      mensaje="El ranking se actualiza con los resultados validados."
                    />
                  </td>
                </tr>
              ) : (
                ranking.map((fila, idx) => {
                  const equipo = obtenerEquipo(fila.equipoId);
                  const pos = idx + 1;
                  let clasePos = '';
                  if (pos === 1) clasePos = 'table__pos--oro';
                  else if (pos === 2) clasePos = 'table__pos--plata';
                  else if (pos === 3) clasePos = 'table__pos--bronce';

                  return (
                    <tr key={fila.equipoId}>
                      <td className={`table__pos ${clasePos}`}>{pos}°</td>
                      <td>{equipo ? equipo.nombre : 'Equipo eliminado'}</td>
                      <td>{fila.victorias}</td>
                      <td>{fila.derrotas}</td>
                      <td>{fila.diferenciaPuntaje > 0 ? '+' : ''}{fila.diferenciaPuntaje}</td>
                      <td style={{ fontWeight: 700, color: 'var(--color-acento)' }}>{fila.puntos}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/** Partida individual del bracket */
function PartidaItem({ partida }) {
  const equipoA = obtenerEquipo(partida.equipoAId);
  const equipoB = obtenerEquipo(partida.equipoBId);

  const badgeEstadoClase =
    partida.estado === 'validada' ? 'abierto' :
    partida.estado === 'programada' ? 'encurso' :
    'finalizado';

  let bloqueA = 'llave__partida-bloque--pendiente';
  let bloqueB = 'llave__partida-bloque--pendiente';
  if (partida.ganadorId === partida.equipoAId) bloqueA = 'llave__partida-bloque--ganador';
  else if (partida.ganadorId === partida.equipoBId) bloqueB = 'llave__partida-bloque--ganador';
  if (partida.ganadorId && partida.ganadorId !== partida.equipoAId) bloqueA = 'llave__partida-bloque--perdedor';
  if (partida.ganadorId && partida.ganadorId !== partida.equipoBId) bloqueB = 'llave__partida-bloque--perdedor';

  let estadoTexto;
  if (partida.estado === 'validada') {
    const ganador = obtenerEquipo(partida.ganadorId);
    estadoTexto = `✓ Resultado validado · Ganador: ${ganador ? ganador.nombre : 'N/A'}`;
  } else if (partida.estado === 'programada') {
    estadoTexto = '⏱ Partida programada · pendiente de jugar';
  } else {
    estadoTexto = 'Cancelada';
  }

  return (
    <div className="llave__partida">
      <div className="d-flex justify-content-between align-items-center mb-2" style={{ fontSize: '0.82rem' }}>
        <span className="texto-muted">
          <span aria-hidden="true">🕐</span> {formatearFechaHora(partida.fecha)}
        </span>
        <span className={`badge-estado badge-estado--${badgeEstadoClase}`}>{estadoTorneoTexto(partida.estado)}</span>
      </div>
      <div className={bloqueA}>
        <span>{equipoA ? equipoA.nombre : 'Por definir'}</span>
        <span style={{ fontWeight: 700 }}>{partida.puntajeA !== null ? partida.puntajeA : '-'}</span>
      </div>
      <div className={bloqueB}>
        <span>{equipoB ? equipoB.nombre : 'Participante por definir'}</span>
        <span style={{ fontWeight: 700 }}>{partida.puntajeB !== null ? partida.puntajeB : '-'}</span>
      </div>
      <div className="llave__partida-estado">{estadoTexto}</div>
    </div>
  );
}
