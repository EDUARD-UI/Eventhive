import React, { useState, useEffect } from 'react';
import { Tag, TrendingUp, Layers } from 'lucide-react';
import adminService from '../../features/admin/services/adminService.js';

export default function PlatformMetricsChart({ eventosPorCategoria = [] }) {
  const [data, setData] = useState(eventosPorCategoria);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (eventosPorCategoria && eventosPorCategoria.length > 0) {
      setData(eventosPorCategoria);
    } else {
      let isMounted = true;
      async function loadCategories() {
        try {
          setLoading(true);
          const res = await adminService.getEventosPorCategoria();
          if (isMounted && res?.data && res.data.length > 0) {
            setData(res.data);
          }
        } catch (err) {
          console.warn('Error cargando eventos por categoría:', err);
        } finally {
          if (isMounted) setLoading(false);
        }
      }
      loadCategories();
      return () => {
        isMounted = false;
      };
    }
  }, [eventosPorCategoria]);

  const totalEventos = data.reduce((acc, curr) => acc + (curr.cantidadEventos || 0), 0);
  const maxEventos = Math.max(...data.map((d) => d.cantidadEventos || 0), 1);

  return (
    <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-50 text-[#087fea] border border-blue-100">
            <Tag className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-slate-900 leading-tight">
              Eventos por Categoría
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Distribución de eventos publicados y activos según el catálogo temático
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700">
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span>Total: {totalEventos} eventos</span>
          </span>
        </div>
      </div>

      {loading ? (
        <div className="h-44 flex items-center justify-center text-slate-400 text-xs animate-pulse">
          Cargando distribución de categorías...
        </div>
      ) : data.length === 0 ? (
        <div className="h-44 flex flex-col items-center justify-center text-slate-400 text-xs">
          <Tag className="w-8 h-8 text-slate-300 mb-1" />
          <span>No hay eventos registrados por categoría aún.</span>
        </div>
      ) : (
        <div className="mt-6 flex h-[200px] items-end justify-between gap-2 sm:gap-4 px-2 sm:px-6">
          {data.map((item) => {
            const count = item.cantidadEventos || 0;
            const pct = Math.round((count / maxEventos) * 100);
            const globalPct = totalEventos > 0 ? Math.round((count / totalEventos) * 100) : 0;

            return (
              <div
                key={item.categoriaId || item.nombre}
                className="group relative flex h-full flex-1 flex-col items-center justify-end gap-2"
              >
                {/* Tooltip Hover */}
                <div className="absolute -top-12 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                  <div className="rounded-xl bg-slate-900 px-3 py-1.5 text-[11px] font-bold text-white shadow-xl whitespace-nowrap flex items-center gap-2">
                    <span className="text-slate-300">{item.nombre}:</span>
                    <span className="text-[#FFC107] font-black">{count} eventos</span>
                    <span className="text-slate-400 text-[10px]">({globalPct}%)</span>
                  </div>
                  <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1" />
                </div>

                <div
                  className="w-full max-w-[48px] rounded-t-xl bg-gradient-to-t from-[#087fea] via-sky-500 to-sky-400 group-hover:from-[#0060cc] group-hover:to-[#087fea] transition-all duration-300 shadow-2xs cursor-pointer"
                  style={{ height: `${Math.max(pct, 12)}%` }}
                />

                <span
                  className="text-[10px] sm:text-[11px] font-semibold text-slate-600 text-center truncate w-full group-hover:text-primary transition-colors"
                  title={item.nombre}
                >
                  {item.nombre}
                </span>
                <span className="text-[10px] font-mono text-slate-400 -mt-1 block">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#087fea]" />
            Categorías con mayor oferta de eventos
          </span>
          <span className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2} />
            Métricas sincronizadas con el catálogo central
          </span>
        </div>
      </div>
    </section>
  );
}
