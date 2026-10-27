import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { RequirePermission, RequireSession } from './components/RouteGuards';
import AuthProvider from './context/AuthProvider';
import DataProvider from './context/DataProvider';
import { PERMISSIONS } from './data/users';
import Actas from './pages/Actas';
import Calendario from './pages/Calendario';
import Dashboard from './pages/Dashboard';
import EquipoDetalle from './pages/EquipoDetalle';
import Equipos from './pages/Equipos';
import Estadisticas from './pages/Estadisticas';
import JugadorDetalle from './pages/JugadorDetalle';
import Login from './pages/Login';
import Torneos from './pages/Torneos';
import Usuarios from './pages/Usuarios';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              element={
                <RequireSession>
                  <Layout />
                </RequireSession>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="torneos" element={<Torneos />} />
              <Route path="equipos" element={<Equipos />} />
              <Route path="equipos/:teamId" element={<EquipoDetalle />} />
              <Route path="jugadores/:playerId" element={<JugadorDetalle />} />
              <Route path="calendario" element={<Calendario />} />
              <Route
                path="actas"
                element={
                  <RequirePermission permission={PERMISSIONS.RECORD_MATCHES} feature="registrar actas digitales">
                    <Actas />
                  </RequirePermission>
                }
              />
              <Route path="estadisticas" element={<Estadisticas />} />
              <Route
                path="usuarios"
                element={
                  <RequirePermission permission={PERMISSIONS.MANAGE_USERS} feature="administrar usuarios y roles">
                    <Usuarios />
                  </RequirePermission>
                }
              />
              <Route path="posiciones" element={<Navigate to="/estadisticas" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
