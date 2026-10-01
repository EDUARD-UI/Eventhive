import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus,
  Percent,
  Calendar,
  Eye,
  Clock,
  Copy,
  Check,
  ImageIcon,
  Search,
  Trash2,
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
  const [selectedPromoId, setSelectedPromoId] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODAS');

  // Paginación (Requisito 7)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [totalItems, setTotalItems] = useState(initialPromociones.length || 0);
  const [loading, setLoading] = useState(false);

  // Carga reactiva de promociones paginadas desde el backend
  const fetchPromociones = useCallback(
    async (pageToLoad = currentPage, sizeToLoad = pageSize) => {
      try {
        setLoading(true);
        const res = await adminService.getPromociones({
          page: pageToLoad - 1,
          size: sizeToLoad,
        });
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          setPromocionesList(res.data);
          setTotalItems(res.totalElements ?? res.data.length);
        } else if (initialPromociones && initialPromociones.length > 0) {
          setPromocionesList(initialPromociones);
          setTotalItems(initialPromociones.length);
        }
      } catch (err) {
        console.warn('Error al cargar promociones del servidor:', err);
        if (initialPromociones && initialPromociones.length > 0) {
          setPromocionesList(initialPromociones);
          setTotalItems(initialPromociones.length);
        }
      } finally {
        setLoading(false);
      }
    },
    [currentPage, pageSize, initialPromociones]
  );

  useEffect(() => {
    fetchPromociones(currentPage, pageSize);
  }, [currentPage, pageSize, fetchPromociones]);

  // Si cambian las promociones iniciales desde el padre, sincronizamos
  useEffect(() => {
    if (initialPromociones && initialPromociones.length > 0) {
      setPromocionesList(initialPromociones);
      setTotalItems((prev) => Math.max(prev, initialPromociones.length));
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
    try {
      if (onSavePromocion) {
        await onSavePromocion(promoData);
      } else {
        await adminService.savePromocion(promoData);
      }
      setModalOpen(false);
      setPromoAEditar(null);
      await fetchPromociones(currentPage, pageSize);
    } catch (err) {
      console.error('Error al guardar promoción:', err);
    }
  };

  const handleToggle = async (promoId, nuevoEstado) => {
    try {
      // Actualización optimista local
      setPromocionesList((prev) =>
        prev.map((p) =>
          String(p.id) === String(promoId)
            ? { ...p, activa: nuevoEstado, estado: nuevoEstado ? 'VIGENTE' : 'INACTIVA' }
            : p
        )
      );
      if (onToggleEstadoPromocion) {
        await onToggleEstadoPromocion(promoId, nuevoEstado);
      } else {
        await adminService.toggleEstadoPromocion(promoId, nuevoEstado);
      }
      await fetchPromociones(currentPage, pageSize);
    } catch (err) {
      console.error('Error al cambiar estado de la promoción:', err);
    }
  };

  const handleDelete = async (promoId) => {
    if (!window.confirm('¿Confirma la eliminación definitiva de esta promoción?')) return;
    try {
      // Actualización optimista local
      setPromocionesList((prev) => prev.filter((p) => String(p.id) !== String(promoId)));
      setTotalItems((prev) => Math.max(0, prev - 1));
      if (adminService.deletePromocion) {
        await adminService.deletePromocion(promoId);
      }
      await fetchPromociones(currentPage, pageSize);
    } catch (err) {
      console.error('Error al eliminar la promoción:', err);
    }
  };

  const copyToClipboard = (codigo) => {
    if (!codigo) return;
    navigator.clipboard?.writeText(codigo);
    setCopiedCode(codigo);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Filtrado local para búsqueda o filtro de estado
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

  const isFilteringLocally = Boolean(searchTerm.trim() || filtroEstado !== 'TODAS');
  const paginationTotal = isFilteringLocally
    ? filteredPromociones.length
    : Math.max(totalItems, promocionesList.length);

  // Paginación calculada de manera uniforme
  const paginatedPromociones = useMemo(() => {
    if (promocionesList.length <= pageSize && !isFilteringLocally) {
      return filteredPromociones;
    }
    const startIndex = (currentPage - 1) * pageSize;
    return filteredPromociones.slice(startIndex, startIndex + pageSize);
  }, [filteredPromociones, currentPage, pageSize, promocionesList.length, isFilteringLocally]);

  // Si la página queda fuera de rango al filtrar o eliminar, reajustamos a la última página válida
  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredPromociones.length / pageSize));
    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [filteredPromociones.length, pageSize, currentPage]);

  // Selección de promoción para previsualización (por ID estable)
  const promoParaPreview = useMemo(() => {
    if (selectedPromoId != null) {
      const found = promocionesList.find((p) => String(p.id) === String(selectedPromoId));
      if (found) return found;
    }
    return paginatedPromociones[0] || promocionesList[0] || null;
  }, [promocionesList, paginatedPromociones, selectedPromoId]);

  // Helpers de formateo seguro
  const getDescuentoOff = (p) => {
    if (!p) return '0% OFF';
    if (p.descuento != null && p.descuento !== '') {
      const val = String(p.descuento).replace('%', '').trim();
      return `${val}% OFF`;
    }
    if (p.valor) {
      const val = String(p.valor).trim();
      return val.includes('%') ? `${val} OFF` : val;
    }
    return 'PROMO';
  };

  const getDescuentoBadge = (p) => {
    if (!p) return '0%';
    if (p.descuento != null && p.descuento !== '') {
      const val = String(p.descuento).replace('%', '').trim();
      return `${val}%`;
    }
    if (p.valor) {
      return String(p.valor).trim();
    }
    return '0%';
  };

  const getVigenciaText = (p) => {
    if (!p) return 'Sin fecha definida';
    const inicio = p.fechaInicio ? String(p.fechaInicio).split('T')[0] : null;
    const fin =
      p.fechaFinal || p.fechaFin || p.expira
        ? String(p.fechaFinal || p.fechaFin || p.expira).split('T')[0]
        : null;
    if (inicio && fin) return `${inicio} al ${fin}`;
    if (fin) return `Hasta ${fin}`;
    if (inicio) return `Desde ${inicio}`;
    return 'Vigencia permanente';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Alerta Informativa Inicial (Requisitos 7 y 10) */}
      <AdminInfoAlert
        id="promociones"
        alertId="promociones"
        title="Gestión de Promociones y Descuentos"
        description="Administre las promociones vinculadas a eventos de la plataforma. La lista cuenta con paginación integrada y muestra claramente el evento al que pertenece cada descuento comercial."
      />

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Percent className="w-5 h-5 text-[#087fea]" strokeWidth={2} />
            <span>Promociones y Descuentos de Eventos</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Administración de beneficios comerciales y campañas vinculadas
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-[#087fea] hover:bg-[#0060cc] text-white text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-2 w-fit"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          <span>Nueva Promoción</span>
        </button>
      </div>

      {/* Buscador y Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:flex-1">
          <div className="relative w-full sm:max-w-md">
            <Search
              className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              strokeWidth={1.75}
            />
            <input
              type="text"
              placeholder="Buscar por evento, código o descripción..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#087fea]/20 focus:border-[#087fea] transition-all"
            />
          </div>
          <select
            value={filtroEstado}
            onChange={(e) => {
              setFiltroEstado(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-auto py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#087fea]/20 focus:border-[#087fea]"
          >
            <option value="TODAS">Todos los estados</option>
            <option value="ACTIVA">Vigentes / Activas</option>
            <option value="INACTIVA">Pausadas / Inactivas</option>
          </select>
        </div>

        <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
          Total: {paginationTotal} promociones
        </span>
      </div>

      {/* Grid: Preview & Listado */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Columna Izquierda: Vista Previa y Mockup de Imagen de Referencia */}
        <div className="lg:col-span-5 sticky top-20 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[#087fea]" />
            <span>Previsualización del Banner</span>
          </span>

          {promoParaPreview ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm space-y-4">
              {/* Estructura con soporte para imágenes de diseño o referencia */}
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 aspect-[16/8] flex flex-col justify-between p-5 text-white border border-slate-800 shadow-md group">
                <div className="flex items-center justify-between z-10">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md border border-white/20 text-white">
                    {promoParaPreview.estado ||
                      (promoParaPreview.activa !== false ? 'VIGENTE' : 'INACTIVA')}
                  </span>
                  <span className="text-2xl font-black text-[#FFC107] drop-shadow">
                    {getDescuentoOff(promoParaPreview)}
                  </span>
                </div>

                <div className="z-10">
                  <div className="inline-flex items-center gap-1.5 text-xs text-slate-300 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-semibold text-white truncate max-w-[200px]">
                      {promoParaPreview.eventoTitulo ||
                        promoParaPreview.eventoNombre ||
                        'Evento Asociado'}
                    </span>
                  </div>
                  <h4 className="text-base font-extrabold text-white leading-snug line-clamp-2">
                    {promoParaPreview.descripcion ||
                      promoParaPreview.nombre ||
                      'Promoción Especial'}
                  </h4>
                  {promoParaPreview.codigo && (
                    <p className="text-xs font-mono font-bold text-amber-300 mt-1">
                      Código: {promoParaPreview.codigo}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-300 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Vigencia: {getVigenciaText(promoParaPreview)}</span>
                  </p>
                </div>

                {/* Ranura visual preparada para imagen de referencia o fondo */}
                {promoParaPreview.imagenUrl ||
                promoParaPreview.imagen ||
                promoParaPreview.fotoUrl ? (
                  <img
                    src={
                      promoParaPreview.imagenUrl ||
                      promoParaPreview.imagen ||
                      promoParaPreview.fotoUrl
                    }
                    alt={promoParaPreview.descripcion || 'Banner'}
                    className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity pointer-events-none"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-[#087fea]/10 pointer-events-none" />
                    <div className="absolute right-3 bottom-3 opacity-20 group-hover:opacity-30 transition-opacity">
                      <ImageIcon className="w-24 h-24 text-white" />
                    </div>
                  </>
                )}
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-center justify-between">
                <span>Evento Vinculado:</span>
                <strong className="text-slate-900 truncate max-w-[200px]">
                  {promoParaPreview.eventoTitulo ||
                    promoParaPreview.eventoNombre ||
                    (promoParaPreview.eventoId
                      ? `Evento #${promoParaPreview.eventoId}`
                      : 'Promoción Global')}
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
          ) : paginatedPromociones.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 text-xs">
              No se encontraron promociones registradas.
            </div>
          ) : (
            paginatedPromociones.map((promo, idx) => {
              const isSelected =
                promoParaPreview && String(promoParaPreview.id) === String(promo.id);
              const eventoNombre =
                promo.eventoTitulo ||
                promo.eventoNombre ||
                (promo.eventoId ? `Evento #${promo.eventoId}` : 'Promoción General');
              const isVigente = promo.estado === 'VIGENTE' || promo.activa !== false;

              return (
                <div
                  key={promo.id || `promo-${idx}`}
                  onClick={() => setSelectedPromoId(promo.id)}
                  className={`p-4 rounded-3xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#087fea] shadow-md ring-2 ring-[#087fea]/10'
                      : 'bg-white hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 font-black flex items-center justify-center text-sm border border-amber-100 shrink-0">
                        {getDescuentoBadge(promo)}
                      </div>
                      <div className="min-w-0">
                        {/* Requisito 7: Mostrar claramente el nombre del evento */}
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-800 text-[10px] font-bold mb-1">
                          <Calendar className="w-3 h-3 text-[#087fea]" />
                          <span className="truncate max-w-[240px]">{eventoNombre}</span>
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

                  {/* Fechas de vigencia, código y acciones */}
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
                            className="text-slate-400 hover:text-[#087fea] transition-colors p-1"
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
                        <span>{getVigenciaText(promo)}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(promo);
                        }}
                        className="text-xs font-bold text-slate-600 hover:text-[#087fea] px-2.5 py-1 rounded-lg hover:bg-slate-50 transition-colors"
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

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(promo.id);
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Eliminar Promoción"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
              totalItems={paginationTotal}
              pageSize={pageSize}
              onPageChange={(page) => {
                setCurrentPage(page);
              }}
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
          onClose={() => {
            setModalOpen(false);
            setPromoAEditar(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
