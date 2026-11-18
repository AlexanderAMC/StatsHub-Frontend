import { describe, expect, it } from 'vitest';
import { getTokenExpiry, isTokenExpired } from './jwt';
import { fakeToken } from '../test/setup';

describe('jwt', () => {
  it('lee la expiración en milisegundos', () => {
    const token = fakeToken({ expInSeconds: 60 });
    const expiry = getTokenExpiry(token);
    expect(expiry).toBeGreaterThan(Date.now());
    expect(expiry).toBeLessThanOrEqual(Date.now() + 61_000);
  });

  it('detecta tokens vencidos, inválidos o sin exp', () => {
    expect(isTokenExpired(fakeToken({ expInSeconds: -10 }))).toBe(true);
    expect(isTokenExpired(fakeToken({ expInSeconds: 3600 }))).toBe(false);
    expect(isTokenExpired('basura')).toBe(true);
  });
});
