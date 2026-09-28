import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { session, normalizeRole, getDashboardPathForRole } from '../services/session.js';
import { authService } from '../services/authService.js';

/**
 * Envuelve rutas que requieren sesión iniciada y, opcionalmente,
 * un rol específico (ADMIN, ORGANIZADOR, MODERADOR, CLIENTE).
 *
 * Si el usuario recarga la página (F5) y tiene token pero falta validar
 * o refrescar su rol, consulta /api/auth/me antes de tomar decisiones de navegación.
 */
export default function RutaProtegida({ children, rolesPermitidos }) {
  const location = useLocation();
  const token = session.getToken();
  const [currentUser, setCurrentUser] = useState(() => session.getUser());
  const [verificando, setVerificando] = useState(() => {
    return Boolean(token && (!currentUser || !currentUser.role));
  });

  useEffect(() => {
    let activo = true;

    async function verificarSesion() {
      if (!token) {
        if (activo) setVerificando(false);
        return;
      }

      if (!currentUser?.role && !session.isDevSession()) {
        try {
          const meData = await authService.me();
          if (activo && meData) {
            const userUpdated = session.updateUser({
              ...meData,
              role: meData.rol || meData.role,
            });
            setCurrentUser(userUpdated);
          }
        } catch {
          if (!session.getUser()?.role) {
            session.clear();
            if (activo) setCurrentUser(null);
          }
        } finally {
          if (activo) setVerificando(false);
        }
      } else {
        if (activo) setVerificando(false);
      }
    }

    verificarSesion();

    return () => {
      activo = false;
    };
  }, [token, currentUser?.role]);

  if (verificando) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#007BFF] border-t-transparent" />
          <p className="text-xs font-semibold text-slate-500">Verificando credenciales...</p>
        </div>
      </div>
    );
  }

  // 1. Sin token o sin usuario autenticado: redirigir a Login
  if (!token || !currentUser) {
    return <Navigate to="/iniciosesion" state={{ from: location }} replace />;
  }

  // 2. Si se especifican roles permitidos y el usuario no lo posee:
  if (rolesPermitidos && rolesPermitidos.length > 0) {
    const userRole = normalizeRole(currentUser.role);
    const normalizedPermitidos = rolesPermitidos.map(normalizeRole);

    if (!normalizedPermitidos.includes(userRole)) {
      const redirectPath = getDashboardPathForRole(userRole);
      return <Navigate to={redirectPath} replace />;
    }
  }

  return children;
}
