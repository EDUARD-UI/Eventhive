import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiCalendar,
  FiShoppingBag,
  FiArrowRight,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
} from 'react-icons/fi';
import { useLanguage } from '../../../context/LanguageContext.jsx';
import Pagination from '../../../components/Shared/Pagination.jsx';

const TICKETS_PAGE_SIZE = 4;

export default function BoletosPartial({ boletosList = [], loadError = '' }) {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(boletosList.length / TICKETS_PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const visibleTickets = boletosList.slice(
    (safePage - 1) * TICKETS_PAGE_SIZE,
    safePage * TICKETS_PAGE_SIZE
  );

  if (boletosList.length === 0 && loadError) {
    return (
      <div className="bg-white dark:bg-[#0E1626] rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center shadow-xs max-w-xl mx-auto my-6">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3.5 border border-amber-200/80 dark:border-amber-500/20">
          <FiAlertCircle size={22} />
        </div>
        <h4 className="font-extrabold text-base sm:text-lg text-slate-950 dark:text-white uppercase tracking-tight mb-1">
          {t('No pudimos cargar tus boletos')}
        </h4>
        <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
          {loadError}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <FiRefreshCw size={14} />
          <span>{t('Reintentar')}</span>
        </button>
      </div>
    );
  }

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
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {visibleTickets.map((ticket) => (
          <article
            key={ticket.id}
            className="bg-white dark:bg-[#0E1626] border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
          >
            {/* Cabecera del Boleto */}
            <div className="p-4 bg-slate-900 text-white relative border-b border-slate-800">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-1.5">
                <span className="text-amber-400">{t('Boleto Digital')}</span>
                {ticket.zona && (
                  <span className="bg-slate-800 text-slate-200 border border-slate-700 px-2 py-0.5 rounded-full">
                    {ticket.zona}
                  </span>
                )}
              </div>
              <h4 className="text-base font-extrabold leading-tight text-white line-clamp-1">
                {ticket.evento}
              </h4>
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-300 font-medium">
                <span className="flex items-center gap-1.5">
                  <FiCalendar size={12} className="text-amber-400" />
                  <span>{ticket.fecha}</span>
                </span>
                {ticket.hora && (
                  <>
                    <span>·</span>
                    <span>{ticket.hora}</span>
                  </>
                )}
              </div>
            </div>

            {/* Detalles del Boleto (sin ubicación, sin titular, sin QR) */}
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                {ticket.precio && (
                  <p className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-semibold">{t('Precio') || 'Precio'}:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{ticket.precio}</span>
                  </p>
                )}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{t('Estado') || 'Estado'}:</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <FiCheckCircle size={12} />
                    <span>{ticket.estado && ticket.estado !== '—' ? ticket.estado : 'Confirmado'}</span>
                  </span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
      <Pagination
        currentPage={safePage}
        totalItems={boletosList.length}
        pageSize={TICKETS_PAGE_SIZE}
        onPageChange={setCurrentPage}
        minimal
      />
    </>
  );
}
