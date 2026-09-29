import React, { useState, useEffect } from 'react';
import {
  FiSearch,
  FiFilter,
  FiEye,
  FiCalendar,
  FiMapPin,
  FiClock,
  FiInbox,
  FiLayers,
} from 'react-icons/fi';
import Badge from '../../components/Shared/Badge.jsx';
import Pagination from '../../components/Shared/Pagination.jsx';
import moderationService from '../../services/moderationService.js';
import categoryService from '../../services/categoryService.js';

const ESTADOS_DISPONIBLES = [
  { value: 'TODOS', label: 'Todos los estados' },
  { value: 'PENDIENTE_REVISION', label: 'Pendiente de Revisión' },
  { value: 'EN_CORRECCION', label: 'En Corrección' },
  { value: 'PUBLICADO', label: 'Publicado' },
  { value: 'RECHAZADO', label: 'Rechazado' },
  { value: 'SUSPENDIDO', label: 'Suspendido' },
];

export default function ModeradorHistorialView({
  onInspect,
  onAprobar,
  onSolicitarCorreccion,
  onRechazar,
}) {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  // Filtros
  const [searchTitle, setSearchTitle] = useState('');
  const [debouncedTitle, setDebouncedTitle] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('TODOS');
  const [categoriaFilter, setCategoriaFilter] = useState('');
  const [categorias, setCategorias] = useState([]);

  // Cargar categorías reales
  useEffect(() => {
    async function loadCats() {
      try {
        const cats = await categoryService.getAllCategories();
        setCategorias(cats || []);
      } catch {
        setCategorias([]);
      }
    }
    loadCats();
  }, []);

  // Debounce para búsqueda por texto
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTitle(searchTitle);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTitle]);

  // Carga de eventos desde GET /api/eventos/admin/buscar
  useEffect(() => {
    let isMounted = true;
    async function fetchEventos() {
      try {
        setLoading(true);
        const res = await moderationService.buscarEventosModeracion({
          titulo: debouncedTitle,
          categoriaId: categoriaFilter || undefined,
          estado: estadoFilter,
          page,
          size,
        });

        if (!isMounted) return;

        const content = res?.content || (Array.isArray(res) ? res : []);
        setEventos(content);
        setTotalElements(res?.totalElements ?? content.length);
      } catch (err) {
        console.error('Error buscando eventos para moderación:', err);
        if (isMounted) {
          setEventos([]);
          setTotalElements(0);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchEventos();

    return () => {
      isMounted = false;
    };
  }, [debouncedTitle, estadoFilter, categoriaFilter, page, size]);

  const getToneForEstado = (estado) => {
    switch (estado) {
      case 'PUBLICADO':
        return 'emerald';
      case 'PENDIENTE_REVISION':
        return 'amber';
      case 'EN_CORRECCION':
        return 'indigo';
      case 'RECHAZADO':
      case 'SUSPENDIDO':
        return 'rose';
      default:
        return 'slate';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Encabezado y Barra de Filtros */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="font-display text-base sm:text-lg font-bold text-slate-900">
            Explorador de Eventos y Moderación
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Consulta el estado de todos los eventos del sistema, revisa su trazabilidad y accede a su historial
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Búsqueda por título */}
          <div className="relative">
            <FiSearch
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Buscar por título..."
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 outline-none focus:bg-white focus:border-brand"
            />
          </div>

          {/* Filtro por estado */}
          <div className="relative">
            <select
              value={estadoFilter}
              onChange={(e) => {
                setEstadoFilter(e.target.value);
                setPage(0);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:border-brand cursor-pointer"
            >
              {ESTADOS_DISPONIBLES.map((est) => (
                <option key={est.value} value={est.value}>
                  {est.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por categoría */}
          <div className="relative">
            <select
              value={categoriaFilter}
              onChange={(e) => {
                setCategoriaFilter(e.target.value);
                setPage(0);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:border-brand cursor-pointer"
            >
              <option value="">Todas las categorías</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Resultados en Tabla estilizada */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3.5">Evento</th>
                <th className="px-5 py-3.5">Organización</th>
                <th className="px-5 py-3.5">Categoría</th>
                <th className="px-5 py-3.5">Fecha y Hora</th>
                <th className="px-5 py-3.5">Estado</th>
                <th className="px-5 py-3.5 text-right">Acción</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td colSpan={6} className="px-5 py-4">
                      <div className="h-4 bg-slate-200/70 rounded-md w-3/4" />
                    </td>
                  </tr>
                ))
              ) : eventos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                      <FiInbox size={22} />
                    </div>
                    <p className="font-bold text-slate-800 text-sm">
                      No se encontraron eventos
                    </p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Intenta ajustar los filtros de búsqueda para consultar otros registros.
                    </p>
                  </td>
                </tr>
              ) : (
                eventos.map((evento) => {
                  const categoriaNombre =
                    typeof evento.categoria === 'object'
                      ? evento.categoria?.nombre
                      : evento.categoria || '—';

                  const organizacionNombre =
                    typeof evento.organizacion === 'object'
                      ? evento.organizacion?.nombre
                      : evento.organizacion || '—';

                  return (
                    <tr
                      key={evento.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Evento */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                            {evento.foto ? (
                              <img
                                src={evento.foto}
                                alt={evento.titulo}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-[10px]">
                                EH
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-snug line-clamp-1">
                              {evento.titulo}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                              ID #{evento.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Organización */}
                      <td className="px-5 py-4 font-medium text-slate-800">
                        {organizacionNombre}
                      </td>

                      {/* Categoría */}
                      <td className="px-5 py-4">
                        <span className="text-[11px] font-semibold text-brand bg-brand-light/60 px-2 py-0.5 rounded-md">
                          {categoriaNombre}
                        </span>
                      </td>

                      {/* Fecha y Hora */}
                      <td className="px-5 py-4 text-slate-600">
                        {evento.fecha || '—'}
                        {evento.hora ? ` · ${evento.hora}` : ''}
                      </td>

                      {/* Estado */}
                      <td className="px-5 py-4">
                        <Badge tone={getToneForEstado(evento.estado)}>
                          {evento.estado || 'PENDIENTE'}
                        </Badge>
                      </td>

                      {/* Acción */}
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => onInspect(evento)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                        >
                          <FiEye size={13} />
                          <span>Inspeccionar</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalElements > 0 && (
          <Pagination
            currentPage={page + 1}
            totalItems={totalElements}
            pageSize={size}
            onPageChange={(newPage) => setPage(newPage - 1)}
            onPageSizeChange={(newSize) => {
              setSize(newSize);
              setPage(0);
            }}
            pageSizeOptions={[5, 10, 20]}
          />
        )}
      </div>
    </div>
  );
}
