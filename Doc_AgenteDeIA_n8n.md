# Guía de Configuración: Agente de IA (HiveBot) con n8n y Google Gemini

Esta guía está diseñada para que cualquier miembro del equipo de **EventHive** pueda clonar/actualizar el repositorio y poner a funcionar el asistente virtual con Inteligencia Artificial (**HiveBot**) en su entorno local en pocos minutos.

---

## 📌 ¿Qué se implementó en el proyecto?

Se integró un **widget de chat flotante inteligente** en el frontend (`HelpChat.jsx`) que se comunica mediante Webhooks con un flujo de automatización en **n8n**.

### Arquitectura de la solución:
```mermaid
flowchart LR
    A[Frontend EventHive\nHelpChat.jsx] -->|POST /webhook/eventhive-chat\n{ message, sessionId }| B[n8n Webhook Trigger]
    B --> C[AI Agent]
    D[Google Gemini\n1.5 Flash] -->|Chat Model| C
    E[Window Buffer Memory\nsessionId] -->|Memoria| C
    C --> F[Respond to Webhook\n{ reply }]
    F -->|Respuesta JSON| A
```

- **Frontend (`HelpChat.jsx`)**: Envía el mensaje del usuario y un identificador único de sesión (`sessionId`).
- **n8n (Motor de Automatización)**: Recibe la petición y orquesta la respuesta.
- **Google Gemini**: Modelo de lenguaje que genera las respuestas contextualizadas sobre eventos de Cartagena, compra de boletos y métodos de pago.
- **Window Buffer Memory**: Permite que el bot recuerde el hilo de la conversación en cada sesión.
- **Mecanismo de Respaldo (Fallback)**: Si n8n está apagado o no responde, el chat responde con preguntas frecuentes automáticas para no romper la experiencia de usuario.

---

## 📋 Requisitos Previos

1. **Node.js**: Versión 18.x o superior instalada.
2. **Git**: Para descargar los cambios del repositorio.
3. Una cuenta de Google para obtener la API Key gratuita de Gemini.

---

## 🚀 Paso a Paso de Instalación y Puesta en Marcha

### Paso 1: Descargar cambios e instalar dependencias del Frontend

1. Abre tu terminal en la carpeta del proyecto `Eventhive`:
   ```bash
   git pull
   npm install
   ```

2. Configura las variables de entorno:
   Verifica que tu archivo `.env` contenga la URL del webhook de n8n:
   ```env
   VITE_N8N_WEBHOOK_URL=http://localhost:5678/webhook/eventhive-chat
   ```
   > 💡 *Si no tienes un archivo `.env`, puedes duplicar `.env.example` y renombrarlo a `.env`.*

---

### Paso 2: Iniciar n8n en tu computadora

No necesitas instalar n8n permanentemente con Docker si no quieres; puedes ejecutarlo directamente con `npx`:

#### Opción A (Recomendada - Rápida):
En una nueva terminal independiente, ejecuta:
```bash
npx n8n
```

#### Opción B (Instalación Global):
```bash
npm install -g n8n
n8n
```

#### Opción C ( con Docker):
```bash
docker run -it --rm --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n docker.n8n.io/n8nio/n8n
```

> ⏳ La primera vez tardará uno o dos minutos mientras descarga los componentes. Cuando veas el mensaje:
> `Editor is now accessible via: http://localhost:5678`
> abre esa dirección en tu navegador: [http://localhost:5678](http://localhost:5678).

---

### Paso 3: Crear tu cuenta local en n8n

1. Al entrar por primera vez a `http://localhost:5678`, n8n te pedirá crear una **cuenta de propietario (Owner account)**.
2. Ingresa tu correo, nombre y una contraseña (estos datos quedan guardados solo en tu máquina).
3. Puedes saltar el asistente de bienvenida si lo prefieres.

---

### Paso 4: Obtener tu API Key gratuita de Google Gemini

1. Ve a [Google AI Studio (aistudio.google.com)](https://aistudio.google.com/).
2. Inicia sesión con tu cuenta de Google.
3. Haz clic en el botón azul **"Get API key"** (o "Crear clave de API").
4. Haz clic en **"Create API key in new project"** y copia la clave generada.
   > ⚠️ *La API Key es gratuita y no requiere tarjeta de crédito para el nivel estándar.*

---

### Paso 5: Importar el Workflow en n8n

Hemos dejado la plantilla completa del flujo en el archivo `n8n-workflow-eventhive.json` en la raíz del frontend.

#### Método Rápido (Importar JSON):
1. En n8n, ve a **Workflows** y haz clic en **"Add Workflow"** (o el botón `+`).
2. En la esquina superior derecha del lienzo, haz clic en el menú de los **tres puntos (`...`)** y selecciona **"Import from File..."**.
3. Selecciona el archivo `n8n-workflow-eventhive.json` ubicado en la carpeta del proyecto.
   *(También puedes abrir el archivo, copiar todo su texto y hacer `Ctrl + V` directamente sobre el lienzo de n8n).*

#### Configurar la credencial de Gemini:
1. En el lienzo verás el nodo **Google Gemini Chat Model** con una alerta roja de credencial.
2. Haz doble clic en el nodo **Google Gemini Chat Model**.
3. En el campo **Credential to connect with**, selecciona **Create New Credential**.
4. Pega la **API Key** que copiaste en el *Paso 4*.
5. Guarda la credencial con el botón **Save**.

---

### Paso 6: Activar / Publicar el Workflow (¡Muy importante!)

Para que el frontend pueda enviar mensajes al webhook, el flujo debe estar en estado **Published** (Activo):

1. En la esquina superior derecha de n8n, cambia el interruptor de **Inactive** a **Published** (se pondrá verde).
2. Guarda los cambios con el botón **Save** (`Ctrl + S`).

> [!WARNING]
> Si el flujo no está en modo **Published**, n8n devolverá un error 404 cuando el frontend intente comunicarse con la URL de producción (`/webhook/eventhive-chat`).

---

### Paso 7: Probar la integración en EventHive

1. En la terminal del frontend, inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
2. Abre la aplicación en tu navegador (usualmente `http://localhost:5173`).
3. En la esquina inferior derecha verás el botón flotante dorado con el logo de EventHive y el indicador verde de estado en línea.
4. Haz clic en el botón para abrir **HiveBot** y envía una pregunta como:
   - *"¿Cómo compro boletos para un concierto?"*
   - *"¿Qué métodos de pago tienen disponibles?"*
   - *"¿Cómo puedo crear mi propio evento?"*
5. HiveBot responderá usando Google Gemini a través de tu n8n local.
6. En n8n puedes ir a la pestaña **Executions** en el menú lateral para ver el historial y tiempo de respuesta de cada mensaje en tiempo real.

---

## 🛠️ Estructura Detallada de los Nodos (Referencia Manual)

Si deseas inspeccionar o reconstruir manualmente el flujo, estos son los parámetros clave:

| Nodo | Tipo de Nodo | Parámetros Clave |
| :--- | :--- | :--- |
| **Webhook Trigger** | `n8n-nodes-base.webhook` | **HTTP Method:** `POST`<br>**Path:** `eventhive-chat`<br>**Response Mode:** `Using 'Respond to Webhook' Node` |
| **AI Agent** | `@n8n/n8n-nodes-langchain.agent` | **Prompt Type:** `Define below`<br>**Text:** `{{ $json.body.message }}`<br>**System Message:** Instrucciones sobre EventHive, eventos en Cartagena, compra de boletos, pagos y rol organizador. |
| **Google Gemini Chat Model** | `@n8n/n8n-nodes-langchain.lmChatGoogleGemini` | **Model Name:** `models/gemini-1.5-flash`<br>**Temperature:** `0.7`<br>**Credential:** Clave de Google AI Studio |
| **Window Buffer Memory** | `@n8n/n8n-nodes-langchain.memoryBufferWindow` | **Session Key:** `{{ $('Webhook Trigger').item.json.body.sessionId }}`<br>**Context Window:** `10` |
| **Respond to Webhook** | `n8n-nodes-base.respondToWebhook` | **Respond With:** `JSON`<br>**Response Body:** `{"reply": {{ JSON.stringify($json.output) }}}` |

---

## ❓ Preguntas Frecuentes y Solución de Problemas

### 1. ¿Qué pasa si no tengo n8n abierto?
El componente `HelpChat.jsx` cuenta con un sistema de **fallback automático**. Si n8n está apagado o falla la red, el chat responderá automáticamente con respuestas de contingencia sobre boletos, pagos y registro de eventos.

### 2. Error `404 - Webhook not registered`
Verifica que el interruptor en la esquina superior derecha de tu workflow en n8n esté en **Published**. Si está inactivo, el endpoint no escucha peticiones externas.

### 3. Error de CORS al enviar mensajes
n8n por defecto permite peticiones desde `localhost`. Si llegaras a tener algún bloqueo de CORS, asegúrate de que estás ingresando a la app desde `http://localhost:5173`.

### 4. ¿Cómo cambio las instrucciones o personalidad del bot?
Abre el nodo **AI Agent** en n8n, ve a **System Message** y personaliza las instrucciones como desees. Luego haz clic en **Save**. ¡Los cambios tendrán efecto inmediato sin tener que reiniciar el frontend!

