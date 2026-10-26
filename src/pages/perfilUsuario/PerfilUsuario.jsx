import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import Navbar from '../../components/usersComponets/Navbar.jsx';
import Footer from '../../components/usersComponets/Footer.jsx';
import CityRhythmPreFooter from '../../components/home/CityRhythmPreFooter.jsx';
import PerfilHeaderCard from '../../components/perfilUsuario/PerfilHeaderCard.jsx';
import PerfilActividadCard from '../../components/perfilUsuario/PerfilActividadCard.jsx';
import PerfilTabs from '../../components/perfilUsuario/PerfilTabs.jsx';
import ModalTicketQR from '../../components/perfilUsuario/ModalTicketQR.jsx';
import DrawerEditarPerfil from '../../components/perfilUsuario/DrawerEditarPerfil.jsx';
import GuardadosPartial from './partial/GuardadosPartial.jsx';
import OrganizacionesPartial from './partial/OrganizacionesPartial.jsx';
import HistorialPartial from './partial/HistorialPartial.jsx';
import BoletosPartial from './partial/BoletosPartial.jsx';
import AjustesPartial from './partial/AjustesPartial.jsx';
import { usePerfilUsuario } from './usePerfilUsuario.js';
import { useLanguage } from '../../context/LanguageContext.jsx';

export default function PerfilUsuario() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const {
    activeTab,
    setActiveTab,
    ticketModal,
    setTicketModal,
    editModal,
    setEditModal,
    loading,
    isUpdating,
    isChangingPassword,
    usuario,
    setUsuario,
    selectedPhotoFile,
    photoPreview,
    isUploadingPhoto,
    fileInputRef,
    guardados,
    organizaciones,
    organizacionesSeguidas,
    organizacionesDisponibles,
    boletosList,
    eventosProximos,
    eventosHistorial,
    passwordForm,
    setPasswordForm,
    handleRemoveDeseo,
    handleFollowOrg,
    handleUnfollowOrg,
    handlePhotoSelect,
    handleUploadPhoto,
    handleCancelPhoto,
    handleUpdatePerfil,
    handleChangePassword,
  } = usePerfilUsuario();

  const totalEventosConfirmados = eventosProximos.length + eventosHistorial.length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070D1B] text-slate-900 dark:text-slate-100 selection:bg-amber-400 selection:text-slate-950 font-body transition-colors duration-200">
      <Navbar />

      {/* Contenedor Flotante Principal Centrado */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Botón Volver: Por fuera del div header, en la esquina superior izquierda */}
        <div className="flex items-center justify-start w-full">
          <button
            type="button"
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#0E1626] border border-slate-200/90 dark:border-slate-800 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <FiArrowLeft size={16} />
            <span>{t('Volver')}</span>
          </button>
        </div>

        {/* 1. Tarjeta Superior de Identidad Centrada (Mockup) */}
        <PerfilHeaderCard
          usuario={usuario}
          fileInputRef={fileInputRef}
          photoPreview={photoPreview}
          selectedPhotoFile={selectedPhotoFile}
          isUploadingPhoto={isUploadingPhoto}
          onPhotoSelect={handlePhotoSelect}
          onUploadPhoto={handleUploadPhoto}
          onCancelPhoto={handleCancelPhoto}
          onOpenEditModal={() => setEditModal(true)}
        />

        {/* 2. Fila Superior de Pestañas: Alineada sobre la columna de contenido en desktop */}
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-start">
          {/* Espaciador para alinear las pestañas con la columna derecha */}
          <div className="hidden lg:block w-[280px] shrink-0" aria-hidden="true" />

          {/* Barra de Pestañas tipo Píldora con fondo blanco y borde */}
          <div className="flex-1 min-w-0 w-full overflow-x-auto scrollbar-none">
            <PerfilTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              guardadosCount={guardados.length}
              organizacionesCount={organizacionesSeguidas.length}
              historialCount={eventosHistorial.length}
              boletosCount={boletosList.length}
            />
          </div>
        </div>

        {/* 3. Layout en 2 columnas: ACTIVIDAD a la izquierda y Contenido Principal a la derecha (Alineados al mismo nivel horizontal) */}
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-start !mt-2 sm:!mt-3">
          {/* Columna Izquierda: Tarjeta Flotante ACTIVIDAD */}
          <aside className="w-full lg:w-[280px] shrink-0">
            <PerfilActividadCard
              guardadosCount={guardados.length}
              boletosCount={boletosList.length}
              eventosCount={totalEventosConfirmados}
            />
          </aside>

          {/* Columna Derecha: Contenido Dinámico de la Pestaña Activa */}
          <section className="flex-1 min-w-0 w-full">
            {loading ? (
              <div className="bg-white dark:bg-[#0E1626] rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-xs">
                <div className="w-8 h-8 mx-auto mb-3 border-2 border-slate-900 dark:border-amber-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t('Cargando información del usuario...')}
                </p>
              </div>
            ) : (
              <>
                {activeTab === 'guardados' && (
                  <GuardadosPartial
                    guardados={guardados}
                    onRemoveDeseo={handleRemoveDeseo}
                  />
                )}

                {activeTab === 'organizaciones' && (
                  <OrganizacionesPartial
                    organizacionesSeguidas={organizacionesSeguidas}
                    organizacionesDisponibles={organizacionesDisponibles}
                    onFollow={handleFollowOrg}
                    onUnfollow={handleUnfollowOrg}
                  />
                )}

                {activeTab === 'historial' && (
                  <HistorialPartial eventosHistorial={eventosHistorial} />
                )}

                {activeTab === 'entradas' && (
                  <BoletosPartial
                    boletosList={boletosList}
                    onSelectTicket={setTicketModal}
                  />
                )}

                {activeTab === 'seguridad' && (
                  <AjustesPartial
                    usuario={usuario}
                    setUsuario={setUsuario}
                    passwordForm={passwordForm}
                    setPasswordForm={setPasswordForm}
                    isUpdating={isUpdating}
                    isChangingPassword={isChangingPassword}
                    onUpdatePerfil={handleUpdatePerfil}
                    onChangePassword={handleChangePassword}
                  />
                )}
              </>
            )}
          </section>
        </div>
      </main>

      {/* Modal Digital Ticket QR */}
      <ModalTicketQR
        ticket={ticketModal}
        onClose={() => setTicketModal(null)}
      />

      {/* Drawer Lateral Derecho: Editar Perfil */}
      <DrawerEditarPerfil
        isOpen={editModal}
        onClose={() => {
          handleCancelPhoto();
          setEditModal(false);
        }}
        usuario={usuario}
        setUsuario={setUsuario}
        fileInputRef={fileInputRef}
        photoPreview={photoPreview}
        selectedPhotoFile={selectedPhotoFile}
        isUpdating={isUpdating}
        onSubmit={handleUpdatePerfil}
        onPhotoSelect={handlePhotoSelect}
      />

      {/* Componente pre-footer y footer compartido */}
      <CityRhythmPreFooter />
      <Footer />
    </div>
  );
}
