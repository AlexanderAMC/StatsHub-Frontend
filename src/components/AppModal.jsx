import { Modal } from 'react-bootstrap';

export default function AppModal({ title, icon: Icon, size, onHide, children }) {
  return (
    <Modal show onHide={onHide} centered size={size}>
      <Modal.Header closeButton closeVariant="white" className="text-white border-0" style={{ backgroundColor: '#1E0A3C' }}>
        <Modal.Title as="h5" className="fw-bold d-flex align-items-center gap-2">
          {Icon && <Icon size={20} className="text-warning" />} {title}
        </Modal.Title>
      </Modal.Header>
      {children}
    </Modal>
  );
}
