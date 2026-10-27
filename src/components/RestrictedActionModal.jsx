import { Link, useLocation } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import { Lock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ROLE_LABELS } from '../data/users';

// Aviso que aparece cuando alguien toca una acción para la que no tiene permiso.
export default function RestrictedActionModal({ show, onHide, action }) {
  const { user, isGuest } = useAuth();
  const location = useLocation();

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton closeVariant="white" className="text-white border-0" style={{ backgroundColor: '#1E0A3C' }}>
        <Modal.Title as="h5" className="fw-bold d-flex align-items-center gap-2">
          <Lock size={20} className="text-warning" />
          {isGuest ? 'Inicia sesión para continuar' : 'Sin permiso'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <p className="mb-0">
          {isGuest
            ? `Para ${action} necesitas iniciar sesión con una cuenta autorizada.`
            : `Tu rol (${ROLE_LABELS[user.role]}) no permite ${action}. Pide acceso a un administrador.`}
        </p>
      </Modal.Body>
      <Modal.Footer className="bg-light">
        <button type="button" className="btn btn-secondary" onClick={onHide}>
          {isGuest ? 'Ahora no' : 'Cerrar'}
        </button>
        {isGuest && (
          <Link
            to="/login"
            state={{ from: location }}
            className="btn text-white fw-bold"
            style={{ backgroundColor: '#1E0A3C' }}
          >
            Iniciar sesión
          </Link>
        )}
      </Modal.Footer>
    </Modal>
  );
}
