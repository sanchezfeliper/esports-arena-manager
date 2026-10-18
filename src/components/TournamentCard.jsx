/* ==========================================================================
   components/TournamentCard.jsx — Componente de tarjeta de torneo (vista destacada o lista) con información y acciones.
   ========================================================================== */

import { Link } from 'react-router-dom';
import { obtenerJuego } from '@data/mockData';
import { cuposDisponibles, estadoBadgeClase, estadoTorneoTexto } from '@domain/tournaments';
import { formatearFecha } from '@domain/dates';

/**
 * @param {object} torneo - Torneo object.
 * @param {'featured'|'list'} [variant] - Card layout variant.
 */
export default function TournamentCard({ torneo, variant = 'featured' }) {
  const juego = obtenerJuego(torneo.juegoId);
  if (!juego) return null;

  const cuposDisp = cuposDisponibles(torneo);
  const ocupados = torneo.inscritos.length;
  const estaLleno = cuposDisp === 0;
  const porcentaje = ((torneo.cupoMaximo - cuposDisp) / torneo.cupoMaximo) * 100;
  const badgeClase = estadoBadgeClase(torneo.estado);
  const inscribirDisabled = estaLleno || torneo.estado !== 'abierto';

  return (
    <article className="tarjeta tarjeta-torneo">
      <div className="tarjeta-torneo__juego">
        <span
          className="tarjeta-torneo__icono"
          style={{ backgroundColor: `${juego.color}22`, color: juego.color }}
          aria-hidden="true"
        >
          {juego.icono}
        </span>
        <div>
          <p className="tarjeta-torneo__nombre-juego">{juego.nombre}</p>
          <span className={`badge badge--${badgeClase}`}>
            {estadoTorneoTexto(torneo.estado)}
          </span>
        </div>
      </div>

      <h3 className="tarjeta-torneo__titulo">
        <Link to={`/torneos/${torneo.id}`}>{torneo.nombre}</Link>
      </h3>

      <div className="tarjeta-torneo__meta">
        <span className="tarjeta-torneo__meta-item">🕹️ {torneo.formato}</span>
        {variant === 'featured' && (
          <>
            <span className="tarjeta-torneo__meta-item">👥 {ocupados}/{torneo.cupoMaximo}</span>
            <span className="tarjeta-torneo__meta-item">📅 {formatearFecha(torneo.fechaInicio)}</span>
          </>
        )}
        {variant === 'list' && (
          <span className="tarjeta-torneo__meta-item">🎯 {torneo.modalidad}</span>
        )}
      </div>

      <div className="tarjeta-torneo__cupos">
        <div className="flex justify-between" style={{ fontSize: '0.82rem', marginBottom: '0.3rem' }}>
          <span className="texto-muted">
            {variant === 'featured'
              ? `Cupos: ${cuposDisp} disponibles`
              : `Cupos: ${ocupados}/${torneo.cupoMaximo}`}
          </span>
          <span className={estaLleno ? 'texto-error' : 'texto-acierto'}>
            {variant === 'featured'
              ? `${Math.round(porcentaje)}% ocupado`
              : `${cuposDisp} libres`}
          </span>
        </div>
        <div className={`progreso ${estaLleno ? 'progreso--lleno' : ''}`}>
          <div className="progreso__barra" style={{ width: `${porcentaje}%` }}></div>
        </div>
        {variant === 'list' && (
          <p className="texto-muted" style={{ fontSize: '0.82rem', marginTop: '0.4rem' }}>
            <span aria-hidden="true">📅</span> Cierre inscripción: {formatearFecha(torneo.fechaCierreInscripcion)}
          </p>
        )}
      </div>

      <div className="tarjeta-torneo__acciones">
        <Link
          to={`/torneos/${torneo.id}`}
          className="boton boton-secundario boton--sm boton--bloque"
        >
          Ver detalle
        </Link>
        <Link
          to={`/inscripcion/${torneo.id}`}
          className={`boton boton-primario boton--sm boton--bloque ${inscribirDisabled ? 'boton--disabled' : ''}`}
          aria-disabled={inscribirDisabled ? 'true' : undefined}
        >
          Inscribirse
        </Link>
      </div>
    </article>
  );
}
