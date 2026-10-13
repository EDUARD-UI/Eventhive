import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  Receipt,
  Camera,
  Loader2,
  AlertCircle,
  X,
  Edit2,
} from 'lucide-react';
import Badge from '../../components/Shared/Badge.jsx';
import { session } from '../../services/session.js';
import userService from '../../services/userService.js';

export default function AdminPerfilView({ onNavigateTab, showToast = () => {} }) {
  const sessionUser = session.getUser();
  const fileInputRef = useRef(null);

  // Estados del perfil
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState(sessionUser?.name || 'Administrador');
  const [email, setEmail] = useState(sessionUser?.email || 'admin@eventhive.com');
  const [telefono, setTelefono] = useState('');
  const [cargo, setCargo] = useState('Administrador General');
  const [fotoUrl, setFotoUrl] = useState(sessionUser?.fotoUrl || sessionUser?.foto || '');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Modal lateral derecho para edición de datos de perfil
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [editNombre, setEditNombre] = useState('');
  const [editTelefono, setEditTelefono] = useState('');
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState(null);

  // Estados de actividad de comprador
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
  const [activeTab, setActiveTab] = useState('perfil');

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
          if (p.nombre) {
            setNombre(p.nombre);
            setEditNombre(p.nombre);
          }
          if (p.correo) setEmail(p.correo);
          if (p.telefono) {
            setTelefono(p.telefono);
            setEditTelefono(p.telefono);
          }
          const photo = p.fotoUrl || p.foto || p.imagenUrl || p.imagen || p.avatarUrl || p.avatar || '';
          if (photo) setFotoUrl(photo);
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

  // Manejo de carga de fotografía de perfil
  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Por favor selecciona un archivo de imagen válido.', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('La imagen no debe superar los 5MB.', 'error');
      return;
    }

    // Vista previa local
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);

    try {
      setUploadingPhoto(true);
      const res = await userService.uploadFotoPerfil(file);
      const newUrl = res?.fotoUrl || res?.url || res?.imagenUrl || previewUrl;
      setFotoUrl(newUrl);
      session.updateUser({ fotoUrl: newUrl });
      showToast('Fotografía de perfil actualizada exitosamente.', 'success');
    } catch (err) {
      setPhotoPreview(null);
      showToast(
        err?.response?.data?.message || err?.message || 'Error al subir la fotografía de perfil.',
        'error'
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  const openEditDrawer = () => {
    setEditNombre(nombre);
    setEditTelefono(telefono || '');
    setEditError(null);
    setShowEditDrawer(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setEditError(null);
      await userService.updatePerfil({ nombre: editNombre.trim(), telefono: editTelefono.trim() });
      setNombre(editNombre.trim());
      setTelefono(editTelefono.trim());
      session.updateUser({ name: editNombre.trim(), telefono: editTelefono.trim() });
      showToast('Perfil de administrador actualizado correctamente.', 'success');
      setShowEditDrawer(false);
    } catch (err) {
      setEditError(err?.response?.data?.message || err?.message || 'Error al actualizar perfil.');
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
      setPasswordError(err?.response?.data?.message || err?.message || 'Error al cambiar la contraseña.');
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

  const displayPhoto = photoPreview || fotoUrl;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Banner Principal del Perfil - Sin fondo azul detrás del avatar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs relative overflow-hidden">
        {/* Cabecera neutra pizarra/oscura */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900" />

        <div className="relative pt-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Input de archivo oculto para la fotografía */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoSelect}
              accept="image/*"
              className="hidden"
            />

            {/* Círculo de la Fotografía - Clickeable para seleccionar archivo */}
            <div className="relative group">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                title="Haga clic para cambiar su foto de perfil"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center font-display font-black text-2xl sm:text-3xl shadow-xl ring-4 ring-white border-2 border-slate-200 overflow-hidden shrink-0 cursor-pointer transition-all active:scale-95 group-hover:brightness-95 relative"
              >
                {displayPhoto ? (
                  <img
                    src={displayPhoto}
                    alt={nombre}
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.nextSibling) {
                        e.currentTarget.nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}

                <span
                  style={{ display: displayPhoto ? 'none' : 'flex' }}
                  className="w-full h-full items-center justify-center text-slate-700"
                >
                  {nombre ? nombre.substring(0, 2).toUpperCase() : 'AD'}
                </span>

                {/* Overlay de cámara al pasar el ratón */}
                <div className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {uploadingPhoto ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      <Camera size={20} />
                      <span className="text-[9px] font-bold mt-0.5 uppercase tracking-wider">Cambiar</span>
                    </>
                  )}
                </div>
              </button>

              <span
                className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-emerald-500 text-white ring-2 ring-white shadow-sm"
                title="Sesión Verificada"
              >
                <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />
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
              onClick={openEditDrawer}
              className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-amber-300 text-xs font-bold transition-all flex items-center gap-2 active:scale-95 shadow-xs cursor-pointer uppercase tracking-wider"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Editar Perfil</span>
            </button>

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
                ? 'bg-slate-900 text-white shadow-xs'
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

      {/* VISTA 1: RESUMEN DE DATOS DE LA CUENTA */}
      {activeTab === 'perfil' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" strokeWidth={1.75} />
                  <span>Información Personal Registrada</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Información oficial sincronizada en tiempo real
                </p>
              </div>
              <button
                type="button"
                onClick={openEditDrawer}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Edit2 size={13} />
                <span>Modificar</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">
                  Nombre Completo
                </span>
                <p className="text-sm font-bold text-slate-800 mt-1">{nombre}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">
                  Correo Electrónico Institucional
                </span>
                <p className="text-sm font-bold text-slate-800 mt-1">{email}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">
                  Teléfono de Contacto
                </span>
                <p className="text-sm font-bold text-slate-800 mt-1">{telefono || 'No registrado'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">
                  Rol del Usuario
                </span>
                <div className="mt-1">
                  <Badge variant="danger" size="xs">
                    {perfil?.rolNombre || 'ADMINISTRADOR'}
                  </Badge>
                </div>
              </div>
            </div>
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
                  Supervisión general, admisión y verificación de organizaciones por RUT, auditoría de métricas y comisiones de plataforma.
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
                  <span>Revocación de rol a moderadores y marketing</span>
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

      {/* VISTA 2: ACTIVIDAD COMO COMPRADOR */}
      {activeTab === 'compras' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-white/10 text-amber-400 shrink-0 border border-white/10">
                <Ticket className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">
                    Boletería y Compra de Entradas (Rol Comprador)
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300">
                    Acceso Universal
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mt-1 max-w-4xl">
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
                <div className="p-2 rounded-xl bg-slate-100 text-slate-800">
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

      {/* DRAWER MODAL LATERAL DERECHO: EDICIÓN DE PERFIL */}
      {showEditDrawer && (
        createPortal(<div className="fixed inset-0 z-[9999] flex justify-end">
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-2xs cursor-pointer transition-opacity"
            onClick={() => setShowEditDrawer(false)}
          />

          <div
            className="relative z-50 w-full sm:w-[480px] md:w-[520px] bg-white h-full shadow-2xl border-l border-slate-200 overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="bg-[#131b2e] p-6 text-white flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                    <Edit2 size={20} />
                  </div>
                  <div>
                    <h3 className="font-display text-base sm:text-lg font-bold text-white leading-tight">
                      Editar Perfil de Administrador
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Actualización de datos personales y credenciales
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEditDrawer(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form id="edit-profile-drawer-form" onSubmit={handleSaveProfile} className="p-6 space-y-4">
                {editError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 flex items-center gap-2">
                    <AlertCircle size={16} className="text-rose-600 shrink-0" />
                    <span>{editError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={editNombre}
                    onChange={(e) => setEditNombre(e.target.value)}
                    required
                    className="w-full text-xs sm:text-sm font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
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
                    className="w-full text-xs sm:text-sm font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed outline-none"
                    title="El correo institucional está protegido por el sistema central."
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    El correo institucional no puede modificarse de forma directa.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Teléfono de Contacto
                  </label>
                  <input
                    type="text"
                    value={editTelefono}
                    onChange={(e) => setEditTelefono(e.target.value)}
                    placeholder="+57 300 123 4567"
                    className="w-full text-xs sm:text-sm font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                  />
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowEditDrawer(false)}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                form="edit-profile-drawer-form"
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-amber-300 font-bold text-xs uppercase tracking-wider shadow-sm hover:shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                <Save size={14} />
                <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
              </button>
            </div>
          </div>
        </div>, document.body)
      )}

      {/* Modal de Cambio de Contraseña */}
      {showPasswordModal && (
        createPortal(<div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setShowPasswordModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-slate-100 text-slate-800">
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
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900"
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
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900"
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
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900"
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
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-amber-300 text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  {passwordLoading ? 'Actualizando...' : 'Actualizar'}
                </button>
              </div>
            </form>
          </div>
        </div>, document.body)
      )}
    </div>
  );
}
