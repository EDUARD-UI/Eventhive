import React, { useState } from 'react';
import {
  FiArrowLeft,
  FiCalendar,
  FiCheck,
  FiClock,
  FiImage,
  FiMapPin,
  FiPlus,
  FiTrash2,
  FiUpload,
  FiUsers,
} from 'react-icons/fi';

const steps = [
  'Información básica',
  'Ubicación',
  'Entradas',
  'Imagen y portada',
  'Revisión y publicar',
];

function Stepper({ currentStep }) {
  return (
    <div className="flex items-center justify-between pb-6 border-b border-amber-100">
      {steps.map((label, index) => {
        const number = index + 1;
        const completed = number <= currentStep;
        const isCurrent = number === currentStep;

        return (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex items-center gap-2">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black transition-all shadow-xs ${
                  completed
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-amber-500/20'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {number < currentStep ? <FiCheck size={14} className="stroke-[3]" /> : number}
              </span>
              <span
                className={`hidden xl:inline text-xs uppercase tracking-wider truncate font-black ${
                  isCurrent ? 'text-[#0B1B3D]' : 'text-slate-400 font-semibold'
                }`}
              >
                {label}
              </span>
            </div>
            {number < steps.length && (
              <span
                className={`mx-2 sm:mx-3 h-[2px] w-full rounded-full transition-all ${
                  number < currentStep ? 'bg-amber-400' : 'bg-slate-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Field({ label, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-800">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  'w-full rounded-2xl border border-amber-200 bg-[#FAF8F5] px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 shadow-2xs';

function BasicInfo({ form, update }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-black text-[#0B1B3D]">
          Información Básica del Evento
        </h3>
        <p className="text-xs text-slate-600 mt-0.5 font-medium">
          Ingresa el título, temática y fechas clave para la cartelera cultural en Cartagena.
        </p>
      </div>

      <Field label="Nombre del Evento">
        <input
          className={inputClass}
          value={form.title}
          onChange={(event) => update('title', event.target.value)}
          placeholder="Ej: Festival Cartagena Jazz 2026"
        />
      </Field>

      <Field label="Descripción">
        <textarea
          className={`${inputClass} h-[95px] resize-none leading-relaxed`}
          value={form.description}
          onChange={(event) => update('description', event.target.value)}
          placeholder="Describe la experiencia cultural, artistas invitados y recomendaciones para los asistentes."
        />
      </Field>

      <Field label="Categoría">
        <select
          className={inputClass}
          value={form.category}
          onChange={(event) => update('category', event.target.value)}
        >
          <option>Música</option>
          <option>Gastronómico</option>
          <option>Deportivo</option>
          <option>Entretenimiento</option>
          <option>Académico</option>
          <option>Arte y Cultura</option>
        </select>
      </Field>

      <div>
        <p className="mb-2 text-xs font-black uppercase tracking-wider text-slate-800">Fechas y Horarios</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Fecha de inicio">
            <div className="relative">
              <input
                type="date"
                className={inputClass}
                value={form.startDate}
                onChange={(event) => update('startDate', event.target.value)}
              />
              <FiCalendar
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-amber-600"
                size={14}
              />
            </div>
          </Field>
          <Field label="Hora de inicio">
            <div className="relative">
              <input
                type="time"
                className={inputClass}
                value={form.startTime}
                onChange={(event) => update('startTime', event.target.value)}
              />
              <FiClock
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-amber-600"
                size={14}
              />
            </div>
          </Field>
          <Field label="Fecha de finalización">
            <input
              type="date"
              className={inputClass}
              value={form.endDate}
              onChange={(event) => update('endDate', event.target.value)}
            />
          </Field>
          <Field label="Hora de finalización">
            <input
              type="time"
              className={inputClass}
              value={form.endTime}
              onChange={(event) => update('endTime', event.target.value)}
            />
          </Field>
        </div>
      </div>
    </div>
  );
}

function LocationStep({ form, update }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-black text-[#0B1B3D]">
          Ubicación y Sede
        </h3>
        <p className="text-xs text-slate-600 mt-0.5 font-medium">
          Señala la plaza, baluarte, auditorio o recinto en Cartagena de Indias.
        </p>
      </div>

      <Field label="Nombre del Lugar o Recinto">
        <input
          className={inputClass}
          value={form.place}
          onChange={(event) => update('place', event.target.value)}
          placeholder="Ej: Plaza de la Aduana, Baluarte de Santa Catalina..."
        />
      </Field>

      <Field label="Dirección exacta">
        <input
          className={inputClass}
          value={form.address}
          onChange={(event) => update('address', event.target.value)}
          placeholder="Ej: Centro Histórico, Cra. 4 #32-10"
        />
      </Field>

      <div>
        <p className="mb-2 text-xs font-black uppercase tracking-wider text-slate-800">Punto Georreferenciado</p>
        <div className="relative flex h-[190px] items-center justify-center overflow-hidden rounded-2xl border-2 border-amber-200 bg-[#FAF8F5] shadow-inner">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-lg animate-bounce">
            <FiMapPin size={24} />
          </div>
          <span className="absolute bottom-3 bg-white/95 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold text-slate-800 shadow-md border border-amber-200">
            {form.place || 'Cartagena de Indias, Bolívar'}
          </span>
        </div>
      </div>
    </div>
  );
}

function TicketsStep({ tickets, setTickets }) {
  const updateTicket = (index, key, value) =>
    setTickets((current) =>
      current.map((ticket, ticketIndex) =>
        ticketIndex === index ? { ...ticket, [key]: value } : ticket
      )
    );

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-black text-[#0B1B3D]">
          Localidades y Entradas
        </h3>
        <p className="text-xs text-slate-600 mt-0.5 font-medium">
          Configura los tipos de boleto, precios y disponibilidad de cupos.
        </p>
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl border-2 border-amber-200/90 overflow-hidden divide-y divide-amber-100 bg-white shadow-xs">
          {tickets.map((ticket, index) => (
            <div
              key={index}
              className="grid grid-cols-[1fr_120px_100px_40px] items-center gap-3 px-4 py-3 hover:bg-amber-50/30 transition-colors"
            >
              <div>
                <span className="text-[10px] text-amber-800 block uppercase font-black">
                  Localidad
                </span>
                <input
                  value={ticket.name}
                  onChange={(event) => updateTicket(index, 'name', event.target.value)}
                  className="font-bold text-xs text-[#0B1B3D] outline-none bg-transparent w-full"
                  placeholder="Nombre de entrada"
                />
              </div>

              <div>
                <span className="text-[10px] text-amber-800 block uppercase font-black">
                  Precio COP
                </span>
                <input
                  value={ticket.price}
                  onChange={(event) => updateTicket(index, 'price', event.target.value)}
                  className="w-full rounded-xl border border-amber-200 px-2 py-1 text-center text-xs font-black outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-400"
                  placeholder="$0"
                />
              </div>

              <div>
                <span className="text-[10px] text-amber-800 block uppercase font-black">
                  Cupo / Aforo
                </span>
                <input
                  value={ticket.capacity}
                  onChange={(event) => updateTicket(index, 'capacity', event.target.value)}
                  className="w-full rounded-xl border border-amber-200 px-2 py-1 text-center text-xs font-black outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-400"
                  placeholder="100"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  aria-label={`Eliminar entrada ${ticket.name}`}
                  onClick={() =>
                    setTickets((current) =>
                      current.filter((_, ticketIndex) => ticketIndex !== index)
                    )
                  }
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <FiTrash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() =>
            setTickets((current) => [
              ...current,
              { name: 'Nueva localidad', price: '$50.000', capacity: '150' },
            ])
          }
          className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-700 hover:text-amber-800 pt-1 cursor-pointer"
        >
          <FiPlus size={14} /> + Agregar otra localidad
        </button>
      </div>
    </div>
  );
}

function PromotionStep({ form, update }) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-black text-[#0B1B3D]">
          Imagen y Portada Promocional
        </h3>
        <p className="text-xs text-slate-600 mt-0.5 font-medium">
          Sube una foto atractiva de alta resolución que destaque en el Home de EventHive.
        </p>
      </div>

      <label className="flex h-[190px] w-full cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-amber-300 bg-[#FAF8F5] p-6 text-center hover:border-amber-500 hover:bg-amber-50/40 transition-all">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2 text-xl shadow-inner">
          <FiUpload size={22} />
        </div>
        <span className="text-xs font-black uppercase tracking-wider text-[#0B1B3D]">
          {form.fileName || 'Arrastra tu archivo aquí o haz clic para explorar'}
        </span>
        <span className="text-[11px] text-slate-500 mt-1 font-medium">
          Formatos sugeridos: JPG, PNG, WEBP (Hasta 5MB, mínimo 1200x800 px)
        </span>
        <span className="mt-3 rounded-xl border border-amber-300 bg-white px-4 py-2 text-xs font-black uppercase tracking-wider text-amber-950 shadow-xs hover:bg-amber-50">
          Seleccionar imagen
        </span>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(event) => update('fileName', event.target.files?.[0]?.name || '')}
        />
      </label>
    </div>
  );
}

function ReviewStep({ form, tickets }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-black text-[#0B1B3D]">
          Revisión Final y Publicación
        </h3>
        <p className="text-xs text-slate-600 mt-0.5 font-medium">
          Comprueba que todos los datos sean correctos antes de enviar a cartelera.
        </p>
      </div>

      <div className="rounded-3xl border-2 border-amber-200/90 bg-[#FAF8F5] p-5 space-y-2.5 text-xs text-slate-700 font-semibold">
        <p className="text-base font-black text-[#0B1B3D]">
          {form.title || 'Festival Cartagena Jazz 2026'}
        </p>
        <p className="flex items-center gap-2">
          <FiCalendar className="text-amber-600" /> {form.startDate || '23 de agosto 2026'},{' '}
          {form.startTime || '7:00 PM'}
        </p>
        <p className="flex items-center gap-2">
          <FiMapPin className="text-rose-500" />{' '}
          {form.place || 'Plaza de la Aduana, Cartagena'}
        </p>
        <p className="flex items-center gap-2">
          <FiUsers className="text-amber-700" /> {tickets.length} tipos de entrada configurados
        </p>
        <p className="flex items-center gap-2">
          <FiImage className="text-emerald-700" />{' '}
          {form.fileName ? `Imagen: ${form.fileName}` : 'Portada predeterminada asignada'}
        </p>
      </div>

      <Field label="Estado inicial al guardar">
        <select className={inputClass}>
          <option>Publicado (Activo en cartelera)</option>
          <option>Borrador (Guardar sin publicar)</option>
        </select>
      </Field>
    </div>
  );
}

export default function CreateEventWizard({ onBack, onSave }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Música',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    place: '',
    address: '',
    fileName: '',
  });
  const [tickets, setTickets] = useState([
    { name: 'General', price: '$85.000', capacity: '300' },
    { name: 'VIP Muralla', price: '$180.000', capacity: '100' },
  ]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const next = () => (currentStep < 5 ? setCurrentStep((step) => step + 1) : onSave());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-md inline-block mb-1">
            ⬡ CREACIÓN DE EVENTO
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#0B1B3D] tracking-tight">
            Publicar Nueva Experiencia
          </h2>
          <p className="mt-1 text-xs text-slate-600 font-medium">
            Completa los 5 pasos para integrar tu experiencia en la cartelera de EventHive Cartagena.
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-2xl border-2 border-amber-200/90 bg-white px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-800 hover:bg-amber-50 transition-colors shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <FiArrowLeft size={14} /> Regresar a mis eventos
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        {/* Formulario Asistido */}
        <section className="flex min-h-[540px] flex-col rounded-3xl border-2 border-amber-200/90 bg-white p-6 sm:p-8 shadow-sm">
          <Stepper currentStep={currentStep} />

          <div className="mt-6 flex-1">
            {currentStep === 1 && <BasicInfo form={form} update={update} />}
            {currentStep === 2 && <LocationStep form={form} update={update} />}
            {currentStep === 3 && <TicketsStep tickets={tickets} setTickets={setTickets} />}
            {currentStep === 4 && <PromotionStep form={form} update={update} />}
            {currentStep === 5 && <ReviewStep form={form} tickets={tickets} />}
          </div>

          <div className="mt-8 pt-5 border-t border-amber-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => (currentStep === 1 ? onBack() : setCurrentStep((s) => s - 1))}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {currentStep === 1 ? 'Cancelar' : 'Atrás'}
            </button>

            <button
              type="button"
              onClick={next}
              className="rounded-2xl px-7 py-3 text-xs font-black uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 shadow-md shadow-amber-500/25 transition-all active:scale-95 cursor-pointer"
            >
              {currentStep === 5 ? 'Publicar Experiencia' : 'Siguiente Paso →'}
            </button>
          </div>
        </section>

        {/* Aside con Consejos */}
        <aside className="rounded-3xl border-2 border-amber-200/90 bg-white p-6 shadow-sm h-fit space-y-4">
          <div className="flex items-center gap-2 border-b border-amber-100 pb-3">
            <span className="text-amber-500 font-black text-sm">⬡</span>
            <h4 className="text-xs font-black uppercase tracking-wider text-[#0B1B3D]">
              Guía de creacion de eventos
            </h4>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Los eventos con descripciones detalladas y fotos de alta calidad tienen un 64% más de reservas en Cartagena.
          </p>

          <div className="space-y-3 pt-2">
            {[
              { num: '1', text: 'Define el nombre y horario' },
              { num: '2', text: 'Indica la plaza o recinto exacto' },
              { num: '3', text: 'Crea las localidades y precios' },
              { num: '4', text: 'Sube una portada llamativa' },
              { num: '5', text: 'Revisa y publica en cartelera' },
            ].map((st) => (
              <div key={st.num} className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-100 font-black text-[10px] text-amber-950 border border-amber-300">
                  {st.num}
                </span>
                <span>{st.text}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
