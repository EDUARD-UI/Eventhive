import React, { useState, useMemo } from 'react';
import {
  Tag,
  Plus,
  Search,
  Edit,
  Trash2,
  Image as ImageIcon,
  Calendar,
} from 'lucide-react';
import Pagination from '../../components/Shared/Pagination.jsx';
import ModalCategoria from '../../components/componentsAdmin/ModalCategoria.jsx';
import ActionButton from '../../components/Shared/ActionButton.jsx';

export default function AdminCategoriasView({
  categorias = [],
  onSaveCategoria,
  onEliminarCategoria,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [categoriaAEditar, setCategoriaAEditar] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  // Búsqueda reactiva por nombre (Categorías no tienen estado en backend)
  const filteredCategorias = useMemo(() => {
    return categorias.filter((cat) => {
      return cat.nombre?.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [categorias, searchTerm]);

  const totalItems = filteredCategorias.length;
  const paginatedCategorias = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCategorias.slice(start, start + pageSize);
  }, [filteredCategorias, currentPage, pageSize]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Tag className="w-5 h-5 text-amber-500" strokeWidth={2} />
            <span>Catálogo de Categorías</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Clasificación temática oficial de eventos culturales y de entretenimiento
          </p>
        </div>

        <ActionButton
          onClick={handleOpenCreate}
          variant="primary"
          className="w-fit px-4 py-2.5"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          <span>Nueva Categoría</span>
        </ActionButton>
      </div>

      {/* Barra de Búsqueda */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Buscar categoría por nombre..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <div className="text-xs font-semibold text-slate-500 self-end sm:self-center">
          Total: <span className="text-slate-900 font-bold">{filteredCategorias.length}</span> categorías
        </div>
      </div>

      {/* TABLA DE GESTIÓN DE CATEGORÍAS */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4 w-20">Foto</th>
                <th className="py-3.5 px-4">Nombre de la Categoría</th>
                <th className="py-3.5 px-4 text-center">Eventos Vinculados</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedCategorias.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    No se encontraron categorías coincidentes.
                  </td>
                </tr>
              ) : (
                paginatedCategorias.map((cat) => {
                  const tieneEventos = (cat.totalEventos || cat.eventosAsociados || 0) > 0;
                  const imageUrl = cat.imagenUrl || cat.urlFoto || cat.foto || null;

                  return (
                    <tr
                      key={cat.id}
                      className="hover:bg-white transition-colors"
                    >
                      {/* Fotografía entregada por backend */}
                      <td className="py-3.5 px-4">
                        <div className="w-14 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative flex items-center justify-center">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={cat.nombre}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-slate-300" />
                          )}
                        </div>
                      </td>

                      {/* Nombre */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 text-sm block">
                          {cat.nombre}
                        </span>
                        
                      </td>

                      {/* Eventos Vinculados */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                          <Calendar size={12} className="text-slate-400" />
                          <span>{cat.totalEventos ?? cat.eventosAsociados ?? 0}</span>
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(cat)}
                            className="p-2 rounded-xl text-slate-600 hover:text-amber-600 hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-colors cursor-pointer"
                            title="Editar Categoría"
                          >
                            <Edit className="w-4 h-4" strokeWidth={1.75} />
                          </button>

                          <ActionButton
                            onClick={() => onEliminarCategoria(cat.id)}
                            variant="danger"
                            className="rounded-xl p-2"
                            title={tieneEventos ? 'Desactivación sugerida (tiene eventos asociados)' : 'Eliminar categoría'}
                          >
                            <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                          </ActionButton>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          pageSizeOptions={[5, 10, 20]}
        />
      </div>

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
