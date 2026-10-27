import { useState } from 'react';
import { Form, Modal } from 'react-bootstrap';
import { TOURNAMENT_STATUSES } from '../data/constants';

const MAX_TEAMS = 64;

function validate(values, existingNames) {
  const errors = {};
  const name = values.name.trim();
  const teams = Number(values.teams);

  if (!name) errors.name = 'Ingresa el nombre del torneo.';
  else if (existingNames.some((n) => n.toLowerCase() === name.toLowerCase())) {
    errors.name = 'Ya existe un torneo con ese nombre.';
  }

  if (!values.category.trim()) errors.category = 'Ingresa la categoría.';

  if (!Number.isInteger(teams) || teams < 2 || teams > MAX_TEAMS) {
    errors.teams = `Ingresa un número de equipos entre 2 y ${MAX_TEAMS}.`;
  }

  return errors;
}

// Se monta solo cuando está abierto: cada apertura parte con el formulario limpio.
export default function TournamentModal({ tournament, existingNames, categories, onSave, onHide }) {
  const isEditing = Boolean(tournament);
  const [values, setValues] = useState({
    name: tournament?.name ?? '',
    category: tournament?.category ?? '',
    teams: tournament?.teams ?? 10,
    status: tournament?.status ?? 'Planificado',
  });
  const [errors, setErrors] = useState({});

  const setField = (field) => (e) => setValues((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = validate(values, existingNames);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    onSave({
      name: values.name.trim(),
      category: values.category.trim(),
      teams: Number(values.teams),
      status: values.status,
    });
  };

  return (
    <Modal show onHide={onHide} centered>
      <Modal.Header closeButton closeVariant="white" className="text-white border-0" style={{ backgroundColor: '#1E0A3C' }}>
        <Modal.Title as="h5" className="fw-bold">
          {isEditing ? 'Editar torneo' : 'Crear nuevo torneo'}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit} noValidate>
        <Modal.Body className="p-4 d-flex flex-column gap-3">
          <Form.Group controlId="torneo-nombre">
            <Form.Label className="fw-bold text-dark">Nombre del torneo</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej: Copa Verano 2026"
              value={values.name}
              onChange={setField('name')}
              isInvalid={Boolean(errors.name)}
              autoFocus
            />
            <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="torneo-categoria">
            <Form.Label className="fw-bold text-dark">Categoría</Form.Label>
            <Form.Control
              type="text"
              list="categorias-torneo"
              placeholder="Ej: Fútbol 11 Varones"
              value={values.category}
              onChange={setField('category')}
              isInvalid={Boolean(errors.category)}
            />
            <datalist id="categorias-torneo">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            <Form.Control.Feedback type="invalid">{errors.category}</Form.Control.Feedback>
          </Form.Group>

          <div className="row g-3">
            <div className="col-6">
              <Form.Group controlId="torneo-equipos">
                <Form.Label className="fw-bold text-dark">Cantidad de equipos</Form.Label>
                <Form.Control
                  type="number"
                  min="2"
                  max={MAX_TEAMS}
                  value={values.teams}
                  onChange={setField('teams')}
                  isInvalid={Boolean(errors.teams)}
                />
                <Form.Control.Feedback type="invalid">{errors.teams}</Form.Control.Feedback>
              </Form.Group>
            </div>
            <div className="col-6">
              <Form.Group controlId="torneo-estado">
                <Form.Label className="fw-bold text-dark">Estado</Form.Label>
                <Form.Select value={values.status} onChange={setField('status')}>
                  {TOURNAMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer className="bg-light">
          <button type="button" className="btn btn-secondary" onClick={onHide}>
            Cancelar
          </button>
          <button type="submit" className="btn text-white fw-bold" style={{ backgroundColor: '#1E0A3C' }}>
            {isEditing ? 'Guardar cambios' : 'Guardar torneo'}
          </button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
