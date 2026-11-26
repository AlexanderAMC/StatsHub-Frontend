import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { User } from 'lucide-react';
import { formatDateShort } from '../utils/dates';
import { useAuth } from '../hooks/useAuth';
import { ROLE_ABILITIES, ROLE_LABELS } from '../data/users';
import { passwordProblem } from '../utils/password';

// Privacidad (Ley 19.628), notificaciones (RF-45) y cambio de contraseña.
function AccountSettings() {
  const { user, updateProfile, changePassword } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [message, setMessage] = useState(null); // { type, text }
  const [busy, setBusy] = useState(false);

  const show = (result, okText) => setMessage(result.ok ? { type: 'success', text: okText } : { type: 'danger', text: result.error });

  const handlePassword = async (e) => {
    e.preventDefault();
    const problem = passwordProblem(next);
    if (problem) return setMessage({ type: 'danger', text: problem });
    setBusy(true);
    const result = await changePassword(current, next);
    setBusy(false);
    show(result, 'Contraseña actualizada. Se cerraron tus otras sesiones.');
    if (result.ok) { setCurrent(''); setNext(''); }
  };

  return (
    <div className="text-start small mt-3 d-flex flex-column gap-3">
      <div className="p-3 bg-light rounded border">
        <span className="fw-semibold text-dark d-block mb-1">Privacidad de datos</span>
        {user.privacyAcceptedAt ? (
          <span className="text-muted">Aceptaste la política de privacidad (Ley 19.628) el {formatDateShort(user.privacyAcceptedAt.slice(0, 10))}.</span>
        ) : (
          <>
            <span className="text-muted d-block mb-2">Para usar tu cuenta debes aceptar el tratamiento de tus datos conforme a la Ley 19.628.</span>
            <button type="button" className="btn btn-sm btn-dark" onClick={async () => show(await updateProfile({ aceptaPrivacidad: true }), 'Gracias, registramos tu aceptación.')}>
              Acepto la política de privacidad
            </button>
          </>
        )}
      </div>

      <div className="p-3 bg-light rounded border form-check form-switch ps-5">
        <input
          id="perfil-notificaciones" className="form-check-input" type="checkbox" role="switch"
          checked={user.receivesNotifications !== false}
          onChange={async (e) => show(await updateProfile({ recibeNotificaciones: e.target.checked }), 'Preferencia guardada.')}
        />
        <label htmlFor="perfil-notificaciones" className="form-check-label text-dark">Recibir notificaciones de partidos y resultados de la liga</label>
      </div>

      <form onSubmit={handlePassword} className="p-3 bg-light rounded border">
        <span className="fw-semibold text-dark d-block mb-2">Cambiar contraseña</span>
        <input type="password" className="form-control form-control-sm mb-2" placeholder="Contraseña actual" aria-label="Contraseña actual" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
        <input type="password" className="form-control form-control-sm mb-2" placeholder="Nueva contraseña (mín. 8)" aria-label="Nueva contraseña" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />
        <button type="submit" className="btn btn-sm btn-dark" disabled={busy || !current || !next}>{busy ? 'Guardando…' : 'Actualizar contraseña'}</button>
      </form>

      {message && <div className={`alert alert-${message.type} py-2 mb-0`} role="status">{message.text}</div>}
    </div>
  );
}

export default function ProfileModal({ show, onHide }) {
  const { user, isGuest } = useAuth();
  if (!user) return null;

  // Protegemos las habilidades por si el rol no existe en el objeto
  const abilities = ROLE_ABILITIES[user.role] || ['Ver marcadores y estadísticas'];
  const labelRol = ROLE_LABELS[user.role] || user.role;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton closeVariant="white" className="text-white border-0" style={{ backgroundColor: '#1E0A3C' }}>
        <Modal.Title as="h5" className="fw-bold d-flex align-items-center gap-2">
          <User size={20} className="text-warning" /> Mi perfil
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4 text-center">
        <div
          className="rounded-circle bg-warning text-dark d-inline-flex align-items-center justify-content-center fw-bold mb-3 fs-2 shadow-sm"
          style={{ width: '80px', height: '80px' }}
        >
          {user.initials || 'U'}
        </div>
        <h4 className="fw-bold mb-1 text-dark">{user.name}</h4>
        {user.email && <p className="text-muted small mb-3">{user.email}</p>}
        <div className="badge bg-warning text-dark px-3 py-2 fw-bold mb-4">
          {labelRol}
        </div>

        <div className="text-start small p-3 bg-light rounded border">
          <span className="text-muted d-block mb-2">Con tu rol puedes:</span>
          <ul className="mb-0 ps-3 text-dark fw-medium">
            {abilities.map((ability) => (
              <li key={ability}>{ability}</li>
            ))}
          </ul>
        </div>

        {!isGuest && <AccountSettings />}

        <p className="text-muted small mt-3 mb-0">Proyecto de Título (TIHI84), INACAP sede Puente Alto, 2026</p>
      </Modal.Body>

      <Modal.Footer className="bg-light">
        <button type="button" className="btn btn-secondary w-100" onClick={onHide}>
          Cerrar
        </button>
      </Modal.Footer>
    </Modal>
  );
}