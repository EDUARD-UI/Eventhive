import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SideBar from '../../components/usersComponets/SideBar.jsx';
import {
  FiUsers, FiShield, FiClipboard, FiCalendar, FiTrendingUp,
  FiGrid, FiKey, FiTag, FiSearch, FiCheck, FiX, FiArrowUpRight,
  FiArrowLeft, FiBell, FiMapPin, FiEye, FiAlertCircle, FiDollarSign,
  FiLayers,
} from 'react-icons/fi';

const PAGE_BG = '#f0f4f9';

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

function Badge({ children, tone = 'gray' }) {
  const tones = {
    gray: 'bg-slate-100 text-slate-600 border border-slate-200',
    green: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    blue: 'bg-brand-light text-brand border border-blue-100',
    amber: 'bg-amber-50 text-amber-800 border border-amber-200',
    red: 'bg-rose-50 text-rose-700 border border-rose-200',
  };
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full ${tones[tone] || tones.gray}`}>
      {children}
    </span>
  );
}

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
    <div className="flex min-h-screen bg-[#f0f4f9] font-body text-ink">
      <SideBar role="Admin" variant="admin" items={secciones} activeItem={seccionActiva} onSelect={setSeccionActiva} />
      {/* Legacy sidebar markup retained temporarily for layout compatibility. */}
      <div className="hidden">
        <div>
          {/* Logo Oficial de EventHive */}
          <div className="flex items-center gap-3 px-2 mb-8 mr-4 bg-white/5 p-2.5 rounded-2xl border border-white/10">
            <img
              src={logoEventhive}
              alt="EventHive Logo"
              className="h-10 w-10 object-contain rounded-xl bg-white p-1 shadow-sm shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 font-display font-bold text-sm text-white leading-tight">
                Event<span className="text-[#3b82f6]">Hive</span>
                <span className="text-[9px] font-bold text-slate-900 bg-accent px-1.5 py-0.5 rounded tracking-wider uppercase">
                  Admin
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">Tu evento. Conecta.</p>
            </div>
          </div>

          {/* Navegación con pestañas conectadas */}
          <nav className="flex flex-col gap-1">
            {secciones.map(({ id, label, icon: Icon, count }) => {
              const active = seccionActiva === id;
              return (
                <div key={id} className="relative">
                  <button
                    onClick={() => setSeccionActiva(id)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-all text-left ${active
                      ? 'bg-[#f0f4f9] text-slate-900 font-semibold rounded-l-2xl relative z-10'
                      : 'text-slate-300 hover:text-white hover:bg-white/5 rounded-l-2xl mr-3'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} className={active ? 'text-brand' : 'text-slate-400'} />
                      <span>{label}</span>
                    </div>

                    {count && (
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${active
                          ? 'bg-brand-light text-brand'
                          : 'bg-white/10 text-slate-300'
                          }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>

                  {/* Curvas cóncavas superior e inferior */}
                  {active && (
                    <>
                      <span
                        className="absolute -top-5 right-0 w-5 h-5 pointer-events-none z-10"
                        style={{
                          background: `radial-gradient(circle at 0 0, transparent 19px, ${PAGE_BG} 19.5px)`,
                        }}
                      />
                      <span
                        className="absolute -bottom-5 right-0 w-5 h-5 pointer-events-none z-10"
                        style={{
                          background: `radial-gradient(circle at 0 100%, transparent 19px, ${PAGE_BG} 19.5px)`,
                        }}
                      />
                    </>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Link volver al sitio */}
        <div className="pt-4 border-t border-white/10 mr-4">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-white/5"
          >
            <FiArrowLeft size={15} />
            Volver a la plataforma
          </Link>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Barra superior de encabezado */}
        <header className="flex items-center justify-between px-8 py-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand bg-brand-light px-2.5 py-1 rounded-md">
              Panel de Administración
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-ink mt-2">
              {seccion.label}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Buscador interactivo */}
            <div className="flex items-center gap-2.5 bg-white border border-slate-200/80 shadow-sm rounded-full px-4 py-2 text-sm text-muted focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10 transition-all">
              <FiSearch size={16} className="text-slate-400" />
              <input
                type="text"
                placeholder={`Buscar en ${seccion.label.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none text-ink placeholder-slate-400 text-sm w-44 sm:w-56"
              />
            </div>

            {/* Notificaciones */}
            <button className="w-10 h-10 rounded-full bg-white border border-slate-200/80 shadow-sm flex items-center justify-center text-slate-600 hover:text-brand hover:border-brand transition-colors relative">
              <FiBell size={17} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />
            </button>
          </div>
        </header>

        {/* Cuerpo principal */}
        <main className="px-8 pb-10 flex-1">
          {seccionActiva === 'resumen' && (
            <SeccionResumen
              eventos={eventos}
              onSelectEvento={setEventoSeleccionado}
              onToggleEstado={toggleEstadoEvento}
            />
          )}
          {seccionActiva === 'usuarios' && <SeccionUsuarios searchTerm={searchTerm} />}
          {seccionActiva === 'moderadores' && (
            <EmptyState icon={FiShield} titulo="Gestión de moderadores" descripcion="Aquí verás la lista de moderadores asignados para gestionar permisos y roles en la plataforma." />
          )}
          {seccionActiva === 'solicitudes' && <SeccionSolicitudes />}
          {seccionActiva === 'eventos' && (
            <SeccionEventos
              eventos={eventos}
              searchTerm={searchTerm}
              onSelectEvento={setEventoSeleccionado}
              onToggleEstado={toggleEstadoEvento}
            />
          )}
          {seccionActiva === 'niveles' && (
            <EmptyState icon={FiTrendingUp} titulo="Niveles de organización" descripcion="Aquí gestionarás las sugerencias de ascenso y el cambio de nivel de cada organización." />
          )}
          {seccionActiva === 'categorias' && (
            <EmptyState icon={FiGrid} titulo="Categorías" descripcion="Aquí crearás, editarás y eliminarás categorías con su respectiva imagen." />
          )}
          {seccionActiva === 'roles' && (
            <EmptyState icon={FiKey} titulo="Roles del sistema" descripcion="Aquí crearás nuevos roles para ampliar la gestión de permisos en la plataforma." />
          )}
          {seccionActiva === 'promociones' && (
            <EmptyState icon={FiTag} titulo="Promociones" descripcion="Aquí gestionarás promociones y descuentos aplicados a eventos de la plataforma." />
          )}
        </main>
      </div>

      {/* Modal de Detalle de Evento */}
      {eventoSeleccionado && (
        <ModalDetalleEvento
          evento={eventoSeleccionado}
          onClose={() => setEventoSeleccionado(null)}
          onToggleEstado={toggleEstadoEvento}
        />
      )}
    </div>
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
        {stats.map(({ label, value, change, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-11 h-11 rounded-xl ${bg} ${color} flex items-center justify-center`}>
                <Icon size={20} />
              </div>
              <span className="text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                {change}
              </span>
            </div>
            <p className="text-3xl font-bold font-display text-ink">{value}</p>
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mt-1">{label}</p>
          </div>
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
