import { useState } from 'react';
import StandardLayout from '../../layouts/StandardLayout.jsx';
import StatCard from '../../components/Shared/StatCard.jsx';
import DataTable from '../../components/Shared/DataTable.jsx';
import Badge from '../../components/Shared/Badge.jsx';

import CreateEventWizard from '../../components/componentsOrganizador/CreateEventWizard.jsx';
import MiEvento from './MiEvento.jsx';
import AsistentesView from './AsistentesView.jsx';
import EntradasView from './EntradasView.jsx';
import PerfilOrganizador from './PerfilOrganizador.jsx';
import ActividadesView from './ActividadesView.jsx';
import {
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
    { id: 1, name: 'Festival Cartagena Jazz', category: 'Musica', date: '23 ago', status: 'Activo', tone: 'active', sold: '1.204', capacity: '1.500', action: 'Ver' },
    { id: 2, name: 'Noche de Sabores', category: 'Gastronomico', date: '29 ago', status: 'Activo', tone: 'active', sold: '800', capacity: '900', action: 'Ver' },
    { id: 3, name: 'Cátedra de Historia', category: 'Académico', date: '9 sep', status: 'Borrador', tone: 'draft', sold: '—', capacity: '', action: 'Ver' },
    { id: 4, name: 'Concierto de Verano', category: 'Entretenimiento', date: '2 jul', status: 'Finalizado', tone: 'finished', sold: '2.100', capacity: '2.100', action: 'Ver' },
];

const eventColumns = [
    { header: 'Evento', key: 'name', render: (val) => <span className="font-semibold text-[#273348]">{val}</span> },
    { header: 'Categoría', key: 'category', render: (val) => <span className="text-[#657993]">{val}</span> },
    { header: 'Fecha', key: 'date', render: (val) => <span className="text-[#657993]">{val}</span> },
    {
        header: 'Estado',
        key: 'status',
        render: (val, row) => <Badge tone={row.tone}>{val}</Badge>,
    },
    {
        header: 'Vendidas',
        key: 'sold',
        render: (val, row) => (
            <span className="text-[#657993]">
                <strong className="text-[#273348]">{val}</strong>{row.capacity ? ` / ${row.capacity}` : ''}
            </span>
        ),
    },
    {
        header: 'Acción',
        key: 'action',
        align: 'right',
        render: (val) => (
            <button type="button" className="text-[11px] font-semibold text-[#087fea] hover:text-[#0066c9]">
                {val}
            </button>
        ),
    },
];

function SalesChart() {
    const [period, setPeriod] = useState('Este mes');

    return (
        <section className="rounded-[13px] border border-[#e0e6ed] bg-white px-4 pb-3 pt-4 shadow-sm">
            <div className="flex items-center justify-between">
                <h2 className="font-display text-[13px] font-bold text-[#172033]">Ventas por evento (últimos 30 días)</h2>
                <label className="relative">
                    <span className="sr-only">Periodo del gráfico</span>
                    <select
                        value={period}
                        onChange={(event) => setPeriod(event.target.value)}
                        className="appearance-none rounded-[8px] border border-[#e0e6ed] bg-white py-1 pl-3 pr-7 text-[10px] text-[#667892] outline-none focus:border-[#087fea]"
                    >
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

export default function OrganizadorIndex() {
    const [activeItem, setActiveItem] = useState('resumen');
    const [creationView, setCreationView] = useState(null);
    const [notification, setNotification] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const activeMenu = menuItems.find((m) => m.id === activeItem);

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

    const filteredEvents = events.filter((ev) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return ev.name.toLowerCase().includes(term) || ev.category.toLowerCase().includes(term);
    });

    const renderContent = () => {
        if (creationView === 'wizard') {
            return <CreateEventWizard onBack={returnToEvents} onSave={showSuccess} />;
        }

        switch (activeItem) {
            case 'resumen':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <StatCard label="Eventos activos" value="8" change="2 este mes" />
                            <StatCard label="Entradas vendidas" value="3.412" change="12.4%" />
                            <StatCard label="Ingresos" value="$187M" change="8.1%" />
                            <StatCard label="Asistentes registrados" value="5.098" change="5.6%" />
                        </div>
                        <div><SalesChart /></div>
                        <div>
                            <DataTable
                                title="Eventos recientes"
                                actionLabel="Ver todos"
                                onAction={() => setActiveItem('eventos')}
                                columns={eventColumns}
                                data={filteredEvents}
                            />
                        </div>
                    </div>
                );
            case 'eventos':
                return <MiEvento onCreate={() => setCreationView('wizard')} externalSearch={searchTerm} />;
            case 'asistentes':
                return <AsistentesView />;
            case 'entradas':
                return <EntradasView />;
            case 'perfil':
                return <PerfilOrganizador />;
            case 'actividades':
                return <ActividadesView />;
            default:
                return (
                    <section className="flex min-h-[400px] flex-col items-center justify-center rounded-[13px] border border-[#e0e6ed] bg-white text-center shadow-sm">
                        <div className="mb-4 rounded-full bg-[#e8f2ff] p-4 text-[#087fea]"><FiPlus size={22} /></div>
                        <h2 className="font-display text-[22px] font-bold text-[#172033]">Sección en desarrollo</h2>
                        <p className="mt-2 text-[12px] text-[#71839c]">Esta vista quedará conectada a su backend cuando se configure el módulo.</p>
                    </section>
                );
        }
    };

    return (
        <StandardLayout
            role="Organizador"
            menuItems={menuItems}
            activeItem={activeItem}
            onSelect={(item) => {
                setActiveItem(item);
                setCreationView(null);
                setNotification(false);
            }}
            headerProps={{
                title: activeMenu ? activeMenu.label : 'Panel del Organizador',
                badgeText: 'Módulo de Organización',
                showSearch: true,
                searchTerm: searchTerm,
                onSearchChange: setSearchTerm,
                searchPlaceholder: 'Buscar eventos, entradas...',
                userName: 'Fundación Cultural Caribe',
                userInitials: 'FC',
            }}
            maxWidthClass="max-w-[1280px]"
        >
            {notification && (
                <div className="mb-6 flex items-start gap-3 rounded-[10px] border border-[#b7e9d2] bg-white px-4 py-3 shadow-[0_5px_16px_rgba(15,23,42,.12)]">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#079f72] text-white shrink-0">
                        <FiCheck size={14} />
                    </span>
                    <div className="flex-1">
                        <p className="text-[12px] font-bold text-[#172033]">Evento creado exitosamente</p>
                        <p className="mt-0.5 text-[10px] text-[#71839c]">Tu evento fue guardado correctamente.</p>
                    </div>
                    <button
                        type="button"
                        aria-label="Cerrar notificación"
                        onClick={() => setNotification(false)}
                        className="text-[#8a98a8] hover:text-[#172033]"
                    >
                        <FiX size={14} />
                    </button>
                </div>
            )}

            {renderContent()}
        </StandardLayout>
    );
}

