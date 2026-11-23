import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowLeftRight, CreditCard, ImageUp, Lock, Pencil, Plus, Trash2 } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import TeamLogo, { RegistrationBadge } from '../components/TeamLogo';
import ExportButtons from '../components/ExportButtons';
import PlayerModal from '../components/PlayerModal';
import RestrictedActionModal from '../components/RestrictedActionModal';
import TeamModal from '../components/TeamModal';
import TransferModal from '../components/TransferModal';
import { MATCH_STATUS } from '../data/constants';
import { PERMISSIONS } from '../data/users';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { downloadCsv } from '../utils/csv';
import { computePlayerStats, computeStandings, teamForm } from '../utils/stats';

const FORM_BADGE = { G: 'bg-success', E: 'bg-secondary', P: 'bg-danger' };

export default function EquipoDetalle() {
  const { teamId } = useParams();
  const {
    tournaments, teams, players, matches, events, addPlayer, updatePlayer, removePlayer, transferPlayer, updateTeam,
    uploadTeamLogo, requestPayment, teamName,
  } = useData();
  const { can, canManagePlayers } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [paying, setPaying] = useState(false);

  const [playerModal, setPlayerModal] = useState(null); // { player } · player null = nuevo
  const [transferring, setTransferring] = useState(null);
  const [teamModal, setTeamModal] = useState(false);
  const [restricted, setRestricted] = useState('');

  const id = Number(teamId);
  const team = teams.find((t) => t.id === id);

  if (!team) {
    return (
      <div className="card border-0 shadow-sm rounded-3 bg-white">
        <EmptyState title="No encontramos ese equipo">
          Puede haber sido eliminado. <Link to="/equipos">Volver a equipos</Link>
        </EmptyState>
      </div>
    );
  }

  const canEditPlayers = canManagePlayers(id);
  const canEditTeam = can(PERMISSIONS.MANAGE_TEAMS);
  const tournament = tournaments.find((t) => t.id === team.tournamentId);
  const roster = players.filter((p) => p.teamId === id).sort((a, b) => a.number - b.number);
  const stats = computePlayerStats(players, matches, events);

  const finished = matches.filter((m) => m.tournamentId === team.tournamentId && m.status === MATCH_STATUS.FINISHED);
  const standings = computeStandings(teams.filter((t) => t.tournamentId === team.tournamentId), finished);
  const position = standings.findIndex((r) => r.teamId === id);
  const row = standings[position];
  const form = teamForm(id, finished);

  const guard = (allowed, action, text) => () => (allowed ? action() : setRestricted(text));

  const handleSavePlayer = async (data) => {
    const result = playerModal.player ? await updatePlayer(playerModal.player.id, data) : await addPlayer({ ...data, teamId: id });
    if (result.ok) setPlayerModal(null);
    else window.alert(result.error);
  };

  const handleRemovePlayer = async (player) => {
    if (!window.confirm(`¿Eliminar a ${player.name} del plantel?`)) return;
    const result = await removePlayer(player.id);
    if (!result.ok) window.alert(result.error);
  };

  // RF-13: el backend convierte el escudo a WebP 512x512.
  const handleLogo = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return window.alert('La imagen no puede superar 2 MB.');
    setUploading(true);
    const result = await uploadTeamLogo(id, file);
    setUploading(false);
    if (!result.ok) window.alert(result.error);
  };

  // RF-38 / RF-39: genera el cobro de inscripción y redirige a la pasarela Flow.
  const handlePayment = async () => {
    if (!tournament) return;
    const fee = tournament.fee ? ` por $${Number(tournament.fee).toLocaleString('es-CL')}` : '';
    if (!window.confirm(`¿Generar el cobro de inscripción de ${team.name} en ${tournament.name}${fee}? Serás redirigido a Flow para pagar.`)) return;
    setPaying(true);
    const result = await requestPayment(id, tournament.id);
    setPaying(false);
    if (result.ok) window.location.assign(result.data.url);
    else window.alert(result.error);
  };

  const exportCsv = () =>
    downloadCsv(
      `plantel-${team.name.toLowerCase().replace(/\s+/g, '-')}.csv`,
      ['Número', 'Jugador', 'Posición', 'Partidos', 'Goles', 'Asistencias', 'Amarillas', 'Rojas'],
      roster.map((p) => {
        const s = stats.get(p.id);
        return [p.number, p.name, p.position, s.pj, s.goles, s.asistencias, s.amarillas, s.rojas];
      }),
    );

  return (
    <div className="d-flex flex-column gap-4">
      <div className="card border-0 shadow-sm rounded-3 p-3 p-md-4 bg-white">
        <Link to="/equipos" className="small text-decoration-none d-inline-flex align-items-center gap-1 mb-3">
          <ArrowLeft size={14} /> Equipos
        </Link>
        <div className="d-flex flex-wrap align-items-start justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <TeamLogo team={team} size={64} />
            <div>
              <h2 className="h3 fw-bold mb-1" style={{ color: '#1E0A3C' }}>{team.name}</h2>
              <p className="text-muted mb-0 d-flex flex-wrap align-items-center gap-2">
                {tournament?.name ?? 'Sin torneo'}. Entrenador: {team.coach || 'sin asignar'}
                {team.registration && <RegistrationBadge status={team.registration} />}
              </p>
            </div>
          </div>
          <div className="d-flex flex-wrap gap-2 no-print">
            {canEditTeam && (
              <label className={`btn btn-outline-dark d-flex align-items-center gap-2 mb-0 ${uploading ? 'disabled' : ''}`}>
                <ImageUp size={16} /> {uploading ? 'Subiendo…' : 'Subir escudo'}
                <input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" className="d-none" onChange={handleLogo} disabled={uploading} />
              </label>
            )}
            {canEditTeam && tournament && team.registration !== 'INSCRITO' && (
              <button type="button" className="btn btn-success d-flex align-items-center gap-2" onClick={handlePayment} disabled={paying}>
                <CreditCard size={16} /> {paying ? 'Generando…' : 'Generar cobro'}
              </button>
            )}
            <button type="button" className="btn btn-outline-dark d-flex align-items-center gap-2" onClick={guard(canEditTeam, () => setTeamModal(true), 'editar equipos')}>
              {canEditTeam ? <Pencil size={16} /> : <Lock size={16} />} Editar equipo
            </button>
            <button type="button" className="btn text-white fw-bold d-flex align-items-center gap-2" style={{ backgroundColor: '#1E0A3C' }} onClick={guard(canEditPlayers, () => setPlayerModal({ player: null }), 'agregar jugadores a este equipo')}>
              {canEditPlayers ? <Plus size={16} /> : <Lock size={16} />} Agregar jugador
            </button>
          </div>
        </div>

        <div className="row g-3 mt-2">
          {[
            ['Posición', row ? `${position + 1}°` : '-'],
            ['Partidos', row?.pj ?? 0],
            ['Puntos', row?.pts ?? 0],
            ['Goles a favor / en contra', row ? `${row.gf} / ${row.gc}` : '-'],
          ].map(([label, value]) => (
            <div key={label} className="col-6 col-md-3">
              <div className="p-3 bg-light rounded-3 border h-100">
                <span className="small text-muted d-block">{label}</span>
                <span className="h4 fw-bold text-dark mb-0">{value}</span>
              </div>
            </div>
          ))}
        </div>
        {form.length > 0 && (
          <p className="mt-3 mb-0 small text-muted">
            Últimos resultados:{' '}
            {form.map((r, i) => (
              <span key={i} className={`badge ${FORM_BADGE[r]} me-1`}>{r}</span>
            ))}
          </p>
        )}
      </div>

      <div className="card border-0 shadow-sm rounded-3 p-3 p-md-4 bg-white">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
          <h3 className="h5 fw-bold m-0" style={{ color: '#1E0A3C' }}>Plantel ({roster.length})</h3>
          <ExportButtons onCsv={exportCsv} />
        </div>

        {roster.length === 0 ? (
          <EmptyState title="Plantel vacío">Agrega al primer jugador del equipo.</EmptyState>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle border">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Jugador</th>
                  <th>Posición</th>
                  <th className="text-center" title="Partidos jugados">PJ</th>
                  <th className="text-center">Goles</th>
                  <th className="text-center">Asist.</th>
                  <th className="text-center" title="Tarjetas amarillas">TA</th>
                  <th className="text-center" title="Tarjetas rojas">TR</th>
                  <th className="text-end no-print">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((p) => {
                  const s = stats.get(p.id);
                  return (
                    <tr key={p.id}>
                      <td className="fw-bold">{p.number}</td>
                      <td><Link to={`/jugadores/${p.id}`} className="fw-semibold text-decoration-none">{p.name}</Link></td>
                      <td className="text-secondary">{p.position}</td>
                      <td className="text-center">{s.pj}</td>
                      <td className="text-center fw-semibold">{s.goles}</td>
                      <td className="text-center">{s.asistencias}</td>
                      <td className="text-center">{s.amarillas}</td>
                      <td className="text-center">{s.rojas}</td>
                      <td className="text-end text-nowrap no-print">
                        <button type="button" className="btn btn-sm btn-outline-dark me-1" onClick={guard(canEditPlayers, () => setPlayerModal({ player: p }), 'editar jugadores de este equipo')} aria-label={`Editar ${p.name}`}>
                          {canEditPlayers ? <Pencil size={14} /> : <Lock size={14} />}
                        </button>
                        <button type="button" className="btn btn-sm btn-outline-dark me-1" onClick={guard(canEditTeam, () => setTransferring(p), 'transferir jugadores')} aria-label={`Transferir a ${p.name}`}>
                          {canEditTeam ? <ArrowLeftRight size={14} /> : <Lock size={14} />}
                        </button>
                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={guard(canEditPlayers, () => handleRemovePlayer(p), 'eliminar jugadores de este equipo')} aria-label={`Eliminar a ${p.name}`}>
                          {canEditPlayers ? <Trash2 size={14} /> : <Lock size={14} />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {restricted && <RestrictedActionModal show onHide={() => setRestricted('')} action={restricted} />}
      {teamModal && (
        <TeamModal team={team} tournaments={tournaments} teams={teams} onSave={async (data) => { const r = await updateTeam(id, data); if (r.ok) setTeamModal(false); else window.alert(r.error); }} onHide={() => setTeamModal(false)} />
      )}
      {playerModal && (
        <PlayerModal key={playerModal.player?.id ?? 'nuevo'} player={playerModal.player} teamPlayers={roster} onSave={handleSavePlayer} onHide={() => setPlayerModal(null)} />
      )}
      {transferring && (
        <TransferModal
          player={transferring}
          teams={teams}
          teamName={teamName}
          onConfirm={async (toTeamId) => { const r = await transferPlayer(transferring.id, toTeamId); if (r.ok) setTransferring(null); else window.alert(r.error); }}
          onHide={() => setTransferring(null)}
        />
      )}
    </div>
  );
}
