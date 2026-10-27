import { Form, Modal } from 'react-bootstrap';
import AppModal from './AppModal';

export function Field({ id, label, error, hint, className = '', children }) {
  return (
    <Form.Group controlId={id} className={className}>
      <Form.Label className="fw-semibold text-dark mb-1">{label}</Form.Label>
      {children}
      {hint && !error && <div className="form-text">{hint}</div>}
      {error && <div className="invalid-feedback d-block">{error}</div>}
    </Form.Group>
  );
}

export default function FormModal({ title, icon, size, onHide, onSubmit, submitLabel = 'Guardar', submitDisabled = false, children }) {
  return (
    <AppModal title={title} icon={icon} size={size} onHide={onHide}>
      <Form onSubmit={onSubmit} noValidate>
        <Modal.Body className="p-4 d-flex flex-column gap-3">{children}</Modal.Body>
        <Modal.Footer className="bg-light">
          <button type="button" className="btn btn-secondary" onClick={onHide}>
            Cancelar
          </button>
          <button type="submit" className="btn text-white fw-bold" style={{ backgroundColor: '#1E0A3C' }} disabled={submitDisabled}>
            {submitLabel}
          </button>
        </Modal.Footer>
      </Form>
    </AppModal>
  );
}
