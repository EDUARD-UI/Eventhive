import { httpClient } from './httpClient.js';

export const userService = {
  /** GET /api/usuarios/perfil */
  getPerfil() {
    return httpClient.get('/usuarios/perfil');
  },

  /** PUT /api/usuarios/perfil — body: { nombre, telefono } */
  updatePerfil(data) {
    return httpClient.put('/usuarios/perfil', {
      nombre: data.nombre,
      telefono: data.telefono,
    });
  },

  /** PUT /api/usuarios/perfil/cambiar-clave */
  changePassword(claveActual, claveNueva) {
    return httpClient.put('/usuarios/perfil/cambiar-clave', {
      claveActual,
      claveNueva,
    });
  },

  /** GET /api/usuarios — list paginated users */
  listUsers({ page = 0, size = 10 } = {}) {
    return httpClient.get('/usuarios', { page, size });
  },

  /** GET /api/usuarios/buscar — search users */
  searchUsers({ nombre, rolId, page = 0, size = 10 } = {}) {
    return httpClient.get('/usuarios/buscar', { nombre, rolId, page, size });
  },

  /** DELETE /api/usuarios/{id} */
  deleteUser(id) {
    return httpClient.delete(`/usuarios/${id}`);
  },
};

export default userService;
