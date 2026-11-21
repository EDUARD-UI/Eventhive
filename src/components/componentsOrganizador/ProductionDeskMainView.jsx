import React, { useState, useMemo } from 'react';
import { FiArrowRight, FiPlus, FiRotateCw } from 'react-icons/fi';
import { formatPrice } from '../../utils/formatters.js';

/**
 * ProductionDeskMainView
 * Vista Principal: Cartelera de Eventos & Acreditación VIP Backstage
 *
 * Sistema visual estricto (Regla 60 / 30 / 10):
 * - 60% Superficie: Blanco puro (#FFFFFF) y Blanco Hueso (#FAFAFA)
 * - 30% Estructura y Tinta: Negro Carbón (#111111) y Gris Humo (#666666)
 * - 10% Terciario: Ámbar Dorado EventHive (#F59E0B) para el botón primario, indicadores de 6px y subrayados
 * - CERO badges, pills redondeadas ni gradientes de IA
 * - Interacción de Credencial con Flip 3D (perspective: 1000px)
 * - Boletos impresos físicos con división de talón punteada y muescas semicirculares
 */

function formatTicketDate(fechaStr, lugarStr) {
  const city = (lugarStr || 'Cartagena').toUpperCase();
  if (!fechaStr) return `POR CONFIRMAR — ${city}`;
  try {
    const parts = String(fechaStr).split('T')[0].split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
      const monthName = months[parseInt(month, 10) - 1] || 'MES';
      return `${day} ${monthName} ${year} — ${city}`;
    }
    return `${fechaStr} — ${city}`;
  } catch {
    return `${fechaStr} — ${city}`;
  }
}

function getEventTicketMetrics(event) {
  let capacity = 0;
  let sold = 0;

  if (Array.isArray(event.localidades) && event.localidades.length > 0) {
    event.localidades.forEach((loc) => {
      const cap = Number(loc.capacidad ?? loc.capacity) || 0;
      const disp = Number(loc.disponibles ?? loc.available);
      capacity += cap;
      if (!isNaN(disp) && disp >= 0) {
        sold += Math.max(0, cap - disp);
      }
    });
  }

  if (capacity === 0) {
    capacity = Number(event.totalBoletas ?? event.capacidad ?? event.aforo) || 200;
    const disp = Number(event.boletasDisponibles);
    if (!isNaN(disp) && disp >= 0) {
      sold = Math.max(0, capacity - disp);
    } else {
      sold = Math.round(capacity * 0.35);
    }
  }

  return { sold, capacity };
}

function parseTourDate(fechaStr) {
  const currentYear = new Date().getFullYear().toString();
  if (!fechaStr) return { dayMonth: 'TBD', year: currentYear };
  try {
    const parts = String(fechaStr).split('T')[0].split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
      const monthName = months[parseInt(month, 10) - 1] || 'MES';
      return { dayMonth: `${parseInt(day, 10)} ${monthName}`, year };
    }
  } catch {}
  return { dayMonth: 'TBD', year: currentYear };
}

function getTicketStatus(estado) {
  const st = String(estado || '').toUpperCase();
  if (st === 'PUBLICADO') return { label: 'A LA VENTA', dotColor: '#F5B800' };
  if (st === 'BORRADOR' || st === 'EN_CORRECCION') return { label: 'BORRADOR', dotColor: '#64748B' };
  if (st === 'PENDIENTE_REVISION') return { label: 'EN REVISIÓN', dotColor: '#F5B800' };
  if (st === 'FINALIZADO' || st === 'CANCELADO') return { label: 'ARCHIVADO', dotColor: '#94A3B8' };
  return { label: 'A LA VENTA', dotColor: '#F5B800' };
}

export default function ProductionDeskMainView({
  events = [],
  orgData = null,
  user = {},
  representativeName = 'Productor',
  orgName = 'EventHive Producciones',
  onCreateEvent,
  onSelectEvent,
  onNavigate,
  hasRutUploaded = false,
  isLoading = false,
}) {
  const [filter, setFilter] = useState('todos'); // 'todos' | 'en_venta' | 'borradores' | 'archivo'
  const [isFlipped, setIsFlipped] = useState(false);

  // Filtrado editorial puramente tipográfico
  const filteredEvents = useMemo(() => {
    return (events || []).filter((e) => {
      const st = String(e.estado || e.rawStatus || '').toUpperCase();
      if (filter === 'en_venta') return st === 'PUBLICADO';
      if (filter === 'borradores') return st === 'BORRADOR' || st === 'EN_CORRECCION' || st === 'PENDIENTE_REVISION';
      if (filter === 'archivo') return st === 'FINALIZADO' || st === 'CANCELADO' || st === 'SUSPENDIDO';
      return true;
    });
  }, [events, filter]);

  const serialCode = useMemo(() => {
    const rawId = user?.id || user?.sub || '0849';
    const num = String(rawId).replace(/\D/g, '').slice(-4).padStart(4, '0') || '0849';
    return `EH-PROD-2026-${num}`;
  }, [user]);

  const userPhoto = user?.foto || user?.avatar || orgData?.urlLogo || orgData?.logo || null;

  return (
    <div className="w-full min-h-screen bg-[#F8F9FA] text-[#0F2342] font-body selection:bg-[#F5B800] selection:text-[#0F2342] p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-start">

        {/* =========================================================================
            ZONA A: Columna Izquierda (~30% del ancho) — La Credencial VIP Backstage
           ========================================================================= */}
        <aside className="lg:col-span-4 xl:col-span-4 w-full flex flex-col items-center lg:items-start lg:sticky lg:top-8 z-20">
          <div className="w-full max-w-[380px] [perspective:1200px]">
            <div
              className={`relative w-full rounded-[2px] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] [transform-style:preserve-3d] shadow-[0_20px_45px_rgba(0,0,0,0.05)] border border-[#E2E8F0] bg-[#FFFFFF] ${
                isFlipped ? '[transform:rotateY(180deg)]' : ''
              }`}
            >
              {/* =======================================================
                  CARA FRONTAL: Organizador / Productor Ejecutivo
                 ======================================================= */}
              <div className="w-full p-6 sm:p-7 flex flex-col justify-between [backface-visibility:hidden] min-h-[540px]">
                <div>
                  {/* Troquelado superior simulado para el cordón de producción */}
                  <div className="w-16 h-2.5 rounded-full bg-[#EFEFEF] border border-[#DCDCDC] mx-auto shadow-inner mb-6" />

                  {/* Encabezado editorial de la credencial */}
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 mb-6">
                    <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#64748B] font-semibold">
                      EVENTHIVE · PASES VIP
                    </span>
                    <span className="w-2 h-2 rounded-full bg-[#F5B800]" title="Pase VIP Activo" />
                  </div>

                  {/* Fotografía de Acreditación a Todo Color Natural */}
                  <div className="w-36 h-36 mx-auto mb-6 bg-[#F8F9FA] border border-[#E2E8F0] overflow-hidden relative group rounded-[2px]">
                    {userPhoto ? (
                      <img
                        src={userPhoto}
                        alt={representativeName}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0F2342] text-[#FFFFFF] p-2">
                        <span className="font-mono text-xs tracking-widest uppercase text-[#F5B800]">PROD</span>
                        <span className="font-display font-black text-xl mt-1">
                          {representativeName.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F2342]/20 via-transparent to-transparent pointer-events-none" />
                  </div>

                  {/* Identidad del Acreditado */}
                  <div className="text-center space-y-1.5 px-2">
                    <h3 className="font-display font-black text-xl sm:text-2xl text-[#0F2342] uppercase tracking-tight leading-tight">
                      {representativeName}
                    </h3>
                    <p className="font-mono text-xs uppercase tracking-wider text-[#64748B] font-medium">
                      {user?.cargo || 'Productor Ejecutivo'}
                    </p>
                    <p className="font-mono text-[11px] text-[#94A3B8] pt-1">
                      {orgName}
                    </p>
                  </div>
                </div>

                {/* Pie de la Credencial Frontal: Serial Monospace y Botón Flip */}
                <div className="mt-8 pt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
                  <span className="font-mono text-[10px] tracking-wider text-[#64748B]">
                    {serialCode}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsFlipped(true)}
                    className="font-mono text-[11px] font-semibold text-[#0F2342] hover:text-[#B45309] transition-colors flex items-center gap-1 cursor-pointer py-1"
                  >
                    <span>Ver Organización</span>
                    <FiRotateCw size={11} className="inline-block" />
                  </button>
                </div>
              </div>

              {/* =======================================================
                  CARA TRASERA: Organización & Enlaces Operacionales
                 ======================================================= */}
              <div className="absolute inset-0 w-full h-full p-6 sm:p-7 flex flex-col justify-between [backface-visibility:hidden] [transform:rotateY(180deg)] bg-[#FFFFFF] min-h-[540px]">
                <div>
                  {/* Troquelado superior simulado idéntico */}
                  <div className="w-16 h-2.5 rounded-full bg-[#EFEFEF] border border-[#DCDCDC] mx-auto shadow-inner mb-6" />

                  {/* Encabezado trasero */}
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 mb-6">
                    <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#64748B] font-semibold">
                      ENTIDAD PRODUCTORA
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F5B800]" />
                      <span className="font-mono text-[9px] uppercase tracking-wider text-[#0F2342]">
                        {hasRutUploaded ? 'VERIFICADA' : 'REGISTRADA'}
                      </span>
                    </div>
                  </div>

                  {/* Nombre / Marca de la Organización */}
                  <div className="space-y-1 mb-6">
                    <span className="font-mono text-[10px] uppercase text-[#94A3B8] block">Compañía</span>
                    <h4 className="font-display font-black text-lg text-[#0F2342] uppercase tracking-tight">
                      {orgName}
                    </h4>
                  </div>

                  {/* Datos Legales separados por filetes finos de 1px */}
                  <div className="space-y-2.5 border-t border-b border-[#E2E8F0] py-3 text-xs font-mono">
                    <div className="flex justify-between items-center">
                      <span className="text-[#64748B]">NIT / ID FISCAL</span>
                      <span className="text-[#0F2342] font-semibold">{orgData?.nit || 'En verificación'}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-[#F1F5F9] pt-2">
                      <span className="text-[#64748B]">PRODUCCIONES</span>
                      <span className="text-[#0F2342] font-semibold">{events.length} Registradas</span>
                    </div>
                  </div>

                  {/* Enlaces Editoriales Directos con Subrayado Animado */}
                  <div className="mt-6 space-y-3 text-xs">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#94A3B8] block mb-2">
                      Acceso Técnico de Producción
                    </span>

                    <button
                      type="button"
                      onClick={() => onNavigate && onNavigate('operadores')}
                      className="group flex items-center justify-between w-full text-left font-mono text-xs text-[#0F2342] hover:text-[#B45309] transition-colors py-1 cursor-pointer"
                    >
                      <span className="border-b border-transparent group-hover:border-[#F5B800] transition-all">
                        Equipo & Crew Técnico
                      </span>
                      <FiArrowRight size={11} className="transition-transform group-hover:translate-x-1" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onNavigate && onNavigate('posicionamiento')}
                      className="group flex items-center justify-between w-full text-left font-mono text-xs text-[#0F2342] hover:text-[#B45309] transition-colors py-1 cursor-pointer"
                    >
                      <span className="border-b border-transparent group-hover:border-[#F5B800] transition-all">
                        Planes de Amplificación & Promoción
                      </span>
                      <FiArrowRight size={11} className="transition-transform group-hover:translate-x-1" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onNavigate && onNavigate('entradas')}
                      className="group flex items-center justify-between w-full text-left font-mono text-xs text-[#0F2342] hover:text-[#B45309] transition-colors py-1 cursor-pointer"
                    >
                      <span className="border-b border-transparent group-hover:border-[#F5B800] transition-all">
                        Auditoría de Taquilla & Recaudo
                      </span>
                      <FiArrowRight size={11} className="transition-transform group-hover:translate-x-1" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onNavigate && onNavigate('perfil')}
                      className="group flex items-center justify-between w-full text-left font-mono text-xs text-[#0F2342] hover:text-[#B45309] transition-colors py-1 cursor-pointer"
                    >
                      <span className="border-b border-transparent group-hover:border-[#F5B800] transition-all">
                        Expediente de Organización & RUT
                      </span>
                      <FiArrowRight size={11} className="transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>

                {/* Pie de la Credencial Trasera: Botón Flip para regresar */}
                <div className="mt-6 pt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
                  <span className="font-mono text-[10px] tracking-wider text-[#94A3B8]">
                    AUTORIZACIÓN VIP
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsFlipped(false)}
                    className="font-mono text-[11px] font-semibold text-[#0F2342] hover:text-[#B45309] transition-colors flex items-center gap-1 cursor-pointer py-1"
                  >
                    <span>Ver Organizador</span>
                    <FiRotateCw size={11} className="inline-block" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* =========================================================================
            ZONA B: Columna Derecha (~70% del ancho) — La Cartelera (Line-up de Eventos)
           ========================================================================= */}
        <main className="lg:col-span-8 xl:col-span-8 w-full space-y-8">

          {/* Cabecera Minimalista: Título, Filtros Tipográficos y Botón Primario */}
          <div className="border-b border-[#E2E8F0] pb-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#64748B] flex items-center gap-1.5 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F5B800]" />
                  <span>Mesa de Producción · Cartagena</span>
                </span>
                <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-[#0F2342] tracking-tight uppercase leading-none">
                  Cartelera Oficial
                </h1>
              </div>

              {/* Botón Primario: Nuevo Evento (sin doble +) */}
              <button
                type="button"
                onClick={onCreateEvent}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-[2px] bg-[#0F2342] hover:bg-[#F5B800] text-[#FFFFFF] hover:text-[#0F2342] font-mono text-xs uppercase tracking-wider font-bold transition-all duration-150 cursor-pointer shadow-xs active:scale-98 shrink-0"
              >
                <FiPlus size={14} strokeWidth={2.5} />
                <span>Nuevo Evento</span>
              </button>
            </div>

            {/* Filtros puramente tipográficos (sin cajas redondeadas) con subrayado terciario */}
            <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto scrollbar-none pt-2">
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'en_venta', label: 'En Venta' },
                { id: 'borradores', label: 'Borradores' },
                { id: 'archivo', label: 'Archivo' },
              ].map((tab) => {
                const isActive = filter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilter(tab.id)}
                    className={`font-mono text-xs uppercase tracking-wider transition-all cursor-pointer pb-2 relative shrink-0 ${
                      isActive
                        ? 'text-[#0F2342] font-bold'
                        : 'text-[#64748B] hover:text-[#0F2342] font-medium'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {isActive && (
                      <span
                        className="absolute bottom-0 inset-x-0 h-[2px] bg-[#F5B800] transition-all"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* =========================================================================
              Galería Editorial de Eventos: Boletos Físicos / Tickets de Colección
             ========================================================================= */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="w-full h-32 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] animate-pulse p-6 flex items-center justify-between"
                >
                  <div className="space-y-3 w-2/3">
                    <div className="w-40 h-3 bg-[#F1F5F9] rounded-[1px]" />
                    <div className="w-64 h-5 bg-[#F1F5F9] rounded-[1px]" />
                    <div className="w-32 h-3 bg-[#F1F5F9] rounded-[1px]" />
                  </div>
                  <div className="w-24 h-10 bg-[#F1F5F9] rounded-[1px]" />
                </div>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            /* Estado Vacío de Papel Fino */
            <div className="rounded-[2px] border border-dashed border-[#CBD5E1] bg-[#FFFFFF] p-12 sm:p-16 text-center space-y-4">
              <span className="font-mono text-xs uppercase tracking-widest text-[#64748B] block">
                Line-up Vacío
              </span>
              <h3 className="font-display font-black text-xl sm:text-2xl text-[#0F2342] uppercase tracking-tight">
                El escenario está a oscuras
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] font-normal max-w-md mx-auto leading-relaxed">
                Aún no hay funciones en cartelera. Enciende las luces y emite tu primer boleto de colección.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onCreateEvent}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[2px] bg-[#0F2342] hover:bg-[#F5B800] text-[#FFFFFF] hover:text-[#0F2342] font-mono text-xs uppercase tracking-wider font-bold transition-all cursor-pointer"
                >
                  <FiPlus size={13} />
                  <span>Crear Producción</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-5">
              {filteredEvents.map((event) => {
                const eventId = event.id || event.eventoId;
                const { sold, capacity } = getEventTicketMetrics(event);
                const status = getTicketStatus(event.estado || event.rawStatus);
                const dateCity = formatTicketDate(event.fecha || event.date, event.lugar || event.ubicacion);
                const title = event.titulo || event.nombre || event.title || 'Evento Cultural';
                const venue = event.lugar || event.ubicacion || 'Recinto por confirmar';
                const category =
                  typeof event.categoria === 'string'
                    ? event.categoria
                    : event.categoria?.nombre || event.categoriaNombre || 'General';
                const posterUrl = event.foto || event.imagen || event.imagenUrl || null;
                const { dayMonth, year } = parseTourDate(event.fecha || event.date);

                return (
                  <article
                    key={eventId}
                    onClick={() => onSelectEvent && onSelectEvent(eventId)}
                    className="group relative rounded-[2px] border border-[#E2E8F0] hover:border-[#F5B800] bg-[#FFFFFF] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(245,184,0,0.12)] cursor-pointer overflow-hidden flex flex-col md:flex-row items-stretch select-none"
                  >
                    {/* SECCIÓN 1: PÓSTER OFICIAL A COLOR (110px x 130px fijo) */}
                    <div className="w-full md:w-[110px] md:h-[130px] shrink-0 bg-[#F8F9FA] overflow-hidden border-b md:border-b-0 md:border-r border-[#E2E8F0]">
                      {posterUrl ? (
                        <img
                          src={posterUrl}
                          alt={title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-32 md:h-full flex flex-col items-center justify-center bg-[#0F2342] text-white p-2">
                          <span className="font-mono text-[9px] uppercase tracking-widest text-[#F5B800]">PASS</span>
                          <span className="font-display font-black text-lg mt-0.5">
                            {title.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* SECCIÓN 2: CUERPO CENTRAL (METADATOS EDITORIALES Y TÍTULO) */}
                    <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between space-y-3 min-w-0">
                      {/* Metadatos superiores en monospace 11px */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-[11px] uppercase tracking-wider text-[#64748B] font-medium truncate flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-[#F5B800]" />
                          <span>{venue.toUpperCase()} • {category.toUpperCase()}</span>
                        </span>
                        <span className="font-mono text-[10px] tracking-wider text-[#D97706] font-bold uppercase">
                          REF #{String(eventId).slice(-4)}
                        </span>
                      </div>

                      {/* Nombre del Evento */}
                      <div className="space-y-0.5">
                        <h2 className="font-display font-black text-lg sm:text-xl text-[#0F2342] uppercase tracking-tight group-hover:text-[#D97706] transition-colors leading-tight line-clamp-2">
                          {title}
                        </h2>
                      </div>

                      {/* Pie: Organización */}
                      <div className="pt-2 flex items-center justify-between text-xs border-t border-[#F1F5F9]">
                        <span className="font-mono text-[10px] text-[#64748B] uppercase tracking-wider truncate">
                          Organizado por {orgName}
                        </span>
                      </div>
                    </div>

                    {/* DIVISIÓN DE TALÓN (STUB) CON MUESCAS Y LÍNEA DISCONTINUA */}
                    <div className="relative hidden md:flex items-center justify-center">
                      <span
                        aria-hidden="true"
                        className="absolute -top-3 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[#F8F9FA] border border-[#F5B800]/40 z-10"
                      />
                      <span
                        aria-hidden="true"
                        className="h-full w-px border-l border-dashed border-[#CBD5E1]"
                      />
                      <span
                        aria-hidden="true"
                        className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[#F8F9FA] border border-[#F5B800]/40 z-10"
                      />
                    </div>

                    {/* SECCIÓN 3: TALÓN DERECHO (FECHA DE GIRA + ESTADO + GESTIONAR) */}
                    <div className="w-full md:w-[190px] lg:w-[210px] p-4 sm:p-5 bg-[#FAFAFA] border-t md:border-t-0 border-[#E2E8F0] flex flex-row md:flex-col justify-between items-center md:items-start gap-3 shrink-0">
                      <div>
                        {/* Fecha de Gira: Día y Mes en Display Grande + Año debajo */}
                        <div className="font-display font-black text-xl sm:text-2xl text-[#0F2342] tracking-tight leading-none uppercase">
                          {dayMonth}
                        </div>
                        <div className="font-mono text-xs text-[#64748B] tracking-wider mt-0.5">
                          {year}
                        </div>
                      </div>

                      {/* Estado: Punto sólido 6px #F5B800 + texto en tracking ancho */}
                      <div className="flex items-center gap-2">
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: status.dotColor }}
                          aria-hidden="true"
                        />
                        <span className="font-mono text-[10px] uppercase tracking-[0.14em] font-bold text-[#0F2342]">
                          {status.label}
                        </span>
                      </div>

                      {/* Enlace Tipográfico con Subrayado en Hover */}
                      <div className="pt-1">
                        <span className="font-mono text-xs font-bold text-[#0F2342] group-hover:text-[#D97706] border-b border-[#F5B800]/40 group-hover:border-[#F5B800] transition-all inline-flex items-center gap-1 cursor-pointer">
                          <span>Gestionar →</span>
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
