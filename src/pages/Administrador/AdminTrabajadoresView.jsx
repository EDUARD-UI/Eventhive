import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Mail,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCw,
  Send,
  Trash2,
  Phone,
  Sparkles,
} from 'lucide-react';
import Badge from '../../components/Shared/Badge.jsx';
import Pagination from '../../components/Shared/Pagination.jsx';
import ModalInvitacionOficial from '../../components/componentsAdmin/ModalInvitacionOficial.jsx';
import adminService from '../../features/admin/services/adminService.js';
import { normalizeRole } from '../../services/session.js';
import { httpClient } from '../../services/httpClient.js';

export default function AdminTrabajadoresView() {
  const [activeTab, setActiveTab] = useState('trabajadores'); // 'trabajadores' | 'invitaciones'
  const [trabajadores, setTrabajadores] = useState([]);
  const [invitaciones, setInvitaciones] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [rolFilter, setRolFilter] = useState('TODOS'); // 'TODOS' | 'MODERADOR' | 'MARKETING'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  // Modal para Invitar / Enviar Comunicado
  const [mailModal, setMailModal] = useState({
    isOpen: false,
    email: '',
    name: '',
    subject: '',
    mode: 'invite', // 'invite' | 'comunicado'
  });

  // Modal revocar moderador
  const [modalRevocar, setModalRevocar] = useState(null);

  // Carga reactiva de trabajadores e invitaciones
  const fetchTrabajadores = useCallback(async () => {
    try {
      setLoading(true);
      const [modsRes, mktgRes, usersRes, invsRes] = await Promise.allSettled([
        adminService.getModeradores({ page: 0, size: 100 }),
        adminService.getTrabajadoresMarketing({ page: 0, size: 100 }),
        adminService.getUsuarios({ page: 0, size: 100 }),
        adminService.getInvitacionesEnviadas({ page: 0, size: 100 }),
      ]);

      const modsList =
        modsRes.status === 'fulfilled' && modsRes.value?.success
          ? modsRes.value.data
          : [];

      const mktgList =
        mktgRes.status === 'fulfilled' && mktgRes.value?.success
          ? mktgRes.value.data
          : [];

      const usersList =
        usersRes.status === 'fulfilled' && usersRes.value?.success
          ? usersRes.value.data
          : [];

      if (invsRes.status === 'fulfilled' && invsRes.value?.data) {
        setInvitaciones(invsRes.value.data);
      }

      // Mapear moderadores reales
      const formattedMods = modsList.map((m) => ({
        id: m.id,
        nombre: m.nombre || m.name || 'Moderador',
        correo: m.correo || m.email || '',
        telefono: m.telefono || m.phone || 'No registrado',
        rolNombre: 'MODERADOR',
      }));

      // Mapear trabajadores de marketing
      const formattedMktg = mktgList.map((m) => ({
        id: m.id,
        nombre: m.nombre || m.name || 'Especialista Marketing',
        correo: m.correo || m.email || '',
        telefono: m.telefono || m.phone || 'No registrado',
        rolNombre: 'MARKETING',
      }));

      // Extraer otros staff
      const formattedOtherStaff = usersList
        .filter((u) => {
          const r = normalizeRole(u.rolNombre || u.rol || u.role);
          const isStaff = r === 'MARKETING' || r === 'MODERADOR';
          const alreadyInMods = formattedMods.some((m) => m.id === u.id);
          const alreadyInMktg = formattedMktg.some((m) => m.id === u.id);
          return isStaff && !alreadyInMods && !alreadyInMktg;
        })
        .map((u) => ({
          id: u.id,
          nombre: u.nombre || u.name || 'Usuario Staff',
          correo: u.correo || u.email || '',
          telefono: u.telefono || 'No registrado',
          rolNombre: normalizeRole(u.rolNombre || u.rol || u.role),
        }));

      const mergedMap = new Map();
      [...formattedMods, ...formattedMktg, ...formattedOtherStaff].forEach((t) => {
        if (!mergedMap.has(t.id)) {
          mergedMap.set(t.id, t);
        }
      });

      setTrabajadores(Array.from(mergedMap.values()));
    } catch (err) {
      console.error('Error al cargar integrantes:', err);
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
        t.rolNombre?.toUpperCase() === rolFilter.toUpperCase();
      const matchSearch =
        t.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.correo?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchRole && matchSearch;
    });
  }, [trabajadores, rolFilter, searchTerm]);

  // Filtrado de invitaciones
  const filteredInvitaciones = useMemo(() => {
    return invitaciones.filter((inv) => {
      return (
        inv.correo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.rol?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [invitaciones, searchTerm]);

  const totalItems =
    activeTab === 'trabajadores'
      ? filteredTrabajadores.length
      : filteredInvitaciones.length;

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const source = activeTab === 'trabajadores' ? filteredTrabajadores : filteredInvitaciones;
    return source.slice(start, start + pageSize);
  }, [activeTab, filteredTrabajadores, filteredInvitaciones, currentPage, pageSize]);

  // Revocar moderador
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

  // Enviar invitación
  const handleInviteSubmit = async (inviteData) => {
    await adminService.invitarTrabajador(inviteData);
    setFeedbackMsg({
      type: 'success',
      text: `Invitación oficial enviada exitosamente a "${inviteData.email}" con el rol ${inviteData.rol}.`,
    });
    await fetchTrabajadores();
  };

  // Enviar comunicado administrativo
  const handleComunicadoSubmit = async ({ destinatario, asunto, mensaje }) => {
    await httpClient.post('/admin/correos/enviar', {
      destinatario,
      asunto,
      mensaje,
    });
    setFeedbackMsg({
      type: 'success',
      text: `Comunicado oficial despachado correctamente a "${destinatario}".`,
    });
  };

  // Reenviar invitación
  const handleReenviar = async (correo, rol) => {
    try {
      setActionLoading(true);
      await adminService.reenviarInvitacion(correo, rol);
      setFeedbackMsg({
        type: 'success',
        text: `Se generó un nuevo enlace de invitación para "${correo}" con vigencia de 24 horas.`,
      });
      await fetchTrabajadores();
    } catch (err) {
      setFeedbackMsg({
        type: 'error',
        text: err?.message || 'Error al reenviar la invitación.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const countPendientes = invitaciones.filter(
    (i) => (i.estado || '').toUpperCase() === 'PENDIENTE'
  ).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
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
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMsg(null)}
            className="text-slate-400 hover:text-slate-600 ml-4 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Encabezado y Acciones */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" strokeWidth={2} />
            <span>Gestión del Equipo y Privilegios</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Administra a moderadores y especialistas de marketing, o emite invitaciones seguras con token
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            type="button"
            onClick={() =>
              setMailModal({
                isOpen: true,
                email: '',
                name: '',
                subject: '',
                mode: 'comunicado',
              })
            }
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all active:scale-95 shadow-2xs cursor-pointer"
          >
            <Mail size={14} className="text-slate-500" />
            <span>Redactar Comunicado</span>
          </button>

          <button
            type="button"
            onClick={() =>
              setMailModal({
                isOpen: true,
                email: '',
                name: '',
                subject: '',
                mode: 'invite',
              })
            }
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <UserPlus size={14} className="text-amber-400" />
            <span>Invitar Colaborador</span>
          </button>
        </div>
      </div>

      {/* Sistema de Pestañas SaaS */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => {
            setActiveTab('trabajadores');
            setCurrentPage(1);
          }}
          className={`pb-3 px-3 text-xs font-bold transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
            activeTab === 'trabajadores'
              ? 'border-amber-500 text-slate-950'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield size={14} />
          <span>Integrantes Activos ({trabajadores.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('invitaciones');
            setCurrentPage(1);
          }}
          className={`pb-3 px-3 text-xs font-bold transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
            activeTab === 'invitaciones'
              ? 'border-amber-500 text-slate-950'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Mail size={14} />
          <span>Invitaciones Enviadas ({invitaciones.length})</span>
          {countPendientes > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          )}
        </button>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={
              activeTab === 'trabajadores'
                ? 'Buscar por nombre o correo...'
                : 'Buscar por correo de invitación...'
            }
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-900 placeholder:text-slate-400"
          />
        </div>

        {activeTab === 'trabajadores' && (
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold gap-1 self-end md:self-center">
            {['TODOS', 'MODERADOR', 'MARKETING'].map((rf) => (
              <button
                key={rf}
                type="button"
                onClick={() => {
                  setRolFilter(rf);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  rolFilter === rf
                    ? 'bg-white text-slate-950 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {rf}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TABLA PRINCIPAL */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === 'trabajadores' ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Colaborador</th>
                  <th className="py-3.5 px-4">Correo</th>
                  <th className="py-3.5 px-4">Teléfono</th>
                  <th className="py-3.5 px-4 text-center">Rol Asignado</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No se encontraron integrantes activos con los criterios seleccionados.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{t.nombre}</div>
                        <span className="text-[11px] text-slate-400 font-mono">ID #{t.id}</span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {t.correo || '—'}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500">
                        {t.telefono || '—'}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <Badge
                          variant={t.rolNombre === 'MODERADOR' ? 'warning' : 'info'}
                          size="xs"
                        >
                          {t.rolNombre}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              setMailModal({
                                isOpen: true,
                                email: t.correo,
                                name: t.nombre,
                                subject: 'Aviso del equipo administrativo de EventHive',
                                mode: 'comunicado',
                              })
                            }
                            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Enviar comunicado por correo"
                          >
                            <Mail size={15} />
                          </button>

                          {t.rolNombre === 'MODERADOR' && (
                            <button
                              type="button"
                              onClick={() => setModalRevocar(t)}
                              className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Revocar rol de moderador"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            /* TABLA DE INVITACIONES EMITIDAS POR EL ADMINISTRADOR */
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Correo Invitado</th>
                  <th className="py-3.5 px-4">Rol Asignado</th>
                  <th className="py-3.5 px-4">Fecha de Envío</th>
                  <th className="py-3.5 px-4">Fecha Expiración</th>
                  <th className="py-3.5 px-4 text-center">Estado</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No hay invitaciones emitidas registradas.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((inv, idx) => {
                    const estado = (inv.estado || 'PENDIENTE').toUpperCase();
                    const badgeVariant =
                      estado === 'ACEPTADA'
                        ? 'success'
                        : estado === 'RECHAZADA' || estado === 'EXPIRADA'
                        ? 'danger'
                        : 'warning';

                    return (
                      <tr key={inv.id || idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {inv.correo}
                        </td>

                        <td className="py-3.5 px-4">
                          <Badge variant="neutral" size="xs">
                            {inv.rol || 'STAFF'}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4 text-slate-500">
                          {inv.fechaInvitacion || inv.fechaEnvio || '—'}
                        </td>

                        <td className="py-3.5 px-4 text-slate-500">
                          {inv.fechaExpiracion || '24 horas posteriores'}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <Badge variant={badgeVariant} size="xs">
                            {estado}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {(estado === 'PENDIENTE' || estado === 'EXPIRADA') && (
                            <button
                              type="button"
                              onClick={() => handleReenviar(inv.correo, inv.rol)}
                              disabled={actionLoading}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold text-xs transition-all cursor-pointer shadow-2xs"
                              title="Reenviar enlace con nueva vigencia de 24h"
                            >
                              <RotateCw size={12} />
                              <span>Reenviar</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Paginación */}
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

      {/* Modal de Invitación / Comunicado */}
      <ModalInvitacionOficial
        isOpen={mailModal.isOpen}
        onClose={() => setMailModal((prev) => ({ ...prev, isOpen: false }))}
        onSendInvite={handleInviteSubmit}
        onSendComunicado={handleComunicadoSubmit}
        mode={mailModal.mode}
        initialEmail={mailModal.email}
        initialName={mailModal.name}
      />

      {/* Modal Confirmación de Revocar Moderador */}
      {modalRevocar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                ¿Revocar rol de Moderador?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                El usuario <strong>{modalRevocar.nombre}</strong> perderá los privilegios de moderación en la plataforma y volverá a ser CLIENTE.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalRevocar(null)}
                disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmRevocar}
                disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm"
              >
                {actionLoading ? 'Revocando...' : 'Sí, Revocar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
