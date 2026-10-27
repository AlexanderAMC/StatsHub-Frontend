import { Modal } from 'react-bootstrap';
import { User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ROLE_ABILITIES, ROLE_LABELS } from '../data/users';

export default function ProfileModal({ show, onHide }) {
  const { user } = useAuth();
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