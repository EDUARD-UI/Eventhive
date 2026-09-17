import { useState } from 'react';
import SideBar from '../../components/usersComponets/SideBar.jsx';

import CreateEventWizard from '../../components/componentsOrganizador/CreateEventWizard.jsx';
import MiEvento from './MiEvento.jsx';
import AsistentesView from './AsistentesView.jsx';
import EntradasView from './EntradasView.jsx';
import PerfilOrganizador from './PerfilOrganizador.jsx';
import {
    FiBell,
    FiCalendar,
    FiCheck,
    FiChevronDown,
    FiCreditCard,
    FiGrid,
    FiPlus,
    FiTrendingUp,
    FiUser,
    FiUsers,
    FiX,
} from 'react-icons/fi';

const menuItems = [
    { id: 'resumen', label: 'Resumen', icon: FiGrid },
    { id: 'eventos', label: 'Mis eventos', icon: FiCalendar },
    { id: 'asistentes', label: 'Asistentes', icon: FiUsers },
    { id: 'entradas', label: 'Entradas', icon: FiCreditCard },
    { id: 'perfil', label: 'Mi perfil', icon: FiUser },
    { id: 'actividades', label: 'Actividades Recientes', icon: FiTrendingUp },
];

const chartData = [
    { label: 'Académico', value: 70 },
    { label: 'Gastronomico', value: 100 },
    { label: 'Cultural', value: 52 },
    { label: 'Entretenimiento', value: 84 },
    { label: 'Deportivo', value: 38 },
    { label: 'Musica', value: 60 },
];

const events = [
    { name: 'Festival Cartagena Jazz', category: 'Musica', date: '23 ago', status: 'Activo', tone: 'active', sold: '1.204', capacity: '1.500', action: 'Ver' },
    { name: 'Noche de Sabores', category: 'Gastronomico', date: '29 ago', status: 'Activo', tone: 'active', sold: '800', capacity: '900', action: 'Ver' },
    { name: 'Cátedra de Historia', category: 'Académico', date: '9 sep', status: 'Borrador', tone: 'draft', sold: '—', capacity: '', action: 'Ver' },
    { name: 'Concierto de Verano', category: 'Entretenimiento', date: '2 jul', status: 'Finalizado', tone: 'finished', sold: '2.100', capacity: '2.100', action: 'Ver' },
];

function Header() {
    return (
        <header className="flex h-[71px] shrink-0 items-center justify-between border-b border-[#e3e8ef] bg-white px-10">
            <h1 className="font-display text-[18px] font-bold text-[#172033]">Hola, Fundación Cultural Caribe</h1>
            <div className="flex items-center gap-7">
                <button type="button" aria-label="Notificaciones" className="relative text-[#222936] hover:text-[#087fea]">
                    <FiBell size={16} />
                    <span className="absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full bg-[#168bf3]" />
                </button>
                <button type="button" aria-label="Abrir perfil" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#087fea] text-xs font-semibold text-white">
                    FC
                </button>
            </div>
        </header>
    );
}

function StatCard({ label, value, change }) {
    return (
        <div className="rounded-[11px] border border-[#e0e6ed] bg-white px-[14px] py-[13px]">
            <p className="text-[10px] font-medium text-[#6e819b]">{label}</p>
            <p className="mt-1 font-display text-[21px] font-bold leading-6 text-[#172033]">{value}</p>
            <p className="mt-1 text-[9px] font-semibold text-[#16bd63]"><span className="mr-1">↑</span>{change}</p>
        </div>
    );
}

function SalesChart() {
    const [period, setPeriod] = useState('Este mes');

    return (
        <section className="rounded-[13px] border border-[#e0e6ed] bg-white px-4 pb-3 pt-4">
            <div className="flex items-center justify-between">
                <h2 className="font-display text-[12px] font-bold text-[#172033]">Ventas por evento (últimos 30 días)</h2>
                <label className="relative">
                    <span className="sr-only">Periodo del gráfico</span>
                    <select value={period} onChange={(event) => setPeriod(event.target.value)} className="appearance-none rounded-[8px] border border-[#e0e6ed] bg-white py-1 pl-3 pr-7 text-[10px] text-[#667892] outline-none focus:border-[#087fea]">
                        <option>Este mes</option>
                        <option>Últimos 7 días</option>
                        <option>Este año</option>
                    </select>
                    <FiChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#68809d]" size={11} />
                </label>
            </div>
            <div className="mt-5 flex h-[135px] items-end justify-between gap-8 px-1 sm:px-3">
                {chartData.map(({ label, value }) => (
                    <div key={label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                        <div className="w-full max-w-[71px] rounded-t-[6px] bg-gradient-to-br from-[#0b82ee] to-[#39b9e9]" style={{ height: `${value}%` }} />
                        <span className="text-[9px] text-[#657993]">{label}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}

function EventsTable() {
    return (
        <section className="rounded-[13px] border border-[#e0e6ed] bg-white px-4 pb-4 pt-4">
            <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-[12px] font-bold text-[#172033]">Eventos</h2>
                <button type="button" className="text-[10px] font-semibold text-[#087fea] hover:text-[#0066c9]">Ver todos</button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] border-collapse text-left">
                    <thead>
                        <tr className="border-b border-[#e7ebf0] text-[9px] font-semibold uppercase text-[#71839c]">
                            <th className="pb-2 font-semibold">Evento</th>
                            <th className="pb-2 font-semibold">Categoría</th>
                            <th className="pb-2 font-semibold">Fecha</th>
                            <th className="pb-2 font-semibold">Estado</th>
                            <th className="pb-2 font-semibold">Vendidas</th>
                            <th className="pb-2 text-right font-semibold">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map((event) => (
                            <tr key={event.name} className="border-b border-[#e7ebf0] last:border-0">
                                <td className="py-[11px] text-[10px] font-semibold text-[#273348]">{event.name}</td>
                                <td className="py-[11px] text-[10px] text-[#657993]">{event.category}</td>
                                <td className="py-[11px] text-[10px] text-[#657993]">{event.date}</td>
                                <td className="py-[11px]">
                                    <span className={`rounded-[5px] px-2 py-1 text-[9px] font-semibold ${event.tone === 'active' ? 'bg-[#d9fbe8] text-[#13b962]' : event.tone === 'draft' ? 'bg-[#fff0d9] text-[#ed8b27]' : 'bg-[#edf2f7] text-[#8394ab]'}`}>
                                        {event.status}
                                    </span>
                                </td>
                                <td className="py-[11px] text-[10px] text-[#657993]"><strong className="text-[#273348]">{event.sold}</strong>{event.capacity && ` / ${event.capacity}`}</td>
                                <td className="py-[11px] text-right"><button type="button" className="text-[10px] font-semibold text-[#087fea] hover:text-[#0066c9]">{event.action}</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}



export default function OrganizadorIndex() {
    const [activeItem, setActiveItem] = useState('resumen');
    const [creationView, setCreationView] = useState(null);
    const [notification, setNotification] = useState(false);

    const showSuccess = () => {
        setCreationView(null);
        setActiveItem('eventos');
        setNotification(true);
    };

    const returnToEvents = () => {
        setCreationView(null);
        setActiveItem('eventos');
        setNotification(false);
    };

    const renderContent = () => {
        if (creationView === 'wizard') {
            return <CreateEventWizard onBack={returnToEvents} onSave={showSuccess} />;
        }

        switch (activeItem) {
            case 'resumen':
                return (
                    <>
                        <div className="grid grid-cols-1 gap-[10px] sm:grid-cols-2 xl:grid-cols-4">
                            <StatCard label="Eventos activos" value="8" change="2 este mes" />
                            <StatCard label="Entradas vendidas" value="3.412" change="12.4%" />
                            <StatCard label="Ingresos" value="$187M" change="8.1%" />
                            <StatCard label="Asistentes registrados" value="5.098" change="5.6%" />
                        </div>
                        <div className="mt-6"><SalesChart /></div>
                        <div className="mt-6"><EventsTable /></div>
                    </>
                );
            case 'eventos':
                return <MiEvento onCreate={() => setCreationView('wizard')} />;
            case 'asistentes':
                return <AsistentesView />;
            case 'entradas':
                return <EntradasView />;
            case 'perfil':
                return <PerfilOrganizador />;
            default:
                return (
                    <section className="flex min-h-[400px] flex-col items-center justify-center rounded-[13px] border border-[#e0e6ed] bg-white text-center">
                        <div className="mb-4 rounded-full bg-[#e8f2ff] p-4 text-[#087fea]"><FiPlus size={22} /></div>
                        <h2 className="font-display text-[22px] font-bold text-[#172033]">Sección en desarrollo</h2>
                        <p className="mt-2 text-[12px] text-[#71839c]">Esta vista quedará conectada a su backend cuando se configure el módulo.</p>
                    </section>
                );
        }
    };

    return (
        <div className="flex min-h-screen bg-[#f6f8fb] font-body text-[#172033]">
            <SideBar
                role="Organizador"
                items={menuItems}
                activeItem={activeItem}
                onSelect={(item) => {
                    setActiveItem(item);
                    setCreationView(null);
                    setNotification(false);
                }}
            />

            <div className="relative flex min-w-0 flex-1 flex-col">
                <Header />

                {notification && (
                    <div className="absolute right-8 top-[88px] z-30 flex w-[285px] items-start gap-3 rounded-[8px] border border-[#b7e9d2] bg-white px-4 py-3 shadow-[0_5px_16px_rgba(15,23,42,.12)]">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#079f72] text-white"><FiCheck size={14} /></span>
                        <div className="flex-1">
                            <p className="text-[12px] font-bold text-[#172033]">Evento creado exitosamente</p>
                            <p className="mt-0.5 text-[10px] text-[#71839c]">Tu evento fue guardado correctamente.</p>
                        </div>
                        <button type="button" aria-label="Cerrar notificación" onClick={() => setNotification(false)} className="text-[#8a98a8] hover:text-[#172033]">
                            <FiX size={14} />
                        </button>
                    </div>
                )}

                <main className="mx-auto w-full max-w-[1100px] flex-1 px-8 pb-10 pt-11">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}
