import React from 'react';

export default function DataTable({
  title,
  actionLabel,
  onAction,
  columns = [],
  data = [],
  emptyMessage = 'No se encontraron registros.',
  className = '',
}) {
  return (
    <section className={`rounded-[13px] border border-[#e0e6ed] bg-white p-4 shadow-sm ${className}`}>
      {(title || actionLabel) && (
        <div className="mb-3.5 flex items-center justify-between">
          {title && <h2 className="font-display text-[13px] font-bold text-[#172033]">{title}</h2>}
          {actionLabel && (
            <button
              type="button"
              onClick={onAction}
              className="text-[11px] font-semibold text-[#087fea] hover:text-[#0066c9] transition-colors"
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[#e7ebf0] text-[9px] font-semibold uppercase tracking-wider text-[#71839c]">
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  className={`pb-2.5 font-semibold ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-6 text-center text-xs text-[#71839c]">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={row.id || rowIdx}
                  className="border-b border-[#e7ebf0] last:border-0 hover:bg-slate-50/50 transition-colors"
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={col.key || colIdx}
                      className={`py-3 text-[11px] ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                    >
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
