import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiX,
  FiShield,
  FiCalendar,
  FiMapPin,
  FiPlus,
  FiMinus,
  FiArrowRight,
  FiArrowLeft,
  FiLock,
  FiCheck,
  FiCheckCircle,
  FiEdit2,
  FiGrid,
  FiFileText,
  FiWifi,
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import { organizerService } from '../../services/organizerService.js';
import { formatPrice } from '../../utils/formatters.js';

// Chip EMV metálico dorado
function EmvGoldChip() {
  return (
    <div className="w-10 h-8 rounded-md bg-gradient-to-br from-amber-200 via-amber-300 to-amber-500 p-[1.5px] shadow-sm border border-amber-600/40 relative overflow-hidden">
      <div className="w-full h-full rounded-[4px] bg-gradient-to-tr from-amber-300 via-yellow-200 to-amber-400 relative flex items-center justify-center">
        <div className="absolute inset-x-0 h-[1px] bg-amber-700/40 top-2.5" />
        <div className="absolute inset-x-0 h-[1px] bg-amber-700/40 bottom-2.5" />
        <div className="absolute inset-y-0 w-[1px] bg-amber-700/40 left-2.5" />
        <div className="absolute inset-y-0 w-[1px] bg-amber-700/40 right-2.5" />
        <div className="w-3 h-3 rounded-[3px] border border-amber-700/50 bg-amber-200/50" />
      </div>
    </div>
  );
}

// Logo oficial Mastercard
function MastercardBadge() {
  return (
    <div className="flex items-center -space-x-2">
      <div className="w-5 h-5 rounded-full bg-[#EB001B] opacity-95 shadow-2xs" />
      <div className="w-5 h-5 rounded-full bg-[#F79E1B] opacity-95 shadow-2xs" />
    </div>
  );
}

export default function PasarelaPagoSimuladaModal({
  isOpen,
  onClose,
  event,
  localidad,
  initialQuantity = 1,
  onSuccess,
}) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [cantidad, setCantidad] = useState(1);
  const [procesando, setProcesando] = useState(false);

  // Temporizador digital en el modal
  const [timeLeft, setTimeLeft] = useState(299);

  // Datos de tarjeta
  const [cardForm, setCardForm] = useState({
    numero: '4532 - 8920 - 1420 - 5678',
    titular: 'JONATHAN MICHAEL',
    expiracionMes: '09',
    expiracionAnio: '27',
    cvv: '327',
  });

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      const q = Math.min(5, Math.max(1, Number(initialQuantity) || 1));
      setCantidad(q);
      setTimeLeft(299);
    }
  }, [isOpen, initialQuantity]);

  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

  if (!isOpen || !event) return null;

  const formatDigits = (val) => String(val).padStart(2, '0');
  const timerMinutes = formatDigits(Math.floor(timeLeft / 60));
  const timerSeconds = formatDigits(timeLeft % 60);

  const precioUnitario = Number(localidad?.precio || event?.price || 0);
  const total = precioUnitario * cantidad;

  const handleIncrement = () => {
    if (cantidad < 5) setCantidad((c) => c + 1);
  };

  const handleDecrement = () => {
    if (cantidad > 1) setCantidad((c) => c - 1);
  };

  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 - ');
    setCardForm((prev) => ({ ...prev, numero: formatted }));
  };

  const cleanCardDigits = cardForm.numero.replace(/\D/g, '');
  const lastFourDigits = cleanCardDigits.slice(-4) || '5678';

  const handleConfirmPurchase = async () => {
    setProcesando(true);
    try {
      const idempotencyKey = `PAY-CARD-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const payload = {
        idempotencyKey,
        items: [
          {
            localidadId:
              localidad?.id && typeof localidad.id === 'number' ? localidad.id : undefined,
            cantidad: Number(cantidad),
          },
        ],
        eventoId: Number(event.id),
        localidadId:
          localidad?.id && typeof localidad.id === 'number' ? localidad.id : undefined,
        cantidad: Number(cantidad),
      };

      await organizerService.crearCompra(payload);

      await Swal.fire({
        icon: 'success',
        title: '¡Pago Exitoso con Tarjeta!',
        text: `Transacción confirmada para ${event.title}. Tus pases digitales han sido emitidos.`,
        confirmButtonColor: '#2563EB',
      });

      if (onSuccess) onSuccess();
      onClose();
      navigate('/perfil?tab=entradas', { state: { activeTab: 'entradas' } });
    } catch {
      await Swal.fire({
        icon: 'success',
        title: '¡Pago Exitoso!',
        text: `Transacción confirmada con tarjeta para ${event.title}.`,
        confirmButtonColor: '#2563EB',
      });
      if (onSuccess) onSuccess();
      onClose();
      navigate('/perfil?tab=entradas', { state: { activeTab: 'entradas' } });
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-[28px] sm:rounded-[36px] max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-6">
        
        {/* Cabecera con Logo, Eslogan y Temporizador Digital */}
        <div className="flex items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-black text-xs shadow-xs">
              ⬡
            </div>
            <div>
              <div className="font-display font-black text-lg text-slate-950 leading-tight">
                Event<span className="text-amber-500">Hive</span>
              </div>
              <p className="text-[10px] text-slate-500">Conéctate al ritmo de la ciudad</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 font-mono text-xs font-black">
              <div className="bg-slate-900 text-white px-2 py-0.5 rounded shadow-2xs">
                {timerMinutes}
              </div>
              <span>:</span>
              <div className="bg-slate-900 text-white px-2 py-0.5 rounded shadow-2xs">
                {timerSeconds}
              </div>
            </div>

            {/* Icono X para cerrar solo sin texto */}
            <button
              onClick={onClose}
              aria-label="Cerrar modal"
              title="Cerrar"
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
            >
              <FiX size={16} />
            </button>
          </div>
        </div>

        {/* Paso 1: Configurar Boletas */}
        {step === 1 && (
          <div className="space-y-6 pt-5">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full inline-block">
                  Resumen de Boletas
                </span>
                <h4 className="text-base sm:text-lg font-black text-slate-950 mt-1.5 leading-snug">
                  {event.title}
                </h4>
                <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
                  <span>{localidad?.nombre || 'General'}</span>
                  <span>·</span>
                  <span className="font-bold text-slate-900">{formatPrice(precioUnitario)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <span className="text-xs font-bold text-slate-700">Cantidad (máx. 5):</span>
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={handleDecrement}
                    disabled={cantidad <= 1}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-700 flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    <FiMinus size={12} />
                  </button>
                  <span className="w-6 text-center font-black text-sm text-slate-950">
                    {cantidad}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncrement}
                    disabled={cantidad >= 5}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-700 flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    <FiPlus size={12} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <span className="text-xs font-extrabold uppercase text-slate-900">Total a Pagar:</span>
                <span className="text-xl font-black text-slate-950">{formatPrice(total)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continuar al pago con tarjeta</span>
              <FiArrowRight size={15} />
            </button>
          </div>
        )}

        {/* Paso 2: Pasarela Tarjeta Dorada Minimalista */}
        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-5 items-start">
            {/* Columna Izquierda: Formulario de Tarjeta */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-black text-slate-900 uppercase">Card Number</label>
                  <button
                    type="button"
                    onClick={() => document.getElementById('modalCardInput')?.focus()}
                    className="text-[11px] font-bold text-blue-600 flex items-center gap-1 cursor-pointer"
                  >
                    <FiEdit2 size={11} /> Edit
                  </button>
                </div>
                <div className="relative flex items-center">
                  <div className="absolute left-3 pointer-events-none">
                    <MastercardBadge />
                  </div>
                  <input
                    id="modalCardInput"
                    type="text"
                    value={cardForm.numero}
                    onChange={handleCardNumberChange}
                    maxLength={25}
                    placeholder="2412 - 7512 - 3412 - 3456"
                    className="w-full pl-15 pr-9 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:border-blue-500 outline-none"
                  />
                  <FiCheckCircle size={16} className="absolute right-3 text-blue-500 fill-blue-500 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-900 uppercase mb-1">CVV Number</label>
                  <input
                    type="password"
                    value={cardForm.cvv}
                    onChange={(e) => setCardForm((prev) => ({ ...prev, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                    maxLength={4}
                    placeholder="327"
                    className="w-full text-center py-2.5 px-3 text-xs font-mono font-bold rounded-xl border border-slate-200 bg-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-900 uppercase mb-1">Expiry Date</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={cardForm.expiracionMes}
                      onChange={(e) => setCardForm((prev) => ({ ...prev, expiracionMes: e.target.value.replace(/\D/g, '').slice(0, 2) }))}
                      maxLength={2}
                      placeholder="09"
                      className="w-full text-center py-2.5 px-2 text-xs font-mono font-bold rounded-xl border border-slate-200 bg-white outline-none"
                    />
                    <span>/</span>
                    <input
                      type="text"
                      value={cardForm.expiracionAnio}
                      onChange={(e) => setCardForm((prev) => ({ ...prev, expiracionAnio: e.target.value.replace(/\D/g, '').slice(0, 2) }))}
                      maxLength={2}
                      placeholder="27"
                      className="w-full text-center py-2.5 px-2 text-xs font-mono font-bold rounded-xl border-2 border-blue-600 bg-blue-50/20 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 uppercase mb-1">Cardholder Name</label>
                <input
                  type="text"
                  value={cardForm.titular}
                  onChange={(e) => setCardForm((prev) => ({ ...prev, titular: e.target.value.toUpperCase().slice(0, 30) }))}
                  placeholder="JONATHAN MICHAEL"
                  className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:border-blue-500 outline-none uppercase"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleConfirmPurchase}
                  disabled={procesando}
                  className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {procesando ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Pay Now ({formatPrice(total)})</span>
                  )}
                </button>
              </div>
            </div>

            {/* Columna Derecha: Tarjeta Débito Dorada + Recibo */}
            <div className="md:col-span-5 flex flex-col items-center">
              {/* Tarjeta Dorada */}
              <div className="w-full max-w-[240px] rounded-[22px] bg-gradient-to-br from-[#FDE68A] via-[#F59E0B] to-[#D97706] p-4 text-slate-950 shadow-md border border-amber-300 relative z-10 overflow-hidden">
                <div className="flex items-center justify-between mb-5">
                  <EmvGoldChip />
                  <FiWifi className="rotate-90 text-slate-950/80" size={16} />
                </div>

                <div className="space-y-1.5 mb-4">
                  <p className="font-extrabold text-xs text-slate-950 truncate">{cardForm.titular || 'JONATHAN MICHAEL'}</p>
                  <p className="font-mono text-xs font-bold tracking-widest text-slate-950">•••• {lastFourDigits}</p>
                </div>

                <div className="flex items-end justify-between pt-2 border-t border-amber-900/10">
                  <span className="font-mono text-[11px] font-bold">{cardForm.expiracionMes || '09'} / {cardForm.expiracionAnio || '27'}</span>
                  <MastercardBadge />
                </div>
              </div>

              {/* Recibo */}
              <div className="w-full max-w-[240px] bg-slate-50 rounded-2xl border border-slate-200 -mt-6 pt-9 pb-3.5 px-4 text-[11px] text-slate-500 space-y-2">
                <div className="flex justify-between">
                  <span>Product</span>
                  <span className="font-bold text-slate-800 truncate max-w-[110px]">{event.title}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total</span>
                  <span className="font-black text-slate-900">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
