/* ==========================================================================
   components/Modal.jsx — Componente de modal (ventana emergente) con fondo y cierre al hacer clic fuera.
   ========================================================================== */

/**
 * @param {boolean} abierto
 * @param {function} onClose 
 * @param {string} titulo 
 * @param {React.ReactNode} children 
 */
export default function Modal({ abierto, onClose, titulo, children }) {
  if (!abierto) return null;

  return (
    <div className="modal-brand-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-titulo"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="modal-brand">
        <h2 className="modal-brand__titulo" id="modal-titulo">{titulo}</h2>
        <div className="modal-brand__cuerpo" id="modal-cuerpo">{children}</div>
      </div>
    </div>
  );
}
