import { useState } from 'react';
import { Form } from 'react-bootstrap';
import FormModal, { Field } from './FormModal';
import { ASSIGNABLE_ROLES, ROLE_LABELS } from '../data/users';
import { passwordProblem } from '../utils/password';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// RF-04 / CP-02: el administrador crea cuentas con rol y contraseña inicial, o edita sus datos.
export default function UserFormModal({ account, onSave, onHide }) {
  const isEditing = Boolean(account);
  const [values, setValues] = useState({
    nombre: account?.firstName ?? '',
    apellido: account?.lastName ?? '',
    correo: account?.email ?? '',
    rol: account?.role ?? 'espectador',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);
  const setField = (field) => (e) => setValues((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = {};
    if (!values.nombre.trim()) found.nombre = 'Ingresa el nombre.';
    if (!values.apellido.trim()) found.apellido = 'Ingresa el apellido.';
    if (!EMAIL_RE.test(values.correo.trim())) found.correo = 'Ingresa un correo válido.';
    if (!isEditing && passwordProblem(values.password)) found.password = passwordProblem(values.password);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    const payload = isEditing
      ? { nombre: values.nombre.trim(), apellido: values.apellido.trim(), correo: values.correo.trim() }
      : { ...values, nombre: values.nombre.trim(), apellido: values.apellido.trim(), correo: values.correo.trim() };
    const result = await onSave(payload);
    setSaving(false);
    if (!result.ok) setServerError(result.error);
  };

  return (
    <FormModal title={isEditing ? 'Editar usuario' : 'Nuevo usuario'} onHide={onHide} onSubmit={handleSubmit} submitLabel={saving ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear usuario'} submitDisabled={saving}>
      <div className="row g-3">
        <div className="col-12 col-sm-6">
          <Field id="usuario-nombre" label="Nombre" error={errors.nombre}>
            <Form.Control value={values.nombre} onChange={setField('nombre')} isInvalid={Boolean(errors.nombre)} autoFocus />
          </Field>
        </div>
        <div className="col-12 col-sm-6">
          <Field id="usuario-apellido" label="Apellido" error={errors.apellido}>
            <Form.Control value={values.apellido} onChange={setField('apellido')} isInvalid={Boolean(errors.apellido)} />
          </Field>
        </div>
      </div>
      <Field id="usuario-correo" label="Correo" error={errors.correo}>
        <Form.Control type="email" value={values.correo} onChange={setField('correo')} isInvalid={Boolean(errors.correo)} />
      </Field>
      {!isEditing && (
        <div className="row g-3">
          <div className="col-12 col-sm-6">
            <Field id="usuario-rol" label="Rol">
              <Form.Select value={values.rol} onChange={setField('rol')}>
                {ASSIGNABLE_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </Form.Select>
            </Field>
          </div>
          <div className="col-12 col-sm-6">
            <Field id="usuario-password" label="Contraseña inicial" error={errors.password}>
              <Form.Control type="password" autoComplete="new-password" value={values.password} onChange={setField('password')} isInvalid={Boolean(errors.password)} />
            </Field>
          </div>
          <p className="small text-muted mb-0">Comparte la contraseña inicial por un canal seguro y pide al usuario cambiarla desde su perfil.</p>
        </div>
      )}
      {serverError && <div className="alert alert-danger py-2 small mb-0" role="alert">{serverError}</div>}
    </FormModal>
  );
}
