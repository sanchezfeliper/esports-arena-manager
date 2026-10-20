/** Botón reutilizable que conserva los eventos y atributos nativos de React. */
export default function Button({ label, onClick, type = 'button', className = 'btn btn-primary', disabled = false }) {
  return (
    <button type={type} className={className} onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}
