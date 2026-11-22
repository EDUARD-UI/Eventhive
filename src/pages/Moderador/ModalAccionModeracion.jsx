import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiAlertTriangle, FiCheck, FiSend, FiFileText } from 'react-icons/fi';

const MOTIVOS_OFICIALES = [
  { value: 'INFORMACION_INCOMPLETA', label: 'Información Incompleta o Insuficiente' },
  { value: 'IMAGEN_NO_PERMITIDA', label: 'Imagen No Permitida o Ausente' },
  { value: 'FALTA_PERMISO_LEGAL', label: 'Falta Permiso Legal o Autorización' },
  { value: 'CATEGORIA_INCORRECTA', label: 'Categoría Incorrecta' },
  { value: 'INCUMPLE_POLITICAS', label: 'Incumple Políticas de la Plataforma' },
  { value: 'FECHA_INVALIDA', label: 'Fecha u Horario Inválido' },
  { value: 'LOCALIDADES_INVALIDAS', label: 'Localidades o Precios Inválidos' },
  { value: 'OTRO', label: 'Otro Requerimiento Técnico' },
];

export default function ModalAccionModeracion({
  evento,
  tipo = 'correccion', // 'correccion' | 'rechazo'
  motivos = [],
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}) {
  const isRechazo = tipo === 'rechazo';

  // Combinar motivos del backend si existen con el mapa oficial
  const opcionesMotivos =
    motivos.length > 0
      ? motivos.map((m) => {
          const match = MOTIVOS_OFICIALES.find((mo) => mo.value === m);
          return match || { value: m, label: m.replace(/_/g, ' ') };
        })
      : MOTIVOS_OFICIALES;

  const [motivoSeleccionado, setMotivoSeleccionado] = useState(
    opcionesMotivos[0]?.value || 'INFORMACION_INCOMPLETA'
  );
  const [observacion, setObservacion] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMotivoSeleccionado(opcionesMotivos[0]?.value || 'INFORMACION_INCOMPLETA');
      setObservacion('');
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen || !evento) return null;

  const eventoTitulo = evento.titulo || evento.nombre || 'Producción de Evento';
  const organizacion =
    evento.organizacionNombre ||
    evento.organizacion?.nombre ||
    evento.organizadorNombre ||
    'Organización Responsable';
  const lugar = evento.lugar || evento.ubicacion || 'Cartagena de Indias';

  const motivoActivoObj = opcionesMotivos.find((m) => m.value === motivoSeleccionado);
  const motivoTexto = motivoActivoObj?.label || motivoSeleccionado;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!motivoSeleccionado) {
      setError('Debes seleccionar un motivo oficial.');
      return;
    }
    if (!observacion.trim()) {
      setError('Por favor redacta la observación técnica para que el organizador pueda subsanar el expediente.');
      return;
    }
    setError('');
    onSubmit({
      motivo: motivoSeleccionado,
      observacion: observacion.trim(),
    });
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
      style={{
        backgroundColor: 'rgba(15, 35, 66, 0.72)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-2xl bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 select-none my-auto max-h-[92vh] flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera Oscura Azul Institucional #0F2342 */}
        <div className="p-5 bg-[#0F2342] text-white flex items-center justify-between border-b border-[#0F2342] shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full ${isRechazo ? 'bg-[#DC2626]' : 'bg-[#F5B800]'}`} />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-300 font-bold">
                {isRechazo ? 'Dictamen de Exclusión' : 'Ticket de Revisión Técnica de Cartelera'}
              </span>
            </div>
            <h3 className="font-display font-black text-xl text-white uppercase tracking-tight">
              {isRechazo ? 'Rechazo de Publicación' : 'Solicitar Ajuste & Corrección'}
            </h3>
            <p className="font-mono text-xs text-slate-300 truncate mt-0.5">
              {eventoTitulo} · <span className="text-[#F5B800]">{organizacion}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer rounded-[2px]"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Cuerpo del Formulario Scrolleable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-xs font-mono text-rose-700 rounded-[2px]">
              {error}
            </div>
          )}

          {/* 1. Selector Visual de Motivos: Grid de 2 Columnas de Tarjetas Seleccionables */}
          <div className="space-y-2.5">
            <label className="block font-mono text-xs uppercase tracking-wider text-[#0F2342] font-bold">
              Seleccionar Criterio / Motivo Oficial *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {opcionesMotivos.map((opcion) => {
                const isSelected = motivoSeleccionado === opcion.value;
                return (
                  <button
                    key={opcion.value}
                    type="button"
                    onClick={() => setMotivoSeleccionado(opcion.value)}
                    className={`p-3 text-left transition-all rounded-[2px] cursor-pointer flex items-center justify-between gap-2 border ${
                      isSelected
                        ? 'border-[#0F2342] border-l-4 border-l-[#F5B800] bg-[#F8F9FA] shadow-xs'
                        : 'border-[#E2E8F0] bg-white hover:border-slate-300'
                    }`}
                  >
                    <span className={`font-mono text-xs ${isSelected ? 'font-bold text-[#0F2342]' : 'text-[#64748B]'}`}>
                      {opcion.label}
                    </span>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F5B800] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Área de Observación Técnica */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="font-mono text-xs uppercase tracking-wider text-[#0F2342] font-bold">
                Instrucciones Técnicas de Subsanación *
              </label>
              <span className="font-mono text-[10px] text-[#64748B]">
                {observacion.length} caracteres
              </span>
            </div>
            <textarea
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              required
              rows={4}
              placeholder="Detalla claramente los elementos que el organizador debe corregir (ej. adjuntar autorización de aforo, ajustar hora de apertura o rectificar precios)..."
              className="w-full p-3 border border-[#E2E8F0] rounded-[2px] font-sans text-sm text-[#0F2342] placeholder-[#94A3B8] focus:border-[#0F2342] outline-none leading-relaxed resize-none"
            />
          </div>

          {/* Footer de Acciones */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-[#E2E8F0] text-[#64748B] hover:text-[#0F2342] font-mono text-xs uppercase tracking-wider font-bold rounded-[2px] cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`inline-flex items-center gap-2 px-6 py-2.5 font-mono text-xs uppercase tracking-wider font-bold rounded-[2px] transition-colors cursor-pointer text-white shadow-xs disabled:opacity-50 ${
                isRechazo
                  ? 'bg-[#DC2626] hover:bg-rose-700'
                  : 'bg-[#0F2342] hover:bg-[#F5B800] hover:text-[#0F2342]'
              }`}
            >
              <FiSend size={13} />
              <span>
                {loading
                  ? 'Emitiendo...'
                  : isRechazo
                  ? 'Confirmar Rechazo'
                  : 'Emitir Requerimiento'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
