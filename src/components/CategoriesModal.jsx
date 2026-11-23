import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { Tags, Trash2 } from 'lucide-react';
import AppModal from './AppModal';
import { useData } from '../hooks/useData';

export default function CategoriesModal({ onHide }) {
  const { categories, categoryList, tournaments, addCategory, removeCategory } = useData();
  const [name, setName] = useState('');
  // RF-16: rango de edad opcional, usado para validar a los jugadores inscritos.
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [error, setError] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError('Ingresa el nombre de la categoría.');
    const result = await addCategory(name.trim(), {
      minAge: minAge === '' ? null : Number(minAge),
      maxAge: maxAge === '' ? null : Number(maxAge),
    });
    if (result.ok) {
      setName('');
      setMinAge('');
      setMaxAge('');
      setError('');
    } else setError(result.error);
  };

  const handleRemove = async (category) => {
    const result = await removeCategory(category);
    setError(result.ok ? '' : result.error);
  };

  const ageLabel = (category) => {
    const c = categoryList.find((x) => x.name === category);
    if (!c || (c.minAge === null && c.maxAge === null)) return null;
    if (c.minAge !== null && c.maxAge !== null) return `${c.minAge}-${c.maxAge} años`;
    return c.minAge !== null ? `${c.minAge}+ años` : `hasta ${c.maxAge} años`;
  };

  return (
    <AppModal title="Categorías deportivas" icon={Tags} onHide={onHide}>
      <Modal.Body className="p-4">
        <form onSubmit={handleAdd} className="d-flex flex-wrap gap-2 mb-3">
          <input
            type="text"
            className="form-control flex-grow-1"
            style={{ minWidth: '180px', flexBasis: '180px' }}
            placeholder="Nueva categoría (ej: Senior +40)"
            aria-label="Nueva categoría"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input type="number" min="0" max="100" className="form-control" style={{ width: '90px' }} placeholder="Edad mín." aria-label="Edad mínima" value={minAge} onChange={(e) => setMinAge(e.target.value)} />
          <input type="number" min="0" max="100" className="form-control" style={{ width: '90px' }} placeholder="Edad máx." aria-label="Edad máxima" value={maxAge} onChange={(e) => setMaxAge(e.target.value)} />
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
                <span className="fw-medium text-dark">
                  {category}
                  {ageLabel(category) && <span className="text-muted small fw-normal ms-2">({ageLabel(category)})</span>}
                </span>
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
