const TOKEN_KEY = 'eventhive_token';
const REFRESH_TOKEN_KEY = 'eventhive_refresh_token';
const USER_KEY = 'eventhive_user';

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
  if (role === 'ORGANIZADOR' || role === 'REPRESENTANTE') return 'REPRESENTANTE';
  if (role === 'MODERADOR') return 'MODERADOR';
  if (role === 'OPERADOR') return 'OPERADOR';
  if (role === 'CLIENTE' || role === 'USER' || role === 'USUARIO') return 'CLIENTE';

  return role || 'CLIENTE';
};

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
    if (!data || typeof data !== 'object') {
      return null;
    }

    // Extraer token de todas las posibles variantes que pueda emitir el backend
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

    const usuarioObj = data.usuario || data.user || (data.id ? data : {});
    const email = data.correo || usuarioObj.correo || data.email || usuarioObj.email || '';
    const name =
      data.nombre ||
      usuarioObj.nombre ||
      data.name ||
      usuarioObj.name ||
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
      'CLIENTE';

    const normalizedRole = normalizeRole(rawRole);

    if (authToken) {
      localStorage.setItem(TOKEN_KEY, authToken);
    }
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }

    const userData = {
      id: data.id || usuarioObj.id || null,
      email,
      name,
      role: normalizedRole,
      rol: normalizedRole,
    };

    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    return userData;
  },

  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

export default session;
