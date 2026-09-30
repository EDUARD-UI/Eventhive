import React, { useState, useMemo } from 'react';
import {
  Tag,
  Plus,
  Percent,
  Calendar,
  Eye,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Search,
  Filter,
} from 'lucide-react';
import Badge from '../../components/Shared/Badge.jsx';
import BannerPreviewCard from '../../components/componentsAdmin/BannerPreviewCard.jsx';
import ModalPromocion from '../../components/componentsAdmin/ModalPromocion.jsx';
import Pagination from '../../components/Shared/Pagination.jsx';

const PAGE_SIZE = 5;

export default function AdminPromocionesView({
  promociones = [],
  onSavePromocion,
  onToggleEstadoPromocion,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [promoAEditar, setPromoAEditar] = useState(null);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState(null);

  // Filtros y paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODAS');
  const [currentPage, setCurrentPage] = useState(1);

  const handleOpenCreate = () => {
    setPromoAEditar(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (promo) => {
    setPromoAEditar(promo);
    setModalOpen(true);
  };

  const handleSave = (promoData) => {
    onSavePromocion(promoData);
    setModalOpen(false);
  };

  const copyToClipboard = (codigo) => {
    navigator.clipboard?.writeText(codigo);
    setCopiedCode(codigo);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Filtrado por texto y estado
  const filteredPromos = useMemo(() => {
    return promociones.filter((promo) => {
      const term = searchTerm.toLowerCase();
      const matchSearch =
        !term ||
        promo.nombre?.toLowerCase().includes(term) ||
        promo.codigo?.toLowerCase().includes(term);

      const matchEstado =
        filtroEstado === 'TODAS' ||
        (filtroEstado === 'ACTIVA' && promo.activa) ||
        (filtroEstado === 'INACTIVA' && !promo.activa);

      return matchSearch && matchEstado;
    });
  }, [promociones, searchTerm, filtroEstado]);

  // Paginación
  const paginatedPromos = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredPromos.slice(start, start + PAGE_SIZE);
  }, [filteredPromos, currentPage]);

  // Reset página al cambiar filtros
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
    setActivePreviewIndex(0);
  };

  const handleEstadoChange = (value) => {
    setFiltroEstado(value);
    setCurrentPage(1);
    setActivePreviewIndex(0);
  };

  // El índice de preview apunta a la lista filtrada + paginada
  const promoParaPreview = paginatedPromos[activePreviewIndex] ?? filteredPromos[0] ?? promociones[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Percent className="w-5 h-5 text-primary" strokeWidth={1.75} />
            <span>Promociones Globales y Banners</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Administración de cupones y banners destacados para la plataforma Event Hive
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl !bg-blue-600 hover:!bg-blue-700 !text-white text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          <span>Nueva Promoción Global</span>
        </button>
      </div>

      {/* Grid: Preview en Vivo & Lista de Promociones */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Columna Izquierda: Vista Previa en Tiempo Real */}
        <div className="lg:col-span-5 sticky top-20">
          <div className="mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-primary" />
              <span>Previsualización en Vivo de la Plataforma</span>
            </span>
          </div>
          {promoParaPreview ? (
            <BannerPreviewCard promocion={promoParaPreview} />
          ) : (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
              No hay promoción seleccionada para previsualizar.
            </div>
          )}
        </div>

        {/* Columna Derecha: Listado de Promociones */}
        <div className="lg:col-span-7 space-y-4">
          {/* Barra de Filtros */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth={1.75} />
              <input
                type="text"
                placeholder="Buscar por nombre o código..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <select
              value={filtroEstado}
              onChange={(e) => handleEstadoChange(e.target.value)}
              className="w-full sm:w-auto py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="TODAS">Todas</option>
              <option value="ACTIVA">Activas</option>
              <option value="INACTIVA">Inactivas</option>
            </select>
          </div>

          {/* Contador */}
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Promociones Disponibles ({filteredPromos.length})
          </span>

          {/* Lista paginada */}
          {paginatedPromos.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
              No se encontraron promociones con los filtros aplicados.
            </div>
          ) : (
            paginatedPromos.map((promo, idx) => {
              const isSelected = activePreviewIndex === idx;

              return (
                <div
                  key={promo.id}
                  onClick={() => setActivePreviewIndex(idx)}
                  className={`p-4 rounded-3xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-primary shadow-md ring-2 ring-primary/10'
                      : 'bg-white/80 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 font-bold flex items-center justify-center text-sm border border-amber-100">
                        {promo.descuento}%
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          {promo.nombre}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {promo.descripcion}
                        </p>
                      </div>
                    </div>

                    <Badge variant={promo.activa ? 'success' : 'neutral'} size="xs">
                      {promo.activa ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </div>

                  {/* Código de Cupón y Fechas */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold px-2 py-1 rounded-lg bg-slate-100 text-slate-800 text-[11px]">
                        {promo.codigo}
                      </span>
                      <button
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

                    <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{promo.fechaInicio} al {promo.fechaFin}</span>
                      </span>
                      <span className="font-bold text-slate-700">
                        {promo.usosActuales || 0} / {promo.limiteUsos || '∞'}
                      </span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center justify-end gap-2 pt-2 mt-2 border-t border-slate-50">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(promo);
                      }}
                      className="text-xs font-bold text-slate-600 hover:text-primary px-2 py-1"
                    >
                      Editar
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleEstadoPromocion(promo.id, !promo.activa);
                      }}
                      className={`text-xs font-bold px-2 py-1 ${
                        promo.activa
                          ? 'text-rose-600 hover:text-rose-700'
                          : 'text-emerald-600 hover:text-emerald-700'
                      }`}
                    >
                      {promo.activa ? 'Pausar' : 'Activar'}
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {/* Paginación */}
          {filteredPromos.length > PAGE_SIZE && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <Pagination
                currentPage={currentPage}
                totalItems={filteredPromos.length}
                pageSize={PAGE_SIZE}
                onPageChange={(page) => {
                  setCurrentPage(page);
                  setActivePreviewIndex(0);
                }}
                showPageSize={false}
              />
            </div>
          )}
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
