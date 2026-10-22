# 📘 Guía de Integración Backend-Frontend: EventHive

Esta guía describe cómo el equipo de Frontend debe consumir e implementar los flujos de **invitaciones de roles**, **envío de correos**, **gestión de operadores y permisos**, **manejo de respuestas y errores HTTP**, y **planes de marketing**.

---

## 📑 Tabla de Contenidos

1. [Principios Clave de Seguridad y Arquitectura](#1-principios-clave-de-seguridad-y-arquitectura)
2. [Flujo 1: Invitaciones Administrativas (Panel de Administrador)](#2-flujo-1-invitaciones-administrativas-panel-de-administrador)
3. [Flujo 2: Envíos de Correo Administrativos (Sin Asignación de Rol)](#3-flujo-2-envíos-de-correo-administrativos-sin-asignación-de-rol)
4. [Flujo 3: Invitaciones de Organizaciones (Panel de Representante)](#4-flujo-3-invitaciones-de-organizaciones-panel-de-representante)
5. [Flujo 4: Aceptación de la Invitación (Flujo del Usuario Invitado)](#5-flujo-4-aceptación-de-la-invitación-flujo-del-usuario-invitado)
6. [Flujo 5: Gestión de Operadores y Matriz de Permisos](#6-flujo-5-gestión-de-operadores-y-matriz-de-permisos)
7. [Flujo 6: Control de Acceso y Manejo de Errores en Eventos (HTTP 403)](#7-flujo-6-control-de-acceso-y-manejo-de-errores-en-eventos-http-403)
8. [Flujo 7: Planes de Marketing y Promociones](#8-flujo-7-planes-de-marketing-y-promociones)
9. [Resumen Rápido de Endpoints para Frontend](#9-resumen-rápido-de-endpoints-para-frontend)

---

## 1. Principios Clave de Seguridad y Arquitectura

Para proteger la integridad del sistema contra escalada de privilegios y accesos cruzados (IDOR), el backend aplica las siguientes reglas estrictas:

1. **La identidad siempre proviene del Token JWT**: 
   - No envíes `organizacionId`, `usuarioId` ni `rol` del solicitante en los cuerpos JSON de las solicitudes. El backend los extrae de manera segura del token `Bearer <jwt>` en la cabecera `Authorization`.
2. **Separación de responsabilidades**:
   - `ADMINISTRADOR`: Solo puede invitar usuarios a roles de plataforma (`MODERADOR` o `MARKETING`). **No** se le asocia organización.
   - `REPRESENTANTE`: Solo puede invitar al rol `OPERADOR`. La invitación se vincula **automáticamente** a la organización que preside el representante autenticado.
3. **Reenvíos Seguros y Prevención de Duplicados**:
   - Si invitas a un correo que ya tiene una invitación pendiente, el backend **no falla ni duplica registros**: regenera un nuevo token criptográfico válido por 24 horas y reenvía el correo automáticamente.
4. **Respuestas HTTP Estándar**:
   - `200 OK` / `201 Created`: Operación exitosa.
   - `400 Bad Request`: Formato de correo inválido, contraseña débil o parámetros faltantes.
   - `401 Unauthorized`: Token JWT ausente, expirado o inválido.
   - `403 Forbidden`: El usuario no tiene rol o permisos suficientes (ej. operador sin permiso `CREAR_EVENTO`, o representante intentando expulsar un operador de otra empresa).
   - `404 Not Found`: Recurso no encontrado o token de invitación inexistente.

---

## 2. Flujo 1: Invitaciones Administrativas (Panel de Administrador)

### 🎯 Objetivo
Permitir que un Administrador invite a una persona a formar parte del equipo de la plataforma asignándole un rol oficial.

### 👥 Roles Permitidos en el Selector de Frontend
En el formulario/modal de invitación del panel de administración, el dropdown de selección de rol debe mostrar únicamente:
- `MODERADOR`
- `MARKETING`

> ⚠️ **Nota:** No incluyas `ADMINISTRADOR`, `REPRESENTANTE`, `OPERADOR` ni `CLIENTE` en este selector. Si se envía cualquier otro rol, el backend responderá `400 Bad Request`.

### 📡 Endpoint
- **Método**: `POST`
- **Ruta**: `/api/admin/correos/invitar` *(también disponible en `/api/invitaciones-rol/invitar`)*
- **Headers**: `Authorization: Bearer <JWT_ADMIN>`, `Content-Type: application/json`

#### Request Body
```json
{
  "correo": "nuevo.moderador@eventhive.live",
  "rol": "MODERADOR"
}
```

#### Respuestas
- **201 Created**:
  ```json
  {
    "success": true,
    "message": "Invitación administrativa enviada por correo",
    "data": null
  }
  ```
- **400 Bad Request** (si el rol no está permitido o el correo ya tiene una cuenta con ese rol):
  ```json
  {
    "success": false,
    "message": "Solo se permite invitar a los roles: MODERADOR, MARKETING",
    "data": null
  }
  ```

---

## 3. Flujo 2: Envíos de Correo Administrativos (Sin Asignación de Rol)

### 🎯 Objetivo
Enviar avisos, circulares, comunicados o notificaciones informativas a uno o varios destinatarios. **Este endpoint no asigna roles ni genera tokens de registro.**

### 📡 Endpoint
- **Método**: `POST`
- **Ruta**: `/api/admin/correos/enviar`
- **Headers**: `Authorization: Bearer <JWT_ADMIN>`, `Content-Type: application/json`

#### Request Body
```json
{
  "destinatarios": [
    "usuario1@correo.com",
    "usuario2@correo.com"
  ],
  "asunto": "Mantenimiento programado de la plataforma",
  "mensaje": "<p>Estimados usuarios, la plataforma estará en mantenimiento el domingo a las 02:00 UTC.</p>",
  "tipoPlantilla": "INFORMATIVO"
}
```

#### Respuestas
- **200 OK**:
  ```json
  {
    "success": true,
    "message": "Correos enviados exitosamente",
    "data": {
      "totalEnviados": 2,
      "fallidos": 0
    }
  }
  ```

---

## 4. Flujo 3: Invitaciones de Organizaciones (Panel de Representante)

### 🎯 Objetivo
Permitir que el representante de una empresa u organización invite colaboradores para que operen en su equipo (validación de boletos, creación de eventos, etc.).

### 📡 Endpoints

#### 4.1 Enviar o Reenviar Invitación
- **Método**: `POST`
- **Ruta**: `/api/organizaciones/invitar`
- **Headers**: `Authorization: Bearer <JWT_REPRESENTANTE>`, `Content-Type: application/json`

El frontend puede enviar el correo tanto por el cuerpo JSON (recomendado) como por Query Param:

##### Opción A: JSON Body (Recomendada)
```json
{
  "correo": "operador.taquilla@miorganizacion.com"
}
```

##### Opción B: Query Param (Soportado)
`POST /api/organizaciones/invitar?correo=operador.taquilla@miorganizacion.com`

##### Respuesta (200 OK)
```json
{
  "success": true,
  "message": "Invitación enviada exitosamente",
  "data": null
}
```

> 💡 **UX Tip**: Si el usuario pulsa un botón "Reenviar invitación" en la tabla de invitaciones enviadas, simplemente ejecuta este mismo endpoint con el correo correspondiente. El backend actualizará el token y reenviará el correo sin duplicar la fila.

---

#### 4.2 Listar Invitaciones Enviadas por la Organización
Para mostrar el historial de invitaciones en una tabla con estados y paginación.

- **Método**: `GET`
- **Ruta**: `/api/organizaciones/invitaciones-enviadas?page=0&size=10`
- **Headers**: `Authorization: Bearer <JWT_REPRESENTANTE>`

##### Respuesta (200 OK)
```json
{
  "success": true,
  "message": "Invitaciones listadas exitosamente",
  "data": {
    "content": [
      {
        "id": 14,
        "correoInvitado": "operador.taquilla@miorganizacion.com",
        "rolDestino": "OPERADOR",
        "fechaInvitacion": "2026-10-21T18:15:00",
        "fechaExpiracion": "2026-10-22T18:15:00",
        "fechaAceptacion": null,
        "estado": "PENDIENTE",
        "organizacionNombre": "Festival Estéreo Picnic SAS"
      },
      {
        "id": 11,
        "correoInvitado": "antiguo.operador@empresa.com",
        "rolDestino": "OPERADOR",
        "fechaInvitacion": "2026-10-15T10:00:00",
        "fechaExpiracion": "2026-10-16T10:00:00",
        "fechaAceptacion": "2026-10-15T11:20:00",
        "estado": "ACEPTADA",
        "organizacionNombre": "Festival Estéreo Picnic SAS"
      },
      {
        "id": 8,
        "correoInvitado": "olvidado@empresa.com",
        "rolDestino": "OPERADOR",
        "fechaInvitacion": "2026-10-01T08:00:00",
        "fechaExpiracion": "2026-10-02T08:00:00",
        "fechaAceptacion": null,
        "estado": "EXPIRADA",
        "organizacionNombre": "Festival Estéreo Picnic SAS"
      }
    ],
    "totalElements": 3,
    "totalPages": 1,
    "size": 10,
    "number": 0
  }
}
```

##### 🎨 Recomendación de UI para el campo `estado`:
- `"PENDIENTE"`: Badge Amarillo / Ámbar 🟡 (Habilitar botón "Reenviar").
- `"ACEPTADA"`: Badge Verde 🟢 (Usuario ya operativo).
- `"EXPIRADA"`: Badge Gris / Rojo 🔴 (Habilitar botón "Reenviar").

---

## 5. Flujo 4: Aceptación de la Invitación (Flujo del Usuario Invitado)

Cuando el usuario hace clic en el enlace del correo:
`https://app.eventhive.live/aceptar-invitacion?token=abc123tokenHash...`

### Pantalla en Frontend (`/aceptar-invitacion`)

```
+-----------------------------------------------------------+
|               ¡Te han invitado a EventHive!              |
|                                                           |
| Correo:      operador.taquilla@miorganizacion.com         |
| Rol:         OPERADOR                                     |
| Organización: Festival Estéreo Picnic SAS                 |
|                                                           |
| Completa tu perfil para acceder:                          |
| [ Nombre Completo                  ]                      |
| [ Teléfono                         ]                      |
| [ Contraseña                       ]                      |
|                                                           |
|             [ ACEPTAR INVITACIÓN Y ENTRAR ]               |
+-----------------------------------------------------------+
```

### Pasos de Implementación:

#### Paso 1: Validar el Token al cargar la pantalla
- **Método**: `GET`
- **Ruta**: `/api/invitaciones-rol/validar?token={token}`

##### Respuesta (200 OK)
```json
{
  "success": true,
  "message": "Token válido",
  "data": {
    "correoInvitado": "operador.taquilla@miorganizacion.com",
    "rolDestino": "OPERADOR",
    "organizacionNombre": "Festival Estéreo Picnic SAS"
  }
}
```
*Si devuelve 400 o 404, muestra una alerta que indique: "Esta invitación no existe, ya fue utilizada o ha expirado. Solicita una nueva invitación."*

#### Paso 2: Enviar Formulario de Aceptación
- **Método**: `POST`
- **Ruta**: `/api/invitaciones-rol/aceptar`
- **Headers**: `Content-Type: application/json`

##### Request Body
```json
{
  "token": "abc123tokenHash...",
  "nombre": "Carlos Gómez",
  "telefono": "+573001234567",
  "password": "Password123!"
}
```
> ⚠️ **Importante**: No envíes `rol` ni `organizacionId`. El backend asigna estrictamente el rol y la organización precargados en el token de la base de datos. Si el usuario ya estaba registrado en EventHive previamente, solo debe enviar `token` y `password` para confirmar su identidad.

##### Respuesta (200 OK)
```json
{
  "success": true,
  "message": "Invitación aceptada. Ya puedes iniciar sesión con tus credenciales.",
  "data": null
}
```
Redirigir a `/login` con mensaje de éxito.

---

## 6. Flujo 5: Gestión de Operadores y Matriz de Permisos

Solo los usuarios con rol `REPRESENTANTE` pueden gestionar los operadores de su organización.

### 📡 Endpoints

#### 6.1 Listar Operadores de mi Organización
- **Método**: `GET`
- **Ruta**: `/api/organizaciones/mis-operadores`
- **Headers**: `Authorization: Bearer <JWT_REPRESENTANTE>`

##### Respuesta (200 OK)
```json
{
  "success": true,
  "message": "Operadores obtenidos exitosamente",
  "data": [
    {
      "operadorId": 5,
      "usuarioId": 42,
      "nombre": "Carlos Gómez",
      "correo": "operador.taquilla@miorganizacion.com",
      "permisos": ["CHECK_IN", "CREAR_EVENTO"]
    }
  ]
}
```

---

#### 6.2 Actualizar Permisos de un Operador
Para el modal o panel de edición de permisos del operador:

- **Método**: `PATCH`
- **Ruta**: `/api/organizaciones/operadores/{operadorId}/actualizar-permisos`
- **Headers**: `Authorization: Bearer <JWT_REPRESENTANTE>`, `Content-Type: application/json`

##### Catálogo de Permisos Disponibles (Checkboxes):
- `CHECK_IN`: Validación y escaneo de boletos/entradas QR.
- `CREAR_EVENTO`: Creación de nuevos borradores de eventos.
- `EDITAR_EVENTO`: Modificar detalles, fechas o precios de eventos de la organización.
- `CANCELAR_EVENTO`: Cancelar o dar de baja eventos.

##### Request Body (Array de Strings)
```json
[
  "CHECK_IN",
  "CREAR_EVENTO",
  "EDITAR_EVENTO"
]
```
*(Para quitar todos los permisos y dejarlo sin privilegios especiales, enviar `[]`)*.

##### Respuesta (200 OK)
```json
{
  "success": true,
  "message": "Permisos actualizados exitosamente",
  "data": {
    "operadorId": 5,
    "permisos": ["CHECK_IN", "CREAR_EVENTO", "EDITAR_EVENTO"]
  }
}
```

---

#### 6.3 Expulsar/Desvincular Operador
- **Método**: `DELETE`
- **Ruta**: `/api/organizaciones/expulsar-operador/{operadorId}`
- **Headers**: `Authorization: Bearer <JWT_REPRESENTANTE>`

##### Respuesta (200 OK)
```json
{
  "success": true,
  "message": "Operador desvinculado exitosamente",
  "data": null
}
```

---

## 7. Flujo 6: Control de Acceso y Manejo de Errores en Eventos (HTTP 403)

El backend ahora aplica validación de seguridad a nivel de métodos. Si un usuario con rol `OPERADOR` intenta ejecutar una acción sin tener el permiso asignado por su representante, el backend responderá con **`403 Forbidden`**.

### Matriz de Acciones vs Permiso Requerido:

| Acción en Frontend | Endpoint Backend | Permiso Requerido | Código si falta permiso |
| :--- | :--- | :--- | :--- |
| **Crear Evento** | `POST /api/eventos` | `CREAR_EVENTO` | `403 Forbidden` |
| **Editar Evento** | `PUT /api/eventos/{id}` | `EDITAR_EVENTO` | `403 Forbidden` |
| **Cancelar Evento** | `PATCH /api/eventos/{id}/cancelar` | `CANCELAR_EVENTO` | `403 Forbidden` |
| **Validar QR Entrada** | `POST /api/boletos/check-in` | `CHECK_IN` | `403 Forbidden` |

### Estructura de Respuesta de Error (403 Forbidden)
```json
{
  "success": false,
  "message": "No tienes permiso para crear eventos en esta organización",
  "data": null
}
```

### 💡 Manejo Recomendado en el Frontend (Axios / Fetch Interceptor):
```javascript
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 403) {
      const mensaje = error.response.data?.message || 'Acceso denegado: no tienes permisos para realizar esta acción.';
      // Mostrar Toast / Notificación Toastify o SweetAlert
      toast.error(mensaje);
    }
    return Promise.reject(error);
  }
);
```

---

## 8. Flujo 7: Planes de Marketing y Promociones

Para la contratación y visualización de posicionamiento patrocinado de eventos.

### 8.1 Ver Planes Disponibles (Público / Organizaciones)
- **GET** `/api/marketing/planes` (o `/api/promociones/planes`)
- Retorna la lista de planes activos (`DIAMANTE`, `ORO`, `PLATA`, etc.), precios y duración en días.

### 8.2 Contratar Promoción para un Evento
- **POST** `/api/marketing/promociones/contratar`
- **Body**:
  ```json
  {
    "eventoId": 12,
    "planId": 2
  }
  ```
- **Respuesta (201 Created)**: Retorna la promoción en estado `PENDIENTE_PAGO`.

### 8.3 Confirmar Pago Simulado (Pasarela de Prueba)
- **POST** `/api/marketing/promociones/{promocionId}/pagar-simulado`
- Activa la promoción inmediatamente, calcula `fechaInicio` y `fechaFin`, y posiciona el evento en la página principal.

---

## 9. Resumen Rápido de Endpoints para Frontend

| Funcionalidad | Método | Endpoint | Roles Permitidos |
| :--- | :---: | :--- | :--- |
| **Invitar Moderador/Marketing** | `POST` | `/api/admin/correos/invitar` | `ADMINISTRADOR` |
| **Enviar Correo Masivo/Aviso** | `POST` | `/api/admin/correos/enviar` | `ADMINISTRADOR` |
| **Invitar Operador a mi Org** | `POST` | `/api/organizaciones/invitar` | `REPRESENTANTE` |
| **Ver Invitaciones Enviadas** | `GET` | `/api/organizaciones/invitaciones-enviadas` | `REPRESENTANTE` |
| **Validar Token de Invitación** | `GET` | `/api/invitaciones-rol/validar?token=...` | Público (Cualquiera con el token) |
| **Aceptar Invitación** | `POST` | `/api/invitaciones-rol/aceptar` | Público |
| **Listar Mis Operadores** | `GET` | `/api/organizaciones/mis-operadores` | `REPRESENTANTE` |
| **Actualizar Permisos Operador**| `PATCH`| `/api/organizaciones/operadores/{id}/actualizar-permisos` | `REPRESENTANTE` |
| **Expulsar Operador** | `DELETE`| `/api/organizaciones/expulsar-operador/{id}` | `REPRESENTANTE` |
| **Check-in / Escaneo Boleto** | `POST` | `/api/boletos/check-in` | `OPERADOR` (con `CHECK_IN`), `REPRESENTANTE` |
| **Planes de Marketing** | `GET` | `/api/marketing/planes` | Público / Autenticado |
| **Contratar Promoción** | `POST` | `/api/marketing/promociones/contratar` | `REPRESENTANTE` |
| **Pagar Simulado Promoción** | `POST` | `/api/marketing/promociones/{id}/pagar-simulado` | `REPRESENTANTE` |

---

### ¿Preguntas o dudas de integración?
Si el equipo de frontend requiere ajustar campos adicionales o soporte en llamadas directas, consultar el archivo [`Documentacion_Endpoints.md`](./Documentacion_Endpoints.md) o contactar al equipo de backend.
