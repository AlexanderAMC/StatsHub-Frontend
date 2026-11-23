import { useState } from 'react';
import { Form } from 'react-bootstrap';
import FormModal, { Field } from './FormModal';
import { POSITIONS } from '../data/constants';

export default function PlayerModal({ player, teamPlayers, onSave, onHide }) {
  const isEditing = Boolean(player);
  const [values, setValues] = useState({
    name: player?.name ?? '',
    number: player?.number ?? '',
    position: POSITIONS.includes(player?.position) ? player.position : POSITIONS[0],
    birthDate: player?.birthDate ?? '',
    rut: player?.rut ?? '',
  });
  const today = new Date().toISOString().slice(0, 10);
  const [errors, setErrors] = useState({});

  const setField = (field) => (e) => setValues((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = {};
    const name = values.name.trim();
    const number = Number(values.number);
    if (!name) found.name = 'Ingresa el nombre del jugador.';
    if (!Number.isInteger(number) || number < 1 || number > 99) found.number = 'Ingresa un número entre 1 y 99.';
    else if (teamPlayers.some((p) => p.id !== player?.id && p.number === number)) found.number = 'Ese número ya está en el plantel.';
    if (values.birthDate && values.birthDate > today) found.birthDate = 'La fecha no puede ser futura.';
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    onSave({ name, number, position: values.position, birthDate: values.birthDate, rut: values.rut.trim() });
  };

  return (
    <FormModal title={isEditing ? 'Editar jugador' : 'Nuevo jugador'} onHide={onHide} onSubmit={handleSubmit} submitLabel={isEditing ? 'Guardar cambios' : 'Guardar jugador'}>
      <Field id="jugador-nombre" label="Nombre completo" error={errors.name}>
        <Form.Control type="text" value={values.name} onChange={setField('name')} isInvalid={Boolean(errors.name)} autoFocus />
      </Field>
      <div className="row g-3">
        <div className="col-6">
          <Field id="jugador-numero" label="Número de camiseta" error={errors.number}>
            <Form.Control type="number" min="1" max="99" value={values.number} onChange={setField('number')} isInvalid={Boolean(errors.number)} />
          </Field>
        </div>
        <div className="col-6">
          <Field id="jugador-posicion" label="Posición">
            <Form.Select value={values.position} onChange={setField('position')}>
              {POSITIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </Form.Select>
          </Field>
        </div>
        <div className="col-6">
          {/* RF-16: con la fecha de nacimiento el servidor valida la edad según la categoría del torneo. */}
          <Field id="jugador-nacimiento" label="Fecha de nacimiento" error={errors.birthDate}>
            <Form.Control type="date" max={today} value={values.birthDate} onChange={setField('birthDate')} isInvalid={Boolean(errors.birthDate)} />
          </Field>
        </div>
        <div className="col-6">
          <Field id="jugador-rut" label="RUT (opcional)">
            <Form.Control type="text" placeholder="12345678-9" value={values.rut} onChange={setField('rut')} />
          </Field>
        </div>
      </div>
    </FormModal>
  );
}
