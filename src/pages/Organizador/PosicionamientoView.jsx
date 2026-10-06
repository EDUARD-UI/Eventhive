import React, { useEffect, useState } from 'react';
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
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import { organizerService } from '../../services/organizerService.js';
import StatCard from '../../components/Shared/StatCard.jsx';
import Badge from '../../components/Shared/Badge.jsx';

const PLANES_POSICIONAMIENTO = [
  {
    id: 'DESTACADO_HOME',
    nombre: 'Destacado Home',
    precio: 50000,
    precioFormateado: '$50.000 COP',
    duracion: '30 días',
    popular: false,
    beneficios: [
      'Aparición en la sección de Eventos Destacados del Home',
      'Badge distintivo de "Evento Destacado"',
      'Mayor visibilidad en recomendaciones culturales',
      'Soporte técnico prioritario',
    ],
  },
  {
    id: 'PREMIUM_TOP',
    nombre: 'Posicionamiento Premium',
    precio: 100000,
    precioFormateado: '$100.000 COP',
    duracion: '30 días',
    popular: true,
    beneficios: [
      'Primeros puestos en el Carrusel Principal del Home',
      'Posición #1 en resultados de búsqueda y categorías',
      'Banner promocional destacado en el inicio',
      'Badge VIP dorado en todas las vistas',
      'Estadísticas avanzadas de visualizaciones',
    ],
  },
];

export default function PosicionamientoView() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventoId, setSelectedEventoId] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(PLANES_POSICIONAMIENTO[0]);
  const [bannerUrl, setBannerUrl] = useState('');
  const [procesando, setProcesando] = useState(false);

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

  const selectedEvento = eventos.find((ev) => String(ev.id) === String(selectedEventoId));

  // Promocionar evento consumiendo los endpoints directamente sin modal de pago simulado
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
      await organizerService.posicionarEvento(
        selectedEventoId,
        bannerUrl.trim() || selectedEvento?.foto || selectedEvento?.urlFoto
      );

      await Swal.fire({
        icon: 'success',
        title: '¡Evento Posicionado!',
        text: `El evento "${selectedEvento?.titulo || 'Seleccionado'}" ha sido posicionado exitosamente con el plan ${selectedPlan.nombre}.`,
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
          <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Posicionamiento y Promoción
          </h2>
          <p className="mt-1 text-xs text-slate-500 max-w-xl">
            Aumenta el alcance de tus eventos culturales en la cartelera principal mediante planes de posicionamiento oficiales.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadEventos}
            title="Recargar eventos"
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
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

      {/* 3. Selección de Evento */}
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
              return (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEventoId(String(ev.id))}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-brand bg-blue-50/40 ring-2 ring-brand/30 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-bold text-xs text-slate-900 line-clamp-1">
                      {ev.titulo}
                    </h4>
                    {isSelected && (
                      <span className="p-1 rounded-full bg-brand text-white">
                        <FiCheck size={11} />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2 truncate">
                    {ev.lugar || 'Cartagena de Indias'} · {ev.fecha}
                  </p>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-semibold text-slate-600 uppercase">
                      {ev.categoria?.nombre || ev.categoria || 'Evento'}
                    </span>
                    <Badge tone={ev.estado === 'PUBLICADO' ? 'active' : 'neutral'}>
                      {ev.estado || 'BORRADOR'}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Input opcional de URL de banner destacado */}
        <div className="pt-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            URL de Imagen o Banner para Destacado (Opcional)
          </label>
          <input
            type="url"
            value={bannerUrl}
            onChange={(e) => setBannerUrl(e.target.value)}
            placeholder="https://ejemplo.com/banner-promocion.jpg"
            className="w-full text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Si se deja en blanco, se utilizará la portada oficial del evento.
          </p>
        </div>
      </div>

      {/* 4. Opciones de Posicionamiento */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#0B1B3D] text-amber-300 flex items-center justify-center text-xs font-black">
            2
          </span>
          <span>Elige el nivel de posicionamiento</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {PLANES_POSICIONAMIENTO.map((plan) => {
            const isSelected = selectedPlan.id === plan.id;
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                className={`p-6 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-brand bg-gradient-to-b from-blue-50/40 to-white shadow-md'
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
                    <span className="text-lg font-black text-brand">
                      {plan.precioFormateado}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 font-medium mb-4">
                    Duración: <strong className="text-slate-800">{plan.duracion}</strong>
                  </p>

                  <ul className="space-y-2 mb-6">
                    {plan.beneficios.map((b, i) => (
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
                      ? 'bg-brand text-white shadow-xs'
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

      {/* 5. Resumen y Confirmación Directa */}
      <div className="bg-[#0B1B3D] text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block mb-1">
            RESUMEN DE PROMOCIÓN
          </span>
          <h4 className="text-lg font-bold text-white">
            {selectedEvento?.titulo || 'Ningún evento seleccionado'}
          </h4>
          <p className="text-xs text-slate-300 mt-0.5">
            Plan: <strong>{selectedPlan.nombre}</strong> ({selectedPlan.duracion}) · Costo: <strong className="text-amber-300">{selectedPlan.precioFormateado}</strong>
          </p>
        </div>

        <button
          type="button"
          onClick={handlePromocionar}
          disabled={!selectedEventoId || procesando}
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
