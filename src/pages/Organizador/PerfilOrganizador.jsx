import React, { useState, useEffect, useRef } from 'react';
import {
  FiCheck,
  FiMail,
  FiShield,
  FiStar,
  FiCamera,
  FiAward,
  FiUser,
  FiShoppingBag,
  FiHeart,
  FiPackage,
  FiCreditCard,
} from 'react-icons/fi';
import { organizerService } from '../../services/organizerService.js';
import { userService } from '../../services/userService.js';
import { httpClient } from '../../services/httpClient.js';
import { session } from '../../services/session.js';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/10';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

export default function PerfilOrganizador() {
  const [activeTab, setActiveTab] = useState('organizacion'); // 'organizacion' | 'representante'

  // Organization profile state
  const [orgProfile, setOrgProfile] = useState({
    id: '',
    razonSocial: '',
    correoContacto: '',
    descripcion: '',
    urlLogo: null,
    promedioRating: null,
    totalValoraciones: 0,
    totalSeguidores: 0,
    nivel: '',
    estado: '',
    nit: '',
  });
  const [orgLoading, setOrgLoading] = useState(true);
  const [orgSaved, setOrgSaved] = useState(false);
  const [orgImageFile, setOrgImageFile] = useState(null);
  const [orgImagePreview, setOrgImagePreview] = useState(null);
  const orgImageRef = useRef(null);

  // Representative profile state
  const [repProfile, setRepProfile] = useState({
    id: '',
    nombre: '',
    correo: '',
    telefono: '',
    imagenPerfil: null,
    urlImagenPerfil: null,
    rolNombre: '',
  });
  const [repLoading, setRepLoading] = useState(true);
  const [repSaved, setRepSaved] = useState(false);
  const [repImageFile, setRepImageFile] = useState(null);
  const [repImagePreview, setRepImagePreview] = useState(null);
  const repImageRef = useRef(null);

  // Representative activity/purchases
  const [activity, setActivity] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [favorites, setFavorites] = useState([]);

  // Load organization profile
  useEffect(() => {
    let isMounted = true;
    organizerService.getMiOrganizacion()
      .then((org) => {
        if (!isMounted || !org) return;
        setOrgProfile({
          id: org.id || '',
          razonSocial: org.razonSocial || org.nombre || '',
          correoContacto: org.correoContacto || org.correo || '',
          descripcion: org.descripcion || '',
          urlLogo: org.urlLogo || null,
          promedioRating: org.promedioRating ?? org.valoracion ?? null,
          totalValoraciones: org.totalValoraciones || 0,
          totalSeguidores: org.totalSeguidores || 0,
          nivel: org.nivel || '',
          estado: org.estado || '',
          nit: org.nit || '',
        });
      })
      .catch(() => {})
      .finally(() => { if (isMounted) setOrgLoading(false); });
    return () => { isMounted = false; };
  }, []);

  // Load representative profile and activity
  useEffect(() => {
    let isMounted = true;

    userService.getPerfil()
      .then((user) => {
        if (!isMounted || !user) return;
        setRepProfile({
          id: user.id || '',
          nombre: user.nombre || '',
          correo: user.correo || '',
          telefono: user.telefono || '',
          imagenPerfil: user.imagenPerfil || null,
          urlImagenPerfil: user.urlImagenPerfil || null,
          rolNombre: user.rolNombre || '',
        });
      })
      .catch(() => {})
      .finally(() => { if (isMounted) setRepLoading(false); });

    // Activity — item 8: purchases from all orgs (not filtered by own org)
    userService.getActividad()
      .then((data) => { if (isMounted && data) setActivity(data); })
      .catch(() => {});

    // Purchases
    userService.getCompras({ page: 0, size: 10 })
      .then((data) => {
        if (isMounted) setPurchases(data?.content || []);
      })
      .catch(() => {});

    // Favorites
    userService.getDeseos({ page: 0, size: 10 })
      .then((data) => {
        if (isMounted) setFavorites(data?.content || []);
      })
      .catch(() => {});

    return () => { isMounted = false; };
  }, []);

  // --- Organization image handling ---
  const handleOrgImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert('Solo se permiten archivos PNG o JPEG.');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      alert('La imagen no puede superar los 5 MB.');
      return;
    }
    setOrgImageFile(file);
    setOrgImagePreview(URL.createObjectURL(file));
  };

  const handleOrgSave = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    try {
      const fd = new FormData();
      const datos = {
        razonSocial: orgProfile.razonSocial,
        descripcion: orgProfile.descripcion,
        correoContacto: orgProfile.correoContacto,
      };
      fd.append('datos', new Blob([JSON.stringify(datos)], { type: 'application/json' }));
      if (orgImageFile) {
        fd.append('imagen', orgImageFile);
      }
      const result = await organizerService.updateMiOrganizacion(fd);
      if (result?.urlLogo) {
        setOrgProfile((prev) => ({ ...prev, urlLogo: result.urlLogo }));
        setOrgImagePreview(null);
        setOrgImageFile(null);
      }
      setOrgSaved(true);
      setTimeout(() => setOrgSaved(false), 4000);
    } catch (err) {
      alert(err.message || 'Error al guardar perfil de organización');
    }
  };

  // --- Representative image handling ---
  const handleRepImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert('Solo se permiten archivos PNG o JPEG.');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      alert('La imagen no puede superar los 5 MB.');
      return;
    }
    setRepImageFile(file);
    setRepImagePreview(URL.createObjectURL(file));
  };

  const handleRepSave = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    try {
      // Update text fields
      await userService.updatePerfil({
        nombre: repProfile.nombre,
        telefono: repProfile.telefono,
      });

      // Upload image if selected — item 9: bucket imagenPerfil
      if (repImageFile) {
        const fd = new FormData();
        fd.append('imagen', repImageFile);
        const result = await httpClient.put('/usuarios/perfil/imagen', fd, { isFormData: true });
        if (result?.imagenPerfil || result?.urlImagenPerfil) {
          setRepProfile((prev) => ({
            ...prev,
            imagenPerfil: result.imagenPerfil || prev.imagenPerfil,
            urlImagenPerfil: result.urlImagenPerfil || prev.urlImagenPerfil,
          }));
          setRepImagePreview(null);
          setRepImageFile(null);
        }
      }

      setRepSaved(true);
      setTimeout(() => setRepSaved(false), 4000);
    } catch (err) {
      alert(err.message || 'Error al guardar perfil del representante');
    }
  };

  const orgDisplayImage = orgImagePreview || orgProfile.urlLogo;
  const repDisplayImage = repImagePreview || repProfile.urlImagenPerfil || repProfile.imagenPerfil;

  return (
    <div className="space-y-6">
      {/* Tab Switcher — item 8: separated org + representative */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-2xl p-1 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('organizacion')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'organizacion'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Perfil de Organización
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('representante')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'representante'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Perfil del Representante
        </button>
      </div>

      {/* ===== A. Organization Profile — item 7 ===== */}
      {activeTab === 'organizacion' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Perfil de la Organización
              </h2>
              <p className="mt-1 text-xs text-slate-500 max-w-xl">
                Información básica, logo y reputación de tu organización.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOrgSave}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand hover:bg-brand-dark px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-brand/20 transition-all active:scale-95 shrink-0"
            >
              Guardar cambios
            </button>
          </div>

          {orgSaved && (
            <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800 animate-fade-in shadow-xs">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white shrink-0">
                <FiCheck size={12} />
              </span>
              <span>Perfil de organización actualizado correctamente.</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
            {/* Form */}
            <form onSubmit={handleOrgSave} className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-sm space-y-6">
              {/* Avatar with image upload — item 10 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-sky-400 text-2xl font-black text-white shadow-md overflow-hidden">
                      {orgDisplayImage ? (
                        <img src={orgDisplayImage} alt={orgProfile.razonSocial} className="w-full h-full object-cover" />
                      ) : (
                        (orgProfile.razonSocial || 'MO').slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <button
                      type="button"
                      title="Cambiar logotipo"
                      onClick={() => orgImageRef.current?.click()}
                      className="absolute -bottom-1 -right-1 h-7 w-7 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-brand transition-colors shadow-sm"
                    >
                      <FiCamera size={13} />
                    </button>
                    <input
                      ref={orgImageRef}
                      type="file"
                      accept="image/png,image/jpeg"
                      className="hidden"
                      onChange={handleOrgImageSelect}
                    />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-900">
                      {orgProfile.razonSocial}
                    </h3>
                    {orgProfile.estado && (
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        orgProfile.estado === 'APROBADA'
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                          : 'bg-amber-50 border border-amber-200 text-amber-700'
                      }`}>
                        <FiShield size={11} /> {orgProfile.estado}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Fields — item 7: only razonSocial, correoContacto, descripcion */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Razón Social">
                  <input
                    value={orgProfile.razonSocial}
                    onChange={(e) => setOrgProfile((p) => ({ ...p, razonSocial: e.target.value }))}
                    className={inputClass}
                  />
                </Field>

                <Field label="Correo de Contacto">
                  <input
                    type="email"
                    value={orgProfile.correoContacto}
                    onChange={(e) => setOrgProfile((p) => ({ ...p, correoContacto: e.target.value }))}
                    className={inputClass}
                  />
                </Field>

                <Field label="Descripción pública" className="md:col-span-2">
                  <textarea
                    rows="4"
                    value={orgProfile.descripcion}
                    onChange={(e) => setOrgProfile((p) => ({ ...p, descripcion: e.target.value }))}
                    className={`${inputClass} resize-none leading-relaxed`}
                  />
                </Field>
              </div>
            </form>

            {/* Reputation sidebar — item 7 */}
            <aside className="space-y-5">
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="font-display text-sm font-bold text-slate-900">
                    Reputación en EventHive
                  </h4>
                  {orgProfile.nivel && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      {orgProfile.nivel.replace('_', ' ')}
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 shadow-2xs">
                    <FiStar size={24} fill="currentColor" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-display text-3xl font-black text-slate-900">
                        {orgProfile.promedioRating ? Number(orgProfile.promedioRating).toFixed(1) : '—'}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">/ 5.0</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {orgProfile.totalValoraciones} valoraciones · {orgProfile.totalSeguidores} seguidores
                    </p>
                  </div>
                </div>
              </div>

              {/* Org basic info */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm space-y-2.5">
                <h4 className="font-display text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Información
                </h4>
                <InfoRow icon={<FiMail size={14} />} label="Correo" value={orgProfile.correoContacto} />
                <InfoRow icon={<FiAward size={14} />} label="NIT" value={orgProfile.nit} />
                <InfoRow icon={<FiShield size={14} />} label="Estado" value={orgProfile.estado} />
              </div>
            </aside>
          </div>
        </div>
      )}

      {/* ===== B. Representative Profile — item 8 ===== */}
      {activeTab === 'representante' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Perfil del Representante
              </h2>
              <p className="mt-1 text-xs text-slate-500 max-w-xl">
                Información personal y actividad como usuario de Eventhive.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRepSave}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand hover:bg-brand-dark px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-brand/20 transition-all active:scale-95 shrink-0"
            >
              Guardar cambios
            </button>
          </div>

          {repSaved && (
            <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800 animate-fade-in shadow-xs">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white shrink-0">
                <FiCheck size={12} />
              </span>
              <span>Perfil del representante actualizado correctamente.</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
            {/* Rep form */}
            <form onSubmit={handleRepSave} className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-sm space-y-6">
              {/* Avatar — item 9: image upload */}
              <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                <div className="relative">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand to-sky-400 text-2xl font-black text-white shadow-md overflow-hidden">
                    {repDisplayImage ? (
                      <img src={repDisplayImage} alt={repProfile.nombre} className="w-full h-full object-cover" />
                    ) : (
                      (repProfile.nombre || 'U').slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <button
                    type="button"
                    title="Cambiar foto de perfil"
                    onClick={() => repImageRef.current?.click()}
                    className="absolute -bottom-1 -right-1 h-7 w-7 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-brand transition-colors shadow-sm"
                  >
                    <FiCamera size={13} />
                  </button>
                  <input
                    ref={repImageRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    className="hidden"
                    onChange={handleRepImageSelect}
                  />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-slate-900">{repProfile.nombre}</h3>
                  <p className="text-xs text-slate-500">{repProfile.correo}</p>
                  {repProfile.rolNombre && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-700 mt-1">
                      <FiUser size={10} /> {repProfile.rolNombre}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Nombre">
                  <input
                    value={repProfile.nombre}
                    onChange={(e) => setRepProfile((p) => ({ ...p, nombre: e.target.value }))}
                    className={inputClass}
                  />
                </Field>
                <Field label="Teléfono">
                  <input
                    value={repProfile.telefono}
                    onChange={(e) => setRepProfile((p) => ({ ...p, telefono: e.target.value }))}
                    className={inputClass}
                  />
                </Field>
                <Field label="Correo electrónico" className="md:col-span-2">
                  <input
                    type="email"
                    value={repProfile.correo}
                    disabled
                    className={`${inputClass} opacity-60 cursor-not-allowed`}
                  />
                </Field>
              </div>
            </form>

            {/* Activity sidebar — item 8: purchases, favorites, etc. */}
            <aside className="space-y-5">
              {/* Activity summary — item 16: all purchases, not filtered by org */}
              {activity && (
                <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm space-y-3">
                  <h4 className="font-display text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                    Mi Actividad en EventHive
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <ActivityStat icon={<FiShoppingBag size={14} />} label="Compras" value={activity.comprasConfirmadas} />
                    <ActivityStat icon={<FiCreditCard size={14} />} label="Entradas" value={activity.entradasCompradas} />
                    <ActivityStat icon={<FiPackage size={14} />} label="Eventos" value={activity.eventosComprados} />
                    <ActivityStat icon={<FiHeart size={14} />} label="Favoritos" value={activity.favoritos} />
                  </div>
                  {activity.totalGastado > 0 && (
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Gastado</span>
                      <span className="font-display text-xl font-black text-slate-900">
                        ${Number(activity.totalGastado).toLocaleString('es-CO')}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Recent purchases */}
              {purchases.length > 0 && (
                <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
                  <h4 className="font-display text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 mb-3">
                    Historial de Compras
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {purchases.map((compra) => (
                      <div key={compra.id} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800">
                            ${Number(compra.total).toLocaleString('es-CO')}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {compra.fechaCompra?.replace('T', ' ').slice(0, 16)}
                          </span>
                        </div>
                        {compra.items?.map((item, idx) => (
                          <p key={idx} className="text-[11px] text-slate-600 mt-1">
                            {item.cantidad}x {item.localidadNombre} — {item.eventoNombre}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Favorites */}
              {favorites.length > 0 && (
                <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
                  <h4 className="font-display text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 mb-3">
                    Eventos Favoritos
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {favorites.map((ev) => (
                      <div key={ev.id} className="flex items-center gap-2 bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                        <FiHeart size={12} className="text-rose-500 shrink-0" />
                        <span className="text-xs font-bold text-slate-800 truncate">{ev.titulo}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      )}
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
        <p className="truncate text-xs font-semibold text-slate-800">{value || '—'}</p>
      </div>
    </div>
  );
}

function ActivityStat({ icon, label, value }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
      <div className="flex items-center justify-center gap-1.5 text-brand mb-1">{icon}</div>
      <span className="font-display text-lg font-black text-slate-900 block">{value ?? 0}</span>
      <span className="text-[10px] text-slate-500 font-bold uppercase">{label}</span>
    </div>
  );
}
