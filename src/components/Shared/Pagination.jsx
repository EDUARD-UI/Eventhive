import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 5,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20],
  showPageSize = true,
  className = '',
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const startRecord = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endRecord = Math.min(safePage * pageSize, totalItems);

  // Generate page numbers with intelligent truncation
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (safePage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (safePage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', safePage - 1, safePage, safePage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const handlePageClick = (page) => {
    if (typeof page === 'number' && page !== safePage && onPageChange) {
      onPageChange(page);
    }
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3.5 border-t border-slate-200/80 bg-slate-50/50 text-xs text-slate-600 select-none ${className}`}
    >
      {/* Información de registros y selector de tamaño */}
      <div className="flex flex-wrap items-center gap-3 text-slate-500">
        <span>
          Mostrando{' '}
          <strong className="font-semibold text-slate-800">
            {totalItems === 0 ? 0 : `${startRecord}-${endRecord}`}
          </strong>{' '}
          de <strong className="font-semibold text-slate-800">{totalItems}</strong> registros
        </span>

        {showPageSize && onPageSizeChange && totalItems > 0 && (
          <div className="flex items-center gap-1.5 ml-1 sm:ml-3 pl-3 border-l border-slate-200">
            <span className="text-[11px] text-slate-400">Filas:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 shadow-sm outline-none focus:border-brand cursor-pointer hover:border-slate-300 transition-colors"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Controles de paginación [ < ] [ 1 ] [ 2 ] [ > ] */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => handlePageClick(safePage - 1)}
          disabled={safePage <= 1}
          aria-label="Página anterior"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
        >
          <FiChevronLeft size={15} />
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, idx) => {
            if (p === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="flex h-8 w-8 items-center justify-center text-slate-400 text-xs"
                >
                  …
                </span>
              );
            }
            const isActive = p === safePage;
            return (
              <button
                key={p}
                type="button"
                onClick={() => handlePageClick(p)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex h-8 min-w-[32px] px-2 items-center justify-center rounded-lg text-xs font-semibold shadow-sm transition-all ${
                  isActive
                    ? 'bg-brand text-white shadow-brand/20 shadow-md font-bold'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => handlePageClick(safePage + 1)}
          disabled={safePage >= totalPages}
          aria-label="Página siguiente"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
        >
          <FiChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
