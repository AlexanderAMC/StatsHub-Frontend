import { MATCH_STATUS } from './constants';

const { SCHEDULED, LIVE, FINISHED } = MATCH_STATUS;

export const LOGIN_PREVIEW = {
  home: 'Deportivo Puente Alto',
  away: 'Real Academia',
  scoreHome: 2,
  scoreAway: 1,
  minute: 75,
};

export const INITIAL_CATEGORIES = ['Fútbolito Varones', 'Fútbol 11', 'Fútbol Sala', 'Damas', 'Senior', 'Juvenil', 'Infantil'];

export const VENUES = ['Cancha 1', 'Cancha 2', 'Cancha 3'];

export const REFEREES = [
  { id: 1, name: 'Carlos Muñoz' },
  { id: 2, name: 'Rodrigo Pizarro' },
  { id: 3, name: 'Patricio Salinas' },
];

// teams = cupo máximo de equipos del torneo.
export const INITIAL_TOURNAMENTS = [
  { id: 1, name: 'Copa Verano Amateur 2026', category: 'Fútbolito Varones', teams: 16, status: 'En Curso', startDate: '2026-09-12', endDate: '2026-12-13', season: '2026' },
  { id: 2, name: 'Liga Interempresas Puente Alto', category: 'Fútbol 11', teams: 12, status: 'Inscripciones', startDate: '2027-01-16', endDate: '2027-04-24', season: '2027' },
  { id: 3, name: 'Torneo Universitario INACAP', category: 'Fútbol Sala', teams: 8, status: 'Finalizado', startDate: '2025-03-08', endDate: '2025-06-28', season: '2025' },
];

export const INITIAL_TEAMS = [
  { id: 1, tournamentId: 1, name: 'Deportivo Puente Alto', coach: 'Mario Reyes' },
  { id: 2, tournamentId: 1, name: 'Real Academia', coach: 'Pedro Salazar' },
  { id: 3, tournamentId: 1, name: 'Los Titanes FC', coach: 'Jorge Lira' },
  { id: 4, tournamentId: 1, name: 'Inacap Basket/Fut', coach: 'Luis Herrera' },
  { id: 5, tournamentId: 1, name: 'Club Santa Rosa', coach: 'Manuel Ortega' },
  { id: 6, tournamentId: 1, name: 'Atlético Bajos de Mena', coach: 'Raúl Pizarro' },
];

// [nombre, número, posición]. El id del jugador es idEquipo * 100 + posición en la lista (1 a 7).
const ROSTERS = {
  1: [['Gabriel Tapia', 9, 'Delantero'], ['Joaquín Silva', 10, 'Mediocampista'], ['Felipe Araya', 1, 'Portero'], ['Diego Contreras', 4, 'Defensa'], ['Nicolás Pardo', 6, 'Mediocampista'], ['Camilo Vera', 7, 'Delantero'], ['Ignacio Rojas', 3, 'Defensa']],
  2: [['Matías Soto', 11, 'Delantero'], ['Sebastián Mora', 8, 'Mediocampista'], ['Cristóbal Lagos', 1, 'Portero'], ['Vicente Núñez', 5, 'Defensa'], ['Tomás Ibáñez', 6, 'Mediocampista'], ['Benjamín Cruz', 9, 'Delantero'], ['Álvaro Peña', 2, 'Defensa']],
  3: [['Rodrigo Figueroa', 10, 'Delantero'], ['Patricio Leiva', 7, 'Mediocampista'], ['Héctor Bravo', 1, 'Portero'], ['Marcelo Díaz', 4, 'Defensa'], ['Esteban Molina', 8, 'Mediocampista'], ['Franco Salas', 9, 'Delantero'], ['Lucas Carrasco', 3, 'Defensa']],
  4: [['Andrés Gutiérrez', 10, 'Delantero'], ['Fabián Herrera', 8, 'Mediocampista'], ['Cristian Ortiz', 1, 'Portero'], ['Javier Maldonado', 5, 'Defensa'], ['Pablo Sandoval', 6, 'Mediocampista'], ['Mauricio Reyes', 11, 'Delantero'], ['Renato Fuentes', 2, 'Defensa']],
  5: [['Alonso Vidal', 9, 'Delantero'], ['Claudio Espinoza', 10, 'Mediocampista'], ['Gonzalo Campos', 1, 'Portero'], ['Raúl Medina', 4, 'Defensa'], ['Hugo Navarro', 6, 'Mediocampista'], ['Bastián Orellana', 7, 'Delantero'], ['Emilio Sepúlveda', 3, 'Defensa']],
  6: [['Maximiliano Castro', 9, 'Delantero'], ['Ricardo Paredes', 10, 'Mediocampista'], ['Sergio Valdés', 1, 'Portero'], ['Óscar Mendoza', 4, 'Defensa'], ['Leandro Garrido', 8, 'Mediocampista'], ['Yerko Cáceres', 11, 'Delantero'], ['Iván Poblete', 5, 'Defensa']],
};

export const INITIAL_PLAYERS = Object.entries(ROSTERS).flatMap(([teamId, list]) =>
  list.map(([name, number, position], i) => ({ id: Number(teamId) * 100 + i + 1, teamId: Number(teamId), name, number, position })),
);

const rosterIds = (teamId) => ROSTERS[teamId].map((_, i) => teamId * 100 + i + 1);
const lineupOf = (homeId, awayId) => ({ home: rosterIds(homeId), away: rosterIds(awayId) });

const finished = (id, round, homeId, awayId, scoreHome, scoreAway, date, time, venue, refereeId) => ({
  id, tournamentId: 1, round, homeId, awayId, scoreHome, scoreAway, minute: 90, status: FINISHED, date, time, venue, refereeId, lineup: lineupOf(homeId, awayId),
});
const live = (id, round, homeId, awayId, scoreHome, scoreAway, minute, date, time, venue, refereeId) => ({
  id, tournamentId: 1, round, homeId, awayId, scoreHome, scoreAway, minute, status: LIVE, date, time, venue, refereeId, lineup: lineupOf(homeId, awayId),
});
const scheduled = (id, round, homeId, awayId, date, time, venue, refereeId) => ({
  id, tournamentId: 1, round, homeId, awayId, scoreHome: 0, scoreAway: 0, minute: 0, status: SCHEDULED, date, time, venue, refereeId, lineup: null,
});

export const INITIAL_MATCHES = [
  live(1, 5, 1, 2, 2, 1, 75, '2026-10-17', '16:00', 'Cancha 1', 1),
  live(2, 5, 3, 4, 0, 0, 22, '2026-10-17', '16:00', 'Cancha 2', 2),

  finished(101, 1, 1, 5, 3, 1, '2026-09-19', '15:00', 'Cancha 1', 1),
  finished(102, 1, 2, 3, 2, 2, '2026-09-19', '17:00', 'Cancha 1', 2),
  finished(103, 1, 4, 6, 1, 0, '2026-09-20', '11:00', 'Cancha 2', 3),
  finished(104, 2, 1, 6, 2, 0, '2026-09-26', '15:00', 'Cancha 1', 1),
  finished(105, 2, 2, 5, 3, 1, '2026-09-26', '17:00', 'Cancha 1', 2),
  finished(106, 3, 3, 4, 1, 0, '2026-10-03', '15:00', 'Cancha 1', 3),
  finished(107, 3, 1, 3, 1, 1, '2026-10-03', '17:00', 'Cancha 1', 1),
  finished(108, 4, 2, 4, 2, 0, '2026-10-10', '15:00', 'Cancha 2', 2),

  scheduled(201, 6, 1, 4, '2026-10-24', '15:00', 'Cancha 1', 1),
  scheduled(202, 6, 2, 6, '2026-10-24', '17:00', 'Cancha 1', 2),
  scheduled(203, 6, 3, 5, '2026-10-25', '11:00', 'Cancha 2', 3),
  scheduled(204, 7, 4, 5, '2026-10-31', '15:00', 'Cancha 1', 1),
  scheduled(205, 7, 3, 6, '2026-10-31', '17:00', 'Cancha 1', 2),
  scheduled(206, 7, 5, 6, '2026-11-01', '11:00', 'Cancha 2', 3),
];

// [partido, minuto, lado, jugador (1 a 7 del plantel), asistente]
const GOALS = [
  [1, 15, 'home', 1, null], [1, 34, 'away', 1, 2], [1, 60, 'home', 2, 6],
  [101, 12, 'home', 1, 2], [101, 38, 'home', 6, 1], [101, 55, 'away', 1, 2], [101, 71, 'home', 1, null],
  [102, 18, 'home', 1, 4], [102, 30, 'away', 1, 2], [102, 64, 'home', 2, 1], [102, 80, 'away', 6, null],
  [103, 47, 'home', 1, 2],
  [104, 25, 'home', 2, 1], [104, 60, 'home', 1, 2],
  [105, 10, 'home', 1, 2], [105, 33, 'home', 1, null], [105, 66, 'away', 2, null], [105, 77, 'home', 4, 1],
  [106, 52, 'home', 1, 4],
  [107, 41, 'home', 6, 2], [107, 88, 'away', 1, null],
  [108, 15, 'home', 1, 2], [108, 59, 'home', 2, 1],
];

const CARDS = [
  [1, 50, 'away', 2, 'amarilla'],
  [101, 44, 'away', 3, 'amarilla'],
  [102, 70, 'home', 4, 'amarilla'],
  [102, 85, 'away', 4, 'roja'],
  [105, 50, 'away', 3, 'amarilla'],
];

const eventRows = [
  ...GOALS.map(([matchId, minute, side, idx, assist]) => ({ matchId, minute, type: 'gol', side, idx, assist })),
  ...CARDS.map(([matchId, minute, side, idx, type]) => ({ matchId, minute, type, side, idx, assist: null })),
].sort((a, b) => a.matchId - b.matchId || a.minute - b.minute);

export const INITIAL_EVENTS = eventRows.map((row, i) => {
  const match = INITIAL_MATCHES.find((m) => m.id === row.matchId);
  const teamId = row.side === 'home' ? match.homeId : match.awayId;
  return {
    id: i + 1,
    matchId: row.matchId,
    minute: row.minute,
    type: row.type,
    side: row.side,
    playerId: teamId * 100 + row.idx,
    assistId: row.assist ? teamId * 100 + row.assist : null,
    relatedId: null,
  };
});

export const INITIAL_NOTIFICATIONS = [
  { id: 1, kind: 'programacion', text: 'Se publicó la programación de las fechas 6 y 7 de la Copa Verano Amateur 2026.', at: '2026-10-12T10:00:00.000Z', read: false },
  { id: 2, kind: 'resultado', text: 'Resultado final: Real Academia 2 - 0 Inacap Basket/Fut.', at: '2026-10-10T19:30:00.000Z', read: true },
];
