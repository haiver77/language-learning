# Todos los menus de opciones abren an pantalla completa
Cada opción del menú (modo práctica, visualización, escucha, etc.) debe abrirse como una página completa dentro de la misma aplicación en lugar de como paneles pequeños. Solo se debe conservar el menú inferior principal. 
 * Navegación fluida: Mantén la estructura de Single Page Application (SPA) cambiando el contenido principal según la opción seleccionada.
 * Opciones incluidas: Aplica este comportamiento a todas las secciones (Practice Mode, visualización, escucha, carga de frases, CSV y configuraciones).


# Boton atras redirije a pantalla princioal
Redirige el botón "Atrás" de Android directamente a la pantalla principal de la aplicación, sin importar en qué submenú se encuentre el usuario.
 * Comportamiento actual: Al pulsar "Atrás" desde una opción de menú, retrocede paso a paso por el historial de navegación.
 * Comportamiento deseado: Al pulsar "Atrás" desde cualquier sección interna, la aplicación envía al usuario de inmediato al inicio en lugar de cerrar vistas previas.


# Contexto de interface gráfica para funcionalidad de cursos en la aplicación.

## Definiciones:
 - `pantalla cursos`: Pantalla que presenta la lista de cursos disponibles, en cada curso se visualiza el nombre del curso, la cantidad de `vocabulario foco` y la cantidad de `vocabulario complementario`del curso. Si hay un curso actualmente selecconado, se muestra al principio, con alguna marca o tag de 'Current'. Si hay progreso registrado para el curso, se visualiza en una barra de progreso. También cada curso contiene un botón de "Select", si el usuario lo marca y no tiene registrado ningún progreso anterior para el curso, entonces se selecciona la primera unidad del curso, si tiene progreso, entonces se selecciona la última unidad que registra algún progreso.
 - `pantalla detalles de curso`: Pantalla que presenta los detalles de un curso, se muestra el título de curso, una breve descripción en la parte superior y luego una lista de unidades. La lista de unidades también son cajas verticales donde está el nombre de la unidad, descripción, cantidad de `vocabulario foco`, cantidad de `vocabulario complementario` y progreso de la unidad. También tiene un botón "Select" y otro de "Details", que en caso de ser seleccionado, el sistema registra que es la unidad seleccionada actual para el usuario. Si el usuario hace click en "Details", entonces se abre la `pantalla detalles unidad`.
 - `pantalla detalles unidad` muestra título unidad, descripción de unidad y luego 2 tabs con la lista de vocabulario foco y la lista de vocabulario complementario de la lección, esta lista se puede obtener a partir de los archivos course_vocabulary_complementary_by_unit.csv y course_vocabulary_focus_by_unit.csv del curso.

 ## Navegación
 
* Adicional a las opciones actuales que están disponible en la pantalla "Load Phrases" (Prompt, Load from file, Predefined Sets), existirá una opción adicional llamada "Cursos", si el usuario selecciona esa opción, se abrirá la `pantalla cursos`.
* Cuando el usuario da click en un curso, el objetivo es que el sistema lo lleve a la pantalla `pantalla detalles de curso`.




Read 
Completed with input: {
  "path": "C:\\GIT\\language_learning\\funcionalidad_cursos.md"
}

Read 
Completed with input: {
  "path": "C:\\GIT\\language_learning\\courses\\ESIT-NounsFrequentlyUsedByRank_Top500\\course_details.json"
}

Read , lines 1 to 48
Completed with input: {
  "path": "C:\\GIT\\language_learning\\funcionalidad_cursos.md",
  "view_range": [
    1,
    48
  ]
}

Read , lines 49 to 100
Completed with input: {
  "path": "C:\\GIT\\language_learning\\funcionalidad_cursos.md",
  "view_range": [
    49,
    100
  ]
}



1. **Idiomas del curso.** agrega `idioma_nativo` y `idioma_destino` a `course_details.json`.

2. **Progreso y finalización.** EL sistema guardará para el usuario las palabras practicadas y la cantidad de veces que sean practicado. esto se almacenará al finalizar la practica de toda la unidad (es decir, que el usuario recorrió desde la primera hasta la última frase).

3. **Cambiar modalidad durante una sesión.** El CSV se reconstruye inmediatamente, y la frase actual se resetea por la primera frase del nuevo CSV construido.

### Contrato técnico por precisar

5. **Descubrimiento de cursos.** Se menciona leer carpetas desde `courses/`, pero no cómo enumerarlas en el entorno de despliegue. Un servidor estático no necesariamente permite listar directorios; se necesita especificar un manifiesto, un endpoint o un mecanismo existente. Para resolver esto usa el mismo mecanismo que se está usando ahora para cargar los CSV de "predefined_phrases".

7. **Formato y errores de CSV.** Los CSV son prevalidados y no deberían haber incosistencia o malformaciones.

8. **Persistencia del estado.** Todo debe quedar persistido en el navegador del usuario y en versiones posteriores se espera usar firebase para sincronización de los datos.

### Inconsistencia que conviene corregir

En la sección de navegación aún se dice que iniciar o reanudar una lección carga “su CSV”. Eso puede interpretarse como cargar un archivo individual, aunque el flujo definido construye un **CSV combinado con varias lecciones de la unidad**. Resuelve esto indicando claramente que en el caso de cursos, el CSV siempre es combinado con varias lecciones de la unidad dependiendo la configuración `practiceType`.





Read , lines 1 to 100
Completed with input: {
  "path": "C:\\GIT\\language_learning\\funcionalidad_cursos.md",
  "view_range": [
    1,
    100
  ]
}

Search for `id="modeSelect"|Practice Mode|Intensive Challenge|Writing|Speaking|Load Phras...`

Read 
Completed with input: {
  "path": "C:\\GIT\\language_learning\\courses\\ESIT-NounsFrequentlyUsedByRank_Top500\\course_details.json"
}

Read , lines 68 to 100
Completed with input: {
  "path": "C:\\GIT\\language_learning\\funcionalidad_cursos.md",
  "view_range": [
    68,
    100
  ]
}





