import React, { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  Key,
  Mail,
  Phone,
  Building2,
  Lock,
  CheckCircle2,
  Clock,
  Save,
  Calendar,
  Activity,
  ShoppingBag,
  Ticket,
  Heart,
  DollarSign,
  ExternalLink,
  Receipt,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import Badge from '../../components/Shared/Badge.jsx';
import AdminInfoAlert from '../../components/componentsAdmin/AdminInfoAlert.jsx';
import { session } from '../../services/session.js';
import userService from '../../services/userService.js';

export default function AdminPerfilView({ onNavigateTab, showToast = () => {} }) {
  const sessionUser = session.getUser();

  // Estados del perfil
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState(sessionUser?.name || 'Administrador');
  const [email, setEmail] = useState(sessionUser?.email || 'admin@eventhive.com');
  const [telefono, setTelefono] = useState('');
  const [cargo, setCargo] = useState('Administrador General');
  const [saving, setSaving] = useState(false);

  // Estados de actividad de comprador (Punto 13)
  const [actividad, setActividad] = useState({
    comprasConfirmadas: 0,
    entradasCompradas: 0,
    eventosComprados: 0,
    favoritos: 0,
    totalGastado: 0,
  });
  const [compras, setCompras] = useState([]);
  const [deseos, setDeseos] = useState([]);
  const [loadingActividad, setLoadingActividad] = useState(true);

  // Estados de cambio de contraseña
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Pestaña interna: perfil o compras/actividad
  const [activeTab, setActiveTab] = useState('perfil'); // 'perfil' | 'compras'

  // Cargar perfil y actividad desde el backend
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const [perfilRes, actRes, comprasRes, deseosRes] = await Promise.allSettled([
          userService.getPerfil(),
          userService.getActividad(),
          userService.getCompras({ page: 0, size: 5 }),
          userService.getDeseos({ page: 0, size: 5 }),
        ]);

        if (!isMounted) return;

        if (perfilRes.status === 'fulfilled' && perfilRes.value) {
          const p = perfilRes.value;
          setPerfil(p);
          if (p.nombre) setNombre(p.nombre);
          if (p.correo) setEmail(p.correo);
          if (p.telefono) setTelefono(p.telefono);
        }

        if (actRes.status === 'fulfilled' && actRes.value) {
          setActividad(actRes.value);
        }

        if (comprasRes.status === 'fulfilled' && comprasRes.value) {
          const list = comprasRes.value?.content || (Array.isArray(comprasRes.value) ? comprasRes.value : []);
          setCompras(list);
        }

        if (deseosRes.status === 'fulfilled' && deseosRes.value) {
          const list = deseosRes.value?.content || (Array.isArray(deseosRes.value) ? deseosRes.value : []);
          setDeseos(list);
        }
      } catch (err) {
        console.warn('Error al cargar datos del perfil administrativo:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
          setLoadingActividad(false);
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await userService.updatePerfil({ nombre, telefono });
      session.updateUser({ name: nombre, telefono });
      showToast('Perfil de administrador actualizado correctamente.', 'success');
    } catch (err) {
      showToast(err.message || 'Error al actualizar perfil.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Las nuevas contraseñas no coinciden.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }

    try {
      setPasswordLoading(true);
      await userService.changePassword(currentPassword, newPassword);
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Contraseña de administrador actualizada exitosamente.', 'success');
    } catch (err) {
      setPasswordError(err.message || 'Error al cambiar la contraseña.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const formatCOP = (val) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val || 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Alerta Informativa Descartable y Persistente */}
      <AdminInfoAlert
        alertId="perfil"
        title="Mi Perfil de Administrador y Cuenta de Usuario"
        description="Consulta y administra los datos de tu cuenta administrativa. En EventHive los roles no restringen la compra de boleterías: como Administrador también puedes adquirir boletos para cualquier evento y consultar tu historial personal de compras y actividades."
      />

      {/* Banner Principal del Perfil */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-[#0b1329] via-[#132247] to-[#087fea]" />

        <div className="relative pt-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Avatar con Insignia */}
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#087fea] text-white flex items-center justify-center font-display font-black text-2xl sm:text-3xl shadow-xl ring-4 ring-white border-2 border-[#087fea]/20">
                {nombre.substring(0, 2).toUpperCase()}
              </div>
              <span
                className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-emerald-500 text-white ring-2 ring-white shadow-sm"
                title="Sesión Verificada"
              >
                <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 leading-tight">
                  {nombre}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wider uppercase bg-amber-500/15 border border-amber-400/30 text-amber-700">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {perfil?.rolNombre || sessionUser?.role || 'ADMINISTRADOR'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">{cargo}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap items-center gap-2">
                <span>{email}</span>
                {telefono && (
                  <>
                    <span>•</span>
                    <span>{telefono}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <button
              type="button"
              onClick={() => setShowPasswordModal(true)}
              className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all flex items-center gap-2 active:scale-95 shadow-xs"
            >
              <Key className="w-4 h-4 text-slate-500" strokeWidth={1.75} />
              <span>Cambiar Contraseña</span>
            </button>
          </div>
        </div>

        {/* Pestañas de Navegación del Perfil */}
        <div className="mt-8 flex items-center gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => setActiveTab('perfil')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'perfil'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Datos de la Cuenta</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('compras')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'compras'
                ? 'bg-[#087fea] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Mi Actividad como Comprador</span>
            {actividad?.comprasConfirmadas > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-mono">
                {actividad.comprasConfirmadas}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* VISTA 1: DATOS DE LA CUENTA ADMINISTRATIVA */}
      {activeTab === 'perfil' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario de Datos Personales */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" strokeWidth={1.75} />
                <span>Información Personal y de Contacto</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Datos sincronizados con el backend de EventHive
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Correo Institucional
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed outline-none"
                    title="El correo institucional está protegido y se gestiona mediante soporte técnico."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Teléfono de Contacto
                  </label>
                  <input
                    type="text"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="+57 300 123 4567"
                    className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Rol en la Plataforma
                  </label>
                  <input
                    type="text"
                    value={perfil?.rolNombre || 'ADMINISTRADOR'}
                    disabled
                    className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed outline-none uppercase font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="py-2.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" strokeWidth={2} />
                  <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Columna Derecha: Privilegios y Alcance */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                <span>Privilegios del Rol Administrador</span>
              </h3>

              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <span className="text-xs font-bold text-emerald-950 block">
                  Acceso Total al Sistema
                </span>
                <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                  Supervisión general, admisión y verificación de organizaciones por RUT, revocatoria de moderadores, auditoría y estadísticas.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-600 pt-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Verificación y aprobación de RUT</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Gestión de organizaciones y estados</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Revocación de rol a moderadores</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Categorías, promociones y métricas</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Compra libre de entradas en cualquier evento</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* VISTA 2: ACTIVIDAD COMO COMPRADOR (PUNTO 13) */}
      {activeTab === 'compras' && (
        <div className="space-y-6">
          {/* Banner de Aclaración de Roles y Compra Libre */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/70 border border-indigo-200">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-[#087fea] text-white shrink-0 shadow-md">
                <Ticket className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    Boletería y Compra de Entradas (Rol Comprador)
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    Acceso Universal
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mt-1 max-w-4xl">
                  En EventHive, <strong>los roles de plataforma no restringen la compra de boleterías</strong>.
                  Como Administrador puedes adquirir entradas de cualquier organización, guardar tus eventos favoritos
                  y consultar tus compras con la misma experiencia y libertad que un cliente o representante.
                </p>
              </div>
            </div>
          </div>

          {/* Métricas de Actividad de Comprador */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500">Eventos Comprados</span>
                <h4 className="text-2xl font-black font-display text-slate-900 mt-1">
                  {actividad?.eventosComprados ?? 0}
                </h4>
                <span className="text-[11px] text-emerald-600 font-medium">Asistencia personal</span>
              </div>
              <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
                <Calendar className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500">Entradas Adquiridas</span>
                <h4 className="text-2xl font-black font-display text-slate-900 mt-1">
                  {actividad?.entradasCompradas ?? 0}
                </h4>
                <span className="text-[11px] text-indigo-600 font-medium">Boletos emitidos</span>
              </div>
              <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
                <Ticket className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500">Eventos Favoritos</span>
                <h4 className="text-2xl font-black font-display text-slate-900 mt-1">
                  {actividad?.favoritos ?? deseos.length ?? 0}
                </h4>
                <span className="text-[11px] text-rose-600 font-medium">En lista de deseos</span>
              </div>
              <div className="p-3 rounded-2xl bg-rose-50 text-rose-600">
                <Heart className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500">Total Invertido</span>
                <h4 className="text-2xl font-black font-display text-slate-900 mt-1">
                  {formatCOP(actividad?.totalGastado ?? 0)}
                </h4>
                <span className="text-[11px] text-slate-400 font-medium">
                  {actividad?.comprasConfirmadas ?? 0} compras exitosas
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Listado de Compras Recientes del Administrador */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-7">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900">
                    Historial de Compras Personales
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Entradas y órdenes generadas por tu cuenta
                  </p>
                </div>
              </div>
            </div>

            {loadingActividad ? (
              <div className="space-y-3">
                {[1, 2].map((n) => (
                  <div key={n} className="h-20 rounded-2xl bg-slate-100/70 animate-pulse" />
                ))}
              </div>
            ) : compras.length === 0 ? (
              <div className="p-10 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 text-center">
                <ShoppingBag className="mx-auto text-slate-400 mb-2" size={32} />
                <h4 className="font-display text-sm font-bold text-slate-800">
                  Aún no has realizado compras
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Como administrador también puedes comprar boletos para los eventos disponibles en la cartelera general.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {compras.map((compra) => {
                  const primerItem = compra.items?.[0];
                  const totalItems = (compra.items || []).reduce((acc, it) => acc + (it.cantidad || 0), 0);
                  const fecha = compra.fechaCompra ? new Date(compra.fechaCompra).toLocaleDateString('es-CO') : 'Reciente';

                  return (
                    <div
                      key={compra.id}
                      className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/60 px-3 rounded-2xl transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-bold text-slate-400">
                            Orden #{compra.id}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {primerItem?.eventoNombre || 'Evento EventHive'}
                          </span>
                          <Badge variant="success" size="xs">
                            CONFIRMADA
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                          <span>Fecha: {fecha}</span>
                          {primerItem?.localidadNombre && (
                            <>
                              <span>•</span>
                              <span>Localidad: {primerItem.localidadNombre}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>{totalItems || primerItem?.cantidad || 1} boletos</span>
                        </div>
                      </div>

                      <div className="text-right self-end sm:self-center">
                        <span className="text-base font-extrabold font-display text-slate-900 block">
                          {formatCOP(compra.total)}
                        </span>
                        <span className="text-[11px] text-slate-400 uppercase font-mono">
                          {compra.metodoPago || 'PAGO DIGITAL'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Cambio de Contraseña */}
      {showPasswordModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setShowPasswordModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Key className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900">
                    Cambiar Contraseña
                  </h3>
                  <p className="text-xs text-slate-500">Credenciales del Administrador</p>
                </div>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contraseña Actual *
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nueva Contraseña *
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">Mínimo 8 caracteres alfanuméricos.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirmar Nueva Contraseña *
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600"
                  required
                />
              </div>

              {passwordError && (
                <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                  {passwordError}
                </p>
              )}

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  disabled={passwordLoading}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  {passwordLoading ? 'Actualizando...' : 'Actualizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
