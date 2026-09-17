import { FiCalendar, FiClock, FiMapPin } from 'react-icons/fi';

const colorStyles = {
    green: {
        cover: 'bg-gradient-to-br from-[#35d39b] to-[#0aa878]',
        category: 'text-[#0a9b72]',
    },
    red: {
        cover: 'bg-gradient-to-br from-[#ff6d73] to-[#f44349]',
        category: 'text-[#ed3f47]',
    },
    blue: {
        cover: 'bg-gradient-to-br from-[#39b9e9] to-[#0788c9]',
        category: 'text-[#0879b5]',
    },
};

export default function OrganizerEventCard({ event }) {
    const styles = colorStyles[event.color] || colorStyles.blue;

    return (
        <article className="flex min-h-[225px] flex-col overflow-hidden rounded-[11px] border border-[#e1e6ed] bg-white shadow-[0_3px_8px_rgba(22,36,56,0.06)] transition-transform hover:-translate-y-0.5 hover:shadow-md">
            <div className={`relative h-[110px] shrink-0 p-3 ${styles.cover}`}>
                <span className="rounded-[4px] bg-white px-2 py-1 text-[9px] font-bold text-[#172033] shadow-sm">
                    {event.category}
                </span>
            </div>
            <div className="flex flex-1 flex-col px-3.5 py-3">
                <p className={`text-[8px] font-bold uppercase ${styles.category}`}>{event.category}</p>
                <h3 className="mt-0.5 font-display text-[11px] font-bold leading-tight text-[#172033]">{event.title}</h3>
                <div className="mt-2 space-y-1 text-[9px] text-[#71839c]">
                    <p className="flex items-center gap-1.5"><FiCalendar size={11} />{event.date}</p>
                    <p className="flex items-center gap-1.5"><FiClock size={11} />{event.time}</p>
                    <p className="flex items-center gap-1.5 truncate"><FiMapPin size={11} />{event.location}</p>
                </div>
                <div className="mt-auto border-t border-[#edf0f4] pt-2">
                    <span className={`text-[11px] font-bold ${event.price === 0 ? 'text-[#18bf79]' : 'text-[#273348]'}`}>
                        {event.price === 0 ? 'Gratis' : event.price}
                    </span>
                </div>
            </div>
        </article>
    );
}
