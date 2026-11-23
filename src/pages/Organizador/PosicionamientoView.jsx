import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiCheck,
  FiMapPin,
  FiAlertCircle,
} from 'react-icons/fi';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import {
  showErrorAlert,
  showWarningAlert,
} from '../../utils/alertUtils.js';
import { organizerService } from '../../services/organizerService.js';
import { promotionPlanService } from '../../services/promotionPlanService.js';
import Pagination from '../../components/Shared/Pagination.jsx';
import { formatPrice, formatFecha } from '../../utils/formatters.js';

const EVENTOS_POR_PAGINA = 6;
const CARTAGENA_DEFAULT = [10.3910, -75.4794];

// Pin temático ámbar para el mapa
const positionPinIcon = () =>
  L.divIcon({
    className: 'custom-posicionamiento-pin',
    html: `
      <div style="position: relative; width: 32px; height: 40px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 4px 8px rgba(15,35,66,0.3));">
        <svg viewBox="0 0 34 42" width="32" height="40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 0C7.61 0 0 7.61 0 17C0 27.5 14.5 40.5 16.1 41.9C16.6 42.3 17.4 42.3 17.9 41.9C19.5 40.5 34 27.5 34 17C34 7.61 26.39 0 17 0Z" fill="#F5B800" stroke="#0F2342" stroke-width="2"/>
          <circle cx="17" cy="17" r="5" fill="#0F2342"/>
        </svg>
      </div>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
  });

function MapReloader({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && !isNaN(center[0]) && !isNaN(center[1])) {
      map.setView(center, 14);
      map.invalidateSize();
    }
  }, [center, map]);
  return null;
}

export default function PosicionamientoView() {
  const navigate = useNavigate();
  const [allEventos, setAllEventos] = useState([]);
  const [loadingEventos, setLoadingEventos] = useState(true);
  const [loadingPlanes, setLoadingPlanes] = useState(true);
  const [selectedEventoId, setSelectedEventoId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [planes, setPlanes] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [procesando, setProcesando] = useState(false);

  // Cargar planes reales desde el backend
  useEffect(() => {
    let isMounted = true;
    setLoadingPlanes(true);
    promotionPlanService
      .getPlanesPublicos()
      .then((loadedPlanes) => {
        if (!isMounted) return;
        setPlanes(loadedPlanes || []);
        if (loadedPlanes && loadedPlanes.length > 0) {
          setSelectedPlan(loadedPlanes[0]);
        }
      })
      .catch((err) => {
        console.warn('Error al cargar planes de promoción del backend:', err);
        setPlanes([]);
      })
      .finally(() => {
        if (isMounted) setLoadingPlanes(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const loadEventos = async () => {
    setLoadingEventos(true);
    try {
      const items = await organizerService.getTodosEventosOrganizador();
      setAllEventos(items || []);
      setCurrentPage(1);

      const elegibles = (items || []).filter(
        (ev) =>
          ev.estado === 'PUBLICADO' &&
          !ev.promocionado &&
          !ev.destacado &&
          !ev.urlImagenDestacado
      );

      if (elegibles.length > 0) {
        setSelectedEventoId(String(elegibles[0].id));
      } else if (items && items.length > 0) {
        setSelectedEventoId(String(items[0].id));
      }
    } catch (err) {
      console.warn('Error al cargar eventos del organizador:', err);
      setAllEventos([]);
    } finally {
      setLoadingEventos(false);
    }
  };

  useEffect(() => {
    loadEventos();
  }, []);

  // Eventos en estado PUBLICADO
  const eventosPublicados = useMemo(() => {
    return allEventos.filter((ev) => ev.estado === 'PUBLICADO');
  }, [allEventos]);

  // Eventos elegibles sin promoción
  const eventosElegibles = useMemo(() => {
    return eventosPublicados.filter(
      (ev) => !ev.promocionado && !ev.destacado && !ev.urlImagenDestacado
    );
  }, [eventosPublicados]);

  // Eventos con promoción activa
  const eventosConPromocion = useMemo(() => {
    return eventosPublicados.filter(
      (ev) => ev.promocionado || ev.destacado || ev.urlImagenDestacado
    );
  }, [eventosPublicados]);

  const eventosPublicadosPaginados = useMemo(() => {
    const startIndex = (currentPage - 1) * EVENTOS_POR_PAGINA;
    return eventosPublicados.slice(startIndex, startIndex + EVENTOS_POR_PAGINA);
  }, [eventosPublicados, currentPage]);

  const selectedEvento = useMemo(() => {
    return allEventos.find((ev) => String(ev.id) === String(selectedEventoId)) || null;
  }, [allEventos, selectedEventoId]);

  // Coordenadas con validación numérica estricta y fallback
  const eventCoordinates = useMemo(() => {
    if (!selectedEvento) return null;
    const lat = Number(selectedEvento.latitud ?? selectedEvento.latitude);
    const lng = Number(selectedEvento.longitud ?? selectedEvento.longitude);
    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
      return [lat, lng];
    }
    return null;
  }, [selectedEvento]);

  const mapCenter = eventCoordinates || CARTAGENA_DEFAULT;

  const handleContratarDirecto = async (plan) => {
    if (procesando) return;

    if (!selectedEvento) {
      await showWarningAlert({
        title: 'Selecciona una producción',
        text: 'Debes seleccionar primero un evento publicado para aplicar el plan de posicionamiento.',
      });
      return;
    }

    const isAlreadyPromoted = Boolean(
      selectedEvento.promocionado ||
      selectedEvento.destacado ||
      selectedEvento.urlImagenDestacado ||
      selectedEvento.url_imagen_destacado ||
      selectedEvento.imagenPromocional
    );

    if (isAlreadyPromoted) {
      showWarningAlert({
        title: 'Producción ya promocionada',
        text: `"${selectedEvento.titulo}" ya cuenta con un plan de posicionamiento activo en la cartelera principal.`,
      });
      return;
    }

    setSelectedPlan(plan);
    setProcesando(true);

    try {
      const inicioRes = await promotionPlanService.iniciarPagoPosicionamiento(
        selectedEvento.id,
        plan.id
      );

      const pagoId = inicioRes?.id || inicioRes?.data?.id;

      if (!pagoId) {
        throw new Error('No se pudo generar la orden de contratación en el servidor.');
      }

      navigate('/pago', {
        state: {
          tipoOperacion: 'PROMOCION_EVENTO',
          event: selectedEvento,
          plan,
          pagoId,
        },
      });
    } catch (err) {
      console.error('Error al iniciar pago de posicionamiento:', err);
      const errorMsg = err?.message || '';
      const isAlreadyActiveOrPending =
        errorMsg.toLowerCase().includes('posicionamiento activo') ||
        errorMsg.toLowerCase().includes('pago pendiente') ||
        errorMsg.toLowerCase().includes('ya cuenta con');

      if (isAlreadyActiveOrPending) {
        await showWarningAlert({
          title: 'Promoción existente',
          text: errorMsg || 'Este evento ya cuenta con un posicionamiento activo o un pago en proceso de validación.',
        });
      } else {
        await showErrorAlert({
          title: 'No se pudo iniciar el proceso de pago',
          text: errorMsg || 'Ocurrió un inconveniente al conectar con la pasarela. Intenta nuevamente.',
        });
      }
    } finally {
      setProcesando(false);
    }
  };

  // Normalizar los 3 planes editoriales requeridos
  const displayPlanes = useMemo(() => {
    if (planes.length >= 3) return planes.slice(0, 3);
    const fallbacks = [
      {
        id: 'plan-impulso',
        nombre: 'Plan Impulso',
        precio: 350000,
        detallePublicidad: 'Presencia en carrusel de novedades, etiqueta destacada en listados generales, notificación semanal a asistentes.',
        beneficios: [
          'Presencia en carrusel de novedades',
          'Etiqueta destacada en listados generales',
          'Notificación semanal a asistentes afines',
        ],
      },
      {
        id: 'plan-amplificado',
        nombre: 'Plan Amplificado',
        precio: 650000,
        detallePublicidad: 'Ubicación preferencial en cartelera principal, banner rotativo en mapa de calor, mención en redes oficiales.',
        beneficios: [
          'Ubicación preferencial en cartelera principal',
          'Banner rotativo en mapa de calor cultural',
          'Mención oficial en radar de experiencias',
          'Soporte prioritario de boletaje',
        ],
      },
      {
        id: 'plan-total',
        nombre: 'Plan Exposición Total',
        precio: 1000000,
        detallePublicidad: 'Máxima visibilidad en portada completa, push notifications geolocalizadas, apertura destacada en cartelera.',
        beneficios: [
          'Máxima visibilidad en portada y cabecera completa',
          'Push notifications geolocalizadas en Cartagena',
          'Apertura destacada en cartelera y mapa en vivo',
          'Reporte semanal de conversión y taquilla',
        ],
      },
    ];

    if (!planes.length) return fallbacks;
    return fallbacks.map((fb, idx) => ({ ...fb, ...(planes[idx] || {}) }));
  }, [planes]);

  return (
    <div className="space-y-8 select-none">
      {/* 1. Cabecera Minimalista */}
      <div className="border-b border-[#E2E8F0] pb-6 space-y-2">
        <h1 className="font-display font-black text-[clamp(1.5rem,4vw,2.5rem)] text-[#0F2342] tracking-tight uppercase leading-none">
          Posicionamiento
        </h1>
        <p className="text-xs font-mono uppercase tracking-wider text-[#64748B] pt-1">
          Amplifica el alcance de tus producciones en la cartelera principal y el radar de la ciudad
        </p>
      </div>

      {/* 2. Barra de Resumen en Línea (Grid 2 columnas en móvil, 3 en escritorio) */}
      <div className="rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] p-4 sm:p-5 overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-3 divide-x divide-[#E2E8F0]">
          <div className="px-2 sm:px-4 first:pl-0">
            <span className="font-mono font-black text-xl sm:text-2xl text-[#0F2342] tabular-nums">
              {eventosElegibles.length}
            </span>
            <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-[#64748B] block sm:inline sm:ml-2 font-bold">
              Producciones Elegibles
            </span>
          </div>

          <div className="px-2 sm:px-4">
            <span className="font-mono font-black text-xl sm:text-2xl text-[#0F2342] tabular-nums">
              {eventosConPromocion.length}
            </span>
            <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-[#64748B] block sm:inline sm:ml-2 font-bold">
              Promoción Activa
            </span>
          </div>

          <div className="col-span-2 md:col-span-1 px-2 sm:px-4 pt-2 md:pt-0 border-t md:border-t-0 md:border-l border-[#E2E8F0]">
            <span className="font-mono font-black text-xl sm:text-2xl text-[#0F2342] tabular-nums">
              {displayPlanes.length}
            </span>
            <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-[#64748B] block sm:inline sm:ml-2 font-bold">
              Planes Disponibles
            </span>
          </div>
        </div>
      </div>

      {/* 3. PASO 01: Selección de Producción + Mapa de Proyección (Grid 60% / 40%) */}
      <div className="space-y-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#64748B] block">
            PASO 01
          </span>
          <h2 className="font-display font-black text-xl text-[#0F2342] uppercase tracking-tight">
            Selección de Producción & Cobertura
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Columna Izquierda (60%): Cartelera Elegible en Formato Mini-Ticket */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-3">
            {loadingEventos ? (
              <div className="p-12 text-center text-xs font-mono text-[#64748B] bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px]">
                <div className="w-6 h-6 border-2 border-[#0F2342] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                CONSULTANDO CARTELERA...
              </div>
            ) : eventosPublicados.length === 0 ? (
              <div className="p-8 text-center bg-[#FFFFFF] border border-dashed border-[#CBD5E1] rounded-[2px] space-y-2">
                <FiAlertCircle size={20} className="mx-auto text-[#64748B]" />
                <p className="font-mono text-xs font-bold text-[#0F2342] uppercase">
                  No hay producciones publicadas
                </p>
                <p className="font-mono text-[11px] text-[#64748B]">
                  Para contratar posicionamiento, la producción debe estar previamente publicada.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {eventosPublicadosPaginados.map((ev) => {
                  const isSelected = String(ev.id) === String(selectedEventoId);
                  const isPromocionado = Boolean(ev.promocionado || ev.destacado || ev.urlImagenDestacado);

                  return (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEventoId(String(ev.id))}
                      className={`relative p-3.5 rounded-[2px] border transition-all cursor-pointer bg-[#FFFFFF] flex items-center justify-between gap-4 overflow-hidden ${
                        isSelected
                          ? 'border-[#0F2342] shadow-xs'
                          : 'border-[#E2E8F0] hover:border-[#64748B]'
                      }`}
                    >
                      {/* Barra vertical izquierda de 4px en #F5B800 si está seleccionado */}
                      {isSelected && (
                        <span
                          className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#F5B800]"
                          aria-hidden="true"
                        />
                      )}

                      <div className="flex items-center gap-3.5 min-w-0 pl-1">
                        {/* Póster a todo color (48px x 48px) */}
                        <div className="w-12 h-12 rounded-[2px] border border-[#E2E8F0] bg-[#F8F9FA] overflow-hidden shrink-0">
                          {ev.foto || ev.imagen ? (
                            <img
                              src={ev.foto || ev.imagen}
                              alt={ev.titulo}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#0F2342] text-white font-mono text-xs font-bold">
                              {ev.titulo?.slice(0, 2).toUpperCase() || 'EH'}
                            </div>
                          )}
                        </div>

                        {/* Metadatos en tipografía monoespaciada */}
                        <div className="min-w-0 flex-1">
                          <h4 className="font-display font-black text-sm text-[#0F2342] uppercase truncate leading-tight">
                            {ev.titulo}
                          </h4>
                          <p className="font-mono text-[10px] text-[#64748B] truncate mt-0.5">
                            {ev.lugar || 'Cartagena'} • {ev.fecha ? formatFecha(ev.fecha) : 'Por confirmar'}
                          </p>
                        </div>
                      </div>

                      {/* Estado */}
                      <div className="shrink-0 text-right pr-1">
                        {isPromocionado ? (
                          <span className="font-mono text-[10px] uppercase tracking-wider text-[#F5B800] font-bold">
                            ★ Activo
                          </span>
                        ) : isSelected ? (
                          <span className="font-mono text-[10px] uppercase tracking-wider text-[#0F2342] font-bold flex items-center gap-1">
                            <FiCheck size={12} className="text-[#F5B800]" />
                            <span>Listo</span>
                          </span>
                        ) : (
                          <span className="font-mono text-[10px] uppercase tracking-wider text-[#94A3B8]">
                            Elegible
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!loadingEventos && eventosPublicados.length > EVENTOS_POR_PAGINA && (
              <div className="pt-2 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalItems={eventosPublicados.length}
                  pageSize={EVENTOS_POR_PAGINA}
                  onPageChange={setCurrentPage}
                  showPageSize={false}
                />
              </div>
            )}
          </div>

          {/* Columna Derecha (40%): Mapa de Cobertura */}
          <div className="lg:col-span-5 xl:col-span-5 w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] overflow-hidden">
            <div className="h-64 sm:h-72 w-full relative z-0">
              <MapContainer
                center={mapCenter}
                zoom={14}
                scrollWheelZoom={false}
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapReloader center={mapCenter} />
                {eventCoordinates && (
                  <Marker position={eventCoordinates} icon={positionPinIcon()} />
                )}
              </MapContainer>
            </div>

            {/* Texto inferior en monospace sin badge verde */}
            <div className="p-3.5 border-t border-[#E2E8F0] bg-[#FFFFFF] font-mono text-[11px] text-[#64748B] uppercase tracking-wider truncate">
              {eventCoordinates && selectedEvento
                ? `UBICACIÓN DE PROYECCIÓN: ${selectedEvento.titulo} — ${selectedEvento.lugar || 'CARTAGENA'}`
                : 'UBICACIÓN GENERAL: CARTAGENA DE INDIAS'}
            </div>
          </div>
        </div>
      </div>

      {/* 4. PASO 02: Selección de Plan (Grid de 3 Columnas) */}
      <div className="space-y-4 pt-4 border-t border-[#E2E8F0]">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#64748B] block">
            PASO 02
          </span>
          <h2 className="font-display font-black text-xl text-[#0F2342] uppercase tracking-tight">
            Selección de Plan de Posicionamiento
          </h2>
        </div>

        {loadingPlanes ? (
          <div className="p-16 text-center text-xs font-mono text-[#64748B] bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px]">
            <div className="w-6 h-6 border-2 border-[#0F2342] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            CONSULTANDO PLANES DE PROMOCIÓN...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 items-stretch">
            {displayPlanes.map((plan, idx) => {
              const isFirst = idx === 0;
              const isSecond = idx === 1;
              const isThird = idx === 2;
              const isSelected = selectedPlan?.id === plan.id;
              const isEventAlreadyPromoted = Boolean(
                selectedEvento?.promocionado ||
                selectedEvento?.destacado ||
                selectedEvento?.urlImagenDestacado
              );

              const benefitsList = plan.beneficios || [
                plan.detallePublicidad || 'Posicionamiento en la plataforma',
                'Reportes de rendimiento en vivo',
                'Presencia destacada en cartelera',
              ];

              if (isFirst) {
                // Plan 1 — Impulso (Nivel Base — Blanco):
                // Fondo: Blanco Puro (#FFFFFF)
                // Borde: 1px solid #E2E8F0 (border-radius: 2px)
                // Tipografía: Título y precio en Azul Institucional (#0F2342), textos secundarios en Gris Pizarra (#64748B)
                // Botón: Rectangular con borde 1px solid #0F2342, fondo #FFFFFF y texto #0F2342 (o sólido #0F2342 con texto blanco cuando esté seleccionado)
                return (
                  <div
                    key={plan.id || idx}
                    className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] p-6 sm:p-7 flex flex-col justify-between space-y-6 transition-all select-none"
                  >
                    <div className="space-y-4">
                      <div>
                        <span className="font-mono text-[11px] uppercase tracking-wider text-[#64748B] block">
                          TIER 01 · BASE
                        </span>
                        <h3 className="font-display font-black text-xl text-[#0F2342] uppercase tracking-tight mt-1">
                          {plan.nombre}
                        </h3>
                        <p className="font-mono text-xs text-[#64748B] mt-1">
                          Posicionamiento oficial por producción
                        </p>
                      </div>

                      <div className="py-2 border-y border-[#E2E8F0]">
                        <span className="font-mono font-black text-3xl text-[#0F2342] tracking-tight block tabular-nums">
                          {formatPrice(plan.precio)}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-wider text-[#94A3B8] block mt-0.5">
                          COP / Producción
                        </span>
                      </div>

                      <ul className="pt-2 border-t border-[#E2E8F0] space-y-2.5 text-xs font-mono text-[#64748B]">
                        {benefitsList.map((ben, bIdx) => (
                          <li key={bIdx} className="flex items-start gap-2.5">
                            <span className="text-[#0F2342] font-bold shrink-0">—</span>
                            <span>{ben}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-6">
                      <button
                        type="button"
                        onClick={() => handleContratarDirecto(plan)}
                        disabled={procesando || !selectedEventoId || isEventAlreadyPromoted}
                        className={`w-full py-3 rounded-[2px] font-mono text-xs uppercase tracking-wider font-bold transition-all cursor-pointer disabled:opacity-50 border border-[#0F2342] ${
                          isSelected
                            ? 'bg-[#0F2342] text-white'
                            : 'bg-[#FFFFFF] hover:bg-[#F8F9FA] text-[#0F2342]'
                        }`}
                      >
                        {procesando && selectedPlan?.id === plan.id
                          ? 'Procesando...'
                          : isEventAlreadyPromoted
                          ? 'Producción ya destacada'
                          : isSelected
                          ? 'Plan Seleccionado →'
                          : 'Contratar Plan'}
                      </button>
                    </div>
                  </div>
                );
              }

              if (isSecond) {
                // Plan 2 — Amplificado (Nivel Intermedio — Azul Institucional):
                // Fondo: Azul Institucional Event Hive (#0F2342)
                // Borde: 1px solid #0F2342 (border-radius: 2px)
                // Tipografía: Título en Blanco Puro (#FFFFFF), precio destacado en Amarillo (#F5B800), lista de beneficios en blanco suave (#E2E8F0) con guiones en #F5B800
                // Botón: Rectangular sólido en Blanco (#FFFFFF) con texto en Azul Institucional (#0F2342) y tipografía en negrita
                return (
                  <div
                    key={plan.id || idx}
                    className="w-full bg-[#0F2342] text-white border border-[#0F2342] rounded-[2px] p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-md transition-all select-none"
                  >
                    <div className="space-y-4">
                      <div>
                        <span className="font-mono text-[11px] uppercase tracking-wider text-[#F5B800] font-bold block">
                          TIER 02 · INTERMEDIO
                        </span>
                        <h3 className="font-display font-black text-xl text-[#FFFFFF] uppercase tracking-tight mt-1">
                          {plan.nombre}
                        </h3>
                        <p className="font-mono text-xs text-slate-300 mt-1">
                          Posicionamiento oficial por producción
                        </p>
                      </div>

                      <div className="py-2 border-y border-white/10">
                        <span className="font-mono font-black text-3xl text-[#F5B800] tracking-tight block tabular-nums">
                          {formatPrice(plan.precio)}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-wider text-slate-300 block mt-0.5">
                          COP / Producción
                        </span>
                      </div>

                      <ul className="pt-2 border-t border-white/10 space-y-2.5 text-xs font-mono text-[#E2E8F0]">
                        {benefitsList.map((ben, bIdx) => (
                          <li key={bIdx} className="flex items-start gap-2.5">
                            <span className="text-[#F5B800] font-bold shrink-0">—</span>
                            <span>{ben}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-6">
                      <button
                        type="button"
                        onClick={() => handleContratarDirecto(plan)}
                        disabled={procesando || !selectedEventoId || isEventAlreadyPromoted}
                        className="w-full py-3 rounded-[2px] bg-[#FFFFFF] hover:bg-slate-100 text-[#0F2342] font-mono text-xs uppercase tracking-wider font-bold transition-all cursor-pointer disabled:opacity-50 border border-white shadow-xs"
                      >
                        {procesando && selectedPlan?.id === plan.id
                          ? 'Procesando...'
                          : isEventAlreadyPromoted
                          ? 'Producción ya destacada'
                          : isSelected
                          ? 'Plan Seleccionado →'
                          : 'Contratar Plan'}
                      </button>
                    </div>
                  </div>
                );
              }

              // Plan 3 — Exposición Total (Nivel Máximo — Amarillo Ámbar):
              // Fondo: Amarillo Ámbar Vibrante (#F5B800) con acento de borde superior en Dorado Ámbar profundo (#B45309)
              // Borde: 1px solid #D97706 (border-radius: 2px)
              // Tipografía: Título, precio y beneficios en Azul Institucional profundo (#0F2342) para garantizar contraste AAA de lectura impecable
              // Botón: Rectangular sólido en Azul Institucional (#0F2342) con texto en Blanco Puro (#FFFFFF)
              return (
                <div
                  key={plan.id || idx}
                  className="w-full bg-[#F5B800] border border-[#D97706] border-t-4 border-t-[#B45309] rounded-[2px] p-6 sm:p-7 flex flex-col justify-between space-y-6 text-[#0F2342] shadow-lg transition-all select-none relative"
                >
                  <div className="space-y-4">
                    <div>
                      <span className="font-mono text-[11px] uppercase tracking-wider text-[#0F2342]/80 font-bold block">
                        TIER 03 · MÁXIMO
                      </span>
                      <h3 className="font-display font-black text-xl text-[#0F2342] uppercase tracking-tight mt-1">
                        {plan.nombre}
                      </h3>
                      <p className="font-mono text-xs text-[#0F2342]/80 mt-1 font-medium">
                        Posicionamiento oficial por producción
                      </p>
                    </div>

                    <div className="py-2 border-y border-[#D97706]/40">
                      <span className="font-mono font-black text-3xl text-[#0F2342] tracking-tight block tabular-nums">
                        {formatPrice(plan.precio)}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[#0F2342]/70 font-bold block mt-0.5">
                        COP / Producción
                      </span>
                    </div>

                    <ul className="pt-2 border-t border-[#D97706]/40 space-y-2.5 text-xs font-mono text-[#0F2342] font-medium">
                      {benefitsList.map((ben, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2.5">
                          <span className="text-[#0F2342] font-black shrink-0">—</span>
                          <span>{ben}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6">
                    <button
                      type="button"
                      onClick={() => handleContratarDirecto(plan)}
                      disabled={procesando || !selectedEventoId || isEventAlreadyPromoted}
                      className="w-full py-3 rounded-[2px] bg-[#0F2342] hover:bg-[#1B365D] text-white font-mono text-xs uppercase tracking-wider font-bold transition-all cursor-pointer disabled:opacity-50 border border-[#0F2342] shadow-sm"
                    >
                      {procesando && selectedPlan?.id === plan.id
                        ? 'Procesando...'
                        : isEventAlreadyPromoted
                        ? 'Producción ya destacada'
                        : isSelected
                        ? 'Plan Seleccionado →'
                        : 'Contratar Plan'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
