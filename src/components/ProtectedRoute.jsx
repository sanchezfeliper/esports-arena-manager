import { Navigate, useLocation } from 'react-router-dom';
import { useRoles } from '@services/useRoles';

export default function ProtectedRoute({ roles = [], children }) {
  const { autenticado, cargando, tieneRol } = useRoles();
  const location = useLocation();
  if (cargando) return <div className="container py-5" role="status">Verificando sesión…</div>;
  if (!autenticado) return <Navigate to={`/iniciar-sesion?returnTo=${encodeURIComponent(location.pathname)}`} replace />;
  if (roles.length && !tieneRol(roles)) return <div className="container py-5"><div className="alert alert-warning">Tu cuenta no tiene permisos para acceder a esta sección.</div></div>;
  return children;
}
