/* ==========================================================================
   components/SiteHeader.jsx - header de la aplicación con navegación  selector de rol.
   ========================================================================== */

import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useRoles } from '@services/useRoles';
import { ROLES } from '@services/roleData';
import { useToast } from '@components/useToast';

const enlacesNav = [
  { to: '/',              id: 'inicio',     label: 'Inicio' },
  { to: '/torneos',       id: 'torneos',    label: 'Torneos' },
  { to: '/inscripcion',   id: 'inscripcion', label: 'Inscripción' },
  { to: '/equipos',       id: 'equipos',    label: 'Equipos' },
  { to: '/perfil',        id: 'perfil',     label: 'Perfil' }
];

export default function SiteHeader() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { rol, cambiarRol } = useRoles();
  const { showToast } = useToast();

  const handleRolChange = (e) => {
    const rolId = e.target.value;
    cambiarRol(rolId);
    const nombre = ROLES.find(r => r.id === rolId)?.nombre || 'Visitante';
    showToast(`Perfil cambiado a "${nombre}". Las acciones se ajustan al rol.`, 'info');
  };

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
          <div className="selector-rol" role="group" aria-label="Selector de perfil de prueba">
            <span className="selector-rol__etiqueta selector-rol__icono" aria-hidden="true">👤</span>
            <label htmlFor="selector-rol-select" className="selector-rol__etiqueta sr-only">
              Perfil de prueba
            </label>
            <select
              id="selector-rol-select"
              className="selector-rol__select"
              aria-describedby="ayuda-rol"
              value={rol}
              onChange={handleRolChange}
            >
              {ROLES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.icono} {r.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <span id="ayuda-rol" className="sr-only">
        En EP1 los roles se simulan seleccionando un perfil de prueba.
      </span>
    </header>
  );
}
