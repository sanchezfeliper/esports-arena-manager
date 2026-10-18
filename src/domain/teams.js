/* ==========================================================================
   eSports Arena Manager 
   ========================================================================== */

import { EQUIPOS } from '@data/mockData';
import { getJSONSession, setJSONSession } from '@services/localStorage';

const EQUIPOS_SESSION_KEY = 'eam_equipos_creados';

/**
 * Devuelve los equipos a los que pertenece un jugador.
 * @param {number} jugadorId - ID del jugador.
 * @returns {Array} Equipos donde el jugador es integrante.
 */
export function equiposDelJugador(jugadorId) {
  return obtenerTodosLosEquipos().filter(e =>
    e.integrantes.some(i => i.jugadorId === Number(jugadorId))
  );
}

/**
 * Equipo completo: valida la cantidad de integrantes exigida por el juego.
 * @param {object|null} equipo - Objeto equipo.
 * @param {object|null} juego - Objeto juego.
 * @returns {boolean}
 */
export function equipoCompleto(equipo, juego) {
  if (!equipo || !juego) return false;
  return equipo.integrantes.length >= juego.minIntegrantes;
}

/**
 * Siguiente ID único para un equipo creado localmente.
 * @param {Array} equiposLocales - Equipos creados en sesión.
 * @returns {number} Nuevo ID.
 */
export function siguienteIdEquipo(equiposLocales) {
  const todos = [...EQUIPOS, ...equiposLocales];
  return Math.max(...todos.map(e => e.id), 0) + 1;
}

/**
 * Devuelve todos los equipos (mock + creados en sesión).
 * @param {Array} equiposLocales - Equipos creados en sesión.
 * @returns {Array}
 */
export function obtenerTodosLosEquipos(equiposLocales = cargarEquiposLocales()) {
  return [...EQUIPOS, ...equiposLocales];
}

/**
 * Carga los equipos creados localmente desde sessionStorage.
 * @returns {Array} Equipos locales deserializados con IDs recalculados.
 */
export function cargarEquiposLocales() {
  const guardados = getJSONSession(EQUIPOS_SESSION_KEY);
  if (!guardados || !Array.isArray(guardados)) return [];
  const primerIdDisponible = siguienteIdEquipo([]);
  return guardados
    .filter(e =>
      e &&
      typeof e.nombre === 'string' &&
      Number.isFinite(Number(e.juegoId)) &&
      Number.isFinite(Number(e.capitanId)) &&
      Array.isArray(e.integrantes)
    )
    .map((e, index) => ({
    id: primerIdDisponible + index,
    nombre: e.nombre,
    juegoId: Number(e.juegoId),
    capitanId: Number(e.capitanId),
    activo: Boolean(e.activo),
    integrantes: e.integrantes
      .filter(i => i && Number.isFinite(Number(i.jugadorId)))
      .map(i => ({ ...i, jugadorId: Number(i.jugadorId) }))
  }));
}

/**
 * Serializa y guarda equipos locales en sessionStorage.
 * @param {Array} equiposLocales - Equipos creados en sesión.
 */
export function guardarEquiposLocales(equiposLocales) {
  const serializables = equiposLocales.map(e => ({
    nombre: e.nombre,
    juegoId: e.juegoId,
    capitanId: e.capitanId,
    activo: e.activo,
    integrantes: e.integrantes
  }));
  setJSONSession(EQUIPOS_SESSION_KEY, serializables);
}
