import { FiX, FiSun, FiMoon } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { NAV_LINKS } from '../constants/navigation.js';
import { getDashboardPathForRole, normalizeRole } from '../services/session.js';
import { useTheme } from '../context/ThemeContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import LanguageSwitcher from './common/LanguageSwitcher.jsx';

export default function MobileDrawer({ isOpen, onClose, onHelpClick, currentUser, onLogout }) {
  const { toggleTheme, isDark } = useTheme();
  const { t } = useLanguage();

  if (!isOpen) return null;

  const userRole = normalizeRole(currentUser?.role || currentUser?.rol);
  const accountPath = currentUser ? getDashboardPathForRole(userRole) : '/perfil';

  return (
    <div
      className="fixed inset-0 bg-ink/70 z-[60] backdrop-blur-sm transition-opacity"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('navbar.navMenuAria')}
        className="absolute bottom-0 right-0 top-0 z-[70] flex w-[85%] max-w-[360px] flex-col gap-2 overflow-y-auto bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 p-5 shadow-2xl border-l border-slate-200 dark:border-white/[0.08] transition-colors duration-200"
      >
        <div className="flex items-center justify-between mb-4 gap-2">
          <div className="flex items-center gap-2">
            {/* Selector de idioma ES / EN */}
            <LanguageSwitcher />

            {/* Botón de alternar tema con buen contraste */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800/60 text-xs font-semibold cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              {isDark ? (
                <>
                  <FiSun size={15} className="text-amber-400" />
                  <span className="text-slate-100">{t('navbar.lightModeLabel')}</span>
                </>
              ) : (
                <>
                  <FiMoon size={15} className="text-slate-700" />
                  <span className="text-slate-800">{t('navbar.darkModeLabel')}</span>
                </>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t('navbar.closeMenu')}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="flex flex-col">
          {NAV_LINKS.map((link) => {
            const translatedLabel =
              link.label === 'Buscar eventos'
                ? t('navbar.searchEvents')
                : link.label === 'Organizaciones'
                  ? t('navbar.organizations')
                  : link.label === 'Ayuda'
                    ? t('navbar.help')
                    : link.label;

            return link.label === 'Ayuda' ? (
              <button
                key={link.label}
                type="button"
                onClick={() => {
                  onClose();
                  onHelpClick();
                }}
                className="border-b border-slate-100 dark:border-slate-800/80 px-2 py-3 text-left text-[15px] font-semibold text-slate-800 dark:text-slate-200"
              >
                {translatedLabel}
              </button>
            ) : (
              <Link
                key={link.label}
                to={link.href}
                onClick={onClose}
                className="border-b border-slate-100 dark:border-slate-800/80 px-2 py-3 text-[15px] font-semibold text-slate-800 dark:text-slate-200"
              >
                {translatedLabel}
              </Link>
            );
          })}
        </div>

        {currentUser ? (
          <div className="mt-4 flex flex-col gap-2.5">
            <Link
              to={accountPath}
              onClick={onClose}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-center text-sm font-semibold text-slate-900 dark:text-white"
            >
              {currentUser.name || t('navbar.myAccountLower')}
            </Link>
            <button
              type="button"
              onClick={onLogout}
              className="w-full rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 cursor-pointer"
            >
              {t('navbar.logout')}
            </button>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-2.5">
            <Link
              to="/iniciosesion"
              onClick={onClose}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-center text-sm font-semibold text-slate-900 dark:text-white"
            >
              {t('navbar.login')}
            </Link>
            <Link
              to="/registro"
              onClick={onClose}
              className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 px-3 py-2.5 text-center text-sm font-bold text-slate-950 transition-colors"
            >
              {t('navbar.register')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
