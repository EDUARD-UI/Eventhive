import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiShield,
  FiCamera,
  FiCheckCircle,
  FiEdit2,
  FiLock,
  FiX,
  FiSave,
  FiClock,
  FiAlertTriangle,
  FiClipboard,
  FiLayers,
  FiCheck,
  FiShoppingBag,
  FiExternalLink,
  FiCalendar,
  FiMapPin,
  FiArrowRight,
  FiCreditCard,
  FiTag,
  FiDollarSign,
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import Badge from '../../components/Shared/Badge.jsx';
import {
  ProfileCard,
  ProfileField,
  ProfileMetric,
} from '../../components/Shared/DashboardProfileComponents.jsx';
import ModalTicketQR from '../../components/perfilUsuario/ModalTicketQR.jsx';
import { session, extractPhotoUrl } from '../../services/session.js';
import userService, { readFileAsDataUrl } from '../../services/userService.js';
import moderationService from '../../services/moderationService.js';
import { organizerService } from '../../services/organizerService.js';
import { formatPrice, formatHora12 } from '../../utils/formatters.js';

const formatBoletoFecha = (fechaRaw) => {
  if (!fechaRaw) return 'Fecha por confirmar';
  if (typeof fechaRaw === 'string') {
    const trimmed = fechaRaw.trim();
    if (trimmed.includes('T') || (trimmed.includes('-') && trimmed.length >= 10)) {
      try {
        const d = new Date(trimmed);
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString('es-CO', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });
        }
      } catch {
        // fallback
      }
    }
  }
  return fechaRaw;
};

export default function ModeradorPerfilView({ onNavigateTab }) {
  const sessionUser = session.getUser();
  const fileInputRef = useRef(null);

  // Estados de datos de perfil
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState(sessionUser?.name || sessionUser?.nombre || 'Moderador');
  const [email, setEmail] = useState(sessionUser?.email || 'moderador@eventhive.local');
  const [telefono, setTelefono] = useState(sessionUser?.telefono || '');
  const [fotoUrl, setFotoUrl] = useState(extractPhotoUrl(sessionUser) || '');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Estadísticas de moderación
  const [stats, setStats] = useState({
    publicados: 0,
    pendientesRevision: 0,
    enCorreccion: 0,
    rechazados: 0,
  });

  // Modal / Drawer de edición de perfil
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

  // Pestaña activa del perfil: 'atribuciones' | 'boletos' | 'historial'
  const [activeTab, setActiveTab] = useState('atribuciones');

  // Compras y Boletos del moderador
  const [compras, setCompras] = useState([]);
  const [ticketModal, setTicketModal] = useState(null);
  const [selectedCompraTickets, setSelectedCompraTickets] = useState([]);

  // Cargar perfil inmediatamente sin bloquear por estadísticas ni compras
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
        }
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
      .catch(() => {});

    organizerService
      .getMisCompras({ page: 0, size: 50 })
      .then((comprasRes) => {
        if (!isMounted) return;
        const itemsCompras = Array.isArray(comprasRes)
          ? comprasRes
          : comprasRes?.content || comprasRes?.data || [];

        let localCompras = [];
        try {
          localCompras = JSON.parse(localStorage.getItem('eventhive_local_compras') || '[]');
        } catch {}
        setCompras([...localCompras, ...itemsCompras]);
      })
      .catch((err) => {
        console.warn('No se pudo cargar compras en perfil moderador:', err);
        let localCompras = [];
        try {
          localCompras = JSON.parse(localStorage.getItem('eventhive_local_compras') || '[]');
        } catch {}
        if (isMounted) setCompras(localCompras);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Subir o actualizar foto de perfil
  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      Swal.fire({
        icon: 'error',
        title: 'Formato inválido',
        text: 'Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP).',
        confirmButtonColor: '#087fea',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'Imagen muy pesada',
        text: 'La fotografía no debe superar los 5MB.',
        confirmButtonColor: '#087fea',
      });
      return;
    }

    const previousPhoto = fotoUrl;
    const dataUrlPreview = await readFileAsDataUrl(file);
    if (dataUrlPreview) {
      setPhotoPreview(dataUrlPreview);
      // Actualización optimista inmediata para que el icono del navegador cambie al instante
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
        title: 'Foto actualizada',
        text: 'Tu fotografía de perfil fue actualizada exitosamente.',
        timer: 2000,
        confirmButtonColor: '#087fea',
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
          'No fue posible actualizar la fotografía de perfil.',
        confirmButtonColor: '#087fea',
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
    if (!editNombre.trim()) {
      setEditError('El nombre completo es obligatorio.');
      return;
    }

    try {
      setSaving(true);
      setEditError(null);
      await userService.updatePerfil({
        nombre: editNombre.trim(),
        telefono: editTelefono.trim(),
      });

      setNombre(editNombre.trim());
      setTelefono(editTelefono.trim());
      session.updateUser({
        name: editNombre.trim(),
        nombre: editNombre.trim(),
        telefono: editTelefono.trim(),
      });

      setShowEditDrawer(false);
      Swal.fire({
        icon: 'success',
        title: 'Perfil actualizado',
        text: 'Tus datos de moderador se actualizaron correctamente.',
        timer: 2000,
        confirmButtonColor: '#087fea',
      });
    } catch (err) {
      setEditError(
        err?.response?.data?.message ||
        err?.message ||
        'Error al guardar los cambios en el perfil.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Ingresa tu contraseña actual.');
      return;
    }

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
        text: 'Tu contraseña de acceso fue cambiada exitosamente.',
        confirmButtonColor: '#087fea',
      });
    } catch (err) {
      setPasswordError(
        err?.response?.data?.message ||
        err?.message ||
        'La contraseña actual es incorrecta o no cumple los requisitos.'
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const displayPhoto = photoPreview || fotoUrl;
  const userInitials = nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || 'MD';

  const publicadosCount = stats.publicados ?? stats.aprobados ?? 0;
  const pendientesCount = stats.pendientesRevision ?? stats.pendientes ?? 0;
  const enCorreccionCount = stats.enCorreccion ?? 0;
  const rechazadosCount = stats.rechazados ?? 0;
  const totalAuditados = publicadosCount + enCorreccionCount + rechazadosCount;

  // Formatear boletos digitales a partir de las compras reales y locales
  const boletosList = React.useMemo(() => {
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
            fecha: formatBoletoFecha(evento.fecha || compra.fechaCompra),
            hora: evento.hora ? formatHora12(evento.hora) : 'Hora por confirmar',
            lugar: evento.lugar || evento.ubicacion || 'Cartagena de Indias',
            zona: b.localidadNombre || localidad.nombre || 'Entrada General',
            asiento: b.asiento || b.numeroAsiento || 'Acceso General',
            titular: b.titular || nombre || 'Moderador',
            precio: b.precio ? formatPrice(b.precio) : formatPrice(compra.total || 0),
            estado: b.estado || compra.estado || 'Válido para ingreso',
            codigoQR: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
              b.codigo || `TKT-${b.id || compra.id}-${nombre}`
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
            fecha: formatBoletoFecha(evento.fecha || compra.fechaCompra),
            hora: evento.hora ? formatHora12(evento.hora) : 'Hora por confirmar',
            lugar: evento.lugar || evento.ubicacion || 'Cartagena de Indias',
            zona: localidad.nombre || compra.localidadNombre || 'Entrada General',
            asiento: `Boleto #${i}`,
            titular: nombre || 'Moderador',
            precio: formatPrice(compra.total || 0),
            estado: compra.estado || 'Válido para ingreso',
            codigoQR: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
              `${tktId}-${nombre}`
            )}`,
          });
        }
      }
    });
    return list;
  }, [compras, nombre]);

  // Abrir modal de QR directamente desde una compra
  const handleOpenTicketModalForCompra = (compra) => {
    const matchingTickets = boletosList.filter((b) => String(b.compraId) === String(compra.id));
    if (matchingTickets.length > 0) {
      setTicketModal(matchingTickets[0]);
      setSelectedCompraTickets(matchingTickets);
    } else {
      const evento = compra.evento || {};
      const localidad = compra.localidad || {};
      const fallbackTicket = {
        id: `TKT-${compra.id}`,
        compraId: compra.id,
        evento: evento.titulo || compra.eventoTitulo || 'Evento Cultural EventHive',
        fecha: formatBoletoFecha(evento.fecha || compra.fechaCompra),
        hora: evento.hora ? formatHora12(evento.hora) : 'Hora por confirmar',
        lugar: evento.lugar || evento.ubicacion || 'Cartagena de Indias',
        zona: localidad.nombre || compra.localidadNombre || 'Entrada General',
        asiento: 'Acceso General',
        titular: nombre || 'Moderador',
        precio: formatPrice(compra.total || 0),
        estado: compra.estado || 'Válido para ingreso',
        codigoQR: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
          `TKT-${compra.id}-${nombre}`
        )}`,
      };
      setTicketModal(fallbackTicket);
      setSelectedCompraTickets([fallbackTicket]);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Tarjeta Principal de Identidad del Moderador */}
      <ProfileCard className="relative overflow-hidden border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            {/* Avatar con botón de subida de imagen */}
            <div className="relative group shrink-0">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoSelect}
                accept="image/*"
                className="hidden"
              />
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-900 border-2 border-brand/40 overflow-hidden shadow-md flex items-center justify-center relative">
                {displayPhoto ? (
                  <img
                    key={displayPhoto}
                    src={displayPhoto}
                    alt={nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950 text-white font-extrabold text-3xl">
                    {userInitials}
                  </div>
                )}

                {uploadingPhoto && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-bold">
                    Subiendo...
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                title="Cambiar fotografía de perfil"
                className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-brand text-white shadow-md hover:bg-brand-dark transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <FiCamera size={14} />
              </button>
            </div>

            {/* Información Personal */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <FiCheckCircle size={12} className="text-emerald-600" />
                  <span>Cuenta Activa y Verificada</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {nombre}
              </h1>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <FiMail className="text-brand shrink-0" size={13} />
                  <span>{email}</span>
                </span>
                {telefono && (
                  <span className="flex items-center gap-1.5">
                    <FiPhone className="text-brand shrink-0" size={13} />
                    <span>{telefono}</span>
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <FiShield className="text-amber-500 shrink-0" size={13} />
                  <span>Cartagena Cultural Hive</span>
                </span>
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={openEditDrawer}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <FiEdit2 size={13} />
              <span>Editar datos</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPasswordError('');
                setShowPasswordModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <FiLock size={13} />
              <span>Seguridad y Contraseña</span>
            </button>
          </div>
        </div>
      </ProfileCard>

      {/* 2. Barra de Navegación de Pestañas de Perfil */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('atribuciones')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'atribuciones'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
        >
          <FiShield size={14} />
          <span>Atribuciones y Seguridad</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('historial')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'historial'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
        >
          <FiClock size={14} />
          <span>Historial de Compras</span>
          {compras.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-200 text-slate-800">
              {compras.length}
            </span>
          )}
        </button>
      </div>

      {/* 3. VISTA: Atribuciones y Seguridad */}
      {activeTab === 'atribuciones' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-200">
          <ProfileCard className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="p-2 rounded-xl bg-blue-50 text-brand">
                <FiShield size={18} />
              </span>
              <div>
                <h3 className="font-display text-sm font-bold text-slate-900">
                  Atribuciones de Moderador
                </h3>
                <p className="text-xs text-slate-500">
                  Responsabilidades operativas asignadas a tu cuenta
                </p>
              </div>
            </div>

            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-600 mt-0.5">
                  <FiCheck size={14} />
                </span>
                <span>
                  <strong>Aprobación de publicaciones:</strong> Habilitar la visibilidad oficial de eventos en la cartelera de Cartagena.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-blue-600 mt-0.5">
                  <FiCheck size={14} />
                </span>
                <span>
                  <strong>Solicitud de correcciones:</strong> Emitir observaciones formales a los organizadores para subsanar errores de aforo, fechas o contenido.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-600 mt-0.5">
                  <FiCheck size={14} />
                </span>
                <span>
                  <strong>Rechazo fundamentado:</strong> Denegar publicaciones que contravengan las normas de la comunidad o requisitos legales.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-amber-600 mt-0.5">
                  <FiCheck size={14} />
                </span>
                <span>
                  <strong>Auditoría de eventos:</strong> Inspección de localidades, precios de boletería y material fotográfico.
                </span>
              </li>
            </ul>
          </ProfileCard>

          <ProfileCard className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <FiLock size={18} />
              </span>
              <div>
                <h3 className="font-display text-sm font-bold text-slate-900">
                  Seguridad y Acceso
                </h3>
                <p className="text-xs text-slate-500">
                  Estado de la sesión y credenciales administrativas
                </p>
              </div>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Autenticación en dos pasos (Sesión Activa)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Token JWT seguro y cifrado de conexión HTTPS
                  </span>
                </div>
                <span className="text-xs font-bold text-emerald-600">Activo</span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Contraseña de acceso
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Protegida con algoritmos de hashing seguro
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPasswordError('');
                    setShowPasswordModal(true);
                  }}
                  className="text-xs font-bold text-brand hover:underline cursor-pointer"
                >
                  Cambiar
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2">
                <FiClock className="text-amber-600 mt-0.5 shrink-0" size={14} />
                <span>
                  Como moderador institucional, recuerda mantener tu contraseña segura y no compartir credenciales de acceso con terceros.
                </span>
              </div>
            </div>
          </ProfileCard>
        </div>
      )}

      {/* 4. VISTA: Mis Boletos Digitales (con visualizador de QR) */}
      {activeTab === 'boletos' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Mis Boletos Digitales
              </h2>
              <p className="text-xs text-slate-500">
                Entradas oficiales adquiridas en EventHive con código QR para ingreso
              </p>
            </div>
            <Link
              to="/buscar"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:text-brand-dark"
            >
              <span>Explorar más eventos</span>
              <FiArrowRight size={13} />
            </Link>
          </div>

          {boletosList.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-10 sm:p-14 text-center shadow-xs">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-3.5 border border-amber-200/80">
                <FiShoppingBag size={22} />
              </div>
              <h4 className="font-extrabold text-base sm:text-lg text-slate-900 mb-1">
                Aún no tienes boletos adquiridos
              </h4>
              <p className="text-xs font-medium text-slate-500 max-w-sm mx-auto mb-5">
                Como moderador también puedes adquirir entradas y asistir a los eventos culturales oficiales de Cartagena.
              </p>
              <Link
                to="/buscar"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-all active:scale-95"
              >
                <span>Explorar Cartelera</span>
                <FiArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {boletosList.map((ticket) => (
                <article
                  key={ticket.id}
                  className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                >
                  {/* Cabecera oscura del Boleto */}
                  <div className="p-4 bg-slate-900 text-white relative border-b border-slate-800">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-1.5">
                      <span className="text-amber-400">Boleto Digital</span>
                      <span className="bg-slate-800 text-slate-200 border border-slate-700 px-2 py-0.5 rounded-full">
                        {ticket.zona}
                      </span>
                    </div>
                    <h4 className="text-base font-extrabold leading-tight text-white line-clamp-1">
                      {ticket.evento}
                    </h4>
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-300 font-medium">
                      <span className="flex items-center gap-1.5">
                        <FiCalendar size={12} className="text-amber-400" />
                        <span>{ticket.fecha}</span>
                      </span>
                      <span>·</span>
                      <span>{ticket.hora}</span>
                    </div>
                  </div>

                  {/* Detalles del Boleto */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5 text-xs text-slate-700 font-medium">
                      <p className="flex items-center gap-1.5 truncate">
                        <FiMapPin className="text-slate-400 shrink-0" size={13} />
                        <span className="truncate">{ticket.lugar}</span>
                      </p>
                      <p>
                        <strong className="text-slate-900 font-semibold">Ubicación:</strong> {ticket.asiento}
                      </p>
                      <p>
                        <strong className="text-slate-900 font-semibold">Titular:</strong> {ticket.titular}
                      </p>
                      <p>
                        <strong className="text-slate-900 font-semibold">Precio:</strong> {ticket.precio}
                      </p>
                    </div>

                    {/* QR en miniatura y Botón de Apertura de QR Completo */}
                    <div className="pt-3 border-t border-dashed border-slate-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={ticket.codigoQR}
                          alt="QR Boleto"
                          className="w-12 h-12 rounded-lg border border-slate-200 p-0.5 bg-white shrink-0 shadow-2xs"
                        />
                        <div>
                          <p className="text-[11px] font-mono font-bold text-slate-900 flex items-center gap-1">
                            <FiCheckCircle size={12} className="text-emerald-500" /> {ticket.estado}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">Acceso Oficial</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setTicketModal(ticket);
                          setSelectedCompraTickets([ticket]);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <FiExternalLink size={12} />
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

      {/* 5. VISTA: Historial de Compras */}
      {activeTab === 'historial' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Historial de Compras
              </h2>
              <p className="text-xs text-slate-500">
                Registro de órdenes y transacciones de boletería realizadas
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              Total compras: {compras.length}
            </span>
          </div>

          {compras.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-10 sm:p-14 text-center shadow-xs">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mb-3.5 border border-slate-200">
                <FiClock size={22} />
              </div>
              <h4 className="font-extrabold text-base sm:text-lg text-slate-900 mb-1">
                Aún no registras compras
              </h4>
              <p className="text-xs font-medium text-slate-500 max-w-sm mx-auto mb-5">
                Tus órdenes de compra y facturas de boletos se listarán aquí en orden cronológico.
              </p>
              <Link
                to="/buscar"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-all active:scale-95"
              >
                <span>Explorar Cartelera</span>
                <FiArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {compras.map((compra, index) => {
                const evento = compra.evento || {};
                const total = compra.total ? formatPrice(compra.total) : '$0';
                const fecha = formatBoletoFecha(compra.fechaCompra || evento.fecha);
                const orderId = compra.id || index + 1;
                const boletosCount = compra.boletos?.length || compra.cantidad || 1;

                return (
                  <div
                    key={orderId}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                          #ORD-{orderId}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <FiCalendar size={11} className="text-brand" />
                          <span>{fecha}</span>
                        </span>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          Pago Confirmado
                        </span>
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-slate-900">
                        {evento.titulo || compra.eventoTitulo || 'Evento Cultural EventHive'}
                      </h4>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <FiMapPin size={11} />
                          <span>{evento.lugar || evento.ubicacion || 'Cartagena de Indias'}</span>
                        </span>
                        <span>·</span>
                        <span>{boletosCount} entrada(s)</span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 shrink-0 gap-2">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block sm:text-right">
                          Total Pagado
                        </span>
                        <span className="text-base sm:text-lg font-black text-slate-900">
                          {total}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenTicketModalForCompra(compra)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                        title="Ver código QR de los boletos"
                      >
                        <FiExternalLink size={13} />
                        <span>Ver boletos (QR)</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. MODAL / DRAWER DE EDICIÓN DE PERFIL */}
      {showEditDrawer && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-50 text-brand">
                  <FiEdit2 size={16} />
                </span>
                <h3 className="font-display text-base font-bold text-slate-900">
                  Editar Datos del Moderador
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEditDrawer(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <FiX size={18} />
              </button>
            </div>

            {editError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Sección de fotografía también disponible desde el modal de edición */}
              <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                  {displayPhoto ? (
                    <img
                      key={displayPhoto}
                      src={displayPhoto}
                      alt={nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-extrabold text-lg">{userInitials}</span>
                  )}
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 shadow-2xs cursor-pointer transition-colors"
                  >
                    <FiCamera size={13} className="text-brand" />
                    <span>{uploadingPhoto ? 'Subiendo...' : 'Cambiar foto de perfil'}</span>
                  </button>
                  <p className="text-[10px] text-slate-400 mt-1">
                    JPG, PNG o WebP (máx. 5 MB)
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  required
                  placeholder="Ej: Sofía Bermúdez"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Correo Electrónico (Institucional)
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 text-sm cursor-not-allowed"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  El correo institucional solo puede ser modificado por el Administrador.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Teléfono de Contacto
                </label>
                <input
                  type="tel"
                  value={editTelefono}
                  onChange={(e) => setEditTelefono(e.target.value)}
                  placeholder="Ej: +57 300 123 4567"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 mt-5">
                <button
                  type="button"
                  onClick={() => setShowEditDrawer(false)}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <FiSave size={14} />
                  <span>{saving ? 'Guardando...' : 'Guardar cambios'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL DE CÓDIGO QR DE BOLETO */}
      {ticketModal && (
        <ModalTicketQR
          ticket={ticketModal}
          tickets={selectedCompraTickets}
          onClose={() => {
            setTicketModal(null);
            setSelectedCompraTickets([]);
          }}
        />
      )}

      {/* 5. MODAL DE CAMBIO DE CONTRASEÑA */}
      {showPasswordModal && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <FiLock size={16} />
                </span>
                <h3 className="font-display text-base font-bold text-slate-900">
                  Actualizar Contraseña
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <FiX size={18} />
              </button>
            </div>

            {passwordError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                {passwordError}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contraseña Actual *
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="Tu clave actual"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"
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
                  required
                  minLength={8}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirmar Nueva Contraseña *
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Repite la nueva clave"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 mt-5">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  disabled={passwordLoading}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <FiLock size={14} />
                  <span>{passwordLoading ? 'Cambiando...' : 'Cambiar clave'}</span>
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
