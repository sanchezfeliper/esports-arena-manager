/* ==========================================================================
   components/SiteHeader.jsx - header de la aplicación con navegación  selector de rol.
   ========================================================================== */

import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useRoles } from '@services/useRoles';

export default function SiteHeader() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { rol, usuario, autenticado, cerrarSesion, tieneRol } = useRoles();
  const enlacesNav = [
    { to: '/', id: 'inicio', label: 'Inicio', visible: true },
    { to: '/torneos', id: 'torneos', label: 'Torneos', visible: true },
    { to: '/inscripcion', id: 'inscripcion', label: 'Inscripción', visible: tieneRol(['jugador','administrador']) },
    { to: '/equipos', id: 'equipos', label: 'Equipos', visible: tieneRol(['organizador','administrador']) },
    { to: '/admin/torneos', id: 'admin-torneos', label: 'Gestionar torneos', visible: tieneRol(['organizador','administrador']) },
    { to: '/perfil', id: 'perfil', label: 'Perfil', visible: autenticado },
    { to: '/admin/usuarios', id: 'usuarios', label: 'Usuarios', visible: tieneRol('administrador') }
  ].filter(item => item.visible);

  const toggleNav = () => setMenuAbierto(!menuAbierto);

  return (
    <header className="sitio-header" role="banner">
      <div className="sitio-header__contenedor">
        <NavLink to="/" className="sitio-header__marca" aria-label="Ir al inicio de eSports Arena Manager">
          <img src="/img/logo.svg" alt="Logo de eSports Arena Manager" className="sitio-header__logo" width="36" height="36" />
          <span>Arena Manager</span>
        </NavLink>

        <button
          className="sitio-header__toggle"
          id="nav-toggle"
          aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuAbierto}
          onClick={toggleNav}
        >
          {menuAbierto ? '✕' : '☰'}
        </button>

        <nav
          className={`navegacion ${menuAbierto ? 'navegacion--abierto' : ''}`}
          id="navegacion"
          aria-label="Navegación principal"
        >
          {enlacesNav.map((e) => (
            <NavLink
              key={e.id}
              to={e.to}
              className={({ isActive }) =>
                `navegacion__enlace ${isActive ? 'navegacion__enlace--activo' : ''}`
              }
              onClick={() => setMenuAbierto(false)}
            >
              {e.label}
            </NavLink>
          ))}
        </nav>

        <div className="sitio-header__acciones">
          {autenticado ? <>
            <span className="btn btn-outline-secondary btn-sm">{usuario.nombre} · {rol}</span>
            <button className="btn btn-outline-secondary btn-sm" onClick={cerrarSesion}>Cerrar sesión</button>
          </> : <>
            <Link className="btn btn-outline-secondary btn-sm" to="/iniciar-sesion">Iniciar sesión</Link>
            <Link className="btn btn-primary btn-sm" to="/crear-cuenta">Crear cuenta</Link>
          </>}
        </div>
      </div>
    </header>
  );
}
