import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Swal from 'sweetalert2';
import {
  User,
  Key,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  Ticket,
  Heart,
  DollarSign,
  Receipt,
  X,
  Edit2,
  Shield,
  Check,
} from 'lucide-react';
import LanyardCredentialCard from '../../components/common/LanyardCredentialCard.jsx';
import { session, extractPhotoUrl, normalizeRole } from '../../services/session.js';
import userService, { readFileAsDataUrl } from '../../services/userService.js';

const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

export default function AdminPerfilView({ onNavigateTab, showToast }) {
  const sessionUser = session.getUser();
  const fileInputRef = useRef(null);

  const normalizedRole = normalizeRole(sessionUser?.role || sessionUser?.rol);
  const isMarketing = normalizedRole === 'MARKETING';

  const notify = (message, type = 'success') => {
    if (typeof showToast === 'function') {
      showToast(message, type);
    } else {
      Swal.fire({
        icon: type === 'error' ? 'error' : 'success',
        title: type === 'error' ? 'Error' : 'Operación exitosa',
        text: message,
        timer: 2200,
        confirmButtonColor: '#0F2342',
      });
    }
  };

  // Estados del perfil
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState(
    sessionUser?.name || sessionUser?.nombre || (isMarketing ? 'Especialista Marketing' : 'Administrador')
  );
  const [email, setEmail] = useState(
    sessionUser?.email || (isMarketing ? 'marketing@eventhive.com' : 'admin@eventhive.com')
  );
  const [telefono, setTelefono] = useState(sessionUser?.telefono || '');
  const [fotoUrl, setFotoUrl] = useState(extractPhotoUrl(sessionUser) || '');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

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

  // Cargar perfil inmediatamente
  useEffect(() => {
    let isMounted = true;

    userService
      .getPerfil()
      .then((p) => {
        if (!isMounted || !p) return;
        setPerfil(p);
        if (p.nombre) {
          setNombre(p.nombre);
          setEditNombre(p.nombre);
        }
        if (p.correo || p.email) {
          setEmail(p.correo || p.email);
        }
        if (p.telefono) {
          setTelefono(p.telefono);
          setEditTelefono(p.telefono);
        }
        const photo = extractPhotoUrl(p);
        if (photo) {
          setFotoUrl(photo);
          setPhotoError(false);
        }
      })
      .catch((err) => {
        console.warn('Error al cargar perfil:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    Promise.allSettled([
      userService.getActividad(),
      userService.getCompras({ page: 0, size: 5 }),
      userService.getDeseos({ page: 0, size: 5 }),
    ])
      .then(([actRes, comprasRes, deseosRes]) => {
        if (!isMounted) return;
        if (actRes.status === 'fulfilled' && actRes.value) {
          setActividad(actRes.value);
        }
        if (comprasRes.status === 'fulfilled' && comprasRes.value) {
          const list =
            comprasRes.value?.content ||
            (Array.isArray(comprasRes.value) ? comprasRes.value : []);
          setCompras(list);
        }
        if (deseosRes.status === 'fulfilled' && deseosRes.value) {
          const dList =
            deseosRes.value?.content ||
            (Array.isArray(deseosRes.value) ? deseosRes.value : []);
          setDeseos(dList);
        }
      })
      .catch((err) => console.warn('Error al cargar actividad:', err))
      .finally(() => {
        if (isMounted) setLoadingActividad(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      notify('Por favor selecciona una imagen válida (PNG, JPG, WebP).', 'error');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      notify('La imagen no puede exceder los 5 MB.', 'error');
      return;
    }

    const previousPhoto = fotoUrl;
    try {
      setUploadingPhoto(true);
      const previewUrl = await readFileAsDataUrl(file);
      if (previewUrl) {
        setFotoUrl(previewUrl);
        setPhotoError(false);
      }

      const res = await userService.uploadFotoPerfil(file);
      const serverUrl = extractPhotoUrl(res) || previewUrl;
      setFotoUrl(serverUrl);
      setPhotoError(false);
      session.updateUser({
        fotoUrl: serverUrl,
        foto: serverUrl,
        urlImagenPerfil: serverUrl,
        imagenPerfil: serverUrl,
        avatar: serverUrl,
      });
      notify('Fotografía de credencial actualizada.', 'success');
    } catch (err) {
      setFotoUrl(previousPhoto);
      notify(
        err?.response?.data?.message || err?.message || 'Error al subir la fotografía de perfil.',
        'error'
      );
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
    if (!editNombre.trim()) {
      setEditError('El nombre completo es obligatorio.');
      return;
    }
    try {
      setSaving(true);
      setEditError(null);
      await userService.updatePerfil({ nombre: editNombre.trim(), telefono: editTelefono.trim() });
      setNombre(editNombre.trim());
      setTelefono(editTelefono.trim());
      session.updateUser({
        name: editNombre.trim(),
        nombre: editNombre.trim(),
        telefono: editTelefono.trim(),
      });
      notify('Datos de perfil actualizados correctamente.', 'success');
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
      notify('Contraseña actualizada exitosamente.', 'success');
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

  const displayRole = perfil?.rolNombre || normalizedRole || (isMarketing ? 'MARKETING' : 'ADMINISTRADOR');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Input de archivo oculto para la fotografía */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoSelect}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
      />

      {/* Cabecera Editorial */}
      <div className="border-b border-[#E2E8F0] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-[clamp(1.5rem,4vw,2.25rem)] text-[#0F2342] tracking-tight uppercase leading-none">
            Mi Perfil
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#64748B] mt-2">
            Acreditación oficial del sistema, parámetros de seguridad y actividad personal.
          </p>
        </div>

        {/* Acciones principales del perfil con botones rectangulares */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={openEditDrawer}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[2px] bg-[#0F2342] hover:bg-[#F5B800] text-white hover:text-[#0F2342] font-mono text-xs uppercase tracking-wider font-bold transition-all cursor-pointer shadow-2xs"
          >
            <Edit2 size={13} />
            <span>EDITAR PERFIL</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPasswordModal(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[2px] border border-[#0F2342] bg-[#FFFFFF] hover:bg-[#F8F9FA] text-[#0F2342] font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer"
          >
            <Key size={13} />
            <span>CAMBIAR CONTRASEÑA</span>
          </button>
        </div>
      </div>

      {/* Layout Asimétrico: Columna Izquierda (Escarapela con Lazo) y Columna Derecha (Datos y Actividad Real) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* =========================================================================
            COLUMNA IZQUIERDA (~38% ancho): Escarapela Física Colgante con Lazo
           ========================================================================= */}
        <aside className="lg:col-span-5 xl:col-span-4 w-full flex flex-col items-center">
          <LanyardCredentialCard
            nombre={nombre}
            email={email}
            telefono={telefono}
            rol={displayRole}
            fotoUrl={fotoUrl}
            photoError={photoError}
            onPhotoError={() => setPhotoError(true)}
            uploadingPhoto={uploadingPhoto}
            onPhotoClick={() => fileInputRef.current?.click()}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped(!isFlipped)}
          />
        </aside>

        {/* =========================================================================
            COLUMNA DERECHA (~62% ancho): Tabs Tipográficos con Subrayado #F5B800 y Actividad Real
           ========================================================================= */}
        <section className="lg:col-span-7 xl:col-span-8 w-full space-y-6">
          {/* Tabs Tipográficos con Subrayado #F5B800 */}
          <div className="flex items-center gap-6 border-b border-[#E2E8F0] px-1 font-mono text-xs uppercase tracking-wider overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('perfil')}
              className={`pb-2.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'perfil'
                  ? 'border-b-2 border-[#F5B800] text-[#0F2342] font-black'
                  : 'text-[#64748B] hover:text-[#0F2342] border-b-2 border-transparent'
              }`}
            >
              DATOS DE LA CUENTA
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('compras')}
              className={`pb-2.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'compras'
                  ? 'border-b-2 border-[#F5B800] text-[#0F2342] font-black'
                  : 'text-[#64748B] hover:text-[#0F2342] border-b-2 border-transparent'
              }`}
            >
              ACTIVIDAD COMO COMPRADOR ({actividad?.comprasConfirmadas ?? 0})
            </button>
          </div>

          {/* TAB 1: DATOS DE LA CUENTA (Consola Editorial) */}
          {activeTab === 'perfil' && (
            <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] p-6 shadow-2xs space-y-6">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#0F2342] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#F5B800]" />
                  <span>EXPEDIENTE ADMINISTRATIVO</span>
                </span>
                <span className="font-mono text-[10px] text-[#64748B] uppercase">DATOS OFICIALES</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] space-y-1">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
                    Nombre Completo
                  </span>
                  <p className="font-sans font-bold text-sm text-[#0F2342] break-words">
                    {nombre}
                  </p>
                </div>

                <div className="p-4 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] space-y-1">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
                    Correo Electrónico
                  </span>
                  <p className="font-mono text-xs text-[#0F2342] break-words font-semibold">
                    {email}
                  </p>
                </div>

                <div className="p-4 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] space-y-1">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
                    Teléfono de Contacto
                  </span>
                  <p className="font-mono text-xs text-[#0F2342] font-semibold">
                    {telefono || 'No registrado'}
                  </p>
                </div>

                <div className="p-4 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] space-y-1">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
                    Rol y Acreditación
                  </span>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="w-2 h-2 rounded-full bg-[#F5B800]" />
                    <span className="font-mono text-xs font-bold text-[#0F2342] uppercase tracking-wider">
                      {displayRole}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACTIVIDAD COMO COMPRADOR */}
          {activeTab === 'compras' && (
            <div className="space-y-6">
              {/* Barra de Métricas de Comprador */}
              <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] shadow-2xs p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E2E8F0]">
                  <div className="p-3">
                    <span className="block font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
                      Eventos Comprados
                    </span>
                    <span className="font-mono font-bold text-lg text-[#0F2342] mt-1 block">
                      {actividad?.eventosComprados ?? 0}
                    </span>
                  </div>
                  <div className="p-3">
                    <span className="block font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
                      Entradas Adquiridas
                    </span>
                    <span className="font-mono font-bold text-lg text-[#0F2342] mt-1 block">
                      {actividad?.entradasCompradas ?? 0}
                    </span>
                  </div>
                  <div className="p-3">
                    <span className="block font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
                      Favoritos
                    </span>
                    <span className="font-mono font-bold text-lg text-[#0F2342] mt-1 block">
                      {actividad?.favoritos ?? deseos.length ?? 0}
                    </span>
                  </div>
                  <div className="p-3">
                    <span className="block font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
                      Total Invertido
                    </span>
                    <span className="font-mono font-bold text-lg text-[#0F2342] mt-1 block">
                      {formatCOP(actividad?.totalGastado ?? 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Historial de Compras en Tabla Limpia */}
              <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] shadow-2xs p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#0F2342] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#F5B800]" />
                    <span>ÓRDENES REGISTRADAS</span>
                  </span>
                </div>

                {loadingActividad ? (
                  <div className="p-8 text-center font-mono text-xs text-[#64748B]">
                    Cargando historial de compras...
                  </div>
                ) : compras.length === 0 ? (
                  <div className="p-8 border border-dashed border-[#CBD5E1] rounded-[2px] text-center font-mono text-xs text-[#64748B]">
                    No se registran compras comerciales para este usuario.
                  </div>
                ) : (
                  <div className="divide-y divide-[#E2E8F0]">
                    {compras.map((compra) => {
                      const primerItem = compra.items?.[0];
                      const totalItems = (compra.items || []).reduce(
                        (acc, it) => acc + (it.cantidad || 0),
                        0
                      );
                      const fecha = compra.fechaCompra
                        ? new Date(compra.fechaCompra).toLocaleDateString('es-CO')
                        : 'Reciente';

                      return (
                        <div
                          key={compra.id}
                          className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-0.5">
                            <h4 className="font-sans font-bold text-sm text-[#0F2342]">
                              {primerItem?.eventoNombre || 'Evento EventHive'}
                            </h4>
                            <p className="font-mono text-xs text-[#64748B]">
                              {fecha} · {primerItem?.localidadNombre ? `${primerItem.localidadNombre} · ` : ''}
                              {totalItems || primerItem?.cantidad || 1} entradas
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="font-mono font-bold text-sm text-[#0F2342] block">
                              {formatCOP(compra.total)}
                            </span>
                            <span className="font-mono text-[10px] text-[#15803D] uppercase font-bold">
                              CONFIRMADA
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
        </section>
      </div>

      {/* DRAWER LATERAL DERECHO: EDICIÓN DE PERFIL */}
      {showEditDrawer &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex justify-end">
            <div
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-2xs cursor-pointer transition-opacity"
              onClick={() => setShowEditDrawer(false)}
            />

            <div
              className="relative z-50 w-full sm:w-[480px] bg-[#FFFFFF] h-full shadow-2xl border-l border-[#E2E8F0] overflow-y-auto animate-in slide-in-from-right duration-250 flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <div className="flex items-center justify-between border-b border-[#E2E8F0] p-5 sm:p-6 bg-[#0F2342] text-white">
                  <div>
                    <h3 className="font-display font-black text-base uppercase tracking-tight text-white">
                      Editar Perfil
                    </h3>
                    <p className="font-mono text-xs text-slate-300 mt-0.5">
                      Actualización de datos de acreditación
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEditDrawer(false)}
                    className="p-1 rounded-[2px] text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSaveProfile} className="p-5 sm:p-6 space-y-4">
                  {editError && (
                    <div className="p-3 rounded-[2px] bg-rose-50 border border-rose-200 text-rose-700 font-mono text-xs">
                      {editError}
                    </div>
                  )}

                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider text-[#0F2342] font-bold mb-1.5">
                      Nombre Completo <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editNombre}
                      onChange={(e) => setEditNombre(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] text-xs font-mono text-[#0F2342] outline-none focus:border-[#0F2342] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider text-[#0F2342] font-bold mb-1.5">
                      Teléfono de Contacto
                    </label>
                    <input
                      type="tel"
                      value={editTelefono}
                      onChange={(e) => setEditTelefono(e.target.value)}
                      placeholder="Ej: +57 300 123 4567"
                      className="w-full px-3.5 py-2.5 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] text-xs font-mono text-[#0F2342] outline-none focus:border-[#0F2342] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider text-[#0F2342] font-bold mb-1.5">
                      Correo Electrónico (No modificable)
                    </label>
                    <input
                      type="email"
                      disabled
                      value={email}
                      className="w-full px-3.5 py-2.5 rounded-[2px] border border-[#E2E8F0] bg-[#F8F9FA] text-xs font-mono text-[#64748B] outline-none cursor-not-allowed"
                    />
                  </div>

                  <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setShowEditDrawer(false)}
                      disabled={saving}
                      className="px-4 py-2.5 rounded-[2px] border border-[#E2E8F0] hover:bg-[#F8F9FA] text-[#64748B] font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2.5 rounded-[2px] bg-[#0F2342] hover:bg-[#F5B800] text-white hover:text-[#0F2342] font-mono text-xs uppercase tracking-wider font-bold transition-all cursor-pointer disabled:opacity-50"
                    >
                      {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* MODAL PARA CAMBIO DE CONTRASEÑA */}
      {showPasswordModal &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-2xs cursor-pointer transition-opacity"
              onClick={() => setShowPasswordModal(false)}
            />

            <div
              className="relative z-50 w-full max-w-md bg-[#FFFFFF] rounded-[2px] border border-[#E2E8F0] shadow-2xl overflow-hidden animate-in fade-in duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#E2E8F0] p-5 bg-[#0F2342] text-white">
                <div>
                  <h3 className="font-display font-black text-base uppercase tracking-tight text-white">
                    Cambiar Contraseña
                  </h3>
                  <p className="font-mono text-xs text-slate-300 mt-0.5">
                    Seguridad y credenciales de acceso
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="p-1 rounded-[2px] text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handlePasswordSubmit} className="p-5 sm:p-6 space-y-4">
                {passwordError && (
                  <div className="p-3 rounded-[2px] bg-rose-50 border border-rose-200 text-rose-700 font-mono text-xs">
                    {passwordError}
                  </div>
                )}

                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-[#0F2342] font-bold mb-1.5">
                    Contraseña Actual <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] text-xs font-mono text-[#0F2342] outline-none focus:border-[#0F2342] transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-[#0F2342] font-bold mb-1.5">
                    Nueva Contraseña (Mín. 8 caracteres) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] text-xs font-mono text-[#0F2342] outline-none focus:border-[#0F2342] transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-[#0F2342] font-bold mb-1.5">
                    Confirmar Nueva Contraseña <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] text-xs font-mono text-[#0F2342] outline-none focus:border-[#0F2342] transition-colors"
                  />
                </div>

                <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    disabled={passwordLoading}
                    className="px-4 py-2.5 rounded-[2px] border border-[#E2E8F0] hover:bg-[#F8F9FA] text-[#64748B] font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="px-5 py-2.5 rounded-[2px] bg-[#0F2342] hover:bg-[#F5B800] text-white hover:text-[#0F2342] font-mono text-xs uppercase tracking-wider font-bold transition-all cursor-pointer disabled:opacity-50"
                  >
                    {passwordLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
