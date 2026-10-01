import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Search,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Plus,
} from 'lucide-react';
import Badge from '../../components/Shared/Badge.jsx';
import Pagination from '../../components/Shared/Pagination.jsx';
import AdminInfoAlert from '../../components/componentsAdmin/AdminInfoAlert.jsx';
import adminService from '../../features/admin/services/adminService.js';

export default function AdminModeradoresView({
  moderadores: initialModeradores = [],
  onRevocarModerador,
  onAsignarModerador,
}) {
  const [moderadoresList, setModeradoresList] = useState(initialModeradores);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(initialModeradores.length || 0);
  const [loading, setLoading] = useState(false);
  const [modalRevocar, setModalRevocar] = useState(null); // moderador a revocar
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  // Carga reactiva de moderadores desde el endpoint paginado GET /api/moderaciones/moderadores
  const fetchModeradores = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getModeradores({
        page: currentPage - 1,
        size: pageSize,
      });
      if (res.success) {
        setModeradoresList(res.data);
        setTotalItems(res.total);
      }
    } catch (err) {
      console.warn('Error al cargar lista de moderadores:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    fetchModeradores();
  }, [fetchModeradores]);

  useEffect(() => {
    if (initialModeradores && initialModeradores.length > 0 && !searchTerm) {
      setModeradoresList(initialModeradores);
      setTotalItems(initialModeradores.length);
    }
  }, [initialModeradores]);

  // Filtrado local reactivo si hay término de búsqueda
  const filteredModeradores = moderadoresList.filter((m) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      m.nombre?.toLowerCase().includes(term) ||
      m.correo?.toLowerCase().includes(term) ||
      m.email?.toLowerCase().includes(term) ||
      m.telefono?.toLowerCase().includes(term)
    );
  });

  const handleConfirmRevocar = async () => {
    if (!modalRevocar) return;
    try {
      setActionLoading(true);
      if (onRevocarModerador) {
        await onRevocarModerador(modalRevocar.id);
      } else {
        await adminService.revocarModerador(modalRevocar.id);
      }
      setFeedbackMsg({
        type: 'success',
        text: `El rol de moderador fue revocado exitosamente a "${modalRevocar.nombre}".`,
      });
      setModalRevocar(null);
      await fetchModeradores();
    } catch (err) {
      setFeedbackMsg({
        type: 'error',
        text: err.message || 'Error al revocar el rol de moderador.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Alerta Informativa Inicial (Requisito 10) */}
      <AdminInfoAlert
        id="moderadores"
        title="Gestión de Moderadores Institucionales"
        description="Esta sección se destina exclusivamente a listar el personal con rol de moderador y gestionar sus accesos cuando concluya su vinculación con la empresa. La supervisión técnica de eventos corresponde de forma privativa a la bandeja del Moderador."
      />

      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold ${
            feedbackMsg.type === 'error'
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button
            type="button"
            onClick={() => setFeedbackMsg(null)}
            className="text-slate-400 hover:text-slate-700 ml-3"
          >
            ✕
          </button>
        </div>
      )}

      {/* Encabezado y Buscador */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-primary" strokeWidth={1.75} />
            <span>Directorio de Moderadores</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Usuarios activos con permisos de moderación de contenido en Eventhive
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Buscar por nombre, correo o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Tabla de Moderadores */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">ID</th>
                <th className="py-3.5 px-4">Nombre Completo</th>
                <th className="py-3.5 px-4">Correo Electrónico</th>
                <th className="py-3.5 px-4">Teléfono</th>
                <th className="py-3.5 px-4 text-center">Rol en Sistema</th>
                <th className="py-3.5 px-4 text-right">Acción Administrativa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Cargando moderadores...
                  </td>
                </tr>
              ) : filteredModeradores.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No se encontraron usuarios con rol de moderador.
                  </td>
                </tr>
              ) : (
                filteredModeradores.map((mod) => (
                  <tr key={mod.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* ID */}
                    <td className="py-4 px-4 font-mono font-bold text-slate-400 text-[11px]">
                      #{mod.id}
                    </td>

                    {/* Nombre */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-sm shrink-0">
                          {mod.nombre?.charAt(0) || 'M'}
                        </div>
                        <span className="font-bold text-slate-900">{mod.nombre}</span>
                      </div>
                    </td>

                    {/* Correo */}
                    <td className="py-4 px-4 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{mod.correo || mod.email || '—'}</span>
                      </div>
                    </td>

                    {/* Teléfono */}
                    <td className="py-4 px-4 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{mod.telefono || '—'}</span>
                      </div>
                    </td>

                    {/* Rol */}
                    <td className="py-4 px-4 text-center">
                      <Badge variant="primary" size="xs">
                        {mod.rolNombre || 'MODERADOR'}
                      </Badge>
                    </td>

                    {/* Botón Revocar Rol */}
                    <td className="py-4 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setModalRevocar(mod)}
                        className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-rose-200 text-rose-700 bg-rose-50/60 hover:bg-rose-100 text-xs font-bold transition-all active:scale-95"
                        title="Revocar permisos de moderador a este usuario"
                      >
                        <UserX className="w-3.5 h-3.5 text-rose-600" />
                        <span>Revocar Rol</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          pageSizeOptions={[5, 10, 20]}
        />
      </div>

      {/* Modal Confirmar Revocación de Rol */}
      {modalRevocar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setModalRevocar(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
                <UserX className="w-6 h-6" strokeWidth={2} />
              </div>
              <h3 className="font-display text-base font-bold text-slate-900">
                ¿Revocar rol de moderador?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Esta acción retirará de inmediato el rol de moderador a <strong>{modalRevocar.nombre}</strong> ({modalRevocar.correo || modalRevocar.email}).
              </p>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed bg-amber-50/70 p-3 rounded-xl border border-amber-200 text-amber-900">
                Utilice esta opción cuando el usuario ya no pertenezca a la empresa o no deba continuar ejerciendo labores de moderación.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalRevocar(null)}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRevocar}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs transition-all active:scale-95 disabled:opacity-50"
                >
                  {actionLoading ? 'Procesando...' : 'Confirmar Revocación'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
