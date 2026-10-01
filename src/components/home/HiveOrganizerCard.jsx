import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import ImageWithFallback from '../common/ImageWithFallback.jsx';

export default function HiveOrganizerCard({ org }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/organizaciones/${org.id}`)}
      className="bg-white rounded-2xl border border-amber-200/80 hover:border-amber-400 p-6 flex flex-col justify-between group cursor-pointer relative overflow-hidden transition-all duration-300 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.07)] hover:shadow-[0_18px_35px_-5px_rgba(245,158,11,0.16)] hover:-translate-y-1"
    >
      {/* Badge Top en esquina con contraste accesible e icono de panal ⬡ */}
      <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-1 rounded-bl-xl shadow-xs flex items-center gap-1">
        <span>⬡</span>
        <span>★ Top</span>
      </div>

      <div>
        <div className="flex items-start justify-between mb-4">
          {/* Avatar con marco hexagonal de panal */}
          <div className="relative">
            <div className="w-16 h-16 clip-hexagon bg-gradient-to-b from-amber-400 to-amber-600 p-[2.5px] filter drop-shadow-sm">
              <div className="w-full h-full clip-hexagon bg-amber-50 overflow-hidden">
                <ImageWithFallback
                  src={org.avatar}
                  alt={org.name}
                  showText={false}
                  className="w-full h-full object-cover"
                  imgClassName="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  fallbackClassName="w-full h-full"
                  iconSize={22}
                />
              </div>
            </div>

            {org.verified && (
              <span
                title="Organización Verificada"
                className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-1 rounded-full shadow-md z-10 font-black"
              >
                <FiCheckCircle size={12} strokeWidth={3} />
              </span>
            )}
          </div>

          {/* Rating con fondo ámbar suave y texto de alto contraste (WCAG AA compliant) */}
          <span className="text-[11px] font-black text-amber-950 bg-amber-100/90 border border-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 mr-12 shadow-2xs">
            ★ {org.rating ? Number(org.rating).toFixed(1) : '5.0'}
          </span>
        </div>

        {/* Tag de Categoría accesible con fondo suave */}
        <div className="mb-2">
          <span className="inline-block text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-50 border border-amber-200/90 px-2 py-0.5 rounded-md">
            {org.category || 'Organización'}
          </span>
        </div>

        <h3 className="font-display text-base font-black text-[#0B172C] group-hover:text-amber-700 transition-colors duration-200 mb-2">
          {org.name}
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4 font-normal">
          {org.description || 'Productor de experiencias culturales y entretenimiento en Cartagena.'}
        </p>
      </div>

      <div className="pt-4 border-t border-amber-100 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-600">
          <strong className="text-[#0B172C] font-black">{org.eventsCount || 0}</strong> eventos
        </span>

        <span className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-200">
          Ver perfil <FiArrowRight size={13} />
        </span>
      </div>
    </div>
  );
}
