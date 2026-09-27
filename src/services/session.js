const TOKEN_KEY = 'eventhive_token';
const REFRESH_TOKEN_KEY = 'eventhive_refresh_token';
const USER_KEY = 'eventhive_user';
const DEV_SESSION_KEY = 'eventhive_dev_session';

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

  save: (data = {}) => {
    const { accessToken, refreshToken, correo, rol, nombre, usuario } = data;
    const email = correo || usuario?.correo || '';
    const name = nombre || usuario?.nombre || email?.split('@')[0] || 'Usuario';
    const role = rol || usuario?.rol || '';

    localStorage.removeItem(DEV_SESSION_KEY);
    if (accessToken) localStorage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

    localStorage.setItem(
      USER_KEY,
      JSON.stringify({
        email,
        name,
        role: mapRolBackendToFrontend(role),
      })
    );
  },

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
    localStorage.removeItem(DEV_SESSION_KEY);
  },
};

export default session;
