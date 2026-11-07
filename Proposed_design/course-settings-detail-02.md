# Especificación de implementación: Course Settings — variante 02

## Concepto elegido

Implementar la pantalla de detalle de [02 — Course Settings: focused progression](../Proposed_prototypes/02-course-settings-detail.svg). La presentación convierte los cuatro umbrales en una secuencia vertical legible, conservando el propósito y las reglas de la configuración existente.

## Estructura y navegación

1. Encabezado de navegación con botón Atrás, título **Course Settings** y acción **Done**.
2. Introducción **Course progression** y el texto de ayuda **Repetitions to move along your course**.
3. Panel de cuatro hitos en orden: **Known**, **Learning**, **Learned** y **Mastered**. Cada fila contiene su posición en la secuencia, nombre, breve descripción y campo numérico.
4. Nota contextual que indica que cada número es editable y representa el conteo de repeticiones del hito.
5. Región de estado accesible para confirmaciones y errores de validación.

**Navegación:** abrir esta pantalla desde **Settings > Course Settings**. Atrás y Done retornan al menú Settings. No añadir una segunda confirmación de guardado: los cambios válidos se guardan al cambiar el valor, como en la aplicación actual.

## Controles, datos y comportamiento

| Hito | Valor inicial | Control actual |
|---|---:|---|
| Known | 1 | `courseKnownThreshold` |
| Learning | 2 | `courseLearningThreshold` |
| Learned | 6 | `courseLearnedThreshold` |
| Mastered | 8 | `courseMasteredThreshold` |

- Mantener campos numéricos editables, con mínimo 1 y paso 1.
- Guardar al evento `change` mediante `saveCourseThresholds`; persistir con `saveCourseState` y mantener las claves del estado `known`, `learning`, `learned` y `mastered`.
- Aceptar únicamente enteros positivos en orden estrictamente creciente. Si la entrada no es válida, conservar el estado guardado anterior, mantener el valor editado visible y anunciar: **Enter positive whole numbers in strictly increasing order.**
- Ante guardado válido, mostrar **Course mastery thresholds saved.** y refrescar los niveles y porcentajes afectados sin modificar contadores de práctica.
- Mantener el comportamiento vigente del guardado y su manejo de errores; Done solo vuelve al menú.

## Estilo visual

- Mantener la apariencia suave de la captura: fondo verde grisáceo claro, superficies blancas, bordes verde pálido, texto verde oscuro y acento verde para acciones y nodos.
- Usar el panel de esquinas redondeadas como agrupador de los cuatro hitos. La línea vertical conecta los nodos numerados y refuerza el orden.
- Dar prioridad visual al nombre del hito; ubicar la breve descripción debajo y el campo numérico alineado a la derecha.
- Conservar tipografía, escala, radios y tokens de tema del proyecto cuando se integre; no fijar colores claros en modo oscuro.
- Los campos deben tener contraste suficiente, borde visible y un estado de foco perceptible. El área interactiva debe permitir edición táctil cómoda.

## Estados e interacción

| Estado | Presentación |
|---|---|
| Inicial | Mostrar los cuatro valores guardados; si no existen, usar 1, 2, 6 y 8. |
| Edición | El campo conserva el valor escrito hasta que cambie; permitir edición directa del número. |
| Guardado válido | Guardar automáticamente y mostrar el mensaje de confirmación en la región de estado. |
| Valor inválido | No persistir ni actualizar progreso; mostrar el error de orden y positividad existente. |
| Carga / retorno | Al volver a entrar, leer los valores guardados actuales. |

No añadir steppers, deslizadores ni confirmación adicional: los controles siguen siendo entradas numéricas estándar.

## Accesibilidad

- Implementar el encabezado y las acciones como botones reales con nombres accesibles **Back** y **Done**; no usar texto decorativo como control.
- Asociar cada etiqueta visible al input correspondiente con `for`/`id`; conservar los IDs actuales para no romper los enlaces de JavaScript.
- Mantener `min="1"` y `step="1"` y proporcionar el texto de ayuda como descripción accesible de los campos, sin depender solo del color o de la posición en la secuencia.
- Mantener la región de estado con `role="status"` y `aria-live="polite"`; el error debe seguir siendo anunciado por tecnologías de asistencia.
- Garantizar navegación por teclado en orden visual, foco visible y contraste suficiente en temas claro y oscuro.
- Los nodos y la línea de progreso son decorativos; ocultarlos del árbol accesible o evitar que dupliquen información que ya comunican las etiquetas.

## Diseño adaptable

- En móvil, conservar una columna: rótulos y descripciones a la izquierda; inputs alineados a la derecha. Permitir que los textos largos se ajusten sin superponerse al campo.
- En pantallas estrechas (incluido 320 px), reducir espacios de forma gradual y permitir el ajuste de las descripciones; nunca producir desplazamiento horizontal.
- En pantallas amplias, limitar el ancho del panel de contenido y mantener la misma jerarquía vertical, sin estirar los campos numéricos.
- Respetar los temas existentes y las preferencias de movimiento del sistema; esta pantalla no requiere animación.

## Correspondencia con la aplicación

- Fuente de los inputs y validación: `index.html`, `#courseKnownThreshold`, `#courseLearningThreshold`, `#courseLearnedThreshold`, `#courseMasteredThreshold`, `#courseSettingsStatus` y `saveCourseThresholds`.
- La pantalla conserva el estado global del curso, sus umbrales, el recálculo de niveles y porcentajes, y la persistencia local existente.
- La especificación no altera la fórmula de progreso, los contadores ni el flujo de práctica del curso.

## Criterios de aceptación

1. La pantalla muestra los cuatro hitos en el orden actual con valores guardados o los valores iniciales 1, 2, 6 y 8.
2. Cada umbral se puede editar como entero positivo; un orden no estrictamente creciente produce el error actual y no se guarda.
3. Un cambio válido se guarda automáticamente, anuncia la confirmación y actualiza niveles/porcentajes sin cambiar contadores.
4. Atrás y Done retornan a Settings; volver a abrir la pantalla refleja el último estado persistido.
5. Las etiquetas están asociadas a sus campos; los mensajes se anuncian; todos los controles son utilizables con teclado y táctil.
6. La composición funciona a 320 px y en pantallas amplias, sin solapamiento ni overflow horizontal y con tema claro/oscuro.
