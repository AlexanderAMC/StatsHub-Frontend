import { Link, useLocation } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ROLE_LABELS } from '../data/users';

export default function AccessRestricted({ feature }) {
  const { user, isGuest } = useAuth();
  const location = useLocation();

  return (
    <div className="card border-0 shadow-sm rounded-3 bg-white">
      <div className="text-center py-5 px-3">
        <div
          className="rounded-circle bg-warning bg-opacity-25 text-dark d-inline-flex align-items-center justify-content-center mb-3"
          style={{ width: '64px', height: '64px' }}
        >
          <Lock size={28} />
        </div>
        <h2 className="h4 fw-bold" style={{ color: '#1E0A3C' }}>
          {isGuest ? 'Inicia sesión para continuar' : 'Tu rol no tiene acceso'}
        </h2>
        <p className="text-muted mx-auto mb-4" style={{ maxWidth: '440px' }}>
          {isGuest
            ? `Para ${feature} necesitas iniciar sesión con una cuenta autorizada.`
            : `Tu rol (${ROLE_LABELS[user.role]}) no permite ${feature}.`}
        </p>
        <div className="d-flex flex-wrap justify-content-center gap-2">
          {isGuest && (
            <Link
              to="/login"
              state={{ from: location }}
              className="btn text-white fw-bold px-4"
              style={{ backgroundColor: '#1E0A3C' }}
            >
              Iniciar sesión
            </Link>
          )}
          <Link to="/" className="btn btn-outline-dark px-4">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
