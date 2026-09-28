const TOKEN_KEY = 'eventhive_token';
const REFRESH_TOKEN_KEY = 'eventhive_refresh_token';
const USER_KEY = 'eventhive_user';
const DEV_SESSION_KEY = 'eventhive_dev_session';

export const normalizeRole = (rawRole) => {
  if (!rawRole) return 'CLIENTE';

  let roleStr = '';

  if (Array.isArray(rawRole)) {
    const first = rawRole[0];
    if (typeof first === 'object' && first !== null) {
      roleStr = first.nombre || first.authority || first.name || first.rol || '';
    } else {
      roleStr = String(first || '');
    }
  } else if (typeof rawRole === 'object' && rawRole !== null) {
    roleStr = rawRole.nombre || rawRole.authority || rawRole.name || rawRole.rol || rawRole.codigo || '';
  } else {
    roleStr = String(rawRole);
  }

  let role = roleStr.toUpperCase().trim();

  if (role.startsWith('ROLE_')) {
    role = role.replace('ROLE_', '');
  }

  // Corregir nombres: ADMINISTRADOR (no ADMIN), REPRESENTANTE (quien entra a la organización, no ORGANIZADOR)
  if (role === 'ADMIN' || role === 'ADMINISTRADOR') return 'ADMINISTRADOR';
  if (
    role === 'ORGANIZADOR' ||
    role === 'REPRESENTANTE' ||
    role === 'ORGANIZACION' ||
    role === 'ORGANIZATION' ||
    role === 'ORGANIZER'
  ) {
    return 'REPRESENTANTE';
  }
  if (role === 'OPERADOR') return 'OPERADOR';
  if (role === 'MODERADOR' || role === 'MODERATOR') return 'MODERADOR';
  if (role === 'CLIENTE' || role === 'USER' || role === 'USUARIO' || role === 'CLIENT') return 'CLIENTE';

  return role || 'CLIENTE';
};

export const mapRolBackendToFrontend = normalizeRole;

export const getDashboardPathForRole = (role) => {
  const normalized = normalizeRole(role);
  switch (normalized) {
    case 'ADMINISTRADOR':
    case 'ADMIN':
      return '/admin';
    case 'REPRESENTANTE':
    case 'OPERADOR':
    case 'ORGANIZADOR':
      return '/organizacion';
    case 'MODERADOR':
      return '/moderador';
    case 'CLIENTE':
    default:
      return '/perfil';
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
        parsed.role = normalizeRole(parsed.role || parsed.rol);
        parsed.rol = parsed.role;
      }
      return parsed;
    } catch {
      return null;
    }
  },

  save: (data = {}) => {
    if (!data || typeof data !== 'object') {
      return null;
    }

    const authToken =
      data.token ||
      data.accessToken ||
      data.jwt ||
      data.tokenAcceso ||
      data.usuario?.token ||
      data.usuario?.accessToken ||
      null;

    const refreshToken =
      data.refreshToken ||
      data.tokenRefresco ||
      data.refresh ||
      data.usuario?.refreshToken ||
      null;

    const existing = session.getUser() || {};
    const usuarioObj = data.usuario || data.user || (data.id ? data : {});

    const email =
      data.correo ||
      usuarioObj.correo ||
      data.email ||
      usuarioObj.email ||
      existing.email ||
      '';

    const name =
      data.nombre ||
      usuarioObj.nombre ||
      data.name ||
      usuarioObj.name ||
      existing.name ||
      (email ? email.split('@')[0] : 'Usuario');

    const rawRole =
      data.rol ||
      data.role ||
      usuarioObj.rol ||
      usuarioObj.role ||
      data.roles ||
      usuarioObj.roles ||
      data.authorities ||
      usuarioObj.authorities ||
      existing.role ||
      'CLIENTE';

    const normalizedRole = normalizeRole(rawRole);

    localStorage.removeItem(DEV_SESSION_KEY);
    if (authToken) {
      localStorage.setItem(TOKEN_KEY, authToken);
    }
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }

    const userData = {
      id: usuarioObj.id || data.id || existing.id || null,
      email,
      name,
      role: normalizedRole,
      rol: normalizedRole,
    };

    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    return userData;
  },

  updateUser: (fields = {}) => {
    const existing = session.getUser() || {};
    const roleToNormalize = fields.role || fields.rol;
    const normalizedRole = roleToNormalize ? normalizeRole(roleToNormalize) : existing.role;
    const updated = {
      ...existing,
      ...fields,
      role: normalizedRole,
      rol: normalizedRole,
    };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    return updated;
  },

  startDev: (role) => {
    const normalized = normalizeRole(role);
    const usersByRole = {
      ADMINISTRADOR: { email: 'admin@eventhive.local', name: 'Administrador Demo' },
      ADMIN: { email: 'admin@eventhive.local', name: 'Administrador Demo' },
      MODERADOR: { email: 'moderador@eventhive.local', name: 'Moderador Demo' },
      REPRESENTANTE: { email: 'organizador@eventhive.local', name: 'Organizador Demo' },
      OPERADOR: { email: 'operador@eventhive.local', name: 'Operador Demo' },
      ORGANIZADOR: { email: 'organizador@eventhive.local', name: 'Organizador Demo' },
      CLIENTE: { email: 'cliente@eventhive.local', name: 'Cliente Demo' },
    };
    const user = usersByRole[normalized] || { email: 'demo@eventhive.local', name: 'Demo' };

    localStorage.setItem(TOKEN_KEY, 'dev-session-token');
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.setItem(USER_KEY, JSON.stringify({ ...user, role: normalized, rol: normalized }));
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
