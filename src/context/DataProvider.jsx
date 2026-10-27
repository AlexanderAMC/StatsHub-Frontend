import { useState, useEffect } from 'react';
import { DataContext } from './dataContext';
import { MATCH_STATUS } from '../data/constants';
import { deportivosService } from '../services/deportivos.service';
import { REFEREES, VENUES } from '../data/mockData'; // Solo para datos que faltan en BD

export default function DataProvider({ children }) {
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      try {
        const [torneosDb, equiposDb, partidosDb] = await Promise.all([
          deportivosService.getTorneos(),
          deportivosService.getEquipos(),
          deportivosService.getPartidos()
        ]);

        // Adaptar Torneos
        setTournaments(torneosDb.map(t => ({
          id: t.id,
          name: t.nombre,
          category: t.categoria,
          status: t.estado === 'ACTIVO' ? 'En Curso' : t.estado === 'PLANIFICADO' ? 'Planificado' : 'Finalizado',
          teams: 0, 
          startDate: t.fecha_inicio,
          endDate: t.fecha_fin,
          season: t.fecha_inicio?.slice(0, 4) || '2026'
        })));

        // Adaptar Equipos
        setTeams(equiposDb.map(e => ({
          id: e.id,
          name: e.nombre,
          tournamentId: 1, // TODO: El backend debe devolver el torneo_id
          coach: 'Sin asignar'
        })));

        // Adaptar Partidos
        setMatches(partidosDb.map(p => ({
          id: p.id,
          homeId: p.equipo_local,
          awayId: p.equipo_visita,
          scoreHome: p.goles_local || 0,
          scoreAway: p.goles_visita || 0,
          status: p.estado === 'FINALIZADO' ? MATCH_STATUS.FINISHED : p.estado === 'EN_CURSO' ? MATCH_STATUS.LIVE : MATCH_STATUS.SCHEDULED,
          date: p.fecha_partido?.split('T')[0] || '',
          time: p.fecha_partido?.split('T')[1]?.slice(0, 5) || '',
          venue: p.cancha || 'Cancha 1',
          tournamentId: 1, // TODO: El backend debe devolver el torneo_id
          refereeId: null,
          round: 1,
          minute: 0
        })));

      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  const notImplemented = () => { console.warn('En desarrollo'); return { ok: false, error: 'En desarrollo' }; };

  const value = {
    tournaments, teams, matches, cargando,
    players: [], events: [], notifications: [], transfers: [], categories: [],
    referees: REFEREES, venues: VENUES,
    teamName: (id) => teams.find(t => t.id === id)?.name || 'Equipo Desconocido',
    playerName: (id) => 'Jugador',
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