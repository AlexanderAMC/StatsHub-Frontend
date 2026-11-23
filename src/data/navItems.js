import { BarChart2, CalendarDays, CreditCard, FileText, LayoutDashboard, ShieldCheck, Trophy, UserCog, Users } from 'lucide-react';
import { PERMISSIONS } from './users';

// permission: sin ella el ítem aparece con candado (o se oculta si hideIfDenied).
export const NAV_ITEMS = [
  { path: '/', label: 'Dashboard General', icon: LayoutDashboard },
  { path: '/torneos', label: 'Gestión de Torneos', icon: Trophy },
  { path: '/equipos', label: 'Equipos y Jugadores', icon: Users },
  { path: '/calendario', label: 'Calendario de Partidos', icon: CalendarDays },
  { path: '/actas', label: 'Actas Digitales (En Vivo)', icon: FileText, permission: PERMISSIONS.RECORD_MATCHES },
  { path: '/estadisticas', label: 'Posiciones y Analítica', icon: BarChart2 },
  { path: '/pagos', label: 'Pagos de Inscripción', icon: CreditCard, permission: PERMISSIONS.MANAGE_TEAMS, hideIfDenied: true },
  { path: '/usuarios', label: 'Usuarios y Roles', icon: UserCog, permission: PERMISSIONS.MANAGE_USERS, hideIfDenied: true },
  { path: '/auditoria', label: 'Auditoría', icon: ShieldCheck, permission: PERMISSIONS.MANAGE_USERS, hideIfDenied: true },
];
