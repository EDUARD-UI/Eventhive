import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  FiArrowLeft,
  FiLock,
  FiShield,
  FiCheckCircle,
  FiCreditCard,
  FiCalendar,
  FiMapPin,
  FiPlus,
  FiMinus,
  FiUser,
  FiMail,
  FiCheck,
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import AppLogo from '../components/common/AppLogo.jsx';
import { organizerService } from '../services/organizerService.js';
import { getEventById } from '../services/eventService.js';
import { session } from '../services/session.js';
import { formatPrice } from '../utils/formatters.js';

export default function PasarelaPagoPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const currentUser = session.getUser();

  // Estado del evento y selección
  const [event, setEvent] = useState(location.state?.event || null);
  const [selectedLocalidad, setSelectedLocalidad] = useState(location.state?.localidad || null);
  const [cantidad, setCantidad] = useState(
    Math.min(5, Math.max(1, Number(location.state?.cantidad) || 1))
  );
  const [loading, setLoading] = useState(!location.state?.event && Boolean(id));

  // Método de pago: 'tarjeta' | 'pse' | 'nequi'
  const [metodoPago, setMetodoPago] = useState('tarjeta');

  // Datos del formulario de pago (Tarjeta simulada)
  const [cardForm, setCardForm] = useState({
    numero: '4532 8920 1420 5678',
    titular: (currentUser?.nombre || currentUser?.name || 'JUAN CARLOS PEREZ').toUpperCase(),
    expiracion: '08/28',
    cvv: '842',
  });

  // Datos del comprador
  const [buyerForm, setBuyerForm] = useState({
    nombre: currentUser?.nombre || currentUser?.name || '',
    email: currentUser?.email || '',
    documento: '1047492810',
  });

  // Estado de procesamiento y éxito
  const [procesando, setProcesando] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderReference, setOrderReference] = useState('');

  // Cargar evento si se ingresa directamente por URL (/pago/:id)
  useEffect(() => {
    if (!event && id) {
      setLoading(true);
      getEventById(id)
        .then((data) => {
          if (data) {
            setEvent(data);
            if (data.localidades && data.localidades.length > 0) {
              setSelectedLocalidad(data.localidades[0]);
            }
          }
        })
        .catch((err) => {
          console.warn('Error al cargar datos del evento para pago:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (event && !selectedLocalidad && event.localidades?.length > 0) {
      setSelectedLocalidad(event.localidades[0]);
    }
  }, [id, event, selectedLocalidad]);

  // Manejo de número de tarjeta con espaciado
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardForm((prev) => ({ ...prev, numero: formatted }));
  };

  // Manejo de fecha de vencimiento
  const handleExpiryChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2, 4)}`;
    }
    setCardForm((prev) => ({ ...prev, expiracion: raw }));
  };

  const precioUnitario = Number(selectedLocalidad?.precio || event?.price || 0);
  const total = precioUnitario * cantidad;

  // Confirmar y procesar la compra simulada
  const handlePagar = async (e) => {
    if (e) e.preventDefault();

    if (!buyerForm.nombre.trim() || !buyerForm.email.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Datos requeridos',
        text: 'Por favor ingresa el nombre y correo del titular.',
        confirmButtonColor: '#0B132B',
      });
      return;
    }

    if (metodoPago === 'tarjeta' && (!cardForm.numero || !cardForm.cvv)) {
      Swal.fire({
        icon: 'warning',
        title: 'Tarjeta requerida',
        text: 'Completa los datos de la tarjeta simulada.',
        confirmButtonColor: '#0B132B',
      });
      return;
    }

    setProcesando(true);
    const generatedRef = `EVH-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    try {
      const idempotencyKey = `PAY-SIM-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const payload = {
        idempotencyKey,
        items: [
          {
            localidadId:
              selectedLocalidad?.id && typeof selectedLocalidad.id === 'number'
                ? selectedLocalidad.id
                : undefined,
            cantidad: Number(cantidad),
          },
        ],
        eventoId: Number(event?.id || id),
        localidadId:
          selectedLocalidad?.id && typeof selectedLocalidad.id === 'number'
            ? selectedLocalidad.id
            : undefined,
        cantidad: Number(cantidad),
      };

      await organizerService.crearCompra(payload);
      setOrderReference(generatedRef);
      setIsSuccess(true);
    } catch (err) {
      console.error('Error al procesar compra:', err);
      // Si el backend responde error por datos simulados o timeout, mostrar alerta
      Swal.fire({
        icon: 'error',
        title: 'No se pudo completar el pago',
        text:
          err.message ||
          'Ocurrió un error al contactar el servicio de pagos. Por favor verifica tus datos e intenta nuevamente.',
        confirmButtonColor: '#0B132B',
      });
    } finally {
      setProcesando(false);
    }
  };

  // Estado de carga inicial
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 text-slate-800">
        <div className="w-10 h-10 border-3 border-slate-300 border-t-slate-900 rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-600">Preparando pasarela de pago segura...</p>
      </div>
    );
  }

  // Estado si no se encontró el evento
  if (!event && !loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 text-slate-800">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Evento no disponible</h2>
          <p className="text-xs text-slate-600 mb-6 leading-relaxed">
            No se encontraron los datos del evento seleccionado para iniciar el proceso de compra.
          </p>
          <Link
            to="/buscar"
            className="inline-flex items-center justify-center w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Explorar otros eventos
          </Link>
        </div>
      </div>
    );
  }

  // Pantalla de Confirmación de Pago Exitoso (Minimalista, sin gradientes)
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
        {/* Cabecera minimalista */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <AppLogo className="h-7 w-fit" textClassName="text-slate-900" hiveClassName="text-amber-500" showImage={false} />
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <FiShield className="text-emerald-600" size={15} />
            <span>Pago Verificado</span>
          </div>
        </header>

        {/* Contenido de confirmación */}
        <main className="flex-1 max-w-xl w-full mx-auto p-6 sm:py-12 flex flex-col justify-center">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3.5 border border-emerald-200">
                <FiCheck size={28} />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 mb-1">
                Transacción Aprobada
              </span>
              <h1 className="text-2xl font-bold text-slate-950 tracking-tight">¡Pago Confirmado!</h1>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Hemos recibido tu compra satisfactoriamente. Tus entradas con código QR oficial ya están disponibles en tu cuenta.
              </p>
            </div>

            {/* Recibo minimalista */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Referencia de orden</span>
                <span className="font-mono font-bold text-slate-900">{orderReference}</span>
              </div>
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Evento</span>
                <span className="font-bold text-slate-900 text-right truncate max-w-[220px]">{event.title}</span>
              </div>
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Localidad</span>
                <span className="font-semibold text-slate-800">{selectedLocalidad?.nombre || 'General'}</span>
              </div>
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Boletas compradas</span>
                <span className="font-bold text-slate-900">{cantidad} entrada(s)</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-900 font-bold">Total abonado</span>
                <span className="font-extrabold text-base text-slate-950">{formatPrice(total)} COP</span>
              </div>
            </div>

            {/* Acciones */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => navigate('/perfil?tab=entradas', { state: { activeTab: 'entradas' } })}
                className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Ver mis boletos con código QR
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Ir a la página principal
              </button>
            </div>
          </div>
        </main>

        <footer className="py-4 text-center text-[11px] text-slate-400 border-t border-slate-200 bg-white">
          Eventhive Cartagena · Pasarela de pago segura
        </footer>
      </div>
    );
  }

  // Interfaz Principal de Pasarela de Pago (Estilo minimalista puro, sin gradientes)
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* 1. Encabezado minimalista */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            to={event?.id ? `/eventos/${event.id}` : '/buscar'}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <FiArrowLeft size={16} />
            <span className="hidden sm:inline">Volver al evento</span>
            <span className="sm:hidden">Volver</span>
          </Link>

          <Link to="/" className="flex items-center">
            <AppLogo className="h-7 w-fit" textClassName="text-slate-900" hiveClassName="text-amber-500" showImage={false} />
          </Link>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <FiLock className="text-slate-700" size={14} />
            <span className="hidden sm:inline">Pago 100% Seguro</span>
          </div>
        </div>
      </header>

      {/* 2. Cuerpo del Checkout: Layout 2 Columnas minimalista */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
            Finalizar Compra
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Completa los datos de pago para confirmar tu reserva oficial.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Columna Izquierda: Formulario de Pago Minimalista (7 columnas) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Sección 1: Datos del Comprador */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <FiUser size={14} />
                <span>1. Información del Asistente</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    value={buyerForm.nombre}
                    onChange={(e) => setBuyerForm((prev) => ({ ...prev, nombre: e.target.value }))}
                    placeholder="Tu nombre y apellidos"
                    className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-slate-900 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Correo electrónico *
                  </label>
                  <input
                    type="email"
                    value={buyerForm.email}
                    onChange={(e) => setBuyerForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="correo@ejemplo.com"
                    className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-slate-900 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Documento de Identidad *
                  </label>
                  <input
                    type="text"
                    value={buyerForm.documento}
                    onChange={(e) => setBuyerForm((prev) => ({ ...prev, documento: e.target.value }))}
                    placeholder="Número de cédula o ID"
                    className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-slate-900 transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Sección 2: Método de Pago */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <FiCreditCard size={14} />
                <span>2. Método de Pago</span>
              </h2>

              {/* Selector de métodos (plano, sin gradientes) */}
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setMetodoPago('tarjeta')}
                  className={`py-3 px-3 rounded-xl border text-center transition-colors cursor-pointer ${
                    metodoPago === 'tarjeta'
                      ? 'border-slate-900 bg-slate-900 text-white font-bold'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 font-semibold'
                  }`}
                >
                  <span className="block text-xs">Tarjeta</span>
                  <span className="block text-[10px] opacity-75 font-normal">Crédito/Débito</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMetodoPago('pse')}
                  className={`py-3 px-3 rounded-xl border text-center transition-colors cursor-pointer ${
                    metodoPago === 'pse'
                      ? 'border-slate-900 bg-slate-900 text-white font-bold'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 font-semibold'
                  }`}
                >
                  <span className="block text-xs">PSE</span>
                  <span className="block text-[10px] opacity-75 font-normal">Cuenta bancaria</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMetodoPago('nequi')}
                  className={`py-3 px-3 rounded-xl border text-center transition-colors cursor-pointer ${
                    metodoPago === 'nequi'
                      ? 'border-slate-900 bg-slate-900 text-white font-bold'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 font-semibold'
                  }`}
                >
                  <span className="block text-xs">Nequi</span>
                  <span className="block text-[10px] opacity-75 font-normal">Billetera digital</span>
                </button>
              </div>

              {/* Formulario de Tarjeta Minimalista */}
              {metodoPago === 'tarjeta' && (
                <div className="space-y-4 pt-2">
                  {/* Tarjeta gráfica plana y minimalista (sin gradientes) */}
                  <div className="bg-[#0B132B] text-white rounded-xl p-5 border border-slate-800 font-mono space-y-4 shadow-2xs">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="tracking-widest uppercase font-sans text-[10px] font-bold">Tarjeta de Prueba</span>
                      <span className="text-amber-400 font-bold">EVENTHIVE PAY</span>
                    </div>

                    <div className="text-base sm:text-lg font-bold tracking-widest text-slate-100">
                      {cardForm.numero || '•••• •••• •••• ••••'}
                    </div>

                    <div className="flex justify-between items-end text-[11px] text-slate-300">
                      <div>
                        <span className="block text-[9px] text-slate-400 uppercase font-sans">Titular</span>
                        <span className="truncate max-w-[160px] block">{cardForm.titular || 'CLIENTE'}</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[9px] text-slate-400 uppercase font-sans">Vence</span>
                        <span>{cardForm.expiracion || 'MM/AA'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Campos de entrada */}
                  <div className="space-y-3.5 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Número de Tarjeta *
                      </label>
                      <input
                        type="text"
                        value={cardForm.numero}
                        onChange={handleCardNumberChange}
                        placeholder="4532 8920 1420 5678"
                        maxLength={19}
                        className="w-full font-mono text-xs sm:text-sm font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-slate-900 transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Nombre en la Tarjeta *
                      </label>
                      <input
                        type="text"
                        value={cardForm.titular}
                        onChange={(e) => setCardForm((prev) => ({ ...prev, titular: e.target.value.toUpperCase() }))}
                        placeholder="NOMBRE TAL CUAL APARECE EN LA TARJETA"
                        className="w-full uppercase text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-slate-900 transition-colors"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Vencimiento (MM/AA) *
                        </label>
                        <input
                          type="text"
                          value={cardForm.expiracion}
                          onChange={handleExpiryChange}
                          placeholder="08/28"
                          maxLength={5}
                          className="w-full font-mono text-xs text-center font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-slate-900 transition-colors"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Código CVC / CVV *
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
                          className="w-full font-mono text-xs text-center font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-slate-900 transition-colors"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {metodoPago === 'pse' && (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-600 space-y-2">
                  <p className="font-semibold text-slate-900">Transferencia Bancaria PSE</p>
                  <p>
                    En el entorno de pruebas, el débito se simula instantáneamente sin necesidad de redirigir a la entidad bancaria.
                  </p>
                </div>
              )}

              {metodoPago === 'nequi' && (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-600 space-y-2">
                  <p className="font-semibold text-slate-900">Billetera Nequi</p>
                  <p>
                    Recibirás una notificación simulada de confirmación al presionar el botón de pago.
                  </p>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handlePagar}
                  disabled={procesando}
                  className="w-full py-4 px-6 rounded-xl bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  {procesando ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Procesando pago seguro...</span>
                    </>
                  ) : (
                    <span>Pagar {formatPrice(total)} COP</span>
                  )}
                </button>

                <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 mt-3">
                  <span className="flex items-center gap-1">
                    <FiShield size={12} className="text-emerald-600" />
                    <span>Cifrado SSL 256-bit</span>
                  </span>
                  <span>·</span>
                  <span>Sin comisiones ocultas</span>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Resumen de Compra Minimalista (5 columnas) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Resumen del Pedido
              </h2>

              {/* Evento básico */}
              <div className="flex gap-3.5 pb-4 border-b border-slate-100">
                {event.photo ? (
                  <img
                    src={event.photo}
                    alt={event.title}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0 font-bold text-xs">
                    EVH
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-slate-900 leading-snug truncate">
                    {event.title}
                  </h3>
                  <div className="mt-1 space-y-0.5 text-xs text-slate-500 font-medium">
                    {(event.date || event.fecha) && (
                      <p className="flex items-center gap-1.5 truncate">
                        <FiCalendar size={12} className="text-slate-400 shrink-0" />
                        <span>{event.date || event.fecha}</span>
                      </p>
                    )}
                    {event.location && (
                      <p className="flex items-center gap-1.5 truncate">
                        <FiMapPin size={12} className="text-slate-400 shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Selector de Localidad si hay múltiples */}
              {event.localidades && event.localidades.length > 0 && (
                <div className="space-y-2 pb-4 border-b border-slate-100 text-xs">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Tipo de Localidad
                  </label>
                  <select
                    value={selectedLocalidad?.id || ''}
                    onChange={(e) => {
                      const found = event.localidades.find(
                        (l) => String(l.id) === String(e.target.value)
                      );
                      if (found) setSelectedLocalidad(found);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 outline-none focus:border-slate-900 transition-colors cursor-pointer"
                  >
                    {event.localidades.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.nombre} — {formatPrice(loc.precio)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Selector de Cantidad */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 text-xs">
                <div>
                  <span className="font-bold text-slate-800 block">Cantidad de Boletas</span>
                  <span className="text-[10px] text-slate-400">Máximo 5 por orden</span>
                </div>

                <div className="flex items-center gap-2 border border-slate-200 rounded-xl p-1 bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setCantidad((q) => Math.max(1, q - 1))}
                    disabled={cantidad <= 1}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <FiMinus size={12} />
                  </button>
                  <span className="w-6 text-center font-bold text-xs text-slate-900">
                    {cantidad}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCantidad((q) => Math.min(5, q + 1))}
                    disabled={cantidad >= 5}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <FiPlus size={12} />
                  </button>
                </div>
              </div>

              {/* Desglose de precios */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Precio por entrada</span>
                  <span className="font-medium text-slate-800">{formatPrice(precioUnitario)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Cantidad</span>
                  <span className="font-medium text-slate-800">{cantidad}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Cargo por servicio e impuestos</span>
                  <span className="font-medium text-emerald-600">Incluido ($0)</span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="font-bold text-slate-900 text-sm">Total a Pagar</span>
                  <span className="font-extrabold text-lg text-slate-950">
                    {formatPrice(total)} COP
                  </span>
                </div>
              </div>

              {/* Nota de garantía de emisión */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 leading-relaxed">
                Tus entradas se emitirán inmediatamente después del pago y estarán disponibles con su código QR en tu cuenta de usuario.
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 3. Pie de página minimalista */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4">
          <p>© 2026 Eventhive Cartagena · Pasarela de pago segura y minimalista</p>
        </div>
      </footer>
    </div>
  );
}
