import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';
import AuthProvider from '../context/AuthProvider';
import { jsonResponse } from '../test/setup';

const renderLogin = () =>
  render(
    <MemoryRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>
  );

describe('Login', () => {
  it('muestra el error real del servidor cuando las credenciales son incorrectas', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(401, { error: 'Credenciales inválidas' })));
    const user = userEvent.setup({ delay: null });
    renderLogin();

    await user.type(screen.getByLabelText('Correo'), 'ana@statshub.cl');
    await user.type(screen.getByLabelText('Contraseña'), 'incorrecta');
    await user.click(screen.getByRole('button', { name: /Iniciar sesión/ }));

    expect(await screen.findByText('Credenciales inválidas')).toBeInTheDocument();
  });

  it('el registro con correo duplicado muestra el error y no anuncia "Cuenta creada"', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(409, { error: 'El correo ya está registrado' })));
    const user = userEvent.setup({ delay: null });
    renderLogin();

    await user.click(screen.getByRole('tab', { name: 'Crear cuenta' }));
    await user.type(screen.getByLabelText('Nombre completo'), 'Carla Rojas');
    await user.type(screen.getByLabelText('Correo'), 'carla@statshub.cl');
    await user.type(screen.getByLabelText('Contraseña'), 'ClaveSegura1');
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'ClaveSegura1');
    await user.click(screen.getByLabelText(/Acepto la política de privacidad/));
    await user.click(screen.getByRole('button', { name: /Crear cuenta/ }));

    expect(await screen.findByText('El correo ya está registrado')).toBeInTheDocument();
    expect(screen.queryByText('¡Cuenta creada!')).not.toBeInTheDocument();
  });

  it('sin aceptar la política de privacidad no se envía el registro (Ley 19.628)', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup({ delay: null });
    renderLogin();

    await user.click(screen.getByRole('tab', { name: 'Crear cuenta' }));
    await user.type(screen.getByLabelText('Nombre completo'), 'Carla Rojas');
    await user.type(screen.getByLabelText('Correo'), 'carla@statshub.cl');
    await user.type(screen.getByLabelText('Contraseña'), 'ClaveSegura1');
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'ClaveSegura1');
    await user.click(screen.getByRole('button', { name: /Crear cuenta/ }));

    expect(await screen.findByText(/Debes aceptar la política de privacidad/)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('ya no muestra cuentas de demostración con contraseñas', () => {
    vi.stubGlobal('fetch', vi.fn());
    renderLogin();
    expect(screen.queryByText(/Cuentas de demostración/)).not.toBeInTheDocument();
  });
});
