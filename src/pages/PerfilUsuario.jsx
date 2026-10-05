import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import Navbar from '../components/usersComponets/Navbar.jsx';
import Footer from '../components/usersComponets/Footer.jsx';
import ImageWithFallback from '../components/common/ImageWithFallback.jsx';
import { userService } from '../services/userService.js';
import { organizerService } from '../services/organizerService.js';
import { normalizeEvent } from '../services/eventService.js';
import { session } from '../services/session.js';
import { formatPrice, getCategoryGradient } from '../utils/formatters.js';

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
  const [activeTab, setActiveTab] = useState('guardados');
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
    ciudad: 'Cartagena de Indias',
    rol: 'CLIENTE',
    notifEmail: true,
    notifWhatsapp: true,
  });

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
              telefono: perfilData.telefono || '',
              ciudad: perfilData.ciudad || 'Cartagena de Indias',
              rol: perfilData.rol || sessionUser.role || 'CLIENTE',
            }));
          }
        } catch (err) {
          console.warn('No se pudo cargar /usuarios/perfil, usando datos de sesión:', err);
          if (isMounted) {
            setUsuario((prev) => ({
              ...prev,
              nombreCompleto: sessionUser.name || 'Usuario',
              correo: sessionUser.email || '',
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

  // Guardar datos de perfil (PUT /usuarios/perfil)
  const handleUpdatePerfil = async (e) => {
    e.preventDefault();
    if (!usuario.nombreCompleto.trim()) {
      Swal.fire('Atención', 'El nombre es obligatorio.', 'warning');
      return;
    }

    try {
      setIsUpdating(true);
      await userService.updatePerfil({
        nombre: usuario.nombreCompleto.trim(),
        telefono: usuario.telefono.trim(),
      });

      // Actualizar sesión local con el nuevo nombre
      const current = session.getUser() || {};
      session.save({
        ...current,
        nombre: usuario.nombreCompleto.trim(),
      });

      Swal.fire({
        icon: 'success',
        title: '¡Perfil actualizado!',
        text: 'Tus datos se guardaron correctamente en la Colmena.',
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
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-slate-900 selection:bg-amber-400 selection:text-slate-950 font-body">
      <Navbar />

      {/* Header Colmena Cultural */}
      <section className="relative w-full bg-[#0B1B3D] text-white pt-14 pb-20 px-6 sm:px-10 lg:px-16 overflow-hidden border-b border-amber-500/20">
        <div className="absolute inset-0 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

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
        <div className="bg-white rounded-3xl border-2 border-amber-200/90 shadow-xl p-2 -mt-14 relative z-20 overflow-x-auto scrollbar-none">
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
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-600 hover:text-[#0B1B3D] hover:bg-amber-50/60'
                    }`}
                >
                  <span>{tab.label}</span>
                  {count !== null && count > 0 && (
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isActive
                        ? 'bg-slate-950 text-amber-300'
                        : 'bg-amber-100 text-amber-950 border border-amber-300'
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

          {/* Sidebar de Usuario — Guía Tarjeta Imagen 1 */}
          <aside className="w-full lg:w-[340px] shrink-0 space-y-6">

            {/* Tarjeta Identidad (Basada en Imagen 1) */}
            <div className="bg-white border border-amber-200/80 rounded-[28px] shadow-sm p-6 relative overflow-hidden transition-all duration-300 hover:shadow-md">
              {/* Botón de editar arriba a la derecha (estilo icono de la imagen 1) */}
              <button
                type="button"
                onClick={() => setEditModal(true)}
                title="Editar información de perfil"
                className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50/80 transition-colors cursor-pointer"
              >
                <FiEdit2 size={16} />
              </button>

              <div className="flex flex-col items-center text-center">
                {/* Avatar circular limpio con iniciales */}
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-200 p-[3px] shadow-md">
                    <div className="w-full h-full rounded-full bg-[#0B1B3D] flex items-center justify-center text-amber-300 text-2xl font-black select-none">
                      {getInitials(usuario.nombreCompleto)}
                    </div>
                  </div>
                  <span
                    className="absolute bottom-0 right-0 p-1.5 rounded-full bg-emerald-500 text-white ring-2 ring-white shadow-xs"
                    title="Usuario Verificado"
                  >
                    <FiCheckCircle size={13} />
                  </span>
                </div>

                {/* Nombre del Usuario */}
                <h2 className="text-xl font-bold font-display text-[#0B1B3D] truncate max-w-[260px]">
                  {usuario.nombreCompleto || 'Usuario EventHive'}
                </h2>

                {/* Rol Badge */}
                <span className="mt-1 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-amber-500/10 text-amber-700 border border-amber-300/40">
                  <FiShield size={11} />
                  <span>{usuario.rol || 'CLIENTE'}</span>
                </span>
              </div>

              {/* Lista de Datos Proporcionados por el Endpoint */}
              <div className="mt-6 pt-5 border-t border-slate-100 space-y-3 text-xs">
                {/* E-mail */}
                <div className="flex items-center justify-between gap-2 py-1">
                  <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1.5">
                    <FiMail size={13} className="text-amber-500" />
                    <span>E-mail:</span>
                  </span>
                  <span className="font-semibold text-slate-800 truncate text-right max-w-[190px]" title={usuario.correo}>
                    {usuario.correo || '—'}
                  </span>
                </div>

                {/* Teléfono (si existe en el endpoint) */}
                {usuario.telefono && (
                  <div className="flex items-center justify-between gap-2 py-1">
                    <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1.5">
                      <FiPhone size={13} className="text-amber-500" />
                      <span>Teléfono:</span>
                    </span>
                    <span className="font-semibold text-slate-800 truncate text-right">
                      {usuario.telefono}
                    </span>
                  </div>
                )}
              </div>

              {/* Botón de acción */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModal(true)}
                  className="w-full py-2.5 px-4 rounded-xl border border-amber-300 hover:border-amber-400 bg-amber-50/50 hover:bg-amber-100/70 text-xs font-black uppercase tracking-wider text-amber-950 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-xs"
                >
                  <FiEdit2 size={13} />
                  <span>Editar Datos</span>
                </button>
              </div>
            </div>

            {/* Tarjeta Estadísticas */}
            <div className="bg-white border-2 border-amber-200/90 rounded-3xl shadow-sm p-6 space-y-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 block">
                ACTIVIDAD EN LA APLICACION
              </span>

              <div className="flex items-center gap-3.5 text-sm">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                  <FiBookmark size={18} />
                </div>
                <div>
                  <strong className="block text-lg font-black leading-none text-[#0B1B3D]">
                    {guardados.length}
                  </strong>
                  <span className="text-xs font-medium text-slate-500">experiencias guardadas</span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 text-sm">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                  <FiShoppingBag size={18} />
                </div>
                <div>
                  <strong className="block text-lg font-black leading-none text-[#0B1B3D]">
                    {boletosList.length}
                  </strong>
                  <span className="text-xs font-medium text-slate-500">boletos adquiridos</span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 text-sm">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                  <FiCalendar size={18} />
                </div>
                <div>
                  <strong className="block text-lg font-black leading-none text-[#0B1B3D]">
                    {eventosProximos.length + eventosHistorial.length}
                  </strong>
                  <span className="text-xs font-medium text-slate-500">eventos confirmados</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Contenido Principal por Pestaña */}
          <section className="flex-1 min-w-0 w-full">
            {loading ? (
              <div className="bg-white rounded-3xl border border-amber-200/90 p-14 text-center shadow-sm">
                <div className="w-10 h-10 mx-auto mb-3 border-3 border-amber-400 border-t-[#0B1B3D] rounded-full animate-spin" />
                <p className="text-xs font-black uppercase tracking-wider text-[#0B1B3D]">
                  Cargando información del usuario...
                </p>
              </div>
            ) : (
              <>
                {/* Pestaña: Mis Entradas / QR */}
                {activeTab === 'entradas' && (
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-amber-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 block mb-1">
                          PASES OFICIALES
                        </span>
                        <h3 className="text-xl font-black text-[#0B1B3D]">Mis Boletos Digitales</h3>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Presenta tu código QR en el acceso del evento para validar tu entrada.
                        </p>
                      </div>
                      <span className="text-xs font-black text-amber-950 bg-amber-100 border border-amber-300 px-3.5 py-1.5 rounded-full shrink-0 self-start sm:self-auto">
                        {boletosList.length} {boletosList.length === 1 ? 'boleto activo' : 'boletos activos'}
                      </span>
                    </div>

                    {boletosList.length === 0 ? (
                      <div className="bg-white rounded-3xl border-2 border-dashed border-amber-300 p-14 text-center shadow-sm">
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 text-xl">
                          <FiShoppingBag size={24} />
                        </div>
                        <h4 className="font-black text-lg text-[#0B1B3D] mb-1">Aún no tienes boletos adquiridos</h4>
                        <p className="text-xs font-medium text-slate-600 max-w-sm mx-auto mb-6">
                          Explora la cartelera cultural de Cartagena de Indias y adquiere tus entradas oficiales.
                        </p>
                        <Link
                          to="/buscar"
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md transition-all active:scale-95"
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
                            className="bg-white border-2 border-amber-200/90 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                          >
                            {/* Cabecera del Boleto */}
                            <div className="p-5 bg-[#0B1B3D] text-white relative border-b-2 border-amber-400">
                              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider mb-2">
                                <span className="text-amber-400">{ticket.id}</span>
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
                              <div className="space-y-2 text-xs text-slate-700 font-semibold">
                                <p className="flex items-center gap-1.5 truncate">
                                  <FiMapPin className="text-amber-600 shrink-0" size={14} />
                                  <span>{ticket.lugar}</span>
                                </p>
                                <p>
                                  <strong className="text-[#0B1B3D]">Ubicación:</strong> {ticket.asiento}
                                </p>
                                <p>
                                  <strong className="text-[#0B1B3D]">Titular:</strong> {ticket.titular}
                                </p>
                                <p>
                                  <strong className="text-[#0B1B3D]">Precio:</strong> {ticket.precio}
                                </p>
                              </div>

                              {/* QR y Acciones */}
                              <div className="pt-4 border-t border-dashed border-amber-200 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={ticket.codigoQR}
                                    alt="QR Boleto"
                                    className="w-14 h-14 rounded-xl border border-amber-200 p-1 bg-white shrink-0 shadow-xs"
                                  />
                                  <div>
                                    <p className="text-[11px] font-black text-emerald-700 flex items-center gap-1">
                                      <FiCheckCircle size={12} /> {ticket.estado}
                                    </p>
                                    <p className="text-[10px] text-slate-500 font-mono">ID: {ticket.id}</p>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setTicketModal(ticket)}
                                  className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-400 hover:text-slate-950 text-xs font-black uppercase tracking-wider text-amber-950 border border-amber-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
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
                    <div className="bg-white border-2 border-amber-200/90 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 block mb-1">
                          DATOS DE CONTACTO
                        </span>
                        <h3 className="text-xl font-black text-[#0B1B3D]">Información Personal</h3>
                        <p className="text-xs text-slate-600 mt-0.5 font-medium">
                          Mantén actualizados tus datos para la emisión de tus boletos oficiales.
                        </p>
                      </div>

                      <form onSubmit={handleUpdatePerfil} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                              Nombre Completo
                            </label>
                            <input
                              type="text"
                              value={usuario.nombreCompleto}
                              onChange={(e) =>
                                setUsuario({ ...usuario, nombreCompleto: e.target.value })
                              }
                              className="w-full text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl border border-amber-200 bg-[#FAF8F5] outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20"
                              placeholder="Tu nombre completo"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                              Correo Electrónico
                            </label>
                            <input
                              type="email"
                              value={usuario.correo}
                              disabled
                              className="w-full text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                              Teléfono
                            </label>
                            <input
                              type="tel"
                              value={usuario.telefono}
                              onChange={(e) =>
                                setUsuario({ ...usuario, telefono: e.target.value })
                              }
                              className="w-full text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl border border-amber-200 bg-[#FAF8F5] outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20"
                              placeholder="+57 300 123 4567"
                            />
                          </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                          <button
                            type="submit"
                            disabled={isUpdating}
                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md shadow-amber-500/20 transition-all disabled:opacity-60 flex items-center gap-2 cursor-pointer active:scale-95"
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
                    <div className="bg-white border-2 border-amber-200/90 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                          <FiKey size={18} />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-[#0B1B3D]">
                            Seguridad de la Cuenta
                          </h3>
                          <p className="text-xs text-slate-600 mt-0.5 font-medium">
                            Actualiza tu contraseña periódicamente para proteger tus compras.
                          </p>
                        </div>
                      </div>

                      <form onSubmit={handleChangePassword} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                              Contraseña Actual
                            </label>
                            <input
                              type="password"
                              value={passwordForm.claveActual}
                              onChange={(e) =>
                                setPasswordForm({ ...passwordForm, claveActual: e.target.value })
                              }
                              placeholder="••••••••"
                              className="w-full text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl border border-amber-200 bg-[#FAF8F5] outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                              Nueva Contraseña
                            </label>
                            <input
                              type="password"
                              value={passwordForm.claveNueva}
                              onChange={(e) =>
                                setPasswordForm({ ...passwordForm, claveNueva: e.target.value })
                              }
                              placeholder="Mínimo 6 caracteres"
                              className="w-full text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl border border-amber-200 bg-[#FAF8F5] outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
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
                              className="w-full text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl border border-amber-200 bg-[#FAF8F5] outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20"
                              required
                            />
                          </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                          <button
                            type="submit"
                            disabled={isChangingPassword}
                            className="px-6 py-3 rounded-xl bg-[#0B1B3D] hover:bg-slate-900 text-white text-xs font-black uppercase tracking-wider shadow-md transition-all disabled:opacity-60 flex items-center gap-2 cursor-pointer active:scale-95"
                          >
                            {isChangingPassword && (
                              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
                      <div className="bg-white p-6 rounded-3xl border-2 border-amber-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 block mb-1">
                            AGENDA PERSONAL
                          </span>
                          <h3 className="text-xl font-black text-[#0B1B3D]">
                            {activeTab === 'guardados'
                              ? 'Eventos Guardados en Favoritos'
                              : activeTab === 'proximos'
                                ? 'Experiencias Próximas'
                                : 'Historial de Eventos Asistidos'}
                          </h3>
                          <p className="text-xs text-slate-600 mt-0.5">
                            {activeTab === 'guardados'
                              ? 'Experiencias que te interesan y has añadido a tu lista de deseos.'
                              : activeTab === 'proximos'
                                ? 'Eventos con boletos confirmados y pendientes por disfrutar.'
                                : 'Historial de eventos pasados en Cartagena de Indias.'}
                          </p>
                        </div>
                        <span className="text-xs font-black text-amber-950 bg-amber-100 border border-amber-300 px-3.5 py-1.5 rounded-full shrink-0 self-start sm:self-auto">
                          {eventosVisibles.length} {eventosVisibles.length === 1 ? 'evento' : 'eventos'}
                        </span>
                      </div>

                      {eventosVisibles.length === 0 ? (
                        <div className="bg-white rounded-3xl border-2 border-dashed border-amber-300 p-14 text-center shadow-sm">
                          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 text-xl">

                          </div>
                          <h4 className="font-black text-lg text-[#0B1B3D] mb-1">
                            {activeTab === 'guardados'
                              ? 'No tienes eventos guardados en favoritos'
                              : activeTab === 'proximos'
                                ? 'No tienes eventos próximos agendados'
                                : 'Aún no registras historial de eventos'}
                          </h4>
                          <p className="text-xs font-medium text-slate-600 max-w-sm mx-auto mb-6">
                            Explora la cartelera cultural de Cartagena de Indias y guarda tus favoritos.
                          </p>
                          <Link
                            to="/buscar"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md transition-all active:scale-95"
                          >
                            <span>Explorar Experiencias</span>
                            <FiArrowRight size={14} />
                          </Link>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {eventosVisibles.map((evento) => (
                            <article
                              key={evento.id}
                              className="bg-white border-2 border-amber-200/90 hover:border-amber-400 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between"
                            >
                              <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                                <ImageWithFallback
                                  src={evento.photo}
                                  alt={evento.title}
                                  className="h-full w-full"
                                  imgClassName="group-hover:scale-105 duration-500 object-cover"
                                  fallbackClassName="h-full w-full"
                                  fallbackGradient={getCategoryGradient(evento.category)}
                                  fallbackText={evento.category || 'Evento'}
                                  iconSize={26}
                                >
                                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

                                  <span className="absolute left-3 top-3 text-[10px] font-black uppercase tracking-wider bg-[#0B172C] text-amber-300 border border-amber-400/40 px-2.5 py-1 rounded-lg shadow-xs z-10 flex items-center gap-1">
                                    <span>⬡</span>
                                    <span>{evento.category}</span>
                                  </span>

                                  {activeTab === 'guardados' && (
                                    <button
                                      type="button"
                                      onClick={(e) => handleRemoveDeseo(e, evento.id)}
                                      title="Quitar de favoritos"
                                      className="absolute right-3 top-3 w-8 h-8 rounded-full bg-white/95 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center shadow-md z-10 transition-colors cursor-pointer"
                                    >
                                      <FiTrash2 size={14} />
                                    </button>
                                  )}
                                </ImageWithFallback>
                              </div>

                              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                <div>
                                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-900 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md inline-block mb-1.5">
                                    {evento.category}
                                  </span>
                                  <h3 className="text-base font-black leading-snug text-[#0B1B3D] group-hover:text-amber-700 transition-colors line-clamp-2">
                                    {evento.title}
                                  </h3>

                                  <div className="space-y-1.5 text-xs text-slate-600 mt-2.5 font-medium">
                                    <p className="flex items-center gap-2">
                                      <FiCalendar className="text-amber-600 shrink-0" size={14} />
                                      <span>{evento.date}</span>
                                    </p>
                                    <p className="flex items-center gap-2 truncate">
                                      <FiMapPin className="text-rose-500 shrink-0" size={14} />
                                      <span className="truncate">{evento.location}</span>
                                    </p>
                                  </div>
                                </div>

                                <div className="pt-3 border-t border-amber-100 flex items-center justify-between">
                                  <span className="text-xs font-black text-slate-900">
                                    {formatPrice(evento.price)}
                                  </span>
                                  <Link
                                    to={`/eventos/${evento.id}`}
                                    className="text-xs font-black uppercase tracking-wider text-amber-700 hover:text-amber-800 transition-colors inline-flex items-center gap-1 group"
                                  >
                                    <span>Ver detalle</span>
                                    <FiArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                                  </Link>
                                </div>
                              </div>
                            </article>
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
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border-2 border-amber-200/90 text-center relative overflow-hidden">
            <button
              onClick={() => setTicketModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-[#0B1B3D] transition-colors p-1 cursor-pointer"
            >
              <FiX size={20} />
            </button>

            <span className="text-[10px] font-black uppercase tracking-wider text-amber-950 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full inline-block">
              Pase Digital Oficial
            </span>

            <h3 className="font-black text-lg text-[#0B1B3D] mt-3 leading-snug">{ticketModal.evento}</h3>
            <p className="text-xs font-bold text-amber-800 mt-0.5">
              {ticketModal.zona} · {ticketModal.asiento}
            </p>

            <div className="my-5 p-4 rounded-2xl bg-amber-50/50 border border-amber-200 inline-block shadow-inner">
              <img
                src={ticketModal.codigoQR}
                alt="QR Code"
                className="w-48 h-48 mx-auto object-contain rounded-lg"
              />
              <p className="font-mono text-xs text-slate-600 font-bold mt-2">{ticketModal.id}</p>
            </div>

            <div className="text-xs text-slate-700 text-left bg-[#FAF8F5] p-3.5 rounded-2xl mb-5 space-y-1 font-medium border border-amber-100">
              <p>
                <strong className="text-[#0B1B3D]">Fecha:</strong> {ticketModal.fecha} ({ticketModal.hora})
              </p>
              <p className="truncate">
                <strong className="text-[#0B1B3D]">Lugar:</strong> {ticketModal.lugar}
              </p>
              <p>
                <strong className="text-[#0B1B3D]">Titular:</strong> {ticketModal.titular}
              </p>
              <p>
                <strong className="text-[#0B1B3D]">Precio:</strong> {ticketModal.precio}
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
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
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
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border-2 border-amber-200/90">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-amber-100">
              <div className="flex items-center gap-2">
                <span className="text-amber-500 text-lg">⬡</span>
                <h3 className="text-lg font-black text-[#0B1B3D]">
                  Editar Datos del Perfil
                </h3>
              </div>
              <button
                onClick={() => setEditModal(false)}
                className="text-slate-400 hover:text-[#0B1B3D] p-1 cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdatePerfil} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={usuario.nombreCompleto}
                  onChange={(e) => setUsuario({ ...usuario, nombreCompleto: e.target.value })}
                  className="w-full text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl border border-amber-200 bg-[#FAF8F5] outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1">
                  Correo Electrónico (Solo Lectura)
                </label>
                <input
                  type="email"
                  value={usuario.correo}
                  disabled
                  className="w-full text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={usuario.telefono}
                  onChange={(e) => setUsuario({ ...usuario, telefono: e.target.value })}
                  placeholder="+57 300 123 4567"
                  className="w-full text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl border border-amber-200 bg-[#FAF8F5] outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20"
                />
              </div>

              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setEditModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-wider text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
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