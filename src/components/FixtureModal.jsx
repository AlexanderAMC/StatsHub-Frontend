import { useMemo, useState } from 'react';
import { Form } from 'react-bootstrap';
import { CalendarPlus } from 'lucide-react';
import FormModal, { Field } from './FormModal';
import { buildFixture } from '../utils/schedule';

// Genera el calendario "todos contra todos": una fecha por semana con los partidos que faltan.
export default function FixtureModal({ tournaments, teams, matches, referees, venues, onGenerate, onHide }) {
  const eligible = tournaments.filter((t) => teams.filter((team) => team.tournamentId === t.id).length >= 2);
  const [tournamentId, setTournamentId] = useState(String(eligible[0]?.id ?? ''));
  const [startDate, setStartDate] = useState('');
  const [venue, setVenue] = useState(venues[0]);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(null);

  const preview = useMemo(() => {
    if (!tournamentId || !startDate) return null;
    const id = Number(tournamentId);
    const tournamentMatches = matches.filter((m) => m.tournamentId === id);
    const fixture = buildFixture({
      teams: teams.filter((t) => t.tournamentId === id),
      matches: tournamentMatches,
      startDate,
      venue,
      referees,
      startRound: Math.max(0, ...tournamentMatches.map((m) => m.round)),
    });
    return { matches: fixture.length, rounds: new Set(fixture.map((f) => f.round)).size };
  }, [tournamentId, startDate, venue, matches, teams, referees]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!tournamentId) {
      setError('No hay torneos con al menos 2 equipos.');
      return;
    }
    if (!startDate) {
      setError('Indica la fecha de la primera jornada.');
      return;
    }
    setError('');
    setCreated(onGenerate(Number(tournamentId), startDate, venue));
  };

  return (
    <FormModal
      title="Generar fixture"
      icon={CalendarPlus}
      onHide={onHide}
      onSubmit={handleSubmit}
      submitLabel="Generar partidos"
      submitDisabled={created !== null}
    >
      <Field id="fixture-torneo" label="Torneo">
        <Form.Select value={tournamentId} onChange={(e) => setTournamentId(e.target.value)}>
          {eligible.length === 0 && <option value="">Sin torneos con equipos</option>}
          {eligible.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </Form.Select>
      </Field>
      <div className="row g-3">
        <div className="col-12 col-sm-6">
          <Field id="fixture-inicio" label="Primera jornada" hint="Las siguientes se programan cada 7 días.">
            <Form.Control type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </Field>
        </div>
        <div className="col-12 col-sm-6">
          <Field id="fixture-cancha" label="Cancha">
            <Form.Select value={venue} onChange={(e) => setVenue(e.target.value)}>
              {venues.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </Form.Select>
          </Field>
        </div>
      </div>

      {error && <div className="alert alert-danger py-2 small mb-0" role="alert">{error}</div>}
      {created === null && preview && (
        <div className="alert alert-light border py-2 small mb-0">
          {preview.matches === 0
            ? 'Todos los equipos ya se enfrentan entre sí: no hay partidos por generar.'
            : `Se crearán ${preview.matches} partidos en ${preview.rounds} jornadas, con árbitros asignados en rotación.`}
        </div>
      )}
      {created !== null && (
        <div className="alert alert-success py-2 small mb-0" role="status">
          {created === 0 ? 'No había partidos por generar.' : `Listo: se crearon ${created} partidos. Revísalos en el calendario.`}
        </div>
      )}
    </FormModal>
  );
}
