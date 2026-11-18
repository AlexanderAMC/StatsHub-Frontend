import { useState, useEffect, useCallback } from 'react';
import { DataContext } from './dataContext';
import { deportivosService } from '../services/deportivos.service';
import { REFEREES, VENUES } from '../data/mockData'; // Solo para datos que faltan en BD
import { mapMatch, mapTeam, mapTournament } from '../utils/mappers';

export default function DataProvider({ children }) {
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  // Incrementarlo vuelve a disparar la carga (botón "Reintentar").
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;

    const cargarDatos = async () => {
      setCargando(true);
      setError('');
      try {
        const [torneosDb, equiposDb, partidosDb] = await Promise.all([
          deportivosService.getTorneos(),
          deportivosService.getEquipos(),
          deportivosService.getPartidos(),
        ]);
        if (cancelled) return;
        setTournaments(torneosDb.map(mapTournament));
        setTeams(equiposDb.map(mapTeam));
        setMatches(partidosDb.map(mapMatch));
      } catch (err) {
        if (cancelled) return;
        console.error('Error al cargar datos:', err);
        setError(err.message || 'No se pudieron cargar los datos.');
      } finally {
        if (!cancelled) setCargando(false);
      }
    };

    cargarDatos();
    return () => { cancelled = true; };
  }, [reloadKey]);

  const notImplemented = () => { console.warn('En desarrollo'); return { ok: false, error: 'En desarrollo' }; };

  const value = {
    tournaments, teams, matches, cargando, error, reload,
    players: [], events: [], notifications: [], transfers: [], categories: [],
    referees: REFEREES, venues: VENUES,
    teamName: (id) => teams.find((t) => t.id === id)?.name || 'Equipo Desconocido',
    playerName: () => 'Jugador',
    markAllRead: () => {},
    addTournament: notImplemented, updateTournament: notImplemented, removeTournament: notImplemented,
    addCategory: notImplemented, removeCategory: notImplemented,
    addTeam: notImplemented, updateTeam: notImplemented, removeTeam: notImplemented,
    addPlayer: notImplemented, updatePlayer: notImplemented, removePlayer: notImplemented, transferPlayer: notImplemented,
    scheduleMatch: notImplemented, updateScheduledMatch: notImplemented, cancelMatch: notImplemented, sendReminder: notImplemented, generateFixture: notImplemented,
    startMatch: notImplemented, setMinute: notImplemented, finishMatch: notImplemented, addEvent: notImplemented, undoLastEvent: notImplemented,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
