import { useState } from 'react';
import { FiCheck, FiMapPin, FiMail, FiPhone, FiShield, FiStar } from 'react-icons/fi';

const initialProfile = {
    nombre: 'Fundación Cultural Caribe',
    email: 'contac@fundacioncaribe.co',
    telefono: '+57 321 456 7890',
    ciudad: 'Cartagena',
    sitioWeb: 'www.fundacioncaribe.co',
    descripcion: 'Organizador cultural enfocado en experiencias, arte, patrimonio y comunidad.',
    instagram: '@fundacioncaribe',
    facebook: 'Fundación Cultural Caribe',
};

const inputClass = 'w-full rounded-[7px] border border-[#dfe7f1] bg-[#f8fafc] px-3 py-2 text-[11px] text-[#41536c] outline-none transition focus:border-[#087fea]';

export default function PerfilOrganizador() {
    const [profile, setProfile] = useState(initialProfile);
    const [saved, setSaved] = useState(false);

    const handleChange = (key, value) => {
        setProfile((current) => ({ ...current, [key]: value }));
        setSaved(false);
    };

    const handleSave = () => {
        setSaved(true);
    };

    return (
        <div>
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="font-display text-[18px] font-bold text-[#172033]">Mi perfil</h2>
                    <p className="mt-0.5 text-[13px] text-[#71839c]">Actualiza la información pública y de contacto del organizador.</p>
                </div>
                <button type="button" onClick={handleSave} className="rounded-[8px] bg-[#087fea] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#006ed8]">
                    Guardar cambios
                </button>
            </div>
            {saved && (
                        <div className="flex items-center gap-2 rounded-[11px] border border-[#bde9d1] bg-[#ebfff5] px-3 py-2 text-[10px] font-semibold text-[#0b8c60]">
                            <FiCheck size={13} /> Cambios guardados correctamente.
                        </div>
                    )}

            <div className="mt-7 grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <section className="rounded-[13px] border border-[#e0e6ed] bg-white p-5">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-[16px] bg-[#dfeaff] text-[18px] font-bold text-[#0c5ecd]">FC</div>
                            <div>
                                <p className="font-display text-[18px] font-bold text-[#172033]">{profile.nombre}</p>
                                <p className="text-[10px] text-[#71839c]">Organizador principal</p>
                            </div>
                        </div>
                        <span className="rounded-full border border-[#dfe7f1] bg-[#f8fbff] px-2.5 py-1 text-[9px] font-semibold text-[#087fea]">Verificado</span>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Field label="Nombre de la organización">
                            <input value={profile.nombre} onChange={(event) => handleChange('nombre', event.target.value)} className={inputClass} />
                        </Field>
                        <Field label="Ciudad">
                            <input value={profile.ciudad} onChange={(event) => handleChange('ciudad', event.target.value)} className={inputClass} />
                        </Field>
                        <Field label="Correo electrónico">
                            <input value={profile.email} onChange={(event) => handleChange('email', event.target.value)} className={inputClass} />
                        </Field>
                        <Field label="Teléfono">
                            <input value={profile.telefono} onChange={(event) => handleChange('telefono', event.target.value)} className={inputClass} />
                        </Field>
                        <Field label="Sitio web">
                            <input value={profile.sitioWeb} onChange={(event) => handleChange('sitioWeb', event.target.value)} className={`${inputClass} md:col-span-2`} />
                        </Field>
                        <Field label="Instagram">
                            <input value={profile.instagram} onChange={(event) => handleChange('instagram', event.target.value)} className={inputClass} />
                        </Field>
                        <Field label="Facebook">
                            <input value={profile.facebook} onChange={(event) => handleChange('facebook', event.target.value)} className={inputClass} />
                        </Field>
                        <Field label="Descripción">
                            <textarea value={profile.descripcion} onChange={(event) => handleChange('descripcion', event.target.value)} className={`${inputClass} h-[90px] resize-none`} />
                        </Field>
                    </div>
                </section>

                <aside className="space-y-4">
                    <div className="rounded-[13px] border border-[#e0e6ed] bg-white p-4">
                        <h3 className="font-display text-[14px] font-bold text-[#172033]">Resumen del perfil</h3>
                        <div className="mt-4 space-y-3 text-[11px] text-[#42546d]">
                            <InfoRow icon={<FiMail size={14} />} label="Email" value={profile.email} />
                            <InfoRow icon={<FiPhone size={14} />} label="Teléfono" value={profile.telefono} />
                            <InfoRow icon={<FiMapPin size={14} />} label="Ciudad" value={profile.ciudad} />
                            <InfoRow icon={<FiShield size={14} />} label="Verificación" value="Aprobado" />
                        </div>
                    </div>

                    <div className="rounded-[13px] border border-[#e0e6ed] bg-white p-4">
                        <h3 className="font-display text-[14px] font-bold text-[#172033]">Calificación</h3>
                        <div className="mt-3 flex items-center gap-2">
                            <FiStar className="text-[#f7b955]" size={16} />
                            <span className="font-display text-[20px] font-bold text-[#172033]">4.9</span>
                            <span className="text-[10px] text-[#71839c]">/ 5.0 promedio</span>
                        </div>
                        <p className="mt-3 text-[10px] leading-5 text-[#71839c]">Excelente reputación entre asistentes y proveedores. Mantén la comunicación constante para fortalecer tu marca.</p>
                    </div>

                    
                </aside>
            </div>
        </div>
    );
}

function Field({ label, children }) {
    return (
        <label className="block text-[11px] font-semibold text-[#172033] md:col-span-2">
            <span className="mb-1.5 block">{label}</span>
            {children}
        </label>
    );
}

function InfoRow({ icon, label, value }) {
    return (
        <div className="flex items-center gap-3 rounded-[8px] bg-[#f7faff] px-2.5 py-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-white text-[#087fea] shadow-sm">{icon}</span>
            <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-wide text-[#71839c]">{label}</p>
                <p className="truncate text-[10px] font-semibold text-[#172033]">{value}</p>
            </div>
        </div>
    );
}
