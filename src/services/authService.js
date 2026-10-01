import { httpClient } from './httpClient.js';
import { session } from './session.js';

const parseJwtPayload = (token) => {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
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

export const authService = {
  async login(email, password) {
    const data = await httpClient.post('/auth/login', {
      correo: email,
      clave: password,
    });

    // 1. Guardar tokens iniciales y usuario base
    session.save(data);

    // 2. Extraer rol disponible o consultar /auth/me inmediatamente
    let detectedRole =
      data?.rol ||
      data?.role ||
      data?.rolNombre ||
      data?.usuario?.rol ||
      data?.usuario?.role ||
      data?.usuario?.rolNombre;

    // Si aún no tenemos rol, consultar el endpoint oficial /api/auth/me
    if (!detectedRole) {
      try {
        const meData = await httpClient.get('/auth/me');
        if (meData?.rol || meData?.role || meData?.rolNombre) {
          detectedRole = meData.rol || meData.role || meData.rolNombre;
          session.updateUser({
            ...meData,
            role: detectedRole,
          });
          return {
            ...data,
            usuario: {
              ...(data?.usuario || {}),
              ...meData,
            },
            rol: detectedRole,
            role: detectedRole,
            rolNombre: detectedRole,
          };
        }
      } catch {
        // Fallback: intentar inspeccionar claims del accessToken
        const jwtData = parseJwtPayload(data?.accessToken);
        if (jwtData) {
          const jwtRole =
            jwtData.rol ||
            jwtData.role ||
            jwtData.rolNombre ||
            (Array.isArray(jwtData.authorities) ? jwtData.authorities[0] : null) ||
            (Array.isArray(jwtData.roles) ? jwtData.roles[0] : null);
          if (jwtRole) {
            detectedRole = jwtRole;
            session.updateUser({ role: detectedRole });
          }
        }
      }
    } else {
      session.updateUser({ role: detectedRole });
    }

    return {
      ...data,
      rol: detectedRole,
      role: detectedRole,
      rolNombre: detectedRole,
    };
  },

  async registrarCliente(nombreOrData, email, telefono, password) {
    let payload;
    let loginEmail;
    let loginPassword;

    if (typeof nombreOrData === 'object' && nombreOrData !== null) {
      payload = {
        nombre: nombreOrData.nombre,
        correo: nombreOrData.correo || nombreOrData.email,
        telefono: nombreOrData.telefono || nombreOrData.phone,
        clave: nombreOrData.clave || nombreOrData.password,
      };
      loginEmail = payload.correo;
      loginPassword = payload.clave;
    } else {
      payload = {
        nombre: nombreOrData,
        correo: email,
        telefono,
        clave: password,
      };
      loginEmail = email;
      loginPassword = password;
    }

    await httpClient.post('/auth/registrar-cliente', payload);
    return authService.login(loginEmail, loginPassword);
  },

  async registrarOrganizacion(data) {
    const payload = {
      nombreCompleto: data.nombreCompleto || data.nombre,
      correoUsuario: data.correoUsuario || data.correo || data.email,
      password: data.password || data.clave,
      razonSocial: data.razonSocial || data.orgName,
      nit: data.nit,
      correoEmpresarial: data.correoEmpresarial,
    };

    await httpClient.post('/auth/registro-organizador', payload);
    return authService.login(payload.correoUsuario, payload.password);
  },

  async me() {
    return httpClient.get('/auth/me');
  },

  async logout() {
    try {
      await httpClient.post('/auth/logout');
    } catch {
      // Ignore server errors — always clear local session
    }
    session.clear();
  },
};

export default authService;
