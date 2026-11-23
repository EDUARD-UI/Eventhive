import React, { useState, useEffect } from 'react';
import {
  FiSearch,
  FiInbox,
  FiRefreshCw,
} from 'react-icons/fi';
import Pagination from '../../components/Shared/Pagination.jsx';
import moderationService from '../../services/moderationService.js';
import categoryService from '../../services/categoryService.js';
import { formatHora12 } from '../../utils/formatters.js';

const ESTADOS_DISPONIBLES = [
  { value: 'TODOS', label: 'Todos los estados' },
  { value: 'PENDIENTE_REVISION', label: 'Pendiente de Revisión' },
  { value: 'EN_CORRECCION', label: 'En Corrección' },
  { value: 'PUBLICADO', label: 'Publicado' },
  { value: 'FINALIZADO', label: 'Finalizado' },
  { value: 'RECHAZADO', label: 'Rechazado' },
  { value: 'CANCELADO', label: 'Cancelado' },
  { value: 'SUSPENDIDO', label: 'Suspendido' },
];

export default function ModeradorHistorialView({
  onInspect = () => {},
}) {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  // Filtros
  const [searchTitle, setSearchTitle] = useState('');
  const [debouncedTitle, setDebouncedTitle] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('TODOS');
  const [categoriaFilter, setCategoriaFilter] = useState('');
  const [categorias, setCategorias] = useState([]);

  // Cargar categorías reales desde la API
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
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTitle]);

  // Carga de eventos desde GET /api/eventos/admin/buscar
  useEffect(() => {
    let isMounted = true;
    async function fetchEventos() {
      try {
        setLoading(true);
        setLoadError(null);
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
          setLoadError(err?.message || 'No se pudieron cargar los eventos.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchEventos();

    return () => {
      isMounted = false;
    };
  }, [debouncedTitle, estadoFilter, categoriaFilter, page, size, retryCount]);

  const getStatusDotColor = (estado) => {
    const st = String(estado || '').toUpperCase();
    if (st.includes('PUBLIC') || st.includes('APROB')) return '#15803D'; // Verde
    if (st.includes('PENDIENTE')) return '#F5B800'; // Amarillo
    if (st.includes('CORRECCION')) return '#B45309'; // Ámbar
    if (st.includes('RECHAZ') || st.includes('CANCEL') || st.includes('SUSPEND')) return '#DC2626'; // Rojo
    return '#64748B'; // Gris pizarra
  };

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-200">
      {/* Cabecera Editorial y Barra de Filtros Rectangulares */}
      <div className="border-b border-[#E2E8F0] pb-6 space-y-5">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-[clamp(1.5rem,4vw,2.25rem)] text-[#0F2342] tracking-tight uppercase leading-none">
            EXPLORAR EVENTOS DEL SISTEMA
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#64748B] mt-2">
            Consulta el estado de todos los eventos del sistema, revisa su trazabilidad y accede a su historial.
          </p>
        </div>

        {/* Filtros Superiores: Buscador + Selectores limpios (border-radius: 2px) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Búsqueda por título */}
          <div className="relative">
            <FiSearch
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none"
            />
            <input
              type="text"
              placeholder="Buscar evento por título..."
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] text-xs font-mono text-[#0F2342] placeholder-[#94A3B8] outline-none focus:border-[#0F2342] transition-colors"
            />
          </div>

          {/* Filtro por estado */}
          <div>
            <select
              value={estadoFilter}
              onChange={(e) => {
                setEstadoFilter(e.target.value);
                setPage(0);
              }}
              className="w-full px-3 py-2 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] text-xs font-mono text-[#0F2342] outline-none focus:border-[#0F2342] cursor-pointer"
            >
              {ESTADOS_DISPONIBLES.map((est) => (
                <option key={est.value} value={est.value}>
                  {est.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por categoría */}
          <div>
            <select
              value={categoriaFilter}
              onChange={(e) => {
                setCategoriaFilter(e.target.value);
                setPage(0);
              }}
              className="w-full px-3 py-2 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] text-xs font-mono text-[#0F2342] outline-none focus:border-[#0F2342] cursor-pointer"
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

      {loadError && eventos.length > 0 && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 p-3.5 bg-rose-50 border border-rose-200 text-xs font-mono text-rose-800 rounded-[2px]"
        >
          <span>{loadError}</span>
          <button
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
            className="font-bold underline text-rose-900 cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Tabla Editorial (Sin pills de colores) */}
      <div className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] overflow-hidden">
        <div className="editorial-scroll-x w-full">
          <table className="w-full border-collapse text-left text-xs min-w-[680px]">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#FFFFFF] font-mono text-[11px] uppercase tracking-wider text-[#64748B]">
                <th className="px-5 py-4 font-bold">Evento</th>
                <th className="px-5 py-4 font-bold">Organización</th>
                <th className="px-5 py-4 font-bold">Categoría</th>
                <th className="px-5 py-4 font-bold">Fecha y Hora</th>
                <th className="px-5 py-4 font-bold">Estado</th>
                <th className="px-5 py-4 font-bold text-right">Acción</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E2E8F0]">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td colSpan={6} className="px-5 py-4">
                      <div className="h-4 bg-[#F8F9FA] rounded-[1px] w-3/4" />
                    </td>
                  </tr>
                ))
              ) : loadError && eventos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <p role="alert" className="font-mono font-bold text-rose-800 text-xs">
                      No se pudieron cargar los eventos del sistema.
                    </p>
                    <p className="font-mono text-[11px] text-[#64748B] mt-1 max-w-sm mx-auto">
                      {loadError}
                    </p>
                    <button
                      type="button"
                      onClick={() => setRetryCount((count) => count + 1)}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-[#0F2342] text-white font-mono text-xs uppercase cursor-pointer"
                    >
                      <FiRefreshCw size={12} />
                      <span>Reintentar</span>
                    </button>
                  </td>
                </tr>
              ) : eventos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <FiInbox className="mx-auto text-[#64748B] mb-2" size={24} />
                    <p className="font-mono font-bold text-[#0F2342] text-xs uppercase tracking-wider">
                      No se encontraron eventos
                    </p>
                    <p className="font-mono text-[11px] text-[#64748B] mt-1 max-w-sm mx-auto">
                      Intenta ajustar los filtros de búsqueda para consultar otros registros.
                    </p>
                  </td>
                </tr>
              ) : (
                eventos.map((evento) => {
                  const categoriaNombre =
                    typeof evento.categoria === 'object'
                      ? evento.categoria?.nombre || 'General'
                      : evento.categoria || 'General';

                  const organizacionNombre =
                    typeof evento.organizacion === 'object'
                      ? evento.organizacion?.nombre || evento.organizacion?.razonSocial || '—'
                      : evento.organizacion || '—';

                  const dotColor = getStatusDotColor(evento.estado);
                  const fechaDisplay = evento.fecha || '—';
                  const horaDisplay = evento.hora ? ` • ${formatHora12(evento.hora)}` : '';

                  return (
                    <tr
                      key={evento.id}
                      className="hover:bg-[#F8F9FA]/60 transition-colors"
                    >
                      {/* Columna Evento: Miniatura cuadrada a todo color (40px x 40px) + Título en negrita */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-[2px] bg-[#F8F9FA] border border-[#E2E8F0] overflow-hidden shrink-0 flex items-center justify-center">
                            {evento.foto ? (
                              <img
                                src={evento.foto}
                                alt={evento.titulo}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="font-mono text-[10px] font-bold text-[#64748B]">
                                EH
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <p className="font-sans font-bold text-sm text-[#0F2342] truncate" title={evento.titulo}>
                              {evento.titulo}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Columna Organización */}
                      <td className="px-5 py-3.5 font-sans text-xs text-[#64748B]">
                        {organizacionNombre}
                      </td>

                      {/* Columna Categoría: Tipografía monoespaciada limpia sin cajas amarillas pastel */}
                      <td className="px-5 py-3.5 font-mono text-xs uppercase tracking-wider text-[#0F2342]">
                        {categoriaNombre}
                      </td>

                      {/* Columna Fecha y Hora: Tabular monoespaciada */}
                      <td className="px-5 py-3.5 font-mono text-xs text-[#64748B] whitespace-nowrap">
                        {fechaDisplay}{horaDisplay}
                      </td>

                      {/* Columna Estado: Indicador minimalista con punto de 6px + texto en mayúsculas */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: dotColor }}
                            aria-hidden="true"
                          />
                          <span className="font-mono text-xs uppercase tracking-wider font-semibold text-[#0F2342]">
                            {evento.estado || 'PENDIENTE'}
                          </span>
                        </div>
                      </td>

                      {/* Columna Acción: Botón rectangular limpio Inspeccionar */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onInspect(evento)}
                          className="px-3 py-1.5 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] hover:bg-[#F8F9FA] text-[#0F2342] font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer"
                        >
                          Inspeccionar
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación Inferior Limpia */}
        {totalElements > 0 && (
          <div className="p-3 border-t border-[#E2E8F0] flex flex-col sm:flex-row justify-between items-center gap-3 text-xs font-mono">
            <span className="text-[#64748B]">
              Mostrando {page * size + 1}–{Math.min((page + 1) * size, totalElements)} de {totalElements} eventos
            </span>
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
          </div>
        )}
      </div>
    </div>
  );
}
