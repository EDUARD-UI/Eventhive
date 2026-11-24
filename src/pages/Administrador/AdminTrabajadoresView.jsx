import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Users,
  UserPlus,
  Shield,
  Mail,
  Search,
  RotateCw,
  Trash2,
} from 'lucide-react';
import Pagination from '../../components/Shared/Pagination.jsx';
import ModalInvitacionOficial from '../../components/componentsAdmin/ModalInvitacionOficial.jsx';
import ComposeMailDrawer from '../../components/Shared/ComposeMailDrawer.jsx';
import adminService from '../../features/admin/services/adminService.js';
import { normalizeRole } from '../../services/session.js';
import { showSuccessAlert, showErrorAlert } from '../../utils/alertUtils.js';

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

  // Modal para Invitar con token
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  // ComposeMailDrawer para enviar comunicado / correo
  const [mailDrawer, setMailDrawer] = useState({
    isOpen: false,
    recipientEmail: '',
    recipientName: '',
    initialSubject: '',
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
      if (modalRevocar.rolNombre === 'MARKETING') {
        await adminService.revocarRolMarketing(modalRevocar.id);
      } else {
        await adminService.revocarModerador(modalRevocar.id);
      }
      setModalRevocar(null);
      await showSuccessAlert({
        title: 'Rol revocado',
        text: `El rol de ${modalRevocar.rolNombre.toLowerCase()} fue revocado exitosamente a "${modalRevocar.nombre}".`,
      });
      await fetchTrabajadores();
    } catch (err) {
      await showErrorAlert({
        title: 'Error al revocar rol',
        text: err?.message || 'Error al revocar el rol.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Enviar invitación
  const handleInviteSubmit = async (inviteData) => {
    await adminService.invitarTrabajador(inviteData);
    await showSuccessAlert({
      title: 'Invitación enviada',
      text: `Invitación oficial enviada exitosamente a "${inviteData.email}" con el rol ${inviteData.rol}.`,
    });
    setInviteModalOpen(false);
    await fetchTrabajadores();
  };

  // Reenviar invitación
  const handleReenviar = async (correo, rol) => {
    try {
      setActionLoading(true);
      await adminService.reenviarInvitacion(correo, rol);
      await showSuccessAlert({
        title: 'Invitación reenviada',
        text: `Se generó un nuevo enlace de invitación para "${correo}" con vigencia de 24 horas.`,
      });
      await fetchTrabajadores();
    } catch (err) {
      await showErrorAlert({
        title: 'Error al reenviar',
        text: err?.message || 'Error al reenviar la invitación.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const countModeradores = useMemo(() => {
    return trabajadores.filter((t) => t.rolNombre === 'MODERADOR').length;
  }, [trabajadores]);

  const countMarketing = useMemo(() => {
    return trabajadores.filter((t) => t.rolNombre === 'MARKETING').length;
  }, [trabajadores]);

  const countPendientes = invitaciones.filter(
    (i) => (i.estado || '').toUpperCase() === 'PENDIENTE'
  ).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#0F2342] font-display">
            EQUIPO Y PRIVILEGIOS
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Administración de moderadores y especialistas de marketing, o emisión de credenciales de acceso.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setInviteModalOpen(true)}
            className="px-4 py-2 bg-[#0F2342] text-white font-mono text-xs font-bold tracking-wider rounded-[2px] hover:bg-[#F5B800] hover:text-[#0F2342] transition-colors inline-flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <UserPlus size={14} />
            <span>INVITAR COLABORADOR</span>
          </button>
        </div>
      </div>

      {/* Barra de Resumen en Línea con Separadores Verticales */}
      <div className="bg-white border border-[#E2E8F0] rounded-[2px] p-3 flex flex-wrap items-center divide-x divide-[#E2E8F0] shadow-sm">
        <div className="px-4 py-1 text-left">
          <span className="font-mono text-[10px] text-slate-500 tracking-wider uppercase block">INTEGRANTES ACTIVOS</span>
          <span className="font-mono text-sm font-bold text-[#0F2342]">{trabajadores.length}</span>
        </div>
        <div className="px-4 py-1 text-left">
          <span className="font-mono text-[10px] text-slate-500 tracking-wider uppercase block">MODERADORES</span>
          <span className="font-mono text-sm font-bold text-[#0F2342]">{countModeradores}</span>
        </div>
        <div className="px-4 py-1 text-left">
          <span className="font-mono text-[10px] text-slate-500 tracking-wider uppercase block">MARKETING</span>
          <span className="font-mono text-sm font-bold text-[#0F2342]">{countMarketing}</span>
        </div>
        <div className="px-4 py-1 text-left">
          <span className="font-mono text-[10px] text-slate-500 tracking-wider uppercase block flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F5B800]" />
            INVITACIONES EN ESPERA
          </span>
          <span className="font-mono text-sm font-bold text-[#D97706]">{countPendientes}</span>
        </div>
      </div>

      {/* Tabs Tipográficos con Subrayado #F5B800 */}
      <div className="flex items-center gap-6 border-b border-[#E2E8F0]">
        <button
          type="button"
          onClick={() => {
            setActiveTab('trabajadores');
            setCurrentPage(1);
          }}
          className={`pb-3 font-mono text-xs font-bold tracking-wider transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
            activeTab === 'trabajadores'
              ? 'border-[#F5B800] text-[#0F2342]'
              : 'border-transparent text-slate-400 hover:text-[#0F2342]'
          }`}
        >
          <Shield size={14} />
          <span>INTEGRANTES ACTIVOS ({trabajadores.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('invitaciones');
            setCurrentPage(1);
          }}
          className={`pb-3 font-mono text-xs font-bold tracking-wider transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
            activeTab === 'invitaciones'
              ? 'border-[#F5B800] text-[#0F2342]'
              : 'border-transparent text-slate-400 hover:text-[#0F2342]'
          }`}
        >
          <Mail size={14} />
          <span>INVITACIONES ENVIADAS ({invitaciones.length})</span>
        </button>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-3 rounded-[2px] border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
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
            className="w-full pl-9 pr-3 py-2 rounded-[2px] border border-[#E2E8F0] text-xs focus:outline-none focus:border-[#0F2342] transition-colors"
          />
        </div>

        {activeTab === 'trabajadores' && (
          <div className="flex gap-2">
            {['TODOS', 'MODERADOR', 'MARKETING'].map((rf) => (
              <button
                key={rf}
                type="button"
                onClick={() => {
                  setRolFilter(rf);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-[2px] font-mono text-[11px] font-bold tracking-wider transition-colors cursor-pointer ${
                  rolFilter === rf
                    ? 'bg-[#0F2342] text-white'
                    : 'border border-[#E2E8F0] bg-white text-slate-600 hover:bg-[#F8F9FA]'
                }`}
              >
                {rf}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TABLA PRINCIPAL CON SCROLL EDITORIAL */}
      <div className="bg-white rounded-[2px] border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto editorial-scroll-x">
          {activeTab === 'trabajadores' ? (
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#F8F9FA] border-b border-[#E2E8F0] text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Colaborador</th>
                  <th className="py-3 px-4">Correo</th>
                  <th className="py-3 px-4">Teléfono</th>
                  <th className="py-3 px-4 text-center">Rol Asignado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-mono text-xs">
                      Cargando integrantes del equipo...
                    </td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-mono text-xs">
                      No se encontraron integrantes activos con los criterios seleccionados.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((t) => (
                    <tr key={t.id} className="hover:bg-[#F8F9FA] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#0F2342]">{t.nombre}</div>
                      </td>

                      <td className="py-3 px-4 text-slate-600 font-mono text-xs">
                        {t.correo || '—'}
                      </td>

                      <td className="py-3 px-4 text-slate-500 font-mono text-xs">
                        {t.telefono || '—'}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="font-mono text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 text-[#0F2342]">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            t.rolNombre === 'MODERADOR' ? 'bg-[#F5B800]' : 'bg-[#0F2342]'
                          }`} />
                          {t.rolNombre}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              setMailDrawer({
                                isOpen: true,
                                recipientEmail: t.correo,
                                recipientName: t.nombre,
                                initialSubject: 'Comunicación oficial de EventHive',
                              })
                            }
                            className="p-1.5 rounded-[2px] border border-[#E2E8F0] text-[#0F2342] hover:bg-[#0F2342] hover:text-white transition-colors cursor-pointer"
                            title="Enviar correo"
                          >
                            <Mail size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setModalRevocar(t)}
                            className="p-1.5 rounded-[2px] border border-[#E2E8F0] text-[#DC2626] hover:bg-[#DC2626] hover:text-white transition-colors cursor-pointer"
                            title={`Revocar rol de ${t.rolNombre.toLowerCase()}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            /* TABLA DE INVITACIONES EMITIDAS POR EL ADMINISTRADOR */
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#F8F9FA] border-b border-[#E2E8F0] text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Correo Invitado</th>
                  <th className="py-3 px-4">Rol Asignado</th>
                  <th className="py-3 px-4">Fecha Envío</th>
                  <th className="py-3 px-4">Fecha Expiración</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-mono text-xs">
                      No hay invitaciones emitidas registradas.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((inv, idx) => {
                    const estado = (inv.estado || 'PENDIENTE').toUpperCase();

                    return (
                      <tr key={inv.id || idx} className="hover:bg-[#F8F9FA] transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[#0F2342]">
                          {inv.correo}
                        </td>

                        <td className="py-3 px-4 font-mono text-[11px] font-bold uppercase text-[#0F2342]">
                          {inv.rol || 'STAFF'}
                        </td>

                        <td className="py-3 px-4 text-slate-500 font-mono text-xs">
                          {inv.fechaInvitacion || inv.fechaEnvio || '—'}
                        </td>

                        <td className="py-3 px-4 text-slate-500 font-mono text-xs">
                          {inv.fechaExpiracion || '24 horas posteriores'}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 font-mono text-[11px] font-bold ${
                            estado === 'ACEPTADA'
                              ? 'text-[#15803D]'
                              : estado === 'RECHAZADA' || estado === 'EXPIRADA'
                              ? 'text-[#DC2626]'
                              : 'text-[#D97706]'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              estado === 'ACEPTADA'
                                ? 'bg-[#15803D]'
                                : estado === 'RECHAZADA' || estado === 'EXPIRADA'
                                ? 'bg-[#DC2626]'
                                : 'bg-[#F5B800]'
                            }`} />
                            {estado}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          {(estado === 'PENDIENTE' || estado === 'EXPIRADA') && (
                            <button
                              type="button"
                              onClick={() => handleReenviar(inv.correo, inv.rol)}
                              disabled={actionLoading}
                              className="px-2.5 py-1 rounded-[2px] border border-[#0F2342] text-[#0F2342] hover:bg-[#0F2342] hover:text-white font-mono font-bold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                              title="Reenviar enlace con nueva vigencia de 24h"
                            >
                              <RotateCw size={12} />
                              <span>REENVIAR</span>
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

      {/* Modal de Invitación Oficial con Token */}
      <ModalInvitacionOficial
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onSendInvite={handleInviteSubmit}
        mode="invite"
      />

      {/* Drawer Desplegable para Enviar Correo */}
      <ComposeMailDrawer
        isOpen={mailDrawer.isOpen}
        onClose={() => setMailDrawer((prev) => ({ ...prev, isOpen: false }))}
        recipientEmail={mailDrawer.recipientEmail}
        recipientName={mailDrawer.recipientName}
        initialSubject={mailDrawer.initialSubject}
      />

      {/* Modal Confirmación de Revocar Moderador */}
      {modalRevocar && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0F2342]/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-[2px] max-w-sm w-full p-6 shadow-2xl border border-[#E2E8F0] text-center space-y-4">
            <div className="w-10 h-10 mx-auto rounded-[2px] bg-rose-50 text-[#DC2626] flex items-center justify-center border border-rose-200">
              <Trash2 size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#0F2342] font-display">
                ¿REVOCAR ROL DE {modalRevocar.rolNombre}?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                El usuario <strong>{modalRevocar.nombre}</strong> perderá los privilegios en la plataforma y volverá a ser CLIENTE.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalRevocar(null)}
                disabled={actionLoading}
                className="flex-1 py-2 rounded-[2px] border border-[#E2E8F0] text-xs font-mono font-bold text-slate-700 hover:bg-[#F8F9FA] transition-colors"
              >
                CANCELAR
              </button>
              <button
                type="button"
                onClick={handleConfirmRevocar}
                disabled={actionLoading}
                className="flex-1 py-2 rounded-[2px] bg-[#DC2626] hover:bg-rose-700 text-white text-xs font-mono font-bold transition-all shadow-sm"
              >
                {actionLoading ? 'REVOCANDO...' : 'SÍ, REVOCAR'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}