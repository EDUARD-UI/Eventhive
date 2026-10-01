import React, { useState, useMemo } from 'react';
import {
  Tag,
  Plus,
  Search,
  Edit,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';
import Badge from '../../components/Shared/Badge.jsx';
import Pagination from '../../components/Shared/Pagination.jsx';
import ModalCategoria from '../../components/componentsAdmin/ModalCategoria.jsx';
import AdminInfoAlert from '../../components/componentsAdmin/AdminInfoAlert.jsx';

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

  // Filtrado y búsqueda reactiva (Requisito 6: sin campo descripción)
  const filteredCategorias = useMemo(() => {
    return categorias.filter((cat) => {
      const matchSearch = cat.nombre?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchEstado =
        filtroEstado === 'TODOS' ||
        (filtroEstado === 'ACTIVAS' && cat.activa !== false) ||
        (filtroEstado === 'INACTIVAS' && cat.activa === false);

      return matchSearch && matchEstado;
    });
  }, [categorias, searchTerm, filtroEstado]);

  const totalItems = filteredCategorias.length;
  const paginatedCategorias = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCategorias.slice(start, start + pageSize);
  }, [filteredCategorias, currentPage, pageSize]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Alerta Informativa Inicial (Requisito 10) */}
      <AdminInfoAlert
        id="categorias"
        title="Catálogo Oficial de Categorías"
        description="Gestione las categorías temáticas de eventos. Cada categoría cuenta con ID, nombre y fotografía procesada y almacenada por el backend. Si una categoría posee eventos asociados, es recomendable desactivarla para preservar la integridad transaccional."
      />

      {/* Encabezado Principal y Acción Crear */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" strokeWidth={1.75} />
            <span>Administración de Categorías de Eventos</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Catálogo temático para clasificar y destacar eventos en la plataforma
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-2 w-fit"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Buscar por nombre de categoría..."
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

      {/* TABLA DE GESTIÓN DE CATEGORÍAS (Requisito 6: ID, Nombre, Foto) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">ID</th>
                <th className="py-3.5 px-4">Fotografía</th>
                <th className="py-3.5 px-4">Nombre de la Categoría</th>
                <th className="py-3.5 px-4 text-center">Eventos Vinculados</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedCategorias.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
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
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      {/* ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-400 text-[11px]">
                        #{cat.id}
                      </td>

                      {/* Fotografía entregada por backend */}
                      <td className="py-3.5 px-4">
                        <div className="w-14 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative flex items-center justify-center">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={cat.nombre}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-slate-400">
                              <ImageIcon className="w-4 h-4" />
                            </div>
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
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                          {cat.totalEventos ?? cat.eventosAsociados ?? 0}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="py-3.5 px-4 text-center">
                        <Badge
                          variant={cat.activa !== false ? 'success' : 'neutral'}
                          size="xs"
                        >
                          {cat.activa !== false ? 'Activa' : 'Inactiva'}
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
                            onClick={() => onToggleEstadoCategoria(cat.id, cat.activa === false)}
                            className={`py-1.5 px-2.5 rounded-xl text-[11px] font-bold transition-colors ${
                              cat.activa !== false
                                ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                            }`}
                            title={cat.activa !== false ? 'Desactivar Categoría' : 'Activar Categoría'}
                          >
                            {cat.activa !== false ? 'Desactivar' : 'Activar'}
                          </button>

                          <button
                            type="button"
                            onClick={() => onEliminarCategoria(cat.id)}
                            className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors"
                            title={tieneEventos ? 'Desactivación sugerida (tiene eventos asociados)' : 'Eliminar categoría'}
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
