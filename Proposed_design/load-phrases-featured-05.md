# Especificación de diseño: Load Phrases — concepto 05

## Concepto elegido

Desarrollar el flujo de [Load Phrases destacado](../Proposed_prototypes/09-load-phrases-featured.svg) y su pantalla de [carga de archivo](../Proposed_prototypes/10-carga-csv-destacada.svg).

La pantalla principal de Load Phrases es una vista completa de la aplicación con cuatro tarjetas de selección. La tarjeta **Load from file** tiene mayor jerarquía visual; al seleccionarla, la vista cambia a una pantalla completa con el selector de archivos CSV/TXT. No usar un bottom sheet, tirador, fondo modal ni gesto de arrastre.

## Mapeo al producto existente

Conservar el menú principal inferior y marcar **Load** como activo durante todo el flujo. Reutilizar las opciones y capacidades existentes:

| Opción | Descripción visible | Destino / control existente |
|---|---|---|
| Prompt (Load using OpenAI) | Create a custom phrase set from a topic. | Formulario de IA: `aiTopic`, `aiLevel`, `aiQuantity`, `aiMinWords`, `openaiToken` y `btnLoadAI`. |
| Load from file | Use a phrase list from your device. | Pantalla de archivo descrita abajo; reutiliza `fileInput`. |
| Predefined Sets | Browse the available phrase library. | `predefinedSelect` y `btnLoadPredefined`. |
| Courses | Study structured courses, units and lessons. | Entrada al catálogo existente `coursesApp`. |

Cada destino debe ser una vista completa dentro de la SPA. Al reorganizar los controles, mantener sus identificadores, comportamiento, etiquetas y estados vinculados; no duplicar controles funcionales.

## Pantalla 1: selector de fuentes

- Mantener la cabecera **Language Practice** y el indicador de par de idiomas, siguiendo la estructura del `.topbar`.
- Mostrar el título **Load Phrases** y una breve instrucción.
- Presentar primero una tarjeta destacada **Load from file**, con icono de importación, descripción, formatos CSV/TXT y affordance de navegación.
- Debajo, presentar **Prompt (Load using OpenAI)**, **Predefined Sets** y **Courses** como tarjetas secundarias. Cada tarjeta conserva su nombre y una descripción corta, sin ocultar ninguna opción.
- Mantener el menú inferior persistente; resaltar **Load** y respetar los estados de foco y selección actuales.
- Incluir una indicación discreta: **Phone Back or tap Load again to close**.

## Pantalla 2: Load from file

- Reemplazar el contenido del selector dentro de la misma vista de aplicación; no abrir una ventana o panel superpuesto.
- Mostrar la ruta **Load Phrases / Load from file**, el título **Load from file** y una explicación breve.
- Presentar una tarjeta de acción dominante con **Browse files** y la nota **CSV · TXT**.
- Usar el control de archivo existente (`fileInput`, `accept=".csv,.txt"`). Elegir un archivo inicia la importación automáticamente, como en el comportamiento actual; no añadir un botón manual **Load** ni controles de delimitador, encabezado, columnas o vista previa que no existen en la aplicación.
- Mostrar el nombre seleccionado cuando esté disponible. Después de leer el archivo, indicar claramente que se cargó y que la sesión de frases se actualizó. Mantener la vista actual abierta hasta que el usuario navegue con el menú.
- Si no se selecciona archivo, conservar el estado inicial sin modificar la sesión.

## Estilo visual

- Seguir los tokens existentes: superficies oscuras (`--panel`, `--surface`, `--surface-soft`), texto `--ink`/`--muted`, borde `--border` y acento `--primary`. Usar los acentos de la navegación para distinguir acciones sin apartarse del tema activo.
- Reutilizar la tipografía, radios generosos, contornos y tratamientos de foco del proyecto. Evitar degradados, ilustraciones externas o paletas ajenas a la interfaz.
- Reservar el acento azul para la tarjeta y la acción de archivo; mantener contraste suficiente para texto descriptivo y estados.
- Entrar a la vista completa con una transición breve de opacidad o desplazamiento leve del contenido, no con la animación vertical de un panel desde abajo. La navegación debe seguir funcionando con movimiento reducido.

## Controles, interacciones y navegación

1. Tocar **Load** desde otra sección abre Load Phrases a pantalla completa.
2. Tocar una tarjeta navega a la pantalla de su procedimiento. La tarjeta de archivo abre el formulario CSV/TXT; las demás conservan los controles y flujos existentes.
3. En el formulario de archivo, **Browse files** abre el selector del sistema. La selección activa el procesamiento existente sin requerir confirmación adicional.
4. La ruta **‹ Load Phrases** vuelve al selector de fuentes sin cerrar la experiencia.
5. El botón **Load** del menú funciona como alternador: volver a tocarlo cierra la experiencia completa y regresa a la pantalla principal de práctica, incluso desde el formulario de archivo.
6. El botón Atrás del dispositivo cierra la experiencia Load Phrases y vuelve directamente a la pantalla principal de práctica, conforme al comportamiento deseado documentado en `TODO.md`.
7. El resto de botones del menú principal conserva su comportamiento normal. Al cerrar, restaurar el estado de selección y accesibilidad del menú.

## Estados

| Estado | Presentación |
|---|---|
| Selector | Cuatro opciones disponibles; Load permanece activo. |
| Formulario sin archivo | Formatos aceptados y acción Browse files visibles. |
| Selector del sistema abierto | Mantener el foco y no mostrar un estado de éxito anticipado. |
| Lectura/importación | Mensaje de progreso mientras el archivo elegido se lee y procesa. |
| Importación completada | Confirmar que el conjunto de frases fue actualizado; no simular éxito antes de completar la operación. |
| Cancelación del selector | Volver al formulario sin alterar el conjunto actual. |
| Error de lectura o procesamiento | Mostrar un mensaje explícito y permitir volver a intentar; no mostrar estado de éxito ni fallar silenciosamente. |

## Accesibilidad

- Implementar las tarjetas como botones/enlaces reales con nombres accesibles que incluyan nombre y propósito. Mantener un área táctil de al menos 44 × 44 px.
- Usar encabezados en orden, foco visible y navegación completa por teclado; al cambiar de vista, mover el foco al encabezado de destino y anunciar el cambio de pantalla.
- Asociar el texto de formatos admitidos y el estado de importación al control de archivo. Anunciar progreso, éxito y error mediante una región de estado accesible.
- No depender solo del color o de los iconos para indicar la tarjeta destacada, selección, formato o estado.
- El botón **Load** debe exponer su estado expandido/activo y conservar una etiqueta accesible clara. El botón Atrás del dispositivo debe devolver a práctica sin dejar foco atrapado.
- Respetar `prefers-reduced-motion`; asegurar contraste de texto y controles en los temas claro y oscuro.

## Comportamiento adaptable

- En anchos de escritorio/tableta, conservar la composición destacada con tarjetas secundarias en filas compactas.
- Por debajo del breakpoint móvil existente (559 px), apilar las cuatro tarjetas en una columna, con anchura completa y descripción legible.
- En el formulario CSV/TXT, mantener la acción Browse files a ancho completo en móvil; permitir que el nombre de archivo largo envuelva o se trunque de forma accesible.
- Considerar áreas seguras del dispositivo (`env(safe-area-inset-*)`) y dejar espacio para el menú inferior fijo. El contenido debe desplazarse verticalmente sin quedar tapado por la navegación.
- Verificar como mínimo anchos de 320 px y 390 px, y orientación horizontal. No permitir desplazamiento horizontal.

## Criterios de aceptación

1. Load Phrases se abre como vista completa; no se puede descartar arrastrando una hoja.
2. Las cuatro fuentes actuales aparecen en tarjetas con nombre y descripción, conservando sus destinos y controles.
3. Load from file abre una pantalla completa con selector CSV/TXT y mantiene la importación automática existente.
4. El nombre del archivo, progreso, éxito, cancelación y error se representan sin mensajes de éxito falsos ni fallos silenciosos.
5. El menú Load permanece seleccionado en ambas vistas; tocarlo de nuevo o pulsar Atrás del dispositivo cierra el flujo y vuelve a práctica.
6. La ruta **‹ Load Phrases** vuelve al selector sin cerrar el flujo.
7. El diseño mantiene la tipografía, tokens de color, radios, iconos y navegación de la aplicación en temas claro y oscuro.
8. Las tarjetas, el selector y el menú funcionan con teclado y lector de pantalla, respetan movimiento reducido y no causan overflow en móvil.
