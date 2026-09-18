import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout.jsx';
import StatCard from '../../components/Shared/StatCard.jsx';
import Badge from '../../components/Shared/Badge.jsx';
import {
  FiUsers, FiShield, FiClipboard, FiCalendar, FiTrendingUp,
  FiGrid, FiKey, FiTag, FiSearch, FiCheck, FiX, FiArrowUpRight,
  FiArrowLeft, FiBell, FiMapPin, FiEye, FiAlertCircle, FiDollarSign,
  FiLayers, FiPlus, FiPercent, FiAward, FiLock, FiEdit2, FiTrash2,
} from 'react-icons/fi';

const INITIAL_EVENTS = [
  {
    id: 1,
    titulo: 'Concierto de Rock en la Muralla',
    categoria: 'Música',
    estado: 'Publicado',
    tono: 'green',
    fecha: '20 Sep 2026',
    hora: '8:00 PM',
    lugar: 'Baluarte de San Ignacio, Cartagena',
    organizador: 'Producciones XYZ',
    precio: 85000,
    foto: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=800&q=80',
    descripcion: 'Una noche inolvidable de rock latino y clásico frente al mar Caribe con bandas nacionales e internacionales.',
    localidades: [
      { nombre: 'General', precio: 85000, aforo: 600 },
      { nombre: 'VIP Frente a Tarima', precio: 160000, aforo: 200 },
    ],
  },
  {
    id: 2,
    titulo: 'Feria Gastronómica Sabores del Caribe',
    categoria: 'Gastronomía',
    estado: 'Suspendido',
    tono: 'red',
    fecha: '25 Sep 2026',
    hora: '12:00 PM',
    lugar: 'Plaza de la Aduana, Cartagena',
    organizador: 'Sabores Cartagena',
    precio: 35000,
    foto: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    descripcion: 'Muestra culinaria con más de 30 chefs representativos de la costa norte colombiana.',
    localidades: [
      { nombre: 'Entrada General', precio: 35000, aforo: 1200 },
    ],
  },
  {
    id: 3,
    titulo: 'Expo Arte Urbano Getsemaní',
    categoria: 'Cultura',
    estado: 'Publicado',
    tono: 'green',
    fecha: '02 Oct 2026',
    hora: '4:00 PM',
    lugar: 'Callejón Angosto, Getsemaní',
    organizador: 'Colectivo Mural',
    precio: 0,
    foto: 'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?auto=format&fit=crop&w=800&q=80',
    descripcion: 'Galería abierta y talleres en vivo de arte urbano y fotografía callejera.',
    localidades: [
      { nombre: 'Entrada Libre', precio: 0, aforo: 450 },
    ],
  },
  {
    id: 4,
    titulo: 'Festival de Jazz Bajo las Estrellas',
    categoria: 'Música',
    estado: 'Publicado',
    tono: 'green',
    fecha: '15 Oct 2026',
    hora: '7:30 PM',
    lugar: 'Teatro Adolfo Mejía',
    organizador: 'Fundación Jazz Caribe',
    precio: 120000,
    foto: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=800&q=80',
    descripcion: 'Encuentro anual de ensambles de jazz y fusión afrocaribeña.',
    localidades: [
      { nombre: 'Platea', precio: 120000, aforo: 300 },
      { nombre: 'Balcón', precio: 75000, aforo: 150 },
    ],
  },
];

const secciones = [
  { id: 'resumen', label: 'Resumen', icon: FiTrendingUp, count: null },
  { id: 'usuarios', label: 'Usuarios', icon: FiUsers, count: '4.2k' },
  { id: 'moderadores', label: 'Moderadores', icon: FiShield, count: '5' },
  { id: 'solicitudes', label: 'Solicitudes', icon: FiClipboard, count: '7' },
  { id: 'eventos', label: 'Eventos', icon: FiCalendar, count: '132' },
  { id: 'niveles', label: 'Niveles', icon: FiTrendingUp, count: null },
  { id: 'categorias', label: 'Categorías', icon: FiGrid, count: '8' },
  { id: 'roles', label: 'Roles', icon: FiKey, count: null },
  { id: 'promociones', label: 'Promociones', icon: FiTag, count: '3' },
];

function Avatar({ nombre }) {
  const iniciales = nombre.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div className="w-11 h-11 rounded-full bg-brand-light text-brand font-bold flex items-center justify-center text-sm ring-2 ring-brand/20 shrink-0">
      {iniciales}
    </div>
  );
}

function EmptyState({ icon: Icon, titulo, descripcion }) {
  return (
    <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 flex flex-col items-center text-center text-slate-500 shadow-sm">
      <div className="w-12 h-12 rounded-xl bg-brand-light text-brand flex items-center justify-center mb-3.5 shadow-sm">
        <Icon size={22} />
      </div>
      <p className="font-display font-semibold text-base text-ink">{titulo}</p>
      <p className="text-sm text-muted mt-1 max-w-sm">{descripcion}</p>
    </div>
  );
}

export default function AdminPanel() {
  const [seccionActiva, setSeccionActiva] = useState('resumen');
  const [searchTerm, setSearchTerm] = useState('');
  const [eventos, setEventos] = useState(INITIAL_EVENTS);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);

  const seccion = secciones.find((s) => s.id === seccionActiva);

  const toggleEstadoEvento = (id) => {
    setEventos((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          const nuevoEstado = e.estado === 'Publicado' ? 'Suspendido' : 'Publicado';
          return {
            ...e,
            estado: nuevoEstado,
            tono: nuevoEstado === 'Publicado' ? 'green' : 'red',
          };
        }
        return e;
      })
    );
  };

  return (
    <AdminLayout
      menuItems={secciones}
      activeItem={seccionActiva}
      onSelect={setSeccionActiva}
      title={seccion.label}
      badgeText="Panel de Administración"
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
    >
      {/* Cuerpo principal */}
      {seccionActiva === 'resumen' && (
        <SeccionResumen
          eventos={eventos}
          onSelectEvento={setEventoSeleccionado}
          onToggleEstado={toggleEstadoEvento}
        />
      )}
      {seccionActiva === 'usuarios' && <SeccionUsuarios searchTerm={searchTerm} />}
      {seccionActiva === 'moderadores' && <SeccionModeradores searchTerm={searchTerm} />}
      {seccionActiva === 'solicitudes' && <SeccionSolicitudes />}
      {seccionActiva === 'eventos' && (
        <SeccionEventos
          eventos={eventos}
          searchTerm={searchTerm}
          onSelectEvento={setEventoSeleccionado}
          onToggleEstado={toggleEstadoEvento}
        />
      )}
      {seccionActiva === 'niveles' && <SeccionNiveles />}
      {seccionActiva === 'categorias' && <SeccionCategorias searchTerm={searchTerm} />}
      {seccionActiva === 'roles' && <SeccionRoles />}
      {seccionActiva === 'promociones' && <SeccionPromociones searchTerm={searchTerm} />}

      {/* Modal de Detalle de Evento */}
      {eventoSeleccionado && (
        <ModalDetalleEvento
          evento={eventoSeleccionado}
          onClose={() => setEventoSeleccionado(null)}
          onToggleEstado={toggleEstadoEvento}
        />
      )}
    </AdminLayout>
  );
}

function SeccionResumen({ eventos, onSelectEvento, onToggleEstado }) {
  const stats = [
    { label: 'Usuarios totales', value: '4,218', change: '+12% este mes', icon: FiUsers, color: 'text-brand', bg: 'bg-brand-light' },
    { label: 'Eventos activos', value: '132', change: '+5 nuevos', icon: FiCalendar, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Solicitudes pendientes', value: '7', change: 'Requieren atención', icon: FiClipboard, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Moderadores activos', value: '5', change: '100% operativos', icon: FiShield, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Tarjetas de Estadísticas Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, change, icon, color, bg }) => (
          <StatCard
            key={label}
            label={label}
            value={value}
            change={change}
            icon={icon}
            iconBg={bg}
            iconColor={color}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Solicitudes Recientes */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-semibold text-base text-ink">Solicitudes de Verificación</h3>
                <p className="text-xs text-muted">Organizaciones esperando revisión</p>
              </div>
              <Badge tone="amber">7 pendientes</Badge>
            </div>
            <SeccionSolicitudes />
          </div>
        </div>

        {/* Eventos Destacados en Plataforma */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-base text-ink">Eventos en Plataforma</h3>
              <p className="text-xs text-muted">Muestra de eventos recientes y su estado</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {eventos.slice(0, 2).map((e) => (
              <EventCardItem
                key={e.id}
                evento={e}
                onSelectEvento={onSelectEvento}
                onToggleEstado={onToggleEstado}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SeccionEventos({ eventos, searchTerm, onSelectEvento, onToggleEstado }) {
  const eventosFiltrados = useMemo(() => {
    if (!searchTerm) return eventos;
    const term = searchTerm.toLowerCase();
    return eventos.filter(
      (e) =>
        e.titulo.toLowerCase().includes(term) ||
        e.categoria.toLowerCase().includes(term) ||
        e.organizador.toLowerCase().includes(term)
    );
  }, [eventos, searchTerm]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted uppercase tracking-wider">
          Mostrando {eventosFiltrados.length} evento{eventosFiltrados.length === 1 ? '' : 's'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {eventosFiltrados.map((e) => (
          <EventCardItem
            key={e.id}
            evento={e}
            onSelectEvento={onSelectEvento}
            onToggleEstado={onToggleEstado}
          />
        ))}
      </div>
    </div>
  );
}

function EventCardItem({ evento, onSelectEvento, onToggleEstado }) {
  const [imgError, setImgError] = useState(false);
  const fallbackImg = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">
      {/* Contenedor de Imagen de Portada */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={imgError || !evento.foto ? fallbackImg : evento.foto}
          alt={evento.titulo}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

        {/* Categoría Badge */}
        <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-brand text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-sm">
          {evento.categoria}
        </span>

        {/* Estado Badge */}
        <span className="absolute top-3 right-3">
          <Badge tone={evento.tono}>{evento.estado}</Badge>
        </span>

        {/* Precio en Portada */}
        <div className="absolute bottom-3 left-3 text-white">
          <p className="text-xs text-white/80">Entrada desde</p>
          <p className="font-bold text-sm font-display">
            {evento.precio === 0
              ? 'Gratis'
              : new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(evento.precio)}
          </p>
        </div>
      </div>

      {/* Contenido de la Tarjeta */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-display font-semibold text-sm text-ink group-hover:text-brand transition-colors line-clamp-1">
            {evento.titulo}
          </h4>
          <p className="text-xs text-muted mt-1 truncate">{evento.organizador}</p>

          <div className="mt-3 space-y-1 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 truncate">
              <FiCalendar className="text-brand shrink-0" size={13} />
              <span>{evento.fecha} · {evento.hora}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <FiMapPin className="text-brand shrink-0" size={13} />
              <span className="truncate">{evento.lugar}</span>
            </div>
          </div>
        </div>

        {/* Acciones del Administrador */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            onClick={() => onSelectEvento(evento)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-brand hover:text-white text-slate-700 text-xs font-semibold transition-all"
          >
            <FiEye size={14} /> Detalle
          </button>
          <button
            onClick={() => onToggleEstado(evento.id)}
            className={`flex items-center justify-center py-1.5 px-3 rounded-xl text-xs font-semibold border transition-all ${evento.estado === 'Publicado'
              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
              }`}
          >
            {evento.estado === 'Publicado' ? 'Suspender' : 'Reactivar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalDetalleEvento({ evento, onClose, onToggleEstado }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 overflow-hidden">
        {/* Banner de Imagen */}
        <div className="relative h-56 w-full bg-slate-900">
          <img src={evento.foto} alt={evento.titulo} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
          >
            <FiX size={18} />
          </button>
          <div className="absolute bottom-4 left-6 right-6">
            <span className="bg-brand text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
              {evento.categoria}
            </span>
            <h2 className="text-2xl font-bold font-display text-white mt-1.5">{evento.titulo}</h2>
          </div>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-6 space-y-6">
          <div className="flex flex-wrap gap-4 text-xs text-slate-600 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <FiCalendar className="text-brand" size={15} />
              <span className="font-semibold">{evento.fecha}</span> a las {evento.hora}
            </div>
            <div className="flex items-center gap-1.5">
              <FiMapPin className="text-brand" size={15} />
              <span>{evento.lugar}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FiUsers className="text-brand" size={15} />
              <span>Organizado por: <strong className="text-slate-800">{evento.organizador}</strong></span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Descripción</h4>
            <p className="text-sm text-slate-700 leading-relaxed">{evento.descripcion}</p>
          </div>

          {/* Localidades */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2.5">Localidades y Tarifas</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {evento.localidades?.map((loc, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-sm text-slate-800">{loc.nombre}</p>
                    <p className="text-xs text-muted">Aforo: {loc.aforo} pers.</p>
                  </div>
                  <p className="font-bold text-sm text-brand font-display">
                    {loc.precio === 0
                      ? 'Gratis'
                      : new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(loc.precio)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer de Acciones */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">Estado actual:</span>
              <Badge tone={evento.tono}>{evento.estado}</Badge>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onToggleEstado(evento.id);
                  onClose();
                }}
                className={`py-2 px-4 rounded-xl text-xs font-semibold border transition-all ${evento.estado === 'Publicado'
                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                  }`}
              >
                {evento.estado === 'Publicado' ? 'Suspender de Plataforma' : 'Reactivar Evento'}
              </button>
              <button
                onClick={onClose}
                className="py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SeccionUsuarios({ searchTerm }) {
  const usuarios = [
    { nombre: 'Laura Pérez', correo: 'laura@correo.com', rol: 'Cliente', activo: true },
    { nombre: 'Carlos Ruiz', correo: 'carlos@correo.com', rol: 'Organización', activo: true },
    { nombre: 'Ana Torres', correo: 'ana@correo.com', rol: 'Moderador', activo: false },
    { nombre: 'Felipe Mendoza', correo: 'felipe@correo.com', rol: 'Organización', activo: true },
  ];

  const filtrados = useMemo(() => {
    if (!searchTerm) return usuarios;
    return usuarios.filter(
      (u) =>
        u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.correo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {filtrados.map((u) => (
        <div
          key={u.correo}
          className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:border-slate-300 transition-colors"
        >
          <Avatar nombre={u.nombre} />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-ink truncate text-sm">{u.nombre}</p>
            <p className="text-xs text-muted truncate">{u.correo}</p>
            <div className="flex gap-1.5 mt-2">
              <Badge tone="blue">{u.rol}</Badge>
              <Badge tone={u.activo ? 'green' : 'red'}>{u.activo ? 'Activo' : 'Bloqueado'}</Badge>
            </div>
          </div>
          <button className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-brand hover:text-white flex items-center justify-center text-slate-500 border border-slate-200/60 transition-all shrink-0">
            <FiArrowUpRight size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

function SeccionSolicitudes() {
  const solicitudes = [
    { organizacion: 'Producciones XYZ', nit: '900.123.456-7', representante: 'Martín Gómez' },
    { organizacion: 'Sabores Cartagena SAS', nit: '900.654.321-1', representante: 'Elena Castro' },
  ];

  return (
    <div className="grid grid-cols-1 gap-4">
      {solicitudes.map((s) => (
        <div
          key={s.nit}
          className="bg-slate-50/70 border border-slate-200/70 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-display font-semibold text-base text-ink">{s.organizacion}</p>
              <p className="text-xs text-muted mt-0.5">NIT: {s.nit} · Rep: {s.representante}</p>
            </div>
            <Badge tone="amber">Pendiente</Badge>
          </div>
          <div className="flex gap-2.5 pt-2">
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-brand hover:bg-brand-dark text-white text-sm font-semibold shadow-sm transition-colors">
              <FiCheck size={16} /> Aprobar
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-sm font-medium transition-colors">
              <FiX size={16} /> Rechazar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function SeccionModeradores({ searchTerm }) {
  const [moderadores, setModeradores] = useState([
    { id: 1, nombre: 'Carlos Mendoza', correo: 'carlos.m@eventhive.co', zona: 'Centro Histórico', revisiones: 84, activo: true },
    { id: 2, nombre: 'Valentina Ríos', correo: 'vale.rios@eventhive.co', zona: 'Bocagrande / Manga', revisiones: 62, activo: true },
    { id: 3, nombre: 'Jorge Eléspuru', correo: 'jorge.e@eventhive.co', zona: 'Getsemaní / San Diego', revisiones: 49, activo: true },
    { id: 4, nombre: 'María Paula Gómez', correo: 'mp.gomez@eventhive.co', zona: 'Zona Norte / Boquilla', revisiones: 31, activo: false },
  ]);
  const [modalOpen, setModalOpen] = useState(false);
  const [nuevo, setNuevo] = useState({ nombre: '', correo: '', zona: 'Centro Histórico' });

  const filtrados = moderadores.filter(
    (m) =>
      m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.zona.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleActivo = (id) => {
    setModeradores((prev) =>
      prev.map((m) => (m.id === id ? { ...m, activo: !m.activo } : m))
    );
  };

  const agregarModerador = (e) => {
    e.preventDefault();
    if (!nuevo.nombre || !nuevo.correo) return;
    setModeradores((prev) => [
      ...prev,
      { id: Date.now(), ...nuevo, revisiones: 0, activo: true },
    ]);
    setNuevo({ nombre: '', correo: '', zona: 'Centro Histórico' });
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h3 className="font-display font-semibold text-lg text-ink">Equipo de Moderación Activo</h3>
          <p className="text-xs text-muted mt-0.5">Control de calidad, validación documental y permisos PULEP en Cartagena.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-sm transition-all hover:shadow-md"
        >
          <FiPlus size={15} /> Asignar Moderador
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtrados.map((m) => (
          <div
            key={m.id}
            className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="flex items-start gap-4">
              <Avatar nombre={m.nombre} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-semibold text-ink truncate text-sm">{m.nombre}</h4>
                  <Badge tone={m.activo ? 'green' : 'red'}>
                    {m.activo ? 'Activo' : 'En pausa'}
                  </Badge>
                </div>
                <p className="text-xs text-muted truncate mt-0.5">{m.correo}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <FiMapPin size={13} className="text-brand" /> {m.zona}
                  </span>
                  <span>·</span>
                  <span className="font-medium text-slate-700">{m.revisiones} eventos revisados</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-muted font-medium">Permisos: Validación PULEP & Reportes</span>
              <button
                onClick={() => toggleActivo(m.id)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                  m.activo
                    ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                    : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                {m.activo ? 'Pausar acceso' : 'Reactivar acceso'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg text-ink">Asignar Nuevo Moderador</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-ink"><FiX size={18} /></button>
            </div>
            <form onSubmit={agregarModerador} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Nombre completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Daniel Salgado"
                  value={nuevo.nombre}
                  onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-borderc outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Correo institucional</label>
                <input
                  type="email"
                  required
                  placeholder="daniel.s@eventhive.co"
                  value={nuevo.correo}
                  onChange={(e) => setNuevo({ ...nuevo, correo: e.target.value })}
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-borderc outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Zona asignada</label>
                <select
                  value={nuevo.zona}
                  onChange={(e) => setNuevo({ ...nuevo, zona: e.target.value })}
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-borderc outline-none focus:border-brand bg-white"
                >
                  <option>Centro Histórico</option>
                  <option>Getsemaní / San Diego</option>
                  <option>Bocagrande / Manga</option>
                  <option>Zona Norte / Boquilla</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-sm"
                >
                  Asignar y Enviar Acceso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SeccionCategorias({ searchTerm }) {
  const [categorias, setCategorias] = useState([
    { id: 1, nombre: 'Música', eventos: 48, activa: true, foto: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=800&q=80', desc: 'Conciertos y festivales frente al mar' },
    { id: 2, nombre: 'Cultura & Arte', eventos: 36, activa: true, foto: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80', desc: 'Patrimonio de la ciudad amurallada' },
    { id: 3, nombre: 'Gastronomía', eventos: 24, activa: true, foto: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80', desc: 'Muestras culinarias caribeñas' },
    { id: 4, nombre: 'Deportivo', eventos: 18, activa: true, foto: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80', desc: 'Torneos y actividades de playa' },
    { id: 5, nombre: 'Académico', eventos: 12, activa: true, foto: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80', desc: 'Congresos y cátedras históricas' },
  ]);
  const [modalOpen, setModalOpen] = useState(false);
  const [nueva, setNueva] = useState({ nombre: '', desc: '', foto: '' });

  const filtradas = categorias.filter((c) =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleCategoria = (id) => {
    setCategorias((prev) =>
      prev.map((c) => (c.id === id ? { ...c, activa: !c.activa } : c))
    );
  };

  const agregarCategoria = (e) => {
    e.preventDefault();
    if (!nueva.nombre) return;
    setCategorias((prev) => [
      ...prev,
      {
        id: Date.now(),
        nombre: nueva.nombre,
        desc: nueva.desc || 'Eventos y experiencias en Cartagena',
        eventos: 0,
        activa: true,
        foto: nueva.foto || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=800&q=80',
      },
    ]);
    setNueva({ nombre: '', desc: '', foto: '' });
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h3 className="font-display font-semibold text-lg text-ink">Catálogo de Categorías</h3>
          <p className="text-xs text-muted mt-0.5">Define las clasificaciones temáticas de eventos mostradas en la Home y Explorador.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-sm transition-all hover:shadow-md"
        >
          <FiPlus size={15} /> Nueva Categoría
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtradas.map((cat) => (
          <div
            key={cat.id}
            className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="relative h-36 w-full overflow-hidden bg-slate-900">
              <img
                src={cat.foto}
                alt={cat.nombre}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <span className="absolute top-3 right-3">
                <Badge tone={cat.activa ? 'green' : 'gray'}>
                  {cat.activa ? 'Visible' : 'Oculta'}
                </Badge>
              </span>
              <div className="absolute bottom-3 left-4 right-4">
                <h4 className="font-display font-bold text-white text-base">{cat.nombre}</h4>
                <p className="text-xs text-white/80">{cat.eventos} eventos publicados</p>
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
              <p className="text-xs text-muted leading-relaxed">{cat.desc}</p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => toggleCategoria(cat.id)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                    cat.activa
                      ? 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                  }`}
                >
                  {cat.activa ? 'Desactivar' : 'Activar'}
                </button>
                <span className="text-[11px] font-semibold text-brand">Ver eventos</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg text-ink">Crear Categoría</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-ink"><FiX size={18} /></button>
            </div>
            <form onSubmit={agregarCategoria} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Nombre de la categoría</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Festivales Folclóricos"
                  value={nueva.nombre}
                  onChange={(e) => setNueva({ ...nueva, nombre: e.target.value })}
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-borderc outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Descripción breve</label>
                <input
                  type="text"
                  placeholder="Breve descripción del tipo de evento"
                  value={nueva.desc}
                  onChange={(e) => setNueva({ ...nueva, desc: e.target.value })}
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-borderc outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">URL de Foto de Portada (Unsplash u otra)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={nueva.foto}
                  onChange={(e) => setNueva({ ...nueva, foto: e.target.value })}
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-borderc outline-none focus:border-brand"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-sm"
                >
                  Guardar Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SeccionRoles() {
  const [permisos, setPermisos] = useState([
    {
      rol: 'Super Administrador',
      desc: 'Control total de la plataforma, roles, finanzas y moderación.',
      usuarios: 2,
      permisos: {
        crearEventos: true,
        aprobarPULEP: true,
        suspenderUsuarios: true,
        modificarComisiones: true,
        descargarReportes: true,
      },
    },
    {
      rol: 'Moderador de Calidad',
      desc: 'Revisión técnica de aforos, permisos municipales y código PULEP.',
      usuarios: 5,
      permisos: {
        crearEventos: false,
        aprobarPULEP: true,
        suspenderUsuarios: true,
        modificarComisiones: false,
        descargarReportes: true,
      },
    },
    {
      rol: 'Organizador Verificado',
      desc: 'Creadores y productoras con documentación validada y comisiones reducidas.',
      usuarios: 48,
      permisos: {
        crearEventos: true,
        aprobarPULEP: false,
        suspenderUsuarios: false,
        modificarComisiones: false,
        descargarReportes: true,
      },
    },
    {
      rol: 'Asistente / Cliente',
      desc: 'Usuarios generales que descubren, guardan y compran boletos.',
      usuarios: 4163,
      permisos: {
        crearEventos: false,
        aprobarPULEP: false,
        suspenderUsuarios: false,
        modificarComisiones: false,
        descargarReportes: false,
      },
    },
  ]);

  const togglePermiso = (rolIndex, permisoKey) => {
    setPermisos((prev) =>
      prev.map((item, idx) => {
        if (idx !== rolIndex) return item;
        return {
          ...item,
          permisos: {
            ...item.permisos,
            [permisoKey]: !item.permisos[permisoKey],
          },
        };
      })
    );
  };

  const labels = {
    crearEventos: 'Publicar eventos',
    aprobarPULEP: 'Validar y aprobar PULEP',
    suspenderUsuarios: 'Suspender cuentas / eventos',
    modificarComisiones: 'Ajustar comisiones y tarifas',
    descargarReportes: 'Descargar analíticas financieras',
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <h3 className="font-display font-semibold text-lg text-ink">Matriz de Roles y Permisos de Seguridad</h3>
        <p className="text-xs text-muted mt-0.5">Control granular de accesos para proteger los datos y la operativa del ecosistema.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {permisos.map((p, idx) => (
          <div
            key={p.rol}
            className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <h4 className="font-display font-bold text-base text-ink">{p.rol}</h4>
                <p className="text-xs text-muted mt-0.5">{p.desc}</p>
              </div>
              <Badge tone="blue">{p.usuarios} usuarios</Badge>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5">
              {Object.entries(p.permisos).map(([key, val]) => (
                <div
                  key={key}
                  onClick={() => togglePermiso(idx, key)}
                  className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors select-none"
                >
                  <span className="text-xs text-slate-700 font-medium">{labels[key]}</span>
                  <span
                    className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition-colors ${
                      val ? 'bg-brand justify-end' : 'bg-slate-200 justify-start'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-white shadow-sm" />
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SeccionPromociones({ searchTerm }) {
  const [promociones, setPromociones] = useState([
    { id: 1, codigo: 'HEROICA2026', tipo: 'Porcentaje', valor: '20%', usados: 312, limite: 500, expira: '30 Oct 2026', activa: true },
    { id: 2, codigo: 'VERANOCTG', tipo: 'Fijo', valor: '$15.000 COP', usados: 184, limite: 200, expira: '15 Nov 2026', activa: true },
    { id: 3, codigo: 'JAZZVIP', tipo: 'Porcentaje', valor: '30%', usados: 100, limite: 100, expira: '20 Sep 2026', activa: false },
  ]);
  const [modalOpen, setModalOpen] = useState(false);
  const [nuevo, setNuevo] = useState({ codigo: '', tipo: 'Porcentaje', valor: '15%', limite: 200, expira: '31 Dic 2026' });

  const filtradas = promociones.filter((p) =>
    p.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const agregarPromocion = (e) => {
    e.preventDefault();
    if (!nuevo.codigo) return;
    setPromociones((prev) => [
      ...prev,
      { id: Date.now(), ...nuevo, codigo: nuevo.codigo.toUpperCase(), usados: 0, activa: true },
    ]);
    setNuevo({ codigo: '', tipo: 'Porcentaje', valor: '15%', limite: 200, expira: '31 Dic 2026' });
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h3 className="font-display font-semibold text-lg text-ink">Gestión de Cupones y Descuentos</h3>
          <p className="text-xs text-muted mt-0.5">Campañas promocionales aplicables al checkout de compra de boletos.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-sm transition-all hover:shadow-md"
        >
          <FiPlus size={15} /> Crear Cupón
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtradas.map((promo) => {
          const porcentajeUso = Math.round((promo.usados / promo.limite) * 100);
          return (
            <div
              key={promo.id}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold tracking-wider px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                    {promo.codigo}
                  </span>
                  <Badge tone={promo.activa ? 'green' : 'gray'}>
                    {promo.activa ? 'Activo' : 'Agotado / Inactivo'}
                  </Badge>
                </div>
                <p className="font-display font-bold text-2xl text-ink mt-2">{promo.valor} OFF</p>
                <p className="text-xs text-muted mt-1">Descuento {promo.tipo.toLowerCase()} en boletería</p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
                  <span>Usos registrados</span>
                  <span className="font-semibold">{promo.usados} / {promo.limite} ({porcentajeUso}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-brand rounded-full" style={{ width: `${Math.min(porcentajeUso, 100)}%` }} />
                </div>
                <p className="text-[11px] text-muted mt-2">Vigencia hasta: {promo.expira}</p>
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg text-ink">Crear Código de Descuento</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-ink"><FiX size={18} /></button>
            </div>
            <form onSubmit={agregarPromocion} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Código del cupón</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: CARTAGENA10"
                  value={nuevo.codigo}
                  onChange={(e) => setNuevo({ ...nuevo, codigo: e.target.value.toUpperCase() })}
                  className="w-full text-sm font-mono uppercase px-3.5 py-2 rounded-xl border border-borderc outline-none focus:border-brand"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Tipo de beneficio</label>
                  <select
                    value={nuevo.tipo}
                    onChange={(e) => setNuevo({ ...nuevo, tipo: e.target.value })}
                    className="w-full text-sm px-3.5 py-2 rounded-xl border border-borderc outline-none focus:border-brand bg-white"
                  >
                    <option>Porcentaje</option>
                    <option>Monto Fijo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Valor de descuento</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: 20% o $10.000"
                    value={nuevo.valor}
                    onChange={(e) => setNuevo({ ...nuevo, valor: e.target.value })}
                    className="w-full text-sm px-3.5 py-2 rounded-xl border border-borderc outline-none focus:border-brand"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Límite total de canjes</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={nuevo.limite}
                  onChange={(e) => setNuevo({ ...nuevo, limite: Number(e.target.value) })}
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-borderc outline-none focus:border-brand"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-sm"
                >
                  Activar Promoción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SeccionNiveles() {
  const niveles = [
    {
      nombre: 'Nivel Bronce',
      comision: '12%',
      limite: 'Hasta 3 eventos al mes',
      beneficios: ['Listado público en catálogo', 'Cobro con tarjeta y PSE', 'Soporte estándar por correo'],
      color: 'border-amber-700/30 bg-amber-50/40 text-amber-900',
      totalOrgs: 28,
    },
    {
      nombre: 'Nivel Plata (Destacado)',
      comision: '9%',
      limite: 'Hasta 10 eventos al mes',
      beneficios: ['Aparición en carrusel Destacados', 'Reportes avanzados de ventas', 'Soporte prioritario WhatsApp'],
      color: 'border-slate-300 bg-slate-50 text-slate-800',
      totalOrgs: 14,
    },
    {
      nombre: 'Nivel Oro (Productor VIP)',
      comision: '6%',
      limite: 'Eventos ilimitados',
      beneficios: ['Validación express PULEP', 'Comisión más baja del mercado', 'Asesor de cuenta dedicado'],
      color: 'border-yellow-400/40 bg-yellow-50/50 text-amber-950',
      totalOrgs: 6,
    },
  ];

  const [solicitudes, setSolicitudes] = useState([
    { id: 1, org: 'Producciones Bolívar SAS', actual: 'Bronce', solicitado: 'Plata', eventosHechos: 15, rating: '4.9 ★' },
    { id: 2, org: 'Caribe Live Events', actual: 'Plata', solicitado: 'Oro', eventosHechos: 32, rating: '5.0 ★' },
  ]);

  const responderSolicitud = (id) => {
    setSolicitudes((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <h3 className="font-display font-semibold text-lg text-ink">Niveles de Organización y Comisiones</h3>
        <p className="text-xs text-muted mt-0.5">Estructura de beneficios basada en reputación, aforo y frecuencia de eventos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {niveles.map((n) => (
          <div
            key={n.nombre}
            className={`border rounded-2xl p-5 shadow-sm flex flex-col justify-between ${n.color}`}
          >
            <div>
              <div className="flex items-center justify-between">
                <h4 className="font-display font-bold text-base">{n.nombre}</h4>
                <Badge tone="blue">{n.totalOrgs} orgs</Badge>
              </div>
              <div className="my-4">
                <span className="text-3xl font-display font-bold">{n.comision}</span>
                <span className="text-xs text-slate-600 ml-1">comisión por boleta</span>
              </div>
              <p className="text-xs font-semibold mb-3">{n.limite}</p>
              <ul className="space-y-2 text-xs">
                {n.beneficios.map((b) => (
                  <li key={b} className="flex items-center gap-2">
                    <FiCheck size={14} className="text-brand shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <h4 className="font-display font-semibold text-base text-ink mb-4">
          Solicitudes de Ascenso de Nivel ({solicitudes.length})
        </h4>

        {solicitudes.length === 0 ? (
          <p className="text-xs text-muted">No hay solicitudes pendientes en este momento.</p>
        ) : (
          <div className="space-y-3">
            {solicitudes.map((s) => (
              <div
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-slate-200/70 bg-slate-50/50"
              >
                <div>
                  <p className="font-semibold text-ink text-sm">{s.org}</p>
                  <p className="text-xs text-muted mt-0.5">
                    Nivel actual: <span className="font-medium text-slate-700">{s.actual}</span> → Solicita:{' '}
                    <span className="font-bold text-brand">{s.solicitado}</span> · {s.eventosHechos} eventos organizados ({s.rating})
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => responderSolicitud(s.id)}
                    className="px-3.5 py-1.5 rounded-lg bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    Aprobar Ascenso
                  </button>
                  <button
                    onClick={() => responderSolicitud(s.id)}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
