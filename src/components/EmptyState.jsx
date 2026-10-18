/* ==========================================================================
   components/EmptyState.jsx — Componente de estado vacío (mensaje + icono + acciones opcionales).
   ========================================================================== */

/**
 * @param {string} [icono] 
 * @param {string} titulo 
 * @param {string} mensaje 
 * @param {React.ReactNode} [children] 
 */
export default function EmptyState({ icono = '📭', titulo, mensaje, children }) {
  return (
    <div className="estado-vacio">
      <div className="estado-vacio__icono" aria-hidden="true">
        {icono}
      </div>
      <p className="estado-vacio__titulo">{titulo}</p>
      <p>{mensaje}</p>
      {children}
    </div>
  );
}
