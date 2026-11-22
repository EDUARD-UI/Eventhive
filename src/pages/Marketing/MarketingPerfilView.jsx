import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiShield,
  FiCheck,
  FiEdit3,
  FiX,
  FiAlertCircle,
  FiKey,
  FiLock,
  FiCamera,
} from 'react-icons/fi';
import { session, extractPhotoUrl, normalizeRole } from '../../services/session.js';
import userService, { readFileAsDataUrl } from '../../services/userService.js';
import { showSuccessAlert, showErrorAlert, showWarningAlert } from '../../utils/alertUtils.js';
import { sanitizeText, sanitizePhone } from '../../utils/sanitizer.js';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export default function MarketingPerfilView({ onNavigateTab }) {
  const cachedUser = session.getUser();
  const initialPhoto = extractPhotoUrl(cachedUser);

  const [profile, setProfile] = useState({
    id: cachedUser?.id || '',
    nombre: cachedUser?.nombre || cachedUser?.name || 'Especialista Marketing',
    correo: cachedUser?.correo || cachedUser?.email || 'marketing@eventhive.com',
    telefono: cachedUser?.telefono || '',
    imagenPerfil: initialPhoto,
    urlImagenPerfil: initialPhoto,
    rolNombre: cachedUser?.rolNombre || 'MARKETING',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [photoError, setPhotoError] = useState(false);
  const fileInputRef = useRef(null);

  // Modal Lateral Derecho para Edición
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [savingDrawer, setSavingDrawer] = useState(false);
  const [drawerErrors, setDrawerErrors] = useState({});
  const [drawerForm, setDrawerForm] = useState({
    nombre: '',
    telefono: '',
  });

  // Modal de Cambio de Contraseña
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isEditDrawerOpen && !savingDrawer) setIsEditDrawerOpen(false);
        if (showPasswordModal && !passwordLoading) setShowPasswordModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditDrawerOpen, savingDrawer, showPasswordModal, passwordLoading]);

  useEffect(() => {
    if (!imagePreview) return undefined;
    return () => URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  // Cargar datos reales desde el backend
  useEffect(() => {
    let isMounted = true;
    userService
      .getPerfil()
      .then((user) => {
        if (!isMounted || !user) return;
        const photo = extractPhotoUrl(user) || extractPhotoUrl(session.getUser());
        setProfile({
          id: user.id || '',
          nombre: user.nombre || user.name || 'Especialista Marketing',
          correo: user.correo || user.email || 'marketing@eventhive.com',
          telefono: user.telefono || '',
          imagenPerfil: photo,
          urlImagenPerfil: photo,
          rolNombre: user.rolNombre || user.rol || 'MARKETING',
        });
        setPhotoError(false);
      })
      .catch((err) => {
        console.warn('Error cargando perfil de marketing:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const openEditDrawer = () => {
    setDrawerForm({
      nombre: profile.nombre || '',
      telefono: profile.telefono || '',
    });
    setDrawerErrors({});
    setIsEditDrawerOpen(true);
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      showWarningAlert('Formato no permitido', 'La imagen debe ser PNG, JPG o WEBP.');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      showWarningAlert('Archivo muy pesado', 'La imagen no puede exceder los 5 MB.');
      e.target.value = '';
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setImageFile(file);
      setImagePreview(dataUrl);
      setPhotoError(false);

      // Subir directamente la fotografía
      const res = await userService.uploadFotoPerfil(file);
      const newUrl = extractPhotoUrl(res) || dataUrl;

      setProfile((prev) => ({
        ...prev,
        imagenPerfil: newUrl,
        urlImagenPerfil: newUrl,
      }));

      session.updateUser({
        urlImagenPerfil: newUrl,
        imagenPerfil: newUrl,
        fotoUrl: newUrl,
        foto: newUrl,
        avatar: newUrl,
      });

      await showSuccessAlert({
        title: 'Fotografía actualizada',
        text: 'Tu foto de perfil se ha actualizado correctamente.',
      });
    } catch (err) {
      await showErrorAlert({
        title: 'Error al subir foto',
        text: err?.message || 'No se pudo subir la imagen.',
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveDrawer = async (e) => {
    e.preventDefault();
    setSavingDrawer(true);
    setDrawerErrors({});

    const nombreSan = sanitizeText(drawerForm.nombre);
    const telefonoSan = sanitizePhone(drawerForm.telefono);

    if (!nombreSan) {
      setDrawerErrors({ nombre: 'El nombre es obligatorio.' });
      setSavingDrawer(false);
      return;
    }

    try {
      await userService.updatePerfil({
        nombre: nombreSan,
        telefono: telefonoSan,
      });

      setProfile((prev) => ({
        ...prev,
        nombre: nombreSan,
        telefono: telefonoSan,
      }));

      session.updateUser({
        name: nombreSan,
        nombre: nombreSan,
        telefono: telefonoSan,
      });

      await showSuccessAlert({
        title: 'Perfil actualizado',
        text: 'Tus datos de contacto han sido guardados correctamente.',
      });

      setIsEditDrawerOpen(false);
    } catch (err) {
      await showErrorAlert({
        title: 'Error al guardar',
        text: err?.message || 'No se pudieron actualizar los datos.',
      });
    } finally {
      setSavingDrawer(false);
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
      await showSuccessAlert({
        title: 'Contraseña actualizada',
        text: 'Tu clave de acceso ha sido actualizada con éxito.',
      });
    } catch (err) {
      setPasswordError(err?.response?.data?.message || err?.message || 'Error al cambiar la contraseña.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const displayPhoto = imagePreview || profile.urlImagenPerfil || profile.imagenPerfil;
  const showValidPhoto = Boolean(displayPhoto && !photoError);

  return (
    <div className="space-y-8 select-none">
      {/* 1. Cabecera Editorial */}
      <div className="border-b border-[#E2E8F0] pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#64748B] block mb-1">
              Consola de Difusión & Pauta · Perfil de Operación
            </span>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-[#0F2342] tracking-tight uppercase leading-none">
              Mi Perfil
            </h1>
          </div>

          <button
            type="button"
            onClick={openEditDrawer}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-[2px] bg-[#0F2342] hover:bg-[#F5B800] text-white hover:text-[#0F2342] font-mono text-xs uppercase tracking-wider font-bold transition-all duration-150 cursor-pointer shadow-xs active:scale-98 shrink-0"
          >
            <FiEdit3 size={14} />
            <span>EDITAR PERFIL</span>
          </button>
        </div>
      </div>

      {/* Input oculto para cambiar foto */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageFileChange}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
      />

      {/* 2. Layout Asimétrico (65% Ficha Técnica / 35% Resumen Operativo) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Columna Izquierda: Ficha Técnica (Superficie #FFFFFF, 1px border #E2E8F0) */}
        <div className="lg:col-span-8 w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] p-6 sm:p-8 space-y-6">
          {/* Cabecera de Ficha: Fotografía a todo color natural */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 pb-6 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="w-20 h-20 rounded-[2px] border border-[#E2E8F0] bg-[#F8F9FA] overflow-hidden shrink-0 flex items-center justify-center">
                  {showValidPhoto ? (
                    <img
                      src={displayPhoto}
                      alt={profile.nombre}
                      className="w-full h-full object-cover"
                      onError={() => setPhotoError(true)}
                    />
                  ) : (
                    <span className="font-display font-black text-2xl text-[#0F2342]">
                      {(profile.nombre || 'MK').slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Cambiar fotografía"
                  className="absolute inset-0 bg-[#0F2342]/70 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-[2px] cursor-pointer"
                >
                  <FiCamera size={16} />
                  <span className="text-[9px] font-mono uppercase mt-1">Cambiar</span>
                </button>
              </div>

              <div className="min-w-0">
                <h3 className="font-display font-black text-2xl text-[#0F2342] uppercase tracking-tight truncate">
                  {profile.nombre}
                </h3>
                <p className="font-mono text-xs text-[#64748B] truncate mt-1">
                  {profile.correo}
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 text-[11px] font-mono text-[#0F2342] hover:text-[#F5B800] uppercase font-bold tracking-wider underline cursor-pointer"
                >
                  Cambiar fotografía de perfil
                </button>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-[#F8F9FA] border border-[#E2E8F0] font-mono text-xs font-bold text-[#0F2342] uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#F5B800]" />
              <span>ROL MARKETING</span>
            </div>
          </div>

          {/* Filas Tipográficas Limpias divididas por 1px solid #E2E8F0 */}
          <div className="divide-y divide-[#E2E8F0]">
            <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-[#64748B]">
                Nombre Completo
              </span>
              <span className="font-sans text-sm font-bold text-[#0F2342]">
                {profile.nombre}
              </span>
            </div>

            <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-[#64748B]">
                Correo Institucional
              </span>
              <span className="font-mono text-xs font-semibold text-[#0F2342]">
                {profile.correo}
              </span>
            </div>

            <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-[#64748B]">
                Teléfono de Contacto
              </span>
              <span className="font-mono text-xs font-semibold text-[#0F2342]">
                {profile.telefono || 'No registrado'}
              </span>
            </div>

            <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-[#64748B]">
                Especialidad Técnica
              </span>
              <span className="font-mono text-xs font-bold text-[#0F2342]">
                Especialista en Difusión y Campañas de Gira
              </span>
            </div>

            <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-[#64748B]">
                Estado de Cuenta
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#F5B800]" />
                <span className="font-mono text-xs uppercase tracking-wider font-bold text-[#0F2342]">
                  ACTIVO / EN SERVICIO
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Columna Derecha: Seguridad de Acceso */}
        <div className="lg:col-span-4 w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] p-6 sm:p-7 space-y-5">
          <div className="border-b border-[#E2E8F0] pb-3">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#0F2342] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F5B800]" />
              <span>Seguridad de la Cuenta</span>
            </h3>
          </div>

          <p className="font-sans text-xs text-[#64748B] leading-relaxed">
            Mantén protegida tu cuenta actualizando periódicamente tu clave de acceso.
          </p>

          <button
            type="button"
            onClick={() => setShowPasswordModal(true)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-[2px] border border-[#0F2342] hover:bg-[#0F2342] text-[#0F2342] hover:text-white font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer"
          >
            <FiKey size={14} />
            <span>CAMBIAR CONTRASEÑA</span>
          </button>
        </div>
      </div>

      {/* DRAWER MODAL LATERAL DERECHO: EDITAR PERFIL */}
      {isEditDrawerOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex justify-end">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => !savingDrawer && setIsEditDrawerOpen(false)}
          />

          <div
            className="relative z-10 w-full sm:w-[480px] bg-[#FFFFFF] h-full shadow-2xl border-l border-[#E2E8F0] flex flex-col justify-between animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera Drawer #0F2342 */}
            <div className="bg-[#0F2342] text-white p-6 flex items-center justify-between border-b border-white/10">
              <div>
                <h3 className="font-display font-black text-lg uppercase tracking-tight text-white">
                  Editar Datos de Contacto
                </h3>
                <p className="font-mono text-xs text-slate-300 mt-0.5">
                  Ficha personal del Especialista de Marketing
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditDrawerOpen(false)}
                disabled={savingDrawer}
                className="p-1 rounded-[2px] text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSaveDrawer} className="p-6 space-y-5 overflow-y-auto flex-1">
              {drawerErrors.general && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono rounded-[2px] flex items-center gap-2">
                  <FiAlertCircle size={15} className="shrink-0 text-rose-600" />
                  <span>{drawerErrors.general}</span>
                </div>
              )}

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#0F2342] font-bold mb-1.5">
                  Nombre Completo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={drawerForm.nombre}
                  onChange={(e) => setDrawerForm({ ...drawerForm, nombre: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] text-xs sm:text-sm text-[#0F2342] focus:outline-none focus:border-[#0F2342] transition-colors"
                />
                {drawerErrors.nombre && (
                  <p className="font-mono text-[11px] text-rose-600 mt-1">{drawerErrors.nombre}</p>
                )}
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#0F2342] font-bold mb-1.5">
                  Teléfono de Contacto
                </label>
                <input
                  type="tel"
                  value={drawerForm.telefono}
                  onChange={(e) => setDrawerForm({ ...drawerForm, telefono: e.target.value })}
                  placeholder="+57 300 000 0000"
                  className="w-full px-3.5 py-2.5 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] text-xs sm:text-sm text-[#0F2342] font-mono focus:outline-none focus:border-[#0F2342] transition-colors"
                />
              </div>

              <div className="pt-2">
                <p className="font-mono text-[11px] text-[#64748B]">
                  El correo institucional está vinculado al acceso central de Event Hive y no puede modificarse desde este panel.
                </p>
              </div>

              {/* Botones de acción */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsEditDrawerOpen(false)}
                  disabled={savingDrawer}
                  className="px-4 py-2.5 rounded-[2px] border border-[#E2E8F0] hover:bg-[#F8F9FA] text-[#64748B] font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingDrawer}
                  className="px-5 py-2.5 rounded-[2px] bg-[#0F2342] hover:bg-[#F5B800] text-white hover:text-[#0F2342] font-mono text-xs uppercase tracking-wider font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {savingDrawer ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL DE CAMBIO DE CONTRASEÑA */}
      {showPasswordModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => !passwordLoading && setShowPasswordModal(false)}
          />

          <div
            className="relative z-10 w-full max-w-md bg-[#FFFFFF] rounded-[2px] border border-[#E2E8F0] shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <h3 className="font-display font-black text-xl text-[#0F2342] uppercase tracking-tight flex items-center gap-2">
                <FiLock className="text-[#F5B800]" />
                <span>Cambiar Contraseña</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                disabled={passwordLoading}
                className="p-1 rounded-[2px] text-[#64748B] hover:text-[#0F2342] hover:bg-[#F8F9FA] cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {passwordError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono rounded-[2px] flex items-center gap-2">
                  <FiAlertCircle size={15} className="shrink-0 text-rose-600" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#0F2342] font-bold mb-1.5">
                  Contraseña Actual
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] text-xs sm:text-sm text-[#0F2342] font-mono focus:outline-none focus:border-[#0F2342]"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#0F2342] font-bold mb-1.5">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] text-xs sm:text-sm text-[#0F2342] font-mono focus:outline-none focus:border-[#0F2342]"
                />
                <p className="font-mono text-[11px] text-[#64748B] mt-1">Mínimo 8 caracteres.</p>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#0F2342] font-bold mb-1.5">
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] text-xs sm:text-sm text-[#0F2342] font-mono focus:outline-none focus:border-[#0F2342]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  disabled={passwordLoading}
                  className="px-4 py-2.5 rounded-[2px] border border-[#E2E8F0] hover:bg-[#F8F9FA] text-[#64748B] font-mono text-xs uppercase tracking-wider font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-5 py-2.5 rounded-[2px] bg-[#0F2342] hover:bg-[#F5B800] text-white hover:text-[#0F2342] font-mono text-xs uppercase tracking-wider font-bold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {passwordLoading ? 'Actualizando...' : 'Actualizar Clave'}
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
