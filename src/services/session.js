const TOKEN_KEY = 'eventhive_token';
const REFRESH_TOKEN_KEY = 'eventhive_refresh_token';
const USER_KEY = 'eventhive_user';

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

  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

export default session;
