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
import {
  ProfileCard,
  ProfileMetric,
} from '../../components/Shared/DashboardProfileComponents.jsx';
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
    <div className="space-y-5 animate-in fade-in duration-300">
      <ProfileCard className="relative overflow-hidden border-t-2 border-t-brand p-5 sm:p-7">

        <div className="flex flex-col gap-5 pt-1 sm:flex-row sm:items-center sm:justify-between">
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
                className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 font-display text-2xl font-bold text-slate-700 shadow-sm ring-4 ring-white transition-all group-hover:brightness-95 active:scale-95 sm:h-24 sm:w-24 sm:text-3xl"
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
                className="absolute -bottom-1 -right-1 rounded-full bg-emerald-500 p-1.5 text-white ring-2 ring-white shadow-sm"
                title="Sesión Verificada"
              >
                <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />
              </span>
            </div>

            <div>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <h2 className="font-display text-xl font-bold leading-tight text-slate-900 sm:text-2xl">
                  {nombre}
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full border border-brand/15 bg-brand-light px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-dark">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {perfil?.rolNombre || sessionUser?.role || 'ADMINISTRADOR'}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500">{cargo}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
            <button
              type="button"
              onClick={openEditDrawer}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Editar perfil</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPasswordModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <Key className="w-4 h-4 text-slate-500" strokeWidth={1.75} />
              <span>Cambiar contraseña</span>
            </button>
          </div>
        </div>

        {/* Pestañas de Navegación del Perfil */}
        <div role="group" aria-label="Secciones del perfil" className="mt-6 flex flex-wrap gap-1 rounded-xl bg-slate-100/80 p-1">
          <button
            type="button"
            aria-pressed={activeTab === 'perfil'}
            onClick={() => setActiveTab('perfil')}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
              activeTab === 'perfil'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="h-4 w-4" />
            <span>Datos de la cuenta</span>
          </button>

          <button
            type="button"
            aria-pressed={activeTab === 'compras'}
            onClick={() => setActiveTab('compras')}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
              activeTab === 'compras'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Actividad como comprador</span>
            {actividad?.comprasConfirmadas > 0 && (
              <span className="rounded-full bg-brand-light px-2 py-0.5 font-mono text-[10px] text-brand-dark">
                {actividad.comprasConfirmadas}
              </span>
            )}
          </button>
        </div>
      </ProfileCard>

      {/* VISTA 1: RESUMEN DE DATOS DE LA CUENTA */}
      {activeTab === 'perfil' && (
        <div>
          <ProfileCard className="space-y-5 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="flex items-center gap-2 font-display text-base font-bold text-slate-900">
                  <User className="h-5 w-5 text-brand" strokeWidth={1.75} />
                  <span>Información personal</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={openEditDrawer}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <Edit2 size={13} />
                <span>Editar</span>
              </button>
            </div>

            <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
              <div className="flex min-w-0 items-start gap-3 py-3 sm:px-4 sm:py-2 lg:border-r lg:border-slate-100 lg:first:pl-0">
                <User className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                <div className="min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Nombre completo</span>
                  <p className="mt-1 break-words text-sm font-semibold text-slate-800">{nombre}</p>
                </div>
              </div>
              <div className="flex min-w-0 items-start gap-3 py-3 sm:px-4 sm:py-2 lg:border-r lg:border-slate-100">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                <div className="min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Correo electrónico</span>
                  <p className="mt-1 break-words text-sm font-semibold text-slate-800">{email}</p>
                </div>
              </div>
              <div className="flex min-w-0 items-start gap-3 py-3 sm:px-4 sm:py-2 lg:border-r lg:border-slate-100">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                <div className="min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Teléfono de contacto</span>
                  <p className="mt-1 break-words text-sm font-semibold text-slate-800">{telefono || 'No registrado'}</p>
                </div>
              </div>
              <div className="flex min-w-0 items-start gap-3 py-3 sm:px-4 sm:py-2 lg:pr-0">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                <div className="min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Rol</span>
                  <span className="mt-1 inline-flex rounded-full border border-brand/15 bg-brand-light px-2.5 py-1 text-[11px] font-semibold text-brand-dark">
                    {perfil?.rolNombre || 'ADMINISTRADOR'}
                  </span>
                </div>
              </div>
            </div>
          </ProfileCard>
        </div>
      )}

      {/* VISTA 2: ACTIVIDAD COMO COMPRADOR */}
      {activeTab === 'compras' && (
        <div className="space-y-5">
          <div className="flex items-center gap-3 rounded-2xl border border-brand/15 bg-brand-light/50 px-4 py-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-brand shadow-sm">
              <Ticket className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900">Actividad como comprador</h3>
              <p className="text-xs text-slate-600">Compras, entradas y favoritos de esta cuenta.</p>
            </div>
            <span className="ml-auto shrink-0 rounded-full border border-brand/15 bg-white px-2.5 py-1 text-[10px] font-semibold text-brand-dark">
              Acceso habilitado
            </span>
          </div>

          {/* Métricas de Actividad de Comprador */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ProfileMetric
              icon={Calendar}
              label="Eventos comprados"
              value={actividad?.eventosComprados ?? 0}
              detail="Asistencia personal"
            />
            <ProfileMetric
              icon={Ticket}
              label="Entradas adquiridas"
              value={actividad?.entradasCompradas ?? 0}
              detail="Boletos emitidos"
            />
            <ProfileMetric
              icon={Heart}
              label="Eventos favoritos"
              value={actividad?.favoritos ?? deseos.length ?? 0}
              detail="En lista de deseos"
            />
            <ProfileMetric
              icon={DollarSign}
              label="Total invertido"
              value={formatCOP(actividad?.totalGastado ?? 0)}
              detail={`${actividad?.comprasConfirmadas ?? 0} compras exitosas`}
            />
          </div>

          {/* Listado de Compras Recientes del Administrador */}
          <ProfileCard className="p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Receipt className="h-5 w-5" />
              </span>
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900">Historial de compras</h3>
                </div>
            </div>

            {loadingActividad ? (
              <div className="space-y-3">
                {[1, 2].map((n) => (
                  <div key={n} className="h-20 rounded-2xl bg-slate-100/70 animate-pulse" />
                ))}
              </div>
            ) : compras.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-10 text-center">
                <ShoppingBag className="mx-auto text-slate-400 mb-2" size={32} />
                <h4 className="font-display text-sm font-bold text-slate-800">
                  Aún no has realizado compras
                </h4>
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
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            Orden de Compra
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
          </ProfileCard>
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
              <div className="flex items-center justify-between border-b border-slate-100 bg-white p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light text-brand">
                    <Edit2 size={18} />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold leading-tight text-slate-900">
                      Editar perfil
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEditDrawer(false)}
                  aria-label="Cerrar edición de perfil"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
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
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    value={editNombre}
                    onChange={(e) => setEditNombre(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-500 outline-none"
                    title="El correo electrónico está protegido por el sistema central."
                  />
                  <p className="mt-1 text-[11px] text-slate-500">
                    El correo electrónico no puede modificarse directamente.
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Teléfono de contacto
                  </label>
                  <input
                    type="text"
                    value={editTelefono}
                    onChange={(e) => setEditTelefono(e.target.value)}
                    placeholder="+57 300 123 4567"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/10"
                  />
                </div>
              </form>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-white p-5 sm:p-6">
              <button
                type="button"
                onClick={() => setShowEditDrawer(false)}
                disabled={saving}
                className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                form="edit-profile-drawer-form"
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-brand-dark disabled:cursor-wait disabled:opacity-50"
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
                  <h3 className="font-display text-base font-bold text-slate-900">
                    Cambiar contraseña
                  </h3>
                </div>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Contraseña actual *
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Nueva contraseña *
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10"
                  required
                />
                <p className="mt-1 text-[11px] text-slate-500">Mínimo 8 caracteres alfanuméricos.</p>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Confirmar nueva contraseña *
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10"
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
