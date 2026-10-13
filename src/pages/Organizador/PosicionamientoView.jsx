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
import Swal from 'sweetalert2';
import { organizerService } from '../../services/organizerService.js';
import { promotionPlanService } from '../../services/promotionPlanService.js';
import StatCard from '../../components/Shared/StatCard.jsx';
import Badge from '../../components/Shared/Badge.jsx';
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

  // Flujo de contratación y pago de una promoción (Requerimiento 2.4)
  const handleContratarPago = async () => {
    if (procesando) return; // Evitar clics repetidos

    if (!selectedEventoId) {
      Swal.fire({
        icon: 'warning',
        title: 'Selecciona un evento',
        text: 'Por favor selecciona el evento publicado que deseas promocionar.',
        confirmButtonColor: '#0B1B3D',
      });
      return;
    }

    if (!selectedPlan) {
      Swal.fire({
        icon: 'warning',
        title: 'Selecciona un plan',
        text: 'Por favor elige un plan de promoción disponible.',
        confirmButtonColor: '#0B1B3D',
      });
      return;
    }

    const confirmRes = await Swal.fire({
      icon: 'question',
      title: 'Contratar Promoción',
      html: `
        <div class="text-left text-xs space-y-2">
          <p><strong>Evento:</strong> ${selectedEvento?.titulo || ''}</p>
          <p><strong>Plan:</strong> ${selectedPlan.nombre}</p>
          <p><strong>Detalle:</strong> ${selectedPlan.detallePublicidad || 'Posicionamiento en cartelera'}</p>
          <p><strong>Precio fijo a pagar:</strong> <span class="text-amber-600 font-bold">${formatPrice(selectedPlan.precio)}</span></p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Continuar a pasarela de pago',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#0B1B3D',
    });

    if (!confirmRes.isConfirmed) return;

    setProcesando(true);
    setPagoStatus('PROCESANDO');

    try {
      // 1. Iniciar pago en backend
      const inicioRes = await promotionPlanService.iniciarPagoPosicionamiento(
        selectedEventoId,
        selectedPlan.id
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
        await Swal.fire({
          icon: 'success',
          title: '¡Pago Confirmado!',
          text: `El pago de la promoción para "${selectedEvento?.titulo}" ha sido confirmado exitosamente. Se ha enviado un correo con el comprobante de la transacción.`,
          confirmButtonColor: '#0B1B3D',
        });
        await loadEventosPublicados();
        if (onPromotionSuccess) onPromotionSuccess();
      } else if (estadoConfirmado === 'PENDIENTE') {
        setPagoStatus('PENDIENTE');
        await Swal.fire({
          icon: 'info',
          title: 'Pago Pendiente',
          text: 'La transacción permanece en estado pendiente de aprobación bancaria.',
          confirmButtonColor: '#0B1B3D',
        });
      } else {
        setPagoStatus('FALLIDO');
        await Swal.fire({
          icon: 'error',
          title: 'Pago No Confirmado',
          text: 'La transacción no pudo ser verificada por el sistema bancario. Intenta nuevamente.',
          confirmButtonColor: '#0B1B3D',
        });
      }
    } catch (err) {
      setPagoStatus('FALLIDO');
      console.error('Error en contratación de promoción:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error en la operación',
        text: err?.message || 'No se pudo completar el flujo de pago de la promoción.',
        confirmButtonColor: '#0B1B3D',
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
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#0B1B3D] text-amber-300 flex items-center justify-center text-xs font-black">
            2
          </span>
          <span>Elige tu plan</span>
        </h3>

        {loadingPlanes ? (
          <div className="p-8 text-center text-xs text-slate-500 italic bg-slate-50 rounded-xl">
            Cargando planes...
          </div>
        ) : planes.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl">
            No hay planes activos disponibles en este momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {planes.map((plan) => {
              const isSelected = selectedPlan?.id === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className={`p-6 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#0B1B3D] bg-gradient-to-b from-blue-50/40 to-white shadow-md'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  {plan.premium && (
                    <span className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-xs">
                      ★ Banner Premium
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-display text-base font-bold text-slate-900">
                        {plan.nombre}
                      </h4>
                      <span className="text-base font-black text-amber-600">
                        {formatPrice(plan.precio)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 font-medium mb-3">
                      {plan.detallePublicidad || 'Posicionamiento garantizado en la cartelera.'}
                    </p>

                    <div className="space-y-1.5 text-xs text-slate-500 mb-5">
                      <div className="flex items-center gap-2">
                        <FiCheck size={12} className={plan.premium ? 'text-amber-600' : 'text-slate-400'} />
                        <span>Banner en Carrusel Home: <strong className="text-slate-800">{plan.premium ? 'Sí (Premium)' : 'No (Estándar)'}</strong></span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                      isSelected
                        ? 'bg-[#0B1B3D] text-amber-300 shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <FiCheck size={14} />
                        <span>Plan Seleccionado</span>
                      </>
                    ) : (
                      <span>Seleccionar este plan</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Resumen de Contratación y Acción de Pago */}
      <div className="bg-[#0B1B3D] text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block mb-1">
            RESUMEN DE CONTRATACIÓN
          </span>
          <h4 className="text-base font-bold text-white">
            {selectedEvento?.titulo || 'Selecciona un evento publicado'}
          </h4>
          <p className="text-xs text-slate-300 mt-0.5">
            Plan: <strong>{selectedPlan?.nombre || 'Ninguno'}</strong> · Precio fijo:{' '}
            <strong className="text-amber-300">{formatPrice(selectedPlan?.precio || 0)}</strong>
          </p>
        </div>

        <button
          type="button"
          onClick={handleContratarPago}
          disabled={!selectedEventoId || !selectedPlan || procesando || eventosPublicados.length === 0}
          className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0"
        >
          {procesando ? (
            <>
              <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Procesando pago seguro...</span>
            </>
          ) : (
            <>
              <FiAward size={15} />
              <span>Contratar plan</span>
              <FiArrowRight size={14} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
