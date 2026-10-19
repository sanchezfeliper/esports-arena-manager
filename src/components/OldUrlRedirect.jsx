/* ==========================================================================
   components/OldUrlRedirect.jsx
   Redirije automáticamente las URL antiguas a las nuevas rutas de la aplicación.
   ========================================================================== */

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function OldUrlRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('id');
    const path = location.pathname;

    let newPath;
    if (path.includes('torneo-detalle.html')) {
      newPath = id ? `/torneos/${id}` : '/torneos';
    } else if (path.includes('inscripcion.html')) {
      newPath = id ? `/inscripcion/${id}` : '/inscripcion';
    } else if (path.includes('torneos.html')) {
      newPath = '/torneos';
    } else if (path.includes('equipo.html')) {
      newPath = '/equipos';
    } else if (path.includes('perfil.html')) {
      newPath = id ? `/perfil/${id}` : '/perfil';
    } else {
      newPath = '/';
    }

    // Redireccionar a la nueva ruta, reemplazando la entrada en el historial para evitar volver a la URL antigua
    navigate(newPath, { replace: true });
  }, [navigate, location]);


  return null;
}
