import { FiCheck, FiArrowRight, FiEdit2, FiStar } from 'react-icons/fi';
import { formatPrice } from '../../utils/formatters.js';

/**
 * Tarjeta de Plan de Promoción diseñada con la estética de EventHive
 * inspirada en el layout de precios con tarjetas horizontales (light & dark).
 */
export default function PlanCard({
  plan,
  isSelected = false,
  isHighlighted = false,
  onSelect,
  // Props para modo Marketing (editable):
  mode = 'select', // 'select' | 'manage'
  onEdit,
  className = '',
}) {
  const isDark = isHighlighted || Boolean(plan?.premium);

  // Beneficios derivados si no vienen explícitos
  const features = plan?.beneficios || [
    'Posicionamiento garantizado en cartelera',
    plan?.premium ? 'Banner en Carrusel Principal del Home' : 'Inclusión en sección destacados',
    plan?.pautaRedes ? 'Pauta activa en redes sociales' : 'Visibilidad orgánica en plataforma',
    plan?.comisionPorcentaje !== undefined
      ? `Comisión reducida del ${plan.comisionPorcentaje}%`
      : 'Soporte prioritario EventHive',
  ];

  return (
    <div
      onClick={mode === 'select' ? onSelect : undefined}
      className={`relative ${className || 'w-[300px] sm:w-[320px] md:w-[340px] shrink-0'} rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 border select-none ${
        mode === 'select' ? 'cursor-pointer hover:-translate-y-1' : ''
      } ${
        isDark
          ? 'bg-[#0E1526] text-white border-slate-700 shadow-xl'
          : 'bg-white text-slate-900 border-slate-200/90 shadow-sm hover:shadow-md'
      } ${
        isSelected
          ? 'ring-3 ring-[#FF5A1F] border-transparent shadow-lg shadow-orange-500/15'
          : ''
      }`}
    >
      {/* Badge Superior / Etiqueta */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <span
            className={`font-display font-extrabold text-sm sm:text-base tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            {plan?.nombre || 'Plan Estándar'}
          </span>

          {(plan?.premium || isHighlighted) && (
            <span className="px-3 py-1 rounded-full bg-[#FF5A1F] text-white text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
              <FiStar size={11} className="fill-white" />
              <span>Popular</span>
            </span>
          )}

          {plan?.codigo && !plan?.premium && !isHighlighted && (
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {plan.codigo}
            </span>
          )}
        </div>

        {/* Precio */}
        <div className="flex items-baseline gap-2 mb-2">
          <span
            className={`font-display font-black text-2xl sm:text-3xl tracking-tight ${
              isDark ? 'text-white' : 'text-slate-950'
            }`}
          >
            {formatPrice(plan?.precio || 0)}
          </span>
          <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            — / evento
          </span>
        </div>

        {/* Descripción */}
        <p
          className={`text-xs leading-relaxed line-clamp-2 min-h-[36px] mb-6 ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}
        >
          {plan?.detallePublicidad || 'Posicionamiento y difusión oficial para tu evento en EventHive.'}
        </p>

        {/* Lista de características con checks */}
        <div className="space-y-2.5 mb-6 pt-3 border-t border-slate-200/20">
          {features.map((feat, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs">
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  isDark ? 'text-[#FF5A1F] bg-orange-500/10' : 'text-[#FF5A1F] bg-orange-50'
                }`}
              >
                <FiCheck size={11} strokeWidth={3} />
              </span>
              <span
                className={`font-medium leading-tight ${
                  isDark ? 'text-slate-200' : 'text-slate-700'
                }`}
              >
                {feat}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Botón de acción inferior (estilo pill con icono circular en el extremo derecho) */}
      <div className="pt-2">
        {mode === 'select' ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onSelect) onSelect();
            }}
            className={`w-full py-2 px-3 pl-5 rounded-full flex items-center justify-between transition-all duration-300 font-bold text-xs uppercase tracking-wider cursor-pointer active:scale-98 ${
              isSelected
                ? 'bg-[#FF5A1F] text-white shadow-md shadow-orange-500/20'
                : isDark
                ? 'bg-white text-slate-900 hover:bg-slate-100 shadow-sm'
                : 'bg-[#0B1B3D] text-white hover:bg-slate-900 shadow-sm'
            }`}
          >
            <span>{isSelected ? 'Plan Seleccionado' : 'Seleccionar Plan'}</span>
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform ${
                isSelected
                  ? 'bg-white text-[#FF5A1F]'
                  : 'bg-[#FF5A1F] text-white'
              }`}
            >
              {isSelected ? <FiCheck size={14} strokeWidth={3} /> : <FiArrowRight size={13} strokeWidth={2.5} />}
            </span>
          </button>
        ) : (
          /* Modo Gestión (Marketing): Editable */
          <div className="space-y-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onEdit) onEdit();
              }}
              className={`w-full py-2 px-3 pl-5 rounded-full flex items-center justify-between transition-all duration-300 font-bold text-xs uppercase tracking-wider cursor-pointer active:scale-98 ${
                isDark
                  ? 'bg-white text-slate-900 hover:bg-slate-100 shadow-sm'
                  : 'bg-[#0B1B3D] text-white hover:bg-slate-900 shadow-sm'
              }`}
            >
              <span>Editar Plan</span>
              <span className="w-7 h-7 rounded-full bg-[#FF5A1F] text-white flex items-center justify-center shrink-0">
                <FiEdit2 size={13} />
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
