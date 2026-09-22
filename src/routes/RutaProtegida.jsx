import { Navigate } from 'react-router-dom';
import { session } from '../services/session.js';

/**
 * Envuelve rutas que requieren sesión iniciada y, opcionalmente,
 * un rol específico (ya normalizado por session.js, ej: "ADMIN",
 * "ORGANIZADOR", "CLIENTE", "MODERADOR").
 *
 * Uso:
 *   <Route path="/admin" element={
 *     <RutaProtegida rolesPermitidos={['ADMIN']}>
 *       <AdminPanel />
 *     </RutaProtegida>
 *   } />
 *
 * Importante: esto solo evita que la interfaz se muestre sin sesión.
 * La seguridad real sigue estando en el backend (SecurityConfig +
 * JwtAuthFilter) — este componente es solo para UX, no reemplaza eso.
 */
export default function RutaProtegida({ children, rolesPermitidos }) {
  const token = session.getToken();
  const usuario = session.getUser();

  if (!token || !usuario) {
    return <Navigate to="/iniciosesion" replace />;
  }

  if (rolesPermitidos && !rolesPermitidos.includes(usuario.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
