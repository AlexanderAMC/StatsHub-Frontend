import { describe, expect, it, vi } from 'vitest';
import { ApiError, fetchApi, onUnauthorized } from './api';
import { jsonResponse } from '../test/setup';

describe('fetchApi', () => {
  it('envía el token y devuelve el JSON', async () => {
    window.localStorage.setItem('statshub_token', 'abc');
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, [{ id: 1 }]));
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchApi('/torneos')).resolves.toEqual([{ id: 1 }]);
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer abc');
  });

  it('acepta respuestas 204 sin cuerpo', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(204)));
    await expect(fetchApi('/auth/users/1', { method: 'DELETE' })).resolves.toBeNull();
  });

  it('lanza ApiError con el mensaje y el código del servidor', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(409, { error: 'El correo ya está registrado' })));
    const error = await fetchApi('/auth/register', { method: 'POST' }).catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(409);
    expect(error.message).toBe('El correo ya está registrado');
  });

  it('un error de red se convierte en ApiError con status 0', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    const error = await fetchApi('/torneos').catch((e) => e);
    expect(error.status).toBe(0);
    expect(error.message).toMatch(/No se pudo conectar/);
  });

  it('un 401 con token avisa que la sesión ya no es válida', async () => {
    window.localStorage.setItem('statshub_token', 'vencido');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(401, { error: 'Sesión inválida o expirada' })));
    const handler = vi.fn();
    const unsubscribe = onUnauthorized(handler);

    await fetchApi('/auth/users').catch(() => {});
    expect(handler).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it('el 401 del login (credenciales incorrectas) no cierra la sesión', async () => {
    window.localStorage.setItem('statshub_token', 'otro');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(401, { error: 'Credenciales inválidas' })));
    const handler = vi.fn();
    const unsubscribe = onUnauthorized(handler);

    await fetchApi('/auth/login', { method: 'POST' }).catch(() => {});
    expect(handler).not.toHaveBeenCalled();
    unsubscribe();
  });
});
