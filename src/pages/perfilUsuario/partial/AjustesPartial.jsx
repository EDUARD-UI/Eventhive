import React from 'react';
import { FiKey } from 'react-icons/fi';
import { useLanguage } from '../../../context/LanguageContext.jsx';

export default function AjustesPartial({
  usuario,
  setUsuario,
  passwordForm,
  setPasswordForm,
  isUpdating,
  isChangingPassword,
  onUpdatePerfil,
  onChangePassword,
}) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Información Personal */}
      <div className="bg-white dark:bg-[#0E1626] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1">
            {t('DATOS DE CONTACTO') || 'DATOS DE CONTACTO'}
          </span>
          <h3 className="text-xl font-black text-slate-950 dark:text-white">
            {t('Información Personal')}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
            {t('Mantén actualizados tus datos para la emisión de tus boletos oficiales.')}
          </p>
        </div>

        <form onSubmit={onUpdatePerfil} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                {t('Nombre Completo')}
              </label>
              <input
                type="text"
                value={usuario.nombreCompleto}
                onChange={(e) =>
                  setUsuario({ ...usuario, nombreCompleto: e.target.value })
                }
                className="w-full text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-amber-400 focus:ring-2 focus:ring-slate-900/10 transition-all"
                placeholder={t('Tu nombre completo') || 'Tu nombre completo'}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                {t('Correo Electrónico')}
              </label>
              <input
                type="email"
                value={usuario.correo}
                disabled
                className="w-full text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 cursor-not-allowed"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                {t('Teléfono Celular')}
              </label>
              <input
                type="tel"
                value={usuario.telefono}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setUsuario({ ...usuario, telefono: cleaned });
                }}
                maxLength={10}
                className="w-full text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-amber-400 focus:ring-2 focus:ring-slate-900/10 transition-all"
                placeholder="Ej: 3001234567"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isUpdating}
              className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-xs font-bold uppercase tracking-wider shadow-xs transition-all disabled:opacity-60 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              {isUpdating && (
                <span className="w-3.5 h-3.5 border-2 border-white dark:border-slate-950 border-t-transparent rounded-full animate-spin" />
              )}
              <span>{t('Guardar Datos')}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Cambio de Contraseña */}
      <div className="bg-white dark:bg-[#0E1626] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
            <FiKey size={16} />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-950 dark:text-white">
              {t('Seguridad de la Cuenta')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
              {t('Actualiza tu contraseña periódicamente para proteger tu cuenta.')}
            </p>
          </div>
        </div>

        <form onSubmit={onChangePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                {t('Contraseña Actual')}
              </label>
              <input
                type="password"
                value={passwordForm.claveActual}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, claveActual: e.target.value })
                }
                placeholder="••••••••"
                className="w-full text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-amber-400 focus:ring-2 focus:ring-slate-900/10 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                {t('Nueva Contraseña')}
              </label>
              <input
                type="password"
                value={passwordForm.claveNueva}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, claveNueva: e.target.value })
                }
                placeholder={t('Mínimo 6 caracteres') || 'Mínimo 6 caracteres'}
                className="w-full text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-amber-400 focus:ring-2 focus:ring-slate-900/10 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                {t('Confirmar Contraseña')}
              </label>
              <input
                type="password"
                value={passwordForm.confirmarClave}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmarClave: e.target.value,
                  })
                }
                placeholder={t('Repite la contraseña') || 'Repite la contraseña'}
                className="w-full text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-amber-400 focus:ring-2 focus:ring-slate-900/10 transition-all"
                required
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isChangingPassword}
              className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-xs font-bold uppercase tracking-wider shadow-xs transition-all disabled:opacity-60 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              {isChangingPassword && (
                <span className="w-3.5 h-3.5 border-2 border-white dark:border-slate-950 border-t-transparent rounded-full animate-spin" />
              )}
              <span>{t('Actualizar Contraseña')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
