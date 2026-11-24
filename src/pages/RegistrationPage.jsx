import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { api, normalizarEstadoTorneo } from '@services/api';
import { useRoles } from '@services/useRoles';
import { cuposDisponibles, inscripcionFueraDePlazo } from '@domain/tournaments';
import Breadcrumb from '@components/Breadcrumb';
import EmptyState from '@components/EmptyState';
import { useToast } from '@components/useToast';

export default function RegistrationPage() {
  const { id: routeId } = useParams();
  const [searchParams] = useSearchParams();
  const initialTournamentId = routeId || searchParams.get('id') || '';
  const { usuario } = useRoles();
  const { showToast } = useToast();
  const [torneos, setTorneos] = useState([]);
  const [juegos, setJuegos] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [inscripciones, setInscripciones] = useState([]);
  const [torneoId, setTorneoId] = useState(initialTournamentId);
  const [tipo, setTipo] = useState('');
  const [equipoId, setEquipoId] = useState('');
  const [aceptaReglas, setAceptaReglas] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [confirmacion, setConfirmacion] = useState(null);

  useEffect(() => {
    let active = true;
    Promise.all([api.tournaments(), api.games(), api.teams(), api.myRegistrations()])
      .then(([tournamentData, gameData, teamData, registrationData]) => {
        if (!active) return;
        setTorneos(tournamentData.map(item => ({ ...item, estado: normalizarEstadoTorneo(item.estado) })));
        setJuegos(gameData);
        setEquipos(teamData);
        setInscripciones(registrationData);
      })
      .catch(cause => { if (active) setError(cause.message); })
      .finally(() => { if (active) setCargando(false); });
    return () => { active = false; };
  }, []);

  const torneo = torneos.find(item => item.id === Number(torneoId)) || null;
  const juego = juegos.find(item => item.id === torneo?.juegoId) || null;
  const solo = juego?.modalidad?.toLowerCase() === '1v1';
  const tipoSeleccionado = tipo || (solo ? 'individual' : 'equipo');
  const equiposDisponibles = useMemo(() => equipos.filter(team =>
    team.activo && team.juegoId === torneo?.juegoId && team.integrantes.some(member => member.jugadorId === usuario?.id)
  ), [equipos, torneo, usuario]);
  const equipo = equiposDisponibles.find(item => item.id === Number(equipoId)) || null;
  const yaInscrito = Boolean(torneo && inscripciones.some(item => item.torneoId === torneo.id));
  const cupos = torneo ? cuposDisponibles(torneo) : 0;
  const abierto = torneo?.estado === 'abierto' && !inscripcionFueraDePlazo(torneo) && cupos > 0;

  const submit = async event => {
    event.preventDefault();
    if (!torneo || !abierto || yaInscrito || !aceptaReglas || (tipoSeleccionado === 'equipo' && !equipo)) {
      showToast('Revisa el torneo, el equipo y la aceptación de las reglas.', 'error');
      return;
    }
    if (tipoSeleccionado === 'equipo' && equipo.integrantes.length < juego.minIntegrantes) {
      showToast(`El equipo requiere al menos ${juego.minIntegrantes} integrantes.`, 'error');
      return;
    }
    setEnviando(true);
    try {
      const saved = await api.registerTournament({ torneoId: torneo.id, tipo: tipoSeleccionado, equipoId: tipoSeleccionado === 'equipo' ? equipo.id : null });
      setInscripciones(current => [saved, ...current]);
      setConfirmacion(saved);
      showToast('Inscripción registrada en el servidor.', 'exito');
    } catch (cause) {
      showToast(cause.message, 'error');
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) return <div className="container py-4" role="status">Cargando torneos y equipos…</div>;

  return <div className="container py-4">
    <Breadcrumb items={[{ label: 'Inicio', to: '/' }, { label: 'Torneos', to: '/torneos' }, { label: 'Inscripción' }]} />
    <section className="seccion" aria-labelledby="titulo-inscripcion">
      <h1 className="seccion__titulo" id="titulo-inscripcion">Inscripción a torneo</h1>
      <p className="seccion__subtitulo">La inscripción se registra con tu cuenta y se valida en el servidor.</p>
      {error && <div className="alert alert-danger" role="alert">No se pudo cargar la información: {error}</div>}
      {confirmacion && <div className="alert alert-success" role="status">Inscripción confirmada para {torneo?.nombre || `torneo #${confirmacion.torneoId}`} el {new Date(confirmacion.createdAt).toLocaleString('es-CL')}.</div>}
      {!error && torneos.filter(item => item.estado === 'abierto').length === 0 && <EmptyState icono="🏁" titulo="No hay torneos abiertos" mensaje="Vuelve a revisar cuando se publiquen nuevas competencias." />}
      {torneos.some(item => item.estado === 'abierto') && <form className="card p-3 p-md-4 d-flex flex-column gap-3" onSubmit={submit}>
        <div><label className="form-label" htmlFor="registration-tournament">Torneo</label><select id="registration-tournament" className="form-select" required value={torneoId} onChange={event => { setTorneoId(event.target.value); setTipo(''); setEquipoId(''); setAceptaReglas(false); setConfirmacion(null); }}><option value="">Selecciona un torneo abierto</option>{torneos.filter(item => item.estado === 'abierto').map(item => <option key={item.id} value={item.id}>{item.nombre} · {formatearCupos(item)}</option>)}</select></div>
        {torneo && <>
          <div className="alert alert-light border mb-0"><strong>{juego?.nombre || 'Juego no disponible'}</strong> · {juego?.modalidad || 'Modalidad desconocida'} · cierre {torneo.fechaCierreInscripcion} · {cupos} cupos disponibles</div>
          {yaInscrito && <div className="alert alert-info" role="status">Tu cuenta ya tiene una inscripción en este torneo.</div>}
          {!abierto && <div className="alert alert-warning" role="status">Este torneo ya no acepta inscripciones.</div>}
          <fieldset className="border-0 p-0 m-0"><legend className="form-label">Tipo de participante</legend>
            <label className="form-check form-check-inline"><input className="form-check-input" type="radio" name="registration-type" value="individual" checked={tipoSeleccionado === 'individual'} disabled={!solo} onChange={() => setTipo('individual')} /><span className="form-check-label">Individual</span></label>
            <label className="form-check form-check-inline"><input className="form-check-input" type="radio" name="registration-type" value="equipo" checked={tipoSeleccionado === 'equipo'} disabled={solo} onChange={() => setTipo('equipo')} /><span className="form-check-label">Equipo</span></label>
          </fieldset>
          {tipoSeleccionado === 'equipo' && <div><label className="form-label" htmlFor="registration-team">Equipo</label><select id="registration-team" className="form-select" required value={equipoId} onChange={event => setEquipoId(event.target.value)}><option value="">Selecciona un equipo donde eres integrante</option>{equiposDisponibles.map(item => <option key={item.id} value={item.id}>{item.nombre} · {item.integrantes.length}/{juego?.maxIntegrantes || '—'}</option>)}</select>{equiposDisponibles.length === 0 && <div className="form-text">No tienes equipos activos para este juego. Pide a un organizador que registre tu equipo.</div>}{equipo && equipo.integrantes.length < juego?.minIntegrantes && <div className="form-text text-danger">El juego exige al menos {juego.minIntegrantes} integrantes.</div>}</div>}
          {torneo.reglas && <div><h2 className="h6">Reglas del torneo</h2><p>{torneo.reglas}</p></div>}
          <label className="form-check"><input className="form-check-input" type="checkbox" checked={aceptaReglas} onChange={event => setAceptaReglas(event.target.checked)} /><span className="form-check-label">Acepto las reglas y condiciones de participación.</span></label>
          <button className="btn btn-primary" disabled={enviando || !abierto || yaInscrito || !aceptaReglas || (tipoSeleccionado === 'equipo' && (!equipo || equipo.integrantes.length < (juego?.minIntegrantes || 1)))}>{enviando ? 'Registrando…' : 'Confirmar inscripción'}</button>
        </>}
      </form>}
    </section>
  </div>;
}

function formatearCupos(torneo) {
  return `${Number(torneo.inscritosCount) || 0}/${torneo.cupoMaximo} inscritos`;
}
