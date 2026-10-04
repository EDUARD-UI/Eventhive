import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiCheckCircle, FiCalendar, FiUsers, FiUserCheck, FiUserPlus, FiCheck } from 'react-icons/fi';
import ImageWithFallback from './ImageWithFallback.jsx';

/**
 * OrganizationListCard
 * Card vertical estilo Pase/Boleto de Credencial de Organización:
 * - Basado fielmente en el diseño de ticket con muescas circulares laterales y perforaciones dashed.
 * - Cabecera con avatar institucional, razón social y verificación.
 * - Bloque de datos con PASS ID, Representante y Métricas reales (eventos y seguidores).
 * - Talón inferior con código de barras y botones "Seguir" y "Ver perfil".
 */
export default function OrganizationListCard({ org, notchBg = 'bg-[#F8FAFC]' }) {
  if (!org) return null;

  const {
    id,
    name,
    razonSocial,
    representante,
    avatar,
    logo,
    imagen,
    verified,
    estado,
    followers,
    totalSeguidores,
    eventsCount,
    totalEventosCreados,
    category,
  } = org;

  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(followers ?? totalSeguidores ?? 0);

  const title = razonSocial || name || 'Organización Cultural';
  const imgUrl = avatar || logo || imagen || null;
  const isVerified = verified || estado === 'APROBADA' || estado === 'VERIFICADA';
  const eventosCountNum = eventsCount ?? totalEventosCreados ?? 0;
  const ticketFolio = `ORG-${String(id).padStart(8, '0')}`;

  const handleFollowToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFollowing((prev) => {
      const next = !prev;
      setFollowersCount((c) => (next ? c + 1 : Math.max(0, c - 1)));
      return next;
    });
  };

  return (
    <article className="group relative bg-white rounded-3xl border border-slate-200/90 hover:border-slate-400/80 transition-all duration-300 ease-out shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.09)] hover:-translate-y-1 flex flex-col justify-between overflow-hidden">
      
      {/* SECCIÓN SUPERIOR: Logo + Identidad */}
      <div className="p-5 pb-3">
        <div className="flex items-center gap-3.5 mb-3">
          {/* Avatar institucional */}
          <div className="w-14 h-14 shrink-0 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 flex items-center justify-center p-1 relative">
            <ImageWithFallback
              src={imgUrl}
              alt={title}
              className="w-full h-full object-cover rounded-xl"
              showText={false}
              iconSize={22}
            />
          </div>

          {/* Nombre y Verificación */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <Link to={`/organizaciones/${id}`} className="block truncate group-hover:text-amber-600 transition-colors">
                <h3 className="font-extrabold text-slate-950 text-base uppercase tracking-tight truncate leading-snug">
                  {title}
                </h3>
              </Link>
              {isVerified && (
                <FiCheckCircle
                  className="text-amber-500 shrink-0"
                  size={15}
                  title="Organizador Verificado"
                />
              )}
            </div>

            <span className="text-[11px] font-semibold text-slate-500 block truncate mt-0.5">
              {category || 'Productor Cultural Oficial'}
            </span>
          </div>
        </div>

        {/* Representante si existe */}
        {representante && (
          <p className="text-xs text-slate-600 truncate flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100">
            <FiUserCheck className="text-amber-500 shrink-0" size={13} />
            <span className="truncate">Representante: <strong className="font-bold text-slate-800">{representante}</strong></span>
          </p>
        )}
      </div>

      {/* PRIMERA PERFORACIÓN DE BOLETO */}
      <div className="relative flex items-center w-full my-1">
        <div className={`absolute -left-3 w-6 h-6 rounded-full ${notchBg} border-r border-slate-200 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.03)] z-10 pointer-events-none`} />
        <div className="w-full border-b-2 border-dashed border-slate-200 mx-3" />
        <div className={`absolute -right-3 w-6 h-6 rounded-full ${notchBg} border-l border-slate-200 shadow-[inset_2px_0_4px_rgba(0,0,0,0.03)] z-10 pointer-events-none`} />
      </div>

      {/* SECCIÓN INTERMEDIA: Métricas del Pase */}
      <div className="px-5 py-3 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              PASS ID
            </span>
            <span className="font-mono font-black text-slate-800 text-xs">
              {ticketFolio}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              ESTADO
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Activo
            </span>
          </div>
        </div>

        {/* Estadísticas de Eventos y Seguidores */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
            <FiCalendar className="text-amber-500 shrink-0" size={14} />
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-400 block leading-tight">Cartelera</span>
              <span className="font-black text-slate-800 text-xs truncate block">{eventosCountNum} evento{eventosCountNum === 1 ? '' : 's'}</span>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
            <FiUsers className="text-amber-500 shrink-0" size={14} />
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-400 block leading-tight">Comunidad</span>
              <span className="font-black text-slate-800 text-xs truncate block">{followersCount} seguidor{followersCount === 1 ? '' : 'es'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SEGUNDA PERFORACIÓN DE BOLETO */}
      <div className="relative flex items-center w-full my-1">
        <div className={`absolute -left-3 w-6 h-6 rounded-full ${notchBg} border-r border-slate-200 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.03)] z-10 pointer-events-none`} />
        <div className="w-full border-b-2 border-dashed border-slate-200 mx-3" />
        <div className={`absolute -right-3 w-6 h-6 rounded-full ${notchBg} border-l border-slate-200 shadow-[inset_2px_0_4px_rgba(0,0,0,0.03)] z-10 pointer-events-none`} />
      </div>

      {/* SECCIÓN INFERIOR: Código de Barras + Botones */}
      <div className="px-5 pt-3 pb-5 flex flex-col items-center gap-3">
        {/* Código de barras */}
        <div className="w-full flex flex-col items-center">
          <svg viewBox="0 0 160 30" className="w-40 h-7 text-slate-800 fill-current opacity-90">
            <rect x="0" y="0" width="3" height="30" />
            <rect x="6" y="0" width="1.5" height="30" />
            <rect x="11" y="0" width="3.5" height="30" />
            <rect x="17" y="0" width="2" height="30" />
            <rect x="22" y="0" width="4" height="30" />
            <rect x="29" y="0" width="1.5" height="30" />
            <rect x="34" y="0" width="3" height="30" />
            <rect x="40" y="0" width="2" height="30" />
            <rect x="46" y="0" width="4" height="30" />
            <rect x="53" y="0" width="1.5" height="30" />
            <rect x="58" y="0" width="3.5" height="30" />
            <rect x="65" y="0" width="2" height="30" />
            <rect x="70" y="0" width="4" height="30" />
            <rect x="77" y="0" width="1.5" height="30" />
            <rect x="82" y="0" width="3" height="30" />
            <rect x="88" y="0" width="2" height="30" />
            <rect x="93" y="0" width="4" height="30" />
            <rect x="100" y="0" width="1.5" height="30" />
            <rect x="105" y="0" width="3" height="30" />
            <rect x="111" y="0" width="2" height="30" />
            <rect x="116" y="0" width="4" height="30" />
            <rect x="123" y="0" width="1.5" height="30" />
            <rect x="128" y="0" width="3.5" height="30" />
            <rect x="135" y="0" width="2" height="30" />
            <rect x="141" y="0" width="3" height="30" />
            <rect x="147" y="0" width="4" height="30" />
            <rect x="154" y="0" width="2" height="30" />
          </svg>
          <span className="text-[10px] font-mono tracking-widest text-slate-400 mt-1 font-semibold">
            ORG &nbsp; {String(id).padStart(6, '9')} &nbsp; PASS
          </span>
        </div>

        {/* Acciones: Seguir y Ver Perfil */}
        <div className="grid grid-cols-2 gap-2 w-full">
          <button
            type="button"
            onClick={handleFollowToggle}
            className={`py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-95 shadow-xs cursor-pointer ${
              isFollowing
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold'
            }`}
          >
            {isFollowing ? <FiCheck size={13} /> : <FiUserPlus size={13} />}
            <span>{isFollowing ? 'Siguiendo' : 'Seguir'}</span>
          </button>

          <Link
            to={`/organizaciones/${id}`}
            className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-95 border border-slate-200/90 text-center"
          >
            <FiEye size={13} />
            <span>Perfil</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
