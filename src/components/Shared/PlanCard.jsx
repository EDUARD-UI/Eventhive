import React from 'react';
import { FiCheck, FiArrowRight, FiEdit2 } from 'react-icons/fi';
import { formatPrice } from '../../utils/formatters.js';

/**
 * Tarjeta de Plan de Promoción con Identidad Dorado Ámbar
 * Diseñada para transmitir exclusividad, visibilidad y categoría sin elementos decorativos superfluos.
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
  disabled = false,
  disabledText = '',
}) {
  const isPremium = Boolean(plan?.premium);

  // Beneficios derivados si no vienen explícitos del backend
  const features = plan?.beneficios || [
    'Posicionamiento prioritario en cartelera cultural',
    isPremium
      ? 'Espacio exclusivo en Carrusel Principal de Home'
      : 'Inclusión en sección de Eventos Destacados',
    plan?.pautaRedes
      ? 'Pauta activa y difusión en redes sociales'
      : 'Mayor visibilidad orgánica en búsquedas',
    plan?.comisionPorcentaje !== undefined
      ? `Comisión preferencial reducida al ${plan.comisionPorcentaje}%`
      : 'Soporte prioritario para organizadores',
  ];

  return (
    <div
      onClick={mode === 'select' && !disabled ? onSelect : undefined}
      className={`relative ${
        className || 'w-[300px] sm:w-[320px] md:w-[340px] shrink-0'
      } rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 select-none ${
        mode === 'select' && !disabled ? 'cursor-pointer hover:-translate-y-1.5' : ''
      } ${disabled ? 'opacity-70 cursor-not-allowed' : ''} ${
        isPremium
          ? 'bg-gradient-to-b from-[#181308] via-[#120F0A] to-[#0D111A] text-white border-2 border-amber-500/50 shadow-xl shadow-amber-950/20'
          : isHighlighted
          ? 'bg-gradient-to-b from-amber-50/60 to-white text-slate-900 border-2 border-amber-400 shadow-md'
          : 'bg-white text-slate-900 border border-slate-200/90 shadow-xs hover:border-amber-400/80 hover:shadow-md'
      } ${
        isSelected
          ? 'ring-3 ring-amber-500 border-amber-500 shadow-lg shadow-amber-500/20'
          : ''
      }`}
    >
      <div>
        {/* Cabecera del Plan */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span
            className={`font-display font-black text-base sm:text-lg tracking-tight ${
              isPremium ? 'text-amber-300' : 'text-slate-950'
            }`}
          >
            {plan?.nombre || 'Plan de Posicionamiento'}
          </span>

          {isPremium ? (
            <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase tracking-wider">
              Premium
            </span>
          ) : isHighlighted ? (
            <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-xs">
              Destacado
            </span>
          ) : plan?.codigo ? (
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isPremium
                  ? 'bg-amber-950/40 text-amber-400 border border-amber-500/20'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {plan.codigo}
            </span>
          ) : null}
        </div>

        {/* Precio Oficial del Plan */}
        <div className="flex items-baseline gap-2 mb-2">
          <span
            className={`font-display font-black text-2xl sm:text-3xl tracking-tight ${
              isPremium ? 'text-white' : 'text-slate-950'
            }`}
          >
            {formatPrice(plan?.precio || 0)}
          </span>
          <span
            className={`text-xs font-semibold ${
              isPremium ? 'text-amber-200/70' : 'text-slate-500'
            }`}
          >
            COP / evento
          </span>
        </div>

        {/* Descripción comercial */}
        <p
          className={`text-xs leading-relaxed line-clamp-2 min-h-[34px] mb-6 ${
            isPremium ? 'text-slate-300' : 'text-slate-600'
          }`}
        >
          {plan?.detallePublicidad ||
            'Posicionamiento y difusión oficial para impulsar tu producción en Cartagena.'}
        </p>

        {/* Lista de beneficios con checks dorado ámbar */}
        <div
          className={`space-y-2.5 mb-6 pt-3 border-t ${
            isPremium ? 'border-amber-500/20' : 'border-slate-100'
          }`}
        >
          {features.map((feat, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs">
              <span className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-amber-500 bg-amber-500/15 border border-amber-400/30">
                <FiCheck size={11} strokeWidth={3} />
              </span>
              <span
                className={`font-medium leading-tight ${
                  isPremium ? 'text-slate-200' : 'text-slate-700'
                }`}
              >
                {feat}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Botón de Acción inferior */}
      <div className="pt-2">
        {mode === 'select' ? (
          <button
            type="button"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              if (onSelect && !disabled) onSelect();
            }}
            className={`w-full py-2.5 px-3 pl-5 rounded-full flex items-center justify-between transition-all duration-300 font-extrabold text-xs uppercase tracking-wider ${
              disabled
                ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed opacity-75'
                : isSelected
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 cursor-pointer active:scale-98'
                : isPremium
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/10 cursor-pointer active:scale-98'
                : 'bg-slate-950 hover:bg-slate-900 text-white shadow-xs cursor-pointer active:scale-98'
            }`}
          >
            <span>{disabledText || (isSelected ? 'Plan Seleccionado' : 'Contratar Plan')}</span>
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform ${
                disabled
                  ? 'bg-slate-400/30 text-slate-500'
                  : isSelected || isPremium
                  ? 'bg-slate-950 text-amber-400'
                  : 'bg-amber-500 text-slate-950'
              }`}
            >
              {isSelected ? (
                <FiCheck size={13} strokeWidth={3} />
              ) : (
                <FiArrowRight size={13} strokeWidth={2.5} />
              )}
            </span>
          </button>
        ) : (
          <div className="space-y-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onEdit) onEdit();
              }}
              className="w-full py-2 px-3 pl-5 rounded-full flex items-center justify-between transition-all duration-300 font-bold text-xs uppercase tracking-wider cursor-pointer active:scale-98 bg-slate-950 text-white hover:bg-slate-900 shadow-sm"
            >
              <span>Editar Plan</span>
              <span className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shrink-0">
                <FiEdit2 size={13} />
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
