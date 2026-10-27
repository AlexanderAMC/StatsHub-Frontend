import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { Tags, Trash2 } from 'lucide-react';
import AppModal from './AppModal';
import { useData } from '../hooks/useData';

export default function CategoriesModal({ onHide }) {
  const { categories, tournaments, addCategory, removeCategory } = useData();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    const result = addCategory(name);
    if (result.ok) {
      setName('');
      setError('');
    } else setError(result.error);
  };

  const handleRemove = (category) => {
    const result = removeCategory(category);
    setError(result.ok ? '' : result.error);
  };

  return (
    <AppModal title="Categorías deportivas" icon={Tags} onHide={onHide}>
      <Modal.Body className="p-4">
        <form onSubmit={handleAdd} className="d-flex gap-2 mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Nueva categoría (ej: Senior +40)"
            aria-label="Nueva categoría"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button type="submit" className="btn text-white fw-bold flex-shrink-0" style={{ backgroundColor: '#1E0A3C' }}>
            Agregar
          </button>
        </form>
        <div role="alert">{error && <div className="alert alert-danger py-2 small">{error}</div>}</div>
        <ul className="list-group">
          {categories.map((category) => {
            const used = tournaments.filter((t) => t.category === category).length;
            return (
              <li key={category} className="list-group-item d-flex align-items-center justify-content-between gap-2">
                <span className="fw-medium text-dark">{category}</span>
                <span className="d-flex align-items-center gap-3">
                  <span className="text-muted small">{used} {used === 1 ? 'torneo' : 'torneos'}</span>
                  <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleRemove(category)} aria-label={`Eliminar ${category}`}>
                    <Trash2 size={14} />
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
      </Modal.Body>
      <Modal.Footer className="bg-light">
        <button type="button" className="btn btn-secondary" onClick={onHide}>Cerrar</button>
      </Modal.Footer>
    </AppModal>
  );
}
