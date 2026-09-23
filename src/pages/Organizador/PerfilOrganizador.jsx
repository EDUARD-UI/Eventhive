import React, { useState } from 'react';
import {
  FiCheck,
  FiMapPin,
  FiMail,
  FiPhone,
  FiShield,
  FiStar,
  FiGlobe,
  FiInstagram,
  FiFacebook,
  FiCamera,
  FiAward,
} from 'react-icons/fi';

const initialProfile = {
  nombre: 'Fundación Cultural Caribe',
  email: 'contacto@fundacioncaribe.co',
  telefono: '+57 321 456 7890',
  ciudad: 'Cartagena de Indias',
  direccion: 'Calle del Santísimo #8-14, Centro Histórico',
  sitioWeb: 'https://fundacioncaribe.co',
  descripcion:
    'Organización cultural y productora de experiencias de patrimonio, artes vivas, música y festivales de identidad en el Caribe colombiano.',
  instagram: '@fundacioncaribe',
  facebook: 'Fundación Cultural Caribe Oficial',
  rating: 4.9,
  totalEventos: 24,
  asistentesTotales: '18.4K',
};

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/10';

export default function PerfilOrganizador() {
  const [profile, setProfile] = useState(initialProfile);
  const [saved, setSaved] = useState(false);

  const handleChange = (key, value) => {
    setProfile((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Perfil de la Organización
          </h2>
          <p className="mt-1 text-xs text-slate-500 max-w-xl">
            Gestiona la información pública de tu organización, enlaces de redes sociales y canales de atención a los asistentes.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand hover:bg-brand-dark px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-brand/20 transition-all active:scale-95 shrink-0"
        >
          Guardar cambios
        </button>
      </div>

      {saved && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800 animate-fade-in shadow-xs">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white shrink-0">
            <FiCheck size={12} />
          </span>
          <span>Información de la organización actualizada correctamente.</span>
        </div>
      )}

      {/* 2. Grid de Información y Resumen */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        {/* Formulario Principal */}
        <form
          onSubmit={handleSave}
          className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-sm space-y-6"
        >
          {/* Cabecera del perfil con Avatar y Verificación */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-sky-400 text-2xl font-black text-white shadow-md">
                  FC
                </div>
                <button
                  type="button"
                  title="Cambiar logotipo"
                  className="absolute -bottom-1 -right-1 h-7 w-7 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-brand transition-colors shadow-sm"
                >
                  <FiCamera size={13} />
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg font-bold text-slate-900">
                    {profile.nombre}
                  </h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    <FiShield size={11} /> Verificada
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Productora y Colectivo Cultural en Cartagena
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
                ID Org: #ORG-2981
              </span>
            </div>
          </div>

          {/* Campos del formulario */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Nombre oficial de la Organización">
              <input
                value={profile.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Ciudad sede">
              <input
                value={profile.ciudad}
                onChange={(e) => handleChange('ciudad', e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Correo electrónico de contacto">
              <input
                type="email"
                value={profile.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Teléfono de atención">
              <input
                value={profile.telefono}
                onChange={(e) => handleChange('telefono', e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Dirección física" className="md:col-span-2">
              <input
                value={profile.direccion}
                onChange={(e) => handleChange('direccion', e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Sitio web o enlace oficial" className="md:col-span-2">
              <input
                value={profile.sitioWeb}
                onChange={(e) => handleChange('sitioWeb', e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Instagram (@usuario)">
              <input
                value={profile.instagram}
                onChange={(e) => handleChange('instagram', e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Página de Facebook">
              <input
                value={profile.facebook}
                onChange={(e) => handleChange('facebook', e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Descripción pública y reseña de la organización" className="md:col-span-2">
              <textarea
                rows="4"
                value={profile.descripcion}
                onChange={(e) => handleChange('descripcion', e.target.value)}
                className={`${inputClass} resize-none leading-relaxed`}
              />
            </Field>
          </div>
        </form>

        {/* Barra lateral con Tarjetas de Resumen y Reputación */}
        <aside className="space-y-5">
          {/* Tarjeta de Métricas Rápidas de la Organización */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm space-y-4">
            <h4 className="font-display text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Métricas de la Cuenta
            </h4>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                <span className="font-display text-2xl font-black text-slate-900">
                  {profile.totalEventos}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Eventos Publicados
                </span>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                <span className="font-display text-2xl font-black text-brand">
                  {profile.asistentesTotales}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Asistentes Totales
                </span>
              </div>
            </div>

            <div className="space-y-2.5 pt-2 text-xs">
              <InfoRow icon={<FiMail size={14} />} label="Email público" value={profile.email} />
              <InfoRow icon={<FiPhone size={14} />} label="Teléfono" value={profile.telefono} />
              <InfoRow icon={<FiMapPin size={14} />} label="Ciudad" value={profile.ciudad} />
              <InfoRow icon={<FiGlobe size={14} />} label="Web" value={profile.sitioWeb} />
            </div>
          </div>

          {/* Tarjeta de Calificación y Feedback */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-display text-sm font-bold text-slate-900">
                Reputación en EventHive
              </h4>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Top Organizador
              </span>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 shadow-2xs">
                <FiStar size={24} fill="currentColor" />
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-3xl font-black text-slate-900">
                    {profile.rating}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">/ 5.0</span>
                </div>
                <p className="text-[11px] text-emerald-600 font-bold">
                  ★ Calificación sobresaliente (98% satisfacción)
                </p>
              </div>
            </div>

            <p className="mt-3.5 text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              Tu organización cuenta con el sello de verificación oficial y máxima confianza entre asistentes a festivales en Cartagena.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, children, className = '' }) {
  return (
    <label className={`block text-xs font-bold text-slate-700 ${className}`}>
      <span className="mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50/70 p-2.5 border border-slate-100">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-brand shadow-2xs shrink-0">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase font-bold text-slate-400">{label}</p>
        <p className="truncate text-xs font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );
}
