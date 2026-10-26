import React from 'react';
import { FiX, FiDownload } from 'react-icons/fi';
import { showInfoAlert } from '../../utils/alertUtils.js';
import { useLanguage } from '../../context/LanguageContext.jsx';

export default function ModalTicketQR({ ticket, onClose }) {
  const { t } = useLanguage();

  if (!ticket) return null;

  const handleConfirmPass = () => {
    showInfoAlert({
      title: 'Boleto Digital Verificado',
      text: 'Puedes presentar este código QR directamente en tu dispositivo o guardar una captura para ingresar.',
      badge: 'Acceso Oficial',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-fade-in">
      {/* Backdrop para cerrar */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="bg-white dark:bg-[#0E1626] rounded-2xl sm:rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden z-10">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors p-1 cursor-pointer"
          title={t('Cerrar')}
        >
          <FiX size={18} />
        </button>

        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-0.5 rounded-full inline-block">
          {t('Pase Digital Oficial')}
        </span>

        <h3 className="font-extrabold text-base sm:text-lg text-slate-950 dark:text-white mt-2.5 leading-snug">
          {ticket.evento}
        </h3>
        <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-0.5">
          {ticket.zona} · {ticket.asiento}
        </p>

        <div className="my-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 inline-block shadow-inner">
          <img
            src={ticket.codigoQR}
            alt="QR Code"
            className="w-44 h-44 mx-auto object-contain rounded-lg bg-white p-2"
          />
          <p className="font-mono text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest">
            {t('Código de Acceso Oficial')}
          </p>
        </div>

        <div className="text-xs text-slate-700 dark:text-slate-300 text-left bg-slate-50 dark:bg-slate-900/80 p-3 rounded-xl mb-4 space-y-1 font-medium border border-slate-100 dark:border-slate-800">
          <p>
            <strong className="text-slate-900 dark:text-white">{t('Fecha')}:</strong> {ticket.fecha} ({ticket.hora})
          </p>
          <p className="truncate">
            <strong className="text-slate-900 dark:text-white">{t('Lugar')}:</strong> {ticket.lugar}
          </p>
          <p>
            <strong className="text-slate-900 dark:text-white">{t('Titular')}:</strong> {ticket.titular}
          </p>
          <p>
            <strong className="text-slate-900 dark:text-white">{t('Precio')}:</strong> {ticket.precio}
          </p>
        </div>

        <button
          type="button"
          onClick={handleConfirmPass}
          className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-xs font-bold uppercase tracking-wider shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
        >
          <FiDownload size={14} />
          <span>{t('Guardar / Confirmar Pase')}</span>
        </button>
      </div>
    </div>
  );
}
