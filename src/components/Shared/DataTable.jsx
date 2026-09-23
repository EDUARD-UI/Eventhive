import React, { useState, useMemo } from 'react';
import { FiInbox, FiSearch } from 'react-icons/fi';
import Pagination from './Pagination.jsx';

export default function DataTable({
  title,
  subtitle,
  actionLabel,
  onAction,
  columns = [],
  data = [],
  emptyMessage = 'No se encontraron registros.',
  emptyDescription = 'Intenta ajustar los filtros de búsqueda o agrega nuevos datos.',
  className = '',
  // Nuevas capacidades opcionales
  paginate = false,
  initialPageSize = 5,
  pageSizeOptions = [5, 10, 20],
  searchable = false,
  searchPlaceholder = 'Buscar en la tabla...',
  loading = false,
  badge = null,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [tableSearch, setTableSearch] = useState('');

  // Filtrado local si searchable está activo
  const filteredData = useMemo(() => {
    if (!searchable || !tableSearch.trim()) return data;
    const term = tableSearch.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const val = row[col.key];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(term);
      })
    );
  }, [data, searchable, tableSearch, columns]);

  // Paginación de los datos
  const paginatedData = useMemo(() => {
    if (!paginate) return filteredData;
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, paginate, currentPage, pageSize]);

  // Si cambia el filtro y la página queda fuera de rango, reseteamos a 1
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  if (currentPage > totalPages && currentPage !== 1) {
    setCurrentPage(1);
  }

  return (
    <section
      className={`rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden transition-all ${className}`}
    >
      {/* Encabezado de la tabla */}
      {(title || actionLabel || subtitle || searchable || badge) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 bg-white">
          <div>
            <div className="flex items-center gap-2">
              {title && (
                <h3 className="font-display text-[15px] sm:text-base font-bold text-slate-900 leading-tight">
                  {title}
                </h3>
              )}
              {badge && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand-light text-brand">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {searchable && (
              <div className="relative">
                <FiSearch
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={tableSearch}
                  onChange={(e) => {
                    setTableSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-56 rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-700 outline-none focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all"
                />
              </div>
            )}

            {actionLabel && (
              <button
                type="button"
                onClick={onAction}
                className="inline-flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors"
              >
                {actionLabel}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Contenedor con scroll horizontal optimizado */}
      <div className="overflow-x-auto w-full">
        <table className="w-full min-w-[650px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  className={`px-5 py-3 font-bold ${
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                  }`}
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {loading ? (
              // Esqueletos de carga
              Array.from({ length: 4 }).map((_, rIdx) => (
                <tr key={`skel-${rIdx}`} className="animate-pulse">
                  {columns.map((col, cIdx) => (
                    <td key={`skel-c-${cIdx}`} className="px-5 py-3.5">
                      <div className="h-4 bg-slate-200/70 rounded-md w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              // Estado vacío moderno
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
                    <FiInbox size={24} />
                  </div>
                  <p className="font-display text-sm font-bold text-slate-800">
                    {emptyMessage}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    {emptyDescription}
                  </p>
                </td>
              </tr>
            ) : (
              // Filas con hover estilizado
              paginatedData.map((row, rowIdx) => (
                <tr
                  key={row.id || rowIdx}
                  className="hover:bg-blue-50/30 transition-colors group"
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={col.key || colIdx}
                      className={`px-5 py-3.5 ${
                        col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                      }`}
                    >
                      {col.render
                        ? col.render(row[col.key], row)
                        : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pie de tabla con paginación */}
      {paginate && filteredData.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredData.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          pageSizeOptions={pageSizeOptions}
        />
      )}
    </section>
  );
}
