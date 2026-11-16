import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import ScrollToTop from './ScrollToTop.jsx';
import Home from '../pages/Home.jsx';
import RutaProtegida from './RutaProtegida.jsx';
import { session, normalizeRole, getDashboardPathForRole, isTokenExpired } from '../services/session.js';

// Lazy loading de rutas públicas secundarias y formularios
const EventDetailPage = lazy(() => import('../pages/EventDetailPage.jsx'));
const BuscarEventosPage = lazy(() => import('../pages/BuscarEventosPage.jsx'));
const OrganizadoresPage = lazy(() => import('../pages/OrganizadoresPage.jsx'));
const PerfilOrganizacionPublicoPage = lazy(() => import('../pages/PerfilOrganizacionPublicoPage.jsx'));
const InicioSesion = lazy(() => import('../pages/InicioSesion.jsx'));
const Registro = lazy(() => import('../pages/Registro.jsx'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage.jsx'));

// Lazy loading de paneles y rutas especializadas
const AdminPanel = lazy(() => import('../pages/Administrador/AdminPanel.jsx'));
const ModeradorPanel = lazy(() => import('../pages/Moderador/ModeradorPanel.jsx'));
const OrganizadorIndex = lazy(() => import('../pages/Organizador/organizadorIndex.jsx'));
const MarketingPanel = lazy(() => import('../pages/Marketing/MarketingPanel.jsx'));
const PerfilRouteGuard = lazy(() => import('./PerfilRouteGuard.jsx'));
const PasarelaPagoPage = lazy(() => import('../pages/PasarelaPagoPage.jsx'));
const AcercaDe = lazy(() => import('../pages/SobreNosotros/AcercaDe.jsx'));
const Privacidad = lazy(() => import('../pages/SobreNosotros/Privacidad.jsx'));
const Terminos = lazy(() => import('../pages/SobreNosotros/Terminos.jsx'));
const Contacto = lazy(() => import('../pages/SobreNosotros/Contacto.jsx'));
const RecuperarContrasenaPage = lazy(() => import('../pages/RecuperarContrasenaPage.jsx'));
const AceptarInvitacionPage = lazy(() => import('../pages/AceptarInvitacionPage.jsx'));

/**
 * Fallback limpio y sutil mientras carga un chunk diferido
 */
function RouteLoadingFallback() {
  return (
    <div className="w-full min-h-[60vh] flex items-center justify-center">
      <div className="w-7 h-7 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
    </div>
  );
}

/**
 * Si el usuario ya está autenticado e intenta ir a /iniciosesion o /registro,
 * lo enviamos directamente a su panel correspondiente (o home para cliente).
 */
function GuestOnlyRoute({ children }) {
  const token = session.getToken();
  const user = session.getUser();

  if (token && isTokenExpired(token) && !session.isDevSession()) {
    session.clear();
    return children;
  }

  if (token && user?.role) {
    const role = normalizeRole(user.role);
    if (role === 'CLIENTE' || role === 'OPERADOR') {
      return <Navigate to={role === 'OPERADOR' ? '/perfil' : '/'} replace />;
    }
    return <Navigate to={getDashboardPathForRole(user.role)} replace />;
  }

  return children;
}

export default function AppRouter() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ScrollToTop />
      <Suspense fallback={<RouteLoadingFallback />}>
        <Routes>
          {/* Ruta principal: visible para todos los usuarios, incluidos los roles con dashboard */}
          <Route path="/" element={<Home />} />

          {/* Rutas públicas */}
          <Route path="/eventos/:id" element={<EventDetailPage />} />
          <Route path="/evento/:id" element={<EventDetailPage />} />
          <Route path="/buscar" element={<BuscarEventosPage />} />
          <Route path="/categorias" element={<Navigate to="/buscar" replace />} />
          <Route path="/organizaciones" element={<OrganizadoresPage />} />
          <Route path="/organizaciones/:id" element={<PerfilOrganizacionPublicoPage />} />
          <Route path="/organizacion/perfil/:id" element={<PerfilOrganizacionPublicoPage />} />
          <Route path="/organizadores" element={<Navigate to="/organizaciones" replace />} />

          {/* Rutas de Nosotros */}
          <Route path="/acerca-de" element={<AcercaDe />} />
          <Route path="/sobre-nosotros" element={<AcercaDe />} />
          <Route path="/sobrenosotros" element={<AcercaDe />} />
          <Route path="/privacidad" element={<Privacidad />} />
          <Route path="/terminos" element={<Terminos />} />
          <Route path="/contacto" element={<Contacto />} />

          {/* Paneles y rutas protegidas estrictas por rol */}
          <Route
            path="/admin"
            element={
              <RutaProtegida rolesPermitidos={['ADMINISTRADOR']}>
                <AdminPanel />
              </RutaProtegida>
            }
          />
          <Route path="/Admin" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />

          <Route
            path="/moderador"
            element={
              <RutaProtegida rolesPermitidos={['ADMINISTRADOR', 'MODERADOR']}>
                <ModeradorPanel />
              </RutaProtegida>
            }
          />
          <Route path="/Moderador" element={<Navigate to="/moderador" replace />} />
          <Route path="/moderador/dashboard" element={<Navigate to="/moderador" replace />} />

          <Route
            path="/organizacion"
            element={
              <RutaProtegida rolesPermitidos={['REPRESENTANTE']}>
                <OrganizadorIndex />
              </RutaProtegida>
            }
          />
          <Route path="/organizador" element={<Navigate to="/organizacion" replace />} />
          <Route path="/organization" element={<Navigate to="/organizacion" replace />} />
          <Route path="/organizador/dashboard" element={<Navigate to="/organizacion" replace />} />
          <Route path="/organizacion/dashboard" element={<Navigate to="/organizacion" replace />} />

          <Route
            path="/marketing"
            element={
              <RutaProtegida rolesPermitidos={['MARKETING', 'ADMINISTRADOR']}>
                <MarketingPanel />
              </RutaProtegida>
            }
          />
          <Route path="/Marketing" element={<Navigate to="/marketing" replace />} />
          <Route path="/marketing/dashboard" element={<Navigate to="/marketing" replace />} />

          {/* Autenticación protegida para usuarios ya logueados */}
          <Route
            path="/iniciosesion"
            element={
              <GuestOnlyRoute>
                <InicioSesion />
              </GuestOnlyRoute>
            }
          />
          <Route path="/login" element={<Navigate to="/iniciosesion" replace />} />
          <Route path="/iniciar-sesion" element={<Navigate to="/iniciosesion" replace />} />
          <Route
            path="/registro"
            element={
              <GuestOnlyRoute>
                <Registro />
              </GuestOnlyRoute>
            }
          />
          <Route path="/register" element={<Navigate to="/registro" replace />} />

          {/* Perfil personal compartido por clientes y operadores */}
          <Route
            path="/perfil"
            element={
              <RutaProtegida>
                <PerfilRouteGuard />
              </RutaProtegida>
            }
          />

          {/* Pasarela de Pago Minimalista (Interfaz nueva dedicada) */}
          <Route
            path="/pago/:id"
            element={
              <RutaProtegida>
                <PasarelaPagoPage />
              </RutaProtegida>
            }
          />
          <Route
            path="/pago"
            element={
              <RutaProtegida>
                <PasarelaPagoPage />
              </RutaProtegida>
            }
          />
          <Route
            path="/checkout/:id"
            element={
              <RutaProtegida>
                <PasarelaPagoPage />
              </RutaProtegida>
            }
          />
          <Route
            path="/checkout"
            element={
              <RutaProtegida>
                <PasarelaPagoPage />
              </RutaProtegida>
            }
          />

          <Route
            path="/recuperar-contrasena"
            element={
              <GuestOnlyRoute>
                <RecuperarContrasenaPage />
              </GuestOnlyRoute>
            }
          />
          <Route path="/olvide-contrasena" element={<Navigate to="/recuperar-contrasena" replace />} />
          <Route path="/restablecer-contrasena" element={<RecuperarContrasenaPage />} />
          <Route path="/aceptar-invitacion" element={<AceptarInvitacionPage />} />

          {/* Fallback de ruta no encontrada: página 404 personalizada */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
