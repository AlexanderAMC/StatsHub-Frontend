import { Link, useLocation } from 'react-router-dom';
import { LogIn, Menu, User } from 'lucide-react';
import NotificationsMenu from './NotificationsMenu';
import { useAuth } from '../hooks/useAuth';

export default function Header({ liveCount, onOpenMenu, onOpenProfile }) {
  const { user, isGuest } = useAuth();
  const location = useLocation();

  return (
    <header className="no-print bg-white px-3 px-md-4 py-3 shadow-sm sticky-top border-bottom d-flex align-items-center justify-content-between gap-3">
      <div className="d-flex align-items-center gap-3">
        <button type="button" onClick={onOpenMenu} className="btn btn-light d-lg-none p-2" aria-label="Abrir menú">
          <Menu size={20} />
        </button>
        <div>
          <h1 className="h5 mb-0 fw-bold text-uppercase" style={{ color: '#1E0A3C', letterSpacing: '0.5px' }}>
            StatsHub <span className="text-warning">Deportivo</span>
          </h1>
          <small className="text-muted d-none d-sm-block">Plataforma Web de Gestión y Analítica Deportiva</small>
        </div>
      </div>

      <div className="d-flex align-items-center gap-2 gap-md-3">
        {liveCount > 0 && (
          <Link to="/calendario" className="badge bg-danger text-decoration-none rounded-pill px-3 py-2 d-none d-sm-inline">
            ● {liveCount} en vivo
          </Link>
        )}

        <NotificationsMenu />

        {isGuest ? (
          <>
            <span className="badge bg-secondary-subtle text-secondary-emphasis d-none d-md-inline">Modo invitado</span>
            <Link
              to="/login"
              state={{ from: location }}
              className="btn btn-sm text-white fw-bold d-flex align-items-center gap-2 rounded-pill px-3 py-1"
              style={{ backgroundColor: '#1E0A3C' }}
            >
              <LogIn size={16} />
              <span>Iniciar sesión</span>
            </Link>
          </>
        ) : (
          <button
            type="button"
            onClick={onOpenProfile}
            className="btn btn-outline-dark btn-sm d-flex align-items-center gap-2 rounded-pill px-3 py-1 fw-medium"
            style={{ borderColor: '#1E0A3C', color: '#1E0A3C' }}
          >
            <User size={16} />
            <span className="d-none d-sm-inline text-truncate" style={{ maxWidth: '140px' }}>{user.name}</span>
          </button>
        )}
      </div>
    </header>
  );
}
