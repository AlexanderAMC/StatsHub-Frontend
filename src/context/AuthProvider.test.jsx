import { describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import AuthProvider from './AuthProvider';
import { useAuth } from '../hooks/useAuth';
import { fakeToken, jsonResponse } from '../test/setup';

function Probe() {
  const { user, accounts, sessionNotice } = useAuth();
  return (
    <div>
      <span data-testid="user">{user ? user.role : 'sin-sesion'}</span>
      <span data-testid="accounts">{accounts.length}</span>
      <span data-testid="notice">{sessionNotice}</span>
    </div>
  );
}

const saveSession = (role, token) => {
  window.localStorage.setItem('statshub_session', JSON.stringify({ id: 'u1', name: 'Ana', role }));
  if (token) window.localStorage.setItem('statshub_token', token);
};

const renderProvider = () => render(<AuthProvider><Probe /></AuthProvider>);

describe('AuthProvider', () => {
  it('no restaura una sesión cuyo token ya venció', () => {
    vi.stubGlobal('fetch', vi.fn());
    saveSession('administrador', fakeToken({ expInSeconds: -60 }));
    renderProvider();
    expect(screen.getByTestId('user')).toHaveTextContent('sin-sesion');
    expect(window.localStorage.getItem('statshub_token')).toBeNull();
  });

  it('restaura la sesión de invitado aunque no tenga token', () => {
    vi.stubGlobal('fetch', vi.fn());
    saveSession('invitado');
    renderProvider();
    expect(screen.getByTestId('user')).toHaveTextContent('invitado');
  });

  it('el administrador carga la lista de usuarios', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(200, [{ id: 'a', nombre: 'Ana', apellido: 'Admin', correo: 'a@x.cl', activo: true, rol: 'ADMINISTRADOR' }])
    );
    vi.stubGlobal('fetch', fetchMock);
    saveSession('administrador', fakeToken());
    renderProvider();

    await waitFor(() => expect(screen.getByTestId('accounts')).toHaveTextContent('1'));
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/auth\/users$/);
  });

  it('el espectador y el invitado no piden la lista de usuarios', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    saveSession('espectador', fakeToken());
    renderProvider();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('si el servidor rechaza el token, cierra la sesión y avisa', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(401, { error: 'Sesión inválida o expirada' })));
    saveSession('administrador', fakeToken());
    renderProvider();

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('sin-sesion'));
    expect(screen.getByTestId('notice')).toHaveTextContent(/sesión expiró/i);
    expect(window.localStorage.getItem('statshub_session')).toBeNull();
  });

  it('cierra la sesión automáticamente cuando vence el token', () => {
    vi.useFakeTimers();
    try {
      vi.stubGlobal('fetch', vi.fn());
      saveSession('espectador', fakeToken({ expInSeconds: 5 }));
      renderProvider();
      expect(screen.getByTestId('user')).toHaveTextContent('espectador');

      act(() => { vi.advanceTimersByTime(6000); });
      expect(screen.getByTestId('user')).toHaveTextContent('sin-sesion');
    } finally {
      vi.useRealTimers();
    }
  });
});
