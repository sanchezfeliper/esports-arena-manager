/* ==========================================================================
   eSports Arena Manager 
   ========================================================================== */

/**
 * Formatea una fecha ISO (YYYY-MM-DD) a formato legible en español.
 * @param {string} iso - Fecha en formato YYYY-MM-DD.
 * @returns {string} Fecha formateada como "15 jun 2026" o "Por definir".
 */
export function formatearFecha(iso) {
  if (!iso) return 'Por definir';
  const [y, m, d] = iso.split('-');
  const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${Number(d)} ${meses[Number(m) - 1]} ${y}`;
}

/**
 * Formatea una fecha con hora (YYYY-MM-DDTHH:mm) a formato legible.
 * @param {string} iso - Fecha/hora ISO.
 * @returns {string} Fecha y hora formateadas o "Por definir".
 */
export function formatearFechaHora(iso) {
  if (!iso) return 'Por definir';
  const [fecha, hora] = iso.split('T');
  return `${formatearFecha(fecha)} · ${hora}`;
}

/**
 * Cuenta días restantes a una fecha (negativo si ya pasó).
 * @param {string} fechaIso - Fecha ISO YYYY-MM-DD.
 * @returns {number|null} Días restantes, o null si no se proporciona fecha.
 */
export function diasRestantes(fechaIso) {
  if (!fechaIso) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fecha = new Date(fechaIso + 'T00:00:00');
  return Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24));
}

/** Devuelve la fecha local en formato ISO, sin desplazamientos por UTC. */
export function fechaLocalISO(fecha = new Date()) {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
