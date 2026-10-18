/* ==========================================================================
   components/StatusBadge.jsx — Medalla de estado de torneo (abierto/en curso/finalizado/cancelado).
   ========================================================================== */

import { estadoTorneoTexto, estadoBadgeClase } from '@domain/tournaments';

/**
 * @param {string} estado 
 * @param {boolean} [outline] 
 */
export default function StatusBadge({ estado }) {
  return (
    <span className={`badge badge--${estadoBadgeClase(estado)}`}>
      {estadoTorneoTexto(estado)}
    </span>
  );
}
