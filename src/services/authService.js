import { httpClient } from './httpClient.js';
import { session } from './session.js';

export const authService = {
  /**
   * POST /api/auth/login
   * El backend espera { correo, clave } (no { email, password }).
   * Devuelve LoginResponseDTO: { accessToken, refreshToken, tipo, correo, rol }
   */
  async login(email, password) {
    const data = await httpClient.post('/auth/login', {
      correo: email,
      clave: password,
    });
    session.save(data);
    return data;
  },

  /**
   * POST /api/auth/registrar-cliente
   * El backend exige teléfono para TODOS los registros (cliente u
   * organización), aunque el formulario original solo lo pedía para
   * organizadores. Tras registrar, se hace login automático para
   * mantener la UX original (el usuario queda con sesión iniciada).
   */
  async registrarCliente(nombre, email, telefono, password) {
    await httpClient.post('/auth/registrar-cliente', {
      nombre,
      correo: email,
      telefono,
      clave: password,
    });
    return authService.login(email, password);
  },

  /**
   * POST /api/auth/registrar-organizacion
   * Asigna internamente el rol "REPRESENTANTE" (ver session.js para el
   * mapeo hacia "ORGANIZADOR" que usa el resto del frontend).
   */
  async registrarOrganizacion(nombre, email, telefono, password) {
    await httpClient.post('/auth/registrar-organizacion', {
      nombre,
      correo: email,
      telefono,
      clave: password,
    });
    return authService.login(email, password);
  },

  /** GET /api/auth/me */
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
