import React, { useEffect, useState, useMemo } from 'react';
import {
  FiUsers,
  FiUserPlus,
  FiMail,
  FiShield,
  FiTrash2,
  FiClock,
  FiRefreshCw,
  FiSearch,
  FiRotateCw,
  FiSend,
} from 'react-icons/fi';
import { organizerService } from '../../services/organizerService.js';
import StatCard from '../../components/Shared/StatCard.jsx';
import Badge from '../../components/Shared/Badge.jsx';
import GmailComposeModal from '../../components/Shared/GmailComposeModal.jsx';
import Pagination from '../../components/Shared/Pagination.jsx';
import { formatFechaHora } from '../../utils/formatters.js';
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from '../../utils/alertUtils.js';

export default function OperadoresView() {
  const [operadores, setOperadores] = useState([]);
  const [invitaciones, setInvitaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('operadores'); // 'operadores' | 'invitaciones'
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal Enviar Correo Directo
  const [emailModal, setEmailModal] = useState({
    isOpen: false,
    email: '',
    name: '',
    subject: '',
    mode: 'email',
    role: 'OPERADOR',
  });

  // Modal Invitar Operador
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [opsRes, invRes] = await Promise.allSettled([
        organizerService.getMisOperadores(),
        organizerService.getInvitacionesEnviadas(),
      ]);

      if (opsRes.status === 'fulfilled') {
        const ops = Array.isArray(opsRes.value)
          ? opsRes.value
          : opsRes.value?.content || opsRes.value?.data || [];
        setOperadores(ops);
      } else {
        console.warn('Error cargando operadores:', opsRes.reason);
      }

      if (invRes.status === 'fulfilled') {
        const invs = Array.isArray(invRes.value)
          ? invRes.value
          : invRes.value?.content || invRes.value?.data || [];
        setInvitaciones(invs);
      } else {
        console.warn('Error cargando invitaciones:', invRes.reason);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Enviar invitación a operador
  const handleInvite = async (e) => {
    e.preventDefault();
    const emailTrim = inviteEmail.trim();
    if (!emailTrim) {
      await showErrorAlert({
        title: 'Correo obligatorio',
        text: 'Por favor ingresa el correo del operador a invitar.',
      });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrim)) {
      await showErrorAlert({
        title: 'Correo no válido',
        text: 'Ingresa un correo electrónico con formato válido.',
      });
      return;
    }

    setIsInviting(true);
    try {
      await organizerService.invitarOperador(emailTrim);
      await showSuccessAlert({
        title: 'Invitación enviada',
        text: `Se ha enviado la invitación exitosamente a ${emailTrim}. El enlace será válido por 24 horas.`,
      });
      setInviteEmail('');
      setShowInviteModal(false);
      fetchData();
    } catch (err) {
      await showErrorAlert({
        title: 'Error al enviar invitación',
        text: err.message || 'No se pudo enviar la invitación al operador.',
      });
    } finally {
      setIsInviting(false);
    }
  };

  // Reenviar invitación
  const handleReenviarInvitacion = async (correo) => {
    try {
      await organizerService.invitarOperador(correo);
      await showSuccessAlert({
        title: 'Invitación reenviada',
        text: `Se ha generado un nuevo enlace válido por 24 horas y se reenvió el correo a ${correo}.`,
      });
      fetchData();
    } catch (err) {
      await showErrorAlert({
        title: 'Error al reenviar',
        text: err.message || 'No fue posible reenviar la invitación en este momento.',
      });
    }
  };

  // Revocar / Desvincular operador
  const handleRevocarOperador = async (op) => {
    const nombre = op.nombre || op.nombreCompleto || 'Operador';
    const confirmed = await showConfirmAlert({
      title: '¿Desvincular operador?',
      text: `Se revocará el rol de operador a "${nombre}" y quedará desvinculado de la organización.`,
      confirmButtonText: 'Sí, revocar rol',
      confirmButtonColor: '#e11d48',
    });

    if (!confirmed) return;

    try {
      await organizerService.expulsarOperador(op.id || op.operadorId);
      await showSuccessAlert({
        title: 'Operador retirado',
        text: `"${nombre}" ha sido desvinculado de la organización exitosamente.`,
      });
      fetchData();
    } catch (err) {
      await showErrorAlert({
        title: 'Error al desvincular',
        text: err.message || 'No se pudo revocar el rol al operador.',
      });
    }
  };

  const filteredOperadores = useMemo(() => {
    return operadores.filter((op) => {
      const nombre = (op.nombre || op.nombreCompleto || '').toLowerCase();
      const correo = (op.correo || op.email || '').toLowerCase();
      const term = searchTerm.toLowerCase().trim();
      return !term || nombre.includes(term) || correo.includes(term);
    });
  }, [operadores, searchTerm]);

  const filteredInvitaciones = useMemo(() => {
    return invitaciones.filter((inv) => {
      const correo = (inv.correo || inv.correoInvitado || inv.email || '').toLowerCase();
      const term = searchTerm.toLowerCase().trim();
      return !term || correo.includes(term);
    });
  }, [invitaciones, searchTerm]);

  const currentList = activeTab === 'operadores' ? filteredOperadores : filteredInvitaciones;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return currentList.slice(start, start + pageSize);
  }, [currentList, currentPage, pageSize]);

  const pendientesCount = invitaciones.filter(
    (i) => (i.estado || '').toUpperCase() === 'PENDIENTE'
  ).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header con botón de invitar operador */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FiUsers className="w-5 h-5 text-amber-500" />
            <span>Gestión de Operadores</span>
          </h2>
          <p className="mt-1 text-xs text-slate-500 max-w-xl">
            Supervisa los operadores vinculados a tu organización, envía correos directos y gestiona sus roles
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchData}
            title="Recargar datos"
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <FiRefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            type="button"
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <FiUserPlus size={15} />
            <span>Invitar Operador</span>
          </button>
        </div>
      </div>

      {/* 2. KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Operadores Activos"
          value={operadores.length}
          change="Personal asignado a tu organización"
          trend="up"
          icon={FiUsers}
          iconBg="bg-blue-50"
          iconColor="text-brand"
        />
        <StatCard
          label="Invitaciones Pendientes"
          value={pendientesCount}
          change="En espera de aceptación por el usuario"
          trend="neutral"
          icon={FiClock}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          label="Total Gestionados"
          value={operadores.length + invitaciones.length}
          change="Histórico de colaboradores"
          trend="up"
          icon={FiShield}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
      </div>

      {/* 3. Selector de Pestaña y Buscador */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={() => {
              setActiveTab('operadores');
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'operadores'
                ? 'bg-[#0B1B3D] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FiUsers size={14} />
            <span>Operadores ({operadores.length})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('invitaciones');
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'invitaciones'
                ? 'bg-[#0B1B3D] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FiMail size={14} />
            <span>Invitaciones ({invitaciones.length})</span>
            {pendientesCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <FiSearch className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={
              activeTab === 'operadores'
                ? 'Buscar por nombre o correo...'
                : 'Buscar por correo de invitación...'
            }
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
        </div>
      </div>

      {/* 4. Tabla Principal */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === 'operadores' ? (
            /* TABLA DE OPERADORES */
            <table className="w-full text-left border-collapse bg-white">
              <thead className="bg-white border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-4 px-4">Operador</th>
                  <th className="py-4 px-4">Correo Electrónico</th>
                  <th className="py-4 px-4">Teléfono</th>
                  <th className="py-4 px-4 text-center">Estado</th>
                  <th className="py-4 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Cargando operadores...
                    </td>
                  </tr>
                ) : paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <FiUsers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      No se encontraron operadores activos en tu organización.
                    </td>
                  </tr>
                ) : (
                  paginatedList.map((op, idx) => {
                    const nombre = op.nombre || op.nombreCompleto || 'Operador';
                    const correo = op.correo || op.email || 'Sin correo registrado';
                    const telefono = op.telefono || op.phone || '—';

                    return (
                      <tr key={op.id || correo || idx} className="hover:bg-slate-50/70 transition-colors">
                        {/* Nombre del operador sin ID */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 font-bold flex items-center justify-center shrink-0 border border-amber-100">
                              {nombre.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate">
                                {nombre}
                              </p>
                              <span className="text-[11px] text-slate-400">
                                Rol: Operador
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-slate-600 font-medium">
                          {correo}
                        </td>

                        <td className="py-4 px-4 text-slate-500">
                          {telefono}
                        </td>

                        <td className="py-4 px-4 text-center">
                          <Badge variant={op.activo === false ? 'danger' : 'success'} size="xs">
                            {op.activo === false ? 'Inactivo' : 'Activo'}
                          </Badge>
                        </td>

                        {/* Acciones: Correo directo y Revocar rol */}
                        <td className="py-4 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            <button
                              type="button"
                              onClick={() =>
                                setEmailModal({
                                  isOpen: true,
                                  email: correo,
                                  name: nombre,
                                  subject: 'Comunicación de la organización en EventHive',
                                  mode: 'email',
                                  role: 'OPERADOR',
                                })
                              }
                              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                              title={`Enviar correo directo a ${nombre}`}
                            >
                              <FiMail size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRevocarOperador(op)}
                              className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Revocar rol de operador"
                            >
                              <FiTrash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : (
            /* TABLA DE INVITACIONES */
            <table className="w-full text-left border-collapse bg-white">
              <thead className="bg-white border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-4 px-4">Correo Invitado</th>
                  <th className="py-4 px-4 text-center">Estado</th>
                  <th className="py-4 px-4">Fecha de Envío</th>
                  <th className="py-4 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400">
                      <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Cargando invitaciones...
                    </td>
                  </tr>
                ) : paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400">
                      <FiMail className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      No hay invitaciones enviadas en este momento.
                    </td>
                  </tr>
                ) : (
                  paginatedList.map((inv, idx) => {
                    const estado = (inv.estado || 'PENDIENTE').toUpperCase();
                    const targetEmail = inv.correo || inv.correoInvitado || inv.email || '—';

                    return (
                      <tr key={inv.id || idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-4 font-semibold text-slate-800">
                          {targetEmail}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Badge
                            variant={
                              estado === 'ACEPTADA'
                                ? 'success'
                                : estado === 'RECHAZADA'
                                ? 'danger'
                                : 'warning'
                            }
                            size="xs"
                          >
                            {estado}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-slate-600 whitespace-nowrap">
                          {inv.fechaCreacion || inv.fechaEnvio || inv.fecha
                            ? formatFechaHora(inv.fechaCreacion || inv.fechaEnvio || inv.fecha)
                            : '—'}
                        </td>
                        <td className="py-4 px-4 text-right">
                          {estado === 'PENDIENTE' && (
                            <button
                              type="button"
                              onClick={() => handleReenviarInvitacion(targetEmail)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                              title="Reenviar invitación de acceso"
                            >
                              <FiRotateCw size={12} />
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

        {currentList.length > pageSize && (
          <div className="p-4 border-t border-slate-100 bg-white">
            <Pagination
              currentPage={currentPage}
              totalItems={currentList.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* MODAL INVITAR OPERADOR */}
      {showInviteModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 backdrop-blur-2xs p-4 animate-in fade-in duration-200">
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <FiUserPlus size={18} />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900">
                    Invitar Nuevo Operador
                  </h3>
                  <p className="text-xs text-slate-500">
                    El usuario recibirá un correo con enlace seguro por 24 horas
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleInvite} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Correo Electrónico del Operador *
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="operador@ejemplo.com"
                  required
                  className="w-full text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  disabled={isInviting}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isInviting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold uppercase tracking-wider shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <FiSend size={13} />
                  <span>{isInviting ? 'Enviando...' : 'Enviar Invitación'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPOSITOR DE CORREO DIRECTO */}
      <GmailComposeModal
        isOpen={emailModal.isOpen}
        onClose={() => setEmailModal((prev) => ({ ...prev, isOpen: false }))}
        initialEmail={emailModal.email}
        initialName={emailModal.name}
        defaultSubject={emailModal.subject}
        defaultRole="OPERADOR"
        initialMode="email"
      />
    </div>
  );
}
