import { FileDown, Sheet } from 'lucide-react';
import { PERMISSIONS } from '../data/users';
import { useAuth } from '../hooks/useAuth';

// Excel: archivo CSV (se abre en Excel). PDF: el navegador imprime la vista actual y permite guardar como PDF.
// Exportar es parte de los planes: sin el permiso los botones no se muestran.
export default function ExportButtons({ onCsv }) {
  const { can } = useAuth();
  if (!can(PERMISSIONS.EXPORT)) return null;

  return (
    <div className="d-flex flex-wrap gap-2 no-print">
      <button type="button" className="btn btn-sm btn-outline-dark d-flex align-items-center gap-2" onClick={onCsv}>
        <Sheet size={15} /> Exportar Excel
      </button>
      <button type="button" className="btn btn-sm btn-outline-dark d-flex align-items-center gap-2" onClick={() => window.print()}>
        <FileDown size={15} /> Exportar PDF
      </button>
    </div>
  );
}
