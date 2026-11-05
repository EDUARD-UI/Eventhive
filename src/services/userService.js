import { httpClient } from './httpClient.js';
import { session, extractPhotoUrl } from './session.js';

export const readFileAsDataUrl = (file) =>
  new Promise((resolve) => {
    if (!file || typeof FileReader === 'undefined') {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });

export const userService = {
  /** GET /api/usuarios/perfil */
  async getPerfil() {
    const perfil = await httpClient.get('/usuarios/perfil');
    if (perfil && typeof perfil === 'object') {
      const photo = extractPhotoUrl(perfil);
      const nombre = perfil.nombre || perfil.name;
      const updates = {};
      if (nombre) {
        updates.name = nombre;
        updates.nombre = nombre;
      }
      if (perfil.correo || perfil.email) {
        updates.email = perfil.correo || perfil.email;
      }
      if (perfil.telefono) {
        updates.telefono = perfil.telefono;
      }
      if (photo) {
        updates.urlImagenPerfil = photo;
        updates.imagenPerfil = photo;
        updates.fotoUrl = photo;
        updates.foto = photo;
        updates.avatar = photo;
        perfil.urlImagenPerfil = photo;
        perfil.imagenPerfil = photo;
        perfil.fotoUrl = photo;
        perfil.foto = photo;
      }
      if (Object.keys(updates).length > 0) {
        session.updateUser(updates);
      }
    }
    return perfil;
  },

  /** PUT /api/usuarios/perfil — body: { nombre, telefono } */
  async updatePerfil(data) {
    const res = await httpClient.put('/usuarios/perfil', {
      nombre: data.nombre,
      telefono: data.telefono,
    });
    if (data?.nombre) {
      session.updateUser({
        name: data.nombre,
        nombre: data.nombre,
        ...(data.telefono !== undefined ? { telefono: data.telefono } : {}),
      });
    }
    return res;
  },

  /** PUT /api/usuarios/perfil/imagen — multipart/form-data with part 'imagen' */
  async uploadFotoPerfil(file) {
    const formData = new FormData();
    formData.append('imagen', file);

    const [res, dataUrlFallback] = await Promise.all([
      httpClient.put('/usuarios/perfil/imagen', formData, { isFormData: true }),
      readFileAsDataUrl(file),
    ]);

    let finalUrl = extractPhotoUrl(res);

    if (!finalUrl) {
      try {
        const freshPerfil = await httpClient.get('/usuarios/perfil');
        finalUrl = extractPhotoUrl(freshPerfil);
      } catch {
        // fallback to dataUrlFallback
      }
    }

    finalUrl = finalUrl || dataUrlFallback;

    if (finalUrl) {
      session.updateUser({
        urlImagenPerfil: finalUrl,
        imagenPerfil: finalUrl,
        fotoUrl: finalUrl,
        foto: finalUrl,
        avatar: finalUrl,
      });
    }

    return {
      ...(typeof res === 'object' && res !== null ? res : {}),
      urlImagenPerfil: finalUrl,
      imagenPerfil: finalUrl,
      fotoUrl: finalUrl,
      foto: finalUrl,
      imagenUrl: finalUrl,
      url: finalUrl,
    };
  },

  /** PUT /api/usuarios/perfil/cambiar-clave */
  changePassword(claveActual, claveNueva) {
    return httpClient.put('/usuarios/perfil/cambiar-clave', {
      claveActual,
      claveNueva,
    });
  },

  /** GET /api/usuarios/perfil/actividad — buyer activity for any authenticated user */
  getActividad() {
    return httpClient.get('/usuarios/perfil/actividad');
  },

  /** GET /api/compras — user's purchases (paginated) */
  getCompras({ page = 0, size = 10 } = {}) {
    return httpClient.get('/compras', { page, size });
  },

  /** GET /api/deseos — user's wishlist / favorites (paginated) */
  getDeseos({ page = 0, size = 10 } = {}) {
    return httpClient.get('/deseos', { page, size });
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
