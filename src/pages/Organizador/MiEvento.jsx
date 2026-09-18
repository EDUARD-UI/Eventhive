import { useState } from 'react';
import { FiFilter, FiPlus, FiSearch } from 'react-icons/fi';
import OrganizerEventCard from '../../components/componentsOrganizador/OrganizerEventCard.jsx';

const organizerEvents = [
    { id: 1, category: 'Deportivo', title: 'Vóley Playa Bocagrande', date: '7 sep', time: '8:00 AM', location: 'Playas de Bocagrande', price: 0, color: 'green' },
    { id: 2, category: 'Entretenimiento', title: 'Cine bajo las estrellas', date: '4 sep', time: '7:30 PM', location: 'Parque del Centenario', price: '$15.000', color: 'red' },
    { id: 3, category: 'Académico', title: 'Cátedra Historia Colonial', date: '9 sep', time: '5:00 PM', location: 'U. de Cartagena', price: 0, color: 'blue' },
    { id: 4, category: 'Entretenimiento', title: 'Cine bajo las estrellas', date: '4 sep', time: '7:30 PM', location: 'Parque del Centenario', price: '$15.000', color: 'red' },
    { id: 5, category: 'Deportivo', title: 'Vóley Playa Bocagrande', date: '7 sep', time: '8:00 AM', location: 'Playas de Bocagrande', price: 0, color: 'green' },
    { id: 6, category: 'Entretenimiento', title: 'Cine bajo las estrellas', date: '4 sep', time: '7:30 PM', location: 'Parque del Centenario', price: '$15.000', color: 'red' },
    { id: 7, category: 'Académico', title: 'Cátedra Historia Colonial', date: '9 sep', time: '5:00 PM', location: 'U. de Cartagena', price: 0, color: 'blue' },
    { id: 8, category: 'Entretenimiento', title: 'Cine bajo las estrellas', date: '4 sep', time: '7:30 PM', location: 'Parque del Centenario', price: '$15.000', color: 'red' },
];

export default function MiEvento({ onCreate, externalSearch = '' }) {
    const [category, setCategory] = useState('Todos');
    const [search, setSearch] = useState('');

    const effectiveSearch = externalSearch || search;

    const filteredEvents = organizerEvents.filter((event) => {
        const matchesCategory = category === 'Todos' || event.category === category;
        const matchesSearch =
            event.title.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
            event.location.toLowerCase().includes(effectiveSearch.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="font-display text-[18px] sm:text-[20px] font-bold text-[#172033]">Gestión de Eventos</h2>
                    <p className="mt-0.5 text-xs text-[#64748b]">Administra tus eventos activos, borradores y finalizados.</p>
                </div>
                <button
                    type="button"
                    onClick={onCreate}
                    className="flex items-center gap-2 rounded-xl bg-[#087fea] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#006ed8] hover:shadow-md"
                >
                    <FiPlus size={15} /> Crear evento
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <OrganizerStat value="9" label="Eventos Activos" color="bg-emerald-500" />
                <OrganizerStat value="3" label="Borradores" color="bg-amber-500" />
                <OrganizerStat value="0" label="Finalizados" color="bg-blue-500" />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[13px] border border-[#e2e8f0] bg-white px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2.5">
                    <span className="text-xs font-semibold text-slate-500">Filtrar por:</span>
                    <select
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-[#087fea]"
                    >
                        <option value="Todos">Todas las categorías</option>
                        <option value="Deportivo">Deportivo</option>
                        <option value="Entretenimiento">Entretenimiento</option>
                        <option value="Académico">Académico</option>
                    </select>
                </div>

                {!externalSearch && (
                    <label className="relative min-w-[200px] flex-1 sm:max-w-xs">
                        <span className="sr-only">Buscar eventos</span>
                        <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Filtrar por nombre o lugar..."
                            className="w-full rounded-full border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-700 outline-none focus:bg-white focus:border-[#087fea]"
                        />
                    </label>
                )}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {filteredEvents.map((event) => (
                    <OrganizerEventCard key={event.id} event={event} />
                ))}
            </div>
        </div>
    );
}

function OrganizerStat({ value, label, color }) {
    return (
        <div className="flex h-[75px] items-center gap-5 rounded-[11px] border border-[#e0e6ed] bg-white px-2">
            <span className={`h-9 w-9 rounded-[10px] ${color}`} />
            <div>
                <p className="font-display text-[21px] font-bold leading-5 text-[#172033]">{value}</p>
                <p className="mt-1 text-[10px] text-[#172033]">{label}</p>
            </div>
        </div>
    );
}