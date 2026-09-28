const TOKEN_KEY = 'eventhive_token';
const REFRESH_TOKEN_KEY = 'eventhive_refresh_token';
const USER_KEY = 'eventhive_user';
const DEV_SESSION_KEY = 'eventhive_dev_session';

export const normalizeRole = (role) => {
  if (!role || typeof role !== 'string') return '';
  const r = role.trim().toUpperCase();

  if (r === 'ADMIN' || r === 'ADMINISTRADOR' || r === 'ROLE_ADMIN' || r === 'ROLE_ADMINISTRADOR') {
    return 'ADMIN';
  }
  if (
    r === 'REPRESENTANTE' ||
    r === 'ORGANIZADOR' ||
    r === 'ORGANIZACION' ||
    r === 'ORGANIZATION' ||
    r === 'ORGANIZER' ||
    r === 'ROLE_ORGANIZADOR' ||
    r === 'ROLE_REPRESENTANTE'
  ) {
    return 'ORGANIZADOR';
  }
  if (r === 'MODERADOR' || r === 'MODERATOR' || r === 'ROLE_MODERADOR') {
    return 'MODERADOR';
  }
  if (r === 'CLIENTE' || r === 'CLIENT' || r === 'USUARIO' || r === 'USER' || r === 'ROLE_CLIENTE') {
    return 'CLIENTE';
  }

  return r;
};

export const mapRolBackendToFrontend = normalizeRole;

export const getDashboardPathForRole = (role) => {
  const normalized = normalizeRole(role);
  switch (normalized) {
    case 'ADMIN':
      return '/admin';
    case 'ORGANIZADOR':
      return '/organizacion';
    case 'MODERADOR':
      return '/moderador';
    case 'CLIENTE':
    default:
      return '/';
  }
};

export const session = {
  getToken: () => localStorage.getItem(TOKEN_KEY),

  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),

  getUser: () => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      if (parsed) {
        parsed.role = normalizeRole(parsed.role);
      }
      return parsed;
    } catch {
      return null;
    }
  },

  save: (data = {}) => {
    const { accessToken, refreshToken, correo, rol, role, nombre, usuario } = data;
    const existing = session.getUser() || {};

    const rawRole = rol || role || usuario?.rol || usuario?.role || existing.role || '';
    const normalizedRole = normalizeRole(rawRole);

    const email = correo || usuario?.correo || usuario?.email || existing.email || '';
    const name = nombre || usuario?.nombre || usuario?.name || existing.name || email?.split('@')[0] || 'Usuario';

    localStorage.removeItem(DEV_SESSION_KEY);
    if (accessToken) localStorage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

    const userPayload = {
      id: usuario?.id || data?.id || existing.id,
      email,
      name,
      role: normalizedRole,
    };

    localStorage.setItem(USER_KEY, JSON.stringify(userPayload));
    return userPayload;
  },

  updateUser: (fields = {}) => {
    const existing = session.getUser() || {};
    const updated = {
      ...existing,
      ...fields,
      role: fields.role ? normalizeRole(fields.role) : existing.role,
    };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    return updated;
  },

  startDev: (role) => {
    const normalized = normalizeRole(role);
    const usersByRole = {
      ADMIN: { email: 'admin@eventhive.local', name: 'Administrador Demo' },
      MODERADOR: { email: 'moderador@eventhive.local', name: 'Moderador Demo' },
      ORGANIZADOR: { email: 'organizador@eventhive.local', name: 'Organizador Demo' },
      CLIENTE: { email: 'cliente@eventhive.local', name: 'Cliente Demo' },
    };
    const user = usersByRole[normalized] || { email: 'demo@eventhive.local', name: 'Demo' };

    localStorage.setItem(TOKEN_KEY, 'dev-session-token');
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.setItem(USER_KEY, JSON.stringify({ ...user, role: normalized }));
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
