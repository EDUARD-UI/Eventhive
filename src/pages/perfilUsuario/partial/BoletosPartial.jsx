import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiMapPin,
  FiCalendar,
  FiShoppingBag,
  FiArrowRight,
  FiCheckCircle,
  FiExternalLink,
} from 'react-icons/fi';
import { useLanguage } from '../../../context/LanguageContext.jsx';

export default function BoletosPartial({ boletosList = [], onSelectTicket }) {
  const { t } = useLanguage();

  if (boletosList.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0E1626] rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-10 sm:p-14 text-center shadow-xs">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3.5 border border-amber-200/80 dark:border-amber-500/20">
          <FiShoppingBag size={22} />
        </div>
        <h4 className="font-extrabold text-base sm:text-lg text-slate-950 dark:text-white mb-1">
          {t('Aún no tienes boletos adquiridos')}
        </h4>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
          {t('Explora la cartelera cultural de Cartagena de Indias y adquiere tus entradas oficiales.')}
        </p>
        <Link
          to="/buscar"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-xs font-bold uppercase tracking-wider shadow-xs transition-all active:scale-95"
        >
          <span>{t('Explorar Cartelera')}</span>
          <FiArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {boletosList.map((ticket) => (
        <article
          key={ticket.id}
          className="bg-white dark:bg-[#0E1626] border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
        >
          {/* Cabecera del Boleto */}
          <div className="p-4 bg-slate-900 text-white relative border-b border-slate-800">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-1.5">
              <span className="text-amber-400">{t('Boleto Digital')}</span>
              <span className="bg-slate-800 text-slate-200 border border-slate-700 px-2 py-0.5 rounded-full">
                {ticket.zona}
              </span>
            </div>
            <h4 className="text-base font-extrabold leading-tight text-white line-clamp-1">
              {ticket.evento}
            </h4>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-300 font-medium">
              <span className="flex items-center gap-1.5">
                <FiCalendar size={12} className="text-amber-400" />
                <span>{ticket.fecha}</span>
              </span>
              <span>·</span>
              <span>{ticket.hora}</span>
            </div>
          </div>

          {/* Detalles de Acceso */}
          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <p className="flex items-center gap-1.5 truncate">
                <FiMapPin className="text-slate-400 shrink-0" size={13} />
                <span className="truncate">{ticket.lugar}</span>
              </p>
              <p>
                <strong className="text-slate-900 dark:text-white font-semibold">{t('Ubicación') || 'Ubicación'}:</strong> {ticket.asiento}
              </p>
              <p>
                <strong className="text-slate-900 dark:text-white font-semibold">{t('Titular')}:</strong> {ticket.titular}
              </p>
              <p>
                <strong className="text-slate-900 dark:text-white font-semibold">{t('Precio')}:</strong> {ticket.precio}
              </p>
            </div>

            {/* QR y Acciones */}
            <div className="pt-3 border-t border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <img
                  src={ticket.codigoQR}
                  alt="QR Boleto"
                  className="w-12 h-12 rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-white shrink-0 shadow-2xs"
                />
                <div>
                  <p className="text-[11px] font-mono font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                    <FiCheckCircle size={12} className="text-emerald-500" /> {ticket.estado}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">{t('Acceso Oficial')}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelectTicket(ticket)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white text-xs font-bold uppercase tracking-wider border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <FiExternalLink size={12} />
                <span>{t('Ver QR')}</span>
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
