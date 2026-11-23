import { useState } from 'react';
import { Form } from 'react-bootstrap';
import FormModal, { Field } from './FormModal';
import { scheduleConflict } from '../utils/schedule';

// Programa un partido nuevo o edita uno programado (el torneo no se cambia al editar).
export default function MatchFormModal({ match, tournaments, teams, matches, referees, statsKeepers = [], venues, defaultTournamentId, onSave, onHide }) {
  const isEditing = Boolean(match);
  const [values, setValues] = useState({
    tournamentId: String(match?.tournamentId ?? defaultTournamentId ?? tournaments[0]?.id ?? ''),
    round: match?.round ?? 1,
    homeId: match ? String(match.homeId) : '',
    awayId: match ? String(match.awayId) : '',
    date: match?.date ?? '',
    time: match?.time ?? '15:00',
    venue: match?.venue ?? venues[0],
    refereeId: match?.refereeId ? String(match.refereeId) : '',
    statsKeeperId: match?.statsKeeperId ?? '',
  });
  const [errors, setErrors] = useState({});

  const setField = (field) => (e) => setValues((prev) => ({ ...prev, [field]: e.target.value }));
  const changeTournament = (e) => setValues((prev) => ({ ...prev, tournamentId: e.target.value, homeId: '', awayId: '' }));
  const tournamentTeams = teams.filter((t) => t.tournamentId === Number(values.tournamentId));

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = {};
    const homeId = Number(values.homeId);
    const awayId = Number(values.awayId);
    const refereeId = values.refereeId || null; // id de usuario (UUID)
    const round = Number(values.round);

    if (!homeId) found.homeId = 'Elige el equipo local.';
    if (!awayId) found.awayId = 'Elige el equipo visita.';
    if (homeId && awayId && homeId === awayId) found.awayId = 'Los equipos deben ser distintos.';
    if (!Number.isInteger(round) || round < 1) found.round = 'Ingresa una fecha válida.';
    if (!values.date) found.date = 'Indica la fecha del partido.';
    if (!values.time) found.time = 'Indica la hora.';
    if (Object.keys(found).length === 0) {
      const conflict = scheduleConflict(matches, { homeId, awayId, refereeId, date: values.date, time: values.time }, match?.id);
      if (conflict) found.date = conflict;
    }
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    onSave({
      tournamentId: Number(values.tournamentId), round, homeId, awayId, date: values.date, time: values.time,
      venue: values.venue, refereeId, statsKeeperId: values.statsKeeperId || null,
    });
  };

  return (
    <FormModal title={isEditing ? 'Editar partido' : 'Programar partido'} size="lg" onHide={onHide} onSubmit={handleSubmit} submitLabel={isEditing ? 'Guardar cambios' : 'Programar partido'}>
      <div className="row g-3">
        <div className="col-12 col-sm-8">
          <Field id="partido-torneo" label="Torneo">
            <Form.Select value={values.tournamentId} onChange={changeTournament} disabled={isEditing}>
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </Form.Select>
          </Field>
        </div>
        <div className="col-12 col-sm-4">
          <Field id="partido-fecha-nro" label="Jornada" error={errors.round}>
            <Form.Control type="number" min="1" value={values.round} onChange={setField('round')} isInvalid={Boolean(errors.round)} />
          </Field>
        </div>
        <div className="col-12 col-sm-6">
          <Field id="partido-local" label="Local" error={errors.homeId}>
            <Form.Select value={values.homeId} onChange={setField('homeId')} isInvalid={Boolean(errors.homeId)}>
              <option value="">Selecciona un equipo</option>
              {tournamentTeams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </Form.Select>
          </Field>
        </div>
        <div className="col-12 col-sm-6">
          <Field id="partido-visita" label="Visita" error={errors.awayId}>
            <Form.Select value={values.awayId} onChange={setField('awayId')} isInvalid={Boolean(errors.awayId)}>
              <option value="">Selecciona un equipo</option>
              {tournamentTeams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </Form.Select>
          </Field>
        </div>
        <div className="col-6 col-sm-4">
          <Field id="partido-dia" label="Día" error={errors.date}>
            <Form.Control type="date" value={values.date} onChange={setField('date')} isInvalid={Boolean(errors.date)} />
          </Field>
        </div>
        <div className="col-6 col-sm-4">
          <Field id="partido-hora" label="Hora" error={errors.time}>
            <Form.Control type="time" value={values.time} onChange={setField('time')} isInvalid={Boolean(errors.time)} />
          </Field>
        </div>
        <div className="col-12 col-sm-4">
          <Field id="partido-cancha" label="Cancha">
            <Form.Select value={values.venue} onChange={setField('venue')}>
              {venues.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </Form.Select>
          </Field>
        </div>
        <div className="col-12 col-sm-6">
          <Field id="partido-arbitro" label="Árbitro">
            <Form.Select value={values.refereeId} onChange={setField('refereeId')}>
              <option value="">Sin asignar</option>
              {referees.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </Form.Select>
          </Field>
        </div>
        <div className="col-12 col-sm-6">
          <Field id="partido-estadigrafo" label="Estadígrafo">
            <Form.Select value={values.statsKeeperId} onChange={setField('statsKeeperId')}>
              <option value="">Sin asignar</option>
              {statsKeepers.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </Form.Select>
          </Field>
        </div>
      </div>
    </FormModal>
  );
}
