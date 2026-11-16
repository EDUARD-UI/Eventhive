import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiStar, FiMessageSquare, FiSend, FiCheckCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { session } from '../../services/session.js';
import { valoracionService } from '../../services/valoracionService.js';
import { showSuccessAlert, showErrorAlert, showLoginAlert } from '../../utils/alertUtils.js';

export default function ModalValoracionOrganizacion({
  isOpen,
  onClose,
  organization,
  organizacionId,
  onValoracionGuardada,
}) {
  const navigate = useNavigate();
  const user = session.getUser();
  const token = session.getToken();
  const isAuthenticated = Boolean(user && token);

  const [calificacion, setCalificacion] = useState(5);
  const [hoverCalificacion, setHoverCalificacion] = useState(0);
  const [comentario, setComentario] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resolver ID numérico exacto de la organización
  const targetOrgId = useMemo(() => {
    const raw =
      organizacionId ??
      organization?.id ??
      organization?.organizacionId ??
      organization?.idOrganizacion;
    const parsed = Number(raw);
    return !isNaN(parsed) && parsed > 0 ? parsed : null;
  }, [organizacionId, organization]);

  const orgName =
    organization?.name ||
    organization?.nombre ||
    organization?.razonSocial ||
    `Organización #${targetOrgId || ''}`;

  const ratingDescriptions = useMemo(
    () => ({
      1: 'Mala experiencia',
      2: 'Regular',
      3: 'Buena experiencia',
      4: 'Muy buena organización',
      5: '¡Excelente producción y experiencia!',
    }),
    []
  );

  const userOrganizationId =
    user?.organizacionId ?? user?.organizationId ?? user?.organizacion?.id ?? user?.organization?.id;
  const representativeId =
    organization?.representante?.id ??
    organization?.representanteId ??
    organization?.representanteLegalId;
  const isOwnOrganization = Boolean(
    user &&
      targetOrgId &&
      ((userOrganizationId && String(userOrganizationId) === String(targetOrgId)) ||
        (user?.id && representativeId && String(user.id) === String(representativeId)))
  );

  useEffect(() => {
    if (isOpen) {
      setComentario('');
      setCalificacion(5);
      setHoverCalificacion(0);
    }
  }, [isOpen]);

  // Manejar envío de valoración
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      showLoginAlert({
        title: 'Inicia sesión para valorar',
        text: 'Debes tener una cuenta en EventHive para enviar tu calificación.',
        navigate,
        redirectUrl: '/iniciosesion',
      });
      return;
    }

    if (!targetOrgId) {
      await showErrorAlert({
        title: 'Identificador no válido',
        text: 'No se pudo identificar la organización a valorar. Por favor recarga la página.',
      });
      return;
    }

    if (isOwnOrganization) {
      await showErrorAlert({
        title: 'Acción no permitida',
        text: 'No es posible valorar tu propia organización.',
      });
      return;
    }

    if (!calificacion || calificacion < 1 || calificacion > 5) {
      await showErrorAlert({
        title: 'Calificación requerida',
        text: 'Por favor selecciona una puntuación entre 1 y 5 estrellas.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await valoracionService.crearValoracion({
        organizacionId: targetOrgId,
        calificacion,
        comentario,
      });

      await showSuccessAlert({
        title: '¡Valoración enviada!',
        text: `Tu calificación para ${orgName} ha sido registrada con éxito.`,
      });

      if (onValoracionGuardada) {
        onValoracionGuardada({
          organizacionId: targetOrgId,
          calificacion,
          comentario,
        });
      }

      onClose();
    } catch (err) {
      console.error('Error al enviar valoración:', err);
      await showErrorAlert({
        title: 'Error al valorar organización',
        text: err.message || 'No fue posible registrar tu valoración. Por favor intenta nuevamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentDisplayRating = hoverCalificacion || calificacion;

  const modalNode = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      {/* Backdrop con blur */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Tarjeta Modal Principal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="valoracion-modal-title"
        className="relative z-10 w-full max-w-lg bg-white dark:bg-[#0B132B] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden my-auto"
      >
        {/* Cabecera del Modal con Gradiente */}
        <div className="bg-gradient-to-r from-[#04499E] via-[#0A2652] to-[#0B132B] p-6 text-white relative">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  <FiCheckCircle size={10} />
                  <span>Valoración de Organización</span>
                </span>
                {targetOrgId && (
                  <span className="text-[10px] font-bold text-white/70 bg-white/10 px-2 py-0.5 rounded-md">
                    ID #{targetOrgId}
                  </span>
                )}
              </div>
              <h2
                id="valoracion-modal-title"
                className="text-lg sm:text-xl font-black uppercase tracking-wide text-white leading-tight"
              >
                {orgName}
              </h2>
              <p className="text-xs text-white/75 font-normal">
                Califica tu experiencia con las producciones y eventos de esta organización.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar modal"
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/90 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* Formulario de Calificación */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Selector de Estrellas Interactivo */}
          <div className="flex flex-col items-center justify-center py-2 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              ¿Cómo calificarías a esta organización?
            </span>

            <div
              className="flex items-center gap-2 text-amber-400 py-1"
              role="radiogroup"
              aria-label="Selecciona de 1 a 5 estrellas"
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setCalificacion(star)}
                  onMouseEnter={() => setHoverCalificacion(star)}
                  onMouseLeave={() => setHoverCalificacion(0)}
                  className="p-1.5 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                  title={`${star} estrella${star > 1 ? 's' : ''}`}
                >
                  <FiStar
                    size={32}
                    className={`transition-colors duration-150 ${
                      star <= currentDisplayRating
                        ? 'fill-amber-400 text-amber-400 drop-shadow-md'
                        : 'text-slate-300 dark:text-slate-700'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Texto descriptivo de la puntuación */}
            <div className="mt-2 text-xs font-extrabold text-amber-600 dark:text-amber-400">
              {ratingDescriptions[currentDisplayRating] || 'Selecciona una puntuación'}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5">
              {currentDisplayRating} de 5 estrellas
            </span>
          </div>

          {/* Campo de Comentario */}
          <div className="space-y-1.5">
            <label
              htmlFor="comentario-valoracion"
              className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200"
            >
              <span className="flex items-center gap-1.5">
                <FiMessageSquare size={13} className="text-amber-500" />
                <span>Comentario u opinión</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                {comentario.length}/500 caracteres
              </span>
            </label>
            <textarea
              id="comentario-valoracion"
              rows={4}
              maxLength={500}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Cuéntanos qué tal fue la puntualidad, logística, atención y experiencia general en sus eventos..."
              className="w-full text-xs font-medium px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Indicador de Organización */}
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 text-[11px] text-amber-900 dark:text-amber-300 flex items-center justify-between">
            <span className="font-semibold">Destino de la valoración:</span>
            <span className="font-bold">
              {orgName} (ID: {targetOrgId || 'N/A'})
            </span>
          </div>

          {/* Botones de Acción */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !calificacion}
              className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-60 flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <FiSend size={13} />
                  <span>Enviar Valoración</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : modalNode;
}
