import { useState } from 'react';
import { FileDown, Lock, Sheet } from 'lucide-react';
import RestrictedActionModal from './RestrictedActionModal';
import { PERMISSIONS } from '../data/users';
import { useAuth } from '../hooks/useAuth';

// Excel: archivo CSV (se abre en Excel). PDF: el navegador imprime la vista actual y permite guardar como PDF.
export default function ExportButtons({ onCsv }) {
  const { can } = useAuth();
  const allowed = can(PERMISSIONS.EXPORT);
  const [showRestricted, setShowRestricted] = useState(false);

  const guard = (action) => () => (allowed ? action() : setShowRestricted(true));

  return (
    <>
      <div className="d-flex flex-wrap gap-2 no-print">
        <button type="button" className="btn btn-sm btn-outline-dark d-flex align-items-center gap-2" onClick={guard(onCsv)}>
          {allowed ? <Sheet size={15} /> : <Lock size={15} />} Exportar Excel
        </button>
        <button type="button" className="btn btn-sm btn-outline-dark d-flex align-items-center gap-2" onClick={guard(() => window.print())}>
          {allowed ? <FileDown size={15} /> : <Lock size={15} />} Exportar PDF
        </button>
      </div>
      {showRestricted && <RestrictedActionModal show onHide={() => setShowRestricted(false)} action="exportar reportes" />}
    </>
  );
}
