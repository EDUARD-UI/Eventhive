import { FiBell } from 'react-icons/fi';

//aun no se conecta bien este componente con el backend, por eso se le pasan props para mostrar datos de prueba
export function HeaderUser({
    title = 'xx',
    initials = 'FC',
    notificationCount = 0,
    onNotificationClick,
    onProfileClick,
}) {
    return (
        <header className="sticky top-0 z-40 flex h-[71px] shrink-0 items-center justify-between border-b border-[#e3e8ef] bg-white/95 px-10 backdrop-blur-sm">
            <h1 className="font-display text-[18px] font-bold text-[#172033]">{title}</h1>

            <div className="flex items-center gap-7">
                <button
                    type="button"
                    aria-label="Notificaciones"
                    onClick={onNotificationClick}
                    className="relative text-[#222936] transition-colors hover:text-[#087fea]"
                >
                    <FiBell size={16} />
                    {notificationCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-1.5 min-h-[6px] min-w-[6px] items-center justify-center rounded-full bg-[#168bf3] px-1 text-[8px] font-bold text-white">
                            {notificationCount > 9 ? '9+' : notificationCount}
                        </span>
                    )}
                </button>

                <button
                    type="button"
                    aria-label="Abrir perfil"
                    onClick={onProfileClick}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#087fea] text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
                >
                    {initials}
                </button>
            </div>
        </header>
    );
}

export function StatCard({ label, value, change, positive = true }) {
    return (
        <div className="rounded-[11px] border border-[#e0e6ed] bg-white px-[14px] py-[13px]">
            <p className="text-[10px] font-medium text-[#6e819b]">{label}</p>
            <p className="mt-1 font-display text-[21px] font-bold leading-6 text-[#172033]">{value}</p>
            <p className={`mt-1 text-[9px] font-semibold ${positive ? 'text-[#16bd63]' : 'text-[#e95555]'}`}>
                <span className="mr-1">{positive ? '↑' : '↓'}</span>
                {change}
            </p>
        </div>
    );
}

export default HeaderUser;