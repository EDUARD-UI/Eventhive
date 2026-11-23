import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  FiSearch,
  FiRefreshCw,
  FiX,
  FiUpload,
  FiAlertCircle,
  FiExternalLink,
  FiCheck,
  FiPlus,
  FiLayers,
  FiAward,
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import Pagination from '../../components/Shared/Pagination.jsx';
import EventDetailView from '../Organizador/EventDetailView.jsx';
import { formatPrice } from '../../utils/formatters.js';
import { promotionPlanService } from '../../services/promotionPlanService.js';

// Normaliza el nivel o tier de pauta de un plan
const getPlanTier = (planName, isPremium) => {
  const norm = String(planName || '').toUpperCase();
  if (isPremium || norm.includes('EXPOSICI') || norm.includes('TOTAL') || norm.includes('PREMIUM') || norm.includes('VIP')) {
    return 'EXPOSICION_TOTAL';
  }
  if (norm.includes('AMPLIFIC') || norm.includes('PRO') || norm.includes('MEDIO') || norm.includes('INTERMEDIO')) {
    return 'AMPLIFICADO';
  }
  return 'IMPULSO';
};

export default function MarketingPromocionesView({ initialTab = 'eventos', onNavigateTab }) {
  const [activeSubTab, setActiveSubTab] = useState(initialTab || 'eventos');
  const [promociones, setPromociones] = useState([]);
  const [stats, setStats] = useState({ eventosActivosPromocionados: 0, eventosPorPlan: [] });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState('TODOS');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Modal a la derecha: Detalle de evento
  const [selectedEventId, setSelectedEventId] = useState(null);

  // Modal a la derecha: Asignar / Editar creatividad de banner (planes con beneficio destacado/carrusel)
  const [promoImageModalEvent, setPromoImageModalEvent] = useState(null);
  const [inputPromoImage, setInputPromoImage] = useState('');
  const [savingPromoImage, setSavingPromoImage] = useState(false);
  const [uploadingPromoFile, setUploadingPromoFile] = useState(false);
  const [promoImageError, setPromoImageError] = useState(null);
  const promoFileInputRef = useRef(null);

  // Gestión de Planes de Promoción
  const [planes, setPlanes] = useState([]);
  const [loadingPlanes, setLoadingPlanes] = useState(false);
  const [planDrawerOpen, setPlanDrawerOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [planForm, setPlanForm] = useState({
    nombre: '',
    codigo: '',
    detallePublicidad: '',
    precio: '',
    comisionPorcentaje: 0,
    pautaRedes: false,
    premium: false,
  });
  const [savingPlan, setSavingPlan] = useState(false);
  const [planFormError, setPlanFormError] = useState(null);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (initialTab) {
      setActiveSubTab(initialTab);
    }
  }, [initialTab]);

  const handleTabChange = (tab) => {
    setActiveSubTab(tab);
    if (onNavigateTab) {
      onNavigateTab(tab);
    }
  };

  // Cargar planes reales desde el backend
  const loadPlanes = useCallback(async () => {
    try {
      setLoadingPlanes(true);
      const data = await promotionPlanService.getPlanesMarketing();
      if (Array.isArray(data) && data.length > 0) {
        setPlanes(data);
      } else {
        // Fallback arquitectónico si no hay planes registrados aún
        setPlanes([
          {
            id: 1,
            nombre: 'Plan Impulso',
            codigo: 'PLAN_IMPULSO',
            detallePublicidad: 'Mayor visibilidad orgánica y posición preferente en búsquedas.',
            precio: 350000,
            comisionPorcentaje: 10,
            pautaRedes: false,
            premium: false,
            beneficios: [
              'Posicionamiento prioritario en cartelera cultural',
              'Inclusión en sección de eventos recomendados',
              'Mayor visibilidad orgánica en búsquedas de cartelera',
            ],
          },
          {
            id: 2,
            nombre: 'Plan Amplificado',
            codigo: 'PLAN_AMPLIFICADO',
            detallePublicidad: 'Posicionamiento destacado y difusión activa en redes sociales.',
            precio: 650000,
            comisionPorcentaje: 8.5,
            pautaRedes: true,
            premium: false,
            beneficios: [
              'Posicionamiento destacado superior en cartelera cultural',
              'Pauta activa y difusión en redes sociales oficiales',
              'Segmentación estratégica por audiencia de Cartagena',
            ],
          },
          {
            id: 3,
            nombre: 'Plan Exposición Total',
            codigo: 'PLAN_EXPOSICION_TOTAL',
            detallePublicidad: 'Aparición garantizada en Carrusel Principal de Home y máxima difusión omnicanal.',
            precio: 1000000,
            comisionPorcentaje: 6,
            pautaRedes: true,
            premium: true,
            beneficios: [
              'Espacio exclusivo garantizado en Carrusel Principal del Home',
              'Difusión prioritaria omnicanal (Web, Push y Redes)',
              'Soporte preferencial 24/7 y auditoría de boletería',
            ],
          },
        ]);
      }
    } catch (err) {
      if (err.status === 403) {
        setAuthError('Acceso denegado (403): Se requieren credenciales de Marketing.');
      } else {
        console.warn('Error al cargar planes de promoción:', err);
      }
    } finally {
      setLoadingPlanes(false);
    }
  }, []);

  // Cargar eventos promocionados y estadísticas reales
  const fetchPromociones = useCallback(async () => {
    try {
      setLoading(true);
      const [rawEvents, statsData] = await Promise.all([
        promotionPlanService.getEventosPromocionados(),
        promotionPlanService.getEstadisticasMarketing(),
      ]);

      if (statsData) {
        setStats({
          eventosActivosPromocionados: statsData.eventosActivosPromocionados || 0,
          eventosPorPlan: Array.isArray(statsData.eventosPorPlan) ? statsData.eventosPorPlan : [],
        });
      }

      const mapped = (Array.isArray(rawEvents) ? rawEvents : []).map((p) => {
        const evId = p.eventoId || p.id;
        const planObj = p.plan || p.promocionPlan || {};
        const isPremium = Boolean(p.premium || planObj.premium || p.tipoPlan === 'PREMIUM');
        const planNombre =
          p.planNombre ||
          planObj.nombre ||
          p.plan ||
          (isPremium ? 'Plan Exposición Total' : 'Plan Impulso');
        const precio = Number(p.precio || p.montoPagado || planObj.precio || 0);

        return {
          id: p.id || evId,
          eventoId: evId,
          eventoNombre: p.eventoNombre || p.eventoTitulo || p.titulo || 'Evento Cultural',
          organizacionNombre:
            p.organizacionNombre ||
            p.organizacion?.razonSocial ||
            p.organizacion?.nombre ||
            '',
          plan: planNombre,
          tier: getPlanTier(planNombre, isPremium),
          precio,
          premium: isPremium,
          pautaRedes: Boolean(p.pautaRedes || planObj.pautaRedes),
          fechaInicio: p.fechaInicio || p.fechaInicioPromocion || p.fecha || '—',
          fechaFinal: p.fechaFinal || p.fechaFinPromocion || p.fechaFin || '—',
          estado: (p.estado || (p.activo !== false ? 'ACTIVO' : 'FINALIZADO')).toUpperCase(),
          foto: p.foto || p.imagenUrl || null,
          urlImagenDestacado: p.urlImagenDestacado || p.imagenPromocional || null,
        };
      });

      setPromociones(mapped);
    } catch (err) {
      if (err.status === 403) {
        setAuthError('Acceso denegado (403): Permisos insuficientes para consultar eventos promocionados.');
      } else {
        console.warn('Error al cargar promociones de marketing:', err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromociones();
    loadPlanes();
  }, [fetchPromociones, loadPlanes]);

  // Métricas tipográficas en línea
  const metrics = useMemo(() => {
    const totalPromociones = promociones.length;
    const activos = promociones.filter((p) => p.estado === 'ACTIVO' || p.estado === 'VIGENTE').length;

    let impulso = 0;
    let amplificado = 0;
    let exposicion = 0;

    promociones.forEach((p) => {
      if (p.tier === 'EXPOSICION_TOTAL') exposicion += 1;
      else if (p.tier === 'AMPLIFICADO') amplificado += 1;
      else impulso += 1;
    });

    return {
      total: totalPromociones,
      activos: activos > 0 ? activos : totalPromociones,
      impulso,
      amplificado,
      exposicion,
    };
  }, [promociones]);

  // Filtrado de eventos promocionados
  const filteredPromociones = useMemo(() => {
    return promociones.filter((p) => {
      if (selectedPlanFilter === 'EXPOSICION_TOTAL' && p.tier !== 'EXPOSICION_TOTAL') return false;
      if (selectedPlanFilter === 'AMPLIFICADO' && p.tier !== 'AMPLIFICADO') return false;
      if (selectedPlanFilter === 'IMPULSO' && p.tier !== 'IMPULSO') return false;

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        p.eventoNombre?.toLowerCase().includes(term) ||
        p.organizacionNombre?.toLowerCase().includes(term) ||
        p.plan?.toLowerCase().includes(term)
      );
    });
  }, [promociones, selectedPlanFilter, searchTerm]);

  // Paginado en cliente
  const paginatedPromociones = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPromociones.slice(start, start + pageSize);
  }, [filteredPromociones, currentPage, pageSize]);

  // Clasificación de planes para el Grid de 3 Columnas Arquitectónicas
  const planesByTier = useMemo(() => {
    const sorted = [...planes];
    const planImpulso =
      sorted.find((p) => getPlanTier(p.nombre, p.premium) === 'IMPULSO') || sorted[0] || {};
    const planAmplificado =
      sorted.find((p) => getPlanTier(p.nombre, p.premium) === 'AMPLIFICADO') || sorted[1] || {};
    const planExposicion =
      sorted.find((p) => getPlanTier(p.nombre, p.premium) === 'EXPOSICION_TOTAL') || sorted[2] || {};

    return { planImpulso, planAmplificado, planExposicion };
  }, [planes]);

  // Abrir drawer para asignar o editar banner
  const handleOpenPromoImageModal = (item) => {
    setPromoImageModalEvent(item);
    setInputPromoImage(item.urlImagenDestacado || '');
    setPromoImageError(null);
  };

  const handlePromoFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setPromoImageError('Formato no válido. Solo se admiten archivos JPG, PNG o WEBP.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPromoImageError('El archivo excede el tamaño máximo permitido de 5 MB.');
      return;
    }

    try {
      setUploadingPromoFile(true);
      setPromoImageError(null);
      const url = await promotionPlanService.subirImagenMarketing(file);
      setInputPromoImage(url);
    } catch (err) {
      setPromoImageError(err?.message || 'Error al cargar la imagen en el servidor.');
    } finally {
      setUploadingPromoFile(false);
      if (promoFileInputRef.current) promoFileInputRef.current.value = '';
    }
  };

  const handleSavePromoImage = async () => {
    if (!promoImageModalEvent) return;
    const urlTrimmed = inputPromoImage.trim();

    if (!urlTrimmed) {
      setPromoImageError('Por favor ingresa o carga la imagen para el banner.');
      return;
    }

    try {
      setSavingPromoImage(true);
      setPromoImageError(null);
      await promotionPlanService.asignarImagenPromocional(
        promoImageModalEvent.eventoId,
        urlTrimmed
      );

      setPromociones((prev) =>
        prev.map((item) =>
          item.eventoId === promoImageModalEvent.eventoId
            ? { ...item, urlImagenDestacado: urlTrimmed }
            : item
        )
      );

      Swal.fire({
        icon: 'success',
        title: 'Pieza de banner guardada',
        text: 'La creatividad ha sido asociada y se exhibe en los espacios oficiales.',
        timer: 2000,
        confirmButtonColor: '#0F2342',
      });

      setPromoImageModalEvent(null);
    } catch (err) {
      setPromoImageError(
        err?.response?.data?.message || err?.message || 'No se pudo guardar la imagen destacada.'
      );
    } finally {
      setSavingPromoImage(false);
    }
  };

  // Abrir drawer para crear o editar plan
  const handleOpenCreatePlan = () => {
    setEditingPlanId(null);
    setPlanForm({
      nombre: '',
      codigo: '',
      detallePublicidad: '',
      precio: '',
      comisionPorcentaje: 0,
      pautaRedes: false,
      premium: false,
    });
    setPlanFormError(null);
    setPlanDrawerOpen(true);
  };

  const handleOpenEditPlan = (plan) => {
    setEditingPlanId(plan.id);
    setPlanForm({
      nombre: plan.nombre || '',
      codigo: plan.codigo || '',
      detallePublicidad: plan.detallePublicidad || '',
      precio: plan.precio !== undefined ? String(plan.precio) : '',
      comisionPorcentaje: plan.comisionPorcentaje !== undefined ? Number(plan.comisionPorcentaje) : 0,
      pautaRedes: Boolean(plan.pautaRedes),
      premium: Boolean(plan.premium),
    });
    setPlanFormError(null);
    setPlanDrawerOpen(true);
  };

  const handleSavePlanSubmit = async (e) => {
    e.preventDefault();
    setPlanFormError(null);

    const nombreTrimmed = planForm.nombre.trim();
    const codigoTrimmed = planForm.codigo.trim().toUpperCase();
    const precioNum = Number(planForm.precio);
    const comisionNum = Number(planForm.comisionPorcentaje);

    if (!nombreTrimmed) {
      setPlanFormError('El nombre del plan es obligatorio.');
      return;
    }

    if (!codigoTrimmed) {
      setPlanFormError('El código del plan es obligatorio.');
      return;
    }

    if (isNaN(precioNum) || precioNum < 0) {
      setPlanFormError('El precio de pago fijo debe ser un valor numérico mayor o igual a 0.');
      return;
    }

    if (isNaN(comisionNum) || comisionNum < 0 || comisionNum > 100) {
      setPlanFormError('El porcentaje de comisión debe estar entre 0% y 100%.');
      return;
    }

    const payload = {
      nombre: nombreTrimmed,
      codigo: codigoTrimmed,
      detallePublicidad: planForm.detallePublicidad.trim(),
      precio: precioNum,
      comisionPorcentaje: comisionNum,
      pautaRedes: Boolean(planForm.pautaRedes),
      premium: Boolean(planForm.premium),
    };

    try {
      setSavingPlan(true);
      if (editingPlanId) {
        await promotionPlanService.actualizarPlan(editingPlanId, payload);
        Swal.fire({
          icon: 'success',
          title: 'Plan actualizado',
          text: `El plan "${nombreTrimmed}" ha sido actualizado exitosamente.`,
          timer: 1800,
          confirmButtonColor: '#0F2342',
        });
      } else {
        await promotionPlanService.crearPlan(payload);
        Swal.fire({
          icon: 'success',
          title: 'Plan creado',
          text: `El plan "${nombreTrimmed}" ha sido registrado exitosamente.`,
          timer: 1800,
          confirmButtonColor: '#0F2342',
        });
      }

      setPlanDrawerOpen(false);
      await loadPlanes();
    } catch (err) {
      setPlanFormError(
        err?.response?.data?.message || err?.message || 'Error al guardar el plan de promoción.'
      );
    } finally {
      setSavingPlan(false);
    }
  };

  return (
    <div className="space-y-8 select-none">
      {/* Alerta de Autorización si ocurre */}
      {authError && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-xs font-mono text-amber-900 rounded-[2px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiAlertCircle size={15} className="text-amber-600 shrink-0" />
            <span>{authError}</span>
          </div>
          <button
            type="button"
            onClick={() => setAuthError(null)}
            className="text-amber-700 hover:text-amber-900 font-bold uppercase underline ml-3"
          >
            ✕
          </button>
        </div>
      )}

      {/* =========================================================================
          VISTA 1: EVENTOS PROMOCIONADOS (Consola de Campañas Activas)
         ========================================================================= */}
      {activeSubTab === 'eventos' && (
        <div className="space-y-6">
          {/* A. Encabezado */}
          <div className="border-b border-[#E2E8F0] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="font-display font-black text-[clamp(1.5rem,4vw,2.25rem)] text-[#0F2342] tracking-tight uppercase leading-none">
                EVENTOS PROMOCIONADOS
              </h1>
              <p className="font-sans text-xs sm:text-sm text-[#64748B] mt-2">
                Control de campañas activas, distribución por nivel de pauta y gestión de creatividad.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  fetchPromociones();
                  loadPlanes();
                }}
                title="Recargar datos"
                className="p-2.5 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] text-[#64748B] hover:text-[#0F2342] hover:bg-[#F8F9FA] transition-colors cursor-pointer"
              >
                <FiRefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Barra de Resumen Tipográfico (Reemplazo de las 3 tarjetas KPI + caja de distribución) */}
          <div className="w-full bg-[#FFFFFF] border-y border-[#E2E8F0] py-4 px-4 sm:px-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 font-mono text-xs">
            <div className="flex flex-wrap items-center gap-6 sm:divide-x divide-[#E2E8F0]">
              <div className="font-bold text-[#0F2342] uppercase tracking-wider">
                <span className="text-[#F5B800] mr-1.5 font-black">{metrics.activos}</span>
                EVENTOS EN PAUTA ACTIVA
              </div>
              <div className="sm:pl-6 font-bold text-[#0F2342] uppercase tracking-wider">
                <span className="text-[#0F2342] mr-1.5 font-black">{metrics.total}</span>
                PROMOCIONES CONTRATADAS
              </div>
            </div>

            <div className="text-[#64748B] uppercase tracking-wider flex items-center flex-wrap gap-2">
              <span className="text-[#94A3B8]">DISTRIBUCIÓN:</span>
              <span className="text-[#0F2342] font-semibold">{metrics.impulso} IMPULSO</span>
              <span className="text-[#CBD5E1]">•</span>
              <span className="text-[#0F2342] font-semibold">{metrics.amplificado} AMPLIFICADO</span>
              <span className="text-[#CBD5E1]">•</span>
              <span className="text-[#C68B17] font-bold">{metrics.exposicion} EXPOSICIÓN TOTAL</span>
            </div>
          </div>

          {/* B. Barra de Control y Filtros */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Buscador rectangular (border-radius: 2px, borde 1px solid #E2E8F0) */}
            <div className="relative w-full sm:w-80 md:w-96">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Buscar campaña por evento u organización..."
                className="w-full pl-10 pr-4 py-2.5 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] font-mono text-xs text-[#0F2342] placeholder-[#94A3B8] focus:outline-none focus:border-[#0F2342] transition-colors"
              />
            </div>

            {/* Filtros tipográficos (sin píldoras): subrayado de 2px en #F5B800 */}
            <div className="flex items-center gap-6 overflow-x-auto border-b border-[#E2E8F0] sm:border-b-0 pb-1 sm:pb-0">
              {[
                { label: 'TODOS LOS PLANES', val: 'TODOS' },
                { label: 'EXPOSICIÓN TOTAL', val: 'EXPOSICION_TOTAL' },
                { label: 'AMPLIFICADO', val: 'AMPLIFICADO' },
                { label: 'IMPULSO', val: 'IMPULSO' },
              ].map((f) => {
                const isActive = selectedPlanFilter === f.val;
                return (
                  <button
                    key={f.val}
                    type="button"
                    onClick={() => {
                      setSelectedPlanFilter(f.val);
                      setCurrentPage(1);
                    }}
                    className={`font-mono text-xs uppercase tracking-wider transition-all cursor-pointer pb-2 relative shrink-0 ${
                      isActive
                        ? 'text-[#0F2342] font-bold'
                        : 'text-[#64748B] hover:text-[#0F2342] font-medium'
                    }`}
                  >
                    <span>{f.label}</span>
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

          {/* C. Listado de Campañas (Formato Ficha de Pauta — Sin badges apilados) */}
          <div className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] overflow-hidden">
            {loading ? (
              <div className="p-16 text-center text-[#64748B] font-mono text-xs">
                <FiRefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0F2342]" />
                Cargando campañas en pauta...
              </div>
            ) : filteredPromociones.length === 0 ? (
              <div className="p-16 text-center text-[#64748B] font-mono text-xs">
                No se encontraron campañas activas con los criterios seleccionados.
              </div>
            ) : (
              <div className="editorial-scroll-x w-full">
                <table className="w-full text-left text-xs min-w-[680px]">
                  <thead className="bg-[#FFFFFF] border-b border-[#E2E8F0] font-mono text-[11px] uppercase tracking-wider text-[#64748B]">
                    <tr>
                      <th className="py-4 px-6 font-bold">Evento y Arte</th>
                      <th className="py-4 px-6 font-bold">Nivel de Pauta Contratado</th>
                      <th className="py-4 px-6 font-bold">Alcance / Cobertura</th>
                      <th className="py-4 px-6 font-bold text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {paginatedPromociones.map((p) => {
                      const isExposicion = p.tier === 'EXPOSICION_TOTAL';
                      const hasPromoImage = Boolean(p.urlImagenDestacado);

                      const coberturaTexto = isExposicion
                        ? 'Carrusel Home + Posición Prioritaria'
                        : p.pautaRedes
                        ? 'Posición Destacada + Pauta en Redes'
                        : 'Cartelera Prioritaria en Búsquedas';

                      return (
                        <tr key={p.id} className="hover:bg-[#F8F9FA]/60 transition-colors">
                          {/* Columna 1 — Evento y Arte: Miniatura cuadrada a todo color (48px x 48px, border-radius: 2px) */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3.5">
                              <div className="w-12 h-12 rounded-[2px] border border-[#E2E8F0] overflow-hidden shrink-0 bg-[#F8F9FA] flex items-center justify-center">
                                {p.urlImagenDestacado || p.foto ? (
                                  <img
                                    src={p.urlImagenDestacado || p.foto}
                                    alt={p.eventoNombre}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="font-mono text-xs font-bold text-[#64748B]">ARTE</span>
                                )}
                              </div>
                              <div className="min-w-0 max-w-xs">
                                <p className="font-sans font-bold text-sm text-[#0F2342] truncate" title={p.eventoNombre}>
                                  {p.eventoNombre}
                                </p>
                                {p.organizacionNombre ? (
                                  <p className="font-mono text-[11px] text-[#64748B] truncate mt-0.5">
                                    {p.organizacionNombre}
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          </td>

                          {/* Columna 2 — Nivel de Pauta Contratado: Nombre monoespaciado + indicador limpio */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 ${
                                  isExposicion ? 'bg-[#C68B17]' : 'bg-[#F5B800]'
                                }`}
                              />
                              <span
                                className={`font-mono text-xs uppercase tracking-wider font-bold ${
                                  isExposicion ? 'text-[#C68B17]' : 'text-[#0F2342]'
                                }`}
                              >
                                {p.plan.toUpperCase()}
                              </span>
                            </div>
                          </td>

                          {/* Columna 3 — Alcance / Cobertura (Sin badges amarillos, texto limpio) */}
                          <td className="py-4 px-6 font-mono text-xs text-[#64748B]">
                            <span>{coberturaTexto}</span>
                          </td>

                          {/* Columna 4 — Acciones Limpias: Enlace tipográfico + Botón rectangular minimalista */}
                          <td className="py-4 px-6 text-right">
                            <div className="inline-flex items-center gap-4">
                              {/* Enlace tipográfico: Editar Banner */}
                              <button
                                type="button"
                                onClick={() => handleOpenPromoImageModal(p)}
                                className="font-mono text-xs uppercase tracking-wider text-[#0F2342] hover:text-[#C68B17] hover:underline font-bold transition-colors cursor-pointer"
                              >
                                {hasPromoImage ? 'Editar Banner' : 'Cargar Banner'}
                              </button>

                              {/* Botón rectangular minimalista (border-radius: 2px, borde 1px solid #0F2342) */}
                              <button
                                type="button"
                                onClick={() => setSelectedEventId(p.eventoId)}
                                className="rounded-[2px] border border-[#0F2342] hover:bg-[#0F2342] text-[#0F2342] hover:text-white px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer"
                              >
                                VER MÉTRICAS / DETALLE
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Paginación */}
            {filteredPromociones.length > pageSize && (
              <div className="p-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row justify-between items-center gap-3">
                <span className="font-mono text-xs text-[#64748B]">
                  Mostrando {paginatedPromociones.length} de {filteredPromociones.length} campañas
                </span>
                <Pagination
                  currentPage={currentPage}
                  pageSize={pageSize}
                  totalItems={filteredPromociones.length}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          VISTA 2: PLANES DE PROMOCIÓN (Catálogo de Tarifas y Comisiones)
         ========================================================================= */}
      {activeSubTab === 'planes' && (
        <div className="space-y-8">
          {/* Cabecera: Título + Botón Rectangular Azul #0F2342 */}
          <div className="border-b border-[#E2E8F0] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="font-display font-black text-[clamp(1.5rem,4vw,2.25rem)] text-[#0F2342] tracking-tight uppercase leading-none">
                PLANES DE PROMOCIÓN
              </h1>
              <p className="font-sans text-xs sm:text-sm text-[#64748B] mt-2">
                Tarifas comerciales, niveles de exposición y comisiones para organizadores.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleOpenCreatePlan}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-[2px] bg-[#0F2342] hover:bg-[#F5B800] text-white hover:text-[#0F2342] font-mono text-xs uppercase tracking-wider font-bold transition-all duration-150 cursor-pointer shadow-xs active:scale-98"
              >
                <FiPlus size={15} />
                <span>CREAR NUEVO PLAN</span>
              </button>
            </div>
          </div>

          {/* Grid de 3 Columnas Arquitectónicas (1 columna en móvil, 3 en escritorio) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 items-stretch">
            {/* 1. Plan Impulso ($350.000 COP / evento): Superficie #FFFFFF, borde 1px solid #E2E8F0 */}
            <div className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] p-6 sm:p-7 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#64748B] block">
                    TIER 01 · BÁSICO
                  </span>
                  <h3 className="font-display font-black text-xl text-[#0F2342] uppercase tracking-tight mt-1">
                    {planesByTier.planImpulso.nombre || 'Plan Impulso'}
                  </h3>
                </div>

                <div className="py-2 border-y border-[#E2E8F0]">
                  <span className="font-mono font-black text-2xl sm:text-3xl text-[#0F2342] tracking-tight block">
                    {formatPrice(planesByTier.planImpulso.precio || 350000)}
                  </span>
                  <span className="font-mono text-[11px] text-[#64748B] uppercase">COP / evento</span>
                </div>

                <p className="text-xs text-[#64748B] leading-relaxed">
                  {planesByTier.planImpulso.detallePublicidad ||
                    'Posicionamiento prioritario en cartelera y mayor visibilidad orgánica en búsquedas.'}
                </p>

                {/* Detalle de Beneficios con guiones largos (—) */}
                <div className="space-y-2 pt-2 border-t border-[#E2E8F0] font-sans text-xs text-[#0F2342]">
                  <p>— Posicionamiento prioritario en cartelera cultural</p>
                  <p>— Inclusión en sección de eventos recomendados</p>
                  <p>— Mayor visibilidad orgánica en búsquedas de cartelera</p>
                </div>

                {/* Comisión comercial en tipografía monoespaciada tabular */}
                <div className="pt-2 font-mono text-xs text-[#0F2342] font-bold">
                  Comisión preferencial: {planesByTier.planImpulso.comisionPorcentaje ?? 10}%
                </div>
              </div>

              {/* Botón de Edición: Rectangular limpio en ancho completo (border-radius: 2px) */}
              <div className="pt-4 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => handleOpenEditPlan(planesByTier.planImpulso)}
                  className="w-full py-3 px-4 rounded-[2px] border border-[#0F2342] bg-[#0F2342] hover:bg-[#1E3A8A] text-white font-mono text-xs uppercase tracking-widest font-bold text-center transition-colors cursor-pointer"
                >
                  EDITAR TARIFA Y BENEFICIOS
                </button>
              </div>
            </div>

            {/* 2. Plan Amplificado ($650.000 COP / evento): Superficie Azul Institucional #0F2342 */}
            <div className="w-full bg-[#0F2342] text-white border border-[#0F2342] rounded-[2px] p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-md">
              <div className="space-y-4">
                <div>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#F5B800] font-bold block">
                    TIER 02 · INTERMEDIO
                  </span>
                  <h3 className="font-display font-black text-xl text-white uppercase tracking-tight mt-1">
                    {planesByTier.planAmplificado.nombre || 'Plan Amplificado'}
                  </h3>
                </div>

                <div className="py-2 border-y border-white/10">
                  <span className="font-mono font-black text-2xl sm:text-3xl text-[#F5B800] tracking-tight block">
                    {formatPrice(planesByTier.planAmplificado.precio || 650000)}
                  </span>
                  <span className="font-mono text-[11px] text-slate-300 uppercase">COP / evento</span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed">
                  {planesByTier.planAmplificado.detallePublicidad ||
                    'Posicionamiento destacado en cartelera y difusión estratégica activa en redes sociales oficiales.'}
                </p>

                {/* Detalle de Beneficios con guiones largos (—) */}
                <div className="space-y-2 pt-2 border-t border-white/10 font-sans text-xs text-slate-200">
                  <p>— Posicionamiento destacado superior en cartelera cultural</p>
                  <p>— Pauta activa y difusión en redes sociales oficiales</p>
                  <p>— Segmentación estratégica por audiencia de Cartagena</p>
                </div>

                {/* Comisión comercial en tipografía monoespaciada tabular */}
                <div className="pt-2 font-mono text-xs text-[#F5B800] font-bold">
                  Comisión preferencial: {planesByTier.planAmplificado.comisionPorcentaje ?? 8.5}%
                </div>
              </div>

              {/* Botón de Edición: Rectangular limpio en Amarillo #F5B800 con texto #0F2342 */}
              <div className="pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => handleOpenEditPlan(planesByTier.planAmplificado)}
                  className="w-full py-3 px-4 rounded-[2px] bg-[#F5B800] hover:bg-[#E0A800] text-[#0F2342] font-mono text-xs uppercase tracking-widest font-black text-center transition-colors cursor-pointer shadow-sm"
                >
                  EDITAR TARIFA Y BENEFICIOS
                </button>
              </div>
            </div>

            {/* 3. Plan Exposición Total: Fondo Amarillo Ámbar Vibrante #F5B800, borde #D97706 con borde superior #B45309 */}
            <div className="w-full bg-[#F5B800] text-[#0F2342] border border-[#D97706] border-t-4 border-t-[#B45309] rounded-[2px] p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-lg relative">
              <div className="space-y-4">
                <div>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#0F2342]/80 font-bold block">
                    TIER 03 · EXPOSICIÓN TOTAL
                  </span>
                  <h3 className="font-display font-black text-xl text-[#0F2342] uppercase tracking-tight mt-1">
                    {planesByTier.planExposicion.nombre || 'Plan Exposición Total'}
                  </h3>
                </div>

                <div className="py-2 border-y border-[#D97706]/40">
                  <span className="font-mono font-black text-2xl sm:text-3xl text-[#0F2342] tracking-tight block">
                    {formatPrice(planesByTier.planExposicion.precio || 1000000)}
                  </span>
                  <span className="font-mono text-[11px] text-[#0F2342]/70 uppercase font-bold">COP / evento</span>
                </div>

                <p className="text-xs text-[#0F2342]/90 leading-relaxed font-medium">
                  {planesByTier.planExposicion.detallePublicidad ||
                    'Aparición garantizada en el Carrusel Principal del Home, difusión omnicanal y soporte prioritario.'}
                </p>

                {/* Detalle de Beneficios con guiones largos (—) */}
                <div className="space-y-2 pt-2 border-t border-[#D97706]/40 font-sans text-xs text-[#0F2342] font-medium">
                  <p>— Espacio exclusivo garantizado en Carrusel Principal del Home</p>
                  <p>— Difusión prioritaria omnicanal (Web, Push y Redes)</p>
                  <p>— Soporte preferencial 24/7 y auditoría de boletería</p>
                </div>

                {/* Comisión comercial en tipografía monoespaciada tabular */}
                <div className="pt-2 font-mono text-xs text-[#0F2342] font-bold">
                  Comisión preferencial: {planesByTier.planExposicion.comisionPorcentaje ?? 6}%
                </div>
              </div>

              {/* Botón de Edición: Rectangular sólido en Azul Institucional #0F2342 con texto en Blanco Puro #FFFFFF */}
              <div className="pt-4 border-t border-[#D97706]/40">
                <button
                  type="button"
                  onClick={() => handleOpenEditPlan(planesByTier.planExposicion)}
                  className="w-full py-3 px-4 rounded-[2px] bg-[#0F2342] hover:bg-[#1E3A8A] text-white font-mono text-xs uppercase tracking-widest font-bold text-center transition-colors cursor-pointer shadow-sm border border-[#0F2342]"
                >
                  EDITAR TARIFA Y BENEFICIOS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DRAWER MODAL: CREAR / EDITAR PLAN (SECCIÓN 3)
         ========================================================================= */}
      {planDrawerOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex justify-end">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => !savingPlan && setPlanDrawerOpen(false)}
          />

          <div
            className="relative z-10 w-full sm:w-[500px] md:w-[540px] bg-[#FFFFFF] h-full shadow-2xl border-l border-[#E2E8F0] flex flex-col justify-between animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera Drawer #0F2342 */}
            <div className="bg-[#0F2342] text-white p-6 flex items-center justify-between border-b border-white/10">
              <div>
                <h3 className="font-display font-black text-lg uppercase tracking-tight text-white">
                  {editingPlanId ? 'Editar Tarifa y Beneficios' : 'Crear Nuevo Plan de Promoción'}
                </h3>
                <p className="font-mono text-xs text-slate-300 mt-0.5">
                  Parámetros comerciales y niveles de exposición
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPlanDrawerOpen(false)}
                disabled={savingPlan}
                className="p-1 rounded-[2px] text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSavePlanSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              {planFormError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono rounded-[2px] flex items-center gap-2">
                  <FiAlertCircle size={15} className="shrink-0 text-rose-600" />
                  <span>{planFormError}</span>
                </div>
              )}

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#0F2342] font-bold mb-1.5">
                  Nombre del Plan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={planForm.nombre}
                  onChange={(e) => setPlanForm({ ...planForm, nombre: e.target.value })}
                  placeholder="Ej. Plan Exposición Total"
                  className="w-full px-3.5 py-2.5 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] text-xs sm:text-sm text-[#0F2342] focus:outline-none focus:border-[#0F2342]"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#0F2342] font-bold mb-1.5">
                  Código Textual <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={planForm.codigo}
                  onChange={(e) => setPlanForm({ ...planForm, codigo: e.target.value.toUpperCase() })}
                  placeholder="EJ: PLAN_EXPOSICION_TOTAL"
                  className="w-full px-3.5 py-2.5 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] text-xs sm:text-sm text-[#0F2342] font-mono focus:outline-none focus:border-[#0F2342]"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#0F2342] font-bold mb-1.5">
                  Detalle Publicitario
                </label>
                <textarea
                  rows={3}
                  value={planForm.detallePublicidad}
                  onChange={(e) => setPlanForm({ ...planForm, detallePublicidad: e.target.value })}
                  placeholder="Descripción de alcance para los organizadores..."
                  className="w-full p-3 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] text-xs sm:text-sm text-[#0F2342] focus:outline-none focus:border-[#0F2342] resize-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#0F2342] font-bold mb-1.5">
                  Precio Fijo (COP) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1000"
                  value={planForm.precio}
                  onChange={(e) => setPlanForm({ ...planForm, precio: e.target.value })}
                  placeholder="650000"
                  className="w-full px-3.5 py-2.5 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] text-xs sm:text-sm text-[#0F2342] font-mono focus:outline-none focus:border-[#0F2342]"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#0F2342] font-bold mb-1.5">
                  Porcentaje de Comisión (%) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  step="0.1"
                  value={planForm.comisionPorcentaje}
                  onChange={(e) => setPlanForm({ ...planForm, comisionPorcentaje: e.target.value })}
                  placeholder="8.5"
                  className="w-full px-3.5 py-2.5 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] text-xs sm:text-sm text-[#0F2342] font-mono focus:outline-none focus:border-[#0F2342]"
                />
              </div>

              <div className="p-4 rounded-[2px] bg-[#F8F9FA] border border-[#E2E8F0] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#0F2342] block">
                      Pauta en Redes Sociales
                    </span>
                    <span className="font-mono text-[10px] text-[#64748B]">
                      ¿Incluye difusión activa en canales oficiales?
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={planForm.pautaRedes}
                    onChange={(e) => setPlanForm({ ...planForm, pautaRedes: e.target.checked })}
                    className="w-4 h-4 accent-[#0F2342] cursor-pointer"
                  />
                </div>

                <div className="border-t border-[#E2E8F0] pt-3 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#0F2342] block">
                      Nivel Exposición Total (Premium)
                    </span>
                    <span className="font-mono text-[10px] text-[#64748B]">
                      Habilita aparición exclusiva en Carrusel del Home
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={planForm.premium}
                    onChange={(e) => setPlanForm({ ...planForm, premium: e.target.checked })}
                    className="w-4 h-4 accent-[#F5B800] cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setPlanDrawerOpen(false)}
                  disabled={savingPlan}
                  className="px-4 py-2.5 rounded-[2px] border border-[#E2E8F0] hover:bg-[#F8F9FA] text-[#64748B] font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingPlan}
                  className="px-5 py-2.5 rounded-[2px] bg-[#0F2342] hover:bg-[#F5B800] text-white hover:text-[#0F2342] font-mono text-xs uppercase tracking-wider font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {savingPlan ? 'Guardando...' : 'Guardar Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* =========================================================================
          DRAWER MODAL: ASIGNAR / EDITAR BANNER DE CAMPAÑA
         ========================================================================= */}
      {promoImageModalEvent && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex justify-end">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => !savingPromoImage && setPromoImageModalEvent(null)}
          />

          <div
            className="relative z-10 w-full sm:w-[500px] md:w-[540px] bg-[#FFFFFF] h-full shadow-2xl border-l border-[#E2E8F0] flex flex-col justify-between animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera Drawer #0F2342 */}
            <div className="bg-[#0F2342] text-white p-6 flex items-center justify-between border-b border-white/10">
              <div>
                <h3 className="font-display font-black text-lg uppercase tracking-tight text-white">
                  Creatividad de Campaña
                </h3>
                <p className="font-mono text-xs text-slate-300 mt-0.5 truncate max-w-sm">
                  {promoImageModalEvent.eventoNombre}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPromoImageModalEvent(null)}
                disabled={savingPromoImage}
                className="p-1 rounded-[2px] text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {promoImageError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono rounded-[2px] flex items-center gap-2">
                  <FiAlertCircle size={15} className="shrink-0 text-rose-600" />
                  <span>{promoImageError}</span>
                </div>
              )}

              {/* Previsualización a todo color */}
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#0F2342] font-bold mb-2">
                  Previsualización de la Pieza
                </label>
                <div className="relative w-full aspect-[16/9] rounded-[2px] border border-[#E2E8F0] overflow-hidden bg-[#0F2342] flex items-center justify-center">
                  {inputPromoImage.trim() ? (
                    <img
                      src={inputPromoImage.trim()}
                      alt="Banner promocional"
                      className="w-full h-full object-cover"
                      onError={() => setPromoImageError('No se pudo previsualizar la imagen desde esta URL.')}
                    />
                  ) : (
                    <div className="text-center font-mono text-xs text-slate-400 p-4">
                      Sin pieza gráfica cargada
                    </div>
                  )}
                </div>
              </div>

              {/* Carga directa de archivo */}
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#0F2342] font-bold mb-1.5">
                  Subir Archivo de Imagen
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => promoFileInputRef.current?.click()}
                    disabled={uploadingPromoFile}
                    className="px-4 py-2.5 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] hover:bg-[#F8F9FA] text-[#0F2342] font-mono text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
                  >
                    {uploadingPromoFile ? 'Subiendo...' : 'Seleccionar Archivo (JPG/PNG)'}
                  </button>
                  <input
                    type="file"
                    ref={promoFileInputRef}
                    onChange={handlePromoFileUpload}
                    accept="image/jpeg, image/png, image/webp"
                    className="hidden"
                  />
                </div>
                <p className="font-mono text-[11px] text-[#64748B] mt-1">
                  Proporción recomendada: 16:9 (Máximo 5 MB).
                </p>
              </div>

              {/* URL directa */}
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#0F2342] font-bold mb-1.5">
                  O Enlace Directo (URL)
                </label>
                <input
                  type="url"
                  value={inputPromoImage}
                  onChange={(e) => setInputPromoImage(e.target.value)}
                  placeholder="https://servidor.com/arte.jpg"
                  className="w-full px-3.5 py-2.5 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] text-xs sm:text-sm text-[#0F2342] font-mono focus:outline-none focus:border-[#0F2342]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setPromoImageModalEvent(null)}
                  disabled={savingPromoImage}
                  className="px-4 py-2.5 rounded-[2px] border border-[#E2E8F0] hover:bg-[#F8F9FA] text-[#64748B] font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSavePromoImage}
                  disabled={savingPromoImage || uploadingPromoFile}
                  className="px-5 py-2.5 rounded-[2px] bg-[#0F2342] hover:bg-[#F5B800] text-white hover:text-[#0F2342] font-mono text-xs uppercase tracking-wider font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {savingPromoImage ? 'Guardando...' : 'Asignar Banner'}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL DETALLE DE EVENTO (Abre vista completa a la derecha) */}
      {selectedEventId && (
        <EventDetailView
          eventId={selectedEventId}
          onClose={() => setSelectedEventId(null)}
          onBack={() => setSelectedEventId(null)}
          readOnly={true}
          allowSuspend={false}
        />
      )}
    </div>
  );
}
