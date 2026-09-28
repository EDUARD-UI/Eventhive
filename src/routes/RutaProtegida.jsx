import { Navigate } from 'react-router-dom';
import { session, normalizeRole } from '../services/session.js';

/**
 * Protege rutas que requieren sesión activa y valida los roles autorizados:
 * ADMINISTRADOR, MODERADOR, REPRESENTANTE, OPERADOR, CLIENTE
 */
export default function RutaProtegida({ children, rolesPermitidos }) {
  const token = session.getToken();
  const usuario = session.getUser();

  if (!token || !usuario) {
    return <Navigate to="/iniciosesion" replace />;
  }

  if (rolesPermitidos && rolesPermitidos.length > 0) {
    const userRole = normalizeRole(usuario.role || usuario.rol);

    const isAuthorized = rolesPermitidos.some((r) => {
      const allowed = normalizeRole(r);
      if (allowed === userRole) return true;
      // Compatibilidad de acceso entre roles de organización
      if (
        (allowed === 'REPRESENTANTE' || allowed === 'OPERADOR') &&
        (userRole === 'REPRESENTANTE' || userRole === 'OPERADOR')
      ) {
        return true;
      }
      return false;
    });

    if (!isAuthorized) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
