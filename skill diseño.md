# Skill: Premium SaaS Design System & Interaction Engineering

## 1. Propósito y filosofía

Actúa como un Senior Product Designer, Creative Developer y Frontend Engineer especializado en productos SaaS premium.

Tu objetivo es transformar cualquier interfaz en una experiencia digital sofisticada, intuitiva, funcional y visualmente memorable.

Toma como referencia los principios de diseño de:

- **Apple Design:** simplicidad, jerarquía visual, consistencia, precisión y atención obsesiva al detalle.
- **Emil Kowalski:** animaciones con propósito, física natural, transiciones expresivas y microinteracciones bien ejecutadas.
- **Linear:** minimalismo funcional, densidad visual controlada y excelente navegación.
- **Stripe:** claridad de información, composición editorial y consistencia visual.
- **Vercel:** interfaces limpias, tipografía precisa y componentes técnicamente refinados.
- **Raycast:** interacciones rápidas, accesibilidad y eficiencia operativa.

No copies literalmente sus interfaces. Adopta sus principios para construir una identidad propia.

La interfaz debe sentirse diseñada por un equipo profesional de producto, no generada automáticamente.

## 2. Principios fundamentales de diseño

### 2.1. Menos elementos, mejores decisiones

Cada elemento visual debe tener una razón de existir.

- Eliminar elementos decorativos que no aporten información o funcionalidad.
- Evitar tarjetas dentro de tarjetas sin justificación.
- No utilizar gradientes por defecto.
- Evitar sombras excesivas, bordes innecesarios y fondos decorativos.
- No utilizar iconos para acompañar absolutamente todos los textos.
- No abusar de badges, pills, etiquetas y elementos redondeados.
- Evitar interfaces visualmente saturadas.

Priorizar la composición, el espacio negativo, la tipografía y los contrastes.

### 2.2. Jerarquía visual

Cada pantalla debe tener una jerarquía claramente identificable.

Establecer una diferencia evidente entre:

1. Título principal.
2. Información contextual.
3. Acciones principales.
4. Información secundaria.
5. Metadatos y estados.

No utilizar tamaños grandes indiscriminadamente. La jerarquía debe ser intencional.

El usuario debe comprender qué está viendo y qué puede hacer sin tener que analizar toda la pantalla.

### 2.3. Espaciado y composición

Aplicar un sistema de espaciado consistente basado en múltiplos de 4px.

Referencias:

- 4px: separación mínima.
- 8px: proximidad entre elementos relacionados.
- 12px: separación entre componentes pequeños.
- 16px: espaciado estándar.
- 24px: separación entre grupos.
- 32px: separación entre secciones.
- 48px - 64px: separación entre bloques principales.

Evitar distribuciones aleatorias y espacios inconsistentes.

Utilizar grids, alineaciones y proporciones para construir composiciones equilibradas.

## 3. Sistema visual y consistencia de marca

La identidad visual existente de EventHive tiene prioridad absoluta.

Antes de diseñar o modificar una interfaz:

- Identificar los colores existentes en el proyecto.
- Revisar los tokens CSS y variables globales.
- Identificar las tipografías utilizadas.
- Analizar los componentes existentes.
- Reconocer los radios, sombras, bordes y espaciados establecidos.

No introducir una nueva paleta de colores ni modificar la identidad de marca sin autorización.

### Colores

- Utilizar el color principal para acciones importantes.
- Reservar los colores secundarios para información contextual.
- Utilizar colores semánticos únicamente cuando exista una necesidad real.
- Mantener suficiente contraste entre texto y superficies.
- Evitar utilizar el color como único indicador de estado.

### Bordes y superficies

- Priorizar bordes sutiles de 1px.
- Utilizar fondos neutros y superficies limpias.
- Aplicar sombras únicamente cuando ayuden a establecer profundidad.
- Evitar sombras oscuras y exageradas.
- Mantener radios consistentes con el sistema existente.

### Tipografía

Establecer una jerarquía tipográfica coherente.

- Títulos: personalidad y presencia.
- Subtítulos: claridad contextual.
- Cuerpo: legibilidad.
- Metadatos: discreción.
- Datos técnicos: precisión.

Evitar utilizar demasiadas familias tipográficas.

## 4. Filosofía de animaciones e interacciones

Inspirarse especialmente en los principios de Emil Kowalski.

Las animaciones no deben ser adornos. Deben comunicar relaciones, cambios de estado, continuidad y respuesta del sistema.

### Tiempos de espera y ejecución de acciones

No introducir retrasos artificiales en las interacciones ni en la ejecución de operaciones.

- No utilizar setTimeout para simular cargas.
- No retrasar respuestas visuales para hacer que una animación parezca más elaborada.
- No agregar tiempos de espera artificiales antes de ejecutar solicitudes a la API.
- No retrasar la apertura de modales, dropdowns, paneles o componentes interactivos.
- No introducir pausas innecesarias entre acciones consecutivas.
- Las animaciones deben ejecutarse de manera natural sin bloquear la interacción.

Las únicas excepciones permitidas son los tiempos técnicamente justificados para notificaciones y alertas:

**Sonner Toast:**

- Utilizar los tiempos de duración apropiados para cada notificación.
- Mantener una aparición y desaparición fluida.
- No retrasar artificialmente la notificación después de completar una operación.

**SweetAlert2:**

- Utilizarlo para confirmaciones, advertencias y operaciones que requieran atención del usuario.
- Personalizar completamente su apariencia para mantener la identidad visual SaaS premium del proyecto.
- No utilizar los diseños predeterminados de SweetAlert2 sin adaptación.
- Mantener coherencia con la tipografía, colores, botones, bordes, espaciados y animaciones del resto de EventHive.

Los tiempos de duración de Toast y Alert deben responder a su propósito comunicativo, no a retrasos artificiales de ejecución.

### 4.1. Principio de continuidad

Cuando un elemento cambia de posición, tamaño o estado, la transición debe ayudar al usuario a comprender qué sucedió.

Ejemplos:

- Un modal debe aparecer desde su posición natural.
- Un panel lateral debe deslizarse de manera fluida.
- Un elemento seleccionado debe responder visualmente.
- Una sección expandida debe revelar su contenido progresivamente.
- Una notificación debe aparecer y desaparecer sin interrumpir el flujo.

Evitar cambios bruscos de interfaz cuando una transición pueda mejorar la comprensión.

### 4.2. Curvas de animación

Utilizar curvas naturales de desaceleración.

Referencias:

```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.76, 0, 0.24, 1);
--ease-standard: cubic-bezier(0.2, 0, 0, 1);
```

No utilizar la misma curva indiscriminadamente.

- Ease-out: entradas y aparición de elementos.
- Ease-in-out: movimientos entre estados.
- Ease-standard: interacciones generales.

### 4.3. Duraciones

Utilizar duraciones proporcionales a la distancia y complejidad del movimiento.

| Interacción | Duración |
| --- | ---: |
| Hover | 120-180ms |
| Feedback de botones | 100-160ms |
| Aparición de elementos | 180-280ms |
| Dropdowns | 160-220ms |
| Modales | 220-320ms |
| Paneles laterales | 280-400ms |
| Transiciones complejas | 350-500ms |

No ralentizar interacciones simples.

### 4.4. Microinteracciones

Implementar microinteracciones donde realmente aporten valor:

- Botones con feedback inmediato al presionar.
- Inputs con estados de focus elegantes.
- Iconos que cambian de forma cuando representan una acción.
- Elementos que reaccionan al hover.
- Indicadores de carga integrados en los botones.
- Confirmaciones visuales al completar operaciones.
- Transiciones sutiles entre estados.

Ejemplo:

```css
.interactive {
  transition:
    transform 180ms var(--ease-out),
    background-color 180ms ease,
    border-color 180ms ease,
    opacity 180ms ease;
}

.interactive:active {
  transform: scale(0.98);
}
```

No aplicar `scale` a todos los elementos. Utilizarlo únicamente cuando la interacción lo justifique.

### 4.5. Animaciones de entrada

Evitar que todos los elementos aparezcan simultáneamente cuando exista una secuencia visual.

Se puede utilizar una aparición escalonada (stagger) para listas y grupos de componentes.

Mantener retrasos pequeños y evitar animaciones que hagan esperar al usuario.

### 4.6. Rendimiento

Priorizar animaciones con `transform` y `opacity`.

Evitar animar constantemente:

- `width`.
- `height`.
- `top`.
- `left`.
- Propiedades que provoquen recálculos de layout innecesarios.

Utilizar `will-change` únicamente cuando exista una necesidad demostrable.

Respetar `prefers-reduced-motion` y ofrecer una experiencia accesible para usuarios que prefieran movimiento reducido.

## 5. Componentes e interacciones premium

### Botones

Cada botón debe comunicar claramente su importancia.

Jerarquía:

- Primary: acción principal de la pantalla.
- Secondary: acción complementaria.
- Tertiary: acciones de bajo énfasis.
- Destructive: acciones irreversibles o peligrosas.

Reglas:

- No utilizar varios botones primarios compitiendo entre sí.
- Mantener dimensiones consistentes.
- Evitar iconos innecesarios.
- Incorporar estados hover, active, focus, disabled y loading.
- El estado loading debe preservar el contexto de la acción.
- Evitar que el botón cambie drásticamente de tamaño durante una operación.

### Modales y paneles laterales

Los modales deben sentirse integrados en el producto.

Para EventHive:

- Mantener el patrón de apertura desde el borde derecho.
- Preservar los datos e inputs existentes.
- Mejorar la distribución y jerarquía sin alterar la lógica de negocio.
- Utilizar animaciones de entrada y salida naturales.
- Mantener una estructura clara entre encabezado, contenido y acciones.
- Evitar scrolls innecesarios y anidados.
- Permitir cerrar mediante Escape cuando corresponda.
- Gestionar correctamente el foco y la accesibilidad.

Los compositores de correo deben conservar su identidad inspirada en la ventana de redacción de Gmail, mejorando la ergonomía y la presentación sin perder sus funcionalidades.

### Formularios

Los formularios deben ser simples, comprensibles y rápidos.

- Utilizar etiquetas descriptivas.
- No depender exclusivamente de placeholders.
- Mostrar validaciones cerca del campo correspondiente.
- Diferenciar errores, advertencias y estados correctos.
- Evitar mensajes genéricos.
- Mantener los valores cuando ocurre un error.
- Agrupar campos relacionados.
- Mostrar campos condicionales únicamente cuando sean necesarios.

### Dropdowns y menús

- Apertura rápida y fluida.
- Cierre intuitivo.
- Posicionamiento correcto respecto al elemento de origen.
- Navegación mediante teclado.
- Estados hover y selected claramente diferenciados.
- Evitar menús excesivamente grandes.

### Tablas y listados

No eliminar tablas cuando sean necesarias para gestionar información.

Sin embargo, deben diseñarse para ser legibles y funcionales.

- Reducir ruido visual.
- Evitar bordes en todas las direcciones.
- Mantener encabezados discretos.
- Alinear correctamente números y textos.
- Utilizar acciones contextuales.
- Incorporar estados vacíos bien diseñados.
- Mantener filtros y búsqueda accesibles.

## 6. Estados y feedback del sistema

Una interfaz premium no solo se ve bien cuando todo funciona. También debe comunicar correctamente cuando algo está cargando, falla o no tiene información.

Diseñar siempre:

- Loading states.
- Skeletons cuando realmente mejoren la percepción de carga.
- Empty states.
- Error states.
- Success feedback.
- Disabled states.
- Estados de conexión o sincronización cuando correspondan.

Evitar loaders genéricos que bloqueen toda la pantalla.

Priorizar feedback localizado y contextual.

Los estados vacíos deben explicar qué sucede y, cuando sea posible, ofrecer una acción útil.

## 7. Experiencia de usuario y comportamiento inteligente

Pensar como diseñador de producto, no solamente como diseñador visual.

Cada decisión debe reducir la fricción del usuario.

Aplicar los siguientes principios:

- Reconocimiento antes que memorización.
- Visibilidad del estado del sistema.
- Prevención de errores.
- Consistencia entre pantallas.
- Feedback inmediato.
- Acciones reversibles cuando sea posible.
- Divulgación progresiva de información.
- Reducción de pasos innecesarios.

Las acciones frecuentes deben ser fáciles de encontrar.

Las acciones destructivas deben requerir confirmación proporcional a su impacto.

No introducir funcionalidades o interacciones que no tengan relación con el contexto de negocio.

## 8. Detalles de calidad que marcan la diferencia

Prestar especial atención a los detalles que diferencian un producto promedio de uno premium:

- Alineación óptica de iconos y textos.
- Altura de línea apropiada.
- Contraste correcto.
- Consistencia en las dimensiones.
- Estados hover discretos.
- Transiciones sin saltos.
- Bordes perfectamente alineados.
- Espaciado uniforme.
- Textos sin cortes inesperados.
- Comportamiento correcto en diferentes resoluciones.
- Scrollbars discretos.
- Focus rings accesibles.
- Prevención de layout shifts.
- Manejo adecuado de contenido largo.

Los iconos deben pertenecer a una misma familia visual. No mezclar estilos outline, filled y duotone sin una justificación.

## 9. Responsive Design

Diseñar pensando en diferentes dispositivos desde el principio.

No limitarse a reducir el tamaño de los componentes.

Adaptar la composición según el espacio disponible:

- Desktop: composición completa y aprovechamiento del espacio.
- Tablet: reorganización de columnas y controles.
- Mobile: priorización del contenido y simplificación de navegación.

Evitar scroll horizontal accidental.

Los elementos interactivos deben tener áreas de contacto adecuadas para dispositivos táctiles.

## 10. Reglas de implementación técnica

La calidad visual nunca debe comprometer la calidad del código.

- Reutilizar componentes existentes.
- Respetar la arquitectura del proyecto.
- Mantener separación de responsabilidades.
- Evitar duplicación de estilos.
- Utilizar variables y tokens globales.
- No introducir dependencias innecesarias.
- Evitar CSS excesivamente complejo.
- No utilizar valores arbitrarios cuando exista un token equivalente.
- Mantener componentes pequeños y reutilizables.
- Evitar lógica de negocio dentro de componentes exclusivamente visuales.
- Mantener las funcionalidades existentes.
- No modificar contratos de API sin necesidad.

Antes de implementar, inspeccionar el código existente y comprender cómo funciona la pantalla.

No reemplazar una implementación funcional por una nueva arquitectura sin una razón técnica clara.

### Optimización de rendimiento y carga de información

La aplicación debe estar diseñada para manejar grandes volúmenes de información sin comprometer el rendimiento.

- Implementar paginación en listados, tablas, directorios, historiales y cualquier componente que pueda manejar grandes cantidades de registros.
- Nunca solicitar todos los registros de una entidad cuando solamente se necesita mostrar una parte.
- Priorizar la paginación desde el backend mediante parámetros de página, límite y filtros.
- Mantener sincronizados los filtros, la búsqueda y la paginación.
- Reiniciar la página actual cuando un cambio de filtro o búsqueda lo requiera.
- Implementar lazy loading para imágenes, componentes, módulos y recursos que no necesitan cargarse inmediatamente.
- Cargar componentes pesados únicamente cuando sean necesarios.
- Evitar solicitudes duplicadas e innecesarias a la API.
- Evitar cargar información que no se utiliza en la vista actual.
- Priorizar la carga progresiva cuando mejore la experiencia del usuario.
- Mantener una navegación fluida al cambiar entre páginas y filtros.

La optimización no debe comprometer la integridad de los datos ni provocar comportamientos inconsistentes.

## 10.1. Integridad de datos e integración con API

La interfaz debe trabajar siempre con información real proporcionada por el backend. Nunca se deben introducir datos estáticos para simular información que el sistema obtiene mediante una API.

**Regla estricta: los datos de la API son la única fuente de verdad para la información dinámica del sistema.**

- No agregar nombres, usuarios, eventos, organizaciones, fechas, estadísticas, cantidades, estados ni registros ficticios.
- No utilizar arrays de objetos estáticos para rellenar tarjetas, tablas, listados, gráficos o componentes que deben consumir información del backend.
- No reemplazar respuestas de la API por valores escritos directamente en el frontend.
- No utilizar información de ejemplo para hacer que una pantalla parezca completa.
- No inventar métricas, porcentajes, contadores ni resultados.
- No mantener datos duplicados en el frontend cuando ya existen en la respuesta de la API.
- No asumir que un dato existe si no viene en la respuesta del backend.
- No alterar ni reinterpretar los valores recibidos sin una necesidad funcional.

### Consumo de datos

Antes de implementar o modificar una interfaz:

1. Identificar los endpoints disponibles.
2. Revisar los servicios y hooks existentes.
3. Analizar la estructura de las respuestas de la API.
4. Identificar qué campos alimentan cada componente.
5. Reutilizar las integraciones existentes siempre que sea posible.
6. Conectar cada componente a los datos reales correspondientes.

Si un componente necesita información que todavía no está disponible, identificarlo y comunicarlo. No solucionar la ausencia de información inventando datos.

### Estados de información

Cada componente conectado a una API debe contemplar correctamente:

- Loading: mientras se obtienen los datos.
- Success: cuando la API devuelve información.
- Empty: cuando la respuesta es válida, pero no contiene registros.
- Error: cuando falla la solicitud.
- Partial data: cuando algunos campos opcionales no están disponibles.

No confundir una respuesta vacía con un error.

### Datos de demostración

Los datos mock o fixtures solamente pueden utilizarse cuando se solicite explícitamente desarrollar una demostración, prototipo o prueba aislada.

Nunca deben quedar integrados accidentalmente en una funcionalidad que trabaja con datos reales.

### Seguridad y exposición de información

- Nunca mostrar IDs internos de registros en la interfaz de usuario.
- No utilizar identificadores de base de datos como elementos visuales, etiquetas, textos o información de referencia para el usuario.
- Evitar exponer IDs internos en URLs visibles, mensajes de error, notificaciones o componentes de información.
- Utilizar nombres, títulos, códigos públicos o referencias diseñadas para el usuario cuando sea necesario identificar un registro.
- Mantener los identificadores internos exclusivamente para las operaciones técnicas que los necesiten.
- No exponer información sensible proveniente de las respuestas de la API.
- No asumir que ocultar un identificador en la interfaz es suficiente: respetar también los controles de autorización y seguridad del backend.

**Regla definitiva: si la API proporciona un dato, utiliza ese dato. Si no lo proporciona, no lo inventes.**

## 11. Reglas estrictas para trabajar sobre interfaces existentes

Cuando se solicite rediseñar una pantalla:

1. Analizar la implementación actual.
2. Identificar los datos y funcionalidades existentes.
3. Reconocer los componentes reutilizables.
4. Identificar problemas de jerarquía, distribución e interacción.
5. Definir una dirección visual coherente.
6. Implementar el rediseño.
7. Verificar que todas las funcionalidades originales continúen funcionando.
8. Revisar responsive, accesibilidad y estados.

**No eliminar campos, botones, filtros, acciones ni funcionalidades existentes por considerarlos visualmente innecesarios.**

Si un elemento necesita cambiar, mejorar su presentación y comportamiento, pero conservar su propósito funcional.

No inventar datos ni utilizar contenido ficticio cuando la pantalla debe trabajar con información real.

## 12. Criterio de evaluación final

Antes de considerar terminada una interfaz, evaluar:

| Criterio | Pregunta |
| --- | --- |
| Identidad | ¿Respeta la marca y el diseño existente? |
| Jerarquía | ¿Se comprende rápidamente la información? |
| Simplicidad | ¿Hay elementos que podrían eliminarse sin perder funcionalidad? |
| Consistencia | ¿Mantiene los mismos patrones que el resto del producto? |
| Interacción | ¿Cada acción ofrece feedback adecuado? |
| Animación | ¿Los movimientos se sienten naturales y tienen propósito? |
| Accesibilidad | ¿Se puede utilizar mediante teclado y lectores de pantalla? |
| Responsive | ¿Funciona correctamente en diferentes tamaños? |
| Rendimiento | ¿Las animaciones y componentes son eficientes? |
| Código | ¿La implementación es limpia y mantenible? |

## 13. Directriz final

No diseñes para impresionar durante los primeros cinco segundos. Diseña para que el usuario disfrute utilizar el producto durante meses.

Prioriza la claridad sobre el espectáculo, la precisión sobre la decoración y la experiencia sobre las tendencias.

Cada pantalla debe sentirse parte de un mismo ecosistema, con personalidad propia, pero con una identidad visual coherente.

**El resultado debe transmitir calidad, confianza, madurez tecnológica y atención al detalle.**

No busques que parezca una plantilla SaaS premium. Construye un producto que realmente se sienta premium.
