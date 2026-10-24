import React, { useEffect, useState, useMemo } from 'react';
import {
  FiAward,
  FiZap,
  FiCheckCircle,
  FiTrendingUp,
  FiCheck,
  FiShield,
  FiArrowRight,
  FiRefreshCw,
  FiStar,
  FiDollarSign,
  FiAlertCircle,
} from 'react-icons/fi';
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

export default function PosicionamientoView({ onPromotionSuccess }) {
  const [eventosPublicados, setEventosPublicados] = useState([]);
  const [loadingEventos, setLoadingEventos] = useState(true);
  const [loadingPlanes, setLoadingPlanes] = useState(true);
  const [selectedEventoId, setSelectedEventoId] = useState('');
  const [planes, setPlanes] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [pagoStatus, setPagoStatus] = useState(null); // 'PROCESANDO' | 'CONFIRMADO' | 'FALLIDO' | 'PENDIENTE'

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
      // Requerimiento 2.3: Mostrar exclusivamente los eventos publicados de la organización
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

  const selectedEvento = eventosPublicados.find((ev) => String(ev.id) === String(selectedEventoId));

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

  // Flujo de contratación y pago de una promoción al seleccionar el plan (Requerimiento 6.5)
  const handleContratarPago = async (planToHire) => {
    const plan = planToHire || selectedPlan;
    if (procesando) return; // Evitar clics repetidos

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
      title: 'Contratar Promoción',
      text: `¿Deseas contratar el plan ${plan.nombre} (${formatPrice(plan.precio)}) para "${selectedEvento?.titulo || ''}"?`,
      badge: 'Confirmación de Pago',
      confirmButtonText: 'Continuar al pago',
      cancelButtonText: 'Cancelar',
    });

    if (!confirmRes.isConfirmed) return;

    setProcesando(true);
    setPagoStatus('PROCESANDO');

    try {
      // 1. Iniciar pago en backend
      const inicioRes = await promotionPlanService.iniciarPagoPosicionamiento(
        selectedEventoId,
        plan.id
      );
      const pagoId = inicioRes?.id || inicioRes?.data?.id;

      if (!pagoId) {
        throw new Error('No se pudo generar la orden de pago para la promoción.');
      }

      // 2. Procesar confirmación en pasarela (simulada por backend)
      await promotionPlanService.confirmarPagoPosicionamiento(pagoId);

      // 3. Consultar al backend el estado REAL de la transacción
      const estadoReal = await promotionPlanService.consultarPagoPosicionamiento(pagoId);
      const estadoConfirmado = estadoReal?.estado || estadoReal?.data?.estado;

      if (estadoConfirmado === 'CONFIRMADO') {
        setPagoStatus('CONFIRMADO');
        await showSuccessAlert({
          title: '¡Pago Confirmado!',
          text: `El pago de la promoción para "${selectedEvento?.titulo}" ha sido confirmado exitosamente. Se ha enviado un correo con el comprobante de la transacción.`,
          badge: 'Promoción Activa',
        });
        await loadEventosPublicados();
        if (onPromotionSuccess) onPromotionSuccess();
      } else if (estadoConfirmado === 'PENDIENTE') {
        setPagoStatus('PENDIENTE');
        await showInfoAlert({
          title: 'Pago Pendiente',
          text: 'La transacción permanece en estado pendiente de aprobación bancaria.',
          badge: 'En Espera Bancaria',
        });
      } else {
        setPagoStatus('FALLIDO');
        await showErrorAlert({
          title: 'Pago No Confirmado',
          text: 'La transacción no pudo ser verificada por el sistema bancario. Intenta nuevamente.',
          badge: 'Pago Fallido',
        });
      }
    } catch (err) {
      setPagoStatus('FALLIDO');
      console.error('Error en contratación de promoción:', err);
      await showErrorAlert({
        title: 'Error en la operación',
        text: err?.message || 'No se pudo completar el flujo de pago de la promoción.',
        badge: 'Operación Fallida',
      });
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Oficial */}
      <div>
        <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Posicionamiento y Promoción de Eventos
        </h2>
        <p className="mt-1 text-xs text-slate-500 max-w-xl">
          Aumenta el alcance de tus eventos publicados en la cartelera principal mediante planes oficiales de EventHive.
        </p>
      </div>

      {/* 2. KPIs de Posicionamiento */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Eventos Publicados Elegibles"
          value={String(eventosPublicados.length)}
          change="Eventos disponibles para promocionar"
          trend="up"
          icon={FiCheckCircle}
          iconBg="bg-blue-50"
          iconColor="text-brand"
        />
        <StatCard
          label="Promociones Activas"
          value={String(eventosConPromocion.length)}
          change="Eventos con patrocinio vigente"
          trend="up"
          icon={FiStar}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          label="Planes Disponibles"
          value={String(planes.length)}
          change="Opciones activas disponibles"
          trend="up"
          icon={FiAward}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
      </div>

      {/* 3. Selección del Evento Publicado (Requerimiento 2.3: Solo publicados) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#0B1B3D] text-amber-300 flex items-center justify-center text-xs font-black">
            1
          </span>
          <span>Selecciona el evento publicado</span>
        </h3>

        {loadingEventos ? (
          <div className="p-8 text-center text-xs text-slate-500 italic bg-slate-50 rounded-xl">
            Cargando eventos publicados...
          </div>
        ) : eventosPublicados.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1">
            <FiAlertCircle size={20} className="mx-auto text-amber-600 mb-1" />
            <p className="font-bold text-slate-800">No tienes eventos publicados actualmente</p>
            <p className="text-[11px] text-slate-500">
              Solo puedes contratar promociones para eventos que ya se encuentren en estado <strong>PUBLICADO</strong>.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {eventosPublicados.map((ev) => {
              const isSelected = String(ev.id) === String(selectedEventoId);
              const isPromocionado = Boolean(ev.promocionado || ev.destacado);

              return (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEventoId(String(ev.id))}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-[#0B1B3D] bg-blue-50/30 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-display text-xs font-bold text-slate-900 truncate">
                        {ev.titulo}
                      </h4>
                      {isPromocionado && (
                        <Badge tone="active">★ Destacado</Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {ev.fecha} · {ev.lugar || 'Cartagena'}
                    </p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    isSelected ? 'border-[#0B1B3D] bg-[#0B1B3D]' : 'border-slate-300'
                  }`}>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Planes Disponibles (Consulta al backend) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#0B1B3D] text-amber-300 flex items-center justify-center text-xs font-black">
              2
            </span>
            <span>Elige tu plan de posicionamiento</span>
          </h3>
          <span className="text-[11px] font-semibold text-slate-400">
            Desliza horizontalmente para comparar planes →
          </span>
        </div>

        {loadingPlanes ? (
          <div className="p-8 text-center text-xs text-slate-500 italic bg-slate-50 rounded-2xl">
            Cargando planes...
          </div>
        ) : planes.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-2xl">
            No hay planes activos disponibles en este momento.
          </div>
        ) : (
          <div className="relative">
            {/* Contenedor horizontal con scroll */}
            <div className="overflow-x-auto pb-4 pt-2 -mx-2 px-2 flex items-stretch gap-6 scroll-smooth scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
              {planes.map((plan, index) => {
                const isSelected = selectedPlan?.id === plan.id;
                // Si el plan es premium o es el segundo plan (estilo centro en imagen 1), destacarlo en oscuro
                const isHighlighted = Boolean(plan.premium) || (planes.length >= 3 && index === 1);

                return (
                  <PlanCard
                    key={plan.id || plan.codigo || index}
                    plan={plan}
                    isSelected={isSelected}
                    isHighlighted={isHighlighted}
                    onSelect={() => handleContratarPago(plan)}
                    mode="select"
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
