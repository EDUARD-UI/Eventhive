import { useEffect, useState, useMemo, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FiMapPin,
  FiCalendar,
  FiStar,
  FiBookmark,
  FiEdit2,
  FiMail,
  FiDownload,
  FiCheckCircle,
  FiLock,
  FiPhone,
  FiX,
  FiExternalLink,
  FiTrash2,
  FiShoppingBag,
  FiArrowRight,
  FiKey,
  FiShield,
  FiCamera,
  FiUpload,
  FiCheck,
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import Navbar from '../components/usersComponets/Navbar.jsx';
import Footer from '../components/usersComponets/Footer.jsx';
import ImageWithFallback from '../components/common/ImageWithFallback.jsx';
import EventListCard from '../components/common/EventListCard.jsx';
import { userService } from '../services/userService.js';
import { organizerService } from '../services/organizerService.js';
import { normalizeEvent } from '../services/eventService.js';
import { session } from '../services/session.js';
import { formatPrice, getCategoryGradient } from '../utils/formatters.js';
import { sanitizeText, sanitizePhone } from '../utils/sanitizer.js';

const TABS = [
  { id: 'guardados', label: 'Guardados' },
  { id: 'proximos', label: 'Próximos' },
  { id: 'historial', label: 'Historial' },
  { id: 'entradas', label: 'Mis Boletos / QR' },
  { id: 'seguridad', label: 'Ajustes y Cuenta' },
];

const getInitials = (name = '') => {
  if (!name.trim()) return 'U';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function PerfilUsuario() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'guardados';
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const targetTab = params.get('tab') || location.state?.activeTab;
    if (targetTab) {
      setActiveTab(targetTab);
    }
  }, [location]);

  const [ticketModal, setTicketModal] = useState(null);
  const [editModal, setEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Datos reales del usuario
  const [usuario, setUsuario] = useState({
    id: null,
    nombreCompleto: '',
    correo: '',
    telefono: '',
    rol: 'CLIENTE',
    urlImagenPerfil: null,
    notifEmail: true,
    notifWhatsapp: true,
  });

  // Estado para carga de foto de perfil
  const [selectedPhotoFile, setSelectedPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  // Datos reales de listas
  const [guardados, setGuardados] = useState([]);
  const [compras, setCompras] = useState([]);

  // Formulario cambio de clave
  const [passwordForm, setPasswordForm] = useState({
    claveActual: '',
    claveNueva: '',
    confirmarClave: '',
  });

  // Cargar datos reales desde los endpoints
  useEffect(() => {
    let isMounted = true;

    async function loadProfileData() {
      setLoading(true);
      const sessionUser = session.getUser() || {};

      try {
        // 1. Obtener perfil del usuario
        try {
          const perfilData = await userService.getPerfil();
          if (isMounted && perfilData) {
            setUsuario((prev) => ({
              ...prev,
              id: perfilData.id || sessionUser.id,
              nombreCompleto: perfilData.nombre || sessionUser.name || 'Usuario',
              correo: perfilData.correo || sessionUser.email || '',
              telefono: perfilData.telefono ? sanitizePhone(perfilData.telefono) : '',
              rol: perfilData.rol || sessionUser.role || 'CLIENTE',
              urlImagenPerfil:
                perfilData.urlImagenPerfil ||
                perfilData.imagen ||
                perfilData.foto ||
                sessionUser.urlImagenPerfil ||
                sessionUser.avatar ||
                null,
            }));
          }
        } catch (err) {
          console.warn('No se pudo cargar /usuarios/perfil, usando datos de sesión:', err);
          if (isMounted) {
            setUsuario((prev) => ({
              ...prev,
              nombreCompleto: sessionUser.name || 'Usuario',
              correo: sessionUser.email || '',
              urlImagenPerfil: sessionUser.urlImagenPerfil || sessionUser.avatar || null,
            }));
          }
        }

        // 2. Obtener eventos guardados (Deseos)
        try {
          const deseosRes = await organizerService.getDeseos({ page: 0, size: 50 });
          const items = Array.isArray(deseosRes)
            ? deseosRes
            : deseosRes?.content || deseosRes?.data || [];
          if (isMounted) {
            const normalized = items.map((item) => normalizeEvent(item.evento || item));
            setGuardados(normalized);
          }
        } catch (err) {
          console.warn('No se pudo cargar /deseos:', err);
          if (isMounted) setGuardados([]);
        }

        // 3. Obtener mis compras (para Boletos / Próximos / Historial)
        try {
          const comprasRes = await organizerService.getMisCompras({ page: 0, size: 50 });
          const itemsCompras = Array.isArray(comprasRes)
            ? comprasRes
            : comprasRes?.content || comprasRes?.data || [];
          if (isMounted) {
            setCompras(itemsCompras);
          }
        } catch (err) {
          console.warn('No se pudo cargar /compras:', err);
          if (isMounted) setCompras([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProfileData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Formatear boletos a partir de las compras
  const boletosList = useMemo(() => {
    const list = [];
    compras.forEach((compra) => {
      const evento = compra.evento || {};
      const localidad = compra.localidad || {};
      const boletos = compra.boletos || [];

      if (boletos.length > 0) {
        boletos.forEach((b) => {
          list.push({
            id: b.codigo || `TKT-${b.id || compra.id}`,
            compraId: compra.id,
            evento: b.eventoTitulo || evento.titulo || compra.eventoTitulo || 'Evento EventHive',
            eventoId: evento.id || b.eventoId,
            fecha: evento.fecha || compra.fechaCompra || 'Fecha por confirmar',
            hora: evento.hora || 'Hora por confirmar',
            lugar: evento.lugar || evento.ubicacion || 'Cartagena de Indias',
            zona: b.localidadNombre || localidad.nombre || 'Entrada General',
            asiento: b.asiento || b.numeroAsiento || 'Acceso General',
            titular: b.titular || usuario.nombreCompleto || 'Titular',
            precio: b.precio ? formatPrice(b.precio) : formatPrice(compra.total || 0),
            estado: b.estado || compra.estado || 'Válido para ingreso',
            codigoQR: `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
              b.codigo || `TKT-${b.id || compra.id}-${usuario.nombreCompleto}`
            )}`,
          });
        });
      } else {
        const cantidad = compra.cantidad || 1;
        for (let i = 1; i <= cantidad; i++) {
          const tktId = `TKT-${compra.id}-${i}`;
          list.push({
            id: tktId,
            compraId: compra.id,
            evento: evento.titulo || compra.eventoTitulo || 'Evento EventHive',
            eventoId: evento.id || compra.eventoId,
            fecha: evento.fecha || compra.fechaCompra || 'Fecha por confirmar',
            hora: evento.hora || 'Hora por confirmar',
            lugar: evento.lugar || evento.ubicacion || 'Cartagena de Indias',
            zona: localidad.nombre || compra.localidadNombre || 'Entrada General',
            asiento: `Boleto #${i}`,
            titular: usuario.nombreCompleto || 'Titular',
            precio: formatPrice(compra.total || 0),
            estado: compra.estado || 'Válido para ingreso',
            codigoQR: `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
              `${tktId}-${usuario.nombreCompleto}`
            )}`,
          });
        }
      }
    });
    return list;
  }, [compras, usuario.nombreCompleto]);

  // Clasificar eventos de compras en Próximos e Historial
  const { eventosProximos, eventosHistorial } = useMemo(() => {
    const proximos = [];
    const historial = [];
    const now = new Date();

    compras.forEach((compra) => {
      const ev = compra.evento ? normalizeEvent(compra.evento) : null;
      if (!ev) return;

      const eventDate = ev.startsAt ? new Date(ev.startsAt) : null;
      if (eventDate && eventDate < now) {
        historial.push(ev);
      } else {
        proximos.push(ev);
      }
    });

    return { eventosProximos: proximos, eventosHistorial: historial };
  }, [compras]);

  // Manejo de eliminar deseo de favoritos
  const handleRemoveDeseo = async (e, eventoId) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await organizerService.eliminarDeseo(eventoId);
      setGuardados((prev) => prev.filter((ev) => String(ev.id) !== String(eventoId)));
      Swal.fire({
        icon: 'success',
        title: 'Eliminado',
        text: 'Evento eliminado de tus favoritos.',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el evento de tus favoritos.',
      });
    }
  };

  // Manejo de selección de foto
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      Swal.fire({
        icon: 'warning',
        title: 'Archivo no válido',
        text: 'Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP).',
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: 'warning',
        title: 'Imagen muy pesada',
        text: 'El tamaño de la imagen no debe superar los 5MB.',
      });
      return;
    }
    setSelectedPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Subir foto de perfil (PUT /api/usuarios/perfil/imagen)
  const handleUploadPhoto = async () => {
    if (!selectedPhotoFile) return;
    setIsUploadingPhoto(true);
    try {
      const res = await userService.uploadFotoPerfil(selectedPhotoFile);
      const newUrl = res?.urlImagenPerfil || res?.url || res?.data?.urlImagenPerfil || photoPreview;
      setUsuario((prev) => ({
        ...prev,
        urlImagenPerfil: newUrl,
      }));
      session.updateUser({ urlImagenPerfil: newUrl });
      setSelectedPhotoFile(null);
      setPhotoPreview(null);
      Swal.fire({
        icon: 'success',
        title: 'Foto actualizada',
        text: 'Tu foto de perfil ha sido actualizada exitosamente.',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error al subir foto',
        text: err.message || 'No se pudo actualizar tu foto de perfil. Intenta de nuevo.',
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleCancelPhoto = () => {
    setSelectedPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Guardar datos de perfil (PUT /usuarios/perfil)
  const handleUpdatePerfil = async (e) => {
    e.preventDefault();
    const cleanNombre = sanitizeText(usuario.nombreCompleto);
    if (!cleanNombre) {
      Swal.fire('Atención', 'El nombre es obligatorio.', 'warning');
      return;
    }

    const cleanPhone = sanitizePhone(usuario.telefono);
    if (usuario.telefono && cleanPhone.length > 10) {
      Swal.fire('Atención', 'El teléfono no puede superar los 10 dígitos.', 'warning');
      return;
    }

    try {
      setIsUpdating(true);
      await userService.updatePerfil({
        nombre: cleanNombre,
        telefono: cleanPhone,
      });

      // Actualizar sesión local con el nuevo nombre
      const current = session.getUser() || {};
      session.save({
        ...current,
        nombre: cleanNombre,
      });
      setUsuario((prev) => ({
        ...prev,
        nombreCompleto: cleanNombre,
        telefono: cleanPhone,
      }));

      Swal.fire({
        icon: 'success',
        title: '¡Perfil actualizado!',
        text: 'Tus datos se guardaron correctamente.',
        timer: 1800,
        showConfirmButton: false,
      });
      setEditModal(false);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error al actualizar',
        text: err.message || 'No fue posible actualizar tu perfil.',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Cambiar contraseña (PUT /usuarios/perfil/cambiar-clave)
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.claveActual) {
      Swal.fire('Atención', 'Ingresa tu contraseña actual.', 'warning');
      return;
    }
    if (!passwordForm.claveNueva || passwordForm.claveNueva.length < 6) {
      Swal.fire('Atención', 'La nueva contraseña debe tener al menos 6 caracteres.', 'warning');
      return;
    }
    if (passwordForm.claveNueva !== passwordForm.confirmarClave) {
      Swal.fire('Atención', 'La confirmación de la nueva contraseña no coincide.', 'warning');
      return;
    }

    try {
      setIsChangingPassword(true);
      await userService.changePassword(passwordForm.claveActual, passwordForm.claveNueva);
      Swal.fire({
        icon: 'success',
        title: 'Contraseña cambiada',
        text: 'Tu contraseña se ha actualizado exitosamente.',
      });
      setPasswordForm({ claveActual: '', claveNueva: '', confirmarClave: '' });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo cambiar la contraseña',
        text: err.message || 'Verifica tu contraseña actual e intenta de nuevo.',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const eventosVisibles =
    activeTab === 'guardados'
      ? guardados
      : activeTab === 'proximos'
        ? eventosProximos
        : activeTab === 'historial'
          ? eventosHistorial
          : [];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] dark:bg-[#070D1B] text-slate-900 dark:text-slate-100 selection:bg-amber-400 selection:text-slate-950 font-body transition-colors duration-200">
      <Navbar />

      {/* Header Cultural */}
      <section className="relative w-full bg-[#0B1B3D] dark:bg-[#081021] text-white pt-14 pb-20 px-6 sm:px-10 lg:px-16 overflow-hidden border-b border-amber-500/20">
        <div className="max-w-6xl mx-auto relative z-10">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Panel de Usuario
          </h1>

          <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-xl font-medium leading-relaxed">
            Administra tus tiquetes digitales con QR, eventos guardados en favoritos y configuración de cuenta.
          </p>
        </div>
      </section>

      {/* Contenedor Principal */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">

        {/* Barra de Pestañas Flotante Estilo Cápsula */}
        <div className="bg-white dark:bg-[#0B1428] rounded-3xl border-2 border-amber-200/90 dark:border-slate-800 shadow-xl p-2 -mt-14 relative z-20 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 min-w-max">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              let count = null;
              if (tab.id === 'guardados') count = guardados.length;
              if (tab.id === 'proximos') count = eventosProximos.length;
              if (tab.id === 'historial') count = eventosHistorial.length;
              if (tab.id === 'entradas') count = boletosList.length;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${isActive
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-[#0B1B3D] dark:hover:text-white hover:bg-amber-50/60 dark:hover:bg-slate-800/60'
                    }`}
                >
                  <span>{tab.label}</span>
                  {count !== null && count > 0 && (
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isActive
                        ? 'bg-slate-950 text-amber-300'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                        }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Layout en 2 columnas: Sidebar Perfil + Contenido */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Sidebar de Usuario */}
          <aside className="w-full lg:w-[340px] shrink-0 space-y-6">

            {/* Tarjeta Identidad */}
            <div className="bg-white dark:bg-[#0B1428] border border-amber-200/80 dark:border-slate-800 rounded-[28px] shadow-sm p-6 relative overflow-hidden transition-all duration-300 hover:shadow-md">
              <button
                type="button"
                onClick={() => setEditModal(true)}
                title="Editar información de perfil"
                className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50/80 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <FiEdit2 size={16} />
              </button>

              <div className="flex flex-col items-center text-center">
                {/* Input de archivo oculto */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />

                {/* Avatar circular limpio con iniciales o foto */}
                <div className="relative mb-4 group">
                  <div className="w-24 h-24 rounded-full border-2 border-amber-400 p-[3px] shadow-md overflow-hidden relative bg-white dark:bg-slate-900">
                    {photoPreview || usuario.urlImagenPerfil ? (
                      <img
                        src={photoPreview || usuario.urlImagenPerfil}
                        alt={usuario.nombreCompleto}
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-[#0B1B3D] flex items-center justify-center text-amber-300 text-2xl font-black select-none">
                        {getInitials(usuario.nombreCompleto)}
                      </div>
                    )}
                  </div>

                  {/* Botón para cambiar foto */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Cambiar foto de perfil"
                    disabled={isUploadingPhoto}
                    className="absolute bottom-0 right-0 p-2 rounded-full bg-[#0B1B3D] text-amber-400 hover:text-white hover:bg-amber-600 transition-colors shadow-md border-2 border-white dark:border-slate-800 cursor-pointer"
                  >
                    <FiCamera size={14} />
                  </button>
                </div>

                {/* Botones de acción si hay foto seleccionada pendiente de subir */}
                {selectedPhotoFile && (
                  <div className="mb-4 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={handleUploadPhoto}
                      disabled={isUploadingPhoto}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm transition-all cursor-pointer disabled:opacity-60"
                    >
                      {isUploadingPhoto ? (
                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FiUpload size={12} />
                      )}
                      <span>{isUploadingPhoto ? 'Subiendo...' : 'Guardar Foto'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelPhoto}
                      disabled={isUploadingPhoto}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-[11px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <FiX size={12} />
                      <span>Cancelar</span>
                    </button>
                  </div>
                )}

                {/* Nombre del Usuario */}
                <h2 className="text-xl font-bold font-display text-[#0B1B3D] dark:text-white truncate max-w-[260px]">
                  {usuario.nombreCompleto || 'Usuario EventHive'}
                </h2>

                {/* Rol Badge */}
                <span className="mt-1 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-300/40 dark:border-amber-700/40">
                  <FiShield size={11} />
                  <span>{usuario.rol || 'CLIENTE'}</span>
                </span>
              </div>

              {/* Lista de Datos Proporcionados por el Endpoint */}
              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs">
                {/* E-mail */}
                <div className="flex items-center justify-between gap-2 py-1">
                  <span className="text-slate-400 dark:text-slate-500 font-medium shrink-0 flex items-center gap-1.5">
                    <FiMail size={13} className="text-amber-500" />
                    <span>E-mail:</span>
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate text-right max-w-[190px]" title={usuario.correo}>
                    {usuario.correo || '—'}
                  </span>
                </div>

                {/* Teléfono (si existe en el endpoint) */}
                {usuario.telefono && (
                  <div className="flex items-center justify-between gap-2 py-1">
                    <span className="text-slate-400 dark:text-slate-500 font-medium shrink-0 flex items-center gap-1.5">
                      <FiPhone size={13} className="text-amber-500" />
                      <span>Teléfono:</span>
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate text-right">
                      {usuario.telefono}
                    </span>
                  </div>
                )}
              </div>

              {/* Botón de acción */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditModal(true)}
                  className="w-full py-2.5 px-4 rounded-xl border border-amber-300 dark:border-slate-700 bg-amber-50/50 dark:bg-slate-800/60 hover:bg-amber-100/70 dark:hover:bg-slate-700 text-xs font-black uppercase tracking-wider text-amber-950 dark:text-amber-300 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-xs"
                >
                  <FiEdit2 size={13} />
                  <span>Editar Datos</span>
                </button>
              </div>
            </div>

            {/* Tarjeta Estadísticas */}
            <div className="bg-white dark:bg-[#0B1428] border-2 border-amber-200/90 dark:border-slate-800 rounded-3xl shadow-sm p-6 space-y-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 dark:text-amber-400 block">
                ACTIVIDAD EN LA APLICACION
              </span>

              <div className="flex items-center gap-3.5 text-sm">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-slate-800 border border-amber-200 dark:border-slate-700 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <FiBookmark size={18} />
                </div>
                <div>
                  <strong className="block text-lg font-black leading-none text-[#0B1B3D] dark:text-white">
                    {guardados.length}
                  </strong>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">experiencias guardadas</span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 text-sm">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-slate-800 border border-amber-200 dark:border-slate-700 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <FiShoppingBag size={18} />
                </div>
                <div>
                  <strong className="block text-lg font-black leading-none text-[#0B1B3D] dark:text-white">
                    {boletosList.length}
                  </strong>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">boletos adquiridos</span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 text-sm">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-slate-800 border border-amber-200 dark:border-slate-700 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <FiCalendar size={18} />
                </div>
                <div>
                  <strong className="block text-lg font-black leading-none text-[#0B1B3D] dark:text-white">
                    {eventosProximos.length + eventosHistorial.length}
                  </strong>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">eventos confirmados</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Contenido Principal por Pestaña */}
          <section className="flex-1 min-w-0 w-full">
            {loading ? (
              <div className="bg-white dark:bg-[#0B1428] rounded-3xl border border-amber-200/90 dark:border-slate-800 p-14 text-center shadow-sm">
                <div className="w-10 h-10 mx-auto mb-3 border-3 border-amber-400 border-t-[#0B1B3D] rounded-full animate-spin" />
                <p className="text-xs font-black uppercase tracking-wider text-[#0B1B3D] dark:text-slate-200">
                  Cargando información del usuario...
                </p>
              </div>
            ) : (
              <>
                {/* Pestaña: Mis Entradas / QR */}
                {activeTab === 'entradas' && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-[#0B1428] p-6 rounded-3xl border border-amber-200/90 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 dark:text-amber-400 block mb-1">
                          PASES OFICIALES
                        </span>
                        <h3 className="text-xl font-black text-[#0B1B3D] dark:text-white">Mis Boletos Digitales</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                          Presenta tu código QR en el acceso del evento para validar tu entrada.
                        </p>
                      </div>
                      <span className="text-xs font-black text-amber-950 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 px-3.5 py-1.5 rounded-full shrink-0 self-start sm:self-auto">
                        {boletosList.length} {boletosList.length === 1 ? 'boleto activo' : 'boletos activos'}
                      </span>
                    </div>

                    {boletosList.length === 0 ? (
                      <div className="bg-white dark:bg-[#0B1428] rounded-3xl border-2 border-dashed border-amber-300 dark:border-slate-700 p-14 text-center shadow-sm">
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 dark:bg-slate-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 text-xl">
                          <FiShoppingBag size={24} />
                        </div>
                        <h4 className="font-black text-lg text-[#0B1B3D] dark:text-white mb-1">Aún no tienes boletos adquiridos</h4>
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 max-w-sm mx-auto mb-6">
                          Explora la cartelera cultural de Cartagena de Indias y adquiere tus entradas oficiales.
                        </p>
                        <Link
                          to="/buscar"
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md transition-all active:scale-95"
                        >
                          <span>Explorar Cartelera</span>
                          <FiArrowRight size={14} />
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {boletosList.map((ticket) => (
                          <article
                            key={ticket.id}
                            className="bg-white dark:bg-[#0B1428] border-2 border-amber-200/90 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                          >
                            {/* Cabecera del Boleto */}
                            <div className="p-5 bg-[#0B1B3D] text-white relative border-b-2 border-amber-400">
                              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider mb-2">
                                <span className="text-amber-400 font-bold tracking-wider">Boleto Digital</span>
                                <span className="bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full font-black">
                                  {ticket.zona}
                                </span>
                              </div>
                              <h4 className="text-lg font-black leading-tight text-white line-clamp-1">
                                {ticket.evento}
                              </h4>
                              <div className="mt-3 flex items-center gap-3 text-xs text-slate-300 font-medium">
                                <span className="flex items-center gap-1.5">
                                  <FiCalendar size={13} className="text-amber-400" />
                                  <span>{ticket.fecha}</span>
                                </span>
                                <span>·</span>
                                <span>{ticket.hora}</span>
                              </div>
                            </div>

                            {/* Detalles de Acceso */}
                            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                              <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 font-semibold">
                                <p className="flex items-center gap-1.5 truncate">
                                  <FiMapPin className="text-amber-600 dark:text-amber-400 shrink-0" size={14} />
                                  <span>{ticket.lugar}</span>
                                </p>
                                <p>
                                  <strong className="text-[#0B1B3D] dark:text-white">Ubicación:</strong> {ticket.asiento}
                                </p>
                                <p>
                                  <strong className="text-[#0B1B3D] dark:text-white">Titular:</strong> {ticket.titular}
                                </p>
                                <p>
                                  <strong className="text-[#0B1B3D] dark:text-white">Precio:</strong> {ticket.precio}
                                </p>
                              </div>

                              {/* QR y Acciones */}
                              <div className="pt-4 border-t border-dashed border-amber-200 dark:border-slate-800 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={ticket.codigoQR}
                                    alt="QR Boleto"
                                    className="w-14 h-14 rounded-xl border border-amber-200 dark:border-slate-700 p-1 bg-white shrink-0 shadow-xs"
                                  />
                                  <div>
                                    <p className="text-[11px] font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                                      <FiCheckCircle size={12} /> {ticket.estado}
                                    </p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Acceso Oficial</p>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setTicketModal(ticket)}
                                  className="px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-slate-800 hover:bg-amber-400 dark:hover:bg-amber-500 hover:text-slate-950 text-xs font-black uppercase tracking-wider text-amber-950 dark:text-amber-300 border border-amber-300 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                >
                                  <FiExternalLink size={13} />
                                  <span>Ver QR</span>
                                </button>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Pestaña: Ajustes y Cuenta */}
                {activeTab === 'seguridad' && (
                  <div className="space-y-6">
                    {/* Información Personal */}
                    <div className="bg-white dark:bg-[#0B1428] border-2 border-amber-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 dark:text-amber-400 block mb-1">
                          DATOS DE CONTACTO
                        </span>
                        <h3 className="text-xl font-black text-[#0B1B3D] dark:text-white">Información Personal</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                          Mantén actualizados tus datos para la emisión de tus boletos oficiales.
                        </p>
                      </div>

                      <form onSubmit={handleUpdatePerfil} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1.5">
                              Nombre Completo
                            </label>
                            <input
                              type="text"
                              value={usuario.nombreCompleto}
                              onChange={(e) =>
                                setUsuario({ ...usuario, nombreCompleto: e.target.value })
                              }
                              className="w-full text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl border border-amber-200 dark:border-slate-700 bg-[#FAF8F5] dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20"
                              placeholder="Tu nombre completo"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1.5">
                              Correo Electrónico
                            </label>
                            <input
                              type="email"
                              value={usuario.correo}
                              disabled
                              className="w-full text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1.5">
                              Teléfono
                            </label>
                            <input
                              type="tel"
                              value={usuario.telefono}
                              onChange={(e) =>
                                setUsuario({ ...usuario, telefono: e.target.value })
                              }
                              className="w-full text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl border border-amber-200 dark:border-slate-700 bg-[#FAF8F5] dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20"
                              placeholder="+57 300 123 4567"
                            />
                          </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                          <button
                            type="submit"
                            disabled={isUpdating}
                            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md transition-all disabled:opacity-60 flex items-center gap-2 cursor-pointer active:scale-95"
                          >
                            {isUpdating && (
                              <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                            )}
                            <span>Guardar Datos</span>
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Cambio de Contraseña */}
                    <div className="bg-white dark:bg-[#0B1428] border-2 border-amber-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-slate-800 border border-amber-200 dark:border-slate-700 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                          <FiKey size={18} />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-[#0B1B3D] dark:text-white">
                            Seguridad de la Cuenta
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                            Actualiza tu contraseña periódicamente para proteger tus compras.
                          </p>
                        </div>
                      </div>

                      <form onSubmit={handleChangePassword} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1.5">
                              Contraseña Actual
                            </label>
                            <input
                              type="password"
                              value={passwordForm.claveActual}
                              onChange={(e) =>
                                setPasswordForm({ ...passwordForm, claveActual: e.target.value })
                              }
                              placeholder="••••••••"
                              className="w-full text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl border border-amber-200 dark:border-slate-700 bg-[#FAF8F5] dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1.5">
                              Nueva Contraseña
                            </label>
                            <input
                              type="password"
                              value={passwordForm.claveNueva}
                              onChange={(e) =>
                                setPasswordForm({ ...passwordForm, claveNueva: e.target.value })
                              }
                              placeholder="Mínimo 6 caracteres"
                              className="w-full text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl border border-amber-200 dark:border-slate-700 bg-[#FAF8F5] dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1.5">
                              Confirmar Nueva Contraseña
                            </label>
                            <input
                              type="password"
                              value={passwordForm.confirmarClave}
                              onChange={(e) =>
                                setPasswordForm({
                                  ...passwordForm,
                                  confirmarClave: e.target.value,
                                })
                              }
                              placeholder="Repite la contraseña"
                              className="w-full text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl border border-amber-200 dark:border-slate-700 bg-[#FAF8F5] dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20"
                              required
                            />
                          </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                          <button
                            type="submit"
                            disabled={isChangingPassword}
                            className="px-6 py-3 rounded-xl bg-[#0B1B3D] dark:bg-amber-500 hover:bg-slate-900 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-xs font-black uppercase tracking-wider shadow-md transition-all disabled:opacity-60 flex items-center gap-2 cursor-pointer active:scale-95"
                          >
                            {isChangingPassword && (
                              <span className="w-3.5 h-3.5 border-2 border-white dark:border-slate-950 border-t-transparent rounded-full animate-spin" />
                            )}
                            <span>Actualizar Contraseña</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Pestañas: Guardados / Próximos / Historial */}
                {(activeTab === 'guardados' ||
                  activeTab === 'proximos' ||
                  activeTab === 'historial') && (
                    <div className="space-y-6">
                      <div className="bg-white dark:bg-[#0B1428] p-6 rounded-3xl border-2 border-amber-200/90 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 dark:text-amber-400 block mb-1">
                            AGENDA PERSONAL
                          </span>
                          <h3 className="text-xl font-black text-[#0B1B3D] dark:text-white">
                            {activeTab === 'guardados'
                              ? 'Eventos Guardados en Favoritos'
                              : activeTab === 'proximos'
                                ? 'Experiencias Próximas'
                                : 'Historial de Eventos Asistidos'}
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                            {activeTab === 'guardados'
                              ? 'Experiencias que te interesan y has añadido a tu lista de deseos.'
                              : activeTab === 'proximos'
                                ? 'Eventos con boletos confirmados y pendientes por disfrutar.'
                                : 'Historial de eventos pasados en Cartagena de Indias.'}
                          </p>
                        </div>
                        <span className="text-xs font-black text-amber-950 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 px-3.5 py-1.5 rounded-full shrink-0 self-start sm:self-auto">
                          {eventosVisibles.length} {eventosVisibles.length === 1 ? 'evento' : 'eventos'}
                        </span>
                      </div>

                      {eventosVisibles.length === 0 ? (
                        <div className="bg-white dark:bg-[#0B1428] rounded-3xl border-2 border-dashed border-amber-300 dark:border-slate-700 p-14 text-center shadow-sm">
                          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 dark:bg-slate-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 text-xl">
                            <FiBookmark size={24} />
                          </div>
                          <h4 className="font-black text-lg text-[#0B1B3D] dark:text-white mb-1">
                            {activeTab === 'guardados'
                              ? 'No tienes eventos guardados en favoritos'
                              : activeTab === 'proximos'
                                ? 'No tienes eventos próximos agendados'
                                : 'Aún no registras historial de eventos'}
                          </h4>
                          <p className="text-xs font-medium text-slate-600 dark:text-slate-400 max-w-sm mx-auto mb-6">
                            Explora la cartelera cultural de Cartagena de Indias y guarda tus favoritos.
                          </p>
                          <Link
                            to="/buscar"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md transition-all active:scale-95"
                          >
                            <span>Explorar Experiencias</span>
                            <FiArrowRight size={14} />
                          </Link>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {eventosVisibles.map((evento) => (
                            <div key={evento.id} className="relative group">
                              <EventListCard event={evento} />
                              {activeTab === 'guardados' && (
                                <button
                                  type="button"
                                  onClick={(e) => handleRemoveDeseo(e, evento.id)}
                                  title="Quitar de favoritos"
                                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 dark:bg-slate-800 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center shadow-md z-20 transition-colors cursor-pointer"
                                >
                                  <FiTrash2 size={14} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
              </>
            )}
          </section>
        </div>
      </main>

      {/* Modal Digital Ticket QR */}
      {ticketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#0B1428] rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border-2 border-amber-200/90 dark:border-slate-800 text-center relative overflow-hidden">
            <button
              onClick={() => setTicketModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-[#0B1B3D] dark:hover:text-white transition-colors p-1 cursor-pointer"
            >
              <FiX size={20} />
            </button>

            <span className="text-[10px] font-black uppercase tracking-wider text-amber-950 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 px-3 py-1 rounded-full inline-block">
              Pase Digital Oficial
            </span>

            <h3 className="font-black text-lg text-[#0B1B3D] dark:text-white mt-3 leading-snug">{ticketModal.evento}</h3>
            <p className="text-xs font-bold text-amber-800 dark:text-amber-400 mt-0.5">
              {ticketModal.zona} · {ticketModal.asiento}
            </p>

            <div className="my-5 p-4 rounded-2xl bg-amber-50/50 dark:bg-slate-900 border border-amber-200 dark:border-slate-800 inline-block shadow-inner">
              <img
                src={ticketModal.codigoQR}
                alt="QR Code"
                className="w-48 h-48 mx-auto object-contain rounded-lg bg-white p-2"
              />
              <p className="font-mono text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-2 uppercase tracking-widest">
                Código de Acceso Oficial
              </p>
            </div>

            <div className="text-xs text-slate-700 dark:text-slate-300 text-left bg-[#FAF8F5] dark:bg-slate-900/80 p-3.5 rounded-2xl mb-5 space-y-1 font-medium border border-amber-100 dark:border-slate-800">
              <p>
                <strong className="text-[#0B1B3D] dark:text-white">Fecha:</strong> {ticketModal.fecha} ({ticketModal.hora})
              </p>
              <p className="truncate">
                <strong className="text-[#0B1B3D] dark:text-white">Lugar:</strong> {ticketModal.lugar}
              </p>
              <p>
                <strong className="text-[#0B1B3D] dark:text-white">Titular:</strong> {ticketModal.titular}
              </p>
              <p>
                <strong className="text-[#0B1B3D] dark:text-white">Precio:</strong> {ticketModal.precio}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                Swal.fire({
                  icon: 'info',
                  title: 'Boleto Digital Verificado',
                  text: 'Puedes presentar este código QR directamente en tu dispositivo o guardar una captura para ingresar.',
                  confirmButtonColor: '#0B1B3D',
                });
              }}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <FiDownload size={14} />
              <span>Guardar / Confirmar Pase</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal Editar Perfil */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#0B1428] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border-2 border-amber-200/90 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-amber-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FiEdit2 className="text-amber-500 text-lg" />
                <h3 className="text-lg font-black text-[#0B1B3D] dark:text-white">
                  Editar Datos del Perfil
                </h3>
              </div>
              <button
                onClick={() => setEditModal(false)}
                className="text-slate-400 hover:text-[#0B1B3D] dark:hover:text-white p-1 cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdatePerfil} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={usuario.nombreCompleto}
                  onChange={(e) => setUsuario({ ...usuario, nombreCompleto: e.target.value })}
                  className="w-full text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl border border-amber-200 dark:border-slate-700 bg-[#FAF8F5] dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1">
                  Correo Electrónico (Solo Lectura)
                </label>
                <input
                  type="email"
                  value={usuario.correo}
                  disabled
                  className="w-full text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1">
                  Teléfono (Máx. 10 dígitos)
                </label>
                <input
                  type="tel"
                  value={usuario.telefono}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setUsuario({ ...usuario, telefono: cleaned });
                  }}
                  maxLength={10}
                  placeholder="Ej: 3001234567"
                  className="w-full text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl border border-amber-200 dark:border-slate-700 bg-[#FAF8F5] dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20"
                />
              </div>

              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setEditModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  {isUpdating && (
                    <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>Guardar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}