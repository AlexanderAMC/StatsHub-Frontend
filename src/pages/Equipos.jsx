import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import RestrictedActionModal from '../components/RestrictedActionModal';
import TeamModal from '../components/TeamModal';
import TeamLogo, { RegistrationBadge } from '../components/TeamLogo';
import TransferModal from '../components/TransferModal';
import { PERMISSIONS } from '../data/users';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';

export default function Equipos() {
  const { tournaments, teams, players, addTeam, updateTeam, removeTeam, transferPlayer, teamName } = useData();
  const { can } = useAuth();
  const canManage = can(PERMISSIONS.MANAGE_TEAMS);
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = searchParams.get('torneo') ?? 'todos';

  const [modal, setModal] = useState(null); // { team } · team null = crear
  const [placing, setPlacing] = useState(null); // jugador sin equipo
  const [showRestricted, setShowRestricted] = useState(false);

  const guarded = (action) => () => (canManage ? action() : setShowRestricted(true));
  const visible = teams.filter((t) => filter === 'todos' || String(t.tournamentId) === filter);
  const freeAgents = players.filter((p) => p.teamId === null);
  const tournamentName = (id) => tournaments.find((t) => t.id === id)?.name ?? 'Sin torneo';

  const handleSave = async (data) => {
    const result = modal.team ? await updateTeam(modal.team.id, data) : await addTeam(data);
    if (result.ok) setModal(null);
    else window.alert(result.error);
  };

  const handleDelete = async (team) => {
    if (!window.confirm(`¿Eliminar el equipo "${team.name}"? Sus jugadores quedarán sin equipo.`)) return;
    const result = await removeTeam(team.id);
    if (!result.ok) window.alert(result.error);
  };

  return (
    <div className="d-flex flex-column gap-4">
      <div className="card border-0 shadow-sm rounded-3 p-3 p-md-4 bg-white">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div>
            <h2 className="h4 fw-bold m-0" style={{ color: '#1E0A3C' }}>Equipos y jugadores</h2>
            <p className="text-muted small mb-0">Inscribe equipos en los torneos y administra sus planteles.</p>
          </div>
          <div className="d-flex flex-wrap gap-2">
            <select className="form-select form-select-sm w-auto" aria-label="Filtrar por torneo" value={filter} onChange={(e) => setSearchParams(e.target.value === 'todos' ? {} : { torneo: e.target.value })}>
              <option value="todos">Todos los torneos</option>
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            {canManage && (<button type="button" onClick={guarded(() => setModal({ team: null }))} className="btn text-white fw-bold d-flex align-items-center gap-2" style={{ backgroundColor: '#1E0A3C' }}>
              <Plus size={18} /> Nuevo equipo
            </button>)}
          </div>
        </div>

        {visible.length === 0 ? (
          <EmptyState title="No hay equipos">Inscribe el primer equipo del torneo.</EmptyState>
        ) : (
          <div className="row g-3">
            {visible.map((team) => (
              <div key={team.id} className="col-12 col-md-6 col-xl-4">
                <div className="border rounded-3 p-3 h-100 d-flex flex-column gap-2" style={{ borderTop: '4px solid #F59E0B' }}>
                  <div className="d-flex align-items-center gap-2">
                    <TeamLogo team={team} size={40} />
                    <Link to={`/equipos/${team.id}`} className="h5 fw-bold mb-0 text-decoration-none" style={{ color: '#1E0A3C' }}>{team.name}</Link>
                  </div>
                  <span className="small text-muted d-flex align-items-center gap-2">
                    {tournamentName(team.tournamentId)}
                    {team.registration && <RegistrationBadge status={team.registration} />}
                  </span>
                  <span className="small text-dark">Entrenador: {team.coach || 'Sin asignar'}</span>
                  <span className="small text-dark">{players.filter((p) => p.teamId === team.id).length} jugadores</span>
                  <div className="d-flex flex-wrap gap-2 mt-auto pt-2">
                    <Link to={`/equipos/${team.id}`} className="btn btn-sm text-white" style={{ backgroundColor: '#1E0A3C' }}>Ver plantel</Link>
                    {canManage && (<button type="button" className="btn btn-sm btn-outline-dark" onClick={guarded(() => setModal({ team }))} aria-label={`Editar ${team.name}`}>
                      <Pencil size={14} />
                    </button>)}
                    {canManage && (<button type="button" className="btn btn-sm btn-outline-danger" onClick={guarded(() => handleDelete(team))} aria-label={`Eliminar ${team.name}`}>
                      <Trash2 size={14} />
                    </button>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {freeAgents.length > 0 && (
        <div className="card border-0 shadow-sm rounded-3 p-3 p-md-4 bg-white">
          <h2 className="h5 fw-bold mb-3" style={{ color: '#1E0A3C' }}>Jugadores sin equipo</h2>
          <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
            {freeAgents.map((p) => (
              <li key={p.id} className="d-flex align-items-center justify-content-between gap-2 border-bottom pb-2">
                <Link to={`/jugadores/${p.id}`} className="fw-semibold text-decoration-none">{p.name} <span className="text-muted small fw-normal">({p.position})</span></Link>
                {canManage && (<button type="button" className="btn btn-sm btn-outline-dark" onClick={guarded(() => setPlacing(p))}>
                   Asignar a un equipo
                </button>)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {showRestricted && <RestrictedActionModal show onHide={() => setShowRestricted(false)} action="crear, editar o eliminar equipos" />}
      {modal && (
        <TeamModal
          key={modal.team?.id ?? 'nuevo'}
          team={modal.team}
          tournaments={tournaments}
          teams={teams}
          defaultTournamentId={filter === 'todos' ? undefined : Number(filter)}
          onSave={handleSave}
          onHide={() => setModal(null)}
        />
      )}
      {placing && (
        <TransferModal
          player={placing}
          teams={teams}
          teamName={teamName}
          onConfirm={async (toTeamId) => {
            const result = await transferPlayer(placing.id, toTeamId);
            if (result.ok) setPlacing(null);
            else window.alert(result.error);
          }}
          onHide={() => setPlacing(null)}
        />
      )}
    </div>
  );
}
