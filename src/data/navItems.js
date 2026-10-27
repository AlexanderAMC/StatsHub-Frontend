import { BarChart2, Calendar, FileText, Trophy } from 'lucide-react';
import { PERMISSIONS } from './users';

// permission: si se indica, el ítem aparece con candado a quien no la tenga.
export const NAV_ITEMS = [
  { path: '/', label: 'Dashboard General', icon: Trophy },
  { path: '/torneos', label: 'Gestión de Torneos', icon: Calendar },
  { path: '/actas', label: 'Actas Digitales (En Vivo)', icon: FileText, permission: PERMISSIONS.RECORD_MATCHES },
  { path: '/posiciones', label: 'Posiciones y Analítica', icon: BarChart2 },
];
