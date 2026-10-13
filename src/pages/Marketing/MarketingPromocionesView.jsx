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
  Trash2,
  X,
  Check,
  Calendar,
  Layers,
} from 'lucide-react';
import Swal from 'sweetalert2';
import Badge from '../../components/Shared/Badge.jsx';
import Pagination from '../../components/Shared/Pagination.jsx';
import EventDetailView from '../Organizador/EventDetailView.jsx';
import { httpClient } from '../../services/httpClient.js';
import { formatPrice } from '../../utils/formatters.js';
import { promotionPlanService } from '../../services/promotionPlanService.js';

export default function MarketingPromocionesView() {
  const [activeSubTab, setActiveSubTab] = useState('eventos'); // 'eventos' | 'planes'
  const [promociones, setPromociones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState('TODOS');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal a la derecha: Detalle de evento
  const [selectedEventId, setSelectedEventId] = useState(null);

  // Modal a la derecha: Asignar imagen promocional
  const [promoImageModalEvent, setPromoImageModalEvent] = useState(null);
  const [inputPromoImage, setInputPromoImage] = useState('');
  const [savingPromoImage, setSavingPromoImage] = useState(false);

  // Gestión de Planes de Promoción
  const [planes, setPlanes] = useState([]);
  const [editingPlan, setEditingPlan] = useState(null); // null o plan object

  const loadPlanes = useCallback(() => {
    setPlanes(promotionPlanService.getPlanes());
  }, []);

  // Cargar promociones reales desde el backend (GET /api/promociones y GET /api/eventos/destacados)
  const fetchPromociones = useCallback(async () => {
    try {
      setLoading(true);
      const [promosRes, destacadosRes] = await Promise.allSettled([
        httpClient.get('/promociones', { page: 0, size: 50 }),
        httpClient.get('/eventos/destacados', { page: 0, size: 50 }),
      ]);

      const promosList =
        promosRes.status === 'fulfilled'
          ? Array.isArray(promosRes.value)
            ? promosRes.value
            : promosRes.value?.content || promosRes.value?.data || []
          : [];

      const destacadosList =
        destacadosRes.status === 'fulfilled'
          ? Array.isArray(destacadosRes.value)
            ? destacadosRes.value
            : destacadosRes.value?.content || destacadosRes.value?.data || []
          : [];

      const mergedItems = [];
      const seenEventIds = new Set();

      promosList.forEach((p) => {
        const evId = p.eventoId || p.id;
        seenEventIds.add(String(evId));
        mergedItems.push({
          id: p.id || evId,
          eventoId: evId,
          eventoNombre: p.eventoNombre || p.eventoTitulo || p.titulo || 'Evento Cultural',
          organizacionNombre: p.organizacionNombre || p.organizacion?.razonSocial || 'Organización Aliada',
          plan: p.plan || p.tipoPlan || (p.descuento ? `Plan Descuento ${p.descuento}%` : 'Destacado Home'),
          precio: p.precio || p.montoPagado || 50000,
          fechaInicio: p.fechaInicio || p.fecha || '2026-10-01',
          fechaFinal: p.fechaFinal || p.fechaFin || '2026-10-31',
          estado: (p.estado || (p.activo !== false ? 'ACTIVO' : 'FINALIZADO')).toUpperCase(),
          foto: p.foto || p.imagenUrl || null,
          urlImagenDestacado: p.urlImagenDestacado || p.imagenPromocional || null,
        });
      });

      destacadosList.forEach((d) => {
        if (!seenEventIds.has(String(d.id))) {
          seenEventIds.add(String(d.id));
          mergedItems.push({
            id: `dest-${d.id}`,
            eventoId: d.id,
            eventoNombre: d.titulo || d.title || 'Evento Destacado',
            organizacionNombre: d.organizacionNombre || d.organizacion?.razonSocial || 'Organización Cultural',
            plan: 'Posicionamiento Premium',
            precio: 100000,
            fechaInicio: d.fecha || '2026-10-01',
            fechaFinal: '2026-10-30',
            estado: 'ACTIVO',
            foto: d.foto || d.imagenUrl || null,
            urlImagenDestacado: d.urlImagenDestacado || d.imagenPromocional || null,
          });
        }
      });

      setPromociones(mergedItems);
    } catch (err) {
      console.warn('Error al cargar promociones de marketing:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromociones();
    loadPlanes();
  }, [fetchPromociones, loadPlanes]);

  // Filtrado de eventos
  const filteredPromociones = useMemo(() => {
    return promociones.filter((p) => {
      const matchPlan =
        selectedPlanFilter === 'TODOS' ||
        p.plan.toLowerCase().includes(selectedPlanFilter.toLowerCase());

      if (!matchPlan) return false;

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

  // Abrir modal de asignación de imagen promocional
  const handleOpenPromoImageModal = (item) => {
    setPromoImageModalEvent(item);
    setInputPromoImage(item.urlImagenDestacado || item.foto || '');
  };

  // Guardar imagen promocional
  const handleSavePromoImage = async () => {
    if (!promoImageModalEvent) return;
    if (!inputPromoImage.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'URL requerida',
        text: 'Por favor ingresa la URL de la imagen promocional.',
      });
      return;
    }

    try {
      setSavingPromoImage(true);
      await promotionPlanService.asignarImagenPromocional(
        promoImageModalEvent.eventoId,
        inputPromoImage.trim()
      );

      // Actualizar localmente
      setPromociones((prev) =>
        prev.map((item) =>
          item.eventoId === promoImageModalEvent.eventoId
            ? { ...item, urlImagenDestacado: inputPromoImage.trim() }
            : item
        )
      );

      Swal.fire({
        icon: 'success',
        title: '¡Imagen Promocional Asignada!',
        text: 'La imagen ha sido asignada al evento y se mostrará en los espacios destacados.',
        timer: 2000,
        confirmButtonColor: '#0B1B3D',
      });

      setPromoImageModalEvent(null);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err?.message || 'No se pudo guardar la imagen promocional.',
      });
    } finally {
      setSavingPromoImage(false);
    }
  };

  // Guardar edición o nuevo plan de promoción
  const handleSavePlan = (e) => {
    e.preventDefault();
    if (!editingPlan?.nombre?.trim() || !editingPlan?.precio) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Nombre y precio son obligatorios para el plan.',
      });
      return;
    }

    const formattedPrice = `$${Number(editingPlan.precio).toLocaleString('es-CO')} COP`;
    const planToSave = {
      ...editingPlan,
      precio: Number(editingPlan.precio),
      precioFormateado: formattedPrice,
      duracion: `${editingPlan.dias || 30} días`,
      beneficios: Array.isArray(editingPlan.beneficios)
        ? editingPlan.beneficios
        : (editingPlan.beneficiosText || '')
            .split('\n')
            .map((b) => b.trim())
            .filter(Boolean),
    };

    promotionPlanService.savePlan(planToSave);
    loadPlanes();
    setEditingPlan(null);

    Swal.fire({
      icon: 'success',
      title: 'Plan guardado',
      text: 'El plan de promoción ha sido actualizado con éxito.',
      timer: 1800,
      confirmButtonColor: '#0B1B3D',
    });
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
            Supervisa los eventos promocionados para planear campañas, asignar imágenes de destacado y gestionar los planes de posicionamiento.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchPromociones}
            title="Recargar datos"
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Subnavegación de Pestañas */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveSubTab('eventos')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'eventos'
              ? 'bg-slate-900 text-amber-400 shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers size={14} />
          <span>Eventos Promocionados (Modo Tabla)</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-500 text-[10px]">
            {promociones.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('planes')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'planes'
              ? 'bg-slate-900 text-amber-400 shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award size={14} />
          <span>Planes de Posicionamiento</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-500 text-[10px]">
            {planes.length}
          </span>
        </button>
      </div>

      {/* VISTA 1: TABLA DE EVENTOS PROMOCIONADOS */}
      {activeSubTab === 'eventos' && (
        <div className="space-y-6">
          {/* Métricas Resumen */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold">
                <Award size={22} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Planes Contratados</p>
                <p className="text-2xl font-black text-slate-900 leading-tight">{promociones.length}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Promociones Activas</p>
                <p className="text-2xl font-black text-slate-900 leading-tight">
                  {promociones.filter((p) => p.estado === 'ACTIVO' || p.estado === 'VIGENTE').length}
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold">
                <DollarSign size={22} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Ingresos Estimados</p>
                <p className="text-2xl font-black text-slate-900 leading-tight">
                  {formatPrice(promociones.reduce((acc, p) => acc + (p.precio || 50000), 0))}
                </p>
              </div>
            </div>
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
              {['TODOS', 'Destacado Home', 'Posicionamiento Premium'].map((planFilter) => (
                <button
                  key={planFilter}
                  type="button"
                  onClick={() => {
                    setSelectedPlanFilter(planFilter);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                    selectedPlanFilter === planFilter
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {planFilter}
                </button>
              ))}
            </div>
          </div>

          {/* TABLA DE PROMOCIONES */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-400 text-xs font-medium">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
                Cargando promociones de organizaciones...
              </div>
            ) : filteredPromociones.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs font-medium">
                No se encontraron eventos promocionados registrados que coincidan con la búsqueda.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-4">Evento</th>
                      <th className="py-3.5 px-4">Organización</th>
                      <th className="py-3.5 px-4">Plan Contratado</th>
                      <th className="py-3.5 px-4">Imagen Promocional</th>
                      <th className="py-3.5 px-4">Vigencia / Estado</th>
                      <th className="py-3.5 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedPromociones.map((p) => {
                      const isPremium = p.plan.toLowerCase().includes('premium');
                      const isActivo = p.estado === 'ACTIVO' || p.estado === 'VIGENTE';
                      const hasPromoImage = Boolean(p.urlImagenDestacado);

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Evento */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-900 overflow-hidden shrink-0 flex items-center justify-center text-amber-400 font-bold text-xs border border-amber-400/40">
                                {p.urlImagenDestacado || p.foto ? (
                                  <img
                                    src={p.urlImagenDestacado || p.foto}
                                    alt={p.eventoNombre}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span>★</span>
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 line-clamp-1 max-w-[240px]">
                                  {p.eventoNombre}
                                </p>
                                <span className="text-[10px] text-slate-400">ID #{p.eventoId}</span>
                              </div>
                            </div>
                          </td>

                          {/* Organización */}
                          <td className="py-3.5 px-4 font-medium text-slate-700">
                            <div className="flex items-center gap-1.5">
                              <Building2 size={13} className="text-slate-400 shrink-0" />
                              <span className="truncate max-w-[180px]">{p.organizacionNombre}</span>
                            </div>
                          </td>

                          {/* Plan */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10.5px] font-black uppercase tracking-wider ${
                                isPremium
                                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-xs border border-amber-500/80'
                                  : 'bg-amber-100/90 text-amber-900 border border-amber-300'
                              }`}
                            >
                              <Award size={12} />
                              <span>{p.plan}</span>
                            </span>
                          </td>

                          {/* Imagen Promocional */}
                          <td className="py-3.5 px-4">
                            {hasPromoImage ? (
                              <div className="flex items-center gap-2">
                                <img
                                  src={p.urlImagenDestacado}
                                  alt="Banner"
                                  className="w-12 h-7 rounded-lg object-cover border border-amber-300 shadow-2xs"
                                />
                                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                                  <Check size={11} /> Asignada
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold border border-amber-200">
                                Sin imagen de promo
                              </span>
                            )}
                          </td>

                          {/* Vigencia */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col gap-0.5">
                              <Badge variant={isActivo ? 'success' : 'neutral'} size="sm">
                                {isActivo ? 'Vigente' : 'Finalizado'}
                              </Badge>
                              <span className="text-[10px] text-slate-400">
                                Hasta {p.fechaFinal}
                              </span>
                            </div>
                          </td>

                          {/* Acciones */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              {/* Botón Asignar Imagen Promocional */}
                              <button
                                type="button"
                                onClick={() => handleOpenPromoImageModal(p)}
                                title="Asignar o editar imagen de promocionado"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-[11px] uppercase tracking-wider border border-amber-300 transition-all cursor-pointer"
                              >
                                <ImageIcon size={12} className="text-amber-600" />
                                <span>Imagen Promo</span>
                              </button>

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

      {/* VISTA 2: GESTIÓN DE PLANES DE PROMOCIÓN */}
      {activeSubTab === 'planes' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Planes de Promoción y Posicionamiento para Organizaciones
              </h3>
              <p className="text-xs text-slate-500">
                Define las tarifas, duración y beneficios de los planes disponibles para los organizadores de eventos.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setEditingPlan({
                  id: `PLAN_${Date.now()}`,
                  nombre: '',
                  precio: 60000,
                  dias: 30,
                  popular: false,
                  descripcion: '',
                  beneficiosText: 'Aparición destacada\nBadge de promoción\nSoporte prioritario',
                })
              }
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-amber-400 font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
            >
              <Plus size={15} />
              <span>Crear Nuevo Plan</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {planes.map((plan) => (
              <div
                key={plan.id}
                className="bg-white border-2 border-slate-200 hover:border-amber-400 rounded-3xl p-6 shadow-xs flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-black uppercase tracking-wider">
                      {plan.duracion || `${plan.dias || 30} días`}
                    </span>
                    {plan.popular && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                        Popular
                      </span>
                    )}
                  </div>

                  <h4 className="font-display text-lg font-black text-slate-900 mb-1">
                    {plan.nombre}
                  </h4>
                  <p className="text-2xl font-black text-amber-600 mb-3">
                    {plan.precioFormateado || formatPrice(plan.precio)}
                  </p>
                  <p className="text-xs text-slate-500 mb-4">{plan.descripcion}</p>

                  <div className="border-t border-slate-100 pt-3 mb-5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Beneficios incluidos:
                    </p>
                    <ul className="space-y-1.5">
                      {(plan.beneficios || []).map((b, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                          <Check size={13} className="text-emerald-500 mt-0.5 shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      const updated = promotionPlanService.deletePlan(plan.id);
                      setPlanes(updated);
                      Swal.fire({
                        icon: 'info',
                        title: 'Plan eliminado',
                        timer: 1500,
                      });
                    }}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Eliminar plan"
                  >
                    <Trash2 size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setEditingPlan({
                        ...plan,
                        beneficiosText: (plan.beneficios || []).join('\n'),
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    <Edit3 size={13} />
                    <span>Editar Plan</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DRAWER MODAL A LA DERECHA: ASIGNAR IMAGEN PROMOCIONAL */}
      {promoImageModalEvent && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 border-l border-slate-200">
            {/* Header del Modal */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold">
                  <ImageIcon size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-tight">
                    Imagen de Evento Promocionado
                  </h3>
                  <p className="text-xs text-slate-400">
                    Espacio publicitario oficial de EventHive
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPromoImageModalEvent(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600">
                  Evento Seleccionado
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
                  URL de Imagen / Banner Promocional <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  value={inputPromoImage}
                  onChange={(e) => setInputPromoImage(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-xs sm:text-sm text-slate-800 transition-all outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Recomendado: proporción horizontal 16:9 o 21:9 en alta resolución.
                </p>
              </div>

              {/* Previsualización */}
              <div className="space-y-2">
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Previsualización de Destacado:
                </span>
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 flex items-center justify-center">
                  {inputPromoImage.trim() ? (
                    <>
                      <img
                        src={inputPromoImage}
                        alt="Previsualización"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-md border border-amber-300 flex items-center gap-1">
                        <span>★</span> PROMOCIONADO
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
                      Ingresa una URL de imagen válida para previsualizar el banner publicitario.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="p-6 border-t border-slate-100 flex items-center justify-between gap-3 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setPromoImageModalEvent(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSavePromoImage}
                disabled={savingPromoImage || !inputPromoImage.trim()}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-amber-400 font-black text-xs uppercase tracking-wider shadow-sm transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {savingPromoImage ? (
                  <RefreshCw size={13} className="animate-spin" />
                ) : (
                  <Check size={14} />
                )}
                <span>Guardar Imagen Promocional</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL / DRAWER A LA DERECHA: EDITAR / CREAR PLAN DE PROMOCIÓN */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 border-l border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold">
                  <Award size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-tight">
                    {editingPlan.id ? 'Editar Plan de Promoción' : 'Nuevo Plan de Promoción'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Configuración de beneficios y tarifas oficiales
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nombre del Plan *
                </label>
                <input
                  type="text"
                  required
                  value={editingPlan.nombre || ''}
                  onChange={(e) => setEditingPlan({ ...editingPlan, nombre: e.target.value })}
                  placeholder="Ej. Destacado Platino"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Precio (COP) *
                  </label>
                  <input
                    type="number"
                    required
                    value={editingPlan.precio || ''}
                    onChange={(e) => setEditingPlan({ ...editingPlan, precio: e.target.value })}
                    placeholder="75000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-xs text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Duración (Días) *
                  </label>
                  <input
                    type="number"
                    required
                    value={editingPlan.dias || 30}
                    onChange={(e) => setEditingPlan({ ...editingPlan, dias: Number(e.target.value) })}
                    placeholder="30"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-xs text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Descripción Corta
                </label>
                <textarea
                  rows={2}
                  value={editingPlan.descripcion || ''}
                  onChange={(e) => setEditingPlan({ ...editingPlan, descripcion: e.target.value })}
                  placeholder="Breve resumen del plan para las organizaciones..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-xs text-slate-800 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Beneficios (Uno por línea)
                </label>
                <textarea
                  rows={4}
                  value={editingPlan.beneficiosText || ''}
                  onChange={(e) => setEditingPlan({ ...editingPlan, beneficiosText: e.target.value })}
                  placeholder="Aparición en Home&#10;Primer lugar en búsquedas&#10;Badge Dorado VIP"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="chkPopular"
                  checked={Boolean(editingPlan.popular)}
                  onChange={(e) => setEditingPlan({ ...editingPlan, popular: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-amber-400"
                />
                <label htmlFor="chkPopular" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Marcar como "Recomendado / Popular"
                </label>
              </div>

              <div className="pt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-amber-400 font-black text-xs uppercase tracking-wider shadow-sm transition-all"
                >
                  Guardar Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal / Drawer a la derecha con el detalle del evento */}
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
