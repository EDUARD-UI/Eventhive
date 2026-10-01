import { createPortal } from 'react-dom';
import React, { useState } from 'react';
import { X, Tag, Calendar } from 'lucide-react';
import BannerPreviewCard from './BannerPreviewCard.jsx';

const GRADIENTS = [
  { label: 'Azul Heroica', val: 'from-[#087fea] via-blue-600 to-indigo-700' },
  { label: 'Atardecer Caribe', val: 'from-amber-500 via-orange-500 to-rose-500' },
  { label: 'Noche Getsemaní', val: 'from-purple-600 via-violet-600 to-indigo-800' },
  { label: 'Esmeralda Caribeña', val: 'from-emerald-600 via-teal-600 to-cyan-700' },
];

export default function ModalPromocion({ onClose, onSave, promocion }) {
  const isEditing = Boolean(promocion && promocion.id);

  const [codigo, setCodigo] = useState(promocion?.codigo || '');
  const [tipo, setTipo] = useState(promocion?.tipo || 'Porcentaje');
  const [valor, setValor] = useState(
    promocion?.valor ||
      (promocion?.descuento != null ? `${promocion.descuento}%` : '20%')
  );
  const [limite, setLimite] = useState(promocion?.limite || 250);
  const [expira, setExpira] = useState(
    promocion?.expira ||
      (promocion?.fechaFinal ? String(promocion.fechaFinal).split('T')[0] : '31 Dic 2026')
  );
  const [bannerTexto, setBannerTexto] = useState(
    promocion?.bannerTexto ||
      promocion?.descripcion ||
      '¡Aprovecha descuentos en tu próxima experiencia!'
  );
  const [bannerColor, setBannerColor] = useState(
    promocion?.bannerColor || GRADIENTS[0].val
  );
  const [eventoNombre, setEventoNombre] = useState(
    promocion?.eventoTitulo || promocion?.eventoNombre || ''
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!codigo.trim()) return;

    const numericDiscount =
      tipo === 'Porcentaje'
        ? parseInt(String(valor).replace('%', ''), 10) || 0
        : undefined;

    onSave({
      ...(promocion || {}),
      id: promocion?.id || Date.now(),
      codigo: codigo.toUpperCase().trim(),
      tipo,
      valor,
      descuento: numericDiscount,
      usados: promocion?.usados || 0,
      limite: Number(limite) || 100,
      expira,
      fechaFinal: expira,
      activa: promocion?.activa !== undefined ? promocion.activa : true,
      estado: promocion?.estado || 'VIGENTE',
      bannerTexto,
      descripcion: bannerTexto,
      bannerColor,
      eventoTitulo: eventoNombre || promocion?.eventoTitulo || 'Promoción General',
      eventoNombre: eventoNombre || promocion?.eventoNombre || 'Promoción General',
    });
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 sm:p-6 overflow-y-auto no-scrollbar animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto no-scrollbar p-6 shadow-2xl border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Tag className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-900 leading-tight">
                {isEditing ? 'Editar Campaña Promocional' : 'Crear Campaña Promocional'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEditing
                  ? `Modificando promoción ${promocion.codigo || ''}`
                  : 'Configuración con simulación en tiempo real'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Código del Cupón *
                </label>
                <input
                  type="text"
                  required
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                  placeholder="Ej: CARTAGENA20"
                  className="w-full text-xs font-mono uppercase font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#087fea] focus:ring-2 focus:ring-[#087fea]/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#087fea]" />
                  <span>Evento Asociado (Nombre o Título)</span>
                </label>
                <input
                  type="text"
                  value={eventoNombre}
                  onChange={(e) => setEventoNombre(e.target.value)}
                  placeholder="Ej: Festival de Jazz 2026 (o vacío para global)"
                  className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#087fea] focus:ring-2 focus:ring-[#087fea]/10 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Tipo de Beneficio
                  </label>
                  <select
                    value={tipo}
                    onChange={(e) => {
                      setTipo(e.target.value);
                      if (e.target.value === 'Porcentaje' && !valor.includes('%')) {
                        setValor('15%');
                      } else if (e.target.value === 'Fijo' && valor.includes('%')) {
                        setValor('$10.000 COP');
                      }
                    }}
                    className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-[#087fea] transition-all cursor-pointer"
                  >
                    <option value="Porcentaje">Porcentaje (%)</option>
                    <option value="Fijo">Monto Fijo (COP)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Valor Descuento *
                  </label>
                  <input
                    type="text"
                    required
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    placeholder={tipo === 'Porcentaje' ? '20%' : '$15.000 COP'}
                    className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#087fea] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Límite de Canjes *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={limite}
                    onChange={(e) => setLimite(Number(e.target.value))}
                    className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#087fea] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Vigencia hasta
                  </label>
                  <input
                    type="text"
                    required
                    value={expira}
                    onChange={(e) => setExpira(e.target.value)}
                    placeholder="31 Dic 2026"
                    className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#087fea] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Titular del Banner / Descripción
                </label>
                <input
                  type="text"
                  required
                  value={bannerTexto}
                  onChange={(e) => setBannerTexto(e.target.value)}
                  placeholder="Mensaje de impacto que verá el usuario en la plataforma"
                  className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#087fea] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Gradiente del Banner
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {GRADIENTS.map((gp) => (
                    <button
                      key={gp.label}
                      type="button"
                      onClick={() => setBannerColor(gp.val)}
                      className={`p-2 rounded-xl border text-[11px] font-semibold flex items-center gap-2 transition-all ${
                        bannerColor === gp.val
                          ? 'border-[#087fea] bg-blue-50/70 text-[#087fea] ring-2 ring-[#087fea]/20'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-r ${gp.val}`} />
                      <span className="truncate">{gp.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="sticky top-2">
              <BannerPreviewCard
                codigo={codigo || 'CUPON2026'}
                tipo={tipo}
                valor={valor || '20%'}
                bannerTexto={bannerTexto}
                bannerColor={bannerColor}
                expira={expira}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl bg-[#087fea] hover:bg-[#0060cc] text-white text-xs font-bold shadow-md transition-all active:scale-95"
            >
              {isEditing ? 'Guardar Cambios' : 'Publicar Promoción'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
}
