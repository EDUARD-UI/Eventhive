# EventHive — Flujo de moderación, verificación, creación de eventos e invitaciones

**Documento para el equipo de frontend**  
**Base analizada:** `demo(8).zip` (backend Spring Boot).  
**Objetivo:** describir qué debe mostrar el frontend, qué endpoints existen y qué puntos conviene validar o completar.

> Este documento describe el comportamiento encontrado en el backend. Los apartados “Pendiente de confirmar/completar” son necesidades de integración o mejoras sugeridas; no significan necesariamente que el backend no tenga ninguna lógica relacionada.

## 1. Resumen de los flujos

Hay tres procesos relacionados, pero diferentes:

1. **Verificación del organizador:** el representante crea su cuenta y organización, sube el RUT y espera la decisión de un administrador. La organización debe estar aprobada para enviar eventos a moderación.
2. **Creación y moderación del evento:** el organizador crea el evento como borrador, completa los datos y lo envía a revisión. Las reglas automáticas pueden rechazarlo o dejarlo en revisión humana. Un moderador lo aprueba, solicita correcciones o lo rechaza.
3. **Invitación por correo:** un administrador invita a usuarios a los roles `MODERADOR` o `MARKETING`; un representante invita a un `OPERADOR` de su organización. El destinatario abre un enlace, valida el token y acepta la invitación para crear o asociar su cuenta.

## 2. Verificación de organizadores y organizaciones

### 2.1 Flujo esperado

1. El usuario completa el registro de organizador con nombre, correo de cuenta, contraseña, razón social, NIT y correo empresarial.
2. El backend crea la cuenta con rol `REPRESENTANTE`, crea la organización con estado `PENDIENTE_REVISION` y crea una solicitud en estado `INCOMPLETA`.
3. En el dashboard, el representante debe ver que falta adjuntar el RUT. Mientras no lo suba, la solicitud no entra en la cola de revisión administrativa.
4. El representante carga el RUT. La solicitud pasa a `PENDIENTE` y aparece para revisión del administrador.
5. El administrador consulta la solicitud y el documento, y decide:
   - **Aprobar:** solicitud `APROBADA`, organización `APROBADA`; el representante puede enviar eventos a moderación y publicar tras su aprobación.
   - **Solicitar corrección:** solicitud `CORRECCION_SOLICITADA`; se guarda el motivo y el representante debe corregir y reenviar.
   - **Rechazar:** solicitud `RECHAZADA` y organización `SUSPENDIDA`; se guarda el motivo.
6. Si se solicita corrección o se rechaza, el representante puede reenviar los datos y, si corresponde, adjuntar un nuevo RUT. La solicitud vuelve a `PENDIENTE`.

### 2.2 Estados que debe representar la UI

| Entidad | Estado | Qué mostrar |
|---|---|---|
| Solicitud | `INCOMPLETA` | Registro creado; falta subir RUT. Acción para cargar documento. |
| Solicitud | `PENDIENTE` | En revisión; bloquear edición/reenvío mientras el administrador decide. |
| Solicitud | `CORRECCION_SOLICITADA` | Mostrar motivo y habilitar edición y reenvío. |
| Solicitud | `APROBADA` | Verificación completada. |
| Solicitud | `RECHAZADA` | Mostrar motivo y opción de corregir/reintentar si aplica. |
| Organización | `PENDIENTE_REVISION` | No puede enviar eventos a moderación. |
| Organización | `APROBADA` | Puede enviar eventos a moderación. |
| Organización | `SUSPENDIDA` | Bloqueada para crear eventos; el backend también impide enviar eventos a revisión. |

### 2.3 Endpoints de verificación

Base: `/api/verificacion`

| Método y ruta | Acceso | Uso frontend |
|---|---|---|
| `POST /registro-organizador` | Público | Crear cuenta, organización y solicitud incompleta. JSON `SolicitudVerificacionRequest`. |
| `GET /mi-solicitud` o `GET /mis-solicitudes` | `REPRESENTANTE` | Consultar la solicitud propia. Puede devolver `data: null` si no existe. |
| `PATCH /{solicitudId}/subir-rut` | `REPRESENTANTE` | `multipart/form-data`, campo de archivo `rut`. |
| `PATCH /{solicitudId}/reenviar` | `REPRESENTANTE` | `multipart/form-data`: campo `datos` con `SolicitudVerificacionRequest` y campo `rut` opcional. El RUT debe existir al finalizar el reenvío. |
| `GET /pendientes` | `ADMINISTRADOR` | Listar solicitudes en estado `PENDIENTE`, paginadas. |
| `GET /{solicitudId}` | `ADMINISTRADOR` | Consultar detalle de una solicitud. |
| `PUT /{solicitudId}/aprobar` | `ADMINISTRADOR` | Aprobar solicitud. |
| `PUT /{solicitudId}/rechazar?motivo=...` | `ADMINISTRADOR` | Rechazar con motivo obligatorio en query string. |
| `PATCH /{solicitudId}/solicitar-correccion?motivo=...` | `ADMINISTRADOR` | Solicitar correcciones con motivo en query string. |

**Validaciones para el formulario de registro:** `nombreCompleto`, `correoUsuario`, `password` (mínimo 6 caracteres), `razonSocial`, `nit` y `correoEmpresarial` son obligatorios; ambos correos deben ser válidos. El backend valida que el correo de cuenta no esté registrado y valida datos únicos de organización.

**Carga del RUT:** la solicitud usa `multipart/form-data`. El frontend debe permitir elegir archivo, mostrar nombre/tamaño y estado de carga, y refrescar la solicitud después de la respuesta. Los tipos y tamaño máximos admitidos deben confirmarse con la implementación/configuración de almacenamiento antes de fijar las restricciones visuales.

## 3. Creación y envío de eventos a moderación

### 3.1 Flujo de organizador

1. El representante u operador abre el formulario de creación.
2. Completa los datos del evento y envía el formulario. El backend crea el evento como `BORRADOR`.
3. La creación no publica automáticamente el evento. El frontend debe dejar claro que el evento todavía no es público.
4. El organizador revisa los datos y usa **Enviar a revisión**.
5. El backend valida que el evento esté en `BORRADOR` o `EN_CORRECCION`, que la organización esté `APROBADA` y que se cumplan los límites del nivel/plan. Luego ejecuta la moderación automática.
6. Según las reglas automáticas, el evento puede quedar `PENDIENTE_REVISION`, pasar a `RECHAZADO` o a `EN_CORRECCION` (consultar la implementación de `aplicarResultadoModeracionAutomatica` para el mapeo exacto de veredictos y estados).
7. Si un moderador solicita correcciones, el organizador debe ver el motivo/observación, editar el evento y reenviarlo.
8. Cuando el moderador aprueba, el estado pasa a `PUBLICADO` y se generan notificaciones asociadas al resultado.

### 3.2 Campos del formulario de evento

El DTO `EventoRequest` requiere:

- `titulo` (obligatorio, máximo 200 caracteres).
- `descripcion` (obligatoria).
- `lugar` (obligatorio, máximo 200 caracteres).
- `fecha` y `hora` (obligatorias).
- `categoriaId` (obligatorio).
- `latitud` y `longitud` (obligatorias, con rangos geográficos válidos).
- `fechaFin` y `horaFin` son opcionales en el DTO.
- `foto` se envía como archivo multipart opcional en el endpoint de creación/actualización; sin imagen, una regla automática solicita revisión manual.

La creación y actualización reciben `multipart/form-data` con `datos` como parte JSON y `foto` como parte de archivo opcional. El evento también necesita al menos una localidad válida para superar las reglas automáticas; la creación del servicio asegura una localidad general. Confirmar si el frontend debe gestionar localidades adicionales mediante los endpoints específicos de localidades.

### 3.3 Estados de evento relevantes para la UI

| Estado | Significado / comportamiento de UI |
|---|---|
| `BORRADOR` | Editable; permite preparar y enviar a revisión. |
| `PENDIENTE_REVISION` | En cola de moderación; mostrar estado de espera y no ofrecer edición normal si el backend la restringe. |
| `EN_CORRECCION` | Mostrar motivo y observación del moderador; permitir corregir y reenviar. |
| `PUBLICADO` | Evento aprobado y visible al público. |
| `RECHAZADO` | Mostrar decisión y motivo; definir en UI cómo iniciar una nueva versión o solicitar soporte según reglas de producto. |
| `SUSPENDIDO` | Evento retirado por administración; mostrar motivo si existe. |
| `CANCELADO` | Evento cancelado; no editable según el servicio. |
| `FINALIZADO` | Evento finalizado; no editable. |

### 3.4 Endpoints de eventos

Base: `/api/eventos`

| Método y ruta | Acceso / uso |
|---|---|
| `POST /` | `REPRESENTANTE` u `OPERADOR`; crear borrador. `multipart/form-data` con `datos` y `foto` opcional. |
| `PUT /{id}` | `REPRESENTANTE` u `OPERADOR`; actualizar evento con multipart. |
| `PATCH /{id}/enviar-revision` | `REPRESENTANTE` u `OPERADOR`; enviar borrador o evento en corrección a revisión. |
| `GET /organizador` | Listar eventos de la organización actual, paginados. |
| `GET /organizador/buscar` | Filtrar eventos propios. Revisar parámetros disponibles en el controlador antes de construir filtros. |
| `GET /organizador/{id}` | Consultar un evento de la organización. |
| `PATCH /{id}/retirar` | Retirar evento a borrador, según permisos y estado. |
| `PATCH /{id}/reabrir` | Reabrir evento como borrador, según permisos y estado. |
| `PATCH /{id}/cancelar` | Cancelar evento. |
| `DELETE /{id}` | Eliminar evento, según permisos y reglas del servicio. |
| `GET /` y `GET /{id}` | Consultas públicas/listado y detalle; los listados públicos se filtran para mostrar eventos publicables. |

**Respuesta visual importante:** al crear, el backend puede devolver un mensaje distinto según el estado de la organización. Si está pendiente de revisión, la respuesta indica que el evento queda como borrador y que falta RUT o aprobación; si la organización está aprobada, indica que el evento queda como borrador y debe enviarse a moderación.

### 3.5 Moderación automática encontrada

El backend tiene reglas automáticas para:

- **Datos obligatorios:** falta de título, descripción, lugar, fecha, hora o categoría produce rechazo automático.
- **Fecha pasada:** fecha/hora anterior al momento actual produce rechazo automático.
- **Imagen principal ausente:** genera un hallazgo de revisión humana, no un rechazo automático.
- **Localidades inválidas:** sin localidades, con capacidad menor o igual a cero o precio nulo/negativo produce rechazo automático.
- **Palabras prohibidas:** coincidencia con palabra activa de severidad `GRAVE` produce rechazo; severidad `SOSPECHOSA` solicita revisión humana.

El motor devuelve el primer rechazo encontrado; si no hay rechazo, conserva el primer hallazgo de revisión manual; si no hay hallazgos, devuelve resultado OK. El frontend puede replicar validaciones para ayudar al usuario, pero el backend sigue siendo la fuente definitiva.

## 4. Panel de moderación de eventos

### 4.1 Pantallas necesarias

**Bandeja de pendientes**
- Listado paginado de eventos en `PENDIENTE_REVISION`.
- Mostrar título, imagen, fecha/hora, lugar, categoría, organización y creador cuando estén disponibles en el DTO.
- Filtros/ordenamiento si el backend los soporta; no asumir que existen filtros sin comprobarlos.
- Estados de carga, lista vacía, error y acción de refrescar.

**Detalle de revisión**
- Mostrar todos los datos del evento y las localidades disponibles.
- Mostrar historial de moderación, motivo y observación.
- Acciones: aprobar, solicitar corrección y rechazar.
- Para solicitar corrección o rechazar, abrir modal con motivo obligatorio. Si el motivo es `OTRO`, la observación es obligatoria.
- Confirmar la acción y actualizar la bandeja/detalle con el estado devuelto.

**Estadísticas del moderador**
- Mostrar total revisado, aprobados, rechazados y correcciones solicitadas.

### 4.2 Endpoints de moderación

Base: `/api/moderaciones`

| Método y ruta | Rol | Uso |
|---|---|---|
| `GET /eventos/pendientes` | `MODERADOR` | Bandeja paginada de eventos pendientes. |
| `PATCH /eventos/{eventoId}/aprobar` | `MODERADOR` | Aprobar y publicar. No requiere body. |
| `PATCH /eventos/{eventoId}/solicitar-correccion` | `MODERADOR` | Body JSON `{"motivo":"...","observacion":"..."}`. |
| `PATCH /eventos/{eventoId}/rechazar` | `MODERADOR` | Mismo body que solicitar corrección. |
| `GET /eventos/{eventoId}/moderaciones` | Autenticado, con autorización adicional del servicio | Historial paginado del evento. |
| `GET /estadisticas` | `MODERADOR` | Estadísticas propias del moderador. |
| `GET /moderadores` | `ADMINISTRADOR` | Listado paginado de moderadores. |
| `PUT /moderadores/{moderadorId}/asignar` | `ADMINISTRADOR` | Asignar rol moderador. |
| `PUT /moderadores/{moderadorId}/revocar` | `ADMINISTRADOR` | Revocar rol moderador. |
| `PATCH /eventos/{eventoId}/suspender` | `ADMINISTRADOR` | Suspender evento publicado; requiere motivo. |
| `PATCH /eventos/{eventoId}/reactivar` | `ADMINISTRADOR` | Reactivar evento suspendido. |

Valores de `motivo` disponibles en `MotivosRechazos`: `INFORMACION_INCOMPLETA`, `IMAGEN_NO_PERMITIDA`, `FALTA_PERMISO_LEGAL`, `CATEGORIA_INCORRECTA`, `INCUMPLE_POLITICAS`, `FECHA_INVALIDA`, `LOCALIDADES_INVALIDAS`, `OTRO`. Mostrar una etiqueta legible en frontend y enviar el valor exacto del enum. La observación es obligatoria cuando `motivo` es `OTRO`.

La API responde normalmente con un envoltorio `ApiResponse` (mensaje y datos). Las listas de moderación/eventos usan estructuras paginadas; adaptar el cliente al JSON real de `PagedResponse`/`Page` y no asumir que todos los endpoints devuelven el mismo formato de paginación.

## 5. Invitaciones por correo para unirse a EventHive

### 5.1 Quién puede invitar

- `ADMINISTRADOR`: puede invitar `MODERADOR` o `MARKETING`.
- `REPRESENTANTE`: puede invitar `OPERADOR` a su organización.
- No presentar en el selector roles que el usuario actual no puede asignar.

### 5.2 Flujo del destinatario

1. El remitente introduce correo y rol y envía la invitación.
2. El backend genera un token seguro, almacena su hash y envía un correo con enlace al frontend `/aceptar-invitacion?token=...`.
3. La invitación expira a las **24 horas**. Si se vuelve a invitar al mismo correo mientras hay una invitación vigente sin aceptar, se actualiza la invitación existente y se invalida el token anterior.
4. La pantalla de aceptación lee el query param `token` y llama a validar.
5. Si el token es válido, mostrar correo invitado, rol, organización si aplica y vencimiento.
6. Si la persona no tiene cuenta, pedir nombre, teléfono y contraseña; el correo queda asociado al correo invitado y no debe poder cambiarse en el formulario. Si la cuenta ya existe, el backend aplica validaciones de rol/organización y puede no necesitar crear una cuenta nueva.
7. Al aceptar, enviar el token y los campos requeridos a la API. Mostrar éxito y dirigir a iniciar sesión o al flujo apropiado.
8. Si el token expiró, ya se usó o es inválido, mostrar un error claro y la opción de solicitar una nueva invitación.

### 5.3 Endpoints de invitaciones

Base: `/api/invitaciones/roles`

| Método y ruta | Acceso | Uso |
|---|---|---|
| `POST /` | `ADMINISTRADOR` o `REPRESENTANTE` | Enviar invitación. JSON: `{"correo":"persona@dominio.com","rol":"OPERADOR"}` (el rol depende del remitente). |
| `GET /validar?token=...` | Público | Validar token y obtener datos de invitación. |
| `POST /aceptar` | Público | Aceptar invitación. El request `AceptarInvitacionRolRequest` define los campos de cuenta; revisar DTO para construir el formulario exacto. |
| `GET /enviadas` | `ADMINISTRADOR` o `REPRESENTANTE` | Listar invitaciones enviadas, paginadas. |

También existe `POST /api/admin/correos/invitar`, exclusivo de `ADMINISTRADOR`, que acepta el mismo DTO de invitación y llama al mismo servicio. Para evitar duplicar lógica en frontend, preferir una sola ruta de invitación según la convención acordada por el equipo. Existe además `POST /api/admin/correos/enviar` para correo administrativo libre (destinatario, asunto y mensaje); no sustituye el flujo de invitación por token.

### 5.4 Historial de invitaciones

Crear una tabla con correo, rol, organización si existe, fecha de envío, fecha de expiración y estado. El DTO calcula estado a partir de la aceptación y expiración. Ofrecer una acción de reenviar invitación solo si el producto la requiere; el backend reutiliza/actualiza una invitación vigente cuando se crea otra para el mismo correo.

## 6. Lista de trabajo para frontend

### Prioridad alta — integración funcional

- [ ] Crear pantalla de registro de organizador con validaciones de campos y errores del backend.
- [ ] Crear dashboard de verificación con estados `INCOMPLETA`, `PENDIENTE`, `CORRECCION_SOLICITADA`, `APROBADA` y `RECHAZADA`.
- [ ] Implementar carga de RUT, reenvío de solicitud y visualización del motivo de corrección/rechazo.
- [ ] En el dashboard de organización, bloquear/explicar el envío a moderación si la organización no está aprobada.
- [ ] Crear/editar eventos con multipart (`datos` JSON + `foto` opcional), incluyendo latitud/longitud y categoría.
- [ ] Mostrar estado del evento y acciones válidas según estado; no tratar la creación como publicación.
- [ ] Crear bandeja de eventos pendientes para moderadores y detalle de revisión.
- [ ] Implementar aprobación, solicitud de corrección y rechazo con motivo/observación.
- [ ] Mostrar historial de moderación en detalle de evento y en el dashboard del organizador.
- [ ] Crear flujo completo de invitación: formulario, enlace con token, validación, aceptación y errores por expiración/uso.
- [ ] Crear listado paginado de invitaciones enviadas y mostrar estado.
- [ ] Aplicar control de permisos en UI según rol; el backend debe seguir validando los permisos.

### Prioridad media — experiencia y robustez

- [ ] Mostrar carga, éxito, error, lista vacía y confirmación en todas las acciones asíncronas.
- [ ] Actualizar datos después de aprobar/rechazar/enviar a revisión, sin dejar estados visuales obsoletos.
- [ ] Evitar doble envío de formularios y acciones repetidas mientras hay una petición en curso.
- [ ] Añadir etiquetas amigables para enums y traducciones de errores de validación.
- [ ] Confirmar parámetros de paginación, orden y filtros con respuestas reales de la API.
- [ ] Confirmar reglas de tipo/tamaño de archivos admitidos para RUT e imágenes.

## 7. Pendientes de confirmar con backend/producto

1. **Mapeo del resultado automático:** revisar `ServiceEvento.aplicarResultadoModeracionAutomatica` para documentar exactamente qué estados resultan de `OK`, `REVISION` y `RECHAZADO`, y si se guarda un registro visible para el historial.
2. **Motivos automáticos:** la regla de imagen ausente usa `IMAGEN_NO_PERMITIDA` aunque el texto indique que solo falta imagen. La UI debe mostrar una explicación clara y el equipo puede valorar separar ese motivo.
3. **Rechazo y reenvío de eventos:** el flujo de envío a revisión acepta `BORRADOR` y `EN_CORRECCION`; confirmar si un evento `RECHAZADO` debe poder volver a borrador o si el usuario debe duplicarlo/crear otro.
4. **Localidades:** el servicio crea una localidad general automáticamente. Confirmar qué operaciones y validaciones deben exponerse para localidades adicionales y cómo se muestran precio/capacidad.
5. **Autorización del historial:** el endpoint de historial exige autenticación y el servicio permite administradores/moderadores o miembros de la organización propietaria; manejar `403` en frontend.
6. **Correos/notificaciones:** el backend invoca notificaciones al resolver verificación y moderación, pero conviene confirmar qué canales llegan realmente (correo, notificación interna) y qué estados deben refrescarse desde el frontend.
7. **Validación de archivos:** confirmar extensiones, MIME, tamaño máximo y mensajes esperados para RUT e imagen.
8. **URL de aceptación:** el backend construye el enlace con la configuración `frontendUrl` o una URL por defecto. En cada entorno, comprobar que apunte al frontend desplegado correcto.
9. **Contrato de paginación:** `GET /api/moderaciones/eventos/pendientes` convierte a `PagedResponse`, mientras que otros endpoints pueden devolver `Page` directamente. Normalizar el cliente por endpoint o unificar el contrato.

## 8. Contratos mínimos que debe consumir el frontend

- **Registro de organizador:** `nombreCompleto`, `correoUsuario`, `password`, `razonSocial`, `nit`, `correoEmpresarial`.
- **Carga RUT:** multipart con campo `rut`.
- **Reenvío verificación:** multipart con `datos` (JSON de registro/organización) y `rut` opcional, pero el documento debe estar disponible al enviar.
- **Crear/editar evento:** multipart con `datos` (JSON de `EventoRequest`) y `foto` opcional.
- **Resolver moderación:** JSON con `motivo` (enum exacto) y `observacion` (obligatoria si el motivo es `OTRO`).
- **Invitar:** JSON con `correo` y `rol`.
- **Aceptar invitación:** token más los campos definidos por `AceptarInvitacionRolRequest`; no inventar campos, revisar ese DTO al implementar.

## 9. Criterio de aceptación funcional

Se considera listo cuando un representante pueda registrarse, subir el RUT, consultar el estado y corregir la solicitud; una organización aprobada pueda crear un borrador y enviarlo a revisión; el moderador pueda revisar, aprobar, solicitar corrección o rechazar con trazabilidad; y un usuario invitado pueda recibir el correo, validar el token y aceptar la invitación con el rol/organización correctos.
