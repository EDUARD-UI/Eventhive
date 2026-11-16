import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiAward,
  FiZap,
  FiCheckCircle,
  FiStar,
  FiDollarSign,
  FiAlertCircle,
  FiMapPin,
  FiArrowRight,
  FiLayers,
  FiClock,
  FiCompass,
  FiShare2,
  FiArrowLeft,
  FiInfo,
} from 'react-icons/fi';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import {
  showSuccessAlert,
  showErrorAlert,
  showWarningAlert,
  showInfoAlert,
  showConfirmAlert,
} from '../../utils/alertUtils.js';
import { organizerService } from '../../services/organizerService.js';
import { promotionPlanService } from '../../services/promotionPlanService.js';
import StatCard from '../../components/Shared/StatCard.jsx';
import Badge from '../../components/Shared/Badge.jsx';
import PlanCard from '../../components/Shared/PlanCard.jsx';
import Pagination from '../../components/Shared/Pagination.jsx';
import { formatPrice, formatFecha, formatHora12 } from '../../utils/formatters.js';

const EVENTOS_POR_PAGINA = 6;

// Pin temático ámbar para el mapa de posicionamiento cultural
const positionPinIcon = () =>
  L.divIcon({
    className: 'custom-posicionamiento-pin',
    html: `
      <div style="position: relative; width: 34px; height: 42px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 4px 10px rgba(245,158,11,0.6));">
        <svg viewBox="0 0 34 42" width="34" height="42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 0C7.61 0 0 7.61 0 17C0 27.5 14.5 40.5 16.1 41.9C16.6 42.3 17.4 42.3 17.9 41.9C19.5 40.5 34 27.5 34 17C34 7.61 26.39 0 17 0Z" fill="#F59E0B" stroke="#0B1B3D" stroke-width="2"/>
          <circle cx="17" cy="17" r="5" fill="#0B1B3D"/>
          <circle cx="17" cy="17" r="2.5" fill="#FCD34D"/>
        </svg>
      </div>
    `,
    iconSize: [34, 42],
    iconAnchor: [17, 42],
    popupAnchor: [0, -42],
  });

function MapReloader({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && !isNaN(center[0]) && !isNaN(center[1])) {
      map.setView(center, 15);
      map.invalidateSize();
    }
  }, [center, map]);
  return null;
}

export default function PosicionamientoView({ onPromotionSuccess }) {
  const navigate = useNavigate();
  const [allEventos, setAllEventos] = useState([]);
  const [loadingEventos, setLoadingEventos] = useState(true);
  const [loadingPlanes, setLoadingPlanes] = useState(true);
  const [selectedEventoId, setSelectedEventoId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [planes, setPlanes] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [procesando, setProcesando] = useState(false);

  // Cargar planes de promoción reales desde el backend (GET /api/promociones/planes)
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

  // Cargar todos los eventos del organizador
  const loadEventos = async () => {
    setLoadingEventos(true);
    try {
      const items = await organizerService.getTodosEventosOrganizador();
      setAllEventos(items || []);
      setCurrentPage(1);

      // Eventos elegibles: PUBLICADO y que NO tengan promoción activa
      const elegibles = (items || []).filter(
        (ev) =>
          ev.estado === 'PUBLICADO' &&
          !ev.promocionado &&
          !ev.destacado &&
          !ev.urlImagenDestacado
      );

      if (elegibles.length > 0 && !selectedEventoId) {
        setSelectedEventoId(String(elegibles[0].id));
      }
    } catch (err) {
      console.warn('Error cargando eventos:', err);
      setAllEventos([]);
    } finally {
      setLoadingEventos(false);
    }
  };

  useEffect(() => {
    loadEventos();
  }, []);

  // Eventos estrictamente PUBLICADOS
  const eventosPublicados = useMemo(() => {
    return allEventos.filter((ev) => ev.estado === 'PUBLICADO');
  }, [allEventos]);

  // Eventos elegibles para contratar promoción (PUBLICADO, no promocionado)
  const eventosElegibles = useMemo(() => {
    return eventosPublicados.filter(
      (ev) =>
        !ev.promocionado &&
        !ev.destacado &&
        !ev.urlImagenDestacado &&
        !ev.url_imagen_destacado &&
        !ev.imagenPromocional
    );
  }, [eventosPublicados]);

  // Eventos actualmente promocionados
  const eventosConPromocion = useMemo(() => {
    return eventosPublicados.filter(
      (ev) =>
        Boolean(ev.promocionado) ||
        Boolean(ev.destacado) ||
        Boolean(ev.urlImagenDestacado) ||
        Boolean(ev.url_imagen_destacado) ||
        Boolean(ev.imagenPromocional)
    );
  }, [eventosPublicados]);

  const selectedEvento = eventosPublicados.find(
    (ev) => String(ev.id) === String(selectedEventoId)
  );

  const eventosPublicadosPaginados = useMemo(() => {
    const start = (currentPage - 1) * EVENTOS_POR_PAGINA;
    return eventosPublicados.slice(start, start + EVENTOS_POR_PAGINA);
  }, [eventosPublicados, currentPage]);

  // Coordenadas válidas del evento seleccionado
  const eventCoordinates = useMemo(() => {
    if (!selectedEvento) return null;
    const lat = Number(selectedEvento.latitud);
    const lng = Number(selectedEvento.longitud);
    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
      return [lat, lng];
    }
    return null;
  }, [selectedEvento]);

  // Selección directa del plan de promoción y redirección inmediata a PasarelaPagoPage
  const handleContratarDirecto = async (plan) => {
    if (!selectedEventoId) {
      showWarningAlert({
        title: 'Selecciona una producción',
        text: 'Por favor selecciona el evento publicado que deseas promocionar.',
        badge: 'Evento Requerido',
      });
      return;
    }

    if (!selectedEvento) {
      showWarningAlert({
        title: 'Evento no encontrado',
        text: 'El evento seleccionado no está disponible.',
      });
      return;
    }

    // Verificar si ya cuenta con promoción activa
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
        badge: 'Promoción Vigente',
      });
      return;
    }

    setSelectedPlan(plan);
    setProcesando(true);

    try {
      // 1. Registrar la orden pendiente en el servidor
      const inicioRes = await promotionPlanService.iniciarPagoPosicionamiento(
        selectedEvento.id,
        plan.id
      );

      const pagoId = inicioRes?.id || inicioRes?.data?.id;

      if (!pagoId) {
        throw new Error('No se pudo generar la orden de contratación en el servidor.');
      }

      // 2. Redirigir directamente a la pasarela de pagos existente
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

  return (
    <div className="space-y-6">
      {/* 1. Header Editorial Backstage */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400 bg-amber-100/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-700/40 px-2.5 py-0.5 rounded-md">
              Backstage · Visibilidad & Cartagena
            </span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2">
            <FiAward className="w-5 h-5 text-amber-500" />
            <span>Posicionamiento y Promoción de Producciones</span>
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 max-w-xl font-medium">
            Destaca tus eventos publicados en la cartelera principal y carrusel de EventHive para potenciar la venta de entradas.
          </p>
        </div>
      </div>

      {/* 2. KPIs de Presencia y Posicionamiento */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Producciones Elegibles"
          value={String(eventosElegibles.length)}
          change="Publicadas listas para destacar"
          trend="up"
          icon={FiCheckCircle}
          iconBg="bg-blue-50 dark:bg-blue-950/40"
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          label="Promociones Activas"
          value={String(eventosConPromocion.length)}
          change="Destacadas en cartelera"
          trend="up"
          icon={FiStar}
          iconBg="bg-amber-50 dark:bg-amber-950/40"
          iconColor="text-amber-600 dark:text-amber-400"
        />
        <StatCard
          label="Planes Disponibles"
          value={String(planes.length)}
          change="Opciones oficiales vigentes"
          trend="up"
          icon={FiAward}
          iconBg="bg-emerald-50 dark:bg-emerald-950/40"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
      </div>

      {/* 3. PASO 1: Selección del Evento Publicado */}
      <div className="bg-white dark:bg-[#0E1626] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-xl bg-[#0B1B3D] text-amber-300 font-display font-black text-xs flex items-center justify-center">
              1
            </span>
            <div>
              <h3 className="font-display text-sm sm:text-base font-black text-slate-900 dark:text-white">
                Selecciona la producción que deseas destacar
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Solo eventos en estado <strong>PUBLICADO</strong> sin promoción activa pueden contratar posicionamiento
              </p>
            </div>
          </div>
          {eventosPublicados.length > 0 && (
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
              {eventosElegibles.length} disponibles para contratar
            </span>
          )}
        </div>

        {loadingEventos ? (
          <div className="p-8 text-center text-xs text-slate-400">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Cargando producciones...
          </div>
        ) : eventosPublicados.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-600 dark:text-slate-300 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-700/40 rounded-2xl space-y-1">
            <FiAlertCircle size={22} className="mx-auto text-amber-600 dark:text-amber-400 mb-1" />
            <p className="font-bold text-slate-900 dark:text-white">No tienes eventos publicados en este momento</p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Para promocionar un evento, primero debe ser aprobado y publicado en la cartelera de EventHive.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {eventosPublicadosPaginados.map((ev) => {
              const isSelected = String(ev.id) === String(selectedEventoId);
              const isPromocionado = Boolean(ev.promocionado || ev.destacado || ev.urlImagenDestacado);

              return (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEventoId(String(ev.id))}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'border-[#0B1B3D] dark:border-amber-400 bg-amber-50/30 dark:bg-amber-950/20 shadow-xs ring-1 ring-[#0B1B3D]/10 dark:ring-amber-400/20'
                      : isPromocionado
                      ? 'border-amber-200 dark:border-amber-900/40 bg-white dark:bg-[#0B1428] opacity-85'
                      : 'border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-[#0B1428]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {ev.foto || ev.imagen ? (
                      <img
                        src={ev.foto || ev.imagen}
                        alt={ev.titulo}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 text-slate-400 font-bold">
                        EH
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-display text-xs font-black text-slate-900 dark:text-white truncate">
                          {ev.titulo}
                        </h4>
                        {isPromocionado && (
                          <Badge tone="active">★ Destacado Activo</Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate flex items-center gap-1">
                        <FiMapPin size={10} className="text-amber-500 shrink-0" />
                        <span className="truncate">{ev.lugar || 'Cartagena'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">{ev.fecha ? formatFecha(ev.fecha) : 'Por definir'}</span>
                    <span
                      className={`font-bold ${
                        isSelected
                          ? 'text-[#0B1B3D] dark:text-amber-400'
                          : isPromocionado
                          ? 'text-amber-600 dark:text-amber-400 font-semibold'
                          : 'text-slate-400'
                      }`}
                    >
                      {isSelected ? '✓ Seleccionado' : isPromocionado ? 'Promocionado' : 'Seleccionar'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {!loadingEventos && eventosPublicados.length > EVENTOS_POR_PAGINA && (
          <Pagination
            currentPage={currentPage}
            totalItems={eventosPublicados.length}
            pageSize={EVENTOS_POR_PAGINA}
            onPageChange={setCurrentPage}
            showPageSize={false}
          />
        )}
      </div>

      {/* 4. UBICACIÓN GEOGRÁFICA EN CARTAGENA */}
      {selectedEvento && (
        <div className="bg-white dark:bg-[#0E1626] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                <FiCompass size={15} />
              </div>
              <div>
                <h3 className="font-display text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                  Ubicación de Proyección en Cartagena: {selectedEvento.titulo}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {selectedEvento.lugar || 'Ubicación registrada para la producción'}
                </p>
              </div>
            </div>

            {eventCoordinates && (
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                <FiMapPin size={10} /> Coordenadas Activas
              </span>
            )}
          </div>

          {eventCoordinates ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 h-56 sm:h-64 w-full relative z-0 shadow-2xs">
              <MapContainer
                center={eventCoordinates}
                zoom={15}
                scrollWheelZoom={false}
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapReloader center={eventCoordinates} />
                <Marker position={eventCoordinates} icon={positionPinIcon()} />
              </MapContainer>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#070D1B] border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 italic">
              Este evento no tiene coordenadas geográficas registradas para visualizar en el mapa.
            </div>
          )}
        </div>
      )}

      {/* 5. PASO 2: Selección de Plan Oficial de Posicionamiento */}
      <div className="bg-white dark:bg-[#0E1626] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-xl bg-[#0B1B3D] text-amber-300 font-display font-black text-xs flex items-center justify-center">
              2
            </span>
            <div>
              <h3 className="font-display text-sm sm:text-base font-black text-slate-900 dark:text-white">
                Selecciona tu plan de posicionamiento
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Precios y comisiones oficiales configurados por EventHive
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            Valores oficiales en Pesos Colombianos (COP)
          </span>
        </div>

        {loadingPlanes ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Cargando planes de promoción...
          </div>
        ) : planes.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 dark:bg-[#070D1B] border border-slate-200 dark:border-slate-800 rounded-2xl">
            No hay planes de promoción activos disponibles en este momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {planes.map((plan, index) => {
              const isSelected = selectedPlan?.id === plan.id;
              const isHighlighted = Boolean(plan.premium) || (planes.length >= 3 && index === 1);
              const isEventAlreadyPromoted = Boolean(
                selectedEvento?.promocionado ||
                selectedEvento?.destacado ||
                selectedEvento?.urlImagenDestacado
              );

              return (
                <div key={plan.id || plan.codigo || index} className="flex flex-col">
                  <PlanCard
                    plan={plan}
                    isSelected={isSelected}
                    isHighlighted={isHighlighted}
                    onSelect={() => handleContratarDirecto(plan)}
                    mode="select"
                    disabled={procesando || !selectedEventoId || isEventAlreadyPromoted}
                    disabledText={
                      isEventAlreadyPromoted
                        ? 'Evento ya destacado'
                        : !selectedEventoId
                        ? 'Selecciona un evento'
                        : undefined
                    }
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
