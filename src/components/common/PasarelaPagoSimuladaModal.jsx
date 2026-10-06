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
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import { organizerService } from '../../services/organizerService.js';
import { formatPrice } from '../../utils/formatters.js';

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

  // Datos simulados de tarjeta con valores precargados limpios
  const [cardForm, setCardForm] = useState({
    numero: '4532 8920 1420 5678',
    titular: 'JUAN CARLOS PEREZ',
    expiracion: '08/28',
    cvv: '842',
  });

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      const q = Math.min(5, Math.max(1, Number(initialQuantity) || 1));
      setCantidad(q);
    }
  }, [isOpen, initialQuantity]);

  if (!isOpen || !event) return null;

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
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardForm((prev) => ({ ...prev, numero: formatted }));
  };

  const handleExpiryChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2, 4)}`;
    }
    setCardForm((prev) => ({ ...prev, expiracion: raw }));
  };

  const handleConfirmPurchase = async () => {
    setProcesando(true);
    try {
      const idempotencyKey = `PAY-SIM-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
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

      const result = await Swal.fire({
        icon: 'success',
        title: '¡Pago Exitoso!',
        html: `
          <div style="text-align: left; font-size: 13px; color: #1e293b; line-height: 1.5;">
            <p style="margin-bottom: 6px;">Se confirmó la compra de <strong>${cantidad} boleta(s)</strong> para:</p>
            <p style="font-weight: 800; color: #0B1B3D; font-size: 15px; margin-bottom: 8px;">${event.title}</p>
            <p style="margin-bottom: 4px;"><strong>Localidad:</strong> ${localidad?.nombre || 'General'}</p>
            <p style="margin-bottom: 10px;"><strong>Total Pagado:</strong> ${formatPrice(total)}</p>
            <p style="color: #059669; font-weight: 700; margin-top: 8px;">Tus entradas con código QR oficial ya están activas en tu perfil.</p>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Ver mis boletos',
        cancelButtonText: 'Ir al inicio',
        confirmButtonColor: '#F59E0B',
        cancelButtonColor: '#0B1B3D',
        reverseButtons: true,
        allowOutsideClick: false,
      });

      if (onSuccess) onSuccess();
      onClose();

      if (result.isConfirmed) {
        navigate('/perfil?tab=entradas', { state: { activeTab: 'entradas' } });
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Error al procesar compra simulada:', err);
      Swal.fire({
        icon: 'error',
        title: 'No se pudo completar el pago',
        text:
          err.message ||
          'Ocurrió un error al procesar la compra simulada. Verifica disponibilidad e intenta nuevamente.',
        confirmButtonColor: '#0B1B3D',
      });
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-7 shadow-2xl relative space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={onClose}
          disabled={procesando}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <FiX size={18} />
        </button>

        {/* Encabezado con Indicador de 2 Pasos */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                step === 1
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              Paso 1: Boleto
            </span>
            <span className="text-slate-300">/</span>
            <span
              className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                step === 2
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              Paso 2: Tarjeta
            </span>
          </div>

          <h3 className="text-xl font-black text-[#0B1B3D] tracking-tight">
            {step === 1 ? 'Resumen de Compra de Boletas' : 'Pasarela de Pago Simulada'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {step === 1
              ? 'Verifica los detalles del evento antes de continuar con la transacción.'
              : 'Ingresa los datos de tu tarjeta de demostración para completar la compra.'}
          </p>
        </div>

        {/* PASO 1: TIQUETE DE COMPRA (Ref: Image 3 / Eventhive Ticket Card) */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Div con forma de Tiquete Oficial y muescas circulares laterales */}
            <div className="relative bg-[#FAF8F5] border-2 border-amber-300/90 rounded-3xl p-6 overflow-hidden shadow-xs">
              {/* Muescas laterales de tiquete */}
              <div className="absolute -left-3.5 top-28 w-7 h-7 rounded-full bg-white border-r-2 border-amber-300 pointer-events-none" />
              <div className="absolute -right-3.5 top-28 w-7 h-7 rounded-full bg-white border-l-2 border-amber-300 pointer-events-none" />

              {/* Encabezado del Tiquete con hexágono colmena */}
              <div className="flex items-center justify-between pb-4 border-b border-amber-200">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs">
                    ⬡
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-[#0B1B3D]">
                    TIQUETE OFICIAL EVENTHIVE
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  Preventa
                </span>
              </div>

              {/* Datos del Evento */}
              <div className="pt-4 pb-4 space-y-2">
                <h4 className="text-base sm:text-lg font-black text-slate-950 leading-snug">
                  {event.title}
                </h4>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium">
                  {(event.date || event.fecha) && (
                    <span className="flex items-center gap-1.5">
                      <FiCalendar size={13} className="text-amber-500" />
                      <span>{event.date || event.fecha}</span>
                    </span>
                  )}
                  {event.location && (
                    <span className="flex items-center gap-1.5">
                      <FiMapPin size={13} className="text-amber-500" />
                      <span className="truncate max-w-[200px]">{event.location}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Línea perforada con puntos discontinuos */}
              <div className="border-b-2 border-dashed border-amber-300 my-2" />

              {/* Detalles de la Orden */}
              <div className="pt-3 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-semibold">Localidad seleccionada:</span>
                  <span className="font-extrabold text-[#0B1B3D] text-sm">
                    {localidad?.nombre || 'General'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-semibold">Precio unitario:</span>
                  <span className="font-bold text-slate-800">
                    {formatPrice(precioUnitario)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-slate-600 font-semibold block">Cantidad de boletas:</span>
                    <span className="text-[10px] text-slate-400 font-medium">(Mínimo 1, Máximo 5)</span>
                  </div>
                  {/* Selector interactivo de cantidad (min 1, max 5) */}
                  <div className="flex items-center gap-2 bg-white border border-amber-300 rounded-xl p-1 shadow-2xs">
                    <button
                      type="button"
                      onClick={handleDecrement}
                      disabled={cantidad <= 1}
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-700 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      title="Disminuir boletas"
                    >
                      <FiMinus size={12} />
                    </button>
                    <span className="w-6 text-center font-black text-sm text-[#0B1B3D]">
                      {cantidad}
                    </span>
                    <button
                      type="button"
                      onClick={handleIncrement}
                      disabled={cantidad >= 5}
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-700 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      title="Aumentar boletas"
                    >
                      <FiPlus size={12} />
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-amber-200/80 flex items-center justify-between">
                  <span className="text-sm font-black text-[#0B1B3D] uppercase tracking-wider">
                    Total a Pagar:
                  </span>
                  <span className="text-lg sm:text-xl font-black text-[#0B1B3D]">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Botón de Confirmación Paso 1 */}
            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-4 px-6 rounded-2xl bg-[#0B1B3D] hover:bg-[#122b61] text-amber-300 font-black text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Confirmar detalles y proceder al pago</span>
              <FiArrowRight size={16} />
            </button>
          </div>
        )}

        {/* PASO 2: INTERFAZ CON TARJETA DE CRÉDITO (Ref: Image 2) */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Visualización de la Tarjeta estilo Minimalista Profesional (Ref: Image 2) */}
            <div className="relative w-full aspect-[1.586/1] max-w-[400px] mx-auto rounded-3xl p-6 sm:p-7 text-white shadow-2xl overflow-hidden bg-[#0B1B3D] border border-slate-700/60 flex flex-col justify-between select-none">
              {/* Formas fluidas curvas en color ámbar / dorado colmena (Ref: Image 2) */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-amber-400 via-amber-500 to-amber-600 rounded-bl-[120px] opacity-95 pointer-events-none" />
              <div className="absolute -bottom-10 right-4 w-44 h-44 bg-gradient-to-t from-amber-500 via-amber-400 to-amber-300/80 rounded-full opacity-90 pointer-events-none blur-xs" />
              <div className="absolute -bottom-14 left-10 w-28 h-28 bg-amber-400/30 rounded-full pointer-events-none blur-md" />

              {/* Fila Superior: Marca Bancaria Simulada + Logo Hexagonal Colmena */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-black tracking-widest text-slate-200 uppercase">
                    EVENTHIVE
                  </span>
                  <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">
                    PAY
                  </span>
                </div>

                {/* Hexágono Oficial como marca distintiva de la app dentro de la tarjeta */}
                <div className="flex items-center gap-2">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-6 h-6 text-slate-950 fill-amber-400 drop-shadow-sm"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <polygon
                      points="12,2 21,7.2 21,17.8 12,23 3,17.8 3,7.2"
                      fill="#F59E0B"
                      stroke="#0B1B3D"
                      strokeWidth="1.5"
                    />
                    <polygon
                      points="12,6 17,9.1 17,14.9 12,18 7,14.9 7,9.1"
                      fill="#0B1B3D"
                    />
                  </svg>
                  <span className="text-[10px] font-black text-slate-950 uppercase tracking-widest">
                    CREDIT
                  </span>
                </div>
              </div>

              {/* Chip EMV Metálico + Icono Contactless Wave */}
              <div className="relative z-10 flex items-center gap-3 my-auto">
                <div className="w-11 h-8 rounded-lg bg-gradient-to-br from-amber-200 via-amber-300 to-yellow-600 border border-amber-100 shadow-inner flex items-center justify-center relative overflow-hidden">
                  <div className="w-full h-0.5 bg-amber-700/40 absolute top-2.5" />
                  <div className="w-full h-0.5 bg-amber-700/40 absolute bottom-2.5" />
                  <div className="h-full w-0.5 bg-amber-700/40 absolute left-4" />
                </div>
                <div className="text-slate-300 text-xs font-mono font-bold tracking-widest rotate-90">
                  )))
                </div>
              </div>

              {/* Fila Inferior: Número de Tarjeta, Titular y Vencimiento */}
              <div className="relative z-10 space-y-2">
                <div className="font-mono text-base sm:text-lg font-bold tracking-[0.2em] text-white drop-shadow-sm">
                  {cardForm.numero || '•••• •••• •••• ••••'}
                </div>

                <div className="flex items-end justify-between text-[10px] tracking-wider uppercase font-semibold text-slate-300">
                  <div className="max-w-[180px] truncate">
                    <span className="block text-[8px] text-amber-300/90 font-bold">TITULAR</span>
                    <span className="text-white font-mono">{cardForm.titular || 'CLIENTE'}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-amber-300/90 font-bold">VENCE</span>
                    <span className="text-white font-mono">{cardForm.expiracion || 'MM/AA'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulario Minimalista de Datos de Pago */}
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Número de Tarjeta *
                </label>
                <input
                  type="text"
                  value={cardForm.numero}
                  onChange={handleCardNumberChange}
                  placeholder="4532 8920 1420 5678"
                  maxLength={19}
                  className="w-full font-mono text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Nombre en la Tarjeta *
                </label>
                <input
                  type="text"
                  value={cardForm.titular}
                  onChange={(e) =>
                    setCardForm((prev) => ({
                      ...prev,
                      titular: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="NOMBRE COMO APARECE EN LA TARJETA"
                  className="w-full text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 transition-all uppercase"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Vencimiento (MM/AA) *
                  </label>
                  <input
                    type="text"
                    value={cardForm.expiracion}
                    onChange={handleExpiryChange}
                    placeholder="08/28"
                    maxLength={5}
                    className="w-full font-mono text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 transition-all text-center"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Código de Seguridad (CVV) *
                  </label>
                  <input
                    type="password"
                    value={cardForm.cvv}
                    onChange={(e) =>
                      setCardForm((prev) => ({
                        ...prev,
                        cvv: e.target.value.replace(/\D/g, '').slice(0, 4),
                      }))
                    }
                    placeholder="•••"
                    maxLength={4}
                    className="w-full font-mono text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 transition-all text-center"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Aviso Sutil de Simulación */}
            <div className="flex items-center gap-2 p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-900 text-xs font-medium">
              <FiShield className="text-amber-600 shrink-0" size={16} />
              <span>Transacción en modo simulación: No se debitarán fondos reales.</span>
            </div>

            {/* Botones de Acción Paso 2 */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={procesando}
                className="py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FiArrowLeft size={14} /> Volver
              </button>

              <button
                type="button"
                onClick={handleConfirmPurchase}
                disabled={procesando}
                className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-60"
              >
                {procesando ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Procesando pago...</span>
                  </>
                ) : (
                  <>
                    <FiLock size={15} />
                    <span>Pagar {formatPrice(total)}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
