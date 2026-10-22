import React, { useEffect, useState } from 'react';
import {
  FiUsers,
  FiUserPlus,
  FiMail,
  FiShield,
  FiTrash2,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiAlertCircle,
  FiEdit2,
  FiX,
  FiCheck,
  FiEye,
  FiUser,
  FiCalendar,
  FiPhone,
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import { organizerService } from '../../services/organizerService.js';
import StatCard from '../../components/Shared/StatCard.jsx';
import Badge from '../../components/Shared/Badge.jsx';
import ModalEnviarCorreo from '../../components/Shared/ModalEnviarCorreo.jsx';

const PERMISOS_DISPONIBLES = [
  { id: 'CHECK_IN', label: 'Check-in de Asistentes', desc: 'Escanear boletos y validar ingresos con código QR al evento' },
  { id: 'CREAR_EVENTO', label: 'Crear Eventos', desc: 'Registrar nuevos borradores de eventos para la organización' },
  { id: 'EDITAR_EVENTO', label: 'Editar Eventos', desc: 'Modificar detalles, fechas, localidades o precios de eventos existentes' },
  { id: 'CANCELAR_EVENTO', label: 'Cancelar Eventos', desc: 'Suspender o cancelar eventos publicados de la organización' },
];

export default function OperadoresView() {
  const [operadores, setOperadores] = useState([]);
  const [invitaciones, setInvitaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('operadores'); // 'operadores' | 'invitaciones'

  // Modal Enviar Correo (Gmail style)
  const [emailModal, setEmailModal] = useState({ isOpen: false, email: '', name: '', subject: '' });

  // Drawer Lateral Invitar Operador
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState(null);

  // Drawer Lateral Expulsar Operador
  const [operadorToExpulsar, setOperadorToExpulsar] = useState(null);
  const [isExpelling, setIsExpelling] = useState(false);
  const [expulsarError, setExpulsarError] = useState(null);

  // Drawer Lateral Permisos
  const [editingOperador, setEditingOperador] = useState(null);
  const [selectedPermisos, setSelectedPermisos] = useState([]);
  const [isUpdatingPermisos, setIsUpdatingPermisos] = useState(false);

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

  // Enviar invitación oficial a operador
  const handleInvite = async (e) => {
    e.preventDefault();
    const emailTrim = inviteEmail.trim();
    if (!emailTrim) {
      setInviteError('Por favor ingresa el correo del operador a invitar.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrim)) {
      setInviteError('Ingresa un correo electrónico con formato válido.');
      return;
    }

    setIsInviting(true);
    setInviteError(null);
    try {
      await organizerService.invitarOperador(emailTrim);
      Swal.fire({
        icon: 'success',
        title: 'Invitación enviada',
        text: `Se ha enviado la invitación exitosamente a ${emailTrim}. El enlace será válido por 24 horas.`,
      });
      setInviteEmail('');
      setShowInviteModal(false);
      fetchData();
    } catch (err) {
      setInviteError(
        err.message ||
          'No se pudo enviar la invitación. Verifica que el usuario exista y no pertenezca ya a otra organización.'
      );
    } finally {
      setIsInviting(false);
    }
  };

  // Reenviar invitación desde la tabla de invitaciones
  const handleReenviarInvitacion = async (correo) => {
    try {
      await organizerService.invitarOperador(correo);
      Swal.fire({
        icon: 'success',
        title: 'Invitación reenviada',
        text: `Se ha generado un nuevo enlace válido por 24 horas y se reenvió el correo a ${correo}.`,
        timer: 2000,
        showConfirmButton: false,
      });
      fetchData();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error al reenviar',
        text: err.message || 'No fue posible reenviar la invitación en este momento.',
      });
    }
  };

  // Expulsar operador confirmado desde el Drawer
  const handleConfirmExpulsar = async () => {
    if (!operadorToExpulsar) return;
    setIsExpelling(true);
    setExpulsarError(null);
    try {
      await organizerService.expulsarOperador(operadorToExpulsar.id || operadorToExpulsar.operadorId);
      Swal.fire({
        icon: 'success',
        title: 'Operador retirado',
        text: 'El operador ha sido desvinculado de la organización.',
        timer: 1500,
        showConfirmButton: false,
      });
      setOperadorToExpulsar(null);
      fetchData();
    } catch (err) {
      setExpulsarError(err.message || 'Ocurrió un error al intentar expulsar al operador.');
    } finally {
      setIsExpelling(false);
    }
  };

  // Abrir modal de permisos
  const openPermisosModal = (operador) => {
    setEditingOperador(operador);
    const permisosActuales = operador.permisos || [];
    setSelectedPermisos(Array.isArray(permisosActuales) ? permisosActuales : []);
  };

  // Guardar permisos
  const handleSavePermisos = async () => {
    if (!editingOperador) return;
    setIsUpdatingPermisos(true);
    try {
      await organizerService.actualizarPermisosOperador(
        editingOperador.id || editingOperador.operadorId,
        selectedPermisos
      );
      Swal.fire({
        icon: 'success',
        title: 'Permisos actualizados',
        text: 'Los permisos del operador se actualizaron correctamente.',
        timer: 1500,
        showConfirmButton: false,
      });
      setEditingOperador(null);
      fetchData();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error al actualizar permisos',
        text: err.message || 'No se pudieron actualizar los permisos del operador.',
      });
    } finally {
      setIsUpdatingPermisos(false);
    }
  };

  const togglePermiso = (permisoId) => {
    setSelectedPermisos((prev) =>
      prev.includes(permisoId)
        ? prev.filter((p) => p !== permisoId)
        : [...prev, permisoId]
    );
  };

  const pendientesCount = invitaciones.filter(
    (i) => (i.estado || '').toUpperCase() === 'PENDIENTE'
  ).length;

  return (
    <div className="space-y-6">
      {/* 1. Header con botón de enviar correo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Gestión de Trabajadores
          </h2>
          <p className="mt-1 text-xs text-slate-500 max-w-xl">
            Administra los operadores y colaboradores de tu organización, comunícate mediante correo y gestiona sus permisos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchData}
            title="Recargar datos"
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <FiRefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            type="button"
            onClick={() => setEmailModal({ isOpen: true, email: '', name: '', subject: '' })}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <FiMail size={15} />
            <span>Redactar</span>
          </button>
          <button
            type="button"
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <FiUserPlus size={15} />
            <span>Invitar</span>
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
          change="Histórico de invitaciones y colaboradores"
          trend="up"
          icon={FiShield}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
      </div>

      {/* 3. Selector de Pestaña */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('operadores')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'operadores'
              ? 'bg-[#0B1B3D] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FiUsers size={14} />
          <span>Operadores ({operadores.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('invitaciones')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'invitaciones'
              ? 'bg-[#0B1B3D] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FiMail size={14} />
          <span>Invitaciones Enviadas ({invitaciones.length})</span>
          {pendientesCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          )}
        </button>
      </div>

      {/* 4. Contenido */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-8 h-8 mx-auto mb-3 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Cargando operadores e invitaciones...
          </p>
        </div>
      ) : activeTab === 'operadores' ? (
        operadores.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center shadow-xs">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 text-brand flex items-center justify-center mb-3 text-xl">
              <FiUsers size={22} />
            </div>
            <h4 className="font-bold text-base text-slate-900 mb-1">
              No tienes operadores registrados
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
              Invita colaboradores a tu organización para que apoyen en el check-in de accesos o en la gestión de eventos.
            </p>
            <button
              type="button"
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all"
            >
              <FiUserPlus size={14} />
              <span>Enviar primera invitación</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {operadores.map((op) => {
              const permisos = op.permisos || [];
              const id = op.id || op.operadorId;
              const nombre = op.nombre || op.nombreCompleto || 'Operador';
              const correo = op.correo || op.email || 'Sin correo registrado';

              return (
                <div
                  key={id || correo}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header Operador */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-[#0B1B3D] text-amber-300 flex items-center justify-center font-bold text-sm shrink-0">
                          {nombre.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-slate-900 truncate">
                            {nombre}
                          </h4>
                          <p className="text-[11px] text-slate-500 truncate">{correo}</p>
                        </div>
                      </div>
                      <Badge variant={op.activo === false ? 'danger' : 'success'} size="sm">
                        {op.activo === false ? 'Inactivo' : 'Activo'}
                      </Badge>
                    </div>

                    {/* Permisos */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                        Permisos Asignados ({permisos.length})
                      </span>
                      {permisos.length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic">
                          Sin permisos especiales asignados.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {permisos.map((p) => (
                            <span
                              key={p}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => openPermisosModal(op)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#0B1B3D] text-amber-300 hover:bg-slate-900 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      title="Ver detalles completos del operador y sus permisos"
                    >
                      <FiEye size={12} />
                      <span>Ver Detalle</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setEmailModal({
                            isOpen: true,
                            email: correo,
                            name: nombre,
                            subject: 'Información de la organización',
                          })
                        }
                        className="px-2 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Enviar correo electrónico"
                      >
                        <FiMail size={12} />
                        <span className="hidden sm:inline">Correo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openPermisosModal(op)}
                        className="px-2 py-1.5 rounded-lg border border-amber-300/80 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Gestionar permisos"
                      >
                        <FiEdit2 size={12} />
                        <span>Permisos</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setOperadorToExpulsar(op)}
                        className="px-2 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Expulsar de la organización"
                      >
                        <FiTrash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Pestaña: Invitaciones Enviadas */
        invitaciones.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center shadow-xs">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 text-xl">
              <FiMail size={22} />
            </div>
            <h4 className="font-bold text-base text-slate-900 mb-1">
              No hay invitaciones enviadas
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
              Las invitaciones enviadas por correo para vincular operadores aparecerán en esta sección.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3.5 px-4">Correo Invitado</th>
                    <th className="py-3.5 px-4">Estado</th>
                    <th className="py-3.5 px-4">Fecha de Envío</th>
                    <th className="py-3.5 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {invitaciones.map((inv, idx) => {
                    const estado = (inv.estado || 'PENDIENTE').toUpperCase();
                    const badgeVariant =
                      estado === 'ACEPTADA'
                        ? 'success'
                        : estado === 'RECHAZADA'
                        ? 'danger'
                        : 'warning';
                    const targetEmail = inv.correo || inv.correoInvitado || inv.email;

                    return (
                      <tr key={inv.id || idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 flex items-center gap-2 font-semibold text-slate-900">
                          <FiMail className="text-slate-400" size={14} />
                          <span>{targetEmail}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant={badgeVariant} size="sm">
                            {estado}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {inv.fechaEnvio || inv.fechaInvitacion || inv.creadoEn || 'Fecha no registrada'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {(estado === 'PENDIENTE' || estado === 'EXPIRADA' || estado === 'RECHAZADA') && (
                            <button
                              type="button"
                              onClick={() => handleReenviarInvitacion(targetEmail)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                              title="Reenviar enlace de invitación (válido por 24h)"
                            >
                              <FiRefreshCw size={11} />
                              <span>Reenviar</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* DRAWER LATERAL DERECHO: Invitar Operador */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-2xs cursor-pointer transition-opacity"
            onClick={() => setShowInviteModal(false)}
          />

          <div
            className="relative z-50 w-full sm:w-[480px] md:w-[520px] bg-white h-full shadow-2xl border-l border-slate-200 overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Cabecera del Drawer */}
              <div className="bg-[#0B1B3D] text-white p-6 relative">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Cerrar panel"
                >
                  <FiX size={18} />
                </button>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
                    <FiUserPlus size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-amber-300 inline-block mb-1">
                      Invitación de Operador
                    </span>
                    <h3 className="font-display text-lg font-bold text-white">
                      Invitar a tu Organización
                    </h3>
                  </div>
                </div>
              </div>

              {/* Formulario */}
              <form onSubmit={handleInvite} className="p-6 space-y-5">
                {inviteError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                    <FiAlertCircle className="shrink-0 text-rose-600" size={15} />
                    <span>{inviteError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Correo Electrónico del Operador <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => {
                      setInviteEmail(e.target.value);
                      if (inviteError) setInviteError(null);
                    }}
                    placeholder="operador@ejemplo.com"
                    className="w-full text-xs font-semibold px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all text-slate-800"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    El usuario recibirá un correo con un enlace criptográfico válido por 24 horas para aceptar e integrarse al equipo.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <FiShield className="text-amber-600 shrink-0" size={15} />
                    <span>Rol Asignado: OPERADOR</span>
                  </div>
                  <p className="text-[11px] text-amber-800/90 leading-relaxed font-normal">
                    La invitación quedará vinculada automáticamente a tu organización. Una vez aceptada, podrás definir sus permisos para escanear boletos QR, crear y editar eventos.
                  </p>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                disabled={isInviting}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-white text-xs font-bold uppercase tracking-wider transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleInvite}
                disabled={isInviting}
                className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all disabled:opacity-60 flex items-center gap-2 cursor-pointer active:scale-95"
              >
                {isInviting && (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>Enviar Invitación</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER LATERAL DERECHO: Expulsar Operador */}
      {operadorToExpulsar && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-2xs cursor-pointer transition-opacity"
            onClick={() => setOperadorToExpulsar(null)}
          />

          <div
            className="relative z-50 w-full sm:w-[480px] md:w-[520px] bg-white h-full shadow-2xl border-l border-slate-200 overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Cabecera del Drawer */}
              <div className="bg-rose-950 text-white p-6 relative">
                <button
                  type="button"
                  onClick={() => setOperadorToExpulsar(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Cerrar panel"
                >
                  <FiX size={18} />
                </button>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-black shadow-md">
                    <FiTrash2 size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-rose-300 inline-block mb-1">
                      Desvinculación Oficial
                    </span>
                    <h3 className="font-display text-lg font-bold text-white">
                      Expulsar Operador
                    </h3>
                  </div>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-6 space-y-5">
                {expulsarError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                    <FiAlertCircle className="shrink-0 text-rose-600" size={15} />
                    <span>{expulsarError}</span>
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <p className="text-xs text-slate-500 uppercase font-bold">Colaborador a retirar:</p>
                  <p className="text-sm font-black text-slate-900">
                    {operadorToExpulsar.nombre || 'Operador'}
                  </p>
                  <p className="text-xs text-slate-600 font-medium">
                    {operadorToExpulsar.correo}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 leading-relaxed space-y-2">
                  <p className="font-bold">⚠️ Esta acción tendrá los siguientes efectos inmediatos:</p>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-rose-800">
                    <li>Se removerá la afiliación con tu organización.</li>
                    <li>Perderá acceso al escaneo y check-in de boletos en tus eventos.</li>
                    <li>No podrá acceder a la edición ni creación de eventos de tu empresa.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setOperadorToExpulsar(null)}
                disabled={isExpelling}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-white text-xs font-bold uppercase tracking-wider transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmExpulsar}
                disabled={isExpelling}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all disabled:opacity-60 flex items-center gap-2 cursor-pointer active:scale-95"
              >
                {isExpelling && (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>Confirmar Expulsión</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL LATERAL DERECHO: Detalle del Usuario y Gestión de Permisos (Requisito 13) */}
      {editingOperador && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
          {/* Backdrop oscuro con blur suave */}
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-2xs cursor-pointer transition-opacity"
            onClick={() => setEditingOperador(null)}
          />

          {/* Drawer Lateral Derecho */}
          <div
            className="relative z-50 w-full sm:w-[500px] md:w-[560px] bg-white h-full shadow-2xl border-l border-slate-200 overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Cabecera del Drawer */}
              <div className="bg-[#0B1B3D] text-white p-6 relative">
                <button
                  type="button"
                  onClick={() => setEditingOperador(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Cerrar panel"
                >
                  <FiX size={18} />
                </button>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 font-black text-xl flex items-center justify-center shrink-0 shadow-md">
                    {(editingOperador.nombre || editingOperador.correo || 'OP')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-amber-300 inline-block mb-1">
                      Detalle de Colaborador
                    </span>
                    <h3 className="font-display text-lg sm:text-xl font-bold text-white truncate">
                      {editingOperador.nombre || 'Operador sin nombre'}
                    </h3>
                    <p className="text-xs text-slate-300 truncate">
                      {editingOperador.correo || 'Sin correo registrado'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contenido del Drawer */}
              <div className="p-6 space-y-6">
                {/* 1. Datos del Usuario */}
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <FiUser size={13} className="text-amber-500" />
                    <span>Información del Usuario</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Rol en Organización</span>
                      <strong className="text-slate-800">Operador</strong>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Estado</span>
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                        <FiCheckCircle size={12} /> Activo
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Teléfono</span>
                      <strong className="text-slate-800">{editingOperador.telefono || 'No registrado'}</strong>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Identificador</span>
                      <strong className="text-slate-800 font-mono text-[11px]">#{editingOperador.id || editingOperador.operadorId || '—'}</strong>
                    </div>
                  </div>
                </div>

                {/* 2. Permisos y Accesos a Paneles */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <FiShield size={13} className="text-brand" />
                      <span>Permisos y Paneles Habilitados</span>
                    </h4>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      {selectedPermisos.length} activos
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">
                    Los operadores solo podrán visualizar los paneles y acciones asignados por el representante.
                  </p>

                  <div className="space-y-2.5">
                    {PERMISOS_DISPONIBLES.map((perm) => {
                      const isSelected = selectedPermisos.includes(perm.id);
                      return (
                        <div
                          key={perm.id}
                          onClick={() => togglePermiso(perm.id)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                            isSelected
                              ? 'border-brand bg-blue-50/50 shadow-2xs text-slate-900'
                              : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-md border mt-0.5 flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'bg-brand border-brand text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <FiCheck size={12} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-900">{perm.label}</p>
                            <p className="text-[11px] text-slate-500 leading-relaxed">{perm.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Pie del Drawer con Acciones */}
            <div className="p-6 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setEmailModal({
                    isOpen: true,
                    email: editingOperador.correo,
                    name: editingOperador.nombre,
                    subject: 'Información de la organización',
                  });
                }}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <FiMail size={13} />
                <span>Enviar Correo</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingOperador(null)}
                  disabled={isUpdatingPermisos}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSavePermisos}
                  disabled={isUpdatingPermisos}
                  className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all disabled:opacity-60 flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  {isUpdatingPermisos && (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>Guardar Permisos</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal Genérico de Envío de Correo */}
      <ModalEnviarCorreo
        isOpen={emailModal.isOpen}
        onClose={() => setEmailModal((prev) => ({ ...prev, isOpen: false }))}
        initialEmail={emailModal.email}
        initialName={emailModal.name}
        defaultSubject={emailModal.subject}
        title="Enviar Correo a Trabajador"
        subtitle="Comunícate con el operador o colaborador vía correo electrónico"
      />
    </div>
  );
}
