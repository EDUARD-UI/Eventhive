import React, { useEffect, useState, useMemo } from 'react';
import {
  FiAward,
  FiZap,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiCheck,
  FiShield,
  FiArrowRight,
  FiRefreshCw,
  FiImage,
  FiStar,
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import { organizerService } from '../../services/organizerService.js';
import { promotionPlanService } from '../../services/promotionPlanService.js';
import StatCard from '../../components/Shared/StatCard.jsx';
import Badge from '../../components/Shared/Badge.jsx';

export default function PosicionamientoView() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventoId, setSelectedEventoId] = useState('');
  const [planes, setPlanes] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [bannerUrl, setBannerUrl] = useState('');
  const [procesando, setProcesando] = useState(false);

  // Cargar planes de promoción disponibles
  useEffect(() => {
    const loadedPlanes = promotionPlanService.getPlanes();
    setPlanes(loadedPlanes);
    if (loadedPlanes.length > 0) {
      setSelectedPlan(loadedPlanes[0]);
    }
  }, []);

  const loadEventos = async () => {
    setLoading(true);
    try {
      const data = await organizerService.getEventosOrganizador({ page: 0, size: 100 });
      const items = Array.isArray(data) ? data : data?.content || data?.data || [];
      setEventos(items);
      if (items.length > 0 && !selectedEventoId) {
        setSelectedEventoId(String(items[0].id));
      }
    } catch (err) {
      console.warn('Error cargando eventos:', err);
      setEventos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEventos();
  }, []);

  // Eventos actualmente promocionados
  const eventosPromocionados = useMemo(() => {
    return eventos.filter(
      (ev) =>
        Boolean(ev.promocionado) ||
        Boolean(ev.destacado) ||
        Boolean(ev.urlImagenDestacado) ||
        Boolean(ev.imagenPromocional)
    );
  }, [eventos]);

  const selectedEvento = eventos.find((ev) => String(ev.id) === String(selectedEventoId));

  // Promocionar evento
  const handlePromocionar = async () => {
    if (!selectedEventoId) {
      Swal.fire({
        icon: 'warning',
        title: 'Selecciona un evento',
        text: 'Por favor selecciona el evento que deseas posicionar.',
        confirmButtonColor: '#0B1B3D',
      });
      return;
    }

    if (!selectedPlan) {
      Swal.fire({
        icon: 'warning',
        title: 'Selecciona un plan',
        text: 'Por favor elige un plan de posicionamiento.',
        confirmButtonColor: '#0B1B3D',
      });
      return;
    }

    const confirmRes = await Swal.fire({
      icon: 'question',
      title: '¿Confirmar Posicionamiento?',
      text: `¿Deseas activar el plan "${selectedPlan.nombre}" (${selectedPlan.precioFormateado}) para el evento "${selectedEvento?.titulo || ''}"?`,
      showCancelButton: true,
      confirmButtonText: 'Sí, activar posicionamiento',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#0B1B3D',
    });

    if (!confirmRes.isConfirmed) return;

    setProcesando(true);
    try {
      // 1. Iniciar pago de posicionamiento si backend lo soporta
      try {
        const res = await organizerService.iniciarPagoPosicionamiento(selectedEventoId);
        const pagoId = res?.id || res?.data?.id;
        if (pagoId) {
          await organizerService.confirmarPagoSimulado(pagoId);
        }
      } catch (e) {
        console.warn('Aviso de endpoint de pago:', e);
      }

      // 2. Activar posicionamiento en el backend
      const finalBannerUrl =
        bannerUrl.trim() ||
        selectedEvento?.foto ||
        selectedEvento?.urlFoto ||
        selectedEvento?.imagenUrl;

      await organizerService.posicionarEvento(selectedEventoId, finalBannerUrl);

      // Actualizar estado local
      setEventos((prev) =>
        prev.map((ev) =>
          String(ev.id) === String(selectedEventoId)
            ? { ...ev, promocionado: true, urlImagenDestacado: finalBannerUrl }
            : ev
        )
      );

      await Swal.fire({
        icon: 'success',
        title: '¡Evento Posicionado con Éxito!',
        text: `El evento "${selectedEvento?.titulo || 'Seleccionado'}" ha sido posicionado con el plan ${selectedPlan.nombre}. Ya es visible en la cartelera destacada.`,
        confirmButtonColor: '#0B1B3D',
      });

      loadEventos();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'No se pudo completar la solicitud de posicionamiento.',
        confirmButtonColor: '#0B1B3D',
      });
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FiAward className="text-amber-500 w-6 h-6" />
            Posicionamiento y Promoción de Eventos
          </h2>
          <p className="mt-1 text-xs text-slate-500 max-w-xl">
            Aumenta el alcance de tus eventos culturales en la cartelera principal mediante planes de posicionamiento oficiales de EventHive.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadEventos}
            title="Recargar eventos"
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* 2. KPIs Informativos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Visibilidad Estimada"
          value="+350%"
          change="Aparición en Home y primer lugar en búsquedas"
          trend="up"
          icon={FiTrendingUp}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          label="Conversión Esperada"
          value="2.8x"
          change="Mayor tasa de clics y venta de boletas"
          trend="up"
          icon={FiZap}
          iconBg="bg-blue-50"
          iconColor="text-brand"
        />
        <StatCard
          label="Garantía de Ubicación"
          value="30 Días"
          change="Permanencia garantizada durante la campaña"
          trend="neutral"
          icon={FiAward}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
      </div>

      {/* 3. SECCIÓN: EVENTOS ACTUALMENTE PROMOCIONADOS */}
      {eventosPromocionados.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50/70 via-white to-amber-50/30 border-2 border-amber-200/80 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-black text-slate-900 flex items-center gap-2">
                <FiStar className="text-amber-500 fill-amber-400" />
                <span>Campañas Activas de tu Organización</span>
              </h3>
              <p className="text-xs text-slate-500">
                Eventos con posicionamiento vigente en carrusel y cartelera principal
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-2xs">
              {eventosPromocionados.length} Activo(s)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {eventosPromocionados.map((ev) => (
              <div
                key={ev.id}
                className="bg-white border border-amber-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="relative aspect-video bg-slate-900">
                  <img
                    src={ev.urlImagenDestacado || ev.foto || ev.imagenUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80'}
                    alt={ev.titulo}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[9.5px] uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <span>★</span> PROMOCIONADO
                  </span>
                  <span className="absolute bottom-2.5 left-2.5 right-2.5 text-white font-bold text-xs truncate">
                    {ev.titulo}
                  </span>
                </div>

                <div className="p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Lugar:</span>
                    <span className="font-bold text-slate-800 truncate max-w-[140px]">
                      {ev.lugar || 'Cartagena de Indias'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Estado:</span>
                    <Badge variant="success" size="sm">
                      Campaña Vigente
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Selección de Evento a Promocionar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#0B1B3D] text-amber-300 flex items-center justify-center text-xs font-black">
            1
          </span>
          <span>Selecciona el evento a posicionar</span>
        </h3>

        {loading ? (
          <div className="p-6 text-center text-xs text-slate-500 font-bold uppercase tracking-wider">
            Cargando tus eventos...
          </div>
        ) : eventos.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
            No tienes eventos registrados aún. Crea un evento primero en el Wizard para poder posicionarlo.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {eventos.map((ev) => {
              const isSelected = String(ev.id) === String(selectedEventoId);
              const isAlreadyPromoted =
                Boolean(ev.promocionado) ||
                Boolean(ev.destacado) ||
                Boolean(ev.urlImagenDestacado);

              return (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEventoId(String(ev.id))}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#0B1B3D] bg-blue-50/40 ring-2 ring-[#0B1B3D]/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-bold text-xs text-slate-900 line-clamp-1">
                      {ev.titulo}
                    </h4>
                    {isSelected && (
                      <span className="p-1 rounded-full bg-[#0B1B3D] text-amber-300">
                        <FiCheck size={11} />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2 truncate">
                    {ev.lugar || 'Cartagena de Indias'} · {ev.fecha}
                  </p>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-semibold text-slate-600 uppercase truncate max-w-[120px]">
                      {ev.categoria?.nombre || ev.categoria || 'Evento'}
                    </span>
                    {isAlreadyPromoted ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[9px]">
                        ★ Promocionado
                      </span>
                    ) : (
                      <Badge variant={ev.estado === 'PUBLICADO' ? 'success' : 'neutral'}>
                        {ev.estado || 'BORRADOR'}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Input opcional de URL de banner destacado con preview */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            URL de Imagen o Banner para Destacado (Opcional)
          </label>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <input
              type="url"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              placeholder="https://ejemplo.com/banner-promocion.jpg"
              className="w-full text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-[#0B1B3D] focus:ring-2 focus:ring-[#0B1B3D]/10 transition-all"
            />
          </div>
          <p className="text-[11px] text-slate-400">
            Si se deja en blanco, se utilizará la portada oficial del evento.
          </p>
        </div>
      </div>

      {/* 5. Opciones de Posicionamiento */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#0B1B3D] text-amber-300 flex items-center justify-center text-xs font-black">
            2
          </span>
          <span>Elige el nivel de posicionamiento</span>
        </h3>

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
                {plan.popular && (
                  <span className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-xs">
                    Recomendado
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-display text-lg font-bold text-slate-900">
                      {plan.nombre}
                    </h4>
                    <span className="text-lg font-black text-amber-600">
                      {plan.precioFormateado || `$${plan.precio}`}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 font-medium mb-4">
                    Duración: <strong className="text-slate-800">{plan.duracion || `${plan.dias} días`}</strong>
                  </p>

                  <ul className="space-y-2 mb-6">
                    {(plan.beneficios || []).map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                        <FiCheck className="text-emerald-500 shrink-0 mt-0.5" size={14} />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
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
      </div>

      {/* 6. Resumen y Confirmación Directa */}
      <div className="bg-[#0B1B3D] text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block mb-1">
            RESUMEN DE PROMOCIÓN
          </span>
          <h4 className="text-lg font-bold text-white">
            {selectedEvento?.titulo || 'Ningún evento seleccionado'}
          </h4>
          <p className="text-xs text-slate-300 mt-0.5">
            Plan: <strong>{selectedPlan?.nombre || 'Ninguno'}</strong> ({selectedPlan?.duracion || '30 días'}) · Costo:{' '}
            <strong className="text-amber-300">{selectedPlan?.precioFormateado || '$0 COP'}</strong>
          </p>
        </div>

        <button
          type="button"
          onClick={handlePromocionar}
          disabled={!selectedEventoId || !selectedPlan || procesando}
          className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0"
        >
          {procesando ? (
            <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <FiAward size={15} />
          )}
          <span>{procesando ? 'Activando...' : 'Activar Posicionamiento'}</span>
          <FiArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
