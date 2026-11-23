import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiX,
  FiSave,
  FiCamera,
  FiLock,
  FiRotateCw,
  FiActivity,
  FiCalendar,
  FiMapPin,
  FiClock,
  FiArrowRight,
  FiCheck,
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import { session, extractPhotoUrl } from '../../services/session.js';
import userService, { readFileAsDataUrl } from '../../services/userService.js';
import moderationService from '../../services/moderationService.js';
import { formatFecha, formatHora12 } from '../../utils/formatters.js';
import { sanitizeText, sanitizePhone } from '../../utils/sanitizer.js';
import EventDetailView from '../Organizador/EventDetailView.jsx';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export default function ModeradorPerfilView({ onNavigateTab }) {
  const sessionUser = session.getUser();
  const fileInputRef = useRef(null);

  // Estados de datos reales de perfil
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState(sessionUser?.name || sessionUser?.nombre || 'Valeria Mendoza');
  const [email, setEmail] = useState(sessionUser?.email || sessionUser?.correo || 'moderador@eventhive.com');
  const [telefono, setTelefono] = useState(sessionUser?.telefono || '');
  const [fotoUrl, setFotoUrl] = useState(extractPhotoUrl(sessionUser) || '');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoError, setPhotoError] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Estado del volteo 3D de la credencial
  const [isFlipped, setIsFlipped] = useState(false);

  // Estadísticas reales de moderación
  const [stats, setStats] = useState({
    publicados: 0,
    pendientesRevision: 0,
    enCorreccion: 0,
    rechazados: 0,
  });

  // Bitácora / Setlist de eventos gestionados recientemente
  const [actividadEventos, setActividadEventos] = useState([]);
  const [actividadLoading, setActividadLoading] = useState(false);
  const [inspectedEvent, setInspectedEvent] = useState(null);

  // Modal de edición de perfil
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [editNombre, setEditNombre] = useState('');
  const [editTelefono, setEditTelefono] = useState('');
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState(null);

  // Modal de cambio de contraseña
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Cierre con Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showEditDrawer && !saving) setShowEditDrawer(false);
        if (showPasswordModal && !passwordLoading) setShowPasswordModal(false);
        if (inspectedEvent) setInspectedEvent(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showEditDrawer, saving, showPasswordModal, passwordLoading, inspectedEvent]);

  // Cargar perfil real y estadísticas de moderación
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
        const photo = extractPhotoUrl(p) || extractPhotoUrl(session.getUser());
        if (photo) {
          setFotoUrl(photo);
        }
        setPhotoError(false);
      })
      .catch((err) => {
        console.warn('Error cargando perfil del moderador:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    moderationService
      .getEstadisticas()
      .then((res) => {
        if (isMounted && res) setStats(res);
      })
      .catch(() => { });

    // Cargar últimos eventos de la cartelera para el Setlist / Bitácora
    setActividadLoading(true);
    moderationService
      .buscarEventosModeracion({ page: 0, size: 6 })
      .then((res) => {
        if (isMounted) {
          const list = Array.isArray(res) ? res : res?.content || [];
          setActividadEventos(list);
        }
      })
      .catch(() => {
        if (isMounted) setActividadEventos([]);
      })
      .finally(() => {
        if (isMounted) setActividadLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Subir fotografía de acreditación
  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      Swal.fire({
        icon: 'error',
        title: 'Formato no permitido',
        text: 'Por favor selecciona un archivo JPG, PNG o WebP.',
        confirmButtonColor: '#0F2342',
      });
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      Swal.fire({
        icon: 'error',
        title: 'Archivo muy pesado',
        text: 'La fotografía no debe superar los 5MB.',
        confirmButtonColor: '#0F2342',
      });
      return;
    }

    const previousPhoto = fotoUrl;
    const dataUrlPreview = await readFileAsDataUrl(file);
    if (dataUrlPreview) {
      setPhotoPreview(dataUrlPreview);
      setPhotoError(false);
      session.updateUser({
        fotoUrl: dataUrlPreview,
        imagenPerfil: dataUrlPreview,
        urlImagenPerfil: dataUrlPreview,
        avatar: dataUrlPreview,
      });
    }

    try {
      setUploadingPhoto(true);
      const res = await userService.uploadFotoPerfil(file);
      const newUrl = extractPhotoUrl(res) || dataUrlPreview;
      if (newUrl) {
        setFotoUrl(newUrl);
        setPhotoPreview(null);
        session.updateUser({
          fotoUrl: newUrl,
          imagenPerfil: newUrl,
          urlImagenPerfil: newUrl,
          avatar: newUrl,
        });
      }

      Swal.fire({
        icon: 'success',
        title: 'Fotografía actualizada',
        text: 'Tu fotografía de credencial fue actualizada exitosamente.',
        timer: 2400,
        timerProgressBar: true,
        showConfirmButton: false,
        didOpen: () => {
          const b = Swal.getTimerProgressBar();
          if (b) b.style.backgroundColor = '#F5B800';
        },
      });
    } catch (err) {
      setPhotoPreview(null);
      setFotoUrl(previousPhoto);
      session.updateUser({
        fotoUrl: previousPhoto || null,
        imagenPerfil: previousPhoto || null,
        urlImagenPerfil: previousPhoto || null,
        avatar: previousPhoto || null,
      });
      Swal.fire({
        icon: 'error',
        title: 'Error al subir imagen',
        text:
          err?.response?.data?.message ||
          err?.message ||
          'No fue posible actualizar la fotografía.',
        confirmButtonColor: '#0F2342',
      });
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
    setSaving(true);
    setEditError(null);

    const nombreSan = sanitizeText(editNombre);
    const telefonoSan = sanitizePhone(editTelefono);

    if (!nombreSan) {
      setEditError('El nombre completo es obligatorio.');
      setSaving(false);
      return;
    }

    try {
      await userService.updatePerfil({
        nombre: nombreSan,
        telefono: telefonoSan,
      });

      setNombre(nombreSan);
      setTelefono(telefonoSan);

      session.updateUser({
        name: nombreSan,
        nombre: nombreSan,
        telefono: telefonoSan,
      });

      setShowEditDrawer(false);
      Swal.fire({
        icon: 'success',
        title: 'Datos actualizados',
        text: 'Tus datos de acreditación han sido guardados correctamente.',
        timer: 2400,
        timerProgressBar: true,
        showConfirmButton: false,
        didOpen: () => {
          const b = Swal.getTimerProgressBar();
          if (b) b.style.backgroundColor = '#F5B800';
        },
      });
    } catch (err) {
      setEditError(
        err?.response?.data?.message ||
        err?.message ||
        'No fue posible actualizar el perfil.'
      );
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
      Swal.fire({
        icon: 'success',
        title: 'Contraseña actualizada',
        text: 'Tu contraseña de acceso ha sido cambiada correctamente.',
        timer: 2400,
        timerProgressBar: true,
        showConfirmButton: false,
        didOpen: () => {
          const b = Swal.getTimerProgressBar();
          if (b) b.style.backgroundColor = '#F5B800';
        },
      });
    } catch (err) {
      setPasswordError(
        err?.response?.data?.message ||
        err?.message ||
        'No fue posible cambiar la contraseña.'
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const displayPhoto = photoPreview || fotoUrl;
  const showValidPhoto = Boolean(displayPhoto && !photoError);

  const userInitials = nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || 'VM';

  const publicadosCount = stats.publicados ?? stats.aprobados ?? 0;
  const pendientesCount = stats.pendientesRevision ?? stats.pendientes ?? 0;
  const enCorreccionCount = stats.enCorreccion ?? 0;
  const rechazadosCount = stats.rechazados ?? 0;
  const totalGestionados = publicadosCount + enCorreccionCount + rechazadosCount;

  // Cálculo de proporciones para el Tablero de Pulso (Equalizer)
  const aprobadosPct = totalGestionados > 0 ? Math.round((publicadosCount / totalGestionados) * 100) : 0;
  const enCorreccionPct = totalGestionados > 0 ? Math.round((enCorreccionCount / totalGestionados) * 100) : 0;
  const rechazadosPct = totalGestionados > 0 ? Math.round((rechazadosCount / totalGestionados) * 100) : 0;

  return (
    <div className="space-y-8 select-none animate-in fade-in duration-150">
      {/* Input oculto para cambiar foto */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoSelect}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
      />

      {/* Cabecera Editorial */}
      <div className="border-b border-[#E2E8F0] pb-4">
        <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-[clamp(1.5rem,4vw,2.25rem)] text-[#0F2342] tracking-tight uppercase leading-none">
          Mi Perfil
        </h1>
      </div>

      {/* Layout Principal: Columna Izquierda (Escarapela 3D) y Columna Derecha (Escenario de Actividad & Curaduría) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* =========================================================================
            COLUMNA IZQUIERDA (~38% ancho): Tarjeta de Credencial Interactivo (Volteo 3D)
           ========================================================================= */}
        <aside className="lg:col-span-5 xl:col-span-4 w-full flex flex-col items-center">
          <div className="w-full max-w-[420px] mx-auto [perspective:1200px] flex flex-col items-center">
            {/* Lazo / Correa de Escarapela en Azul Institucional #0F2342 */}
            <div className="w-full flex flex-col items-center -mb-2 z-30 pointer-events-none select-none">
              {/* Cinta textil azul institucional con costuras */}
              <div className="w-12 h-14 bg-[#0F2342] shadow-md relative overflow-hidden flex justify-center border-t-2 border-[#1E3A8A]">
                <div className="absolute inset-y-0 left-1.5 w-[1.5px] bg-white/20" />
                <div className="absolute inset-y-0 right-1.5 w-[1.5px] bg-white/20" />
                <div className="absolute inset-y-0 w-3 bg-[#132A4F]" />
              </div>
              {/* Hebilla metálica plateada de sujeción */}
              <div className="w-8 h-3.5 bg-gradient-to-b from-slate-200 via-slate-100 to-slate-400 border border-slate-400 rounded-xs shadow-xs -mt-0.5 z-10" />
              {/* Mosquetón / Gancho que conecta a la ranura de la credencial */}
              <div className="w-4 h-4 border-2 border-slate-400 rounded-full -mt-2 z-10 bg-transparent" />
            </div>

            {/* Credencial con Volteo 3D */}
            <div
              className={`relative w-full rounded-[2px] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] [transform-style:preserve-3d] shadow-[0_20px_45px_rgba(0,0,0,0.06)] border border-[#E2E8F0] bg-[#FFFFFF] ${isFlipped ? '[transform:rotateY(180deg)]' : ''
                }`}
            >
              {/* =======================================================
                  CARA FRONTAL: Pase de Curaduría VIP
                 ======================================================= */}
              <div className="w-full p-6 sm:p-7 flex flex-col justify-between [backface-visibility:hidden] min-h-[540px]">
                <div>
                  {/* Troquelado superior simulado */}
                  <div className="w-16 h-2.5 rounded-full bg-[#EFEFEF] border border-[#DCDCDC] mx-auto shadow-inner mb-6" />

                  {/* Encabezado editorial de la credencial */}
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 mb-6">
                    <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#64748B] font-semibold">
                      EVENTHIVE · MODERACIÓN
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#F5B800]" />
                      <span className="font-mono text-[9px] uppercase tracking-wider text-[#0F2342] font-bold">
                        ACTIVO
                      </span>
                    </span>
                  </div>

                  {/* Fotografía de Acreditación a Todo Color Natural */}
                  <div className="w-36 h-36 mx-auto mb-6 bg-[#0F2342] border border-[#E2E8F0] overflow-hidden relative group rounded-[2px] flex items-center justify-center">
                    {showValidPhoto ? (
                      <img
                        src={displayPhoto}
                        alt={nombre}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={() => setPhotoError(true)}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0F2342] text-[#FFFFFF] p-2">
                        <span className="font-mono text-xs tracking-widest uppercase text-[#F5B800]">CURADOR</span>
                        <span className="font-display font-black text-2xl mt-1 text-white">
                          {userInitials}
                        </span>
                      </div>
                    )}

                    {uploadingPhoto && (
                      <div className="absolute inset-0 bg-[#0F2342]/85 flex items-center justify-center text-white font-mono text-[10px] uppercase font-bold">
                        Subiendo...
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      title="Cambiar fotografía"
                      className="absolute inset-0 bg-[#0F2342]/80 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-[2px] cursor-pointer"
                    >
                      <FiCamera size={16} />
                      <span className="text-[9px] font-mono uppercase mt-1 tracking-wider">Cambiar</span>
                    </button>
                  </div>

                  {/* Datos Reales del Acreditado */}
                  <div className="text-center space-y-1.5 px-2">
                    <h2 className="font-display font-black text-xl sm:text-2xl text-[#0F2342] uppercase tracking-tight leading-tight">
                      {nombre}
                    </h2>
                    <p className="font-mono text-xs text-[#64748B] truncate">
                      {email}
                    </p>
                    {telefono && (
                      <p className="font-mono text-xs text-[#0F2342] font-bold pt-0.5">
                        {telefono}
                      </p>
                    )}
                  </div>
                </div>

                {/* Pie de la Credencial Frontal */}
                <div className="mt-8 pt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
                  <span className="font-mono text-[10px] tracking-wider text-[#64748B]">
                    CREDENCIAL EVENTHIVE
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsFlipped(true)}
                    className="font-mono text-[11px] font-semibold text-[#0F2342] hover:text-[#B45309] transition-colors flex items-center gap-1.5 cursor-pointer py-1"
                  >
                    <span>Ver Reverso</span>
                    <FiRotateCw size={12} />
                  </button>
                </div>
              </div>

              {/* =======================================================
                  CARA TRASERA: Registro Editorial & Acciones Rápidas
                 ======================================================= */}
              <div className="absolute inset-0 w-full h-full p-6 sm:p-7 flex flex-col justify-between [backface-visibility:hidden] [transform:rotateY(180deg)] bg-[#FFFFFF] min-h-[540px]">
                <div>
                  {/* Troquelado superior simulado */}
                  <div className="w-16 h-2.5 rounded-full bg-[#EFEFEF] border border-[#DCDCDC] mx-auto shadow-inner mb-6" />

                  {/* Encabezado trasero */}
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 mb-6">
                    <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#64748B] font-semibold">
                      EXPEDIENTE TÉCNICO
                    </span>
                    <span className="w-2 h-2 rounded-full bg-[#F5B800]" />
                  </div>

                  {/* Datos Reales del Sistema (Sin IDs ni número de eventos en la card) */}
                  <div className="space-y-3 border-b border-[#E2E8F0] pb-5 text-xs font-mono">
                    <div className="flex justify-between items-center">
                      <span className="text-[#64748B]">CORREO REGISTRADO</span>
                      <span className="text-[#0F2342] font-semibold truncate max-w-[180px]">{email}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-[#F1F5F9] pt-2">
                      <span className="text-[#64748B]">TELÉFONO</span>
                      <span className="text-[#0F2342] font-semibold">{telefono || 'No registrado'}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-[#F1F5F9] pt-2">
                      <span className="text-[#64748B]">ESTADO</span>
                      <span className="text-[#0F2342] font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        <span>ACTIVO</span>
                      </span>
                    </div>
                  </div>

                  {/* Acciones Rápidas */}
                  <div className="mt-6 space-y-3">
                    <button
                      type="button"
                      onClick={openEditDrawer}
                      className="w-full py-2.5 px-4 rounded-[2px] border border-[#0F2342] text-[#0F2342] hover:bg-[#0F2342] hover:text-white font-mono text-xs uppercase tracking-wider font-bold transition-all cursor-pointer"
                    >
                      EDITAR DATOS
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPasswordError('');
                        setShowPasswordModal(true);
                      }}
                      className="w-full text-center font-mono text-xs font-bold text-[#0F2342] hover:text-[#B45309] underline transition-colors cursor-pointer py-1"
                    >
                      Cambiar contraseña →
                    </button>
                  </div>
                </div>

                {/* Pie Reverso */}
                <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
                  <span className="font-mono text-[10px] text-[#64748B]">
                    EVENTHIVE DESK
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsFlipped(false)}
                    className="font-mono text-[11px] font-semibold text-[#0F2342] hover:text-[#B45309] transition-colors flex items-center gap-1.5 cursor-pointer py-1"
                  >
                    <span>Ver Frente</span>
                    <FiRotateCw size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* =========================================================================
            COLUMNA DERECHA (~62% ancho): Escenario de Actividad & Curaduría
           ========================================================================= */}
        <div className="lg:col-span-7 xl:col-span-8 w-full space-y-6">
          {/* 1. Tablero de Pulso de Cartelera (Equalizer / Nivelador Visual) */}
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F5B800] shrink-0" />
                <h3 className="font-display font-black text-lg text-[#0F2342] uppercase tracking-tight">
                  Pulso de Cartelera & Nivelador Curatorial
                </h3>
              </div>
              <span className="font-mono text-xs text-[#64748B]">
                {totalGestionados} producciones auditadas
              </span>
            </div>

            {/* Barra Ecualizadora Principal */}
            <div className="space-y-2">
              <div className="w-full h-4 bg-[#F8F9FA] border border-[#E2E8F0] rounded-[2px] flex overflow-hidden">
                {totalGestionados === 0 ? (
                  <div className="w-full h-full bg-slate-200" title="Sin actividad registrada" />
                ) : (
                  <>
                    <div
                      style={{ width: `${aprobadosPct}%` }}
                      className="h-full bg-[#0F2342] transition-all duration-500"
                      title={`Aprobados: ${publicadosCount} (${aprobadosPct}%)`}
                    />
                    <div
                      style={{ width: `${enCorreccionPct}%` }}
                      className="h-full bg-[#F5B800] transition-all duration-500"
                      title={`En Corrección: ${enCorreccionCount} (${enCorreccionPct}%)`}
                    />
                    <div
                      style={{ width: `${rechazadosPct}%` }}
                      className="h-full bg-[#DC2626] transition-all duration-500"
                      title={`Rechazados: ${rechazadosCount} (${rechazadosPct}%)`}
                    />
                  </>
                )}
              </div>

              {/* Leyenda y proporciones reales */}
              <div className="grid grid-cols-3 gap-2 pt-2 font-mono text-xs text-center">
                <div className="p-2 border border-[#E2E8F0] rounded-[2px] bg-[#F8F9FA]">
                  <span className="text-[10px] text-[#64748B] uppercase block">Aprobados</span>
                  <span className="font-bold text-[#0F2342] text-sm">{publicadosCount}</span>
                  <span className="text-[10px] text-[#64748B] block mt-0.5">{aprobadosPct}%</span>
                </div>
                <div className="p-2 border border-[#E2E8F0] rounded-[2px] bg-[#F8F9FA]">
                  <span className="text-[10px] text-[#64748B] uppercase block">En Corrección</span>
                  <span className="font-bold text-[#B45309] text-sm">{enCorreccionCount}</span>
                  <span className="text-[10px] text-[#64748B] block mt-0.5">{enCorreccionPct}%</span>
                </div>
                <div className="p-2 border border-[#E2E8F0] rounded-[2px] bg-[#F8F9FA]">
                  <span className="text-[10px] text-[#64748B] uppercase block">Rechazados</span>
                  <span className="font-bold text-[#DC2626] text-sm">{rechazadosCount}</span>
                  <span className="text-[10px] text-[#64748B] block mt-0.5">{rechazadosPct}%</span>
                </div>
              </div>
            </div>

            {/* Fila inferior de pendientes en cola */}
            <div className="p-3 border border-[#E2E8F0] rounded-[2px] bg-[#F8F9FA] flex items-center justify-between font-mono text-xs">
              <span className="text-[#64748B]">SOLICITUDES EN COLA DE REVISIÓN</span>
              <span className="font-bold text-[#0F2342] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#F5B800]" />
                {String(pendientesCount).padStart(2, '0')} PENDIENTES
              </span>
            </div>
          </div>

          {/* 2. Historial de Actividad: Setlist / Hoja de Ruta de Dictámenes */}
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase tracking-wider text-[#0F2342] font-bold">
                  Bitácora de Cartelera · Setlist de Evaluaciones
                </span>
              </div>
              <span className="font-mono text-xs text-[#64748B]">
                ÚLTIMAS ENTRADAS
              </span>
            </div>

            {actividadLoading ? (
              <div className="p-8 text-center font-mono text-xs text-[#64748B]">
                Sincronizando setlist de cartelera...
              </div>
            ) : actividadEventos.length === 0 ? (
              <div className="p-8 text-center font-mono text-xs text-[#64748B] bg-[#F8F9FA] border border-[#E2E8F0] rounded-[2px]">
                Sin registros recientes de evaluaciones en la cartelera.
              </div>
            ) : (
              <div className="divide-y divide-[#E2E8F0]">
                {actividadEventos.map((ev, index) => {
                  const trackNumber = String(index + 1).padStart(2, '0');
                  const fechaStr = ev.fecha ? formatFecha(ev.fecha) : 'Fecha pendiente';
                  const horaStr = ev.hora ? formatHora12(ev.hora) : '';

                  const isPublicado = ev.estado === 'PUBLICADO';
                  const isCorreccion = ev.estado === 'EN_CORRECCION';
                  const isRechazado = ev.estado === 'RECHAZADO';

                  return (
                    <div
                      key={ev.id || index}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F8F9FA] px-2 -mx-2 transition-colors rounded-[2px]"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Número de track / pista en la hoja de ruta */}
                        <span className="font-mono text-xs font-bold text-[#F5B800] pt-0.5 shrink-0">
                          {trackNumber}
                        </span>

                        <div className="min-w-0 space-y-0.5">
                          <h4 className="font-display font-black text-sm text-[#0F2342] uppercase tracking-tight truncate">
                            {ev.titulo || 'Concierto en Cartelera'}
                          </h4>
                          <div className="font-mono text-[11px] text-[#64748B] flex flex-wrap items-center gap-2">
                            <span>{ev.organizacionNombre || 'Organizador'}</span>
                            <span>•</span>
                            <span>{ev.lugar || 'Cartagena'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                        <div className="text-right font-mono text-[11px]">
                          <span
                            className={`font-bold uppercase block ${isPublicado
                                ? 'text-emerald-700'
                                : isCorreccion
                                  ? 'text-[#B45309]'
                                  : isRechazado
                                    ? 'text-[#DC2626]'
                                    : 'text-[#0F2342]'
                              }`}
                          >
                            {ev.estado || 'EVALUADO'}
                          </span>
                          <span className="text-[#64748B]">
                            {fechaStr} {horaStr ? `· ${horaStr}` : ''}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setInspectedEvent(ev)}
                          className="px-2.5 py-1 border border-[#E2E8F0] hover:border-[#0F2342] text-[#0F2342] font-mono text-[11px] uppercase tracking-wider font-bold rounded-[2px] transition-colors cursor-pointer"
                        >
                          Ver
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL DE EDICIÓN DE DATOS */}
      {showEditDrawer && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
          style={{
            backgroundColor: 'rgba(15, 35, 66, 0.72)',
            backdropFilter: 'blur(4px)',
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#64748B] block">
                  Acreditación de Moderación
                </span>
                <h3 className="font-display font-black text-lg text-[#0F2342] uppercase tracking-tight">
                  Editar Datos Personales
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEditDrawer(false)}
                className="p-1.5 text-[#64748B] hover:text-[#0F2342] transition-colors cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            {editError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-xs font-mono text-rose-700">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#0F2342] font-bold mb-1.5">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  required
                  placeholder="Ej: Valeria Mendoza"
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-[2px] font-sans text-sm text-[#0F2342] focus:border-[#0F2342] outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#64748B] font-bold mb-1.5">
                  Correo Electrónico (Institucional)
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-[2px] font-mono text-xs text-[#64748B] bg-[#F8F9FA] cursor-not-allowed"
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
                  placeholder="Ej: 3011000024"
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-[2px] font-mono text-sm text-[#0F2342] focus:border-[#0F2342] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setShowEditDrawer(false)}
                  disabled={saving}
                  className="px-4 py-2 border border-[#E2E8F0] text-[#64748B] hover:text-[#0F2342] font-mono text-xs uppercase tracking-wider font-bold rounded-[2px] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#0F2342] hover:bg-[#F5B800] hover:text-[#0F2342] text-white font-mono text-xs uppercase tracking-wider font-bold rounded-[2px] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL DE CAMBIO DE CONTRASEÑA */}
      {showPasswordModal && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
          style={{
            backgroundColor: 'rgba(15, 35, 66, 0.72)',
            backdropFilter: 'blur(4px)',
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#64748B] block">
                  Seguridad de Credencial
                </span>
                <h3 className="font-display font-black text-lg text-[#0F2342] uppercase tracking-tight">
                  Actualizar Contraseña
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="p-1.5 text-[#64748B] hover:text-[#0F2342] transition-colors cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            {passwordError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-xs font-mono text-rose-700">
                {passwordError}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#0F2342] font-bold mb-1.5">
                  Contraseña Actual *
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="Tu contraseña actual"
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-[2px] font-sans text-sm text-[#0F2342] focus:border-[#0F2342] outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#0F2342] font-bold mb-1.5">
                  Nueva Contraseña *
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-[2px] font-sans text-sm text-[#0F2342] focus:border-[#0F2342] outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#0F2342] font-bold mb-1.5">
                  Confirmar Nueva Contraseña *
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Repite la nueva contraseña"
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-[2px] font-sans text-sm text-[#0F2342] focus:border-[#0F2342] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  disabled={passwordLoading}
                  className="px-4 py-2 border border-[#E2E8F0] text-[#64748B] hover:text-[#0F2342] font-mono text-xs uppercase tracking-wider font-bold rounded-[2px] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-5 py-2 bg-[#0F2342] hover:bg-[#F5B800] hover:text-[#0F2342] text-white font-mono text-xs uppercase tracking-wider font-bold rounded-[2px] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {passwordLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* INSPECCIÓN DE EVENTO DESDE EL SETLIST */}
      {inspectedEvent && (
        <EventDetailView
          eventId={inspectedEvent?.id}
          event={inspectedEvent}
          isDrawer={true}
          onBack={() => setInspectedEvent(null)}
          onClose={() => setInspectedEvent(null)}
        />
      )}
    </div>
  );
}
