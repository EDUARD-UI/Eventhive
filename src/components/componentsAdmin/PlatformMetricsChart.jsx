import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, TrendingUp, Layers, CheckCircle2 } from 'lucide-react';
import adminService from '../../features/admin/services/adminService.js';

// Paleta de colores atractiva y accesible para los sectores del gráfico
const SLICE_COLORS = [
  '#087fea', // Azul Heroica
  '#f59e0b', // Ámbar Colmena
  '#10b981', // Esmeralda Caribe
  '#8b5cf6', // Violeta Festivo
  '#ec4899', // Rosa Cartagena
  '#06b6d4', // Turquesa Mar
  '#f97316', // Naranja Atardecer
  '#6366f1', // Índigo Nocturno
];

export default function PlatformMetricsChart({ eventosPorCategoria = [] }) {
  const [data, setData] = useState(eventosPorCategoria);
  const [loading, setLoading] = useState(false);
  const [activeSliceIndex, setActiveSliceIndex] = useState(null);

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

  const totalEventos = useMemo(
    () => data.reduce((acc, curr) => acc + (curr.cantidadEventos || 0), 0),
    [data]
  );

  // Generar datos angulares para el gráfico de torta / donut
  const slices = useMemo(() => {
    if (totalEventos === 0) return [];

    let currentAngle = 0;
    return data.map((item, index) => {
      const count = item.cantidadEventos || 0;
      const percentage = (count / totalEventos) * 100;
      const angle = (count / totalEventos) * 360;

      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle += angle;

      const color = SLICE_COLORS[index % SLICE_COLORS.length];

      return {
        ...item,
        index,
        count,
        percentage: Number(percentage.toFixed(1)),
        startAngle,
        endAngle,
        color,
      };
    });
  }, [data, totalEventos]);

  // Función matemática para construir arcos SVG de donut
  const createArcPath = (startAngle, endAngle, outerRadius = 120, innerRadius = 70) => {
    const toRadians = (deg) => ((deg - 90) * Math.PI) / 180;

    // Prevenir anomalías en círculos de 360 grados exactos
    const effectiveEnd = endAngle - startAngle >= 359.99 ? startAngle + 359.99 : endAngle;

    const x1 = 160 + outerRadius * Math.cos(toRadians(startAngle));
    const y1 = 160 + outerRadius * Math.sin(toRadians(startAngle));
    const x2 = 160 + outerRadius * Math.cos(toRadians(effectiveEnd));
    const y2 = 160 + outerRadius * Math.sin(toRadians(effectiveEnd));

    const x3 = 160 + innerRadius * Math.cos(toRadians(effectiveEnd));
    const y3 = 160 + innerRadius * Math.sin(toRadians(effectiveEnd));
    const x4 = 160 + innerRadius * Math.cos(toRadians(startAngle));
    const y4 = 160 + innerRadius * Math.sin(toRadians(startAngle));

    const largeArcFlag = effectiveEnd - startAngle > 180 ? 1 : 0;

    return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
  };

  const activeItem = activeSliceIndex !== null ? slices[activeSliceIndex] : null;

  return (
    <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs overflow-hidden">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
            <PieChart className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-slate-900 leading-tight">
              Eventos por Categoría
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Distribución porcentual en gráfico circular sin desbordamiento de pantalla
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
        <div className="h-64 flex items-center justify-center text-slate-400 text-xs animate-pulse">
          Cargando distribución de categorías...
        </div>
      ) : data.length === 0 || totalEventos === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
          <PieChart className="w-10 h-10 text-slate-300 mb-2" />
          <span>No hay eventos registrados por categoría aún.</span>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-[320px_1fr] items-center gap-6 sm:gap-10">
          {/* Gráfico circular SVG Donut */}
          <div className="relative flex items-center justify-center mx-auto w-full max-w-[280px] sm:max-w-[320px] aspect-square">
            <svg
              viewBox="0 0 320 320"
              className="w-full h-full transform transition-transform duration-300"
            >
              {slices.map((slice) => {
                const isHovered = activeSliceIndex === slice.index;
                const path = createArcPath(
                  slice.startAngle,
                  slice.endAngle,
                  isHovered ? 128 : 120,
                  isHovered ? 66 : 70
                );

                return (
                  <path
                    key={slice.categoriaId || slice.nombre}
                    d={path}
                    fill={slice.color}
                    className="cursor-pointer transition-all duration-200"
                    style={{
                      filter: isHovered
                        ? `drop-shadow(0 4px 12px ${slice.color}66)`
                        : 'none',
                      opacity: activeSliceIndex === null || isHovered ? 1 : 0.6,
                    }}
                    onMouseEnter={() => setActiveSliceIndex(slice.index)}
                    onMouseLeave={() => setActiveSliceIndex(null)}
                  />
                );
              })}
            </svg>

            {/* Centro del Donut con información interactiva */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-4">
              {activeItem ? (
                <div className="animate-in fade-in zoom-in duration-150">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block truncate max-w-[120px]">
                    {activeItem.nombre}
                  </span>
                  <strong className="text-2xl font-black text-slate-900 leading-none my-0.5 block">
                    {activeItem.count}
                  </strong>
                  <span
                    className="text-[10px] font-black px-2 py-0.5 rounded-full inline-block"
                    style={{
                      backgroundColor: `${activeItem.color}20`,
                      color: activeItem.color,
                    }}
                  >
                    {activeItem.percentage}% del total
                  </span>
                </div>
              ) : (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Catálogo
                  </span>
                  <strong className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight block">
                    {totalEventos}
                  </strong>
                  <span className="text-[11px] text-slate-500 font-medium">Eventos</span>
                </div>
              )}
            </div>
          </div>

          {/* Leyenda en cuadrícula adaptable */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Distribución por Sectores
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
              {slices.map((slice) => {
                const isHovered = activeSliceIndex === slice.index;
                return (
                  <div
                    key={slice.categoriaId || slice.nombre}
                    onMouseEnter={() => setActiveSliceIndex(slice.index)}
                    onMouseLeave={() => setActiveSliceIndex(null)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isHovered
                        ? 'border-slate-300 bg-slate-50 shadow-2xs translate-x-1'
                        : 'border-slate-100 bg-white hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-3 h-3 rounded-md shrink-0 transition-transform"
                        style={{
                          backgroundColor: slice.color,
                          transform: isHovered ? 'scale(1.2)' : 'scale(1)',
                        }}
                      />
                      <span className="text-xs font-bold text-slate-800 truncate" title={slice.nombre}>
                        {slice.nombre}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-mono font-bold text-slate-700">
                        {slice.count}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 w-10 text-right">
                        ({slice.percentage}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Pie de Métricas */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Visualización responsive circular
          </span>
          <span className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#087fea]" strokeWidth={2} />
            Sincronizado con base de datos de eventos
          </span>
        </div>
      </div>
    </section>
  );
}
