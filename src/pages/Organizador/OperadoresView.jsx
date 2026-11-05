import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
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
  FiPhone,
  FiCheckCircle,
  FiX,
  FiAlertCircle,
  FiGrid,
  FiList,
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
  const [pageSize, setPageSize] = useState(9);
  const [viewMode, setViewMode] = useState('directory'); // 'directory' | 'table'

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

  // Estados de carga por elemento para prevenir peticiones concurrentes
  const [resendingEmail, setResendingEmail] = useState(null);
  const [revokingId, setRevokingId] = useState(null);

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

  // Enviar invitación a operador con prevención de doble clic
  const handleInvite = async (e) => {
    e.preventDefault();
    if (isInviting) return;

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
      setShowInviteModal(false);
      setInviteEmail('');
      await showSuccessAlert({
        title: 'Invitación enviada',
        text: `Se ha enviado la invitación exitosamente a ${emailTrim}. El enlace será válido por 24 horas.`,
      });
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

  // Reenviar invitación con protección de doble clic y feedback de loading
  const handleReenviarInvitacion = async (correo) => {
    if (resendingEmail) return;

    setResendingEmail(correo);
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
    } finally {
      setResendingEmail(null);
    }
  };

  // Revocar / Desvincular operador con confirmación y loading
  const handleRevocarOperador = async (op) => {
    const opId = op.id || op.operadorId;
    if (revokingId) return;

    const nombre = op.nombre || op.nombreCompleto || 'Operador';
    const confirmed = await showConfirmAlert({
      title: '¿Desvincular colaborador?',
      text: `Se revocará el rol de operador a "${nombre}" y quedará desvinculado del equipo de producción de la organización.`,
      confirmButtonText: 'Sí, desvincular',
      confirmButtonColor: '#e11d48',
    });

    if (!confirmed) return;

    setRevokingId(opId);
    try {
      await organizerService.expulsarOperador(opId);
      await showSuccessAlert({
        title: 'Colaborador desvinculado',
        text: `"${nombre}" ha sido desvinculado de la organización exitosamente.`,
      });
      fetchData();
    } catch (err) {
      await showErrorAlert({
        title: 'Error al desvincular',
        text: err.message || 'No se pudo revocar el rol al operador.',
      });
    } finally {
      setRevokingId(null);
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
    <div className="space-y-6">
      {/* 1. Header del Directorio Profesional */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700 bg-amber-100/70 border border-amber-200/80 px-2 py-0.5 rounded-md">
              Staff & Colaboradores
            </span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <FiUsers className="w-5 h-5 text-amber-500" />
            <span>Directorio de Trabajadores</span>
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 max-w-xl font-medium">
            Gestiona el equipo de producción y logística de tus eventos, envía comunicaciones directas y supervisa el estado de invitaciones.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchData}
            title="Recargar datos del directorio"
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <FiRefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            type="button"
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B1B3D] hover:bg-slate-900 text-amber-300 text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <FiUserPlus size={15} />
            <span>Invitar Colaborador</span>
          </button>
        </div>
      </div>

      {/* 2. KPIs del Equipo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Operadores Activos"
          value={operadores.length}
          change="Personal vinculado a la organización"
          trend="up"
          icon={FiUsers}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          label="Invitaciones Pendientes"
          value={pendientesCount}
          change="Esperando confirmación por correo"
          trend="neutral"
          icon={FiClock}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          label="Histórico de Personal"
          value={operadores.length + invitaciones.length}
          change="Total de registros gestionados"
          trend="up"
          icon={FiShield}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
      </div>

      {/* 3. Selector de Pestaña, Buscador y Toggle de Vista */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={() => {
              setActiveTab('operadores');
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'operadores'
                ? 'bg-[#0B1B3D] text-amber-300 shadow-xs'
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
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'invitaciones'
                ? 'bg-[#0B1B3D] text-amber-300 shadow-xs'
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

        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <div className="relative flex-1 md:w-72">
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
              className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 transition-all"
            />
          </div>

          {activeTab === 'operadores' && (
            <div className="flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('directory')}
                title="Vista Directorio"
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  viewMode === 'directory'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <FiGrid size={15} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                title="Vista Tabla"
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <FiList size={15} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. Contenido del Directorio */}
      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center shadow-xs">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Cargando trabajadores de tu organización...</p>
        </div>
      ) : paginatedList.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto font-bold">
            <FiUsers size={22} />
          </div>
          <div>
            <h4 className="font-display font-black text-sm text-slate-900">
              {activeTab === 'operadores'
                ? 'No hay operadores registrados'
                : 'No hay invitaciones registradas'}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5 max-w-sm mx-auto">
              {activeTab === 'operadores'
                ? 'Invita a los miembros de tu equipo de producción y logística para coordinar tus eventos.'
                : 'Las invitaciones enviadas a tus colaboradores aparecerán aquí con su estado de confirmación.'}
            </p>
          </div>
          {activeTab === 'operadores' && (
            <button
              type="button"
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0B1B3D] text-amber-300 px-4 py-2 text-xs font-bold hover:bg-slate-900 transition-colors cursor-pointer"
            >
              <FiUserPlus size={14} /> Invitar primer operador
            </button>
          )}
        </div>
      ) : activeTab === 'operadores' ? (
        viewMode === 'directory' ? (
          /* VISTA 1: CARDS DE DIRECTORIO PROFESIONAL */
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedList.map((op, idx) => {
                const nombre = op.nombre || op.nombreCompleto || 'Operador de Eventos';
                const correo = op.correo || op.email || 'Sin correo registrado';
                const telefono = op.telefono || op.phone || 'Teléfono no registrado';
                const opId = op.id || op.operadorId;
                const isRevoking = revokingId === opId;

                return (
                  <div
                    key={opId || correo || idx}
                    className="p-5 rounded-3xl border border-slate-200/90 hover:border-amber-400 bg-white shadow-xs hover:shadow-sm transition-all flex flex-col justify-between gap-4 group"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-display font-black text-base flex items-center justify-center shrink-0 shadow-2xs">
                        {nombre.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full inline-block mb-1">
                          Staff de Producción
                        </span>
                        <h4 className="font-display font-black text-sm text-slate-900 truncate group-hover:text-amber-700 transition-colors">
                          {nombre}
                        </h4>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{correo}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1.5">
                      <p className="flex items-center gap-2">
                        <FiPhone size={12} className="text-slate-400 shrink-0" />
                        <span className="font-medium truncate">{telefono}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <FiCheckCircle size={12} className="text-emerald-500 shrink-0" />
                        <span className="text-[11px] font-bold text-emerald-700">Acceso a Operaciones Activo</span>
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
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
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
                        title={`Enviar correo directo a ${nombre}`}
                      >
                        <FiMail size={13} className="text-slate-500" />
                        <span>Contactar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRevocarOperador(op)}
                        disabled={isRevoking || Boolean(revokingId)}
                        className="p-2 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                        title="Desvincular operador"
                      >
                        {isRevoking ? (
                          <span className="w-3.5 h-3.5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin inline-block" />
                        ) : (
                          <FiTrash2 size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {currentList.length > pageSize && (
              <div className="pt-2 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalItems={currentList.length}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  showPageSize={false}
                />
              </div>
            )}
          </div>
        ) : (
          /* VISTA 2: TABLA DE OPERADORES */
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50/70 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3.5 px-5">Operador</th>
                    <th className="py-3.5 px-4">Correo Electrónico</th>
                    <th className="py-3.5 px-4">Teléfono</th>
                    <th className="py-3.5 px-5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {paginatedList.map((op, idx) => {
                    const nombre = op.nombre || op.nombreCompleto || 'Operador';
                    const correo = op.correo || op.email || 'Sin correo registrado';
                    const telefono = op.telefono || op.phone || '—';
                    const opId = op.id || op.operadorId;
                    const isRevoking = revokingId === opId;

                    return (
                      <tr key={opId || correo || idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 font-display font-black flex items-center justify-center shrink-0 border border-amber-200/60">
                              {nombre.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate">{nombre}</p>
                              <span className="text-[10px] font-semibold text-slate-400">
                                Rol: Operador de Eventos
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">{correo}</td>
                        <td className="py-3.5 px-4 text-slate-500">{telefono}</td>
                        <td className="py-3.5 px-5 text-right">
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
                              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                              title={`Enviar correo a ${nombre}`}
                            >
                              <FiMail size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRevocarOperador(op)}
                              disabled={isRevoking || Boolean(revokingId)}
                              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
                              title="Desvincular operador"
                            >
                              {isRevoking ? (
                                <span className="w-3.5 h-3.5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin inline-block" />
                              ) : (
                                <FiTrash2 size={15} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {currentList.length > pageSize && (
              <div className="p-4 border-t border-slate-100 bg-white flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalItems={currentList.length}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  showPageSize={false}
                />
              </div>
            )}
          </div>
        )
      ) : (
        /* TABLA DE INVITACIONES CON BOTÓN REENVIAR ASÍNCRONO */
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-5">Correo de Invitación</th>
                  <th className="py-3.5 px-4 text-center">Estado de Invitación</th>
                  <th className="py-3.5 px-4">Fecha de Envío</th>
                  <th className="py-3.5 px-5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {paginatedList.map((inv, idx) => {
                  const estado = (inv.estado || 'PENDIENTE').toUpperCase();
                  const targetEmail = inv.correo || inv.correoInvitado || inv.email || '—';
                  const isResending = resendingEmail === targetEmail;

                  return (
                    <tr key={inv.id || idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-slate-900">{targetEmail}</td>
                      <td className="py-3.5 px-4 text-center">
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
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {inv.fechaCreacion || inv.fechaEnvio || inv.fecha
                          ? formatFechaHora(inv.fechaCreacion || inv.fechaEnvio || inv.fecha)
                          : '—'}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        {estado === 'PENDIENTE' && (
                          <button
                            type="button"
                            onClick={() => handleReenviarInvitacion(targetEmail)}
                            disabled={isResending || Boolean(resendingEmail)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                            title="Reenviar correo de acceso por 24 horas"
                          >
                            {isResending ? (
                              <>
                                <span className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin inline-block" />
                                <span>Reenviando...</span>
                              </>
                            ) : (
                              <>
                                <FiRotateCw size={12} className="text-amber-600" />
                                <span>Reenviar</span>
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {currentList.length > pageSize && (
            <div className="p-4 border-t border-slate-100 bg-white flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalItems={currentList.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                showPageSize={false}
              />
            </div>
          )}
        </div>
      )}

      {/* MODAL INVITAR OPERADOR CON PROTECCIÓN ASÍNCRONA */}
      {showInviteModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
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
                  <h3 className="font-display text-base font-black text-slate-900">
                    Invitar Colaborador
                  </h3>
                  <p className="text-xs text-slate-500">
                    Se generará un enlace seguro de acceso válido por 24 horas
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                disabled={isInviting}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <FiX size={18} />
              </button>
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
                  disabled={isInviting}
                  className="w-full text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all disabled:opacity-60"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  disabled={isInviting}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isInviting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B1B3D] hover:bg-slate-900 text-amber-300 text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {isInviting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-amber-300 border-t-transparent rounded-full animate-spin inline-block" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <FiSend size={13} />
                      <span>Enviar Invitación</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* COMPOSITOR DE CORREO ESTILO GMAIL (Preservado) */}
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
