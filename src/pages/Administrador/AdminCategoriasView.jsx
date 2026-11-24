import React, { useState, useMemo } from 'react';
import {
  Tag,
  Plus,
  Search,
  Edit2,
  Trash2,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Swal from 'sweetalert2';
import ModalCategoria from '../../components/componentsAdmin/ModalCategoria.jsx';

export default function AdminCategoriasView({
  categorias = [],
  onSaveCategoria,
  onEliminarCategoria,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [categoriaAEditar, setCategoriaAEditar] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Paginación limpia
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const handleOpenCreate = () => {
    setCategoriaAEditar(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setCategoriaAEditar(cat);
    setModalOpen(true);
  };

  const handleSave = async (catData) => {
    await onSaveCategoria(catData);
    setModalOpen(false);
  };

  const handleDelete = async (cat) => {
    const tieneEventos = (cat.totalEventos || cat.eventosAsociados || 0) > 0;
    const confirm = await Swal.fire({
      title: '¿Eliminar categoría?',
      text: tieneEventos
        ? `"${cat.nombre}" tiene eventos vinculados. Se recomienda desvincularlos antes de proceder.`
        : `¿Deseas remover definitivamente la categoría "${cat.nombre}" del catálogo?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#64748B',
      customClass: {
        popup: 'rounded-[2px] border border-[#E2E8F0]',
        confirmButton: 'rounded-[2px] font-mono text-xs uppercase tracking-wider',
        cancelButton: 'rounded-[2px] font-mono text-xs uppercase tracking-wider',
      },
    });

    if (confirm.isConfirmed && onEliminarCategoria) {
      await onEliminarCategoria(cat.id);
    }
  };

  // Búsqueda reactiva por nombre
  const filteredCategorias = useMemo(() => {
    return categorias.filter((cat) => {
      return cat.nombre?.toLowerCase().includes(searchTerm.toLowerCase().trim());
    });
  }, [categorias, searchTerm]);

  const totalItems = filteredCategorias.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedCategorias = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredCategorias.slice(start, start + pageSize);
  }, [filteredCategorias, safeCurrentPage, pageSize]);

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-300">
      {/* 1. Encabezado Editorial */}
      <div className="border-b border-[#E2E8F0] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-[clamp(1.5rem,4vw,2.25rem)] text-[#0F2342] tracking-tight uppercase leading-none">
            CATÁLOGO DE CATEGORÍAS
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#64748B] mt-2">
            Clasificación temática oficial de eventos y curaduría de cartelera.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[2px] bg-[#0F2342] hover:bg-[#F5B800] text-white hover:text-[#0F2342] font-mono text-xs uppercase tracking-wider font-bold transition-all cursor-pointer shadow-2xs shrink-0"
        >
          <Plus size={15} />
          <span>NUEVA CATEGORÍA</span>
        </button>
      </div>

      {/* 2. Barra de Búsqueda y Resumen */}
      <div className="bg-[#FFFFFF] p-4 rounded-[2px] border border-[#E2E8F0] shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar categoría por nombre..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] text-xs font-mono text-[#0F2342] placeholder-[#94A3B8] outline-none focus:border-[#0F2342] transition-colors"
          />
        </div>

        <div className="font-mono text-xs uppercase tracking-wider text-[#64748B] flex items-center gap-2 self-end sm:self-center">
          <span>Total:</span>
          <strong className="text-[#0F2342] font-bold">{filteredCategorias.length}</strong>
          <span>categorías</span>
        </div>
      </div>

      {/* 3. Muro Editorial de Galería Visual (Cuadrícula de Carteles Temáticos) */}
      {paginatedCategorias.length === 0 ? (
        <div className="p-12 rounded-[2px] border border-dashed border-[#CBD5E1] bg-[#FFFFFF] text-center font-mono text-xs text-[#64748B]">
          <p className="font-bold text-[#0F2342] uppercase tracking-wider text-sm">
            No se encontraron categorías
          </p>
          <p className="text-[11px] text-[#94A3B8] mt-1">
            Intenta con otro término de búsqueda o crea una nueva categoría.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {paginatedCategorias.map((cat) => {
            const count = cat.totalEventos ?? cat.eventosAsociados ?? 0;
            const imageUrl = cat.imagenUrl || cat.urlFoto || cat.foto || null;

            return (
              <div
                key={cat.id}
                className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] overflow-hidden shadow-2xs hover:border-[#0F2342]/40 transition-all flex flex-col justify-between"
              >
                {/* Imagen fotográfica a todo color natural (aspect-ratio: 16/10) */}
                <div className="w-full aspect-[16/10] bg-[#0F2342] overflow-hidden relative flex items-center justify-center border-b border-[#E2E8F0]">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={cat.nombre}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-white/50 gap-1.5 p-4 text-center">
                      <ImageIcon className="w-7 h-7 text-[#F5B800]" />
                      <span className="font-mono text-[10px] uppercase tracking-widest text-[#F5B800]">
                        EVENTHIVE
                      </span>
                    </div>
                  )}
                </div>

                {/* Contenido Editorial de la Ficha */}
                <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
                  <div>
                    <h3 className="font-display font-black text-base text-[#0F2342] uppercase tracking-tight line-clamp-1">
                      {cat.nombre}
                    </h3>
                    <p className="font-mono text-[11px] text-[#64748B] uppercase tracking-wider mt-1">
                      {count} {count === 1 ? 'EVENTO VINCULADO' : 'EVENTOS VINCULADOS'}
                    </p>
                  </div>

                  {/* Pie de Acciones Tipográficas Limpias */}
                  <div className="pt-2.5 border-t border-[#F1F5F9] flex items-center justify-between font-mono text-[11px] uppercase tracking-wider font-bold">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(cat)}
                      className="text-[#0F2342] hover:text-[#C68B17] transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Edit2 size={12} />
                      <span>Editar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(cat)}
                      className="text-[#DC2626] hover:text-rose-700 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Trash2 size={12} />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Paginación Cuadrada Limpia */}
      {totalItems > pageSize && (
        <div className="p-3.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] flex flex-col sm:flex-row justify-between items-center gap-3 text-xs font-mono shadow-2xs select-none">
          <span className="text-[#64748B]">
            Mostrando {(safeCurrentPage - 1) * pageSize + 1}–
            {Math.min(safeCurrentPage * pageSize, totalItems)} de {totalItems} categorías
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage <= 1}
              className="h-8 w-8 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] text-[#0F2342] hover:bg-[#F8F9FA] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer transition-colors"
              aria-label="Página anterior"
            >
              <ChevronLeft size={14} />
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const p = idx + 1;
              const isActive = p === safeCurrentPage;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setCurrentPage(p)}
                  className={`h-8 min-w-[32px] px-2 rounded-[2px] border text-xs font-mono font-bold transition-colors cursor-pointer flex items-center justify-center ${
                    isActive
                      ? 'bg-[#0F2342] text-[#F5B800] border-[#0F2342]'
                      : 'border-[#E2E8F0] bg-[#FFFFFF] text-[#0F2342] hover:bg-[#F8F9FA]'
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage >= totalPages}
              className="h-8 w-8 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] text-[#0F2342] hover:bg-[#F8F9FA] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer transition-colors"
              aria-label="Página siguiente"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {modalOpen && (
        <ModalCategoria
          categoria={categoriaAEditar}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
