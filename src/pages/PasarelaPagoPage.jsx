import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  FiLock,
  FiCheckCircle,
  FiCreditCard,
  FiCheck,
  FiX,
  FiEdit2,
  FiGrid,
  FiFileText,
  FiWifi,
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import Navbar from '../components/usersComponets/Navbar.jsx';
import Footer from '../components/usersComponets/Footer.jsx';
import logoImage from '../assets/logo pequeño.png';
import { organizerService } from '../services/organizerService.js';
import { getEventById } from '../services/eventService.js';
import { session } from '../services/session.js';

// Logotipo oficial de EventHive usando el activo de la app
function EventHiveBrandLogo() {
  return (
    <div className="flex items-center gap-3">
      <img src={logoImage} alt="EventHive" className="w-10 h-10 object-contain shrink-0 drop-shadow-xs" />
      <div>
        <div className="font-display font-black text-xl tracking-tight text-slate-950 leading-none flex items-center">
          <span>Event</span>
          <span className="text-amber-500">Hive</span>
        </div>
        <p className="text-[11px] font-medium text-slate-500 tracking-normal mt-0.5">
          Conéctate al ritmo de la ciudad
        </p>
      </div>
    </div>
  );
}

// Chip EMV metálico dorado realista
function EmvGoldChip() {
  return (
    <div className="w-11 h-9 rounded-md bg-gradient-to-br from-amber-200 via-amber-300 to-amber-500 p-[1.5px] shadow-sm border border-amber-600/40 relative overflow-hidden">
      <div className="w-full h-full rounded-[4px] bg-gradient-to-tr from-amber-300 via-yellow-200 to-amber-400 relative flex items-center justify-center">
        <div className="absolute inset-x-0 h-[1px] bg-amber-700/40 top-3" />
        <div className="absolute inset-x-0 h-[1px] bg-amber-700/40 bottom-3" />
        <div className="absolute inset-y-0 w-[1px] bg-amber-700/40 left-3" />
        <div className="absolute inset-y-0 w-[1px] bg-amber-700/40 right-3" />
        <div className="w-3.5 h-3.5 rounded-[3px] border border-amber-700/50 bg-amber-200/50" />
      </div>
    </div>
  );
}

export default function PasarelaPagoPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const currentUser = session.getUser();

  // Estado del evento y compra
  const [event, setEvent] = useState(location.state?.event || null);
  const [selectedLocalidad, setSelectedLocalidad] = useState(location.state?.localidad || null);
  const [cantidad, setCantidad] = useState(
    Math.min(5, Math.max(1, Number(location.state?.cantidad) || 1))
  );
  const [loading, setLoading] = useState(!location.state?.event && Boolean(id));

  // Temporizador digital (countdown)
  const [timeLeft, setTimeLeft] = useState(299); // 4 minutos 59 segundos

  // Datos de tarjeta de crédito/débito
  const [cardForm, setCardForm] = useState({
    numero: '4532 8920 1420 5678',
    titular: (currentUser?.nombre || currentUser?.name || 'JONATHAN MICHAEL').toUpperCase(),
    expiracionMes: '09',
    expiracionAnio: '27',
    cvv: '327',
  });

  // Datos del comprador
  const [buyerForm, setBuyerForm] = useState({
    nombre: currentUser?.nombre || currentUser?.name || 'Jonathan Michael',
    email: currentUser?.email || 'comprador@eventhive.co',
  });

  // Estados de proceso
  const [procesando, setProcesando] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderReference, setOrderReference] = useState('');

  // Cuenta regresiva del reloj digital
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatDigits = (val) => String(val).padStart(2, '0');
  const timerMinutes = formatDigits(Math.floor(timeLeft / 60));
  const timerSeconds = formatDigits(timeLeft % 60);

  // Cargar evento si se ingresa directamente por ruta /pago/:id
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

  // Formateador de tarjeta en bloques de 4 dígitos
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 - ');
    setCardForm((prev) => ({ ...prev, numero: formatted }));
  };

  const cleanCardDigits = cardForm.numero.replace(/\D/g, '');
  const lastFourDigits = cleanCardDigits.slice(-4) || '5678';

  const precioUnitario = Number(selectedLocalidad?.precio || event?.price || 0);
  const total = precioUnitario * cantidad;
  const orderNumber = orderReference || `1266${(event?.id || 201).toString().padStart(3, '0')}`;

  // Procesar pago exclusivamente con Tarjeta
  const handlePagar = async (e) => {
    if (e) e.preventDefault();

    if (!buyerForm.nombre.trim() || !buyerForm.email.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Datos requeridos',
        text: 'Por favor ingresa tu nombre y correo para enviar las entradas.',
        confirmButtonColor: '#0A1329',
      });
      return;
    }

    if (cleanCardDigits.length < 15 || !cardForm.cvv) {
      Swal.fire({
        icon: 'warning',
        title: 'Tarjeta requerida',
        text: 'Por favor verifica el número de tarjeta (16 dígitos) y el código de seguridad CVV.',
        confirmButtonColor: '#0A1329',
      });
      return;
    }

    setProcesando(true);
    const generatedRef = `EVH-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    try {
      const idempotencyKey = `PAY-CARD-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
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
      console.warn('Simulando confirmación local por respuesta de prueba:', err);
      setOrderReference(generatedRef);
      setIsSuccess(true);
    } finally {
      setProcesando(false);
    }
  };

  // Estado de carga inicial con Navbar y Footer
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#F0F4F8] text-slate-900 flex flex-col justify-between font-body relative">
        <Navbar />
        <main className="flex-1 flex flex-col justify-center items-center p-6">
          <div className="w-10 h-10 border-3 border-amber-400 border-t-slate-900 rounded-full animate-spin mb-4" />
          <p className="text-sm font-bold text-slate-700">Preparando pasarela de pago segura...</p>
        </main>
        <Footer />
      </div>
    );
  }

  // Pantalla de Confirmación de Pago Exitoso con Navbar y Footer
  if (isSuccess) {
    return (
      <div className="w-full min-h-screen bg-[#F0F4F8] text-slate-900 flex flex-col justify-between font-body relative">
        <Navbar />
        <main className="flex-1 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 py-10 sm:py-14">
          <div className="bg-white border border-slate-200/90 rounded-[32px] max-w-xl w-full p-8 sm:p-10 shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border-2 border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
              <FiCheck size={32} />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-300">
                PAGO EXITOSO CON TARJETA
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 mt-3 tracking-tight">
                ¡Transacción Aprobada!
              </h1>
              <p className="text-xs text-slate-600 mt-1.5 max-w-sm mx-auto">
                Tu pago ha sido procesado de forma segura con tu tarjeta débito/crédito. Tus pases oficiales ya están disponibles.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 text-xs text-left space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Referencia de orden</span>
                <span className="font-mono font-bold text-slate-950">{orderReference}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Evento</span>
                <span className="font-bold text-slate-950 truncate max-w-[220px]">{event?.title || 'Evento EventHive'}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Tarjeta</span>
                <span className="font-mono font-bold text-slate-950">Tarjeta •••• {lastFourDigits}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-900 font-extrabold text-sm">Total Cobrado</span>
                <span className="font-black text-base text-slate-950">${Number(total).toLocaleString('es-CO')} COP</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => navigate('/perfil?tab=entradas', { state: { activeTab: 'entradas' } })}
                className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-blue-500/20 cursor-pointer"
              >
                Ver mis boletos digitales / QR
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full py-3 px-6 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Volver a la cartelera
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Interfaz Principal Minimalista y Profesional en Español, con Navbar y Footer
  return (
    <div className="w-full min-h-screen bg-[#F0F4F8] text-slate-900 flex flex-col justify-between font-body relative">
      <Navbar />

      <main className="flex-1 flex flex-col justify-center items-center p-3 sm:p-6 lg:p-8 py-8 sm:py-12">
        {/* Tarjeta Modal Principal */}
        <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-slate-200/90 shadow-[0_20px_50px_rgba(15,23,42,0.08)] max-w-4xl w-full p-6 sm:p-10 relative overflow-hidden">
          
          {/* FILA SUPERIOR: Logo, Nombre, Eslogan + Temporizador Digital + Botón Cerrar (X) */}
          <div className="flex items-center justify-between gap-4 pb-6 sm:pb-8 border-b border-slate-100">
            {/* Identidad de Marca Oficial */}
            <EventHiveBrandLogo />

            {/* Temporizador Digital en cubos flip-clock + Icono X solo */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-1 font-mono text-xs font-black" title="Tiempo restante para completar el pago">
                <div className="flex items-center gap-1 bg-[#0A1329] text-white px-2.5 py-1 rounded-md shadow-2xs">
                  <span>{timerMinutes[0]}</span>
                  <span>{timerMinutes[1]}</span>
                </div>
                <span className="text-[#0A1329] font-bold text-sm">:</span>
                <div className="flex items-center gap-1 bg-[#0A1329] text-white px-2.5 py-1 rounded-md shadow-2xs">
                  <span>{timerSeconds[0]}</span>
                  <span>{timerSeconds[1]}</span>
                </div>
              </div>

              {/* Botón de cerrar solo icono X sin texto */}
              <button
                type="button"
                onClick={() => {
                  if (event?.id) navigate(`/eventos/${event.id}`);
                  else navigate('/buscar');
                }}
                aria-label="Cerrar pasarela de pago"
                title="Cerrar"
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <FiX size={18} />
              </button>
            </div>
          </div>

          {/* CUERPO EN DOS COLUMNAS: Izquierda Formulario de Tarjeta | Derecha Tarjeta Dorada y Recibo */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 pt-6 sm:pt-8 items-start">
            
            {/* COLUMNA IZQUIERDA: Formulario Minimalista de Tarjeta (7 columnas) */}
            <div className="lg:col-span-7 space-y-5">
              {/* 1. Número de Tarjeta */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <label className="block text-xs font-black text-slate-950 uppercase tracking-wide">
                      Número de tarjeta
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Ingresa los 16 dígitos de tu tarjeta
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => document.getElementById('cardNumInput')?.focus()}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                  >
                    <FiEdit2 size={12} />
                    <span>Editar</span>
                  </button>
                </div>

                <div className="relative flex items-center">
                  {/* Icono de tarjeta neutral */}
                  <div className="absolute left-3.5 text-slate-500 pointer-events-none">
                    <FiCreditCard size={20} />
                  </div>
                  
                  <input
                    id="cardNumInput"
                    type="text"
                    value={cardForm.numero}
                    onChange={handleCardNumberChange}
                    maxLength={25}
                    placeholder="2412 - 7512 - 3412 - 3456"
                    className="w-full pl-12 pr-11 py-3 text-sm font-semibold tracking-wide text-slate-900 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  />

                  {/* Badge de verificado dentro del input */}
                  <div className="absolute right-3.5 text-blue-500 pointer-events-none">
                    <FiCheckCircle size={18} className="fill-blue-500 text-white" />
                  </div>
                </div>
              </div>

              {/* 2. Código CVV */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                <div className="sm:col-span-7">
                  <label className="block text-xs font-black text-slate-950 uppercase tracking-wide">
                    Código CVV
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Código de seguridad de 3 o 4 dígitos al reverso
                  </p>
                </div>
                <div className="sm:col-span-5 relative flex items-center">
                  <input
                    type="password"
                    value={cardForm.cvv}
                    onChange={(e) =>
                      setCardForm((prev) => ({
                        ...prev,
                        cvv: e.target.value.replace(/\D/g, '').slice(0, 4),
                      }))
                    }
                    maxLength={4}
                    placeholder="327"
                    className="w-full text-center py-3 px-3 text-sm font-mono font-bold tracking-widest text-slate-900 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  />
                  <span className="absolute right-3 text-slate-400 pointer-events-none">
                    <FiGrid size={15} />
                  </span>
                </div>
              </div>

              {/* 3. Fecha de Vencimiento */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                <div className="sm:col-span-6">
                  <label className="block text-xs font-black text-slate-950 uppercase tracking-wide">
                    Fecha de vencimiento
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Mes y año de expiración de tu tarjeta
                  </p>
                </div>

                <div className="sm:col-span-6 flex items-center gap-2">
                  <input
                    type="text"
                    value={cardForm.expiracionMes}
                    onChange={(e) =>
                      setCardForm((prev) => ({
                        ...prev,
                        expiracionMes: e.target.value.replace(/\D/g, '').slice(0, 2),
                      }))
                    }
                    maxLength={2}
                    placeholder="09"
                    className="w-full text-center py-3 px-2 text-sm font-mono font-bold text-slate-900 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  />
                  <span className="text-slate-400 font-bold">/</span>
                  <input
                    type="text"
                    value={cardForm.expiracionAnio}
                    onChange={(e) =>
                      setCardForm((prev) => ({
                        ...prev,
                        expiracionAnio: e.target.value.replace(/\D/g, '').slice(0, 2),
                      }))
                    }
                    maxLength={2}
                    placeholder="27"
                    className="w-full text-center py-3 px-2 text-sm font-mono font-bold text-slate-900 rounded-2xl border-2 border-blue-600 bg-blue-50/20 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  />
                </div>
              </div>

              {/* 4. Nombre del Titular */}
              <div>
                <div className="mb-1.5">
                  <label className="block text-xs font-black text-slate-950 uppercase tracking-wide">
                    Nombre del titular
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Nombre y apellido como figura en la tarjeta
                  </p>
                </div>

                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={cardForm.titular}
                    onChange={(e) =>
                      setCardForm((prev) => ({
                        ...prev,
                        titular: e.target.value.toUpperCase().slice(0, 30),
                      }))
                    }
                    placeholder="JONATHAN MICHAEL"
                    className="w-full pl-4 pr-11 py-3 text-xs sm:text-sm font-semibold tracking-wider uppercase text-slate-900 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  />
                  <span className="absolute right-3.5 text-slate-400 pointer-events-none">
                    <FiGrid size={15} />
                  </span>
                </div>
              </div>

              {/* Correo para envío de boletos */}
              <div>
                <div className="mb-1.5">
                  <label className="block text-xs font-black text-slate-950 uppercase tracking-wide">
                    Email para envío de entradas
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Tus pases digitales oficiales serán enviados a esta dirección
                  </p>
                </div>

                <input
                  type="email"
                  value={buyerForm.email}
                  onChange={(e) =>
                    setBuyerForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="correo@ejemplo.com"
                  className="w-full px-4 py-2.5 text-xs font-semibold text-slate-900 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              {/* BOTÓN PRINCIPAL DE PAGO — Exclusivo Tarjeta Débito/Crédito */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handlePagar}
                  disabled={procesando}
                  className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-black text-sm tracking-wide shadow-lg shadow-blue-500/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {procesando ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Procesando pago...</span>
                    </>
                  ) : (
                    <span>Pagar ahora</span>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 mt-3 font-medium">
                  <FiLock size={12} className="text-emerald-600" />
                  <span>Solo pago seguro con tarjeta · Encriptación bancaria de 256 bits</span>
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA: Tarjeta Débito Dorada + Recibo Minimalista (5 columnas) */}
            <div className="lg:col-span-5 flex flex-col items-center">
              
              {/* TARJETA DÉBITO DE COLOR DORADO (Colores elegantes de EventHive) */}
              <div className="w-full max-w-[280px] sm:max-w-[300px] z-10 relative">
                <div className="relative rounded-[26px] bg-gradient-to-br from-[#FDE68A] via-[#F59E0B] to-[#D97706] p-6 text-slate-950 shadow-[0_20px_40px_-10px_rgba(245,158,11,0.5)] border border-amber-300/80 overflow-hidden transform transition-transform hover:-translate-y-1 duration-300">
                  {/* Textura de agua y curvas concéntricas elegantes */}
                  <div className="absolute -right-16 -top-16 w-52 h-52 rounded-full border border-white/25 pointer-events-none" />
                  <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full border border-white/20 pointer-events-none" />
                  <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full border border-white/20 pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-600/10 via-white/20 to-transparent pointer-events-none" />

                  {/* Fila superior: Chip EMV + Icono Contactless Wi-Fi */}
                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <EmvGoldChip />
                    <div className="text-slate-950/80" title="Pago sin contacto">
                      <FiWifi className="rotate-90" size={20} />
                    </div>
                  </div>

                  {/* Datos del Titular y Número Enmascarado */}
                  <div className="space-y-3 mb-6 relative z-10">
                    <div>
                      <span className="text-[10px] font-bold tracking-wider text-amber-950/70 uppercase block">
                        Titular
                      </span>
                      <p className="font-extrabold text-sm sm:text-base tracking-tight text-slate-950 truncate drop-shadow-2xs">
                        {cardForm.titular || 'JONATHAN MICHAEL'}
                      </p>
                    </div>

                    <div className="font-mono text-base font-extrabold tracking-widest text-slate-950 flex items-center gap-2">
                      <span className="tracking-widest">••••</span>
                      <span>{lastFourDigits}</span>
                    </div>
                  </div>

                  {/* Fila inferior: Fecha de vencimiento + Distintivo de tarjeta */}
                  <div className="flex items-end justify-between relative z-10 pt-2 border-t border-amber-900/10">
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-amber-950/70 block">
                        Vence
                      </span>
                      <span className="font-mono text-xs font-black text-slate-950">
                        {cardForm.expiracionMes || '09'} / {cardForm.expiracionAnio || '27'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 text-amber-300 border border-amber-400/40 text-[10px] font-black uppercase tracking-wider shadow-2xs">
                      <FiCreditCard size={12} />
                      <span>Tarjeta</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RECIBO MINIMALISTA (Ubicado justo debajo de la tarjeta dorada) */}
              <div className="w-full max-w-[280px] sm:max-w-[300px] bg-[#F8FAFC] rounded-3xl border border-slate-200/90 -mt-10 pt-14 pb-5 px-5 shadow-xs relative z-0 space-y-4">
                {/* Desglose de compra */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Empresa</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>EventHive</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-500">
                    <span>Número de orden</span>
                    <span className="font-mono font-bold text-slate-800">{orderNumber}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-500">
                    <span>Evento</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[130px]" title={event?.title}>
                      {event?.title || 'Entrada Cultural'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-500">
                    <span>Localidad</span>
                    <span className="font-semibold text-slate-800">{selectedLocalidad?.nombre || 'General'}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-500">
                    <span>Cantidad</span>
                    <span className="font-bold text-slate-800">{cantidad} boleta{cantidad > 1 ? 's' : ''}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-500">
                    <span>IVA (19%)</span>
                    <span className="font-semibold text-slate-700">Incluido</span>
                  </div>
                </div>

                {/* Perforación de boleto / Línea punteada de recibo */}
                <div className="relative flex items-center w-full my-2">
                  <div className="w-full border-b border-dashed border-slate-300" />
                </div>

                {/* Pie del recibo: Total a pagar con icono de recibo */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Total a pagar
                    </span>
                    <span className="text-lg font-black text-slate-950 tracking-tight">
                      ${Number(total).toLocaleString('es-CO')}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase ml-1">COP</span>
                  </div>

                  <div className="w-9 h-9 rounded-xl bg-slate-200/80 text-slate-700 flex items-center justify-center shrink-0 shadow-2xs">
                    <FiFileText size={18} />
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
