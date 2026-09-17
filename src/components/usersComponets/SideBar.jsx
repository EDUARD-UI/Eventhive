import { Link } from 'react-router-dom';
import { FiArrowLeft, FiSettings } from 'react-icons/fi';
import logoEventhive from "../../assets/logo-eventhive.jpg";

const PAGE_BG = '#f0f4f9';

function Logo({ role }) {
    return (
        <div className="flex items-center gap-3 px-2 mb-8 mr-4 bg-white/5 p-2.5 rounded-2xl border border-white/10">
            <img src={logoEventhive} alt="EventHive Logo" className="h-10 w-10 object-contain rounded-xl bg-white p-1 shadow-sm shrink-0" />
            <div className="min-w-0">
                <div className="flex items-center gap-1.5 font-display font-bold text-sm text-white leading-tight">
                    Event<span className="text-[#3b82f6]">Hive</span>
                    <span className="text-[9px] font-bold text-slate-900 bg-accent px-1.5 py-0.5 rounded tracking-wider uppercase">{role}</span>
                </div>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">Tu evento. Conecta. Comparte</p>
            </div>
        </div>
    );
}

export default function SideBar({ role, items, activeItem, onSelect, variant = 'role' }) {
    const isAdmin = variant === 'admin';
    const background = isAdmin ? '#131b2e' : '#1d1f25';
    const pageBackground = isAdmin ? PAGE_BG : '#f6f8fb';

    return (
        <aside className="sticky top-0 flex h-screen min-h-screen w-64 shrink-0 self-start flex-col bg-[#131b2e] pt-6 pb-6 pl-4 pr-0 text-white select-none z-20" style={{ backgroundColor: background }}>
            <div className="min-h-0 flex-1 overflow-y-auto pr-0">
                <Logo role={role} />
                <nav className="flex flex-col gap-1">
                    {items.map(({ id, label, icon: Icon, count }) => {
                        const active = activeItem === id;
                        return (
                            <div key={id} className="relative">
                                <button type="button" onClick={() => onSelect(id)} className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-all text-left ${active ? (isAdmin ? 'bg-[#f0f4f9] text-slate-900 font-semibold rounded-l-2xl relative z-10' : 'bg-[#087fea] text-white font-semibold rounded-lg mr-3') : 'text-slate-300 hover:text-white hover:bg-white/5 rounded-l-2xl mr-3'}`}>
                                    <span className="flex items-center gap-3"><Icon size={18} className={active && isAdmin ? 'text-brand' : 'text-slate-400'} /><span>{label}</span></span>
                                    {count && <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${active ? (isAdmin ? 'bg-brand-light text-brand' : 'bg-white/15 text-white') : 'bg-white/10 text-slate-300'}`}>{count}</span>}
                                </button>
                                {active && isAdmin && <><span className="absolute -top-5 right-0 w-5 h-5 pointer-events-none z-10" style={{ background: `radial-gradient(circle at 0 0, transparent 19px, ${pageBackground} 19.5px)` }} /><span className="absolute -bottom-5 right-0 w-5 h-5 pointer-events-none z-10" style={{ background: `radial-gradient(circle at 0 100%, transparent 19px, ${pageBackground} 19.5px)` }} /></>}
                            </div>
                        );
                    })}
                </nav>
            </div>
            <div className="shrink-0 border-t border-white/10 pt-4 mr-4">
                <button type="button" className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-white/5"><FiSettings size={15} /> Configuración</button>
                <Link to="/" className="mt-1 flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-white/5"><FiArrowLeft size={15} /> Volver a la plataforma</Link>
            </div>
        </aside>
    );
}
