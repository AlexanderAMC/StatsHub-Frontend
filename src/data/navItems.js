import {
  BarChart2, CalendarDays, CreditCard, Crown, FileText, Flag, LayoutDashboard, Receipt, ShieldCheck, Trophy, UserCog, Users, Wallet,
} from 'lucide-react';
import { PERMISSIONS } from './users';

const P = PERMISSIONS;

// Menú por perfil: cada opción solo aparece a quien puede usarla (sin candados).
//   permission: permiso requerido · anyOf: basta uno de varios · roles: solo esos roles · members: requiere cuenta.
export const NAV_ITEMS = [
  // Portal público (todos)
  { path: '/', label: 'Inicio', icon: LayoutDashboard },
  { path: '/calendario', label: 'Calendario de Partidos', icon: CalendarDays },
  { path: '/estadisticas', label: 'Posiciones y Analítica', icon: BarChart2 },
  { path: '/equipos', label: 'Equipos y Jugadores', icon: Users },
  { path: '/planes', label: 'Planes', icon: Crown },
  // Gestión (según rol o plan)
  { path: '/torneos', label: 'Gestión de Torneos', icon: Trophy, permission: P.MANAGE_TOURNAMENTS },
  { path: '/actas', label: 'Actas Digitales (En Vivo)', icon: FileText, permission: P.RECORD_MATCHES },
  { path: '/cobros', label: 'Cobros a Equipos', icon: Receipt, anyOf: [P.COLLECT, P.OWN_TEAM] },
  { path: '/oficiales', label: 'Pagos a Oficiales', icon: Flag, permission: P.PAY_OFFICIALS },
  { path: '/mis-pagos', label: 'Mis Pagos', icon: Wallet, roles: ['arbitro', 'estadigrafo'] },
  { path: '/pagos', label: 'Comprobantes', icon: CreditCard, members: true },
  { path: '/usuarios', label: 'Usuarios y Roles', icon: UserCog, permission: P.MANAGE_USERS },
  { path: '/auditoria', label: 'Auditoría', icon: ShieldCheck, permission: P.MANAGE_USERS },
];
