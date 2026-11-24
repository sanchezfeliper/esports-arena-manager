import { useCallback, useEffect, useState } from 'react';
import { api } from '@services/api';
import Breadcrumb from '@components/Breadcrumb';
import { useToast } from '@components/useToast';

const ROLES=['JUGADOR','ORGANIZADOR','ADMINISTRADOR'];

export default function AdminUsersPage() {
  const [usuarios,setUsuarios]=useState([]);
  const [cargando,setCargando]=useState(true);
  const {showToast}=useToast();
  const cargar=useCallback(()=>api.users().then(setUsuarios).catch(error=>showToast(`No se pudo cargar usuarios: ${error.message}`,'error')).finally(()=>setCargando(false)),[showToast]);
  useEffect(()=>{cargar();},[cargar]);
  const cambiarRol=async(id,role)=>{
    try { const actualizado=await api.updateUserRole(id,role); setUsuarios(actuales=>actuales.map(usuario=>usuario.id===id?actualizado:usuario)); showToast('Permisos actualizados. El usuario debe iniciar sesión de nuevo.','exito'); }
    catch(error){showToast(error.message,'error');}
  };
  return <div className="container py-4">
    <Breadcrumb items={[{label:'Inicio',to:'/'},{label:'Usuarios'}]} />
    <section className="seccion" aria-labelledby="users-title">
      <h1 className="seccion__titulo" id="users-title">Administración de usuarios</h1>
      <p className="seccion__subtitulo">Asigna permisos de jugador, organizador o administrador.</p>
      {cargando?<p role="status">Cargando usuarios…</p>:<div className="table-responsive"><table className="table table-striped align-middle">
        <thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th><span className="visually-hidden">Acciones</span></th></tr></thead>
        <tbody>{usuarios.map(usuario=><tr key={usuario.id}><td>{usuario.nombre}</td><td>{usuario.email}</td><td>{usuario.role}</td><td>
          <label className="visually-hidden" htmlFor={`role-${usuario.id}`}>Rol de {usuario.nombre}</label>
          <select id={`role-${usuario.id}`} className="form-select" value={usuario.role} onChange={event=>cambiarRol(usuario.id,event.target.value)}>
            {ROLES.map(role=><option key={role} value={role}>{role}</option>)}
          </select>
        </td></tr>)}</tbody>
      </table></div>}
    </section>
  </div>;
}
