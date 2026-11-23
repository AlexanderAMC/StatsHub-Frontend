import { useState } from 'react';
import { Pencil, Search, Trash2, UserPlus } from 'lucide-react';
import UserFormModal from '../components/UserFormModal';
import { ASSIGNABLE_ROLES, ROLE_LABELS } from '../data/users';
import { useAuth } from '../hooks/useAuth';

export default function Usuarios() {
  const { user, accounts, setAccountStatus, setAccountRole, removeAccount, createAccount, updateAccount } = useAuth();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null); // { account } · account null = crear

  const query = search.trim().toLowerCase();
  
  // PROTECCIÓN 1: Validar que las propiedades existan antes de usar toLowerCase
  const visible = accounts.filter((a) => 
    !query || 
    (a.name && a.name.toLowerCase().includes(query)) || 
    (a.email && a.email.toLowerCase().includes(query))
  );

  const handleRemove = (account) => {
    if (window.confirm(`¿Eliminar la cuenta de ${account.name}? Esta acción no se puede deshacer.`)) {
      removeAccount(account.id);
    }
  };

  return (
    <div className="card border-0 shadow-sm rounded-3 p-3 p-md-4 bg-white">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="h4 fw-bold m-0" style={{ color: '#1E0A3C' }}>Usuarios y roles</h2>
          <p className="text-muted small mb-0">Asigna roles, bloquea o elimina cuentas. {accounts.length} cuentas registradas.</p>
        </div>
        <div className="d-flex flex-wrap gap-2">
        <button type="button" className="btn btn-sm text-white fw-bold d-flex align-items-center gap-1" style={{ backgroundColor: '#1E0A3C' }} onClick={() => setEditing({ account: null })}>
          <UserPlus size={16} /> Nuevo usuario
        </button>
        <div className="input-group input-group-sm" style={{ maxWidth: '280px' }}>
          <span className="input-group-text bg-light border-0"><Search size={16} className="text-muted" /></span>
          <input type="search" className="form-control border-0 bg-light" placeholder="Buscar por nombre o correo" aria-label="Buscar usuarios" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle border">
          <thead className="table-light">
            <tr><th>Usuario</th><th>Rol</th><th className="text-center">Estado</th><th className="text-end">Acciones</th></tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-muted py-5">
                  {accounts.length === 0 ? "Cargando usuarios o no hay usuarios registrados..." : "No hay usuarios que coincidan con la búsqueda."}
                </td>
              </tr>
            )}
            
            {visible.map((a) => {
              // PROTECCIÓN 2: Usar user?.id por si user es nulo al cargar
              const isSelf = a.id === user?.id; 
              
              // PROTECCIÓN 3: Normalizar el rol para evitar errores de mayúsculas
              const currentRole = a.role ? a.role.toLowerCase() : '';

              return (
                <tr key={a.id}>
                  <td>
                    <span className="fw-bold text-dark d-block">{a.name}{isSelf && <span className="badge bg-warning text-dark ms-2">Tú</span>}</span>
                    <span className="small text-muted">{a.email}</span>
                  </td>
                  <td>
                    <select 
                      className="form-select form-select-sm" 
                      style={{ minWidth: '150px' }} 
                      aria-label={`Rol de ${a.name}`} 
                      value={currentRole} 
                      disabled={isSelf} 
                      onChange={(e) => setAccountRole(a.id, e.target.value)}
                    >
                      {ASSIGNABLE_ROLES.map((r) => {
                        // Si los roles en data/users.js están en mayúsculas, los pasamos a minúscula aquí
                        const roleValue = r.toLowerCase(); 
                        return <option key={r} value={roleValue}>{ROLE_LABELS[r] || r}</option>
                      })}
                    </select>
                  </td>
                  <td className="text-center">
                    <span className={`badge rounded-pill px-3 py-1 ${a.status === 'activo' ? 'bg-success' : 'bg-danger'}`}>
                      {a.status === 'activo' ? 'Activo' : 'Bloqueado'}
                    </span>
                  </td>
                  <td className="text-end text-nowrap">
                    <button type="button" className="btn btn-sm btn-outline-dark me-2" onClick={() => setEditing({ account: a })} aria-label={`Editar a ${a.name}`}>
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-dark me-2"
                      disabled={isSelf}
                      onClick={() => setAccountStatus(a.id, a.status === 'activo' ? 'bloqueado' : 'activo')}
                    >
                      {a.status === 'activo' ? 'Bloquear' : 'Habilitar'}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-sm btn-outline-danger" 
                      disabled={isSelf} 
                      onClick={() => handleRemove(a)} 
                      aria-label={`Eliminar a ${a.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editing && (
        <UserFormModal
          account={editing.account}
          onHide={() => setEditing(null)}
          onSave={async (data) => {
            const result = editing.account ? await updateAccount(editing.account.id, data) : await createAccount(data);
            if (result.ok) setEditing(null);
            return result;
          }}
        />
      )}
    </div>
  );
}