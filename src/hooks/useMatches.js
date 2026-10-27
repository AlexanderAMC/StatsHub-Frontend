import { useRef, useState } from 'react';
import { MATCH_STATUS, MAX_MINUTE } from '../data/constants';
import { INITIAL_EVENTS, INITIAL_MATCHES } from '../data/mockData';

export function useMatches() {
  return { matches: [], events: [], addEvent: () => {}, undoLastEvent: () => {}, setMinute: () => {}, finishMatch: () => {} };
}