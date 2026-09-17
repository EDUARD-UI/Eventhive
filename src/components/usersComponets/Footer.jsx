const FOOTER_COLUMNS = [
  { title: 'Categorías', links: ['Música', 'Cultura', 'Gastronomía', 'Deportes'] },
  { title: 'Organizadores', links: ['Publica tu evento', 'Precios', 'Recursos'] },
  { title: 'Compañía', links: ['Sobre nosotros', 'Contacto', 'Términos', 'Privacidad'] },
];

export default function Footer() {
  return (
    <footer className="bg-ink text-slate-300 px-6 sm:px-10 pt-10 sm:pt-12 pb-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-9">
        <div className="col-span-2 sm:col-span-1">
          <div className="font-display font-bold text-white text-lg mb-3">
            event<span className="text-accent">hive</span>
          </div>
          <p className="text-[13px] leading-relaxed max-w-[260px]">
            La forma más fácil de descubrir y vivir lo que pasa en Cartagena.
          </p>
        </div>

        {FOOTER_COLUMNS.map((col) => (
          <div key={col.title}>
            <h5 className="text-white text-[13px] font-semibold mb-3.5">{col.title}</h5>
            <ul className="flex flex-col gap-2 text-[13px]">
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#" className="hover:text-white transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-2.5 pt-5 border-t border-slate-700 text-xs text-slate-400">
        <span>© 2026 Event Hive. Todos los derechos reservados.</span>
        <div className="flex gap-2.5">
          {['f', 'ig', 'x'].map((s) => (
            <span key={s} className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[11px]">
              {s}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
