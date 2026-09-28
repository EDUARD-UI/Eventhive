import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import ScrollToTop from './ScrollToTop.jsx';
import Home from '../pages/Home.jsx';
import EventDetailPage from '../pages/EventDetailPage.jsx';
import BuscarEventosPage from '../pages/BuscarEventosPage.jsx';
import CategoriasPage from '../pages/CategoriasPage.jsx';
import OrganizadoresPage from '../pages/OrganizadoresPage.jsx';
import AdminPanel from '../pages/Administrador/AdminPanel.jsx';
import ModeradorPanel from '../pages/Moderador/ModeradorPanel.jsx';
import OrganizadorIndex from '../pages/Organizador/organizadorIndex.jsx';
import InicioSesion from '../pages/InicioSesion.jsx';
import Registro from '../pages/Registro.jsx';
import RutaProtegida from './RutaProtegida.jsx';
import PerfilRouteGuard from './PerfilRouteGuard.jsx';
import { session, normalizeRole, getDashboardPathForRole } from '../services/session.js';

/**
 * Si un Administrador, Organizador o Moderador ingresa a la raíz (/),
 * se le redirige automáticamente a su panel de control para que no navegue
 * en vistas públicas de cliente.
 */
function HomeRoute() {
  const user = session.getUser();
  const token = session.getToken();

  if (token && user?.role) {
    const role = normalizeRole(user.role);
    if (role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (role === 'ORGANIZADOR') return <Navigate to="/organizacion" replace />;
    if (role === 'MODERADOR') return <Navigate to="/moderador" replace />;
  }

  return <Home />;
}

/**
 * Si el usuario ya está autenticado e intenta ir a /iniciosesion o /registro,
 * lo enviamos directamente a su panel correspondiente en vez de pedirle login de nuevo.
 */
function GuestOnlyRoute({ children }) {
  const token = session.getToken();
  const user = session.getUser();

  if (token && user?.role) {
    return <Navigate to={getDashboardPathForRole(user.role)} replace />;
  }

  return children;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Ruta principal: con redirección inteligente si es Admin/Organizador */}
        <Route path="/" element={<HomeRoute />} />

        {/* Rutas públicas */}
        <Route path="/eventos/:id" element={<EventDetailPage />} />
        <Route path="/evento/:id" element={<EventDetailPage />} />
        <Route path="/buscar" element={<BuscarEventosPage />} />
        <Route path="/categorias" element={<CategoriasPage />} />
        <Route path="/organizaciones" element={<OrganizadoresPage />} />
        <Route path="/organizadores" element={<Navigate to="/organizaciones" replace />} />

        {/* Paneles y rutas protegidas estrictas por rol */}
        <Route
          path="/admin"
          element={
            <RutaProtegida rolesPermitidos={['ADMIN']}>
              <AdminPanel />
            </RutaProtegida>
          }
        />
        <Route path="/Admin" element={<Navigate to="/admin" replace />} />
        <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />

        <Route
          path="/moderador"
          element={
            <RutaProtegida rolesPermitidos={['ADMIN', 'MODERADOR']}>
              <ModeradorPanel />
            </RutaProtegida>
          }
        />

        <Route
          path="/organizacion"
          element={
            <RutaProtegida rolesPermitidos={['ORGANIZADOR']}>
              <OrganizadorIndex />
            </RutaProtegida>
          }
        />
        <Route path="/organizador" element={<Navigate to="/organizacion" replace />} />
        <Route path="/organization" element={<Navigate to="/organizacion" replace />} />

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

        {/* Fallback de ruta no encontrada: redirige al Home de forma limpia */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
