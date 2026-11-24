import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Breadcrumb from '@components/Breadcrumb';
import EmptyState from '@components/EmptyState';
import { useRoles } from '@services/useRoles';
import { api } from '@services/api';

export default function ProfilePage() {
  const { id } = useParams();
  const { usuario } = useRoles();
  const [equipos, setEquipos] = useState([]);
  const [torneos, setTorneos] = useState([]);
  const [inscripciones, setInscripciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const ownProfile = !id || Number(id) === usuario?.id;

  useEffect(() => {
    if (!usuario || !ownProfile) return;
    let active = true;
    const registrationsRequest = ['JUGADOR', 'ADMINISTRADOR'].includes(usuario.role) ? api.myRegistrations() : Promise.resolve([]);
    Promise.all([api.teams(), api.tournaments(), registrationsRequest])
      .then(([teamData, tournamentData, registrationData]) => {
        if (!active) return;
        setEquipos(teamData.filter(team => team.integrantes.some(member => member.jugadorId === usuario.id)));
        setTorneos(tournamentData);
        setInscripciones(registrationData);
      })
      .catch(cause => { if (active) setError(cause.message); })
      .finally(() => { if (active) setCargando(false); });
    return () => { active = false; };
  }, [usuario, ownProfile]);

  if (!ownProfile) return <div className="container py-4"><Breadcrumb items={[{ label: 'Inicio', to: '/' }, { label: 'Perfil' }]} /><div className="alert alert-warning" role="alert">Solo puedes consultar el perfil de la cuenta autenticada.</div></div>;
  if (cargando) return <div className="container py-4" role="status">Cargando perfil…</div>;

  const tournamentNames = new Map(torneos.map(tournament => [tournament.id, tournament.nombre]));
  return <div className="container py-4">
    <Breadcrumb items={[{ label: 'Inicio', to: '/' }, { label: 'Mi perfil' }]} />
    <section className="seccion" aria-labelledby="perfil-title">
      <h1 className="seccion__titulo" id="perfil-title">Mi perfil</h1>
      <div className="card mb-3">
        <h2 className="h5">{usuario?.nombre}</h2>
        <p className="mb-1">Correo: {usuario?.email}</p>
        <p className="mb-0">Rol: {usuario?.role}</p>
      </div>
      {error && <div className="alert alert-danger" role="alert">No se pudo cargar el historial: {error}</div>}
      <div className="row g-3">
        <section className="col-lg-6" aria-labelledby="profile-teams-title">
          <div className="card h-100"><h2 className="h5" id="profile-teams-title">Mis equipos</h2>
            {equipos.length ? <ul className="list-group list-group-flush">{equipos.map(team => <li className="list-group-item" key={team.id}>{team.nombre} · {team.activo ? 'Activo' : 'Inactivo'} <span className="text-secondary">({team.integrantes.length} integrantes)</span></li>)}</ul> : <EmptyState icono="🛡️" titulo="Sin equipos" mensaje="Todavía no perteneces a un equipo registrado." />}
          </div>
        </section>
        <section className="col-lg-6" aria-labelledby="profile-registrations-title">
          <div className="card h-100"><h2 className="h5" id="profile-registrations-title">Mis inscripciones</h2>
            {inscripciones.length ? <ul className="list-group list-group-flush">{inscripciones.map(registration => <li className="list-group-item" key={registration.id}><Link to={`/torneos/${registration.torneoId}`}>{tournamentNames.get(registration.torneoId) || `Torneo #${registration.torneoId}`}</Link><span className="text-secondary"> · {registration.tipo}{registration.equipoId ? ` · Equipo #${registration.equipoId}` : ''}</span></li>)}</ul> : <EmptyState icono="🎟️" titulo="Sin inscripciones" mensaje="Cuando te inscribas en un torneo aparecerá aquí." />}
          </div>
        </section>
      </div>
      <p className="form-text mt-3">Este perfil muestra los datos de tu cuenta y la información guardada en el servidor. Edición de perfil, partidas y estadísticas aún no están habilitadas.</p>
    </section>
  </div>;
}
