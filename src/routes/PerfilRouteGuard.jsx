import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { session, normalizeRole, getDashboardPathForRole } from '../services/session.js';
import PerfilUsuario from '../pages/PerfilUsuario.jsx';

/**
 * Guard específico para /perfil:
 * Los clientes y operadores comparten el perfil personal; los demás roles regresan a su panel.
 */
export default function PerfilRouteGuard() {
  const navigate = useNavigate();
  const user = session.getUser();
  const token = session.getToken();
  const role = normalizeRole(user?.role);
  const canAccessProfile = role === 'CLIENTE' || role === 'OPERADOR';

  useEffect(() => {
    if (token && role && !canAccessProfile) {
      const targetPath = getDashboardPathForRole(role);
      navigate(targetPath, { replace: true });
    }
  }, [token, role, canAccessProfile, navigate]);

  if (token && role && !canAccessProfile) {
    return null;
  }

  return <PerfilUsuario />;
}
