import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { RequirePermission, RequireSession } from './components/RouteGuards';
import AuthProvider from './context/AuthProvider';
import { PERMISSIONS } from './data/users';
import Actas from './pages/Actas';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Posiciones from './pages/Posiciones';
import Torneos from './pages/Torneos';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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
            <Route
              path="actas"
              element={
                <RequirePermission permission={PERMISSIONS.RECORD_MATCHES} feature="registrar actas digitales">
                  <Actas />
                </RequirePermission>
              }
            />
            <Route path="posiciones" element={<Posiciones />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
