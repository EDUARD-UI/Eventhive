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

export default function MiEvento({ onCreate }) {
    const [category, setCategory] = useState('Todos');
    const [search, setSearch] = useState('');

    const filteredEvents = organizerEvents.filter((event) => {
        const matchesCategory = category === 'Todos' || event.category === category;
        const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase()) || event.location.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div>
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="font-display text-[18px] font-bold text-[#172033]">Mis Eventos</h2>
                    <p className="mt-0.5 text-[13px] text-[#71839c]">Gestión de tus eventos aquí.</p>
                </div>
                <button type="button" onClick={onCreate} className="flex items-center gap-2 rounded-[8px] bg-[#087fea] px-4 py-2 text-[12px] font-semibold text-white shadow-sm transition-colors hover:bg-[#006ed8]">
                    <FiPlus size={14} /> Crear evento
                </button>
            </div>

            <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-3">
                <OrganizerStat value="9" label="Activos" color="bg-[#efff62]" />
                <OrganizerStat value="3" label="Borradores" color="bg-[#c8defd]" />
                <OrganizerStat value="0" label="Finalizados" color="bg-[#12b981]" />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-[11px] border border-[#e0e6ed] bg-white px-5 py-3">
                <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-[6px] border border-[#e0e6ed] bg-white px-2 py-1.5 text-[10px] text-[#41536c] outline-none">
                    <option value="Todos">Categorías: Todos</option>
                    <option value="Deportivo">Deportivo</option>
                    <option value="Entretenimiento">Entretenimiento</option>
                    <option value="Académico">Académico</option>
                </select>
                <button type="button" className="flex items-center gap-1.5 rounded-[6px] border border-[#e0e6ed] px-2.5 py-1.5 text-[10px] text-[#41536c] hover:border-[#087fea]">
                    <FiFilter size={11} /> Filtrar
                </button>
                <label className="relative min-w-[190px] flex-1">
                    <span className="sr-only">Buscar eventos</span>
                    <FiSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa9bb]" />
                    <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar..." className="w-full rounded-full border border-[#dce3ea] bg-[#f2f5f8] py-1.5 pl-9 pr-3 text-[10px] outline-none focus:border-[#087fea]" />
                </label>
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