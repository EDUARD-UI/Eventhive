import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Sparkles,
  Search,
  Eye,
  Building2,
  RefreshCw,
  Award,
  CheckCircle2,
  DollarSign,
  Image as ImageIcon,
  Edit3,
  Plus,
  X,
  Check,
  Calendar,
  Layers,
  AlertCircle,
  Loader2,
  Save,
  Star,
  FileText,
  Share2,
} from 'lucide-react';
import Swal from 'sweetalert2';
import Badge from '../../components/Shared/Badge.jsx';
import Pagination from '../../components/Shared/Pagination.jsx';
import PlanCard from '../../components/Shared/PlanCard.jsx';
import EventDetailView from '../Organizador/EventDetailView.jsx';
import { formatPrice, formatHora12 } from '../../utils/formatters.js';
import { promotionPlanService } from '../../services/promotionPlanService.js';

const formatFechaHora = (fechaStr) => {
  if (!fechaStr || fechaStr === '—') return '—';
  try {
    const d = new Date(fechaStr);
    if (isNaN(d.getTime())) return fechaStr;
    const fecha = d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
    const hora = formatHora12(fechaStr);
    return hora ? `${fecha} · ${hora}` : fecha;
  } catch {
    return fechaStr;
  }
};

export default function MarketingPromocionesView({ initialTab = 'eventos', onNavigateTab }) {
  const [activeSubTab, setActiveSubTab] = useState(initialTab || 'eventos'); // 'eventos' | 'planes'
  const [promociones, setPromociones] = useState([]);
  const [stats, setStats] = useState({ eventosActivosPromocionados: 0, eventosPorPlan: [] });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState('TODOS');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Paginación para Cards de Planes
  const [planesPage, setPlanesPage] = useState(1);
  const planesPageSize = 6;

  // Modal a la derecha: Detalle de evento
  const [selectedEventId, setSelectedEventId] = useState(null);

  // Modal a la derecha: Asignar imagen destacada (Solo planes Premium)
  const [promoImageModalEvent, setPromoImageModalEvent] = useState(null);
  const [inputPromoImage, setInputPromoImage] = useState('');
  const [savingPromoImage, setSavingPromoImage] = useState(false);
  const [promoImageError, setPromoImageError] = useState(null);

  // Gestión de Planes de Promoción
  const [planes, setPlanes] = useState([]);
  const [loadingPlanes, setLoadingPlanes] = useState(false);
  const [planDrawerOpen, setPlanDrawerOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null); // null = nuevo
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
      setPlanes(data);
    } catch (err) {
      if (err.status === 403) {
        setAuthError('Acceso denegado (403): Se requieren permisos de MARKETING o ADMINISTRADOR para gestionar planes y eventos.');
      } else if (err.status === 401) {
        setAuthError('Tu sesión ha expirado o no es válida. Por favor, inicia sesión nuevamente.');
      } else {
        console.warn('Error al cargar planes de promoción:', err);
      }
    } finally {
      setLoadingPlanes(false);
    }
  }, []);

  // Cargar eventos promocionados y estadísticas reales desde el backend
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
        const planNombre = p.planNombre || planObj.nombre || p.plan || (isPremium ? 'Posicionamiento Premium' : 'Destacado Estándar');
        const precio = Number(p.precio || p.montoPagado || planObj.precio || 0);

        return {
          id: p.id || evId,
          eventoId: evId,
          eventoNombre: p.eventoNombre || p.eventoTitulo || p.titulo || 'Evento Cultural',
          organizacionNombre:
            p.organizacionNombre ||
            p.organizacion?.razonSocial ||
            p.organizacion?.nombre ||
            'Organización Aliada',
          plan: planNombre,
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
        setAuthError('Acceso denegado (403): No cuentas con permisos de MARKETING o ADMINISTRADOR para consultar eventos promocionados.');
      } else if (err.status === 401) {
        setAuthError('Tu sesión ha expirado o no es válida. Por favor, inicia sesión nuevamente.');
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

  // Filtrado de eventos promocionados
  const filteredPromociones = useMemo(() => {
    return promociones.filter((p) => {
      if (selectedPlanFilter === 'PREMIUM' && !p.premium) return false;
      if (selectedPlanFilter === 'ESTANDAR' && p.premium) return false;

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        p.eventoNombre?.toLowerCase().includes(term) ||
        p.organizacionNombre?.toLowerCase().includes(term) ||
        p.plan?.toLowerCase().includes(term)
      );
    });
  }, [promociones, selectedPlanFilter, searchTerm]);

  // Paginado en cliente para eventos
  const paginatedPromociones = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPromociones.slice(start, start + pageSize);
  }, [filteredPromociones, currentPage, pageSize]);

  // Paginado en cliente para planes
  const paginatedPlanes = useMemo(() => {
    const start = (planesPage - 1) * planesPageSize;
    return planes.slice(start, start + planesPageSize);
  }, [planes, planesPage, planesPageSize]);

  // Abrir drawer para asignar imagen destacada (solo para planes Premium)
  const handleOpenPromoImageModal = (item) => {
    if (!item.premium) {
      Swal.fire({
        icon: 'info',
        title: 'Plan Estándar',
        text: 'La carga de imagen de banner está reservada exclusivamente para planes contratados con beneficio Premium.',
      });
      return;
    }
    setPromoImageModalEvent(item);
    setInputPromoImage(item.urlImagenDestacado || '');
    setPromoImageError(null);
  };

  // Guardar imagen destacada (PUT /api/promociones/eventos/{id}/posicionar)
  const handleSavePromoImage = async () => {
    if (!promoImageModalEvent) return;
    const urlTrimmed = inputPromoImage.trim();

    if (!urlTrimmed) {
      setPromoImageError('Por favor ingresa la URL de la imagen para el banner.');
      return;
    }

    try {
      setSavingPromoImage(true);
      setPromoImageError(null);
      await promotionPlanService.asignarImagenPromocional(
        promoImageModalEvent.eventoId,
        urlTrimmed
      );

      // Actualizar listado localmente
      setPromociones((prev) =>
        prev.map((item) =>
          item.eventoId === promoImageModalEvent.eventoId
            ? { ...item, urlImagenDestacado: urlTrimmed }
            : item
        )
      );

      Swal.fire({
        icon: 'success',
        title: '¡Foto para Banner Guardada!',
        text: 'La imagen destacada ha sido asociada y se mostrará en el carrusel principal.',
        timer: 2000,
        confirmButtonColor: '#0B1B3D',
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

  // Guardar Plan mediante el backend
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
          confirmButtonColor: '#0B1B3D',
        });
      } else {
        await promotionPlanService.crearPlan(payload);
        Swal.fire({
          icon: 'success',
          title: 'Plan creado',
          text: `El plan "${nombreTrimmed}" ha sido registrado exitosamente.`,
          timer: 1800,
          confirmButtonColor: '#0B1B3D',
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
    <div className="space-y-6">
      {/* Cabecera Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" />
            Marketing & Promoción de Eventos
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Supervisa los eventos con contratación pagada de promoción, gestiona las imágenes para carrusel premium y administra las tarifas de posicionamiento.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setAuthError(null);
              fetchPromociones();
              loadPlanes();
            }}
            title="Recargar datos"
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <RefreshCw size={15} className={loading || loadingPlanes ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Alerta de Autorización / Sesión */}
      {authError && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>{authError}</span>
          </div>
          <button
            type="button"
            onClick={() => setAuthError(null)}
            className="text-amber-600 hover:text-amber-800 font-bold ml-2 text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Subnavegación de Pestañas */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => handleTabChange('eventos')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'eventos'
              ? 'bg-slate-900 text-amber-400 shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers size={14} />
          <span>Eventos Promocionados</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-500 text-[10px]">
            {promociones.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('planes')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'planes'
              ? 'bg-slate-900 text-amber-400 shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award size={14} />
          <span>Planes de Promoción</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-500 text-[10px]">
            {planes.length}
          </span>
        </button>
      </div>

      {/* PANEL 1: EVENTOS PROMOCIONADOS */}
      {activeSubTab === 'eventos' && (
        <div className="space-y-6">
          {/* Métricas Requeridas de Marketing (7.4) */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 1. Número de eventos activos con planes de promoción pagados */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Eventos Activos con Promoción Pagada
                  </p>
                  <p className="text-2xl font-black text-slate-900 leading-tight">
                    {stats.eventosActivosPromocionados || promociones.filter((p) => p.estado === 'ACTIVO' || p.estado === 'VIGENTE').length}
                  </p>
                </div>
              </div>

              {/* Total Promociones Registradas */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold">
                  <Award size={22} />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Total Promociones Pagadas
                  </p>
                  <p className="text-2xl font-black text-slate-900 leading-tight">
                    {promociones.length}
                  </p>
                </div>
              </div>

              {/* Beneficio Premium */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-bold">
                  <Star size={22} />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Con Beneficio Premium
                  </p>
                  <p className="text-2xl font-black text-slate-900 leading-tight">
                    {promociones.filter((p) => p.premium).length}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Número de eventos por cada plan de promoción */}
            {stats.eventosPorPlan && stats.eventosPorPlan.length > 0 && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <Sparkles size={14} className="text-amber-500" />
                    <span>Distribución de Eventos por Plan de Promoción</span>
                  </h4>
                  <span className="text-[11px] text-slate-400 font-medium">Datos en tiempo real</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {stats.eventosPorPlan.map((planStat, idx) => (
                    <div
                      key={planStat.planId || idx}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold text-slate-800 truncate" title={planStat.planNombre}>
                          {planStat.planNombre}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {planStat.planCodigo || 'PLAN'}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 text-xs font-black shrink-0">
                        {planStat.cantidadEventos} {planStat.cantidadEventos === 1 ? 'evento' : 'eventos'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Barra de Filtros */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Buscar por evento u organización..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all"
              />
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold gap-1 w-full md:w-auto overflow-x-auto">
              {[
                { label: 'Todos los Planes', val: 'TODOS' },
                { label: 'Planes Premium', val: 'PREMIUM' },
                { label: 'Planes Estándar', val: 'ESTANDAR' },
              ].map((f) => (
                <button
                  key={f.val}
                  type="button"
                  onClick={() => {
                    setSelectedPlanFilter(f.val);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                    selectedPlanFilter === f.val
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* TABLA DE EVENTOS QUE HAN PAGADO PROMOCIÓN (SIN IDs INTERNOS) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-400 text-xs font-medium">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
                Cargando eventos promocionados...
              </div>
            ) : filteredPromociones.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs font-medium">
                No se encontraron eventos con promociones pagadas registradas.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="py-3.5 px-4">Evento</th>
                      <th className="py-3.5 px-4">Organización</th>
                      <th className="py-3.5 px-4">Plan Contratado</th>
                      <th className="py-3.5 px-4">Beneficios del Plan</th>
                      <th className="py-3.5 px-4">Monto Pagado</th>
                      <th className="py-3.5 px-4">Vigencia</th>
                      <th className="py-3.5 px-4">Estado</th>
                      <th className="py-3.5 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedPromociones.map((p) => {
                      const isActivo = p.estado === 'ACTIVO' || p.estado === 'VIGENTE' || p.estado === 'CONFIRMADO';
                      const hasPromoImage = Boolean(p.urlImagenDestacado);

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Evento (Sin IDs internos visibles) */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-slate-100 flex items-center justify-center">
                                {p.urlImagenDestacado || p.foto ? (
                                  <img
                                    src={p.urlImagenDestacado || p.foto}
                                    alt={p.eventoNombre}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full bg-slate-200 dark:bg-slate-800" />
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 line-clamp-1 max-w-[220px]">
                                  {p.eventoNombre}
                                </p>
                                <span className="text-[11px] text-slate-400 font-medium">Evento Cultural</span>
                              </div>
                            </div>
                          </td>

                          {/* Organización */}
                          <td className="py-3.5 px-4 font-medium text-slate-700">
                            <div className="flex items-center gap-1.5">
                              <Building2 size={13} className="text-slate-400 shrink-0" />
                              <span className="truncate max-w-[170px]">{p.organizacionNombre}</span>
                            </div>
                          </td>

                          {/* Plan Contratado */}
                          <td className="py-3.5 px-4 font-semibold text-slate-800">
                            <span>{p.plan}</span>
                          </td>

                          {/* Beneficios / Atributos del Plan */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col gap-1 items-start">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-900 border border-amber-200">
                                <Award size={10} />
                                <span>Destacado</span>
                              </span>

                              {p.premium ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                                  <Star size={10} />
                                  <span>Premium</span>
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-medium">
                                  Plan Estándar
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Precio Pagado */}
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                            {formatPrice(p.precio)}
                          </td>

                          {/* Vigencia Formateada */}
                          <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                            {formatFechaHora(p.fechaInicio)}
                          </td>

                          {/* Estado */}
                          <td className="py-3.5 px-4">
                            <Badge variant={isActivo ? 'success' : 'neutral'} size="xs">
                              {isActivo ? 'ACTIVA' : p.estado}
                            </Badge>
                          </td>

                          {/* Acciones */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              {/* SOLO si el plan tiene premium = true se muestra "Agregar foto para banner" */}
                              {p.premium && isActivo && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenPromoImageModal(p)}
                                  title="Agregar o actualizar foto para el banner del carrusel"
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-[11px] uppercase tracking-wider border border-amber-300 transition-all cursor-pointer shadow-2xs"
                                >
                                  <ImageIcon size={12} className="text-amber-600" />
                                  <span>{hasPromoImage ? 'Editar Banner' : 'Agregar foto para banner'}</span>
                                </button>
                              )}

                              {/* Botón Detalle Evento */}
                              <button
                                type="button"
                                onClick={() => setSelectedEventId(p.eventoId)}
                                title="Ver detalle del evento"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-amber-300 font-bold text-[11px] uppercase tracking-wider shadow-xs transition-all cursor-pointer"
                              >
                                <Eye size={12} />
                                <span>Detalle</span>
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
              <div className="p-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-500 font-medium">
                  Mostrando {paginatedPromociones.length} de {filteredPromociones.length} promociones
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

      {/* PANEL 2: PLANES DE PROMOCIÓN (CARDS VERTICALES CON PAGINACIÓN, SIN TABLA, SIN ARRASTRE) */}
      {activeSubTab === 'planes' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>Planes de Promoción Disponibles</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tarifas y parámetros oficiales de posicionamiento para organizaciones.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenCreatePlan}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-amber-400 font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
            >
              <Plus size={15} />
              <span>Crear Nuevo Plan</span>
            </button>
          </div>

          {/* Cards de planes organizadas en grid responsive con paginación */}
          {loadingPlanes ? (
            <div className="p-16 text-center text-slate-400 text-xs font-medium bg-white rounded-3xl border border-slate-200/80">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
              Cargando planes de promoción...
            </div>
          ) : planes.length === 0 ? (
            <div className="p-16 text-center text-slate-400 text-xs font-medium bg-white rounded-3xl border border-slate-200/80">
              No hay planes de promoción registrados en el catálogo.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {paginatedPlanes.map((plan) => (
                  <PlanCard
                    key={plan.id || plan.codigo}
                    plan={plan}
                    className="w-full"
                    mode="manage"
                    onEdit={() => handleOpenEditPlan(plan)}
                  />
                ))}
              </div>

              {planes.length > planesPageSize && (
                <div className="p-4 bg-white rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row justify-between items-center gap-3">
                  <span className="text-xs text-slate-500 font-medium">
                    Mostrando {paginatedPlanes.length} de {planes.length} planes
                  </span>
                  <Pagination
                    currentPage={planesPage}
                    pageSize={planesPageSize}
                    totalItems={planes.length}
                    onPageChange={setPlanesPage}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* DRAWER MODAL LATERAL DERECHO: CREAR / EDITAR PLAN (SECCIÓN 12.1) */}
      {planDrawerOpen && (
        <div className="fixed inset-0 z-[9999] flex justify-end">
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-2xs cursor-pointer transition-opacity"
            onClick={() => setPlanDrawerOpen(false)}
          />

          <div
            className="relative z-50 w-full sm:w-[500px] md:w-[540px] bg-white h-full shadow-2xl border-l border-slate-200 overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Cabecera del drawer */}
              <div className="bg-[#131b2e] p-6 text-white flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                    <Award size={20} />
                  </div>
                  <div>
                    <h3 className="font-display text-base sm:text-lg font-bold text-white leading-tight">
                      {editingPlanId ? 'Editar Plan de Promoción' : 'Crear Plan de Promoción'}
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Tarifa y parámetros de posicionamiento para organizaciones
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPlanDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Formulario con campos requeridos */}
              <form id="plan-drawer-form" onSubmit={handleSavePlanSubmit} className="p-6 space-y-4">
                {planFormError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 flex items-center gap-2">
                    <AlertCircle size={16} className="text-rose-600 shrink-0" />
                    <span>{planFormError}</span>
                  </div>
                )}

                {/* 1. Nombre */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Nombre del Plan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={planForm.nombre}
                    onChange={(e) => setPlanForm({ ...planForm, nombre: e.target.value })}
                    placeholder="Ej. Plan Banner Premium"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 text-xs sm:text-sm text-slate-800 outline-none"
                  />
                </div>

                {/* 2. Código Textual */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Código Textual <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={planForm.codigo}
                    onChange={(e) => setPlanForm({ ...planForm, codigo: e.target.value.toUpperCase() })}
                    placeholder="EJ: PLAN_BANNER_PREMIUM"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 text-xs sm:text-sm text-slate-800 outline-none font-mono"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Identificador único del plan en mayúsculas.</p>
                </div>

                {/* 3. Detalle de Publicidad */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Detalle de Publicidad
                  </label>
                  <textarea
                    rows={3}
                    value={planForm.detallePublicidad}
                    onChange={(e) => setPlanForm({ ...planForm, detallePublicidad: e.target.value })}
                    placeholder="Detalles sobre los beneficios publicitarios que ofrece este plan a la organización..."
                    className="w-full p-3 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 text-xs sm:text-sm text-slate-800 outline-none resize-none"
                  />
                </div>

                {/* 4. Precio de Pago Fijo */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Precio de Pago Fijo (COP) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={planForm.precio}
                    onChange={(e) => setPlanForm({ ...planForm, precio: e.target.value })}
                    placeholder="100000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 text-xs sm:text-sm text-slate-800 outline-none font-mono"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Precio fijo de contratación del plan en COP.
                  </p>
                </div>

                {/* 5. Porcentaje de Comisión */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
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
                    placeholder="10"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 text-xs sm:text-sm text-slate-800 outline-none font-mono"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Porcentaje de comisión comercial sobre ventas de entradas (entre 0% y 100%).
                  </p>
                </div>

                {/* Booleans: Lleva pauta de redes y Premium */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Lleva Pauta de Redes
                      </span>
                      <span className="text-[11px] text-slate-500">
                        ¿Incluye difusión activa en canales de redes sociales?
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPlanForm({ ...planForm, pautaRedes: true })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          planForm.pautaRedes
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600'
                        }`}
                      >
                        Sí
                      </button>
                      <button
                        type="button"
                        onClick={() => setPlanForm({ ...planForm, pautaRedes: false })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          !planForm.pautaRedes
                            ? 'bg-slate-700 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Plan Premium
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Habilita la aparición en el Carrusel Principal del Home
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPlanForm({ ...planForm, premium: true })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          planForm.premium
                            ? 'bg-amber-500 text-slate-950 shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600'
                        }`}
                      >
                        Sí
                      </button>
                      <button
                        type="button"
                        onClick={() => setPlanForm({ ...planForm, premium: false })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          !planForm.premium
                            ? 'bg-slate-700 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer fijo del drawer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setPlanDrawerOpen(false)}
                disabled={savingPlan}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                form="plan-drawer-form"
                type="submit"
                disabled={savingPlan}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-amber-300 font-bold text-xs uppercase tracking-wider shadow-sm hover:shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                {savingPlan ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Guardar Plan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER MODAL LATERAL DERECHO: ASIGNAR FOTO PARA BANNER (SECCIÓN 13) */}
      {promoImageModalEvent && (
        <div className="fixed inset-0 z-[9999] flex justify-end">
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-2xs cursor-pointer transition-opacity"
            onClick={() => setPromoImageModalEvent(null)}
          />

          <div
            className="relative z-50 w-full sm:w-[500px] md:w-[540px] bg-white h-full shadow-2xl border-l border-slate-200 overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Header del Modal */}
              <div className="bg-[#131b2e] p-6 text-white flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                    <ImageIcon size={20} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-base leading-tight">
                      Foto para Banner del Carrusel
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Solo eventos con plan Premium pagado y activo
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPromoImageModalEvent(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Contenido */}
              <div className="p-6 space-y-5">
                {promoImageError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 flex items-center gap-2">
                    <AlertCircle size={16} className="text-rose-600 shrink-0" />
                    <span>{promoImageError}</span>
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-600">
                    Evento Elegible
                  </span>
                  <h4 className="font-bold text-sm text-slate-900">
                    {promoImageModalEvent.eventoNombre}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Organización: <strong className="text-slate-800">{promoImageModalEvent.organizacionNombre}</strong> · Plan: <strong className="text-slate-800">{promoImageModalEvent.plan}</strong>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    URL de la Imagen para Banner Destacado <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={inputPromoImage}
                    onChange={(e) => setInputPromoImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 text-xs sm:text-sm text-slate-800 transition-all outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Esta imagen se asignará a <code>url_imagen_destacado</code> y se utilizará en el carrusel principal.
                  </p>
                </div>

                {/* Previsualización del Banner */}
                <div className="space-y-2">
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Vista previa de banner horizontal:
                  </span>
                  <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 flex items-center justify-center">
                    {inputPromoImage.trim() ? (
                      <>
                        <img
                          src={inputPromoImage}
                          alt="Banner Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-md border border-amber-300 flex items-center gap-1">
                          <span>★</span> BANNER PREMIUM
                        </span>
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <p className="font-black text-sm drop-shadow-sm line-clamp-1">
                            {promoImageModalEvent.eventoNombre}
                          </p>
                          <p className="text-[11px] text-amber-300 font-medium drop-shadow-sm">
                            {promoImageModalEvent.organizacionNombre}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-6 text-slate-400 text-xs">
                        Ingresa una URL de imagen válida para previsualizar el banner.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setPromoImageModalEvent(null)}
                disabled={savingPromoImage}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSavePromoImage}
                disabled={savingPromoImage || !inputPromoImage.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-amber-300 font-bold text-xs uppercase tracking-wider shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {savingPromoImage ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    <span>Guardar Foto para Banner</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Drawer a la derecha con el detalle del evento */}
      {selectedEventId && (
        <EventDetailView
          eventId={selectedEventId}
          isDrawer={true}
          onBack={() => setSelectedEventId(null)}
        />
      )}
    </div>
  );
}
