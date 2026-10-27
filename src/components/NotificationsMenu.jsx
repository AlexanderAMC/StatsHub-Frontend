import { Dropdown } from 'react-bootstrap';
import { AlarmClock, ArrowLeftRight, Bell, CalendarClock, CalendarPlus, Trophy } from 'lucide-react';
import { useData } from '../hooks/useData';
import { formatDateTime } from '../utils/dates';

const KIND_ICON = {
  programacion: CalendarPlus,
  cambio: CalendarClock,
  resultado: Trophy,
  recordatorio: AlarmClock,
  transferencia: ArrowLeftRight,
};

export default function NotificationsMenu() {
  const { notifications, markAllRead } = useData();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <Dropdown align="end" autoClose="outside">
      <Dropdown.Toggle
        variant="light"
        id="notificaciones"
        className="rounded-circle p-2 position-relative border-0 dropdown-toggle-no-caret"
        aria-label={unread > 0 ? `Notificaciones: ${unread} sin leer` : 'Notificaciones'}
      >
        <Bell size={18} className="text-secondary" />
        {unread > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">{unread}</span>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu className="shadow border-0 p-0" style={{ width: '360px', maxWidth: '92vw' }}>
        <div className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom">
          <span className="fw-bold text-dark">Notificaciones</span>
          <button type="button" className="btn btn-link btn-sm p-0 text-decoration-none" onClick={markAllRead} disabled={unread === 0}>
            Marcar como leídas
          </button>
        </div>

        {notifications.length === 0 ? (
          <p className="text-muted small text-center py-4 mb-0">No tienes notificaciones.</p>
        ) : (
          <ul className="list-unstyled mb-0 overflow-auto" style={{ maxHeight: '380px' }}>
            {notifications.slice(0, 15).map((n) => {
              const Icon = KIND_ICON[n.kind] ?? Bell;
              return (
                <li
                  key={n.id}
                  className="d-flex gap-3 px-3 py-2 border-bottom"
                  style={n.read ? undefined : { backgroundColor: '#FFFBF2', borderLeft: '3px solid #F59E0B' }}
                >
                  <span className="flex-shrink-0 text-secondary pt-1"><Icon size={18} /></span>
                  <span>
                    <span className="d-block small text-dark">{n.text}</span>
                    <span className="d-block text-muted" style={{ fontSize: '0.75rem' }}>{formatDateTime(n.at)}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
}
