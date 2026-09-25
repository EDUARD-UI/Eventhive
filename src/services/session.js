const TOKEN_KEY = 'eventhive_token';
const REFRESH_TOKEN_KEY = 'eventhive_refresh_token';
const USER_KEY = 'eventhive_user';
const DEV_SESSION_KEY = 'eventhive_dev_session'; // de prueba pára actualizar los paneles de admin/moderador/organizador sin login real

/**
 * El backend nombra el rol de las organizaciones "REPRESENTANTE"
 * (ver ServiceAutenticacion.registrarOrganizacion), pero el resto del
 * frontend (Navbar, rutas protegidas, etc.) fue construido usando
 * "ORGANIZADOR". Se centraliza el mapeo aquí para no repetirlo ni
 * olvidarlo en cada pantalla.
 *
 * Si en el backend existe también un rol "MODERADOR" con ese nombre
 * exacto, no hace falta tocar nada más aquí. Si tu semilla de roles usa
 * otro nombre, agrégalo a este mapa.
 */
const ROLE_MAP = {
  REPRESENTANTE: 'ORGANIZADOR',
};

export const mapRolBackendToFrontend = (rolBackend) => ROLE_MAP[rolBackend] || rolBackend;

export const session = {
  getToken: () => localStorage.getItem(TOKEN_KEY),

  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),

  getUser: () => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  /**
   * Guarda la sesión a partir de la respuesta real de
   * POST /api/auth/login (LoginResponseDTO del backend):
   * { accessToken, refreshToken, tipo, correo, rol }
   */
  save: ({ accessToken, refreshToken, correo, rol, nombre }) => {
    localStorage.removeItem(DEV_SESSION_KEY);  // de prueba pára actualizar los paneles de admin/moderador/organizador sin login real
    localStorage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

    localStorage.setItem(
      USER_KEY,
      JSON.stringify({
        email: correo,
        name: nombre || correo?.split('@')[0] || 'Usuario',
        role: mapRolBackendToFrontend(rol),
      })
    );
  },
// de prueba pára actualizar los paneles de admin/moderador/organizador sin login real
  startDev: (role) => {
    const usersByRole = {
      ADMIN: { email: 'admin@eventhive.local', name: 'Admin de prueba' },
      MODERADOR: { email: 'moderador@eventhive.local', name: 'Moderador de prueba' },
      ORGANIZADOR: { email: 'organizador@eventhive.local', name: 'Organizador de prueba' },
    };
    const user = usersByRole[role];

    if (!user) return;

    localStorage.setItem(TOKEN_KEY, 'dev-session');
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.setItem(USER_KEY, JSON.stringify({ ...user, role }));
    localStorage.setItem(DEV_SESSION_KEY, 'true');
  },

  isDevSession: () => localStorage.getItem(DEV_SESSION_KEY) === 'true',

  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(DEV_SESSION_KEY);  // de prueba pára actualizar los paneles de admin/moderador/organizador sin login real
  },
};

export default session;
