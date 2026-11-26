# EVENTHIVE — Client Design System Skill

**Versión:** 1.0  
**Ámbito:** Todas las vistas de cliente, excepto Backstage.  
**Prioridad:** Mantener la identidad visual existente, mejorar la experiencia y optimizar el rendimiento.

---

## 1. Filosofía de diseño

EventHive debe conservar su identidad visual y evolucionar sobre ella.

La referencia principal y fuente de verdad es el Home actual de EventHive.

El objetivo es conseguir interfaces premium, limpias, modernas, intuitivas y visualmente consistentes, sin caer en diseños genéricos generados por IA.

**No rediseñar desde cero. No inventar. No alterar el maquetado sin necesidad.**

Cada modificación debe respetar:

- La estructura existente.
- La distribución original de los componentes.
- Los colores de marca.
- Los datos y textos actuales.
- Las funcionalidades implementadas.
- Los patrones de interacción existentes.

La mejora debe sentirse como una evolución natural del producto.

## 2. Identidad visual EventHive

Tomar como referencia el Home existente.

### Paleta

- Naranja y amarillo: identidad, acciones principales y acentos.
- Azul noche y negro: contraste, profundidad y elementos destacados.
- Blanco y grises claros: superficies, fondos y separación visual.
- Colores secundarios: únicamente los que ya existan en el proyecto.

No introducir nuevos colores de marca sin justificación.

No convertir todas las vistas en interfaces oscuras.

### Tipografía

- Respetar las fuentes existentes.
- Mantener una jerarquía clara entre títulos, subtítulos y contenido.
- Utilizar pesos tipográficos con intención.
- Evitar mezclar demasiadas familias tipográficas.
- No utilizar textos pequeños para información importante.
- Evitar títulos excesivamente grandes cuando no aporten jerarquía.

### Superficies y componentes

- Bordes sutiles.
- Radios consistentes.
- Sombras moderadas y naturales.
- Espaciados equilibrados.
- Contraste suficiente.
- Componentes visualmente relacionados.

No aplicar sombras, bordes o fondos por defecto a todos los elementos.

## 3. Preservación del diseño y maquetado

Esta es una regla obligatoria.

Antes de modificar una vista:

1. Inspeccionar el componente actual.
2. Identificar su estructura y distribución.
3. Reconocer los componentes reutilizables.
4. Identificar sus datos, acciones y estados.
5. Comprender qué elementos son funcionales y cuáles son puramente visuales.
6. Aplicar mejoras sobre la implementación existente.

No reemplazar una estructura funcional por otra simplemente porque resulte más atractiva.

No crear nuevas secciones, tarjetas, estadísticas, indicadores, botones o textos que no hayan sido solicitados.

No eliminar información existente.

No cambiar la jerarquía de contenido sin una razón funcional o visual clara.

## 4. Minimalismo funcional

Evitar el exceso de elementos visuales.

**No utilizar por defecto:**

- Labels decorativos.
- Badges innecesarios.
- Chips para información que puede mostrarse directamente.
- Iconos decorativos junto a cada título.
- Emojis en interfaces.
- Separadores excesivos.
- Gradientes sin propósito.
- Fondos con patrones decorativos.
- Contenedores dentro de otros contenedores sin necesidad.
- Tarjetas repetidas para agrupar información que ya está relacionada.
- Elementos flotantes que no aportan funcionalidad.

Si un badge, label o indicador ya comunica información funcional importante, conservarlo cuando corresponda.

La regla no es eliminar información, sino evitar representarla mediante elementos adicionales innecesarios.

Cada elemento visual debe cumplir al menos una función: informar, organizar, orientar o permitir una interacción.

## 5. Referencias de diseño

Aplicar los principios de las siguientes referencias, adaptándolos a la identidad de EventHive.

### Emil Kowalski — Motion Design

Aplicar sus principios de animación:

- Las animaciones deben tener un propósito.
- Priorizar la respuesta inmediata a las acciones.
- Utilizar movimientos naturales y coherentes.
- Evitar animaciones repetitivas que cansen al usuario.
- Utilizar transiciones rápidas y elegantes.
- Mantener las animaciones de interfaz generalmente por debajo de 300 ms.
- Respetar el origen del movimiento.
- Evitar movimientos que parezcan artificiales.
- Respetar `prefers-reduced-motion`.

Referencia: <https://emilkowal.ski/ui/great-animations>

Referencia adicional: <https://emilkowal.ski/ui/7-practical-animation-tips>

### Apple Human Interface Guidelines

Aplicar sus principios de experiencia:

- Jerarquía visual clara.
- Consistencia entre componentes.
- Interfaces adaptables.
- Tipografía legible.
- Espaciado equilibrado.
- Controles fáciles de identificar y utilizar.
- Información organizada según su importancia.
- Accesibilidad y previsibilidad.

No copiar la apariencia de iOS. Adaptar sus principios a una aplicación web.

Referencia: <https://developer.apple.com/design/human-interface-guidelines/>

### Vercel Web Interface Guidelines

Aplicar sus recomendaciones técnicas y visuales:

- Alineación precisa.
- Diseño responsive.
- Contraste adecuado.
- Estados de interacción claros.
- Animaciones mediante propiedades eficientes.
- Evitar desplazamientos inesperados del contenido.
- Cargar imágenes de forma eficiente.
- Mantener controles accesibles.
- Evitar renderizados y cálculos innecesarios.

Referencia: <https://vercel.com/design/guidelines>

### Geist Design System

Tomar como referencia sus principios de consistencia:

- Jerarquía tipográfica.
- Sistemas de espaciado.
- Uso controlado del color.
- Bordes y superficies coherentes.
- Componentes reutilizables.

No copiar su identidad visual ni reemplazar la de EventHive.

Referencia: <https://vercel.com/geist/introduction>

### Impeccable Design Skill

Utilizar su metodología de trabajo:

- Critique: identificar problemas de diseño antes de modificar.
- Audit: revisar accesibilidad, rendimiento y responsive.
- Polish: perfeccionar detalles visuales.
- Distill: eliminar elementos innecesarios.
- Typeset: mejorar jerarquía tipográfica.
- Layout: corregir espaciados y alineaciones.
- Animate: añadir movimiento con intención.
- Optimize: mejorar rendimiento.

La aplicación de estos principios debe estar subordinada a la preservación del diseño original de EventHive.

Referencia: <https://github.com/pbakaus/impeccable>

---

## 6. Animaciones e interacciones

Las animaciones deben aportar calidad sin perjudicar la velocidad.

Priorizar:

- `transform`
- `opacity`
- Transiciones CSS.
- Microinteracciones.
- Estados hover, active y focus.
- Transiciones de entrada y salida cuando sean necesarias.

Duraciones orientativas:

| Interacción | Duración |
| --- | ---: |
| Hover y active | 100–150 ms |
| Controles y dropdowns | 150–250 ms |
| Modales y drawers | 200–300 ms |

Evitar:

- `transition: all`.
- Animaciones constantes sin propósito.
- Parallax innecesario.
- Efectos de blur costosos.
- Animaciones basadas en cambios frecuentes de dimensiones.
- Librerías de animación cuando CSS resuelve el problema.

Las animaciones nunca deben retrasar una acción funcional.

## 7. Responsive Design

EventHive es una aplicación web. El escritorio sigue siendo una prioridad, pero todas las vistas deben funcionar correctamente en dispositivos móviles.

### Desktop

- Conservar la distribución original.
- Aprovechar el espacio disponible.
- Mantener alineaciones y proporciones.
- Evitar contenido excesivamente extendido.

### Tablet

- Adaptar columnas y espacios.
- Reorganizar elementos cuando sea necesario.
- Evitar compresión de componentes.

### Mobile

- Reorganizar los componentes sin perder información.
- Evitar desbordamientos horizontales.
- Adaptar filtros, formularios y controles.
- Mantener botones cómodos para interacción táctil.
- Evitar textos cortados.
- Mantener una jerarquía visual clara.
- Adaptar modales y drawers al espacio disponible.

No resolver problemas responsive ocultando funcionalidades.

Utilizar CSS Grid, Flexbox y dimensiones fluidas antes de recurrir a cálculos mediante JavaScript.

## 8. Rendimiento y calidad del código

La velocidad de renderizado es una prioridad.

### Frontend

- Reutilizar componentes existentes.
- Evitar componentes duplicados.
- Evitar estados innecesarios.
- Reducir renders innecesarios.
- Evitar cálculos repetitivos durante el renderizado.
- Utilizar memoización únicamente cuando aporte beneficios reales.
- Evitar dependencias adicionales sin justificación.
- Utilizar lazy loading para recursos fuera del viewport inicial.
- Definir dimensiones de imágenes.
- Evitar cambios de layout durante la carga.
- No cargar recursos pesados que no sean necesarios.

### Arquitectura

- Mantener responsabilidades separadas.
- Evitar componentes excesivamente grandes.
- Extraer lógica compleja a hooks o funciones reutilizables cuando corresponda.
- No mezclar lógica de negocio con presentación.
- Mantener consistencia con la arquitectura actual del proyecto.
- Evitar código duplicado.
- No crear abstracciones innecesarias.

### Código limpio

- No dejar comentarios innecesarios.
- No comentar código evidente.
- No dejar código muerto.
- No dejar funciones sin utilizar.
- No introducir dependencias que no se utilicen.
- No crear soluciones temporales que permanezcan en producción.
- Mantener nombres claros y consistentes.

**Los comentarios solo deben utilizarse para explicar métodos complejos o decisiones técnicas que no sean evidentes al leer el código.**

## 9. Accesibilidad

- Contraste adecuado.
- Navegación mediante teclado.
- Estados de foco visibles.
- Textos legibles.
- Botones con nombres accesibles.
- Imágenes con alternativas descriptivas cuando corresponda.
- Formularios correctamente asociados a sus etiquetas.
- Soporte para reducción de movimiento.

Evitar sacrificar accesibilidad por estética.

## 10. Reglas para trabajar con IA

Antes de escribir código:

1. Revisar la implementación existente.
2. Identificar qué se puede reutilizar.
3. Entender el comportamiento actual.
4. Comparar la vista con el Home de EventHive.
5. Determinar qué mejoras son realmente necesarias.

Durante la implementación:

1. Conservar el maquetado original.
2. Reutilizar los estilos y componentes existentes.
3. Aplicar mejoras visuales puntuales.
4. Mantener intacta la lógica funcional.
5. Evitar inventar contenido o elementos.
6. Priorizar soluciones sencillas y eficientes.

Después de implementar:

1. Revisar el resultado en escritorio.
2. Revisar tablet y móvil.
3. Comprobar que no existan desbordamientos.
4. Verificar que todas las funcionalidades sigan funcionando.
5. Revisar consistencia visual con el Home.
6. Comprobar rendimiento y calidad del código.

No realizar ciclos interminables de rediseño. Identificar los problemas importantes, corregirlos y realizar una última verificación.

---

## 11. Regla de oro

**EventHive no necesita parecer otra plataforma. Necesita verse como una versión mejor diseñada de sí misma.**

Toda intervención debe mantener la identidad visual, el maquetado, la funcionalidad y la experiencia que ya existen.

El resultado debe ser limpio, premium, rápido, responsive y coherente.

No agregar por agregar. No rediseñar por rediseñar. No inventar por estética.

**Primero preservar. Después mejorar. Siempre optimizar.**
