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
      roleStr = first.nombre || first.authority || first.name || first.rol || first.rolNombre || '';
    } else {
      roleStr = String(first || '');
    }
  } else if (typeof rawRole === 'object' && rawRole !== null) {
    roleStr = rawRole.nombre || rawRole.authority || rawRole.name || rawRole.rol || rawRole.rolNombre || rawRole.codigo || '';
  } else {
    roleStr = String(rawRole);
  }

  let role = roleStr.toUpperCase().trim();

  if (role.startsWith('ROLE_')) {
    role = role.replace('ROLE_', '');
  }

  // Corregir nombres: ADMINISTRADOR (no ADMIN), REPRESENTANTE (quien entra a la organización, no ORGANIZADOR)
  if (role === 'ADMIN' || role === 'ADMINISTRADOR') return 'ADMINISTRADOR';
  if (role === 'REPRESENTANTE' || role === 'ORGANIZADOR' || role === 'REPRESENTANTE_ORGANIZACION' || role === 'ORGANIZATION') return 'REPRESENTANTE';
  if (role === 'OPERADOR') return 'OPERADOR';
  if (role === 'MODERADOR' || role === 'MODERATOR') return 'MODERADOR';
  if (role === 'MARKETING') return 'MARKETING';
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
    case 'MARKETING':
      return '/marketing';
    case 'REPRESENTANTE':
    case 'ORGANIZADOR':
      return '/organizacion';
    case 'OPERADOR':
      return '/';
    case 'MODERADOR':
      return '/moderador';
    case 'CLIENTE':
    default:
      return '/perfil';
  }
};

export const parseJwtPayload = (token) => {
  try {
    if (!token || typeof token !== 'string') return null;
    const clean = token.replace(/^Bearer\s+/i, '').replace(/^["']|["']$/g, '').trim();
    const parts = clean.split('.');
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const isTokenExpired = (token, thresholdSeconds = 15) => {
  if (!token) return true;
  if (token === 'dev-session-token') return false;
  const payload = parseJwtPayload(token);
  if (!payload || !payload.exp) return false;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now + thresholdSeconds;
};

export const extractPhotoUrl = (obj) => {
  if (!obj) return null;
  if (typeof obj === 'string') {
    const trimmed = obj.trim();
    return trimmed.startsWith('http') || trimmed.startsWith('data:image/') || trimmed.startsWith('/')
      ? trimmed
      : null;
  }
  if (typeof obj !== 'object') return null;
  const candidate =
    obj.urlImagenPerfil ||
    obj.imagenPerfil ||
    obj.fotoUrl ||
    obj.foto ||
    obj.imagenUrl ||
    obj.imagen ||
    obj.avatarUrl ||
    obj.avatar ||
    obj.urlLogo ||
    obj.logo ||
    obj.url ||
    (obj.data ? extractPhotoUrl(obj.data) : null) ||
    (obj.usuario ? extractPhotoUrl(obj.usuario) : null) ||
    null;

  return typeof candidate === 'string' && candidate.trim() ? candidate.trim() : null;
};

export const session = {
  getToken: () => {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const clean = String(raw).replace(/^Bearer\s+/i, '').replace(/^["']|["']$/g, '').trim();
    return clean || null;
  },

  getRefreshToken: () => {
    const raw = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!raw) return null;
    const clean = String(raw).replace(/^Bearer\s+/i, '').replace(/^["']|["']$/g, '').trim();
    return clean || null;
  },

  isExpired: () => {
    const token = session.getToken();
    return isTokenExpired(token);
  },

  getUser: () => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      if (parsed) {
        parsed.role = normalizeRole(parsed.role || parsed.rol);
        parsed.rol = parsed.role;
        const photo = extractPhotoUrl(parsed);
        if (photo) {
          parsed.urlImagenPerfil = photo;
          parsed.imagenPerfil = photo;
          parsed.fotoUrl = photo;
          parsed.foto = photo;
          parsed.avatar = photo;
        }
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

    const incomingEmail =
      data.correo ||
      usuarioObj.correo ||
      data.email ||
      usuarioObj.email ||
      '';

    const isSameUser =
      !incomingEmail ||
      !existing.email ||
      incomingEmail.toLowerCase().trim() === existing.email.toLowerCase().trim();

    const safeExisting = isSameUser ? existing : {};

    const email = incomingEmail || safeExisting.email || '';

    const name =
      data.nombre ||
      usuarioObj.nombre ||
      data.name ||
      usuarioObj.name ||
      safeExisting.name ||
      (email ? email.split('@')[0] : 'Usuario');

    const rawRole =
      data.rol ||
      data.role ||
      data.rolNombre ||
      usuarioObj.rol ||
      usuarioObj.role ||
      usuarioObj.rolNombre ||
      data.roles ||
      usuarioObj.roles ||
      data.authorities ||
      usuarioObj.authorities ||
      safeExisting.role ||
      'CLIENTE';

    const normalizedRole = normalizeRole(rawRole);

    localStorage.removeItem(DEV_SESSION_KEY);
    if (authToken) {
      const cleanToken = String(authToken).replace(/^Bearer\s+/i, '').replace(/^["']|["']$/g, '').trim();
      localStorage.setItem(TOKEN_KEY, cleanToken);
    }
    if (refreshToken) {
      const cleanRefresh = String(refreshToken).replace(/^Bearer\s+/i, '').replace(/^["']|["']$/g, '').trim();
      localStorage.setItem(REFRESH_TOKEN_KEY, cleanRefresh);
    }

    const fotoUrl =
      extractPhotoUrl(data) ||
      extractPhotoUrl(usuarioObj) ||
      extractPhotoUrl(safeExisting) ||
      null;

    const userData = {
      ...safeExisting,
      id: usuarioObj.id || data.id || safeExisting.id || null,
      email,
      name,
      nombre: name,
      role: normalizedRole,
      rol: normalizedRole,
      rolNombre: normalizedRole,
      fotoUrl,
      foto: fotoUrl,
      urlImagenPerfil: fotoUrl,
      imagenPerfil: fotoUrl,
      avatar: fotoUrl,
    };

    // Si la sesión cambia a otro usuario, limpiar cachés locales de compras/boletos anteriores
    try {
      const prevUser = safeExisting;
      const newId = usuarioObj.id || data.id || null;
      const newEmail = email || null;
      const isDifferentUser =
        (prevUser?.id && newId && String(prevUser.id) !== String(newId)) ||
        (prevUser?.email && newEmail && prevUser.email.toLowerCase() !== newEmail.toLowerCase());

      if (isDifferentUser) {
        localStorage.removeItem('eventhive_local_compras');
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && key.startsWith('eventhive_local_compras')) {
            localStorage.removeItem(key);
          }
        }
      }
    } catch {}

    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    try {
      window.dispatchEvent(new CustomEvent('eventhive_session_updated', { detail: userData }));
    } catch {}
    return userData;
  },

  updateUser: (fields = {}) => {
    const existing = session.getUser() || {};
    const roleToNormalize = fields.role || fields.rol || fields.rolNombre;
    const normalizedRole = roleToNormalize ? normalizeRole(roleToNormalize) : existing.role;
    const fotoUrl = extractPhotoUrl(fields) || extractPhotoUrl(existing) || null;
    const resolvedName = fields.name || fields.nombre || existing.name || existing.nombre || 'Usuario';

    const updated = {
      ...existing,
      ...fields,
      name: resolvedName,
      nombre: resolvedName,
      role: normalizedRole,
      rol: normalizedRole,
      rolNombre: normalizedRole,
      fotoUrl,
      foto: fotoUrl,
      urlImagenPerfil: fotoUrl,
      imagenPerfil: fotoUrl,
      avatar: fotoUrl,
    };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    try {
      window.dispatchEvent(new CustomEvent('eventhive_session_updated', { detail: updated }));
    } catch {}
    return updated;
  },

  startDev: (role) => {
    const normalized = normalizeRole(role);
    const usersByRole = {
      ADMINISTRADOR: { email: 'admin@eventhive.local', name: 'Administrador Demo' },
      ADMIN: { email: 'admin@eventhive.local', name: 'Administrador Demo' },
      MODERADOR: { email: 'moderador@eventhive.local', name: 'Moderador Demo' },
      MARKETING: { email: 'marketing@eventhive.local', name: 'Marketing Demo' },
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
    try {
      // Limpiar cachés locales de compras y boletos para evitar filtraciones entre cuentas
      localStorage.removeItem('eventhive_local_compras');
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith('eventhive_local_compras')) {
          localStorage.removeItem(key);
        }
      }
    } catch {}
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(DEV_SESSION_KEY);
  },
};

export default session;
