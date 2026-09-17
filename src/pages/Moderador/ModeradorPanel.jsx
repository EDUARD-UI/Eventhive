
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SideBar from '../../components/usersComponets/SideBar.jsx';
import {
  FiClipboard, FiList, FiCheck, FiEdit3, FiX, FiTrendingUp,
  FiBriefcase, FiArrowLeft, FiClock, FiSearch, FiCheckCircle,
  FiAlertTriangle, FiEye, FiBell, FiCalendar, FiMapPin, FiUsers,
  FiFileText, FiShield,
} from 'react-icons/fi';

const PAGE_BG = '#f0f4f9';

const INITIAL_PENDIENTES = [
  {
    id: 1,
    titulo: 'Concierto de Rock en la Muralla',
    organizador: 'Producciones XYZ',
    nit: '900.123.456-7',
    fecha: '20 Sep 2026',
    hora: '8:00 PM',
    lugar: 'Baluarte de San Ignacio, Cartagena',
    horas: 'Enviado hace 2h',
    categoria: 'Música',
    foto: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=800&q=80',
    descripcion: 'Montaje en tarima principal frente al mar. Se adjuntan permisos de la Alcaldía y código PULEP.',
    pulep: 'PUL-2026-8921',
    aforo: 800,
    localidades: [
      { nombre: 'General', precio: 85000, capacidad: 600 },
      { nombre: 'VIP Frente a Tarima', precio: 160000, capacidad: 200 },
    ],
    validaciones: [
      { label: 'Aforo y Localidades Coincidentes', passed: true },
      { label: 'Imagen en Alta Resolución', passed: true },
      { label: 'Permiso Municipal / PULEP Adjunto', passed: true },
      { label: 'Información de Lugar Verificada', passed: true },
    ],
  },
  {
    id: 2,
    titulo: 'Feria Gastronómica del Caribe',
    organizador: 'Sabores Cartagena SAS',
    nit: '900.654.321-1',
    fecha: '25 Sep 2026',
    hora: '12:00 PM',
    lugar: 'Plaza de la Aduana, Cartagena',
    horas: 'Enviado hace 5h',
    categoria: 'Gastronomía',
    foto: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    descripcion: 'Feria con 30 stands gastronómicos de comida típica caribeña.',
    pulep: 'PUL-2026-4412',
    aforo: 1200,
    localidades: [
      { nombre: 'Entrada General', precio: 35000, capacidad: 1200 },
    ],
    validaciones: [
      { label: 'Aforo y Localidades Coincidentes', passed: true },
      { label: 'Imagen en Alta Resolución', passed: true },
      { label: 'Permiso Sanitario / Bromatología', passed: true },
      { label: 'Información de Lugar Verificada', passed: true },
    ],
  },
  {
    id: 3,
    titulo: 'Expo Arte Urbano Getsemaní',
    organizador: 'Colectivo Mural',
    nit: '800.771.229-3',
    fecha: '02 Oct 2026',
    hora: '4:00 PM',
    lugar: 'Callejón Angosto, Getsemaní',
    horas: 'Enviado ayer',
    categoria: 'Cultura',
    foto: 'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?auto=format&fit=crop&w=800&q=80',
    descripcion: 'Recorrido guiado de arte urbano y exposición de pintura al aire libre.',
    pulep: 'N/A (Entrada Libre)',
    aforo: 450,
    localidades: [
      { nombre: 'Entrada Libre', precio: 0, capacidad: 450 },
    ],
    validaciones: [
      { label: 'Aforo y Localidades Coincidentes', passed: true },
      { label: 'Imagen en Alta Resolución', passed: true },
      { label: 'Permiso de Espacio Público', passed: true },
    ],
  },
];

const secciones = [
  { id: 'resumen', label: 'Resumen', icon: FiTrendingUp, count: null },
  { id: 'eventos', label: 'Eventos Pendientes', icon: FiClipboard, count: '12' },
  { id: 'organizaciones', label: 'Organizaciones', icon: FiBriefcase, count: '2' },
  { id: 'motivos', label: 'Motivos de Rechazo', icon: FiList, count: '6' },
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

export default function ModeradorPanel() {
  const [seccionActiva, setSeccionActiva] = useState('eventos');
  const [searchTerm, setSearchTerm] = useState('');
  const [pendientes, setPendientes] = useState(INITIAL_PENDIENTES);
  const [eventoModal, setEventoModal] = useState(null);

  const seccion = secciones.find((s) => s.id === seccionActiva);

  const handleAprobar = (id) => {
    setPendientes((prev) => prev.filter((e) => e.id !== id));
    if (eventoModal?.id === id) setEventoModal(null);
  };

  const handleRechazar = (id) => {
    setPendientes((prev) => prev.filter((e) => e.id !== id));
    if (eventoModal?.id === id) setEventoModal(null);
  };

  return (
    <div className="flex min-h-screen bg-[#f0f4f9] font-body text-ink">
      <SideBar role="Moderador" items={secciones} activeItem={seccionActiva} onSelect={setSeccionActiva} />
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
                  Moderador
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">Control de Calidad</p>
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
              Módulo de Moderación
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-ink mt-2">
              {seccion.label}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Buscador */}
            <div className="flex items-center gap-2.5 bg-white border border-slate-200/80 shadow-sm rounded-full px-4 py-2 text-sm text-muted focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10 transition-all">
              <FiSearch size={16} className="text-slate-400" />
              <input
                type="text"
                placeholder="Buscar evento o motivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none text-ink placeholder-slate-400 text-sm w-44 sm:w-56"
              />
            </div>

            {/* Notificaciones */}
            <button className="w-10 h-10 rounded-full bg-white border border-slate-200/80 shadow-sm flex items-center justify-center text-slate-600 hover:text-brand hover:border-brand transition-colors relative">
              <FiBell size={17} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500" />
            </button>
          </div>
        </header>

        {/* Cuerpo de la vista */}
        <main className="px-8 pb-10 flex-1">
          {seccionActiva === 'resumen' && (
            <SeccionResumenModeracion
              pendientes={pendientes}
              onInspect={setEventoModal}
              onAprobar={handleAprobar}
              onRechazar={handleRechazar}
            />
          )}
          {seccionActiva === 'eventos' && (
            <SeccionPendientes
              pendientes={pendientes}
              searchTerm={searchTerm}
              onInspect={setEventoModal}
              onAprobar={handleAprobar}
              onRechazar={handleRechazar}
            />
          )}
          {seccionActiva === 'organizaciones' && <SeccionOrganizacionesPendientes />}
          {seccionActiva === 'motivos' && <SeccionMotivos searchTerm={searchTerm} />}
        </main>
      </div>

      {/* Modal de Inspección y Moderación */}
      {eventoModal && (
        <ModalModeracionEvento
          evento={eventoModal}
          onClose={() => setEventoModal(null)}
          onAprobar={() => handleAprobar(eventoModal.id)}
          onRechazar={() => handleRechazar(eventoModal.id)}
        />
      )}
    </div>
  );
}

function SeccionResumenModeracion({ pendientes, onInspect, onAprobar, onRechazar }) {
  const stats = [
    { label: 'Eventos pendientes', value: `${pendientes.length}`, icon: FiClipboard, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Eventos aprobados', value: '184', icon: FiCheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'En corrección', value: '6', icon: FiAlertTriangle, color: 'text-brand', bg: 'bg-brand-light' },
    { label: 'Tiempo prom. revisión', value: '18 min', icon: FiClock, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
          >
            <div className={`w-11 h-11 rounded-xl ${bg} ${color} flex items-center justify-center mb-3.5`}>
              <Icon size={20} />
            </div>
            <p className="text-3xl font-bold font-display text-ink">{value}</p>
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-semibold text-base text-ink">Bandeja de Eventos por Revisar</h3>
            <p className="text-xs text-muted">Ordenados por antigüedad de envío</p>
          </div>
        </div>
        <SeccionPendientes
          pendientes={pendientes}
          searchTerm=""
          onInspect={onInspect}
          onAprobar={onAprobar}
          onRechazar={onRechazar}
        />
      </div>
    </div>
  );
}

function SeccionPendientes({ pendientes, searchTerm, onInspect, onAprobar, onRechazar }) {
  const filtrados = useMemo(() => {
    if (!searchTerm) return pendientes;
    const term = searchTerm.toLowerCase();
    return pendientes.filter(
      (e) =>
        e.titulo.toLowerCase().includes(term) ||
        e.organizador.toLowerCase().includes(term) ||
        e.categoria.toLowerCase().includes(term)
    );
  }, [pendientes, searchTerm]);

  if (filtrados.length === 0) {
    return (
      <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-10 text-center text-slate-500">
        <FiCheckCircle className="mx-auto text-emerald-500 mb-2" size={32} />
        <p className="font-semibold text-ink">¡Bandeja al día!</p>
        <p className="text-xs text-muted mt-1">No hay eventos pendientes que coincidan con la búsqueda.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0 max-w-4xl">
      {filtrados.map((e, i) => (
        <div key={e.id} className="flex gap-4">
          {/* Línea de tiempo conectada */}
          <div className="flex flex-col items-center">
            <div className="w-4 h-4 rounded-full bg-brand ring-4 ring-brand-light mt-6 shrink-0 shadow-sm" />
            {i < filtrados.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 mt-2" />}
          </div>

          {/* Tarjeta de Evento con Imagen */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 mb-5 flex-1 shadow-sm hover:shadow-md transition-all">
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              {/* Imagen del Evento */}
              <div className="relative w-full sm:w-44 aspect-[16/10] sm:aspect-auto sm:h-32 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                <img src={e.foto} alt={e.titulo} className="w-full h-full object-cover" />
                <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-brand font-bold text-[10px] px-2 py-0.5 rounded shadow-sm">
                  {e.categoria}
                </span>
              </div>

              {/* Información General */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-display font-semibold text-base text-ink leading-snug">
                      {e.titulo}
                    </h4>
                    <p className="text-xs text-muted mt-0.5 font-medium">
                      {e.organizador} · NIT {e.nit}
                    </p>
                  </div>
                  <Badge tone="amber">{e.horas}</Badge>
                </div>

                <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <FiCalendar className="text-brand shrink-0" size={13} />
                    <span>{e.fecha} · {e.hora}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FiMapPin className="text-brand shrink-0" size={13} />
                    <span>{e.lugar}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FiUsers className="text-brand shrink-0" size={13} />
                    <span>Aforo: {e.aforo} pers.</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {e.descripcion}
                </p>
              </div>
            </div>

            {/* Acciones de Moderación */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 mt-4">
              <button
                onClick={() => onAprobar(e.id)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-2 px-5 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <FiCheck size={15} /> Aprobar
              </button>
              <button
                onClick={() => onInspect(e)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold transition-colors"
              >
                <FiEdit3 size={14} /> Solicitar Corrección
              </button>
              <button
                onClick={() => onRechazar(e.id)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors"
              >
                <FiX size={14} /> Rechazar
              </button>
              <button
                onClick={() => onInspect(e)}
                title="Revisión detallada"
                className="flex items-center justify-center px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                <FiEye size={15} className="mr-1" /> Revisar Detalle
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ModalModeracionEvento({ evento, onClose, onAprobar, onRechazar }) {
  const [motivoCorreccion, setMotivoCorreccion] = useState('');
  const [mostrarCorreccion, setMostrarCorreccion] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 overflow-hidden">
        {/* Banner de Imagen */}
        <div className="relative h-60 w-full bg-slate-900">
          <img src={evento.foto} alt={evento.titulo} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
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
            <p className="text-xs text-slate-300 mt-0.5">{evento.organizador} · {evento.lugar}</p>
          </div>
        </div>

        {/* Contenido de Inspección */}
        <div className="p-6 space-y-6">
          {/* Validaciones Automáticas */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-2 flex items-center gap-1.5">
              <FiCheckCircle className="text-emerald-600" size={15} />
              Validaciones Automáticas del Sistema
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {evento.validaciones?.map((val, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-emerald-800 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  {val.label}
                </div>
              ))}
            </div>
          </div>

          {/* Localidades y Aforo */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2.5">
              Configuración de Localidades (Aforo Total: {evento.aforo})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {evento.localidades?.map((loc, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-sm text-slate-800">{loc.nombre}</p>
                    <p className="text-xs text-muted">Capacidad: {loc.capacidad} cupos</p>
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

          {/* Formulario de Corrección */}
          {mostrarCorreccion && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
              <label className="text-xs font-bold text-amber-900 block">
                Motivo / Observación de Corrección para la Organización:
              </label>
              <textarea
                rows={3}
                placeholder="Escribe aquí las observaciones específicas que debe corregir el organizador..."
                value={motivoCorreccion}
                onChange={(e) => setMotivoCorreccion(e.target.value)}
                className="w-full p-3 rounded-xl border border-amber-300 bg-white text-xs text-slate-800 outline-none focus:ring-2 focus:ring-amber-500/20"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setMostrarCorreccion(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-600 bg-white border border-slate-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    onRechazar();
                    onClose();
                  }}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 transition-colors"
                >
                  Enviar a Corrección
                </button>
              </div>
            </div>
          )}

          {/* Footer de Acciones del Moderador */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-muted">PULEP: <strong className="text-slate-800">{evento.pulep}</strong></span>
            <div className="flex gap-2">
              <button
                onClick={() => setMostrarCorreccion(true)}
                className="py-2 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold transition-colors"
              >
                <FiEdit3 size={14} className="inline mr-1" /> Solicitar Corrección
              </button>
              <button
                onClick={onRechazar}
                className="py-2 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors"
              >
                <FiX size={14} className="inline mr-1" /> Rechazar
              </button>
              <button
                onClick={onAprobar}
                className="py-2 px-5 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <FiCheck size={14} className="inline mr-1" /> Aprobar y Publicar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SeccionOrganizacionesPendientes() {
  const organizaciones = [
    { nombre: 'Fundación Festival de Jazz', tipo: 'Cultural / Sin ánimo de lucro', ciudad: 'Cartagena', fecha: '21 Ago 2026', nit: '900.887.112-9' },
    { nombre: 'Eventos del Sinú SAS', tipo: 'Empresa Privada', ciudad: 'Montería', fecha: '22 Ago 2026', nit: '901.442.883-1' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
      {organizaciones.map((org) => (
        <div
          key={org.nombre}
          className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-display font-semibold text-base text-ink">{org.nombre}</p>
              <p className="text-xs text-muted mt-0.5">{org.tipo} · {org.ciudad}</p>
            </div>
            <Badge tone="amber">Pendiente</Badge>
          </div>
          <p className="text-xs text-slate-500 mb-4">NIT: {org.nit} · Solicitud: {org.fecha}</p>
          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-sm transition-colors">
              <FiCheck size={14} /> Aprobar Organización
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-medium transition-colors">
              <FiX size={14} /> Rechazar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function SeccionMotivos({ searchTerm }) {
  const motivos = [
    { titulo: 'Información incompleta del lugar', desc: 'Falta dirección exacta, aforo o referencia territorial en el mapa.' },
    { titulo: 'Precio de localidad inconsistente', desc: 'Los precios de las localidades no coinciden con la suma total del aforo.' },
    { titulo: 'Falta documentación o permisos', desc: 'No se adjuntó el código PULEP o permisos municipales obligatorios.' },
    { titulo: 'Imagen o contenido no permitido', desc: 'La fotografía no cumple con las directrices de calidad o resolución.' },
    { titulo: 'Categoría inadecuada', desc: 'La temática del evento no se corresponde con la categoría seleccionada.' },
    { titulo: 'Incumplimiento de términos', desc: 'El contenido infringe las políticas comunitarias de EventHive.' },
  ];

  const filtrados = useMemo(() => {
    if (!searchTerm) return motivos;
    return motivos.filter(
      (m) =>
        m.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.desc.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl">
      {filtrados.map((m) => (
        <div
          key={m.titulo}
          className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:border-brand/40 hover:bg-brand-light/10 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand" />
              <p className="font-semibold text-sm text-ink">{m.titulo}</p>
            </div>
            <p className="text-xs text-muted leading-relaxed">{m.desc}</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
            <span className="text-[11px] font-semibold text-brand hover:underline cursor-pointer">
              Configurar motivo →
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
