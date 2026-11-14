## Pantalla "Course details"
- Use a distinct design for the course information section to differentiate it from the list of units. Currently, both use the same card layout, which creates visual confusion.

## Pantalla "Unit details"
- Compact height of the container where the focus and supplementary vocabulary are been displayed, reducing blank space on top and bottom.


# Bugs and existing issues
- The system incorrectly displays the "Current" tag on Unit 1 in multiple courses simultaneously. The expected behavior is that the system stores a single active course and unit, and only that specific unit within that course should be marked as "Current". No other courses or units should display the "Current" tag.


## Implementados y por confirmar
- Crear sonidos para cuando la palabra se pronuncia exitosamente también cuando la palabra se pronunció mal y cuando va a haber un cambio de palabra crea tres prototipos de sonido diferentes para cada acción para yo tomar decisión de cuál escoger. 

- Cuando el modo curso y una unidad están seleccionados:
Read Aloud Languages - Idioma nativo: Su flag de lectura en voz alta debe estar habilitado lo pueda marcar o desmarcar. En los reintentos (cuando falla la pronunciación), no se repite en idioma nativo.
Read Aloud - Idioma destino (aprendiendo): Su flag debe estar deshabilitado, ya que se reproduce según las reglas actuales (y es lo único que se repite en los reintentos).
Flujo: Si el flag nativo está activo, la aplicación pronuncia la palabra en el idioma nativo, espera la pronunciación del usuario y continúa con las reglas habituales.

* Crea un archivo Markdown llamado elementos-visuales.md que liste todas las pantallas de la aplicación y sus respectivos componentes de interfaz (checkboxes, pestañas, campos de texto, botones, etc.).
Objetivo: Establecer una nomenclatura estándar para referirme sin ambigüedades a cualquier elemento en futuros prompts de modificación o ajuste de comportamiento, optimizando su ejecución. Agrega este nuevo archivo markdown en el archivo de instrucciones para que sea actualizado cada vez que hay alguna actualización en el inventario de elementos gráficos.

- **Visibilidad Botón en Detalles de Unidad**
En la pantalla de detalles de unidad, al hacer scroll hacia abajo en las listas de vocabulario (foco y suplementario), el contenido inferior se corta y el botón de seleccionar unidad queda oculto.
​Por favor Ajustar el contenedor de desplazamiento (scroll view) para que permita llegar hasta el final y muestre correctamente todos los elementos inferiores, incluido el botón.

- **Botones redundantes Detalles Unidad** En la pantalla de detalles de la unidad (donde se muestra el vocabulario foco y complementario), aparecen dos botones redundantes para volver atrás en la esquina superior izquierda: "Back" y "Course Units". Por favor, elimina el botón "Course Units", ya que está de más.

- **No contar repeticiones como práctica** 
para el conteo del número de veces que el usuario práctica una palabra, no contar las veces que corresponden a las repeticiones forzada por causa de fallo.

- **Frases estudiadas en lugar de streak** Mostrar cantidad de frases estudiadas en el día actual donde actualmente se muestra el streak.

- **Actualización Aplicación** La función para detectar e instalar actualizaciones de la aplicación funciona correctamente en general, pero los cursos no se actualizan de forma satisfactoria.
​Es necesario revisar que cualquier cambio (nuevos cursos, modificaciones de contenido, interfaz o funcionalidades) notifique al usuario y le permita decidir si desea actualizar. Al aceptar, todo (cursos, interfaz y funcionalidades) debe sincronizarse con la última versión del repositorio en el dispositivo del cliente.

## TODO
 






• avisos de meta del día



• Diseña prototipos de animación de un cerebrito bebé corriendo feliz


