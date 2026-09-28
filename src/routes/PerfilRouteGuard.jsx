import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { session, normalizeRole, getDashboardPathForRole } from '../services/session.js';
import PerfilUsuario from '../pages/PerfilUsuario.jsx';

/**
 * Guard específico para /perfil:
 * Si quien accede es un ADMINISTRADOR o un ORGANIZADOR, se le redirige inmediatamente
 * a su respectivo panel (/admin o /organizacion).
 * Esta vista de /perfil queda restringida exclusivamente para CLIENTES / USUARIOS compradores.
 */
export default function PerfilRouteGuard() {
  const navigate = useNavigate();
  const user = session.getUser();
  const token = session.getToken();
  const role = normalizeRole(user?.role);

  useEffect(() => {
    if (token && role && role !== 'CLIENTE') {
      const targetPath = getDashboardPathForRole(role);
      navigate(targetPath, { replace: true });
    }
  }, [token, role, navigate]);

  if (token && role && role !== 'CLIENTE') {
    return null;
  }

  return <PerfilUsuario />;
}
