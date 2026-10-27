import { Navigate, useLocation } from 'react-router-dom';
import AccessRestricted from './AccessRestricted';
import { useAuth } from '../hooks/useAuth';

// Sin sesión (ni siquiera de invitado) se envía al login.
export function RequireSession({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

// Con sesión pero sin el permiso: muestra la pantalla de acceso restringido.
export function RequirePermission({ permission, feature, children }) {
  const { can } = useAuth();

  return can(permission) ? children : <AccessRestricted feature={feature} />;
}
