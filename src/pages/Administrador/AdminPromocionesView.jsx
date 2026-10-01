import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Tag,
  Plus,
  Percent,
  Calendar,
  Eye,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  ImageIcon,
  Search,
  Filter,
} from 'lucide-react';
import Badge from '../../components/Shared/Badge.jsx';
import Pagination from '../../components/Shared/Pagination.jsx';
import ModalPromocion from '../../components/componentsAdmin/ModalPromocion.jsx';
import AdminInfoAlert from '../../components/componentsAdmin/AdminInfoAlert.jsx';
import adminService from '../../features/admin/services/adminService.js';

export default function AdminPromocionesView({
  promociones: initialPromociones = [],
  onSavePromocion,
  onToggleEstadoPromocion,
}) {
  const [promocionesList, setPromocionesList] = useState(initialPromociones);
  const [modalOpen, setModalOpen] = useState(false);
  const [promoAEditar, setPromoAEditar] = useState(null);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODAS');

  // Paginación (Requisito 7)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [totalItems, setTotalItems] = useState(initialPromociones.length || 0);
  const [loading, setLoading] = useState(false);

  // Carga reactiva de promociones paginadas
  const fetchPromociones = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getPromociones({
        page: currentPage - 1,
        size: pageSize,
      });
      if (res.success) {
        setPromocionesList(res.data);
        setTotalItems(res.totalElements);
      }
    } catch (err) {
      console.warn('Error al cargar promociones:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    fetchPromociones();
  }, [fetchPromociones]);

  useEffect(() => {
    if (initialPromociones && initialPromociones.length > 0 && !searchTerm) {
      setPromocionesList(initialPromociones);
      setTotalItems(initialPromociones.length);
    }
  }, [initialPromociones]);

  const handleOpenCreate = () => {
    setPromoAEditar(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (promo) => {
    setPromoAEditar(promo);
    setModalOpen(true);
  };

  const handleSave = async (promoData) => {
    if (onSavePromocion) {
      await onSavePromocion(promoData);
    } else {
      await adminService.savePromocion(promoData);
    }
    setModalOpen(false);
    await fetchPromociones();
  };

  const handleToggle = async (promoId, nuevoEstado) => {
    if (onToggleEstadoPromocion) {
      await onToggleEstadoPromocion(promoId, nuevoEstado);
    } else {
      await adminService.toggleEstadoPromocion(promoId, nuevoEstado);
    }
    await fetchPromociones();
  };

  const copyToClipboard = (codigo) => {
    if (!codigo) return;
    navigator.clipboard?.writeText(codigo);
    setCopiedCode(codigo);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Filtrado local en caso de búsqueda o filtro de estado
  const filteredPromociones = useMemo(() => {
    return promocionesList.filter((p) => {
      const isVigente = p.estado === 'VIGENTE' || p.activa !== false;
      if (filtroEstado === 'ACTIVA' && !isVigente) return false;
      if (filtroEstado === 'INACTIVA' && isVigente) return false;

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const eventoNombre = (p.eventoTitulo || p.eventoNombre || '').toLowerCase();
      const desc = (p.descripcion || p.nombre || '').toLowerCase();
      const cod = (p.codigo || '').toLowerCase();
      return eventoNombre.includes(term) || desc.includes(term) || cod.includes(term);
    });
  }, [promocionesList, searchTerm, filtroEstado]);

  const promoParaPreview = filteredPromociones[activePreviewIndex] || filteredPromociones[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Alerta Informativa Inicial (Requisito 10) */}
      <AdminInfoAlert
        id="promociones"
        title="Gestión de Promociones y Descuentos"
        description="Administre las promociones vinculadas a eventos de la plataforma. La lista cuenta con paginación integrada y muestra claramente el evento al que pertenece cada descuento comercial."
      />

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Percent className="w-5 h-5 text-primary" strokeWidth={1.75} />
            <span>Promociones y Descuentos de Eventos</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Administración de beneficios comerciales y campañas vinculadas
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-2 w-fit"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          <span>Nueva Promoción</span>
        </button>
      </div>

      {/* Buscador y Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:flex-1">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth={1.75} />
            <input
              type="text"
              placeholder="Buscar por evento, código o descripción..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
                setActivePreviewIndex(0);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <select
            value={filtroEstado}
            onChange={(e) => {
              setFiltroEstado(e.target.value);
              setCurrentPage(1);
              setActivePreviewIndex(0);
            }}
            className="w-full sm:w-auto py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="TODAS">Todos los estados</option>
            <option value="ACTIVA">Vigentes / Activas</option>
            <option value="INACTIVA">Pausadas / Inactivas</option>
          </select>
        </div>

        <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
          Total: {totalItems} promociones
        </span>
      </div>

      {/* Grid: Preview & Listado */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Columna Izquierda: Vista Previa y Mockup de Imagen de Referencia */}
        <div className="lg:col-span-5 sticky top-20 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-primary" />
            <span>Previsualización del Diseño</span>
          </span>

          {promoParaPreview ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm space-y-4">
              {/* Estructura preparada para incorporar imágenes de diseño o referencia */}
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 aspect-[16/8] flex flex-col justify-between p-5 text-white border border-slate-800 shadow-md group">
                <div className="flex items-center justify-between z-10">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md border border-white/20 text-white">
                    {promoParaPreview.estado || (promoParaPreview.activa !== false ? 'VIGENTE' : 'INACTIVA')}
                  </span>
                  <span className="text-2xl font-black text-[#FFC107] drop-shadow">
                    {promoParaPreview.descuento}% OFF
                  </span>
                </div>

                <div className="z-10">
                  <div className="inline-flex items-center gap-1.5 text-xs text-slate-300 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-semibold text-white truncate max-w-[200px]">
                      {promoParaPreview.eventoTitulo || promoParaPreview.eventoNombre || 'Evento Asociado'}
                    </span>
                  </div>
                  <h4 className="text-base font-extrabold text-white leading-snug line-clamp-2">
                    {promoParaPreview.descripcion || promoParaPreview.nombre || 'Promoción Especial'}
                  </h4>
                  {promoParaPreview.codigo && (
                    <p className="text-xs font-mono font-bold text-amber-300 mt-1">
                      Código: {promoParaPreview.codigo}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-300 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>
                      Vigencia: {promoParaPreview.fechaInicio} al {promoParaPreview.fechaFinal || promoParaPreview.fechaFin}
                    </span>
                  </p>
                </div>

                {/* Ranura visual preparada para imagen de referencia */}
                <div className="absolute inset-0 bg-primary/10 pointer-events-none" />
                <div className="absolute right-3 bottom-3 opacity-20 group-hover:opacity-30 transition-opacity">
                  <ImageIcon className="w-24 h-24 text-white" />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-center justify-between">
                <span>Evento Vinculado:</span>
                <strong className="text-slate-900">
                  {promoParaPreview.eventoTitulo || promoParaPreview.eventoNombre || (promoParaPreview.eventoId ? `Evento #${promoParaPreview.eventoId}` : 'Promoción Global')}
                </strong>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
              No hay promoción seleccionada para previsualizar.
            </div>
          )}
        </div>

        {/* Columna Derecha: Tarjetas de Promociones Paginadas */}
        <div className="lg:col-span-7 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs bg-white rounded-3xl border border-slate-200 animate-pulse">
              Cargando promociones del servidor...
            </div>
          ) : filteredPromociones.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 text-xs">
              No se encontraron promociones registradas.
            </div>
          ) : (
            filteredPromociones.map((promo, idx) => {
              const isSelected = activePreviewIndex === idx;
              const eventoNombre = promo.eventoTitulo || promo.eventoNombre || (promo.eventoId ? `Evento #${promo.eventoId}` : 'Promoción General');
              const isVigente = promo.estado === 'VIGENTE' || promo.activa !== false;

              return (
                <div
                  key={promo.id}
                  onClick={() => setActivePreviewIndex(idx)}
                  className={`p-4 rounded-3xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-primary shadow-md ring-2 ring-primary/10'
                      : 'bg-white hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 font-black flex items-center justify-center text-sm border border-amber-100 shrink-0">
                        {promo.descuento}%
                      </div>
                      <div className="min-w-0">
                        {/* Requisito 7: Mostrar claramente el nombre del evento */}
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-800 text-[10px] font-bold mb-1">
                          <Calendar className="w-3 h-3 text-primary" />
                          <span className="truncate max-w-[240px]">
                            {eventoNombre}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                          {promo.descripcion || promo.nombre || 'Descuento especial'}
                        </h4>
                      </div>
                    </div>

                    <Badge variant={isVigente ? 'success' : 'neutral'} size="xs">
                      {promo.estado || (isVigente ? 'VIGENTE' : 'PAUSADA')}
                    </Badge>
                  </div>

                  {/* Fechas de vigencia, código y detalles */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-3">
                      {promo.codigo && (
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 text-[11px]">
                            {promo.codigo}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(promo.codigo);
                            }}
                            className="text-slate-400 hover:text-primary transition-colors p-1"
                            title="Copiar Código"
                          >
                            {copiedCode === promo.codigo ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}
                      <span className="text-slate-500 text-[11px] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{promo.fechaInicio} al {promo.fechaFinal || promo.fechaFin}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(promo);
                        }}
                        className="text-xs font-bold text-slate-600 hover:text-primary px-2.5 py-1 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggle(promo.id, !isVigente);
                        }}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${
                          isVigente
                            ? 'text-rose-600 hover:bg-rose-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {isVigente ? 'Pausar' : 'Activar'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Paginación (Requisito 7) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs mt-4">
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
              pageSizeOptions={[4, 6, 12]}
            />
          </div>
        </div>
      </div>

      {/* Modal Crear / Editar */}
      {modalOpen && (
        <ModalPromocion
          promocion={promoAEditar}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
