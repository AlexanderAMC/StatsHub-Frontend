import { useState } from 'react';
import { Form } from 'react-bootstrap';
import FormModal, { Field } from './FormModal';

export default function TeamModal({ team, tournaments, teams, defaultTournamentId, onSave, onHide }) {
  const isEditing = Boolean(team);
  const [values, setValues] = useState({
    name: team?.name ?? '',
    tournamentId: String(team?.tournamentId ?? defaultTournamentId ?? tournaments[0]?.id ?? ''),
    coach: team?.coach === 'Sin asignar' ? '' : team?.coach ?? '',
    coachEmail: '',
  });
  const [errors, setErrors] = useState({});

  const setField = (field) => (e) => setValues((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = {};
    const name = values.name.trim();
    const tournamentId = Number(values.tournamentId);
    if (!name) found.name = 'Ingresa el nombre del equipo.';
    else if (teams.some((t) => t.id !== team?.id && t.tournamentId === tournamentId && t.name.toLowerCase() === name.toLowerCase())) {
      found.name = 'Ya existe un equipo con ese nombre en el torneo.';
    }
    if (!tournamentId) found.tournamentId = 'Elige un torneo.';
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    onSave({ name, tournamentId, coach: values.coach.trim(), coachEmail: values.coachEmail.trim() });
  };

  return (
    <FormModal title={isEditing ? 'Editar equipo' : 'Nuevo equipo'} onHide={onHide} onSubmit={handleSubmit} submitLabel={isEditing ? 'Guardar cambios' : 'Guardar equipo'}>
      <Field id="equipo-nombre" label="Nombre del equipo" error={errors.name}>
        <Form.Control type="text" value={values.name} onChange={setField('name')} isInvalid={Boolean(errors.name)} autoFocus />
      </Field>
      <Field id="equipo-torneo" label="Torneo" error={errors.tournamentId}>
        <Form.Select value={values.tournamentId} onChange={setField('tournamentId')} isInvalid={Boolean(errors.tournamentId)}>
          {tournaments.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </Form.Select>
      </Field>
      <Field id="equipo-entrenador" label="Entrenador (opcional)">
        <Form.Control type="text" value={values.coach} onChange={setField('coach')} />
      </Field>
      <Field id="equipo-entrenador-correo" label="Correo de la cuenta del entrenador (opcional)">
        <Form.Control type="email" placeholder="Le permite gestionar el plantel con el plan Pro" value={values.coachEmail} onChange={setField('coachEmail')} />
      </Field>
    </FormModal>
  );
}
