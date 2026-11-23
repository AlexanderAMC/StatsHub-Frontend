import { useState } from 'react';
import { Form } from 'react-bootstrap';
import { Building2 } from 'lucide-react';
import FormModal, { Field } from './FormModal';
import { useData } from '../hooks/useData';

// RF-07: datos públicos de la liga, recintos deportivos y costo base de inscripción.
export default function LeagueModal({ onHide }) {
  const { league, updateLeague } = useData();
  const [values, setValues] = useState({
    nombre: league?.nombre ?? '',
    descripcion: league?.descripcion ?? '',
    correo_contacto: league?.correo_contacto ?? '',
    telefono: league?.telefono ?? '',
    recintos: (league?.recintos ?? []).join('\n'),
    costo_inscripcion: league?.costo_inscripcion ?? 0,
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const setField = (field) => (e) => setValues((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const recintos = values.recintos.split('\n').map((r) => r.trim()).filter(Boolean);
    if (!values.nombre.trim()) return setError('Ingresa el nombre de la liga.');
    if (recintos.length === 0) return setError('Indica al menos un recinto deportivo.');
    setSaving(true);
    const result = await updateLeague({ ...values, recintos, costo_inscripcion: Number(values.costo_inscripcion) });
    setSaving(false);
    if (result.ok) onHide();
    else setError(result.error);
  };

  return (
    <FormModal title="Datos de la liga" icon={Building2} onHide={onHide} onSubmit={handleSubmit} submitLabel={saving ? 'Guardando…' : 'Guardar cambios'} submitDisabled={saving}>
      <Field id="liga-nombre" label="Nombre de la liga">
        <Form.Control value={values.nombre} onChange={setField('nombre')} autoFocus />
      </Field>
      <Field id="liga-descripcion" label="Descripción (opcional)">
        <Form.Control as="textarea" rows={2} value={values.descripcion} onChange={setField('descripcion')} />
      </Field>
      <div className="row g-3">
        <div className="col-12 col-sm-6">
          <Field id="liga-correo" label="Correo de contacto">
            <Form.Control type="email" value={values.correo_contacto} onChange={setField('correo_contacto')} />
          </Field>
        </div>
        <div className="col-12 col-sm-6">
          <Field id="liga-telefono" label="Teléfono">
            <Form.Control value={values.telefono} onChange={setField('telefono')} />
          </Field>
        </div>
      </div>
      <Field id="liga-recintos" label="Recintos deportivos (uno por línea)">
        <Form.Control as="textarea" rows={3} value={values.recintos} onChange={setField('recintos')} />
      </Field>
      <Field id="liga-costo" label="Costo base de inscripción (CLP)">
        <Form.Control type="number" min="0" step="1000" value={values.costo_inscripcion} onChange={setField('costo_inscripcion')} />
      </Field>
      {error && <div className="alert alert-danger py-2 small mb-0" role="alert">{error}</div>}
    </FormModal>
  );
}
