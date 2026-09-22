import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
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
import PerfilUsuario from '../pages/PerfilUsuario.jsx';
import RutaProtegida from './RutaProtegida.jsx';


export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/eventos/:id" element={<EventDetailPage />} />
        <Route path="/buscar" element={<BuscarEventosPage />} />
        <Route path="/categorias" element={<CategoriasPage />} />
        <Route path="/organizaciones" element={<OrganizadoresPage />} />
        <Route path="/organizadores" element={<Navigate to="/organizaciones" replace />} />

        <Route
          path="/admin"
          element={
            <RutaProtegida rolesPermitidos={['ADMIN']}>
              <AdminPanel />
            </RutaProtegida>
          }
        />
        <Route path="/Admin" element={<Navigate to="/admin" replace />} />

        {/* Verifica en tu tabla de roles que "MODERADOR" sea el nombre
            real (mismo caso que ORGANIZADOR/REPRESENTANTE). */}
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

        <Route path="/iniciosesion" element={<InicioSesion />} />
        <Route path="/registro" element={<Registro />} />

        <Route
          path="/perfil"
          element={
            <RutaProtegida>
              <PerfilUsuario />
            </RutaProtegida>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
