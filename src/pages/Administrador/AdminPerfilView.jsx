import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Key,
  Mail,
  Phone,
  Building2,
  Lock,
  CheckCircle2,
  Clock,
  Smartphone,
  Save,
  ShieldAlert,
  Calendar,
  Activity,
  Award,
} from 'lucide-react';
import Badge from '../../components/Shared/Badge.jsx';
import { session } from '../../services/session.js';

export default function AdminPerfilView({ onNavigateTab, showToast = () => {} }) {
  const sessionUser = session.getUser();

  // Estados del perfil
  const [nombre, setNombre] = useState(sessionUser?.name || 'Andrés Camilo Vergara');
  const [email] = useState(sessionUser?.email || 'admin@eventhive.co');
  const [telefono, setTelefono] = useState('+57 300 123 4567');
  const [cargo, setCargo] = useState('Director General de Operaciones y Cumplimiento');
  const [ubicacion, setUbicacion] = useState('Cartagena de Indias, Colombia');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  // Estados de cambio de contraseña
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    showToast('Perfil de administrador actualizado correctamente.', 'success');
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('Las contraseñas no coinciden.', 'error');
      return;
    }
    if (newPassword.length < 8) {
      showToast('La nueva contraseña debe tener al menos 8 caracteres.', 'error');
      return;
    }
    setShowPasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('Contraseña de administrador actualizada exitosamente.', 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Encabezado Principal de Perfil */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs relative overflow-hidden">
        {/* Banner superior decorativo */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-[#0b1329] via-[#132247] to-[#087fea]" />

        <div className="relative pt-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Avatar con Insignia */}
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-[#087fea] text-white flex items-center justify-center font-display font-black text-3xl shadow-xl ring-4 ring-white border-2 border-[#087fea]/20">
                AD
              </div>
              <span
                className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-emerald-500 text-white ring-2 ring-white shadow-sm"
                title="Sesión Activa y Verificada"
              >
                <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 leading-tight">
                  {nombre}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wider uppercase bg-amber-500/15 border border-amber-400/30 text-amber-700">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  ADMINISTRADOR
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">{cargo}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                <span>{email}</span>
                <span>•</span>
                <span>{ubicacion}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <button
              type="button"
              onClick={() => setShowPasswordModal(true)}
              className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all flex items-center gap-2 active:scale-95"
            >
              <Key className="w-4 h-4 text-slate-500" strokeWidth={1.75} />
              <span>Cambiar Contraseña</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid de 2 Columnas: Datos del Perfil & Seguridad / Alcance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda (2/3): Formulario de Datos Personales */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" strokeWidth={1.75} />
              <span>Información Administrativa Institucional</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Datos registrados para el registro de auditoría y trazabilidad pública de decisiones
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Correo Institucional (Acceso)
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed outline-none"
                  title="El correo de administrador es administrado por la política de seguridad"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Teléfono de Contacto Directo
                </label>
                <input
                  type="text"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Cargo / Rol Operativo
                </label>
                <input
                  type="text"
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Jurisdicción y Sede Operativa
              </label>
              <input
                type="text"
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
                className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="py-2.5 px-6 rounded-xl bg-primary hover:bg-primary-600 text-white text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-2"
              >
                <Save className="w-4 h-4" strokeWidth={2} />
                <span>Guardar Cambios</span>
              </button>
            </div>
          </form>
        </div>

        {/* Columna Derecha (1/3): Seguridad, Privilegios y Actividad */}
        <div className="space-y-6">
          {/* Tarjeta de Seguridad y 2FA */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" strokeWidth={1.75} />
              <span>Seguridad de la Cuenta</span>
            </h3>

            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-emerald-950 block">
                  Autenticación en Dos Pasos (2FA)
                </span>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  Protección activa mediante aplicación TOTP.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTwoFactorEnabled(!twoFactorEnabled);
                  showToast(
                    `2FA ${!twoFactorEnabled ? 'habilitado' : 'deshabilitado'} para la cuenta.`,
                    'info'
                  );
                }}
                className={`py-1 px-2.5 rounded-lg text-[10px] font-bold transition-all ${
                  twoFactorEnabled
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {twoFactorEnabled ? 'Activo' : 'Inactivo'}
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600 pt-1">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Último Inicio de Sesión:</span>
                <span className="font-semibold text-slate-800">Hoy, 09:14 AM</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Dirección IP de Acceso:</span>
                <span className="font-mono text-slate-800 text-[11px]">190.25.10.42</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-400">Nivel de Privilegios:</span>
                <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md text-[10px]">
                  SUPERADMIN (Nivel 1)
                </span>
              </div>
            </div>
          </div>

          {/* Tarjeta de Privilegios Administrativos */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" strokeWidth={1.75} />
              <span>Privilegios del Sistema (Rol)</span>
            </h3>

            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Gestión y auditoría de moderadores</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Supervisión y suspensión de organizaciones</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Retiro administrativo de eventos</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Administración de categorías y promociones</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Consulta de trazabilidad e historial inmutable</span>
              </li>
            </ul>

            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('historial')}
                className="w-full mt-3 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all text-center block"
              >
                Ver Mi Registro de Actividad
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Cambio de Contraseña */}
      {showPasswordModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setShowPasswordModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-primary">
                  <Key className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900">
                    Cambiar Contraseña
                  </h3>
                  <p className="text-xs text-slate-500">Credenciales del Administrador</p>
                </div>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contraseña Actual *
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nueva Contraseña *
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">Mínimo 8 caracteres alfanuméricos.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirmar Nueva Contraseña *
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary-600 text-white text-xs font-bold shadow-md transition-all active:scale-95"
                >
                  Actualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
