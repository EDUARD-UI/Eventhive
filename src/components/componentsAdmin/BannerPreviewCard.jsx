import React, { useState } from 'react';
import { Tag, Sparkles, Check, Copy, ArrowRight, Eye, Smartphone, Monitor } from 'lucide-react';

export default function BannerPreviewCard({
  codigo = 'PROMO2026',
  tipo = 'Porcentaje',
  valor = '20%',
  bannerTexto = '¡Descuento especial por tiempo limitado en Event Hive!',
  bannerColor = 'from-[#087fea] via-blue-600 to-indigo-700',
  expira = '31 Dic 2026',
}) {
  const [copied, setCopied] = useState(false);
  const [deviceMode, setDeviceMode] = useState('desktop');

  const handleCopy = () => {
    navigator.clipboard?.writeText(codigo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
            <Eye className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <h4 className="font-display text-sm font-bold text-slate-900 leading-tight">
              Previsualización en Tiempo Real
            </h4>
            <p className="text-xs text-slate-500">
              Así se verá destacado en la Home y Checkout de Event Hive
            </p>
          </div>
        </div>

        <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => setDeviceMode('desktop')}
            title="Vista Escritorio"
            className={`p-1.5 rounded-lg transition-all ${
              deviceMode === 'desktop' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Monitor className="w-4 h-4" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={() => setDeviceMode('mobile')}
            title="Vista Móvil"
            className={`p-1.5 rounded-lg transition-all ${
              deviceMode === 'mobile' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          1. Banner Principal de Campaña (Home de la Plataforma)
        </p>
        <div
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${bannerColor} p-5 sm:p-6 text-white shadow-md transition-all duration-300 ${
            deviceMode === 'mobile' ? 'max-w-[340px] mx-auto text-center' : 'w-full'
          }`}
        >
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />

          <div className={`relative z-10 flex flex-col ${deviceMode === 'mobile' ? 'items-center' : 'sm:flex-row sm:items-center justify-between'} gap-4`}>
            <div className="max-w-md">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold text-amber-300 mb-2">
                <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
                <span>PROMOCIÓN EXCLUSIVA</span>
              </div>
              <h5 className="font-display text-lg sm:text-xl font-extrabold leading-tight">
                {bannerTexto || '¡Aprovecha descuentos en tu próxima experiencia cultural!'}
              </h5>
              <p className="text-xs text-white/80 mt-1">
                Válido hasta el <span className="font-semibold text-white">{expira}</span> en toda Cartagena.
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row items-center gap-2">
              <div className="inline-flex items-center gap-2 bg-slate-900/60 backdrop-blur-md border border-white/20 px-3.5 py-2 rounded-xl font-mono text-xs font-bold text-white shadow-inner">
                <Tag className="w-3.5 h-3.5 text-amber-300" strokeWidth={1.75} />
                <span>{codigo || 'CUPON'}</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="hover:text-amber-300 transition-colors ml-1"
                  title="Copiar código"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="px-3.5 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs shadow-md hover:bg-amber-300 transition-all inline-flex items-center gap-1.5 cursor-pointer">
                <span>Canjear {valor}</span>
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          2. Ticket de Descuento en Checkout de Boletas
        </p>
        <div className="p-3.5 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
              <Tag className="w-4 h-4" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                Cupón aplicado: <span className="font-mono text-emerald-700 uppercase">{codigo}</span>
              </p>
              <p className="text-[11px] text-slate-500">
                Descuento del {valor} sobre el subtotal de las entradas seleccionadas.
              </p>
            </div>
          </div>
          <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg shrink-0">
            -{valor}
          </span>
        </div>
      </div>
    </div>
  );
}
