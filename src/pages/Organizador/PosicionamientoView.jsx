import React, { useEffect, useState, useMemo } from 'react';
import {
  FiAward,
  FiZap,
  FiCheckCircle,
  FiStar,
  FiDollarSign,
  FiAlertCircle,
  FiMapPin,
  FiNavigation,
  FiArrowRight,
  FiLayers,
  FiClock,
  FiCompass,
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
import { formatPrice } from '../../utils/formatters.js';

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
  const [eventosPublicados, setEventosPublicados] = useState([]);
  const [loadingEventos, setLoadingEventos] = useState(true);
  const [loadingPlanes, setLoadingPlanes] = useState(true);
  const [selectedEventoId, setSelectedEventoId] = useState('');
  const [planes, setPlanes] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [pagoStatus, setPagoStatus] = useState(null);

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

  // Cargar exclusivamente los eventos PUBLICADOS de la organización
  const loadEventosPublicados = async () => {
    setLoadingEventos(true);
    try {
      const data = await organizerService.getEventosOrganizador({ page: 0, size: 200 });
      const items = Array.isArray(data) ? data : data?.content || data?.data || [];
      const publicados = items.filter((ev) => ev.estado === 'PUBLICADO');
      setEventosPublicados(publicados);
      if (publicados.length > 0 && !selectedEventoId) {
        setSelectedEventoId(String(publicados[0].id));
      }
    } catch (err) {
      console.warn('Error cargando eventos publicados:', err);
      setEventosPublicados([]);
    } finally {
      setLoadingEventos(false);
    }
  };

  useEffect(() => {
    loadEventosPublicados();
  }, []);

  const selectedEvento = eventosPublicados.find(
    (ev) => String(ev.id) === String(selectedEventoId)
  );

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

  // Flujo de contratación y pago con prevención estricta de doble clic
  const handleContratarPago = async (planToHire) => {
    const plan = planToHire || selectedPlan;
    if (procesando) return;

    if (!selectedEventoId) {
      showWarningAlert({
        title: 'Selecciona un evento',
        text: 'Por favor selecciona el evento publicado que deseas promocionar.',
        badge: 'Evento Requerido',
      });
      return;
    }

    if (!plan) {
      showWarningAlert({
        title: 'Selecciona un plan',
        text: 'Por favor elige un plan de promoción disponible.',
        badge: 'Plan Requerido',
      });
      return;
    }

    setSelectedPlan(plan);

    const confirmRes = await showConfirmAlert({
      title: 'Contratar Posicionamiento',
      text: `¿Deseas contratar el plan "${plan.nombre}" (${formatPrice(plan.precio)}) para destacar "${selectedEvento?.titulo || ''}" en la cartelera principal?`,
      badge: 'Confirmación de Promoción',
      confirmButtonText: 'Continuar al pago',
      cancelButtonText: 'Cancelar',
    });

    if (confirmRes !== true) return;

    setProcesando(true);
    setPagoStatus('PROCESANDO');

    try {
      const inicioRes = await promotionPlanService.iniciarPagoPosicionamiento(
        selectedEventoId,
        plan.id
      );
      const pagoId = inicioRes?.id || inicioRes?.data?.id;

      if (!pagoId) {
        throw new Error('No se pudo generar la orden de pago para la promoción.');
      }

      await promotionPlanService.confirmarPagoPosicionamiento(pagoId);
      const estadoReal = await promotionPlanService.consultarPagoPosicionamiento(pagoId);
      const estadoConfirmado = estadoReal?.estado || estadoReal?.data?.estado;

      if (estadoConfirmado === 'CONFIRMADO') {
        setPagoStatus('CONFIRMADO');
        await showSuccessAlert({
          title: '¡Posicionamiento Activo!',
          text: `El pago de la promoción para "${selectedEvento?.titulo}" ha sido confirmado exitosamente. Tu producción ahora destaca en la cartelera principal.`,
          badge: 'Promoción Confirmada',
        });
        await loadEventosPublicados();
        if (onPromotionSuccess) onPromotionSuccess();
      } else if (estadoConfirmado === 'PENDIENTE') {
        setPagoStatus('PENDIENTE');
        await showInfoAlert({
          title: 'Pago en proceso',
          text: 'La transacción permanece en estado pendiente de aprobación bancaria.',
          badge: 'En Validación',
        });
      } else {
        setPagoStatus('FALLIDO');
        await showErrorAlert({
          title: 'Transacción no completada',
          text: 'La transacción no pudo ser verificada. Intenta nuevamente.',
          badge: 'Pago Fallido',
        });
      }
    } catch (err) {
      setPagoStatus('FALLIDO');
      console.error('Error en contratación de promoción:', err);
      const isAlreadyActiveOrPending =
        err?.message?.toLowerCase().includes('posicionamiento activo') ||
        err?.message?.toLowerCase().includes('pago pendiente');

      if (isAlreadyActiveOrPending) {
        await showWarningAlert({
          title: 'Promoción vigente',
          text: err.message || 'Este evento ya cuenta con un posicionamiento activo o un pago en proceso de validación.',
        });
      } else {
        await showErrorAlert({
          title: 'Error en la operación',
          text: err?.message || 'No se pudo completar el flujo de pago de la promoción.',
        });
      }
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Editorial */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700 bg-amber-100/70 border border-amber-200/80 px-2 py-0.5 rounded-md">
              Visibilidad & Ciudad
            </span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <FiAward className="w-5 h-5 text-amber-500" />
            <span>Posicionamiento y Promoción Cultural</span>
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 max-w-xl font-medium">
            Potencia el alcance de tus eventos publicados en Cartagena a través de los planes de posicionamiento destacados de EventHive.
          </p>
        </div>
      </div>

      {/* 2. KPIs de Presencia y Posicionamiento */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Eventos Publicados Elegibles"
          value={String(eventosPublicados.length)}
          change="Producciones en cartelera"
          trend="up"
          icon={FiCheckCircle}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          label="Promociones Activas"
          value={String(eventosConPromocion.length)}
          change="Eventos destacados en plataforma"
          trend="up"
          icon={FiStar}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          label="Planes Disponibles"
          value={String(planes.length)}
          change="Opciones oficiales vigentes"
          trend="up"
          icon={FiAward}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
      </div>

      {/* 3. PASO 1: Selección del Evento Publicado */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-xl bg-[#0B1B3D] text-amber-300 font-display font-black text-xs flex items-center justify-center">
              1
            </span>
            <div>
              <h3 className="font-display text-sm sm:text-base font-black text-slate-900">
                Selecciona la producción que deseas destacar
              </h3>
              <p className="text-xs text-slate-500">
                Solo eventos en estado <strong>PUBLICADO</strong> pueden adquirir planes de promoción
              </p>
            </div>
          </div>
          {eventosPublicados.length > 0 && (
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {eventosPublicados.length} disponibles
            </span>
          )}
        </div>

        {loadingEventos ? (
          <div className="p-8 text-center text-xs text-slate-400">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Cargando eventos publicados...
          </div>
        ) : eventosPublicados.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-600 bg-amber-50/60 border border-amber-200/70 rounded-2xl space-y-1">
            <FiAlertCircle size={22} className="mx-auto text-amber-600 mb-1" />
            <p className="font-bold text-slate-900">No tienes eventos publicados en este momento</p>
            <p className="text-[11px] text-slate-600">
              Para promocionar un evento, primero debes tenerlo publicado en la cartelera de EventHive.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {eventosPublicados.map((ev) => {
              const isSelected = String(ev.id) === String(selectedEventoId);
              const isPromocionado = Boolean(ev.promocionado || ev.destacado);

              return (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEventoId(String(ev.id))}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'border-[#0B1B3D] bg-amber-50/20 shadow-xs ring-1 ring-[#0B1B3D]/10'
                      : 'border-slate-200/90 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {ev.foto || ev.imagen ? (
                      <img
                        src={ev.foto || ev.imagen}
                        alt={ev.titulo}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400 font-bold">
                        EH
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-display text-xs font-black text-slate-900 truncate">
                          {ev.titulo}
                        </h4>
                        {isPromocionado && (
                          <Badge tone="active">★ Destacado</Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate flex items-center gap-1">
                        <FiMapPin size={10} className="text-amber-500 shrink-0" />
                        <span className="truncate">{ev.lugar || 'Cartagena'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">{ev.fecha}</span>
                    <span
                      className={`font-bold ${
                        isSelected ? 'text-[#0B1B3D]' : 'text-slate-400'
                      }`}
                    >
                      {isSelected ? '✓ Seleccionado' : 'Seleccionar'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. UBICACIÓN GEOGRÁFICA EN CARTAGENA */}
      {selectedEvento && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                <FiCompass size={15} />
              </div>
              <div>
                <h3 className="font-display text-xs sm:text-sm font-black text-slate-900">
                  Ubicación de Proyección en Cartagena: {selectedEvento.titulo}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {selectedEvento.lugar || 'Ubicación registrada para la producción'}
                </p>
              </div>
            </div>

            {eventCoordinates && (
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                <FiMapPin size={10} /> Coordenadas Activas
              </span>
            )}
          </div>

          {eventCoordinates ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200 h-56 sm:h-64 w-full relative z-0 shadow-2xs">
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
            <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500 italic">
              Este evento no tiene coordenadas geográficas registradas para visualizar en el mapa.
            </div>
          )}
        </div>
      )}

      {/* 5. PASO 2: Selección y Contratación de Plan */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-xl bg-[#0B1B3D] text-amber-300 font-display font-black text-xs flex items-center justify-center">
              2
            </span>
            <div>
              <h3 className="font-display text-sm sm:text-base font-black text-slate-900">
                Selecciona tu plan de posicionamiento
              </h3>
              <p className="text-xs text-slate-500">
                Compara los niveles de visibilidad para tu evento en la plataforma
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            Precios oficiales en Pesos Colombianos (COP)
          </span>
        </div>

        {loadingPlanes ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Cargando planes de promoción...
          </div>
        ) : planes.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-2xl">
            No hay planes de promoción activos disponibles en este momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {planes.map((plan, index) => {
              const isSelected = selectedPlan?.id === plan.id;
              const isHighlighted = Boolean(plan.premium) || (planes.length >= 3 && index === 1);

              return (
                <div key={plan.id || plan.codigo || index} className="flex flex-col">
                  <PlanCard
                    plan={plan}
                    isSelected={isSelected}
                    isHighlighted={isHighlighted}
                    onSelect={() => handleContratarPago(plan)}
                    mode="select"
                  />
                  <div className="mt-2.5">
                    <button
                      type="button"
                      onClick={() => handleContratarPago(plan)}
                      disabled={procesando || !selectedEventoId}
                      className={`w-full py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                        isHighlighted
                          ? 'bg-[#0B1B3D] hover:bg-slate-900 text-amber-300 shadow-xs'
                          : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-2xs'
                      }`}
                    >
                      {procesando && isSelected ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />
                          <span>Procesando pago...</span>
                        </>
                      ) : (
                        <>
                          <FiZap size={14} />
                          <span>Contratar {plan.nombre}</span>
                        </>
                      )}
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
