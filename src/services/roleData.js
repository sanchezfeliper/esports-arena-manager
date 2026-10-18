import { getJSON, setJSON } from '@services/localStorage';

export const ROLES = [
  { id: 'visitante', nombre: 'Visitante', icono: '👁️' },
  { id: 'jugador', nombre: 'Jugador', icono: '🎮' },
  { id: 'organizador', nombre: 'Organizador', icono: '📋' },
  { id: 'administrador', nombre: 'Administrador', icono: '⚙️' }
];

const ROL_KEY = 'eam_rol_actual';

export function obtenerRolActual() {
  const rolGuardado = getJSON(ROL_KEY);
  return ROLES.some(rol => rol.id === rolGuardado) ? rolGuardado : 'visitante';
}

export function guardarRol(rolId) {
  if (ROLES.some(rol => rol.id === rolId)) setJSON(ROL_KEY, rolId);
}

export function nombreRol(rolId) {
  return ROLES.find(rol => rol.id === rolId)?.nombre || 'Visitante';
}
