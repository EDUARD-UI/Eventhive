import React, { useState, useMemo } from 'react';
import { FiList, FiSearch, FiInfo, FiCheckCircle, FiShield } from 'react-icons/fi';

// Descripciones contextuales para orientar al moderador según los enums oficiales del backend
const GUIA_MOTIVOS = {
  INFORMACION_INSUFICIENTE: {
    titulo: 'Información Insuficiente',
    descripcion:
      'Aplica cuando el evento carece de datos esenciales para el público, como descripción ambigua, ausencia de dirección física clara o falta de detalles del itinerario.',
    tipo: 'Subsanable mediante corrección',
  },
  DOCUMENTACION_INVALIDA: {
    titulo: 'Documentación Inválida o Incompleta',
    descripcion:
      'Aplica cuando no se adjuntan permisos requeridos de espacio público, constancias de seguridad distrital o cuando los soportes de acreditación no son legibles.',
    tipo: 'Subsanable mediante corrección',
  },
  VIOLACION_POLITICA: {
    titulo: 'Violación de Políticas Comunitarias',
    descripcion:
      'Aplica cuando el contenido, imagen o temática infringe las normas de convivencia, leyes locales o los términos y condiciones de EventHive.',
    tipo: 'Causal de rechazo directo',
  },
  DATOS_INCONSISTENTES: {
    titulo: 'Datos Inconsistentes',
    descripcion:
      'Aplica cuando existen discrepancias entre la capacidad total declarada y la suma de localidades, o incoherencias en las fechas u horarios estipulados.',
    tipo: 'Subsanable mediante corrección',
  },
  PRECIOS_IRREGULARES: {
    titulo: 'Precios o Tarifas Irregulares',
    descripcion:
      'Aplica si los precios de las localidades son inconsistentes, negativos o carecen de claridad frente a la moneda oficial (COP).',
    tipo: 'Subsanable mediante corrección',
  },
};

export default function ModeradorMotivosView({ motivos = [], loading = false }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtrados = useMemo(() => {
    if (!searchTerm.trim()) return motivos;
    const term = searchTerm.toLowerCase();
    return motivos.filter((m) => {
      const code = m.toLowerCase();
      const info = GUIA_MOTIVOS[m];
      const title = (info?.titulo || '').toLowerCase();
      const desc = (info?.descripcion || '').toLowerCase();
      return code.includes(term) || title.includes(term) || desc.includes(term);
    });
  }, [motivos, searchTerm]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Encabezado y Explicación Normativa */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-base sm:text-lg font-bold text-slate-900">
                Catálogo de Motivos Oficiales
              </h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand/10 text-brand">
                {motivos.length} configurados en API
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Criterios estandarizados provistos por el endpoint <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">/api/enums/motivos-rechazos</code>
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <FiSearch
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Buscar motivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 outline-none focus:bg-white focus:border-brand"
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-3 text-xs text-blue-900">
          <FiInfo size={17} className="text-brand shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Estos motivos son obligatorios al emitir una solicitud de corrección o un rechazo. Al seleccionar uno,
            el sistema lo envía en el payload del endpoint <code className="font-mono bg-white/70 px-1 py-0.5 rounded text-blue-950 font-bold">PATCH /api/moderaciones/eventos/{'{id}'}/solicitar-correccion</code> o rechazar.
          </p>
        </div>
      </div>

      {/* Grid de Motivos Dinámicos */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 rounded-3xl bg-white border border-slate-200/60 p-5 animate-pulse"
            />
          ))}
        </div>
      ) : filtrados.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-dashed border-slate-200 text-center">
          <FiList size={28} className="mx-auto text-slate-400 mb-2" />
          <p className="font-bold text-slate-800 text-sm">No se encontraron motivos</p>
          <p className="text-xs text-slate-500 mt-1">
            {searchTerm
              ? 'Intenta con otro término de búsqueda.'
              : 'No hay motivos retornados por el servidor.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtrados.map((motivoCode) => {
            const info = GUIA_MOTIVOS[motivoCode] || {
              titulo: motivoCode.replace(/_/g, ' '),
              descripcion:
                'Criterio oficial registrado en el backend para la moderación técnica de eventos.',
              tipo: 'Criterio estándar del sistema',
            };

            return (
              <div
                key={motivoCode}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:border-brand/40 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-brand shrink-0" />
                      <h3 className="font-display font-bold text-sm text-slate-900">
                        {info.titulo}
                      </h3>
                    </div>

                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                      {motivoCode}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mt-2">
                    {info.descripcion}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-500">{info.tipo}</span>
                  <span className="text-brand font-bold">Enum Válido ✓</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
