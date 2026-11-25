import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { RequirePermission, RequireSession } from './components/RouteGuards';
import AuthProvider from './context/AuthProvider';
import DataProvider from './context/DataProvider';
import { PERMISSIONS } from './data/users';
import Actas from './pages/Actas';
import Auditoria from './pages/Auditoria';
import Cobros from './pages/Cobros';
import MisPagos from './pages/MisPagos';
import Oficiales from './pages/Oficiales';
import Planes from './pages/Planes';
import Comprobante from './pages/Comprobante';
import Pagos from './pages/Pagos';
import Restablecer from './pages/Restablecer';
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
            <Route path="/restablecer" element={<Restablecer />} />

            <Route
              element={
                <RequireSession>
                  <Layout />
                </RequireSession>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="torneos" element={<RequirePermission permission={PERMISSIONS.MANAGE_TOURNAMENTS} feature="gestionar torneos"><Torneos /></RequirePermission>} />
              <Route path="planes" element={<Planes />} />
              <Route path="cobros" element={<Cobros />} />
              <Route path="mis-pagos" element={<MisPagos />} />
              <Route path="oficiales" element={<RequirePermission permission={PERMISSIONS.PAY_OFFICIALS} feature="liquidar pagos a oficiales"><Oficiales /></RequirePermission>} />
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
              <Route
                path="pagos"
                element={
                  <Pagos />
                }
              />
              {/* El resultado de Flow y el comprobante: el backend valida que el usuario pueda verlo. */}
              <Route path="pagos/resultado" element={<Comprobante />} />
              <Route path="pagos/:id" element={<Comprobante />} />
              <Route
                path="auditoria"
                element={
                  <RequirePermission permission={PERMISSIONS.MANAGE_USERS} feature="revisar la bitácora de auditoría">
                    <Auditoria />
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
