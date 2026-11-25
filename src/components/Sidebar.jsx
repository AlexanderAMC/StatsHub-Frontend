import { Link, NavLink, useLocation } from 'react-router-dom';
import { Offcanvas } from 'react-bootstrap';
import { LogIn, LogOut } from 'lucide-react';
import logoStatsHub from '../assets/logo.jpg';
import { NAV_ITEMS } from '../data/navItems';
import { ROLE_LABELS } from '../data/users';
import { useAuth } from '../hooks/useAuth';

const SIDEBAR_BG = '#1E0A3C';

function SidebarContent({ onNavigate, onOpenProfile }) {
  const { user, isGuest, can, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="d-flex flex-column h-100">
      <div className="text-center my-2 p-2 bg-white rounded-3 shadow-sm d-flex align-items-center justify-content-center">
        <img
          src={logoStatsHub}
          alt="StatsHub Deportivo"
          className="img-fluid rounded"
          style={{ maxHeight: '75px', objectFit: 'contain' }}
        />
      </div>

      <hr className="my-3" style={{ borderColor: '#F59E0B', opacity: 0.5 }} />

      <nav aria-label="Navegación principal">
        <ul className="nav flex-column mb-auto gap-2">
          {NAV_ITEMS.map(({ path, label, icon: Icon, permission, anyOf, roles, members }) => {
            const locked = !((!permission || can(permission))
              && (!anyOf || anyOf.some((p) => can(p)))
              && (!roles || roles.includes(user?.role))
              && (!members || (user && !isGuest)));
            // Cada perfil ve solo lo suyo: sin candados en el menú.
            if (locked) return null;
            return (
              <li className="nav-item" key={path}>
                <NavLink
                  to={path}
                  end={path === '/'}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-3 fw-medium transition-all ${
                      isActive ? 'bg-warning text-dark fw-bold shadow-sm' : 'text-white-50 hover-white'
                    }`
                  }
                >
                  <Icon size={20} /> {label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {isGuest ? (
        <div className="mt-auto p-3 rounded-3 bg-dark bg-opacity-50 border border-secondary border-opacity-25">
          <p className="small text-white-50 mb-2">
            Estás como invitado. Inicia sesión para registrar actas y gestionar torneos.
          </p>
          <Link
            to="/login"
            state={{ from: location }}
            onClick={onNavigate}
            className="btn btn-warning btn-sm w-100 fw-bold d-flex align-items-center justify-content-center gap-2"
          >
            <LogIn size={16} /> Iniciar sesión
          </Link>
        </div>
      ) : (
        <div className="mt-auto d-flex flex-column gap-2">
          <button
            type="button"
            onClick={() => {
              onNavigate?.();
              onOpenProfile();
            }}
            className="btn p-2 w-100 text-start rounded-3 bg-dark bg-opacity-50 border border-secondary border-opacity-25"
          >
            <span className="d-flex align-items-center gap-2">
              <span
                className="rounded-circle bg-warning text-dark d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                style={{ width: '38px', height: '38px' }}
              >
                {user.initials}
              </span>
              <span className="overflow-hidden">
                <span className="d-block text-white text-truncate small fw-bold">{user.name}</span>
                <span className="d-block text-warning" style={{ fontSize: '0.75rem' }}>
                  {ROLE_LABELS[user.role]}
                </span>
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              onNavigate?.();
              logout();
            }}
            className="btn btn-sm btn-outline-light w-100 d-flex align-items-center justify-content-center gap-2"
          >
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ showMenu, onCloseMenu, onOpenProfile }) {
  return (
    <>
      {/* Escritorio: barra fija */}
      <aside
        className="no-print d-none d-lg-block p-3 text-white shadow-lg sticky-top"
        style={{ width: '280px', minWidth: '280px', height: '100vh', backgroundColor: SIDEBAR_BG }}
      >
        <SidebarContent onOpenProfile={onOpenProfile} />
      </aside>

      {/* Móvil y tablet: menú deslizable */}
      <Offcanvas
        show={showMenu}
        onHide={onCloseMenu}
        className="no-print text-white d-lg-none"
        style={{ backgroundColor: SIDEBAR_BG, width: '280px' }}
      >
        <Offcanvas.Header closeButton closeVariant="white">
          <Offcanvas.Title as="span" className="visually-hidden">
            Menú
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="pt-0">
          <SidebarContent onNavigate={onCloseMenu} onOpenProfile={onOpenProfile} />
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}
