import React, { useState } from 'react';
import { BarChart3, ChevronDown, MapPin, TrendingUp } from 'lucide-react';

const ZONES_DATA = [
  { zona: 'Centro Histórico', eventos: 48, volumen: '$68.4M', aforo: 4200, pct: 95 },
  { zona: 'Getsemaní / San Diego', eventos: 32, volumen: '$38.2M', aforo: 2600, pct: 75 },
  { zona: 'Bocagrande / Castillo', eventos: 24, volumen: '$29.1M', aforo: 1800, pct: 60 },
  { zona: 'Manga / Pie de la Popa', eventos: 18, volumen: '$16.5M', aforo: 1400, pct: 45 },
  { zona: 'Zona Norte / Boquilla', eventos: 16, volumen: '$22.0M', aforo: 1900, pct: 52 },
  { zona: 'Isla de Barú', eventos: 9, volumen: '$14.8M', aforo: 850, pct: 38 },
];

export default function PlatformMetricsChart() {
  const [period, setPeriod] = useState('Este mes');
  const [metricType, setMetricType] = useState('volumen');

  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-[#087fea]">
              <BarChart3 className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-slate-900 leading-tight">
                Densidad de Eventos y Volumen por Zona
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Distribución operativa en las principales localidades de Cartagena de Indias
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMetricType('volumen')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                metricType === 'volumen'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Volumen ($)
            </button>
            <button
              type="button"
              onClick={() => setMetricType('eventos')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                metricType === 'eventos'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Eventos
            </button>
            <button
              type="button"
              onClick={() => setMetricType('aforo')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                metricType === 'aforo'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Aforo
            </button>
          </div>

          <div className="relative">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="appearance-none rounded-xl border border-slate-200 bg-slate-50/70 py-1.5 pl-3 pr-8 text-xs font-bold text-slate-700 outline-none hover:border-slate-300 focus:border-[#087fea] cursor-pointer transition-colors"
            >
              <option>Este mes</option>
              <option>Últimos 30 días</option>
              <option>Año 2026</option>
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5"
              strokeWidth={1.75}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex h-[180px] items-end justify-between gap-3 sm:gap-6 px-2 sm:px-6">
        {ZONES_DATA.map((item) => {
          const displayValue =
            metricType === 'volumen'
              ? item.volumen
              : metricType === 'eventos'
              ? `${item.eventos} eventos`
              : `${item.aforo} pers.`;

          const heightPct =
            metricType === 'volumen'
              ? item.pct
              : metricType === 'eventos'
              ? Math.round((item.eventos / 50) * 100)
              : Math.round((item.aforo / 4500) * 100);

          return (
            <div
              key={item.zona}
              className="group relative flex h-full flex-1 flex-col items-center justify-end gap-2"
            >
              <div className="absolute -top-10 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                <div className="rounded-xl bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-lg whitespace-nowrap flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-[#FFC107]" strokeWidth={2} />
                  <span>{item.zona}:</span>
                  <span className="text-[#FFC107]">{displayValue}</span>
                </div>
                <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1" />
              </div>

              <div
                className="w-full max-w-[52px] rounded-t-xl bg-gradient-to-t from-[#087fea] via-sky-500 to-sky-400 group-hover:from-[#0060cc] group-hover:to-[#087fea] transition-all duration-300 shadow-xs cursor-pointer"
                style={{ height: `${Math.max(heightPct, 12)}%` }}
              />

              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 text-center truncate w-full group-hover:text-slate-900 transition-colors">
                {item.zona.split(' / ')[0]}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#087fea]" />
            Zona activa con mayor aforo
          </span>
          <span className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" strokeWidth={1.75} />
            <strong className="text-emerald-700">+18.4%</strong> crecimiento trimestral
          </span>
        </div>
        <span className="text-[11px] text-slate-400">
          Datos auditados por moderación distrital
        </span>
      </div>
    </section>
  );
}
