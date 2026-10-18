/* ==========================================================================
   components/FormField.jsx — Campo de formulario: etiqueta + input + ayuda + error.
   ========================================================================== */

/**
 * @param {string} label 
 * @param {string} id 
 * @param {string} [error] 
 * @param {string} [help] 
 * @param {string} [helpId] 
 * @param {React.ReactNode} children 
 * @param {string} [className] 
 */
export default function FormField({ label, id, error, help, helpId, children, className = '' }) {
  const descId = helpId || `${id}-ayuda`;
  const errorId = `${id}-error`;
  const describedBy = [descId];
  if (error) describedBy.push(errorId);

  return (
    <div className={`campo ${className}`}>
      <label className="campo__etiqueta" htmlFor={id}>
        {label}
      </label>
      {children}
      {help && (
        <span className="campo__ayuda" id={descId}>
          {help}
        </span>
      )}
      {error && (
        <div className="campo__error" id={errorId} role="alert">
          {error}
        </div>
      )}
    </div>
  );
}

/**
 * Aviso de campo obligatorio (asterisco rojo). Se puede usar dentro de la etiqueta <label> de un FormField.
 */
export function Obligatorio() {
  return <span className="campo__obligatorio" aria-hidden="true">*</span>;
}
