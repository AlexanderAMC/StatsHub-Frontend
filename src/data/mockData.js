import { MATCH_STATUS } from './constants';

const { LIVE, FINISHED } = MATCH_STATUS;

export const CURRENT_USER = {
  name: 'Juan Villagran',
  initials: 'JV',
  role: 'Administrador',
  accessLevel: 'Administrador de Sistema (Full Access)',
  program: 'Proyecto de Título — INACAP 2026',
  subject: 'Proyecto de Título (TIHI84)',
  campus: 'Puente Alto',
};

export const INITIAL_TOURNAMENTS = [
  { id: 1, name: 'Copa Verano Amateur 2026', category: 'Fútbolito Varones', teams: 16, status: 'En Curso' },
  { id: 2, name: 'Liga Interempresas Puente Alto', category: 'Fútbol 11', teams: 12, status: 'Inscripciones' },
  { id: 3, name: 'Torneo Universitario INACAP', category: 'Fútbol Sala', teams: 8, status: 'Finalizado' },
];

// minute es un número; status es En Vivo o Finalizado.
export const INITIAL_MATCHES = [
  // Partidos en vivo
  { id: 1, tournamentId: 1, home: 'Deportivo Puente Alto', away: 'Real Academia', scoreHome: 2, scoreAway: 1, minute: 75, status: LIVE },
  { id: 2, tournamentId: 1, home: 'Los Titanes FC', away: 'Inacap Basket/Fut', scoreHome: 0, scoreAway: 0, minute: 22, status: LIVE },

  // Resultados ya jugados (alimentan la tabla de posiciones)
  { id: 101, tournamentId: 1, home: 'Deportivo Puente Alto', away: 'Club Santa Rosa', scoreHome: 3, scoreAway: 1, minute: 90, status: FINISHED },
  { id: 102, tournamentId: 1, home: 'Real Academia', away: 'Los Titanes FC', scoreHome: 2, scoreAway: 2, minute: 90, status: FINISHED },
  { id: 103, tournamentId: 1, home: 'Inacap Basket/Fut', away: 'Atlético Bajos de Mena', scoreHome: 1, scoreAway: 0, minute: 90, status: FINISHED },
  { id: 104, tournamentId: 1, home: 'Deportivo Puente Alto', away: 'Atlético Bajos de Mena', scoreHome: 2, scoreAway: 0, minute: 90, status: FINISHED },
  { id: 105, tournamentId: 1, home: 'Real Academia', away: 'Club Santa Rosa', scoreHome: 3, scoreAway: 1, minute: 90, status: FINISHED },
  { id: 106, tournamentId: 1, home: 'Los Titanes FC', away: 'Inacap Basket/Fut', scoreHome: 1, scoreAway: 0, minute: 90, status: FINISHED },
  { id: 107, tournamentId: 1, home: 'Deportivo Puente Alto', away: 'Los Titanes FC', scoreHome: 1, scoreAway: 1, minute: 90, status: FINISHED },
  { id: 108, tournamentId: 1, home: 'Real Academia', away: 'Inacap Basket/Fut', scoreHome: 2, scoreAway: 0, minute: 90, status: FINISHED },
];

// Del más reciente al más antiguo.
export const INITIAL_EVENTS = [
  { id: 3, matchId: 1, minute: 60, type: 'gol', team: 'home', player: 'J. Silva' },
  { id: 2, matchId: 1, minute: 34, type: 'gol', team: 'away', player: 'M. Soto' },
  { id: 1, matchId: 1, minute: 15, type: 'gol', team: 'home', player: 'G. Tapia' },
];
