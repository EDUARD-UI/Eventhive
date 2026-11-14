# Tarea: Optimización de Rendimiento y Lazy Loading en el Frontend (React)

## Objetivo

Implementar estrategias de carga diferida (**Lazy Loading**) para reducir drásticamente el tiempo de carga inicial, optimizar el consumo de ancho de banda y mejorar la percepción de velocidad de la aplicación, manteniendo en todo momento una **excelente experiencia de usuario (UX)** sin saltos visuales ni pantallas en blanco.

---

## Requerimientos Técnicos

### 1. Lazy Loading de Imágenes (Nativo + Prevención de CLS)

* Agregar el atributo nativo `loading="lazy"` y `decoding="async"` a todas las etiquetas `<img>` que se encuentren fuera del *viewport* inicial (tarjetas de eventos, listados, banners secundarios, avatares).
* **Excepción importante (LCP):** No aplicar `loading="lazy"` en el banner principal o imagen héroe que aparece apenas abre la página; a esa imagen agregarle `fetchpriority="high"` para que cargue de inmediato.
* **Cuidado de UX (Layout Shift):** Definir siempre dimensiones explícitas (`width` y `height` o CSS `aspect-ratio`) y un fondo suave o color placeholder mientras se descarga la imagen para evitar que el contenido salte o se mueva al cargar.

### 2. Lazy Loading de Datos y Paginación (Intersection Observer / Scroll Infinito)

* Evitar traer listas gigantescas en una sola petición al backend. Consumir los endpoints paginados (`?page=0&size=10`).
* Implementar la API nativa `IntersectionObserver` (o `useInView` / TanStack Query `useInfiniteQuery` si ya está instalado en el proyecto) mediante un elemento centinela al final de las listas o secciones pesadas.
* **Cuidado de UX:**
  * Usar **Skeleton Loaders** (esqueletos animados con la forma de las tarjetas) durante la primera carga en lugar de spinners genéricos centrados.
  * Mostrar un indicador discreto al final de la lista cuando se estén cargando los siguientes registros.
  * Manejar correctamente el estado cuando ya no haya más datos por cargar (`hasMore = false`) y mostrar mensajes amigables con botón de "Reintentar" si falla la red.

### 3. Lazy Loading de Rutas y Componentes Pesados (`React.lazy` + `Suspense`)

* Implementar *Code Splitting* a nivel de rutas principales (ej. paneles administrativos, checkout, perfil de usuario) y componentes pesados (modales complejos, mapas, gráficas o editores) usando `React.lazy()`.
* Envolver estos componentes en `<Suspense>` con un `fallback` visual limpio (un skeleton de página o barra de progreso superior) para que la transición sea fluida y nunca muestre una pantalla en blanco.

---

## Criterios de Aceptación y Validación

1. **Sin saltos visuales:** La interfaz mantiene su estructura fija mientras cargan las imágenes y los datos.
2. **Carga progresiva:** Al abrir la aplicación, en la pestaña *Network* del navegador solo se descargan los datos iniciales, las imágenes visibles y el JavaScript necesario para la vista actual.
3. **Resiliencia:** Si una imagen falla al cargar, se muestra una imagen por defecto (*fallback*) sin romper el diseño de la tarjeta.
