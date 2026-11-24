import { useEffect, useMemo, useState } from 'react';
import { api } from '@services/api';
import { buildTeamPayload } from '@domain/teamForm';
import Breadcrumb from '@components/Breadcrumb';
import EmptyState from '@components/EmptyState';
import { useToast } from '@components/useToast';

const EMPTY = { nombre: '', juegoId: '', capitanId: '', activo: true };

export default function TeamsPage() {
  const { showToast } = useToast();
  const [equipos, setEquipos] = useState([]);
  const [juegos, setJuegos] = useState([]);
  const [jugadores, setJugadores] = useState([]);
  const [seleccionadoId, setSeleccionadoId] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [nuevoIntegrante, setNuevoIntegrante] = useState({ jugadorId: '', rol: '' });
  const [cargando, setCargando] = useState(true);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState('');

  const equipoSeleccionado = useMemo(() => equipos.find(team => team.id === Number(seleccionadoId)) || null, [equipos, seleccionadoId]);
  const juegoSeleccionado = useMemo(() => juegos.find(game => game.id === equipoSeleccionado?.juegoId), [juegos, equipoSeleccionado]);
  const miembrosIds = useMemo(() => new Set((equipoSeleccionado?.integrantes || []).map(member => member.jugadorId)), [equipoSeleccionado]);
  const disponibles = useMemo(() => jugadores.filter(player => !miembrosIds.has(player.id)), [jugadores, miembrosIds]);

  useEffect(() => {
    let active = true;
    Promise.all([api.teams(), api.games(), api.players()])
      .then(([teams, games, players]) => {
        if (!active) return;
        setEquipos(teams);
        setJuegos(games);
        setJugadores(players);
      })
      .catch(cause => { if (active) setError(cause.message); })
      .finally(() => { if (active) setCargando(false); });
    return () => { active = false; };
  }, []);

  const saveExisting = async (updated, message) => {
    if (!equipoSeleccionado) return;
    setOcupado(true);
    try {
      const saved = await api.updateTeam(equipoSeleccionado.id, updated);
      setEquipos(current => current.map(team => team.id === saved.id ? saved : team));
      showToast(message, 'exito');
    } catch (cause) {
      showToast(cause.message, 'error');
    } finally {
      setOcupado(false);
    }
  };

  const createTeam = async event => {
    event.preventDefault();
    if (!form.nombre.trim() || !form.juegoId || !form.capitanId) {
      showToast('Completa el nombre, juego y capitán del equipo.', 'error');
      return;
    }
    setOcupado(true);
    try {
      const saved = await api.createTeam(buildTeamPayload(form));
      setEquipos(current => [...current, saved]);
      setSeleccionadoId(String(saved.id));
      setForm(EMPTY);
      showToast(`Equipo “${saved.nombre}” creado en el servidor.`, 'exito');
    } catch (cause) {
      showToast(cause.message, 'error');
    } finally {
      setOcupado(false);
    }
  };

  const addMember = event => {
    event.preventDefault();
    const playerId = Number(nuevoIntegrante.jugadorId);
    const role = nuevoIntegrante.rol.trim();
    if (!equipoSeleccionado || !playerId || role.length < 2 || role.length > 20) {
      showToast('Selecciona un jugador y asigna un rol de 2 a 20 caracteres.', 'error');
      return;
    }
    const members = [...equipoSeleccionado.integrantes, { jugadorId: playerId, rol: role }];
    saveExisting({ ...equipoSeleccionado, integrantes: members }, 'Integrante agregado al equipo.');
    setNuevoIntegrante({ jugadorId: '', rol: '' });
  };

  const removeMember = playerId => {
    if (playerId === equipoSeleccionado?.capitanId) {
      showToast('El capitán no se puede quitar del equipo.', 'error');
      return;
    }
    saveExisting({ ...equipoSeleccionado, integrantes: equipoSeleccionado.integrantes.filter(member => member.jugadorId !== playerId) }, 'Integrante removido del equipo.');
  };

  const toggleActive = () => saveExisting({ ...equipoSeleccionado, activo: !equipoSeleccionado.activo }, `Equipo ${equipoSeleccionado.activo ? 'desactivado' : 'reactivado'}.`);

  const deleteTeam = async () => {
    if (!equipoSeleccionado || !window.confirm(`¿Eliminar el equipo “${equipoSeleccionado.nombre}”?`)) return;
    setOcupado(true);
    try {
      await api.deleteTeam(equipoSeleccionado.id);
      setEquipos(current => current.filter(team => team.id !== equipoSeleccionado.id));
      setSeleccionadoId('');
      showToast('Equipo eliminado.', 'info');
    } catch (cause) {
      showToast(cause.message, 'error');
    } finally {
      setOcupado(false);
    }
  };

  if (cargando) return <div className="container py-4" role="status">Cargando equipos y jugadores…</div>;

  return <div className="container py-4">
    <Breadcrumb items={[{ label: 'Inicio', to: '/' }, { label: 'Equipos' }]} />
    <section className="seccion" aria-labelledby="titulo-equipo">
      <h1 className="seccion__titulo" id="titulo-equipo">Gestión de equipos</h1>
      <p className="seccion__subtitulo">Equipos, juegos e integrantes se cargan desde el servidor. Registra jugadores antes de crear sus equipos.</p>
      {error && <div className="alert alert-danger" role="alert">No se pudo cargar la información: {error}</div>}
      {!error && jugadores.length === 0 && <div className="alert alert-info" role="status">Todavía no hay jugadores registrados. Crea cuentas de jugador para poder formar equipos.</div>}

      <div className="row g-3">
        <section className="col-lg-5" aria-labelledby="crear-equipo-titulo">
          <div className="card h-100">
            <h2 className="h5" id="crear-equipo-titulo">Crear equipo</h2>
            <form className="d-flex flex-column gap-3" onSubmit={createTeam}>
              <div><label className="form-label" htmlFor="team-name">Nombre</label><input id="team-name" className="form-control" required minLength="3" maxLength="30" value={form.nombre} onChange={event => setForm(current => ({ ...current, nombre: event.target.value }))} /></div>
              <div><label className="form-label" htmlFor="team-game">Juego</label><select id="team-game" className="form-select" required value={form.juegoId} onChange={event => setForm(current => ({ ...current, juegoId: event.target.value }))}><option value="">Selecciona un juego</option>{juegos.map(game => <option key={game.id} value={game.id}>{game.nombre} · {game.modalidad}</option>)}</select></div>
              <div><label className="form-label" htmlFor="team-captain">Capitán</label><select id="team-captain" className="form-select" required value={form.capitanId} onChange={event => setForm(current => ({ ...current, capitanId: event.target.value }))}><option value="">Selecciona un jugador</option>{jugadores.map(player => <option key={player.id} value={player.id}>{player.nombre}</option>)}</select><div className="form-text">El capitán se añade como integrante inicial. Completa el roster antes de inscribirlo.</div></div>
              <button className="btn btn-primary" disabled={ocupado || !juegos.length || !jugadores.length}>{ocupado ? 'Guardando…' : 'Crear equipo'}</button>
            </form>
          </div>
        </section>

        <section className="col-lg-7" aria-labelledby="equipos-lista-titulo">
          <div className="card h-100">
            <h2 className="h5" id="equipos-lista-titulo">Equipos registrados ({equipos.length})</h2>
            {equipos.length === 0 ? <EmptyState icono="🛡️" titulo="No hay equipos registrados" mensaje="Crea un equipo para iniciar la gestión." /> : <>
              <label className="form-label" htmlFor="team-select">Selecciona un equipo</label>
              <select id="team-select" className="form-select mb-3" value={seleccionadoId} onChange={event => setSeleccionadoId(event.target.value)}><option value="">Selecciona un equipo</option>{equipos.map(team => <option key={team.id} value={team.id}>{team.nombre}{team.activo ? '' : ' (inactivo)'}</option>)}</select>
              {equipoSeleccionado && <>
                <div className="d-flex align-items-start justify-content-between gap-2 flex-wrap">
                  <div><h3 className="h6 mb-1">{equipoSeleccionado.nombre}</h3><p className="text-secondary mb-2">{juegoSeleccionado?.nombre || 'Juego no disponible'} · {equipoSeleccionado.integrantes.length}/{juegoSeleccionado?.maxIntegrantes || '—'} integrantes</p></div>
                  <span className={`badge-estado ${equipoSeleccionado.activo ? 'badge-estado--abierto' : 'badge-estado--cancelado'}`}>{equipoSeleccionado.activo ? 'Activo' : 'Inactivo'}</span>
                </div>
                {equipoSeleccionado.integrantes.length < (juegoSeleccionado?.minIntegrantes || 1) && <div className="alert alert-warning py-2">Faltan integrantes para cumplir el mínimo de {juegoSeleccionado?.minIntegrantes}.</div>}
                <ul className="list-group mb-3">{equipoSeleccionado.integrantes.map(member => {
                  const player = jugadores.find(item => item.id === member.jugadorId);
                  return <li key={member.jugadorId} className="list-group-item d-flex align-items-center justify-content-between gap-2"><span>{player?.nombre || 'Jugador no disponible'} · {member.rol}{member.jugadorId === equipoSeleccionado.capitanId ? ' (capitán)' : ''}</span>{member.jugadorId !== equipoSeleccionado.capitanId && <button type="button" className="btn btn-sm btn-outline-danger" disabled={ocupado} onClick={() => removeMember(member.jugadorId)}>Quitar</button>}</li>;
                })}</ul>
                <form className="row g-2 align-items-end" onSubmit={addMember}>
                  <div className="col-md-5"><label className="form-label" htmlFor="member-player">Jugador</label><select id="member-player" className="form-select" required value={nuevoIntegrante.jugadorId} onChange={event => setNuevoIntegrante(current => ({ ...current, jugadorId: event.target.value }))}><option value="">Selecciona jugador</option>{disponibles.map(player => <option key={player.id} value={player.id}>{player.nombre}</option>)}</select></div>
                  <div className="col-md-4"><label className="form-label" htmlFor="member-role">Rol</label><input id="member-role" className="form-control" required minLength="2" maxLength="20" value={nuevoIntegrante.rol} onChange={event => setNuevoIntegrante(current => ({ ...current, rol: event.target.value }))} /></div>
                  <div className="col-md-3"><button className="btn btn-outline-primary w-100" disabled={ocupado || !disponibles.length || equipoSeleccionado.integrantes.length >= (juegoSeleccionado?.maxIntegrantes || 0)}>Agregar</button></div>
                </form>
                <div className="d-flex gap-2 flex-wrap mt-3"><button type="button" className="btn btn-outline-secondary" disabled={ocupado} onClick={toggleActive}>{equipoSeleccionado.activo ? 'Desactivar' : 'Reactivar'}</button><button type="button" className="btn btn-outline-danger" disabled={ocupado} onClick={deleteTeam}>Eliminar equipo</button></div>
              </>}
            </>}
          </div>
        </section>
      </div>
    </section>
  </div>;
}
