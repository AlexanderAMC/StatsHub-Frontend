import { useRef, useState } from 'react';
import { MATCH_STATUS, MAX_MINUTE } from '../data/constants';
import { INITIAL_EVENTS, INITIAL_MATCHES } from '../data/mockData';

const scoreKey = (team) => (team === 'home' ? 'scoreHome' : 'scoreAway');

export function useMatches() {
  const [matches, setMatches] = useState(INITIAL_MATCHES);
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const nextEventId = useRef(Math.max(...INITIAL_EVENTS.map((e) => e.id)) + 1);

  const changeScore = (matchId, team, delta) => {
    const key = scoreKey(team);
    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, [key]: Math.max(0, m[key] + delta) } : m)),
    );
  };

  // type: 'gol' | 'amarilla' | 'roja'   team: 'home' | 'away'
  const addEvent = (matchId, type, team, player = '') => {
    const match = matches.find((m) => m.id === matchId);
    if (!match || match.status !== MATCH_STATUS.LIVE) return;

    const id = nextEventId.current++;
    setEvents((prev) => [
      { id, matchId, minute: match.minute, type, team, player: player.trim() },
      ...prev,
    ]);
    if (type === 'gol') changeScore(matchId, team, 1);
  };

  // Elimina el último evento del partido y, si era un gol, corrige el marcador.
  const undoLastEvent = (matchId) => {
    const match = matches.find((m) => m.id === matchId);
    const last = events.find((e) => e.matchId === matchId);
    if (!match || match.status !== MATCH_STATUS.LIVE || !last) return;

    setEvents((prev) => prev.filter((e) => e.id !== last.id));
    if (last.type === 'gol') changeScore(matchId, last.team, -1);
  };

  const setMinute = (matchId, value) => {
    const minute = Math.min(MAX_MINUTE, Math.max(0, Math.trunc(Number(value) || 0)));
    setMatches((prev) => prev.map((m) => (m.id === matchId ? { ...m, minute } : m)));
  };

  const finishMatch = (matchId) => {
    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, status: MATCH_STATUS.FINISHED } : m)),
    );
  };

  return { matches, events, addEvent, undoLastEvent, setMinute, finishMatch };
}
