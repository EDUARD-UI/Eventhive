import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users,
  ShieldCheck,
  Mail,
  Phone,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  UserCheck,
  UserX,
  UserPlus,
  RefreshCw,
} from 'lucide-react';
import Badge from '../../components/Shared/Badge.jsx';
import Pagination from '../../components/Shared/Pagination.jsx';
import AdminInfoAlert from '../../components/componentsAdmin/AdminInfoAlert.jsx';
import ModalEnviarCorreo from '../../components/Shared/ModalEnviarCorreo.jsx';
import ModalInvitarTrabajadorAdmin from '../../components/componentsAdmin/ModalInvitarTrabajadorAdmin.jsx';
import adminService from '../../features/admin/services/adminService.js';
import { normalizeRole } from '../../services/session.js';

export default function AdminTrabajadoresView({
  onAsignarModerador,
  onToggleEstadoModerador,
}) {
  const [trabajadores, setTrabajadores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [rolFilter, setRolFilter] = useState('TODOS'); // 'TODOS' | 'MODERADOR' | 'MARKETING'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  // Estado del Modal de Invitar Trabajador (a la derecha)
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  // Estado del Modal de Enviar Correo (individual a la derecha)
  const [mailModal, setMailModal] = useState({
    isOpen: false,
    email: '',
    name: '',
    subject: '',
  });

  // Modal revocar moderador
  const [modalRevocar, setModalRevocar] = useState(null);

  // Carga reactiva de trabajadores desde endpoints reales (GET /moderaciones/moderadores y GET /usuarios)
  const fetchTrabajadores = useCallback(async () => {
    try {
      setLoading(true);
      const [modsRes, usersRes] = await Promise.allSettled([
        adminService.getModeradores({ page: 0, size: 100 }),
        adminService.getUsuarios({ page: 0, size: 100 }),
      ]);

      const modsList =
        modsRes.status === 'fulfilled' && modsRes.value?.success
          ? modsRes.value.data
          : [];

      const usersList =
        usersRes.status === 'fulfilled' && usersRes.value?.success
          ? usersRes.value.data
          : [];

      // Mapear moderadores
      const formattedMods = modsList.map((m) => ({
        id: m.id,
        nombre: m.nombre || m.name || 'Moderador',
        correo: m.correo || m.email || '',
        telefono: m.telefono || m.phone || 'No registrado',
        rolNombre: 'MODERADOR',
        activo: m.activo !== false,
      }));

      // Extraer usuarios con rol MARKETING o MODERADOR que no estén duplicados
      const formattedMarketingAndStaff = usersList
        .filter((u) => {
          const r = normalizeRole(u.rolNombre || u.rol || u.role);
          return r === 'MARKETING' || (r === 'MODERADOR' && !formattedMods.some((m) => m.id === u.id));
        })
        .map((u) => ({
          id: u.id,
          nombre: u.nombre || u.name || 'Usuario Staff',
          correo: u.correo || u.email || '',
          telefono: u.telefono || 'No registrado',
          rolNombre: normalizeRole(u.rolNombre || u.rol || u.role),
          activo: u.activo !== false,
        }));

      // Combinar listas sin duplicados por ID
      const mergedMap = new Map();
      [...formattedMods, ...formattedMarketingAndStaff].forEach((t) => {
        if (!mergedMap.has(t.id)) {
          mergedMap.set(t.id, t);
        }
      });

      setTrabajadores(Array.from(mergedMap.values()));
    } catch (err) {
      console.warn('Error al cargar lista de trabajadores:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrabajadores();
  }, [fetchTrabajadores]);

  // Filtrado de trabajadores
  const filteredTrabajadores = useMemo(() => {
    return trabajadores.filter((t) => {
      const matchRole =
        rolFilter === 'TODOS' ||
        (rolFilter === 'MODERADOR' && t.rolNombre === 'MODERADOR') ||
        (rolFilter === 'MARKETING' && t.rolNombre === 'MARKETING');

      if (!matchRole) return false;

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        t.nombre?.toLowerCase().includes(term) ||
        t.correo?.toLowerCase().includes(term) ||
        t.telefono?.toLowerCase().includes(term)
      );
    });
  }, [trabajadores, rolFilter, searchTerm]);

  // Paginación en cliente
  const paginatedTrabajadores = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTrabajadores.slice(start, start + pageSize);
  }, [filteredTrabajadores, currentPage, pageSize]);

  const handleConfirmRevocar = async () => {
    if (!modalRevocar) return;
    try {
      setActionLoading(true);
      await adminService.revocarModerador(modalRevocar.id);
      setFeedbackMsg({
        type: 'success',
        text: `El rol de moderador fue revocado exitosamente a "${modalRevocar.nombre}".`,
      });
      setModalRevocar(null);
      await fetchTrabajadores();
    } catch (err) {
      setFeedbackMsg({
        type: 'error',
        text: err?.message || 'Error al revocar el rol de moderador.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleInviteSuccess = async (inviteData) => {
    await adminService.invitarTrabajador(inviteData);
    setFeedbackMsg({
      type: 'success',
      text: `Invitación enviada exitosamente a "${inviteData.email}" con el rol de ${inviteData.rol}.`,
    });
    if (inviteData.rol === 'MODERADOR' && onAsignarModerador) {
      try {
        await onAsignarModerador(inviteData.email);
      } catch {
        // Fallback silencioso
      }
    }
    await fetchTrabajadores();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Alerta Informativa Inicial */}
      <AdminInfoAlert
        id="trabajadores"
        title="Directorio de Trabajadores del Sistema"
        description="Esta sección lista el personal con roles operativos y de moderación en la plataforma (MODERADOR y MARKETING). Puedes invitar a nuevos colaboradores eligiendo su rol, comunicarte individualmente o gestionar sus permisos institucionales."
      />

      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMsg(null)}
            className="text-slate-400 hover:text-slate-600 ml-4 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Encabezado y Buscador Limpio (Mismo diseño institucional) */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" strokeWidth={1.75} />
            <span>Directorio de Trabajadores</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Usuarios activos con roles de MODERADOR y MARKETING en Eventhive
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Botón Invitar Trabajador */}
          <button
            type="button"
            onClick={() => setInviteModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-amber-300 text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shadow-xs cursor-pointer"
          >
            <UserPlus size={15} />
            <span>Invitar Trabajador</span>
          </button>

          {/* Filtro por Rol */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold gap-1">
            {['TODOS', 'MODERADOR', 'MARKETING'].map((rf) => (
              <button
                key={rf}
                type="button"
                onClick={() => {
                  setRolFilter(rf);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all text-xs font-bold ${
                  rolFilter === rf
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {rf}
              </button>
            ))}
          </div>

          {/* Campo de búsqueda */}
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth={1.75} />
            <input
              type="text"
              placeholder="Buscar por nombre, correo o teléfono..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <button
            type="button"
            onClick={fetchTrabajadores}
            title="Recargar datos"
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Tabla Limpia de Trabajadores */}
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
                    Cargando trabajadores...
                  </td>
                </tr>
              ) : filteredTrabajadores.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No se encontraron trabajadores registrados.
                  </td>
                </tr>
              ) : (
                paginatedTrabajadores.map((t) => {
                  const isMod = t.rolNombre === 'MODERADOR';
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* ID */}
                      <td className="py-4 px-4 font-mono font-bold text-slate-400 text-[11px]">
                        #{t.id}
                      </td>

                      {/* Nombre */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm shrink-0">
                            {t.nombre?.charAt(0) || 'T'}
                          </div>
                          <span className="font-bold text-slate-900">{t.nombre}</span>
                        </div>
                      </td>

                      {/* Correo */}
                      <td className="py-4 px-4 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{t.correo || '—'}</span>
                        </div>
                      </td>

                      {/* Teléfono */}
                      <td className="py-4 px-4 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{t.telefono || '—'}</span>
                        </div>
                      </td>

                      {/* Rol */}
                      <td className="py-4 px-4 text-center">
                        <Badge variant={isMod ? 'primary' : 'neutral'} size="xs">
                          {t.rolNombre}
                        </Badge>
                      </td>

                      {/* Acciones Individuales */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setMailModal({
                                isOpen: true,
                                email: t.correo,
                                name: t.nombre,
                                subject: `Comunicación para ${t.nombre} (${t.rolNombre})`,
                              })
                            }
                            className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-bold transition-all active:scale-95"
                            title="Enviar correo individual a este trabajador"
                          >
                            <Mail className="w-3.5 h-3.5 text-slate-500" />
                            <span>Correo</span>
                          </button>

                          {isMod && (
                            <button
                              type="button"
                              onClick={() => setModalRevocar(t)}
                              className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-rose-200 text-rose-700 bg-rose-50/60 hover:bg-rose-100 text-xs font-bold transition-all active:scale-95"
                              title="Revocar permisos de moderador a este usuario"
                            >
                              <UserX className="w-3.5 h-3.5 text-rose-600" />
                              <span>Revocar</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredTrabajadores.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          pageSizeOptions={[5, 10, 20]}
        />
      </div>

      {/* Modal Confirmar Revocación */}
      {modalRevocar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <UserX size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">¿Revocar rol de Moderador?</h3>
              <p className="text-xs text-slate-500 mt-1">
                ¿Estás seguro de que deseas retirar los permisos de moderación a{' '}
                <strong className="text-slate-800">{modalRevocar.nombre}</strong>? El usuario volverá al rol base.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalRevocar(null)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmRevocar}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {actionLoading ? 'Revocando...' : 'Sí, revocar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Genérico de Enviar Correo (Se abre a la derecha) */}
      <ModalEnviarCorreo
        isOpen={mailModal.isOpen}
        onClose={() => setMailModal((prev) => ({ ...prev, isOpen: false }))}
        initialEmail={mailModal.email}
        initialName={mailModal.name}
        defaultSubject={mailModal.subject}
        title="Enviar Correo al Trabajador"
        subtitle="Comunicación individual directa con el colaborador"
      />

      {/* Modal Drawer de Invitar Trabajador (Se abre a la derecha) */}
      <ModalInvitarTrabajadorAdmin
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onInviteSuccess={handleInviteSuccess}
      />
    </div>
  );
}
