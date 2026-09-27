import { httpClient } from './httpClient.js';
import { session } from './session.js';

export const authService = {
  async login(email, password) {
    const data = await httpClient.post('/auth/login', {
      correo: email,
      clave: password,
    });
    session.save(data);

    // Si la respuesta del backend no incluye el rol directamente, consultamos /auth/me
    if (!data?.rol && !data?.usuario?.rol) {
      try {
        const meData = await httpClient.get('/auth/me');
        if (meData) {
          const enriched = {
            ...data,
            usuario: {
              ...(data?.usuario || {}),
              ...meData,
            },
            rol: meData.rol,
          };
          session.save(enriched);
          return enriched;
        }
      } catch {
        // Si /auth/me no responde, mantenemos la data del login
      }
    }

    return data;
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
