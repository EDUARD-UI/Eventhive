import { Link } from 'react-router-dom';
import { FiGlobe, FiMessageSquare, FiInstagram, FiMail } from 'react-icons/fi';
import AppLogo from '../common/AppLogo.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

export default function Footer({ onHelpClick }) {
  const { t } = useLanguage();

  return (
    <footer className="relative z-10 w-full bg-slate-100 dark:bg-[#060D1E] text-slate-600 dark:text-slate-400 pt-14 pb-8 border-t border-slate-200 dark:border-white/[0.08] transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-6 sm:px-12 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-200 dark:border-white/10">
          {/* Brand Col con nuevo sistema de logotipado oficial de EventHive */}
          <div className="md:col-span-2 space-y-4">
            <Link
              to="/"
              className="inline-block group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-xl"
              aria-label={`EventHive - ${t('footer.subtitle')}`}
            >
              <AppLogo
                className="h-11 sm:h-12 w-fit group-hover:scale-105 transition-transform duration-300 drop-shadow-xs"
                textClassName="text-2xl sm:text-[26px] font-extrabold tracking-tight leading-none text-slate-900 dark:text-white"
                subtitle={t('footer.subtitle')}
                subtitleClassName="text-xs sm:text-[13px] font-normal text-slate-500 dark:text-slate-300 mt-1 sm:mt-1.5 leading-tight tracking-normal"
              />
            </Link>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              {t('footer.description')}
            </p>
          </div>

          {/* Col 1: Eventos */}
          <div>
            <h4 className="text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider mb-4">
              {t('footer.eventsTitle')}
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/buscar" className="hover:text-amber-700 dark:hover:text-amber-400 transition-colors duration-200">
                  {t('footer.allEvents')}
                </Link>
              </li>
              <li>
                <Link to="/perfil" className="hover:text-amber-700 dark:hover:text-amber-400 transition-colors duration-200">
                  {t('footer.myFavorites')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Organizaciones */}
          <div>
            <h4 className="text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider mb-4">
              {t('footer.organizationsTitle')}
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/organizacion" className="hover:text-amber-700 dark:hover:text-amber-400 transition-colors duration-200">
                  {t('footer.publishEvent')}
                </Link>
              </li>
              <li>
                <Link to="/organizaciones" className="hover:text-amber-700 dark:hover:text-amber-400 transition-colors duration-200">
                  {t('footer.directory')}
                </Link>
              </li>
              <li>
                <Link to="/registro" className="hover:text-amber-700 dark:hover:text-amber-400 transition-colors duration-200">
                  {t('footer.register')}
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onHelpClick}
                  className="hover:text-amber-700 dark:hover:text-amber-400 transition-colors duration-200 text-left cursor-pointer"
                >
                  {t('footer.helpCenter')}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Sobre Nosotros */}
          <div>
            <h4 className="text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider mb-4">
              {t('footer.aboutTitle')}
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/acerca-de" className="hover:text-amber-700 dark:hover:text-amber-400 transition-colors duration-200">
                  {t('footer.aboutUs')}
                </Link>
              </li>
              <li>
                <Link to="/privacidad" className="hover:text-amber-700 dark:hover:text-amber-400 transition-colors duration-200">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link to="/terminos" className="hover:text-amber-700 dark:hover:text-amber-400 transition-colors duration-200">
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="hover:text-amber-700 dark:hover:text-amber-400 transition-colors duration-200">
                  {t('footer.contact')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>{t('footer.copyright')}</p>
          <div className="flex items-center gap-3">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white border border-slate-200 dark:border-white/10 flex items-center justify-center transition-colors duration-200"
            >
              <FiInstagram size={15} />
            </a>
            <a
              href="mailto:contacto@eventhive.co"
              aria-label={t('footer.contactEmailAria')}
              className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white border border-slate-200 dark:border-white/10 flex items-center justify-center transition-colors duration-200"
            >
              <FiMail size={15} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
