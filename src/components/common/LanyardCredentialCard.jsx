import React from 'react';
import { Camera, Loader2, RotateCw } from 'lucide-react';

/**
 * LanyardCredentialCard
 * Escarapela física colgante con lazo textil en Azul Institucional (#0F2342),
 * mosquetón metálico, troquelado rectangular y datos reales de la API.
 */
export default function LanyardCredentialCard({
  nombre = '',
  email = '',
  telefono = '',
  rol = 'ADMINISTRADOR',
  fotoUrl = null,
  photoError = false,
  onPhotoError = () => {},
  uploadingPhoto = false,
  onPhotoClick = () => {},
  isFlipped = false,
  onFlip = null,
  additionalData = null,
}) {
  const userInitials = nombre
    ? nombre
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : 'EH';

  const hasPhoto = Boolean(fotoUrl && !photoError);

  return (
    <div className="w-full max-w-[380px] mx-auto flex flex-col items-center select-none [perspective:1200px]">
      {/* 1. Lazo Superior (Cinta Textil Azul Institucional + Mosquetón Metálico) */}
      <div className="flex flex-col items-center -mb-2 z-20 pointer-events-none">
        {/* Cinta textil: width 36px, height 64px, gradiente azul institucional + textura de tejido + EVENT HIVE vertical */}
        <div
          className="relative w-[36px] h-[64px] shadow-md flex items-center justify-center overflow-hidden border-t-2 border-[#1E3A8A]"
          style={{
            background: 'linear-gradient(180deg, #09162B 0%, #0F2342 100%)',
          }}
        >
          {/* Textura sutil de tejido textil */}
          <div
            className="absolute inset-0 opacity-25 pointer-events-none"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 2px, transparent 2px, transparent 4px)',
            }}
          />
          {/* Costuras laterales */}
          <div className="absolute inset-y-0 left-1 w-[1px] bg-white/20" />
          <div className="absolute inset-y-0 right-1 w-[1px] bg-white/20" />
          {/* Marca EVENT HIVE impresa verticalmente en #F5B800 */}
          <span className="[writing-mode:vertical-lr] rotate-180 font-mono text-[8px] font-black tracking-[0.25em] text-[#F5B800] z-10 leading-none">
            EVENT HIVE
          </span>
        </div>

        {/* Hebilla metálica minimalista (#64748B) */}
        <div className="w-7 h-2.5 bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 border border-[#64748B] rounded-[1px] shadow-2xs -mt-0.5 z-10" />

        {/* Mosquetón / Gancho que conecta al troquelado superior */}
        <div className="w-3.5 h-4 border-2 border-[#64748B] rounded-xs -mt-1.5 z-10 bg-transparent" />
      </div>

      {/* 2. Cuerpo de la Escarapela Física (#FFFFFF, borde 1px solid #E2E8F0, border-radius: 4px, sombra suave) */}
      <div
        className={`relative w-full rounded-[4px] border border-[#E2E8F0] bg-[#FFFFFF] shadow-[0_20px_40px_rgba(15,35,66,0.06)] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] [transform-style:preserve-3d] ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        {/* CARA FRONTAL */}
        <div className="w-full p-6 sm:p-7 flex flex-col justify-between [backface-visibility:hidden] min-h-[500px]">
          <div>
            {/* Troquelado rectangular superior de la tarjeta de acreditación */}
            <div className="w-14 h-2 rounded-[2px] bg-[#E2E8F0] border border-[#CBD5E1] mx-auto shadow-inner mb-6" />

            {/* Cabecera interna de la escarapela */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 mb-6">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#64748B] font-semibold">
                EVENTHIVE · ACREDITACIÓN
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#F5B800]" />
                <span className="font-mono text-[9px] uppercase tracking-wider text-[#0F2342] font-bold">
                  ACTIVO
                </span>
              </span>
            </div>

            {/* Fotografía de Acreditación a color natural */}
            <div className="w-32 h-32 mx-auto mb-6 bg-[#0F2342] border border-[#E2E8F0] overflow-hidden relative group rounded-[2px] flex items-center justify-center shadow-inner">
              {hasPhoto ? (
                <img
                  src={fotoUrl}
                  alt={nombre}
                  className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                  onError={onPhotoError}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#0F2342] text-[#FFFFFF] p-2">
                  <span className="font-mono text-[10px] tracking-widest uppercase text-[#F5B800]">
                    {rol}
                  </span>
                  <span className="font-display font-black text-2xl mt-1 text-white">
                    {userInitials}
                  </span>
                </div>
              )}

              {uploadingPhoto && (
                <div className="absolute inset-0 bg-[#0F2342]/85 flex items-center justify-center text-white font-mono text-[10px] uppercase font-bold">
                  <Loader2 size={18} className="animate-spin mr-1 text-[#F5B800]" />
                  <span>Subiendo...</span>
                </div>
              )}

              <button
                type="button"
                onClick={onPhotoClick}
                disabled={uploadingPhoto}
                title="Cambiar fotografía de perfil"
                className="absolute inset-0 bg-[#0F2342]/80 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-[2px] cursor-pointer disabled:opacity-50"
              >
                <Camera size={16} />
                <span className="text-[9px] font-mono uppercase mt-1 tracking-wider">Cambiar</span>
              </button>
            </div>

            {/* Datos Reales de la API */}
            <div className="text-center space-y-1.5 px-2">
              <h2 className="font-display font-black text-xl text-[#0F2342] uppercase tracking-tight leading-tight">
                {nombre || 'Usuario'}
              </h2>
              <p className="font-mono text-xs text-[#64748B] truncate">
                {email || 'sin-correo@eventhive.com'}
              </p>
              <p className="font-mono text-xs text-[#0F2342] font-semibold pt-0.5">
                {telefono || 'Teléfono no registrado'}
              </p>

              {/* Rol en tipografía monoespaciada con punto amarillo #F5B800 */}
              <div className="inline-flex items-center gap-1.5 pt-3">
                <span className="w-2 h-2 rounded-full bg-[#F5B800] shrink-0" />
                <span className="font-mono text-xs font-bold text-[#0F2342] tracking-wider uppercase">
                  {rol}
                </span>
              </div>
            </div>
          </div>

          {/* Pie de la Escarapela */}
          <div className="mt-6 pt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
            <span className="font-mono text-[10px] tracking-wider text-[#64748B]">
              CREDENCIAL OFICIAL
            </span>
            {onFlip && (
              <button
                type="button"
                onClick={onFlip}
                className="font-mono text-[11px] font-semibold text-[#0F2342] hover:text-[#B45309] transition-colors flex items-center gap-1.5 cursor-pointer py-1"
              >
                <span>Detalles</span>
                <RotateCw size={12} />
              </button>
            )}
          </div>
        </div>

        {/* CARA TRASERA (Si se activa el volteo) */}
        {onFlip && (
          <div className="absolute inset-0 w-full h-full p-6 sm:p-7 flex flex-col justify-between [backface-visibility:hidden] [transform:rotateY(180deg)] bg-[#FFFFFF] rounded-[4px]">
            <div>
              <div className="w-14 h-2 rounded-[2px] bg-[#E2E8F0] border border-[#CBD5E1] mx-auto shadow-inner mb-6" />

              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 mb-6">
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#64748B] font-semibold">
                  EXPEDIENTE TÉCNICO
                </span>
                <span className="w-2 h-2 rounded-full bg-[#F5B800]" />
              </div>

              <div className="space-y-3 border-b border-[#E2E8F0] pb-5 text-xs font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-[#64748B]">CORREO</span>
                  <span className="text-[#0F2342] font-semibold truncate max-w-[180px]">{email}</span>
                </div>
                <div className="flex justify-between items-center border-t border-[#F1F5F9] pt-2">
                  <span className="text-[#64748B]">TELÉFONO</span>
                  <span className="text-[#0F2342] font-semibold">{telefono || 'No registrado'}</span>
                </div>
                <div className="flex justify-between items-center border-t border-[#F1F5F9] pt-2">
                  <span className="text-[#64748B]">ESTADO</span>
                  <span className="text-[#15803D] font-bold">ACTIVO</span>
                </div>
                <div className="flex justify-between items-center border-t border-[#F1F5F9] pt-2">
                  <span className="text-[#64748B]">ROL DEL SISTEMA</span>
                  <span className="text-[#0F2342] font-bold">{rol}</span>
                </div>
                {additionalData}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
              <span className="font-mono text-[10px] tracking-wider text-[#64748B]">
                EXPEDIENTE VERIFICADO
              </span>
              <button
                type="button"
                onClick={onFlip}
                className="font-mono text-[11px] font-semibold text-[#0F2342] hover:text-[#B45309] transition-colors flex items-center gap-1.5 cursor-pointer py-1"
              >
                <span>Ver Frente</span>
                <RotateCw size={12} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
