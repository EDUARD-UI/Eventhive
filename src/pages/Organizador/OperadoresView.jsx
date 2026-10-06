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
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import { organizerService } from '../../services/organizerService.js';
import StatCard from '../../components/Shared/StatCard.jsx';
import Badge from '../../components/Shared/Badge.jsx';

const PERMISOS_DISPONIBLES = [
  { id: 'CHECK_IN', label: 'Check-in de Asistentes', desc: 'Escanear boletos y validar ingresos' },
  { id: 'CREAR_EVENTO', label: 'Crear Eventos', desc: 'Registrar nuevos eventos para la organización' },
  { id: 'EDITAR_EVENTO', label: 'Editar Eventos', desc: 'Modificar información de eventos existentes' },
  { id: 'CANCELAR_EVENTO', label: 'Cancelar Eventos', desc: 'Suspender o cancelar eventos publicados' },
];

export default function OperadoresView() {
  const [operadores, setOperadores] = useState([]);
  const [invitaciones, setInvitaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('operadores'); // 'operadores' | 'invitaciones'

  // Modal Invitar
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  // Modal Permisos
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

  // Enviar invitación
  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Correo requerido',
        text: 'Por favor ingresa el correo del operador a invitar.',
      });
      return;
    }

    setIsInviting(true);
    try {
      await organizerService.invitarOperador(inviteEmail.trim());
      Swal.fire({
        icon: 'success',
        title: 'Invitación enviada',
        text: `Se ha enviado la invitación exitosamente a ${inviteEmail.trim()}.`,
      });
      setInviteEmail('');
      setShowInviteModal(false);
      fetchData();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error al enviar invitación',
        text: err.message || 'No se pudo enviar la invitación. Verifica que el usuario exista y no esté ya registrado.',
      });
    } finally {
      setIsInviting(false);
    }
  };

  // Expulsar operador
  const handleExpulsar = async (operador) => {
    const res = await Swal.fire({
      icon: 'warning',
      title: '¿Expulsar operador?',
      text: `¿Estás seguro de que deseas retirar a ${operador.nombre || operador.correo || 'este operador'} de tu organización?`,
      showCancelButton: true,
      confirmButtonText: 'Sí, expulsar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#e11d48',
    });

    if (!res.isConfirmed) return;

    try {
      await organizerService.expulsarOperador(operador.id || operador.operadorId);
      Swal.fire({
        icon: 'success',
        title: 'Operador retirado',
        text: 'El operador ha sido retirado de la organización.',
        timer: 1500,
        showConfirmButton: false,
      });
      fetchData();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo expulsar',
        text: err.message || 'Ocurrió un error al intentar expulsar al operador.',
      });
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
      {/* 1. Header con botón de invitar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Gestión de Operadores
          </h2>
          <p className="mt-1 text-xs text-slate-500 max-w-xl">
            Administra los operadores de tu organización, define sus permisos de trabajo y envía invitaciones oficiales.
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
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all active:scale-95 cursor-pointer"
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
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => openPermisosModal(op)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FiEdit2 size={12} />
                      <span>Permisos</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExpulsar(op)}
                      className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FiTrash2 size={12} />
                      <span>Expulsar</span>
                    </button>
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

                    return (
                      <tr key={inv.id || idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 flex items-center gap-2 font-semibold text-slate-900">
                          <FiMail className="text-slate-400" size={14} />
                          <span>{inv.correo || inv.email}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant={badgeVariant} size="sm">
                            {estado}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {inv.fechaEnvio || inv.creadoEn || 'Fecha no registrada'}
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

      {/* MODAL: Invitar Operador */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowInviteModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <FiX size={16} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand flex items-center justify-center">
                <FiUserPlus size={18} />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  Invitar Operador
                </h3>
                <p className="text-xs text-slate-500">
                  Ingresa el correo del colaborador para vincularlo a tu organización.
                </p>
              </div>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="operador@ejemplo.com"
                  className="w-full text-xs font-semibold px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  El usuario recibirá una invitación oficial para unirse a tu equipo.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  disabled={isInviting}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isInviting}
                  className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all disabled:opacity-60 flex items-center gap-2 cursor-pointer"
                >
                  {isInviting && (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>Enviar Invitación</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Gestionar Permisos */}
      {editingOperador && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setEditingOperador(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <FiX size={16} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <FiShield size={18} />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  Permisos de {editingOperador.nombre || editingOperador.correo}
                </h3>
                <p className="text-xs text-slate-500">
                  Selecciona los permisos que este operador tendrá en tu organización.
                </p>
              </div>
            </div>

            <div className="space-y-2.5 my-4">
              {PERMISOS_DISPONIBLES.map((perm) => {
                const isSelected = selectedPermisos.includes(perm.id);
                return (
                  <div
                    key={perm.id}
                    onClick={() => togglePermiso(perm.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'border-brand bg-blue-50/50 text-slate-900'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
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
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-900">{perm.label}</p>
                      <p className="text-[11px] text-slate-500">{perm.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingOperador(null)}
                disabled={isUpdatingPermisos}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold uppercase tracking-wider transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSavePermisos}
                disabled={isUpdatingPermisos}
                className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all disabled:opacity-60 flex items-center gap-2 cursor-pointer"
              >
                {isUpdatingPermisos && (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>Guardar Permisos</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
