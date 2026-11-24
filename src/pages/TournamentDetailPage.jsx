import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, normalizarEstadoTorneo } from '@services/api';
import { cuposDisponibles, estadoTorneoTexto, inscripcionFueraDePlazo } from '@domain/tournaments';
import { formatearFecha } from '@domain/dates';
import Breadcrumb from '@components/Breadcrumb';
import StatusBadge from '@components/StatusBadge';
import EmptyState from '@components/EmptyState';

export default function TournamentDetailPage() {
  const { id } = useParams();
  const [torneo, setTorneo] = useState(null);
  const [juego, setJuego] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([api.tournament(id), api.games()])
      .then(([data, games]) => {
        if (!active) return;
        setTorneo({ ...data, estado: normalizarEstadoTorneo(data.estado) });
        setJuego(games.find(item => item.id === data.juegoId) || null);
      })
      .catch(cause => { if (active) setError(cause.message); })
      .finally(() => { if (active) setCargando(false); });
    return () => { active = false; };
  }, [id]);

  if (cargando) return <div className="container py-4" role="status">Cargando torneo…</div>;
  if (error || !torneo) return <div className="container py-4">
    <Breadcrumb items={[{ label: 'Inicio', to: '/' }, { label: 'Torneos', to: '/torneos' }, { label: 'Detalle' }]} />
    <div className="alert alert-danger" role="alert">{error || 'Torneo no encontrado.'}</div>
    <Link to="/torneos" className="btn btn-outline-secondary">Volver al listado</Link>
  </div>;

  const ocupados = Number(torneo.inscritosCount) || 0;
  const libres = cuposDisponibles(torneo);
  const porcentaje = torneo.cupoMaximo ? Math.min(100, Math.round((ocupados / torneo.cupoMaximo) * 100)) : 0;
  const abierto = torneo.estado === 'abierto' && !inscripcionFueraDePlazo(torneo) && libres > 0;

  return <div className="container py-4">
    <Breadcrumb items={[{ label: 'Inicio', to: '/' }, { label: 'Torneos', to: '/torneos' }, { label: torneo.nombre }]} />
    <section className="seccion" aria-labelledby="torneo-titulo">
      <div className="card" style={{ background: `radial-gradient(circle at 15% 30%, ${juego?.color || '#9146FF'}22, transparent 60%), var(--color-superficie)` }}>
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <span className="tarjeta-torneo__icono" aria-hidden="true" style={{ backgroundColor: `${juego?.color || '#9146FF'}33`, color: juego?.color || '#9146FF' }}>{juego?.icono || '🎮'}</span>
          <div><StatusBadge estado={torneo.estado} /><h1 className="seccion__titulo mt-2" id="torneo-titulo">{torneo.nombre}</h1>
            <p className="texto-muted mb-0">{juego?.nombre || 'Juego no disponible'} · {juego?.modalidad || torneo.modalidad} · {torneo.modalidad}</p></div>
        </div>
        {torneo.descripcion && <p className="mt-3 mb-0">{torneo.descripcion}</p>}
      </div>
    </section>

    <div className="row g-3">
      <div className="col-lg-8">
        <section className="card" aria-labelledby="resumen-titulo">
          <h2 className="resumen__titulo" id="resumen-titulo">Resumen del torneo</h2>
          <div className="resumen__lista">
            <div className="resumen__item"><span className="resumen__clave">Estado</span><span className="resumen__valor">{estadoTorneoTexto(torneo.estado)}</span></div>
            <div className="resumen__item"><span className="resumen__clave">Juego</span><span className="resumen__valor">{juego?.nombre || 'No disponible'}</span></div>
            <div className="resumen__item"><span className="resumen__clave">Fecha de inicio</span><span className="resumen__valor">{formatearFecha(torneo.fechaInicio)}</span></div>
            <div className="resumen__item"><span className="resumen__clave">Cierre de inscripción</span><span className="resumen__valor">{formatearFecha(torneo.fechaCierreInscripcion)}</span></div>
            <div className="resumen__item"><span className="resumen__clave">Cupos</span><span className="resumen__valor">{ocupados} / {torneo.cupoMaximo} · {libres} disponibles</span></div>
            <div className="progreso"><div className="progreso__barra" role="progressbar" aria-label="Cupos ocupados" aria-valuenow={porcentaje} aria-valuemin="0" aria-valuemax="100" style={{ width: `${porcentaje}%` }} /></div>
          </div>
          {torneo.reglas && <div className="mt-3"><h3 className="h6">Reglas</h3><p className="mb-0">{torneo.reglas}</p></div>}
        </section>
        <section className="seccion mt-3" aria-labelledby="inscritos-titulo">
          <h2 className="seccion__titulo" id="inscritos-titulo">Participantes inscritos ({ocupados})</h2>
          {ocupados === 0 ? <EmptyState icono="🎟️" titulo="Aún no hay inscritos" mensaje="Las inscripciones confirmadas aparecerán aquí." /> : <p className="texto-muted">Hay {ocupados} inscripción(es) registrada(s) para este torneo.</p>}
        </section>
      </div>
      <aside className="col-lg-4">
        <section className="card" aria-label="Inscripción al torneo">
          {abierto ? <><p>Quedan {libres} cupo(s) disponibles.</p><Link to={`/inscripcion/${torneo.id}`} className="btn btn-primary">Inscribirse</Link></>
            : <p className="mb-0 texto-muted">{torneo.estado !== 'abierto' ? `Inscripciones ${estadoTorneoTexto(torneo.estado).toLowerCase()}.` : libres === 0 ? 'El torneo alcanzó su cupo máximo.' : 'El plazo de inscripción ya cerró.'}</p>}
        </section>
      </aside>
    </div>
  </div>;
}
