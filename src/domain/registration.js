/* ==========================================================================
   eSports Arena Manager
   ========================================================================== */

import { SANCIONES } from '@data/mockData';
import { fechaLocalISO, formatearFecha } from '@domain/dates';
import { cuposDisponibles, inscripcionFueraDePlazo } from '@domain/tournaments';
import { equipoCompleto } from '@domain/teams';
import { obtenerJuego } from '@data/mockData';

/**
 * Devuelve las sanciones de un jugador.
 * @param {number} jugadorId - ID del jugador.
 * @returns {Array} Sanciones del jugador.
 */
export function sancionesDelJugador(jugadorId) {
  return SANCIONES.filter(s => s.jugadorId === Number(jugadorId));
}

/**
 * Indica si un jugador tiene sanción vigente (fecha actual dentro del rango).
 * @param {number} jugadorId - ID del jugador.
 * @param {string} [fechaActual] - Fecha ISO opcional para testing.
 * @returns {boolean}
 */
export function tieneSancionActiva(jugadorId, fechaActual) {
  const hoy = fechaActual || fechaLocalISO();
  return SANCIONES.some(s =>
    s.jugadorId === Number(jugadorId) &&
    s.estado === 'vigente' &&
    hoy >= s.fechaInicio &&
    hoy <= s.fechaFin
  );
}

/**
 * Valida formato de correo electrónico.
 * @param {string} correo - Correo a validar.
 * @returns {boolean}
 */
export function esCorreoValido(correo) {
  return /^[^\s@]+@[^\s@]+\.[^@\s]{2,}$/.test(correo);
}

/**
 * Valida que un texto no tenga espacios.
 * @param {string} texto - Texto a validar.
 * @returns {boolean}
 */
export function noContieneEspacios(texto) {
  return !/\s/.test(texto);
}

/**
 * Verifica si un participante (equipo o jugador) ya está inscrito en un torneo.
 * Considera tanto los inscritos del mock data como inscripciones simuladas en sesión.
 * @param {object} torneo - Torneo object.
 * @param {string} tipo - 'equipo' o 'individual'.
 * @param {number} participanteId - ID del jugador o equipo.
 * @param {Array} inscripcionesSession - Inscripciones simuladas en la sesión actual.
 * @returns {boolean}
 */
export function esDuplicado(torneo, tipo, participanteId, inscripcionesSession = []) {
  if (!torneo || participanteId === undefined || participanteId === null) return false;
  return torneo.inscritos.includes(participanteId) ||
    inscripcionesSession.some(i =>
      i.torneoId === torneo.id &&
      i.tipo === tipo &&
      i.participanteId === participanteId
    );
}

/**
 * Valida el formulario de inscripción y devuelve errores detallados.
 * Mantiene las mismas reglas que el JS original.
 *
 * @param {object} estado - Estado del formulario.
 * @param {Array} inscripcionesSession - Inscripciones simuladas en la sesión actual.
 * @returns {{valido: boolean, errores: Array, erroresCampo: object}}
 */
export function validarInscripcion(estado, inscripcionesSession = []) {
  const errores = [];
  const erroresCampo = {};
  let valido = true;

  const { torneo, jugador, correo, tipo, equipo, acepto } = estado;

  // Torneo obligatorio
  if (!torneo) {
    errores.push('Selecciona un torneo.');
    valido = false;
  }

  // Jugador obligatorio
  if (!jugador) {
    erroresCampo.jugador = 'Selecciona tu jugador.';
    valido = false;
  }

  // Correo obligatorio y formato
  if (!correo) {
    erroresCampo.correo = 'El correo electrónico es obligatorio.';
    valido = false;
  } else if (!esCorreoValido(correo)) {
    erroresCampo.correo = 'El correo no tiene un formato válido (ej: nombre@dominio.cl).';
    valido = false;
  }

  // Edad obligatoria y rango numérico
  if (estado.edad === '' || estado.edad === null || estado.edad === undefined) {
    erroresCampo.edad = 'La edad es obligatoria.';
    valido = false;
  } else {
    const edadNum = Number(estado.edad);
    if (isNaN(edadNum)) {
      erroresCampo.edad = 'La edad debe ser un número.';
      valido = false;
    } else if (edadNum < 13) {
      erroresCampo.edad = 'La edad mínima para inscribirse es 13 años.';
      valido = false;
    } else if (edadNum > 99) {
      erroresCampo.edad = 'La edad no puede superar 99 años.';
      valido = false;
    }
  }

  // Tipo de participante obligatorio
  if (!tipo) {
    errores.push('Selecciona el tipo de participante.');
    valido = false;
  } else if (tipo === 'equipo' && !equipo) {
    erroresCampo.equipo = 'Selecciona el equipo con el que vas a competir.';
    valido = false;
  }

  // Aceptar reglas
  if (!acepto) {
    valido = false;
  }

  // Validaciones de dominio
  if (torneo) {
    // Plazo
    if (inscripcionFueraDePlazo(torneo)) {
      errores.push('El plazo de inscripción está cerrado.');
      valido = false;
    }
    // Cupo (considerando inscripciones simuladas en sesión)
    const inscripcionesPrevias = inscripcionesSession.filter(i => i.torneoId === torneo.id).length;
    if (cuposDisponibles(torneo, inscripcionesPrevias) <= 0) {
      errores.push('Cupo máximo alcanzado.');
      valido = false;
    }
  }

  // Sanción vigente
  if (jugador && tieneSancionActiva(jugador.id)) {
    const sancion = sancionesDelJugador(jugador.id).find(s => s.estado === 'vigente');
    if (sancion) {
      errores.push(`Sanción vigente hasta ${formatearFecha(sancion.fechaFin)}.`);
    }
    valido = false;
  }

  // Equipo completo (mínimo integrantes)
  if (torneo && tipo === 'equipo' && equipo) {
    const juego = obtenerJuego(torneo.juegoId);
    if (!juego || !equipoCompleto(equipo, juego)) {
      erroresCampo.equipo = juego
        ? `El equipo "${equipo.nombre}" tiene ${equipo.integrantes.length} integrante(s), pero el juego exige mínimo ${juego.minIntegrantes}.`
        : 'El juego de este torneo no está disponible.';
      valido = false;
    }
    // Equipo inactivo
    if (!equipo.activo) {
      erroresCampo.equipo = 'El equipo está inactivo y no puede inscribirse.';
      valido = false;
    }
  }

  // Duplicidad: no inscribir dos veces al mismo participante en el mismo torneo.
  if (torneo && (tipo === 'equipo' ? equipo : jugador)) {
    const participanteId = tipo === 'equipo' ? equipo?.id : jugador?.id;
    if (esDuplicado(torneo, tipo, participanteId, inscripcionesSession)) {
      const mensaje = tipo === 'equipo'
        ? 'El equipo ya está inscrito en este torneo.'
        : 'Ya estás inscrito en este torneo.';
      erroresCampo[tipo === 'equipo' ? 'equipo' : 'jugador'] = mensaje;
      valido = false;
    }
  }

  return { valido, errores, erroresCampo };
}
