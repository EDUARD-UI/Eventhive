import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import ScrollToTop from './ScrollToTop.jsx';
import Home from '../pages/Home.jsx';
import EventDetailPage from '../pages/EventDetailPage.jsx';
import BuscarEventosPage from '../pages/BuscarEventosPage.jsx';
import CategoriasPage from '../pages/CategoriasPage.jsx';
import OrganizadoresPage from '../pages/OrganizadoresPage.jsx';
import PerfilOrganizacionPublicoPage from '../pages/PerfilOrganizacionPublicoPage.jsx';
import AdminPanel from '../pages/Administrador/AdminPanel.jsx';
import ModeradorPanel from '../pages/Moderador/ModeradorPanel.jsx';
import OrganizadorIndex from '../pages/Organizador/organizadorIndex.jsx';
import InicioSesion from '../pages/InicioSesion.jsx';
import Registro from '../pages/Registro.jsx';
import PerfilUsuario from '../pages/PerfilUsuario.jsx';
import RutaProtegida from './RutaProtegida.jsx';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Ruta principal */}
        <Route path="/" element={<Home />} />

        {/* Rutas públicas */}
        <Route path="/eventos/:id" element={<EventDetailPage />} />
        <Route path="/evento/:id" element={<EventDetailPage />} />
        <Route path="/buscar" element={<BuscarEventosPage />} />
        <Route path="/categorias" element={<CategoriasPage />} />
        <Route path="/organizaciones" element={<OrganizadoresPage />} />
        <Route path="/organizaciones/:id" element={<PerfilOrganizacionPublicoPage />} />
        <Route path="/organizacion/perfil/:id" element={<PerfilOrganizacionPublicoPage />} />
        <Route path="/organizadores" element={<Navigate to="/organizaciones" replace />} />

        {/* Paneles y rutas protegidas */}
        <Route
          path="/admin"
          element={
            <RutaProtegida rolesPermitidos={['ADMINISTRADOR']}>
              <AdminPanel />
            </RutaProtegida>
          }
        />
        <Route path="/Admin" element={<Navigate to="/admin" replace />} />

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

        {/* Autenticación */}
        <Route path="/iniciosesion" element={<InicioSesion />} />
        <Route path="/registro" element={<Registro />} />

        {/* Perfil */}
        <Route
          path="/perfil"
          element={
            <RutaProtegida>
              <PerfilUsuario />
            </RutaProtegida>
          }
        />

        {/* Fallback de ruta no encontrada: redirige al Home de forma limpia */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

