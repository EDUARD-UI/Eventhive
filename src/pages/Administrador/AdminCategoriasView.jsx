import React, { useState, useMemo } from 'react';
import {
  Tag,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Sliders,
} from 'lucide-react';
import Badge from '../../components/Shared/Badge.jsx';
import Pagination from '../../components/Shared/Pagination.jsx';
import ModalCategoria from '../../components/componentsAdmin/ModalCategoria.jsx';

export default function AdminCategoriasView({
  categorias = [],
  onSaveCategoria,
  onToggleEstadoCategoria,
  onEliminarCategoria,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [categoriaAEditar, setCategoriaAEditar] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS'); // 'TODOS' | 'ACTIVAS' | 'INACTIVAS'

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const handleOpenCreate = () => {
    setCategoriaAEditar(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setCategoriaAEditar(cat);
    setModalOpen(true);
  };

  const handleSave = (catData) => {
    onSaveCategoria(catData);
    setModalOpen(false);
  };

  // Filtrado y búsqueda reactiva
  const filteredCategorias = useMemo(() => {
    return categorias.filter((cat) => {
      const matchSearch =
        cat.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchEstado =
        filtroEstado === 'TODOS' ||
        (filtroEstado === 'ACTIVAS' && cat.activa) ||
        (filtroEstado === 'INACTIVAS' && !cat.activa);

      return matchSearch && matchEstado;
    });
  }, [categorias, searchTerm, filtroEstado]);

  // Paginación en memoria
  const totalItems = filteredCategorias.length;
  const paginatedCategorias = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCategorias.slice(start, start + pageSize);
  }, [filteredCategorias, currentPage, pageSize]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Encabezado Principal y Acción Crear */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" strokeWidth={1.75} />
            <span>Administración de Categorías de Eventos</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestión centralizada del catálogo oficial en formato tabla (Sección 7)
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-2 w-fit"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Regla de Salvaguarda de Integridad (Sección 7) */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0">
          <AlertTriangle className="w-5 h-5" strokeWidth={1.75} />
        </div>
        <div className="text-xs text-amber-900 leading-relaxed">
          <span className="font-bold text-amber-950 block mb-0.5">
            Salvaguarda de Integridad Referencial:
          </span>
          Si una categoría ya tiene eventos asociados en la plataforma, <strong>es preferible desactivarla</strong> en lugar de eliminarla físicamente para proteger los tiquetes y publicaciones históricas.
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Buscar por nombre o descripción de categoría..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <select
            value={filtroEstado}
            onChange={(e) => {
              setFiltroEstado(e.target.value);
              setCurrentPage(1);
            }}
            className="py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="TODOS">Todos los Estados</option>
            <option value="ACTIVAS">Solo Activas</option>
            <option value="INACTIVAS">Solo Inactivas</option>
          </select>
        </div>
      </div>

      {/* TABLA DE GESTIÓN DE CATEGORÍAS */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Categoría</th>
                <th className="py-3.5 px-4">Descripción</th>
                <th className="py-3.5 px-4 text-center">Eventos Vinculados</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedCategorias.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No se encontraron categorías coincidentes con la búsqueda.
                  </td>
                </tr>
              ) : (
                paginatedCategorias.map((cat) => {
                  const tieneEventos = (cat.eventosAsociados || 0) > 0;

                  return (
                    <tr
                      key={cat.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Portada + Ícono + Nombre */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative">
                            <img
                              src={cat.imagenUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop'}
                              alt={cat.nombre}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/20" />
                            <span className="absolute inset-0 flex items-center justify-center text-xs drop-shadow">
                              {cat.icono || '🏷️'}
                            </span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {cat.nombre}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              ID: {cat.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Descripción */}
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                        <p className="line-clamp-2">{cat.descripcion}</p>
                      </td>

                      {/* Eventos Vinculados */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                          {cat.eventosAsociados || 0}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="py-3.5 px-4 text-center">
                        <Badge
                          variant={cat.activa ? 'success' : 'neutral'}
                          size="xs"
                        >
                          {cat.activa ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(cat)}
                            className="p-2 rounded-xl text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors"
                            title="Editar Categoría"
                          >
                            <Edit className="w-4 h-4" strokeWidth={1.75} />
                          </button>

                          <button
                            type="button"
                            onClick={() => onToggleEstadoCategoria(cat.id, !cat.activa)}
                            className={`py-1.5 px-2.5 rounded-xl text-[11px] font-bold transition-colors ${
                              cat.activa
                                ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                            }`}
                            title={cat.activa ? 'Desactivar Categoría' : 'Activar Categoría'}
                          >
                            {cat.activa ? 'Desactivar' : 'Activar'}
                          </button>

                          <button
                            type="button"
                            onClick={() => onEliminarCategoria(cat.id)}
                            className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors"
                            title={tieneEventos ? 'Desactivación sugerida (tiene eventos asociados)' : 'Eliminar físicamente'}
                          >
                            <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                          </button>
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

      {/* Modal Crear / Editar Categoría */}
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
