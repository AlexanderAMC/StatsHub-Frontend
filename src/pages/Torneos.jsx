import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Pencil, Plus, Search, Tags, Trash2 } from 'lucide-react';
import CategoriesModal from '../components/CategoriesModal';
import RestrictedActionModal from '../components/RestrictedActionModal';
import TournamentModal from '../components/TournamentModal';
import { STATUS_BADGE, TOURNAMENT_STATUSES } from '../data/constants';
import { PERMISSIONS } from '../data/users';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { formatDateShort } from '../utils/dates';

export default function Torneos() {
  const { tournaments, categories, teams, addTournament, updateTournament, removeTournament } = useData();
  const { can } = useAuth();
  const canManage = can(PERMISSIONS.MANAGE_TOURNAMENTS);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  // null = cerrado · { tournament: null } = crear · { tournament } = editar
  const [modal, setModal] = useState(null);
  const [showCategories, setShowCategories] = useState(false);
  const [showRestricted, setShowRestricted] = useState(false);

  const guarded = (action) => () => (canManage ? action() : setShowRestricted(true));

  const query = search.trim().toLowerCase();
  const visible = tournaments.filter((t) => {
    const textOk = !query || t.name.toLowerCase().includes(query) || t.category.toLowerCase().includes(query);
    const statusOk = statusFilter === 'Todos' || t.status === statusFilter;
    return textOk && statusOk;
  });

  const handleSave = (data) => {
    if (modal.tournament) updateTournament(modal.tournament.id, data);
    else addTournament(data);
    setModal(null);
  };

  const handleDelete = (tournament) => {
    if (!window.confirm(`¿Eliminar el torneo "${tournament.name}"?`)) return;
    const result = removeTournament(tournament.id);
    if (!result.ok) window.alert(result.error);
  };

  return (
    <div className="card border-0 shadow-sm rounded-3 p-3 p-md-4 bg-white">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="h4 fw-bold m-0" style={{ color: '#1E0A3C' }}>Gestión de torneos</h2>
          <p className="text-muted small mb-0">Administra las ligas, categorías, fechas y su estado.</p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <button type="button" className="btn btn-outline-dark d-flex align-items-center gap-2" onClick={guarded(() => setShowCategories(true))}>
            {canManage ? <Tags size={18} /> : <Lock size={18} />} Categorías
          </button>
          <button
            type="button"
            onClick={guarded(() => setModal({ tournament: null }))}
            className="btn text-white fw-bold d-flex align-items-center gap-2 px-3 py-2 rounded-3 shadow-sm"
            style={{ backgroundColor: '#1E0A3C' }}
          >
            {canManage ? <Plus size={18} /> : <Lock size={18} />} Crear nuevo torneo
          </button>
        </div>
      </div>

      <div className="row g-2 mb-3">
        <div className="col-12 col-md-6 col-lg-4">
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-light border-0"><Search size={16} className="text-muted" /></span>
            <input type="search" className="form-control border-0 bg-light" placeholder="Buscar por nombre o categoría" aria-label="Buscar torneos" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="col-12 col-md-4 col-lg-3">
          <select className="form-select form-select-sm bg-light border-0" aria-label="Filtrar por estado" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="Todos">Todos los estados</option>
            {TOURNAMENT_STATUSES.map((s) => (
              <option key={s} value={s}>{s === 'Finalizado' ? 'Finalizado (historial)' : s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle border">
          <thead className="table-light">
            <tr>
              <th className="py-3">Torneo</th>
              <th className="py-3">Categoría</th>
              <th className="py-3">Fechas</th>
              <th className="py-3 text-center">Equipos</th>
              <th className="py-3 text-center">Estado</th>
              <th className="py-3 text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr><td colSpan={6} className="text-center text-muted py-5">No hay torneos que coincidan con la búsqueda.</td></tr>
            )}
            {visible.map((t) => (
              <tr key={t.id}>
                <td className="fw-bold text-dark">{t.name}<span className="d-block small text-muted fw-normal">Temporada {t.season}</span></td>
                <td className="text-secondary">{t.category}</td>
                <td className="small text-secondary text-nowrap">{formatDateShort(t.startDate)}<br />{formatDateShort(t.endDate)}</td>
                <td className="text-center fw-medium">{teams.filter((team) => team.tournamentId === t.id).length} / {t.teams}</td>
                <td className="text-center"><span className={`badge px-3 py-1 rounded-pill ${STATUS_BADGE[t.status] ?? 'bg-secondary'}`}>{t.status}</span></td>
                <td className="text-end text-nowrap">
                  <button type="button" className="btn btn-sm btn-outline-dark me-2" onClick={guarded(() => setModal({ tournament: t }))}>
                    {canManage ? <Pencil size={14} className="me-1" /> : <Lock size={14} className="me-1" />} Editar
                  </button>
                  <Link to={`/equipos?torneo=${t.id}`} className="btn btn-sm btn-outline-dark me-2">Equipos</Link>
                  <Link to={`/estadisticas?torneo=${t.id}`} className="btn btn-sm text-white me-2" style={{ backgroundColor: '#1E0A3C' }}>Posiciones</Link>
                  <button type="button" className="btn btn-sm btn-outline-danger" onClick={guarded(() => handleDelete(t))} aria-label={`Eliminar ${t.name}`}>
                    {canManage ? <Trash2 size={14} /> : <Lock size={14} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showRestricted && <RestrictedActionModal show onHide={() => setShowRestricted(false)} action="crear, editar o eliminar torneos" />}
      {showCategories && <CategoriesModal onHide={() => setShowCategories(false)} />}
      {modal && (
        <TournamentModal
          key={modal.tournament?.id ?? 'nuevo'}
          tournament={modal.tournament}
          existingNames={tournaments.filter((t) => t.id !== modal.tournament?.id).map((t) => t.name)}
          categories={categories}
          onSave={handleSave}
          onHide={() => setModal(null)}
        />
      )}
    </div>
  );
}
