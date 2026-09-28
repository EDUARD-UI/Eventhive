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
    <div className="min-h-screen flex flex-col bg-bg font-body selection:bg-brand-light selection:text-brand">
      <Navbar />

      {/* Banner de marca — FONDO AZUL ESTRICTAMENTE PRESERVADO */}
      <div className="relative px-6 sm:px-10 pt-14 pb-24 text-white overflow-hidden bg-[radial-gradient(120%_140%_at_15%_-10%,#2b9dff_0%,#007BFF_45%,#0047a8_100%)]">
        <p className="text-xs font-bold tracking-wide text-sky-100/90 mb-2 uppercase">
          Tu Cuenta · EventHive
        </p>
        <h1 className="font-display font-bold text-4xl sm:text-[44px] leading-[1.05] tracking-tight max-w-lg">
          Perfil de usuario
        </h1>
        <p className="text-sm text-sky-100 mt-3 max-w-sm leading-relaxed">
          Tus eventos favoritos, boletos digitales y datos de cuenta en tiempo real.
        </p>

        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-16 w-72 h-72 opacity-[0.15]"
          style={{
            backgroundImage:
              'radial-gradient(circle, transparent 20%, rgba(255,255,255,.6) 21%, rgba(255,255,255,.6) 22%, transparent 23%)',
            backgroundSize: '26px 26px',
          }}
        />

        <div className="absolute left-0 right-0 -bottom-0.5 leading-[0]">
          <svg viewBox="0 0 1440 70" preserveAspectRatio="none" className="w-full h-[64px] block">
            <path
              d="M0,40 C240,80 480,0 720,30 C960,60 1200,10 1440,40 L1440,70 L0,70 Z"
              fill="#f5f7fa"
            />
          </svg>
        </div>
      </div>

      <main className="flex-1 px-6 sm:px-10 pb-16">
        {/* Navegación de Tabs con Segmented Control Moderno */}
        <div className="relative z-10 flex justify-center -mt-6 mb-8">
          <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-md p-1.5 flex gap-1.5 w-fit max-w-full overflow-x-auto no-scrollbar">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              let count = null;
              if (tab.id === 'guardados') count = guardados.length;
              if (tab.id === 'entradas') count = boletosList.length;
              if (tab.id === 'proximos') count = eventosProximos.length;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                    active
                      ? 'bg-brand text-white shadow-md shadow-brand/25 scale-[1.02]'
                      : 'text-slate-600 hover:text-brand hover:bg-slate-50'
                  }`}
                >
                  <span>{tab.label}</span>
                  {count !== null && count > 0 && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                        active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
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

        <div className="flex flex-col lg:flex-row gap-8 max-w-[1400px] mx-auto">
          {/* Sidebar de Usuario */}
          <aside className="w-full lg:w-[320px] shrink-0 space-y-5">
            <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm p-7 text-center card-interactive">
              <div className="relative w-24 h-24 mx-auto">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-500 ring-4 ring-white shadow-md flex items-center justify-center text-white text-2xl font-bold font-display select-none">
                  {getInitials(usuario.nombreCompleto)}
                </div>
              </div>
              <h2 className="font-display font-bold text-xl mt-4 text-slate-900 truncate">
                {usuario.nombreCompleto || 'Usuario EventHive'}
              </h2>
              <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500 mt-1.5 truncate">
                <FiMail size={12} className="shrink-0 text-brand" /> {usuario.correo || 'correo@eventhive.com'}
              </p>
              {usuario.telefono && (
                <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500 mt-1">
                  <FiPhone size={12} className="shrink-0 text-brand" /> {usuario.telefono}
                </p>
              )}
              <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500 mt-1">
                <FiMapPin size={12} className="shrink-0 text-rose-500" /> {usuario.ciudad}
              </p>

              <div className="mt-5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModal(true)}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 hover:border-brand text-xs font-bold text-slate-700 hover:text-brand flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-95"
                >
                  <FiEdit2 size={13} />
                  <span>Editar datos de perfil</span>
                </button>
              </div>
            </div>

            <div className="bg-white border border-borderc rounded-2xl shadow-sm p-6">
              <p className="text-[11px] font-bold tracking-wider text-muted mb-4 uppercase">
                Estadísticas de Actividad
              </p>

              <div className="flex items-center gap-3.5 text-sm text-slate-700 mb-4">
                <span className="w-10 h-10 rounded-xl bg-brand-light text-brand flex items-center justify-center shrink-0">
                  <FiBookmark size={17} />
                </span>
                <div>
                  <strong className="block font-display font-bold text-lg leading-none text-ink">
                    {guardados.length}
                  </strong>
                  <span className="text-xs text-muted">eventos guardados</span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 text-sm text-slate-700 mb-4">
                <span className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <FiShoppingBag size={17} />
                </span>
                <div>
                  <strong className="block font-display font-bold text-lg leading-none text-ink">
                    {boletosList.length}
                  </strong>
                  <span className="text-xs text-muted">boletos adquiridos</span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 text-sm text-slate-700">
                <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <FiCalendar size={17} />
                </span>
                <div>
                  <strong className="block font-display font-bold text-lg leading-none text-ink">
                    {eventosProximos.length + eventosHistorial.length}
                  </strong>
                  <span className="text-xs text-muted">eventos asistidos / próximos</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Contenido Principal por Pestaña */}
          <section className="flex-1 min-w-0">
            {loading ? (
              <div className="bg-white rounded-2xl border border-borderc p-12 text-center shadow-sm">
                <span className="w-8 h-8 border-3 border-brand border-t-transparent rounded-full animate-spin inline-block mb-3" />
                <p className="text-sm font-semibold text-slate-700">Cargando tu información...</p>
              </div>
            ) : (
              <>
                {/* Pestaña: Mis Entradas con Código QR */}
                {activeTab === 'entradas' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="bg-white p-5 rounded-2xl border border-borderc shadow-sm flex items-center justify-between">
                      <div>
                        <h3 className="font-display font-bold text-lg text-ink">Mis Boletos Digitales</h3>
                        <p className="text-xs text-muted mt-0.5">
                          Muestra tu código QR en la entrada del evento para escanear y acceder.
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-brand bg-brand-light px-3 py-1 rounded-full">
                        {boletosList.length} {boletosList.length === 1 ? 'boleto' : 'boletos'}
                      </span>
                    </div>

                    {boletosList.length === 0 ? (
                      <div className="bg-white rounded-2xl border border-borderc p-12 text-center text-muted shadow-sm">
                        <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                          <FiShoppingBag size={24} />
                        </div>
                        <p className="font-semibold text-ink text-base">Aún no tienes boletos comprados</p>
                        <p className="text-xs mt-1 max-w-sm mx-auto text-slate-500">
                          Explora la cartelera de eventos en Cartagena de Indias y consigue tus entradas fácilmente.
                        </p>
                        <Link
                          to="/buscar"
                          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-sm transition-all"
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
                            className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative"
                          >
                            {/* Cabecera del Boleto */}
                            <div className="p-5 bg-gradient-to-r from-brand to-sky-600 text-white relative">
                              <div className="flex items-center justify-between text-[11px] font-semibold text-sky-100 mb-1">
                                <span>{ticket.id}</span>
                                <span className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full text-white">
                                  {ticket.zona}
                                </span>
                              </div>
                              <h4 className="font-display font-bold text-lg leading-tight mt-1 line-clamp-1">
                                {ticket.evento}
                              </h4>
                              <div className="mt-3 flex items-center gap-3 text-xs text-sky-100">
                                <span className="flex items-center gap-1">
                                  <FiCalendar size={13} /> {ticket.fecha}
                                </span>
                                <span>·</span>
                                <span>{ticket.hora}</span>
                              </div>
                            </div>

                            {/* Cuerpo con detalles de acceso */}
                            <div className="p-5 flex-1 flex flex-col justify-between">
                              <div className="space-y-2 text-xs text-slate-600">
                                <p className="flex items-center gap-1.5 truncate">
                                  <FiMapPin className="text-brand shrink-0" size={14} /> {ticket.lugar}
                                </p>
                                <p>
                                  <strong>Ubicación:</strong> {ticket.asiento}
                                </p>
                                <p>
                                  <strong>Titular:</strong> {ticket.titular}
                                </p>
                                <p>
                                  <strong>Precio:</strong> {ticket.precio}
                                </p>
                              </div>

                              {/* Código QR Miniatura y Acciones */}
                              <div className="mt-5 pt-4 border-t border-dashed border-slate-200 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={ticket.codigoQR}
                                    alt="QR Boleto"
                                    className="w-14 h-14 rounded-lg border p-1 bg-white shrink-0 shadow-sm"
                                  />
                                  <div>
                                    <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                                      <FiCheckCircle size={12} /> {ticket.estado}
                                    </p>
                                    <p className="text-[10px] text-muted">ID: {ticket.id}</p>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setTicketModal(ticket)}
                                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-brand hover:text-white text-xs font-semibold text-ink transition-all flex items-center gap-1.5"
                                >
                                  <FiExternalLink size={13} /> Ver QR
                                </button>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Pestaña: Seguridad y Cuenta */}
                {activeTab === 'seguridad' && (
                  <div className="space-y-6 animate-fade-in">
                    {/* Formulario de Información Personal */}
                    <div className="bg-white border border-borderc rounded-2xl p-6 shadow-sm space-y-5">
                      <div>
                        <h3 className="font-display font-bold text-lg text-ink">Información Personal</h3>
                        <p className="text-xs text-muted mt-0.5">
                          Actualiza tu nombre y número de teléfono de contacto.
                        </p>
                      </div>

                      <form onSubmit={handleUpdatePerfil} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-ink mb-1.5">
                              Nombre completo
                            </label>
                            <input
                              type="text"
                              value={usuario.nombreCompleto}
                              onChange={(e) =>
                                setUsuario({ ...usuario, nombreCompleto: e.target.value })
                              }
                              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-borderc outline-none focus:border-brand"
                              placeholder="Tu nombre completo"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-ink mb-1.5">
                              Correo electrónico
                            </label>
                            <input
                              type="email"
                              value={usuario.correo}
                              disabled
                              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                            />
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              El correo es el identificador principal de tu cuenta.
                            </span>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-ink mb-1.5">
                              Teléfono / WhatsApp
                            </label>
                            <input
                              type="tel"
                              value={usuario.telefono}
                              onChange={(e) =>
                                setUsuario({ ...usuario, telefono: e.target.value })
                              }
                              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-borderc outline-none focus:border-brand"
                              placeholder="+57 300 123 4567"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-ink mb-1.5">
                              Ciudad de residencia
                            </label>
                            <input
                              type="text"
                              value={usuario.ciudad}
                              onChange={(e) => setUsuario({ ...usuario, ciudad: e.target.value })}
                              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-borderc outline-none focus:border-brand"
                            />
                          </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                          <button
                            type="submit"
                            disabled={isUpdating}
                            className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-60 flex items-center gap-2"
                          >
                            {isUpdating && (
                              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            )}
                            <span>Guardar Datos Personales</span>
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Formulario de Cambio de Contraseña */}
                    <div className="bg-white border border-borderc rounded-2xl p-6 shadow-sm space-y-5">
                      <div className="flex items-center gap-2">
                        <FiKey className="text-brand" size={18} />
                        <div>
                          <h3 className="font-display font-bold text-lg text-ink">
                            Cambiar Contraseña
                          </h3>
                          <p className="text-xs text-muted mt-0.5">
                            Por tu seguridad, usa una contraseña que no utilices en otros sitios.
                          </p>
                        </div>
                      </div>

                      <form onSubmit={handleChangePassword} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-ink mb-1.5">
                              Contraseña actual
                            </label>
                            <input
                              type="password"
                              value={passwordForm.claveActual}
                              onChange={(e) =>
                                setPasswordForm({ ...passwordForm, claveActual: e.target.value })
                              }
                              placeholder="••••••••"
                              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-borderc outline-none focus:border-brand"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-ink mb-1.5">
                              Nueva contraseña
                            </label>
                            <input
                              type="password"
                              value={passwordForm.claveNueva}
                              onChange={(e) =>
                                setPasswordForm({ ...passwordForm, claveNueva: e.target.value })
                              }
                              placeholder="Mínimo 6 caracteres"
                              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-borderc outline-none focus:border-brand"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-ink mb-1.5">
                              Confirmar nueva contraseña
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
                              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-borderc outline-none focus:border-brand"
                              required
                            />
                          </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                          <button
                            type="submit"
                            disabled={isChangingPassword}
                            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-60 flex items-center gap-2"
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
                  <div className="space-y-4 animate-fade-in">
                    <div className="bg-white p-5 rounded-2xl border border-borderc shadow-sm flex items-center justify-between">
                      <div>
                        <h3 className="font-display font-bold text-lg text-ink">
                          {activeTab === 'guardados'
                            ? 'Eventos Guardados en Favoritos'
                            : activeTab === 'proximos'
                            ? 'Eventos Próximos'
                            : 'Historial de Eventos'}
                        </h3>
                        <p className="text-xs text-muted mt-0.5">
                          {activeTab === 'guardados'
                            ? 'Eventos que has marcado como favoritos para no perderte ningún detalle.'
                            : activeTab === 'proximos'
                            ? 'Eventos para los que tienes boletos vigentes.'
                            : 'Eventos pasados a los que has asistido o compraste entradas.'}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-brand bg-brand-light px-3 py-1 rounded-full">
                        {eventosVisibles.length} {eventosVisibles.length === 1 ? 'evento' : 'eventos'}
                      </span>
                    </div>

                    {eventosVisibles.length === 0 ? (
                      <div className="bg-white rounded-2xl border border-borderc p-12 text-center text-muted shadow-sm">
                        <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                          <FiBookmark size={24} />
                        </div>
                        <p className="font-semibold text-ink text-base">
                          {activeTab === 'guardados'
                            ? 'No tienes eventos guardados en favoritos.'
                            : activeTab === 'proximos'
                            ? 'No tienes eventos próximos programados.'
                            : 'Aún no registras historial de eventos.'}
                        </p>
                        <p className="text-xs mt-1 text-slate-500 max-w-sm mx-auto">
                          Explora la cartelera en Cartagena de Indias y guarda tus favoritos.
                        </p>
                        <Link
                          to="/buscar"
                          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-sm transition-all"
                        >
                          <span>Explorar Eventos</span>
                          <FiArrowRight size={14} />
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {eventosVisibles.map((evento) => (
                          <article
                            key={evento.id}
                            className="bg-white border border-borderc rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group flex flex-col justify-between"
                          >
                            <div className="relative aspect-[16/9] overflow-hidden">
                              <ImageWithFallback
                                src={evento.photo}
                                alt={evento.title}
                                className="h-full w-full"
                                imgClassName="group-hover:scale-105 duration-500"
                                fallbackClassName="h-full w-full"
                                fallbackGradient={getCategoryGradient(evento.category)}
                                fallbackText={evento.category || 'Sin imagen'}
                                iconSize={24}
                              >
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-60 pointer-events-none" />

                                <span className="absolute left-3 top-3 text-[11px] font-bold bg-white/90 backdrop-blur-md text-ink px-2.5 py-1 rounded-lg shadow-sm z-10">
                                  {evento.category}
                                </span>

                                {activeTab === 'guardados' && (
                                  <button
                                    type="button"
                                    onClick={(e) => handleRemoveDeseo(e, evento.id)}
                                    title="Quitar de favoritos"
                                    className="absolute right-3 top-3 w-8 h-8 rounded-full bg-white/95 text-rose-500 hover:bg-rose-50 flex items-center justify-center shadow-sm z-10 transition-colors"
                                  >
                                    <FiTrash2 size={14} />
                                  </button>
                                )}
                              </ImageWithFallback>
                            </div>

                            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                              <div>
                                <p className="text-[11px] font-bold uppercase tracking-wide text-brand mb-1">
                                  {evento.category}
                                </p>
                                <h3 className="font-display text-[16px] font-bold leading-snug mb-2 text-slate-900 group-hover:text-brand transition-colors line-clamp-2">
                                  {evento.title}
                                </h3>

                                <div className="space-y-1 text-xs text-slate-600 mt-2">
                                  <p className="flex items-center gap-1.5">
                                    <FiCalendar className="text-brand shrink-0" size={13} />{' '}
                                    {evento.date}
                                  </p>
                                  <p className="flex items-center gap-1.5 truncate">
                                    <FiMapPin className="text-rose-500 shrink-0" size={13} />{' '}
                                    {evento.location}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-800">
                                  {formatPrice(evento.price)}
                                </span>
                                <Link
                                  to={`/eventos/${evento.id}`}
                                  className="text-xs font-semibold text-brand hover:text-brand-dark transition-colors inline-flex items-center gap-1"
                                >
                                  <span>Ver evento</span>
                                  <FiArrowRight size={13} />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center relative overflow-hidden">
            <button
              onClick={() => setTicketModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-ink transition-colors p-1"
            >
              <FiX size={20} />
            </button>

            <span className="text-[10px] font-bold uppercase tracking-wider text-brand bg-brand-light px-3 py-1 rounded-full">
              Pase Digital de Acceso
            </span>

            <h3 className="font-display font-bold text-lg text-ink mt-3">{ticketModal.evento}</h3>
            <p className="text-xs text-muted mt-0.5">
              {ticketModal.zona} · {ticketModal.asiento}
            </p>

            <div className="my-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 inline-block shadow-inner">
              <img
                src={ticketModal.codigoQR}
                alt="QR Code"
                className="w-48 h-48 mx-auto object-contain"
              />
              <p className="font-mono text-xs text-slate-500 font-bold mt-2">{ticketModal.id}</p>
            </div>

            <div className="text-xs text-slate-600 text-left bg-slate-50 p-3.5 rounded-xl mb-4 space-y-1">
              <p>
                <strong>Fecha:</strong> {ticketModal.fecha} ({ticketModal.hora})
              </p>
              <p className="truncate">
                <strong>Lugar:</strong> {ticketModal.lugar}
              </p>
              <p>
                <strong>Titular:</strong> {ticketModal.titular}
              </p>
              <p>
                <strong>Precio:</strong> {ticketModal.precio}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                Swal.fire({
                  icon: 'info',
                  title: 'Boleto Digital',
                  text: 'Puedes guardar la imagen o presentar este código QR directamente desde tu dispositivo móvil.',
                });
              }}
              className="w-full py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <FiDownload size={14} /> Guardar Boleto
            </button>
          </div>
        </div>
      )}

      {/* Modal Editar Perfil Rápido */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg text-ink">
                Editar Información del Perfil
              </h3>
              <button
                onClick={() => setEditModal(false)}
                className="text-slate-400 hover:text-ink p-1"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdatePerfil} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Nombre completo</label>
                <input
                  type="text"
                  value={usuario.nombreCompleto}
                  onChange={(e) => setUsuario({ ...usuario, nombreCompleto: e.target.value })}
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-borderc outline-none focus:border-brand"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Correo electrónico (Lectura)
                </label>
                <input
                  type="email"
                  value={usuario.correo}
                  disabled
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Teléfono / WhatsApp
                </label>
                <input
                  type="tel"
                  value={usuario.telefono}
                  onChange={(e) => setUsuario({ ...usuario, telefono: e.target.value })}
                  placeholder="+57 300 123 4567"
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-borderc outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Ciudad</label>
                <input
                  type="text"
                  value={usuario.ciudad}
                  onChange={(e) => setUsuario({ ...usuario, ciudad: e.target.value })}
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-borderc outline-none focus:border-brand"
                />
              </div>
              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditModal(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 py-2 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5"
                >
                  {isUpdating && (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>Guardar Cambios</span>
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