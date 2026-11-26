import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { DataContext } from './dataContext';
import { deportivosService as api } from '../services/deportivos.service';
import { API_URL } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { PERMISSIONS, ROLES } from '../data/users';
import { buildFixture } from '../utils/schedule';
import {
  eventToApi, mapCategory, mapEvent, mapMatch, mapNotification, mapPlayer, mapPrediction, mapTeam,
  mapTournament, mapTransfer, matchToApi, playerToApi, teamToApi, tournamentToApi,
} from '../utils/mappers';

const DEFAULT_VENUES = ['Cancha 1', 'Cancha 2', 'Estadio Municipal'];

// Ejecuta una acción de la API y devuelve { ok, data } o { ok: false, error } para que las
// pantallas muestren el mensaje del servidor sin manejar excepciones.
async function run(action, after) {
  try {
    const data = await action();
    if (after) await after(data);
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: error.message || 'No se pudo completar la acción.' };
  }
}

export default function DataProvider({ children }) {
  const { user, can } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [events, setEvents] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [league, setLeague] = useState(null);
  const [predictions, setPredictions] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [officials, setOfficials] = useState({ arbitros: [], estadigrafos: [] });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const isMember = Boolean(user) && user.role !== ROLES.GUEST;
  const canSeeOfficials = isMember && (can(PERMISSIONS.SCHEDULE_MATCHES) || can(PERMISSIONS.RECORD_MATCHES));

  // ---------- Cargas ----------
  const loadTournaments = useCallback(async () => setTournaments((await api.getTorneos()).map(mapTournament)), []);
  const loadTeams = useCallback(async () => setTeams((await api.getEquipos()).map(mapTeam)), []);
  const loadPlayers = useCallback(async () => setPlayers((await api.getJugadores()).map(mapPlayer)), []);
  const loadTransfers = useCallback(async () => setTransfers((await api.getTransferencias()).map(mapTransfer)), []);
  const loadCategories = useCallback(async () => setCategoryList((await api.getCategorias()).map(mapCategory)), []);
  const loadLeague = useCallback(async () => setLeague(await api.getLiga()), []);
  const loadPredictions = useCallback(async () => {
    try {
      const list = await api.getPredicciones();
      setPredictions(Object.fromEntries(list.map(mapPrediction).map((p) => [p.matchId, p])));
    } catch {
      setPredictions({}); // la predicción es opcional: el calendario usa el cálculo local
    }
  }, []);
  const loadMatches = useCallback(async () => {
    const [partidos, eventos] = await Promise.all([api.getPartidos(), api.getEventos()]);
    setMatches(partidos.map(mapMatch));
    setEvents(eventos.map(mapEvent));
  }, []);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    const cargar = async () => {
      setCargando(true);
      setError('');
      try {
        await Promise.all([loadTournaments(), loadTeams(), loadMatches(), loadPlayers(), loadTransfers(), loadCategories(), loadLeague()]);
        if (!cancelled) loadPredictions();
      } catch (err) {
        if (!cancelled) setError(err.message || 'No se pudieron cargar los datos.');
      } finally {
        if (!cancelled) setCargando(false);
      }
    };
    cargar();
    return () => { cancelled = true; };
  }, [reloadKey, loadTournaments, loadTeams, loadMatches, loadPlayers, loadTransfers, loadCategories, loadLeague, loadPredictions]);

  const loadNotifications = useCallback(async () => {
    try {
      setNotifications((await api.getNotificaciones()).map(mapNotification));
    } catch {
      /* sin notificaciones si la sesión expiró (AuthProvider se encarga) */
    }
  }, []);

  const userId = user?.id;
  useEffect(() => {
    if (!isMember) return undefined;
    let cancelled = false;
    api.getNotificaciones()
      .then((list) => { if (!cancelled) setNotifications(list.map(mapNotification)); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [userId, isMember]);

  useEffect(() => {
    if (!canSeeOfficials) return;
    api.getOficiales().then(setOfficials).catch(() => {});
  }, [userId, canSeeOfficials]);

  // ---------- Tiempo real (SSE, RF-29 / RF-42) ----------
  const refresh = useRef({});
  useEffect(() => {
    refresh.current = { loadMatches, loadPredictions, loadNotifications, isMember };
  });
  useEffect(() => {
    if (typeof EventSource === 'undefined') return undefined;
    const source = new EventSource(`${API_URL}/tiempo-real`);
    let timer = null;
    source.addEventListener('partido', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        refresh.current.loadMatches().catch(() => {});
        refresh.current.loadPredictions();
      }, 300);
    });
    source.addEventListener('notificacion', () => {
      if (refresh.current.isMember) refresh.current.loadNotifications();
    });
    return () => {
      clearTimeout(timer);
      source.close();
    };
  }, []);

  // ---------- Acciones ----------
  const afterTournament = () => loadTournaments();
  const afterTeam = () => Promise.all([loadTeams(), loadTournaments()]);

  const actions = {
    addTournament: (data) => run(() => api.createTorneo(tournamentToApi(data)), afterTournament),
    updateTournament: (id, data) => run(() => api.updateTorneo(id, tournamentToApi(data)), afterTournament),
    removeTournament: (id) => run(() => api.deleteTorneo(id), afterTournament),

    addCategory: (name, ages = {}) =>
      run(() => api.createCategoria({ nombre: name, edad_min: ages.minAge ?? null, edad_max: ages.maxAge ?? null }), loadCategories),
    removeCategory: (name) => {
      const category = categoryList.find((c) => c.name === name);
      if (!category) return Promise.resolve({ ok: false, error: 'La categoría no existe.' });
      return run(() => api.deleteCategoria(category.id), loadCategories);
    },

    addTeam: (data) => run(() => api.createEquipo(teamToApi(data)), afterTeam),
    updateTeam: (id, data) => run(() => api.updateEquipo(id, teamToApi(data)), afterTeam),
    removeTeam: (id) => run(() => api.deleteEquipo(id), afterTeam),
    uploadTeamLogo: (id, file) => run(() => api.uploadEscudo(id, file), loadTeams),

    addPlayer: (data) => run(() => api.createJugador(playerToApi(data)), loadPlayers),
    updatePlayer: (id, data) => run(() => api.updateJugador(id, playerToApi({ ...data, teamId: undefined })), loadPlayers),
    removePlayer: (id) => run(() => api.deleteJugador(id), loadPlayers),
    transferPlayer: (id, toTeamId) => run(() => api.transferirJugador(id, toTeamId), () => Promise.all([loadPlayers(), loadTransfers()])),

    scheduleMatch: (data) => run(() => api.createPartido(matchToApi(data)), loadMatches),
    updateScheduledMatch: (id, data) => {
      const match = matches.find((m) => m.id === id);
      return run(() => api.updatePartido(id, matchToApi({ ...data, tournamentId: match?.tournamentId })), loadMatches);
    },
    cancelMatch: (id) => run(() => api.suspenderPartido(id), loadMatches),
    sendReminder: (id) => run(() => api.recordatorioPartido(id)),
    // RF-18: el fixture "todos contra todos" se calcula aquí y el servidor lo valida y guarda.
    generateFixture: async (tournamentId, startDate, venue) => {
      const tournamentMatches = matches.filter((m) => m.tournamentId === tournamentId);
      const fixture = buildFixture({
        teams: teams.filter((t) => t.tournamentIds.includes(tournamentId)),
        matches: tournamentMatches,
        startDate,
        venue,
        referees: officials.arbitros.map((r) => ({ id: r.id })),
        startRound: Math.max(0, ...tournamentMatches.map((m) => m.round)),
      });
      if (fixture.length === 0) return { ok: true, created: 0 };
      const result = await run(() => api.createPartidosLote(fixture.map((f) => matchToApi({ ...f, tournamentId }))), loadMatches);
      return result.ok ? { ok: true, created: result.data.creados } : result;
    },

    startMatch: (matchId, lineup) => run(() => api.iniciarPartido(matchId, lineup), loadMatches),
    setMinute: (matchId, value) => {
      const minute = Math.min(130, Math.max(0, Math.trunc(Number(value) || 0)));
      setMatches((prev) => prev.map((m) => (m.id === matchId ? { ...m, minute } : m))); // respuesta inmediata
      return run(() => api.setMinuto(matchId, minute));
    },
    addEvent: (matchId, data) => run(() => api.addEvento(matchId, eventToApi(data)), loadMatches),
    undoLastEvent: (matchId) => run(() => api.deshacerEvento(matchId), loadMatches),
    finishMatch: (matchId) => run(() => api.finalizarPartido(matchId), () => Promise.all([loadMatches(), loadPredictions()])),

    markAllRead: () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      return run(() => api.marcarNotificacionesLeidas());
    },
    requestPayment: (teamId, tournamentId) => run(() => api.crearCobro(teamId, tournamentId)),
    updateLeague: (data) => run(() => api.updateLiga(data), loadLeague),
  };

  const teamName = useCallback((id) => teams.find((t) => t.id === id)?.name || (id ? 'Equipo Desconocido' : 'Sin equipo'), [teams]);
  const playerName = useCallback((id) => players.find((p) => p.id === id)?.name || 'Jugador', [players]);

  const value = useMemo(() => ({
    tournaments, teams, matches, players, events, transfers, league, predictions,
    // Sin cuenta (invitado o sin sesión) no hay notificaciones, aunque queden datos de una sesión anterior.
    notifications: isMember ? notifications : [],
    cargando, error, reload,
    categories: categoryList.map((c) => c.name),
    categoryList,
    referees: officials.arbitros.map((r) => ({ id: r.id, name: r.nombre })),
    statsKeepers: officials.estadigrafos.map((r) => ({ id: r.id, name: r.nombre })),
    venues: league?.recintos?.length ? league.recintos : DEFAULT_VENUES,
    teamName,
    playerName,
    ...actions,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [tournaments, teams, matches, players, events, transfers, notifications, isMember, league, predictions, cargando, error, categoryList, officials, teamName, playerName]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
