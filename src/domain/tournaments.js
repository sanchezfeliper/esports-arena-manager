/* ==========================================================================
   eSports Arena Manager 
 
   ========================================================================== */

import { TORNEOS } from "../data/mockData.js";
import { fechaLocalISO } from './dates.js';

/**
 * Estado legible de un torneo.
 * @param {string} estado - Estado interno del torneo.
 * @returns {string} Texto legible para mostrar al usuario.
 */
export function estadoTorneoTexto(estado) {
  const map = {
    'abierto': 'Inscripción abierta',
    'en curso': 'En curso',
    'finalizado': 'Finalizado',
    'cancelado': 'Cancelado'
  };
  return map[estado] || estado;
}

/**
 * Devuelve el badge CSS class para un estado de torneo.
 * @param {string} estado - Estado interno del torneo.
 * @returns {string} Clase CSS del badge.
 */
export function estadoBadgeClase(estado) {
  if (estado === 'abierto') return 'abierto';
  if (estado === 'en curso') return 'encurso';
  if (estado === 'cancelado') return 'cancelado';
  return 'finalizado';
}

/**
 * Cupos disponibles: resta inscritos al cupo máximo, nunca negativo.
 * @param {object} torneo - Objeto torneo.
 * @returns {number} Cupos disponibles.
 */
export function cuposDisponibles(torneo, inscripcionesAdicionales = 0) {
  if (!torneo) return 0;
  const disp = torneo.cupoMaximo - (torneo.inscritos ? torneo.inscritos.length : 0) - inscripcionesAdicionales;
  return disp < 0 ? 0 : disp;
}

/**
 * Inscripción fuera de plazo: verdadero si la fecha actual supera el cierre.
 * @param {object} torneo - Objato torneo.
 * @param {string} [fechaActual] - Fecha ISO YYYY-MM-DD opcional para testing.
 * @returns {boolean}
 */
export function inscripcionFueraDePlazo(torneo, fechaActual) {
  const hoy = fechaActual || fechaLocalISO();
  return hoy > torneo.fechaCierreInscripcion;
}

/**
 * Ordena ranking por puntos y desempata por diferencia de puntaje.
 * @param {Array} ranking - Array de filas de ranking.
 * @returns {Array} Ranking ordenado (no muta el original).
 */
export function ordenarRanking(ranking) {
  return [...ranking].sort((a, b) => {
    if (b.puntos !== a.puntos) return b.puntos - a.puntos;
    return b.diferenciaPuntaje - a.diferenciaPuntaje;
  });
}

/**
 * Calcula puntos a partir de resultados (victoria = 100, derrota = 25).
 * @param {Array} resultados - Partidas jugadas.
 * @returns {number} Puntos totales.
 */
export function calcularPuntos(resultados) {
  let puntos = 0;
  resultados.forEach(r => {
    if (r.ganadorId === r.equipoAId) puntos += 100;
    else if (r.ganadorId === r.equipoBId) puntos += 25;
  });
  return puntos;
}

/**
 * Devuelve los torneos destacados (abiertos y en curso).
 * @returns {Array} Torneos destacados.
 */
export function obtenerTorneosDestacados() {
  return TORNEOS.filter(t =>
    t.estado === 'abierto' || t.estado === 'en curso'
  );
}

/**
 * Devuelve los torneos con inscripción abierta, ordenados por fecha de cierre.
 * @returns {Array} Torneos abiertos ordenados por cierre.
 */
export function obtenerTorneosAbiertosPorCierre() {
  return TORNEOS
    .filter(t => t.estado === 'abierto')
    .toSorted((a, b) => a.fechaCierreInscripcion.localeCompare(b.fechaCierreInscripcion));
}

/**
 * Devuelve los torneos con inscripción abierta (para el select de inscripción).
 * @returns {Array} Torneos abiertos.
 */
export function obtenerTorneosInscripcionAbierto() {
  return TORNEOS.filter(t => t.estado === 'abierto');
}

/**
 * Valida que un ID de torneo sea válido.
 * @param {string} id - ID a validar.
 * @returns {boolean}
 */
export function idTorneoValido(id) {
  const parsed = Number(id);
  return !isNaN(parsed) && parsed > 0 && TORNEOS.some(t => t.id === parsed);
}
