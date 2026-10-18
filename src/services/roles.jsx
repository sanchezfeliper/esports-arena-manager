

import { useState, useCallback } from 'react';
import { ROLES, obtenerRolActual, guardarRol } from '@services/roleData';
import { RoleContext } from '@services/roleContext';

/**
 * Provider que expone el rol actual y funciones para cambiarlo.
 * Persiste el rol en localStorage entre recargas.
 */
export default function RoleProvider({ children }) {
  const [rol, setRol] = useState(obtenerRolActual);

  const cambiarRol = useCallback((rolId) => {
    if (!ROLES.some(role => role.id === rolId)) return;
    setRol(rolId);
    guardarRol(rolId);
  }, []);

  const tieneRol = useCallback((rolRequerido) => {
    if (typeof rolRequerido === 'string') {
      return rol === rolRequerido;
    }
    if (Array.isArray(rolRequerido)) {
      return rolRequerido.includes(rol);
    }
    return false;
  }, [rol]);

  return (
    <RoleContext.Provider value={{ rol, cambiarRol, tieneRol, ROLES }}>
      {children}
    </RoleContext.Provider>
  );
}

