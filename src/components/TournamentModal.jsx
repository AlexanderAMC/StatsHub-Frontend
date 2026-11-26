import { useState } from 'react';
import { Form } from 'react-bootstrap';
import FormModal, { Field } from './FormModal';
import { SPORTS, SPORT_LABELS, TOURNAMENT_STATUSES } from '../data/constants';

const MAX_TEAMS = 64;

function validate(values, existingNames) {
  const errors = {};
  const name = values.name.trim();
  const teams = Number(values.teams);

  if (!name) errors.name = 'Ingresa el nombre del torneo.';
  else if (existingNames.some((n) => n.toLowerCase() === name.toLowerCase())) errors.name = 'Ya existe un torneo con ese nombre.';
  if (!values.category) errors.category = 'Elige una categoría.';
  if (!Number.isInteger(teams) || teams < 2 || teams > MAX_TEAMS) errors.teams = `Ingresa un número entre 2 y ${MAX_TEAMS}.`;
  if (!values.startDate) errors.startDate = 'Indica la fecha de inicio.';
  if (!values.endDate) errors.endDate = 'Indica la fecha de término.';
  else if (values.startDate && values.endDate < values.startDate) errors.endDate = 'Debe ser posterior al inicio.';
  return errors;
}

// Se monta solo cuando está abierto: cada apertura parte con el formulario limpio.
export default function TournamentModal({ tournament, existingNames, categories, onSave, onHide, sportLocked = false }) {
  const isEditing = Boolean(tournament);
  const [values, setValues] = useState({
    name: tournament?.name ?? '',
    sport: tournament?.sport ?? SPORTS.BASKETBALL,
    category: tournament?.category ?? categories[0] ?? '',
    teams: tournament?.teams ?? 10,
    status: tournament?.status ?? 'Planificado',
    startDate: tournament?.startDate ?? '',
    endDate: tournament?.endDate ?? '',
  });
  const [errors, setErrors] = useState({});

  const setField = (field) => (e) => setValues((prev) => ({ ...prev, [field]: e.target.value }));
  const categoryOptions = [...new Set([...categories, values.category])].filter(Boolean);

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = validate(values, existingNames);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    onSave({
      name: values.name.trim(),
      sport: values.sport,
      category: values.category,
      teams: Number(values.teams),
      status: values.status,
      startDate: values.startDate,
      endDate: values.endDate,
      season: values.startDate.slice(0, 4),
    });
  };

  return (
    <FormModal
      title={isEditing ? 'Editar torneo' : 'Crear nuevo torneo'}
      onHide={onHide}
      onSubmit={handleSubmit}
      submitLabel={isEditing ? 'Guardar cambios' : 'Guardar torneo'}
    >
      <Field id="torneo-nombre" label="Nombre del torneo" error={errors.name}>
        <Form.Control type="text" placeholder="Ej: Copa Verano 2026" value={values.name} onChange={setField('name')} isInvalid={Boolean(errors.name)} autoFocus />
      </Field>

      <Field id="torneo-deporte" label="Deporte" hint={sportLocked ? 'El torneo ya tiene partidos: el deporte no se puede cambiar.' : 'Define el acta, la tabla y las estadísticas del torneo.'}>
        <div className="d-flex gap-2" role="radiogroup" aria-label="Deporte">
          {[SPORTS.BASKETBALL, SPORTS.FOOTBALL].map((sport) => (
            <button
              key={sport} type="button" role="radio" aria-checked={values.sport === sport} disabled={sportLocked}
              className={`btn flex-fill fw-semibold ${values.sport === sport ? 'btn-dark' : 'btn-outline-dark'}`}
              onClick={() => setValues((prev) => ({ ...prev, sport }))}
            >
              {sport === SPORTS.BASKETBALL ? '🏀' : '⚽'} {SPORT_LABELS[sport]}
            </button>
          ))}
        </div>
      </Field>

      <div className="row g-3">
        <div className="col-12 col-sm-6">
          <Field id="torneo-categoria" label="Categoría" error={errors.category}>
            <Form.Select value={values.category} onChange={setField('category')} isInvalid={Boolean(errors.category)}>
              {categoryOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Form.Select>
          </Field>
        </div>
        <div className="col-12 col-sm-6">
          <Field id="torneo-estado" label="Estado">
            <Form.Select value={values.status} onChange={setField('status')}>
              {TOURNAMENT_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Form.Select>
          </Field>
        </div>
        <div className="col-12 col-sm-4">
          <Field id="torneo-equipos" label="Cupos de equipos" error={errors.teams}>
            <Form.Control type="number" min="2" max={MAX_TEAMS} value={values.teams} onChange={setField('teams')} isInvalid={Boolean(errors.teams)} />
          </Field>
        </div>
        <div className="col-6 col-sm-4">
          <Field id="torneo-inicio" label="Inicio" error={errors.startDate}>
            <Form.Control type="date" value={values.startDate} onChange={setField('startDate')} isInvalid={Boolean(errors.startDate)} />
          </Field>
        </div>
        <div className="col-6 col-sm-4">
          <Field id="torneo-fin" label="Término" error={errors.endDate}>
            <Form.Control type="date" value={values.endDate} onChange={setField('endDate')} isInvalid={Boolean(errors.endDate)} />
          </Field>
        </div>
      </div>
    </FormModal>
  );
}
