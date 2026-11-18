import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

// Crea un JWT de prueba (sin firma real: el frontend solo lee "exp").
export function fakeToken({ expInSeconds = 3600, ...payload } = {}) {
  const encode = (obj) => btoa(JSON.stringify(obj)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  const exp = Math.floor(Date.now() / 1000) + expInSeconds;
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ ...payload, exp })}.firma`;
}

// Respuesta de fetch simulada.
export function jsonResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => (body === undefined ? '' : JSON.stringify(body)),
  };
}
