import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { session } from '../services/session.js';
import { organizationService } from '../services/organizerService.js';
import { showLoginAlert } from '../utils/alertUtils.js';

export default function FavoriteButton({
  initialActive = false,
  eventId = null,
  onToggle = null,
  className = '',
}) {
  const [active, setActive] = useState(initialActive);
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setActive(initialActive);
  }, [initialActive]);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const user = session.getUser();
    if (!user) {
      showLoginAlert({
        title: 'Inicia sesión',
        text: 'Inicia sesión para poder guardar eventos en tus favoritos.',
        navigate,
      });
      return;
    }

    if (isUpdating) return;

    const nextState = !active;
    setActive(nextState);
    if (onToggle) onToggle(nextState);

    if (eventId) {
      setIsUpdating(true);
      try {
        if (nextState) {
          await organizationService.agregarDeseo(eventId);
        } else {
          await organizationService.eliminarDeseo(eventId);
        }
      } catch (err) {
        console.warn('No se pudo sincronizar favoritos con el servidor:', err);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? 'Quitar de favoritos' : 'Guardar en favoritos'}
      onClick={handleClick}
      className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center
        backdrop-blur-sm transition-transform active:scale-90
        ${active ? 'bg-white/95 text-rose-500 shadow-sm' : 'bg-black/40 text-white hover:bg-black/60'} ${className}`}
    >
      {active ? <FaHeart size={14} className="fill-rose-500 text-rose-500" /> : <FaRegHeart size={14} />}
    </button>
  );
}
