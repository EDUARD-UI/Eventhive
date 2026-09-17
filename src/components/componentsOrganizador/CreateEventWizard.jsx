import { useState } from 'react';
import {
    FiArrowLeft,
    FiCalendar,
    FiCheck,
    FiClock,
    FiImage,
    FiInstagram,
    FiMapPin,
    FiPlus,
    FiTrash2,
    FiUpload,
    FiUsers,
} from 'react-icons/fi';

const steps = ['Información básica', 'Ubicación', 'Entradas', 'Imagen y promoción', 'Revisión y publicar'];

function Stepper({ currentStep }) {
    return (
        <div className="flex items-center justify-between">
            {steps.map((label, index) => {
                const number = index + 1;
                const completed = number <= currentStep;
                return (
                    <div key={label} className="flex flex-1 items-center last:flex-none">
                        <span className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${completed ? 'bg-[#087fea] text-white' : 'bg-[#d5dbe2] text-[#5f6d7e]'}`}>
                            {number}
                        </span>
                        {number < steps.length && <span className={`mx-2 h-[2px] w-full ${number < currentStep ? 'bg-[#087fea]' : 'bg-[#d5dbe2]'}`} />}
                    </div>
                );
            })}
        </div>
    );
}

function Field({ label, children }) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold text-[#172033]">{label}</span>
            {children}
        </label>
    );
}

const inputClass = 'w-full rounded-[7px] border border-[#dce4ec] bg-white px-3 py-2 text-[11px] text-[#59687a] outline-none placeholder:text-[#9aa5b1] focus:border-[#087fea]';

function BasicInfo({ form, update }) {
    return (
        <div className="space-y-3">
            <h2 className="font-display text-[18px] font-bold text-[#172033]">Información básica</h2>
            <Field label="Nombre del Evento">
                <input className={inputClass} value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="Festival noche de jazz" />
            </Field>
            <Field label="Descripción">
                <textarea className={`${inputClass} h-[63px] resize-none`} value={form.description} onChange={(event) => update('description', event.target.value)} placeholder="Disfruta de lo mejor del jazz en la heroica Cartagena." />
            </Field>
            <Field label="Categoría">
                <select className={inputClass} value={form.category} onChange={(event) => update('category', event.target.value)}>
                    <option>Música</option>
                    <option>Deportivo</option>
                    <option>Entretenimiento</option>
                    <option>Académico</option>
                </select>
            </Field>
            <div>
                <p className="mb-2 text-[11px] font-semibold text-[#172033]">Fecha y Hora</p>
                <div className="grid grid-cols-2 gap-10">
                    <Field label="Fecha de inicio">
                        <div className="relative">
                            <input type="date" className={inputClass} value={form.startDate} onChange={(event) => update('startDate', event.target.value)} />
                            <FiCalendar className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8995a3]" size={14} />
                        </div>
                    </Field>
                    <Field label="Hora de inicio">
                        <div className="relative">
                            <input type="time" className={inputClass} value={form.startTime} onChange={(event) => update('startTime', event.target.value)} />
                            <FiClock className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8995a3]" size={14} />
                        </div>
                    </Field>
                    <Field label="Fecha de fin">
                        <input type="date" className={inputClass} value={form.endDate} onChange={(event) => update('endDate', event.target.value)} />
                    </Field>
                    <Field label="Hora de fin">
                        <input type="time" className={inputClass} value={form.endTime} onChange={(event) => update('endTime', event.target.value)} />
                    </Field>
                </div>
            </div>
        </div>
    );
}

function LocationStep({ form, update }) {
    return (
        <div className="space-y-4">
            <h2 className="font-display text-[18px] font-bold text-[#172033]">Ubicación</h2>
            <Field label="Lugar"><input className={inputClass} value={form.place} onChange={(event) => update('place', event.target.value)} placeholder="Plaza de la Aduana" /></Field>
            <Field label="Dirección"><input className={inputClass} value={form.address} onChange={(event) => update('address', event.target.value)} placeholder="Centro, plaza de la aduana, cr #56 77 6" /></Field>
            <div>
                <p className="mb-3 text-[11px] font-semibold text-[#172033]">Mapa</p>
                <div className="relative flex h-[185px] items-center justify-center overflow-hidden rounded-[7px] border border-[#e2e7eb] bg-[#eeeae0]" style={{ backgroundImage: 'linear-gradient(28deg, transparent 42%, rgba(255,255,255,.8) 43%, rgba(255,255,255,.8) 47%, transparent 48%), linear-gradient(115deg, transparent 45%, rgba(255,255,255,.8) 46%, rgba(255,255,255,.8) 51%, transparent 52%)', backgroundSize: '90px 70px, 130px 90px' }}>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ef302b] text-white shadow-lg">
                        <FiMapPin size={27} fill="white" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function TicketsStep({ tickets, setTickets }) {
    const updateTicket = (index, key, value) => setTickets((current) => current.map((ticket, ticketIndex) => ticketIndex === index ? { ...ticket, [key]: value } : ticket));

    return (
        <div className="space-y-7">
            <h2 className="font-display text-[18px] font-bold text-[#172033]">Entradas</h2>
            <div>
                <p className="mb-3 text-[11px] font-semibold text-[#172033]">Tipo de entrada</p>
                <div className="overflow-hidden rounded-[8px] border border-[#dce4ec]">
                    {tickets.map((ticket, index) => (
                        <div key={ticket.name} className="grid grid-cols-[1fr_100px_56px] items-center gap-3 border-b border-[#e5e9ee] px-4 py-2 last:border-0">
                            <input value={ticket.name} onChange={(event) => updateTicket(index, 'name', event.target.value)} className="text-[11px] font-semibold text-[#087fea] outline-none" />
                            <input value={ticket.price} onChange={(event) => updateTicket(index, 'price', event.target.value)} className="rounded-[6px] border border-[#dce4ec] px-2 py-1.5 text-center text-[11px] font-semibold outline-none focus:border-[#087fea]" />
                            <button type="button" aria-label={`Eliminar entrada ${ticket.name}`} onClick={() => setTickets((current) => current.filter((_, ticketIndex) => ticketIndex !== index))} className="text-[#172033] hover:text-[#e5484d]">
                                <FiTrash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
                <button type="button" onClick={() => setTickets((current) => [...current, { name: 'Nueva entrada', price: '$0', capacity: '0' }])} className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-[#087fea]">
                    <FiPlus size={13} /> Agregar tipo de entrada
                </button>
            </div>
            <div>
                <p className="mb-3 text-[11px] font-semibold text-[#172033]">Cantidad disponible</p>
                {tickets.map((ticket, index) => (
                    <div key={`${ticket.name}-capacity`} className="mb-2 flex items-center justify-between px-9 text-[11px]">
                        <span className="font-semibold text-[#087fea]">{ticket.name}</span>
                        <input value={ticket.capacity} onChange={(event) => updateTicket(index, 'capacity', event.target.value)} className="w-[100px] rounded-[6px] border border-[#dce4ec] px-2 py-1.5 text-center font-semibold outline-none focus:border-[#087fea]" />
                    </div>
                ))}
            </div>
        </div>
    );
}

function PromotionStep({ form, update }) {
    return (
        <div className="space-y-7">
            <h2 className="font-display text-[18px] font-bold text-[#172033]">Imagen y canal de promoción</h2>
            <div>
                <p className="mb-3 text-[11px] font-semibold text-[#172033]">Imagen del evento</p>
                <label className="mx-auto flex h-[165px] w-[295px] cursor-pointer flex-col items-center justify-center border border-dashed border-[#cfd8e2] bg-[#fafbfc] text-center hover:border-[#087fea]">
                    <FiUpload size={29} className="mb-3 text-[#5e9cff]" />
                    <span className="text-[11px] text-[#172033]">{form.fileName || 'Arrastra tu archivo aquí o explora'}</span>
                    <span className="mt-2 text-[10px] text-[#8b97a4]">JPG, PNG - Hasta 5MB</span>
                    <span className="mt-2 rounded border border-[#d6dee7] bg-white px-2.5 py-1 text-[9px]">Buscar archivo</span>
                    <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={(event) => update('fileName', event.target.files?.[0]?.name || '')} />
                </label>
            </div>
            <div>
                <p className="mb-3 text-[11px] font-semibold text-[#172033]">Redes sociales (opcional)</p>
                <div className="flex gap-4">
                    <button type="button" aria-label="Facebook" className="flex h-8 w-8 items-center justify-center rounded-[7px] border border-[#dce4ec] text-[#111827]"><FiUsers size={17} /></button>
                    <button type="button" aria-label="Instagram" className="flex h-8 w-8 items-center justify-center rounded-[7px] border border-[#dce4ec] text-[#111827]"><FiInstagram size={17} /></button>
                </div>
            </div>
        </div>
    );
}

function ReviewStep({ form, tickets }) {
    return (
        <div className="space-y-6">
            <h2 className="font-display text-[18px] font-bold text-[#172033]">Revisión y publicar</h2>
            <div>
                <p className="mb-3 text-[11px] font-semibold text-[#172033]">Resumen del evento</p>
                <div className="space-y-3 rounded-[8px] border border-[#dce4ec] p-5 text-[12px] text-[#697586]">
                    <p className="font-bold text-[#172033]">{form.title || 'Festival Cartagena jazz'}</p>
                    <p className="flex items-center gap-3"><FiCalendar /> {form.startDate || '23 de agosto 2026'}, {form.startTime || '6:00 p.m.'}</p>
                    <p className="flex items-center gap-3"><FiMapPin /> {form.place || 'Plaza de la aduana, cartagena'}</p>
                    <p className="flex items-center gap-3"><FiUsers /> {tickets.length} tipos de entrada</p>
                    <p className="flex items-center gap-3"><FiImage /> {form.fileName ? 'Imagen cargada' : 'Imagen cargada y redes configuradas'}</p>
                </div>
            </div>
            <Field label="Estado">
                <select className={inputClass}>
                    <option>Borrador</option>
                    <option>Publicado</option>
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
        { name: 'General', price: '$100.000', capacity: '300' },
        { name: 'VIP', price: '$210.000', capacity: '100' },
    ]);

    const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
    const next = () => currentStep < 5 ? setCurrentStep((step) => step + 1) : onSave();

    return (
        <div className="relative">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="font-display text-[18px] font-bold text-[#172033]">Crear Nuevo Evento</h2>
                    <p className="text-[11px] text-[#172033]">Define la información base de tu evento.</p>
                </div>
                <button type="button" onClick={onBack} className="flex items-center gap-2 rounded-[8px] bg-[#087fea] px-5 py-2 text-[12px] font-semibold text-white hover:bg-[#006ed8]">
                    <FiArrowLeft size={14} /> Regresar
                </button>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-7 xl:grid-cols-[minmax(0,588px)_290px]">
                <section className="flex min-h-[580px] flex-col rounded-[15px] border border-[#d8dfe6] bg-white px-9 pb-4 pt-8 shadow-[0_2px_3px_rgba(15,23,42,.18)]">
                    <Stepper currentStep={currentStep} />
                    <div className="mt-5 flex-1">
                        {currentStep === 1 && <BasicInfo form={form} update={update} />}
                        {currentStep === 2 && <LocationStep form={form} update={update} />}
                        {currentStep === 3 && <TicketsStep tickets={tickets} setTickets={setTickets} />}
                        {currentStep === 4 && <PromotionStep form={form} update={update} />}
                        {currentStep === 5 && <ReviewStep form={form} tickets={tickets} />}
                    </div>
                    <div className="mt-5 flex justify-end gap-5 border-t-0">
                        <button type="button" onClick={() => currentStep === 1 ? onBack() : setCurrentStep((step) => step - 1)} className="rounded-[8px] border border-[#e0e6ed] px-10 py-2 text-[10px] font-semibold text-[#71839c] hover:bg-[#f7f9fb]">
                            {currentStep === 1 ? 'Cancelar' : 'Atrás'}
                        </button>
                        <button type="button" onClick={next} className={`rounded-[8px] px-10 py-2 text-[10px] font-semibold text-white ${currentStep === 5 ? 'bg-[#08a978] hover:bg-[#078d65]' : 'bg-[#087fea] hover:bg-[#006ed8]'}`}>
                            {currentStep === 5 ? 'Guardar evento' : 'Siguiente'}
                        </button>
                    </div>
                </section>
                <aside className="h-fit rounded-[15px] bg-white px-5 py-8">
                    <h3 className="font-display text-[14px] font-bold text-[#172033]">Pasos para crear tu evento</h3>
                    <p className="mt-1 text-[10px] leading-tight text-[#71839c]">Sigue este proceso para completar la publicación de tu evento.</p>
                    <ul className="mt-5 space-y-3 text-[10px] text-[#71839c]">
                        <li className="flex gap-2"><span className="mt-0.5 h-2.5 w-2.5 rounded-full bg-[#087fea]" />Define información básica</li>
                        <li className="flex gap-2"><span className="mt-0.5 h-2.5 w-2.5 rounded-full bg-[#087fea]" />Indica ubicación y mapa</li>
                        <li className="flex gap-2"><span className="mt-0.5 h-2.5 w-2.5 rounded-full bg-[#087fea]" />Configura entradas</li>
                        <li className="flex gap-2"><span className="mt-0.5 h-2.5 w-2.5 rounded-full bg-[#087fea]" />Sube imagen y promo</li>
                        <li className="flex gap-2"><span className="mt-0.5 h-2.5 w-2.5 rounded-full bg-[#087fea]" />Revisa y publica</li>
                    </ul>
                </aside>
            </div>
        </div>
    );
}

export function SuccessState({ onView, onCreateAnother }) {
    return (
        <div className="flex min-h-[650px] flex-col items-center justify-center bg-white text-center">
            <div className="flex h-[142px] w-[142px] items-center justify-center rounded-full bg-[#079f72] text-white"><FiCheck size={82} strokeWidth={3} /></div>
            <h2 className="mt-10 font-display text-[48px] font-bold text-[#079f72]">Evento creado exitosamente</h2>
            <p className="mt-12 max-w-[700px] text-[31px] font-semibold leading-tight text-[#555]">Tu evento ha sido guardado y está listo<br /> para ser publicado.</p>
            <div className="mt-24 flex flex-wrap justify-center gap-14">
                <button type="button" onClick={onView} className="rounded-[22px] bg-[#087fea] px-20 py-5 text-[26px] font-bold text-white hover:bg-[#006ed8]">Ver mi evento</button>
                <button type="button" onClick={onCreateAnother} className="rounded-[22px] border border-[#b8c0c8] bg-[#f5f8fb] px-16 py-5 text-[26px] font-bold text-[#111] hover:bg-[#e9eef3]">Crear otro evento</button>
            </div>
        </div>
    );
}
