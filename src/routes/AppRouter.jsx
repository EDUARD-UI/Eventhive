import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import ScrollToTop from './ScrollToTop.jsx';
import Home from '../pages/Home.jsx';
import EventDetailPage from '../pages/EventDetailPage.jsx';
import BuscarEventosPage from '../pages/BuscarEventosPage.jsx';
import OrganizadoresPage from '../pages/OrganizadoresPage.jsx';
import PerfilOrganizacionPublicoPage from '../pages/PerfilOrganizacionPublicoPage.jsx';
import AdminPanel from '../pages/Administrador/AdminPanel.jsx';
import ModeradorPanel from '../pages/Moderador/ModeradorPanel.jsx';
import OrganizadorIndex from '../pages/Organizador/organizadorIndex.jsx';
import MarketingPanel from '../pages/Marketing/MarketingPanel.jsx';
import InicioSesion from '../pages/InicioSesion.jsx';
import Registro from '../pages/Registro.jsx';
import RutaProtegida from './RutaProtegida.jsx';
import PerfilRouteGuard from './PerfilRouteGuard.jsx';
import PasarelaPagoPage from '../pages/PasarelaPagoPage.jsx';
import { session, normalizeRole, getDashboardPathForRole } from '../services/session.js';
import AcercaDe from '../pages/SobreNosotros/AcercaDe.jsx';
import Privacidad from '../pages/SobreNosotros/Privacidad.jsx';
import Terminos from '../pages/SobreNosotros/Terminos.jsx';
import Contacto from '../pages/SobreNosotros/Contacto.jsx';

/**
 * Si el usuario ya está autenticado e intenta ir a /iniciosesion o /registro,
 * lo enviamos directamente a su panel correspondiente (o home para cliente).
 */
function GuestOnlyRoute({ children }) {
  const token = session.getToken();
  const user = session.getUser();

  if (token && user?.role) {
    const role = normalizeRole(user.role);
    if (role === 'CLIENTE') {
      return <Navigate to="/" replace />;
    }
    return <Navigate to={getDashboardPathForRole(user.role)} replace />;
  }

  return children;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
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

        <Route
          path="/organizacion"
          element={
            <RutaProtegida rolesPermitidos={['REPRESENTANTE', 'OPERADOR']}>
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
        <Route
          path="/registro"
          element={
            <GuestOnlyRoute>
              <Registro />
            </GuestOnlyRoute>
          }
        />

        {/* Perfil exclusivo de clientes compradores (si entra un Admin u Organizador, es redirigido a su panel) */}
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

        {/* Fallback de ruta no encontrada: redirige al Home de forma limpia */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
