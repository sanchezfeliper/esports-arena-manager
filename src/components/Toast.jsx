/* ==========================================================================
   eSports Arena Manager — Sistema de notificaciones tipo toast (aviso emergente).
   ========================================================================== */

import { useState, useCallback } from 'react';
import { ToastContext } from '@components/toastContext';

const iconos = { exito: '✓', error: '⚠', info: 'ℹ' };

let toastCounter = 0;

/**
 * Provider que expone showToast para disparar notificaciones desde cualquier componente.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((mensaje, tipo = 'exito') => {
    const id = ++toastCounter;
    setToasts(prev => [...prev, { id, mensaje, tipo }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

/** Contenedor que renderiza los toasts activos. */
function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;
  return (
    <>
      {toasts.map(t => (
        <div
          key={t.id}
          className={`toast-brand toast-brand--${t.tipo}`}
          role="status"
          aria-live="polite"
          onClick={() => onDismiss(t.id)}
          style={{ cursor: 'pointer' }}
        >
          <span className="aviso__icono" aria-hidden="true">
            {iconos[t.tipo] || '✓'}
          </span>
          <span>{t.mensaje}</span>
        </div>
      ))}
    </>
  );
}
