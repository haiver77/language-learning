# Funcionalidad de cursos

Este documento describe la experiencia gráfica y el comportamiento funcional y técnico para consultar cursos estructurados en carpetas, seleccionarlos y estudiar sus unidades usando los CSV de lecciones.

## Estructura y fuente de datos

Cada curso es una carpeta dentro de `courses/` y contiene los metadatos del curso, el CSV que asigna vocabulario foco a unidades y una carpeta `Units/`. Cada unidad tiene sus propios metadatos y una carpeta `Lessons/` con un CSV por vocabulario foco:

```text
courses/<id-del-curso>/
├── course_details.json
├── course_vocabulary_focus_by_unit.csv
├── course_vocabulary_complementary_by_unit.csv   (opcional)
└── Units/
    └── Unit_N/
        ├── unit_details.json
        └── Lessons/
            └── <vocabulario-foco>.csv
```

Los campos utilizados de `course_details.json` son `id`, `title`, `description`, `level`, `idioma_nativo`, `idioma_destino`, `focusVocabularyCount`, `supplementaryVocabularyCount` y `practiceType`. `idioma_nativo` y `idioma_destino` contienen los códigos de idioma reconocidos por la aplicación y determinan cómo interpretar las dos columnas de los CSV de lecciones. Cada elemento de `practiceType` define una modalidad con `id`, `name`, `description` y `rows`. Cada `unit_details.json` aporta `title`, `description`, `focusVocabularyCount` y `supplementaryVocabularyCount`. Los conteos de estos JSON son metadatos del curso; no se deben deducir de la cantidad de archivos que se hayan cargado ni del progreso del usuario.

`course_vocabulary_focus_by_unit.csv` relaciona cada elemento de vocabulario foco con una unidad; en el curso de ejemplo usa las columnas `vocabulary_focus;unit`. El CSV complementario, cuando existe, contiene las palabras complementarias agrupadas por unidad. Su ausencia no impide abrir un curso si el JSON reporta cero vocabulario complementario.

Los CSV de `Lessons/` no tienen encabezado: cada fila contiene primero el texto en el idioma nativo y luego su traducción al idioma destino, separados por punto y coma. El curso de ejemplo contiene frases en español e italiano. Al cargarlos, la aplicación debe mantener ese orden y configurar los idiomas correspondientes para que la práctica y la lectura de voz no intercambien los idiomas.

## Pantalla de cursos

Presenta los cursos disponibles, descubiertos a partir de sus carpetas y archivos `course_details.json`; no debe depender de una lista de cursos codificada manualmente.

Cuando haya un curso seleccionado y una unidad actual, se muestra siempre en la parte superior de la página el nombre del curso, el nombre de la unidad actual y el tipo de práctica activo. El nombre del tipo de práctica es interactivo: al hacer clic sobre él, se abre una pantalla con los tipos disponibles definidos en `course_details.json.practiceType`, mostrando el `name` y la `description` de cada uno. Al elegir uno, se actualiza el tipo activo, se construye inmediatamente el CSV combinado de la unidad según la configuración (`rows`) del `practiceType` seleccionado y la sesión se reinicia desde la primera frase de ese nuevo CSV. Este encabezado se mantiene visible durante la navegación entre la lista de cursos, los detalles y la práctica; al deseleccionar el curso, se oculta.

Cada tarjeta muestra:

- Título (`title`), nivel (`level`) y descripción breve (`description`).
- Vocabulario foco y complementario según sus conteos en `course_details.json`.
- Una marca `Current` para el curso actualmente seleccionado.
- Una barra de progreso cuando exista progreso guardado para ese curso.
- Una acción `Select` para seleccionar o reanudar el curso.
- Una acción `Deselect` en la tarjeta del curso actualmente seleccionado.

Al seleccionar un curso sin progreso, se abre su pantalla de detalles y se selecciona la primera unidad según el orden numérico de `Unit_N`. Si ya hay progreso o una sesión incompleta guardada, se ofrece reanudarla; de lo contrario, se abre la última unidad completada. Abrir la tarjeta del curso lleva a la pantalla de detalles, sin iniciar por sí solo una práctica.

`Deselect` quita la selección actual del curso, la marca `Current` y el encabezado superior. No descarga ni modifica el CSV combinado de la sesión activa. La sesión conserva internamente la asociación con su curso y unidad, por lo que, si el usuario la continúa hasta completarla, se actualizan los contadores de esa unidad. Seleccionar otro curso inicia o reanuda la sesión de ese curso.

## Pantalla de detalles del curso

Muestra el título y la descripción del curso y la lista de unidades encontradas en `Units/`, ordenadas numéricamente. Cada tarjeta de unidad muestra:

- Título y descripción de `unit_details.json`.
- Conteos de vocabulario foco y complementario de ese JSON.
- El progreso de la unidad, si existe.
- Una acción `Select` que establece la unidad actual del curso y permite comenzar o reanudar su práctica.
- Una acción `Details` que abre la `pantalla detalles unidad`.

La unidad seleccionada debe quedar identificada visualmente. Seleccionar una unidad no altera los archivos JSON del curso.

## Pantalla de detalles de unidad

Muestra el título y la descripción de `unit_details.json` y dos pestañas:

- `Vocabulario foco`: lista de palabras de esa unidad tomadas de `course_vocabulary_focus_by_unit.csv`.
- `Vocabulario complementario`: lista de palabras de esa unidad tomadas de `course_vocabulary_complementary_by_unit.csv`.

Cada palabra muestra su nivel de dominio, su cantidad de prácticas y, cuando corresponda, cuántas veces se pronunció correctamente. Si el curso declara cero vocabulario complementario y no incluye el CSV complementario, la pestaña muestra un estado vacío informativo.

## Flujo de lección

1. Al seleccionar una unidad, se obtienen sus vocabularios foco y complementario de los respectivos CSV de asignación. Estas listas conservan el orden del archivo para su presentación en las pestañas de detalles.
2. Se ofrece la selección de tipo de práctica a partir de `course_details.json.practiceType`. El usuario abre la pantalla de selección haciendo clic en el tipo activo del encabezado; allí cada opción muestra `name` y `description`. Si aún no hay una selección guardada, se activa la primera opción del arreglo. El modo elegido se muestra en el encabezado y se conserva al reanudar.
3. La propiedad `rows` contiene los números de las filas de datos que deben incluirse de cada CSV de lección. La numeración empieza en 1 y los archivos no tienen encabezado. Para cada construcción del CSV combinado, se mezclan aleatoriamente los vocabularios foco de la unidad y se procesan sus archivos `Lessons/<vocabulario>.csv` en ese nuevo orden. Dentro de cada archivo se agregan las filas indicadas en `rows`, manteniendo el orden de ese arreglo y las columnas originales (idioma nativo y luego idioma destino).
4. El resultado combinado, no un único CSV de lección, se carga como el CSV actual de la sesión. En cursos, la frase actual siempre avanza secuencialmente por el orden del CSV combinado; se desactiva o ignora cualquier opción aleatoria de frase de los modos de práctica. La aleatoriedad solo determina el orden de los archivos de lección al construir el CSV.
5. `practiceType` y los modos de práctica existentes son selecciones independientes y compatibles. `practiceType` determina qué filas forman la sesión; Speaking, Intensive Challenge, Writing y los demás modos existentes determinan cómo se practica esa misma sesión, sin crear otro CSV ni cambiar su orden. Cambiar el modo de práctica conserva el CSV y la frase actual. Cambiar `practiceType` construye inmediatamente un CSV nuevo, vuelve a mezclar el orden de los archivos y reinicia la sesión desde su primera frase.
6. Al cerrar o recargar el navegador, se restaura la sesión incompleta con el mismo CSV combinado, su orden aleatorio ya generado, el `practiceType` y la frase actual. No se vuelve a mezclar una sesión que se está reanudando.
7. Los CSV del curso se consideran previamente validados. Si no se puede cargar un archivo requerido o una fila solicitada, la aplicación informa el recurso afectado y no inicia una sesión incompleta. Si el CSV combinado no contiene filas, tampoco se inicia la práctica.
8. La unidad se completa cuando el usuario avanza secuencialmente desde la primera hasta la última frase del CSV combinado. Solo entonces se incrementa una vez el contador de prácticas de cada palabra única asignada a esa unidad, tanto foco como complementaria. Cambiar `practiceType` o abandonar una sesión antes de llegar al final no incrementa los contadores.

## Progreso y estado del usuario

El progreso es información del usuario, no contenido del curso, por lo que se guarda separadamente de `course_details.json`, `unit_details.json` y los CSV. Se mantiene por curso, unidad y palabra única, usando las listas de vocabulario foco y complementario. Para cada palabra se guarda cuántas veces ha sido practicada y cuántas veces se ha pronunciado correctamente. Al completar la unidad, el contador de prácticas aumenta una vez para cada palabra de ambas listas; no se incrementa por cada frase individual ni por una sesión incompleta.

El progreso de pronunciación se actualiza en Speaking o Intensive Challenge cuando el reconocedor valida correctamente la palabra del vocabulario en el idioma destino, usando el umbral de similitud configurado para ese modo. Se cuenta una vez por palabra y por intento de pronunciación aceptado, no por cada actualización parcial del reconocimiento. Los demás modos no incrementan este contador.

## Configuración de cursos y dominio del vocabulario

La sección `Configuración` incluye `Configuración Cursos`, con cuatro valores numéricos editables:

| Configuración | Predeterminado |
|---|---:|
| `vocabulario_conocido` | 1 |
| `vocabulario_en_aprendizaje` | 2 |
| `vocabulario_aprendido` | 6 |
| `vocabulario_mastered` | 8 |

Estos valores son los mínimos de prácticas completadas para cada nivel. Con los valores predeterminados, una palabra con 0 prácticas está `Sin practicar`; con 1, `Conocida`; con 2–5, `En aprendizaje`; con 6–7, `Aprendida`; y con 8 o más, `Mastered`. Los valores deben ser enteros positivos y estar en orden estrictamente creciente. Al cambiarlos se recalcula la etiqueta de dominio usando los contadores existentes, sin modificar esos contadores.

Cada palabra obtiene puntos iguales a su cantidad de prácticas, limitados al umbral `vocabulario_mastered`. El progreso numérico de la unidad es el promedio de puntos de todo su vocabulario foco; su porcentaje se calcula respecto al umbral `vocabulario_mastered`. La unidad solo recibe el estado `vocabulario_mastered` cuando todas las palabras foco alcanzan ese umbral, independientemente del promedio. El progreso general del curso se calcula de la misma manera usando todo el vocabulario foco de todas las unidades. El vocabulario complementario tiene sus propios niveles y contadores, pero no se incluye en estos promedios ni determina el estado de dominio de una unidad o curso.

El estado de cada palabra, el contador de prácticas y el contador de pronunciaciones correctas se muestran en las pestañas de vocabulario de la pantalla de detalles de unidad. La selección actual, el `practiceType`, la frase actual y el orden exacto del CSV combinado de una sesión incompleta se guardan en el navegador para reanudarla.

## Integración técnica y validaciones

- La detección de cursos usa el mismo mecanismo que la lista `Predefined Sets`: consulta primero GitHub Contents API y, si falla o no encuentra cursos, usa el listado de directorios del servidor (`./courses/`) como alternativa. En ambos casos filtra las carpetas de cursos y obtiene `course_details.json` y sus recursos desde la ruta correspondiente. La aplicación requiere servirse por HTTP.
- Se valida que los JSON sean legibles y contengan los campos requeridos, que `idioma_nativo` y `idioma_destino` sean códigos reconocidos, que `practiceType` sea una lista de modalidades con `id`, `name`, `description` y una lista `rows` de enteros positivos, y que las unidades tengan orden numérico. Los CSV se consideran prevalidados durante la creación del curso; en tiempo de ejecución se comprueba que los recursos solicitados puedan cargarse y que el CSV combinado no quede vacío. Los errores de carga deben notificarse; no se inicia una sesión incompleta ni se oculta el error.
- Cada fila de la sesión combinada conserva metadatos internos que la relacionan con el archivo y el vocabulario foco de origen; esta relación no se agrega como una columna al CSV de dos columnas que consume la práctica. El contador de prácticas se actualiza desde las listas de vocabulario de la unidad al completar la sesión. Para el contador de pronunciación, se relaciona la palabra objetivo con los tokens del idioma destino validados por el reconocedor.
- El CSV combinado se construye en memoria para la unidad y el tipo de práctica actuales; no modifica ni crea archivos dentro del curso. Se conservan todas las filas seleccionadas, incluso si su contenido se repite en otro archivo.
- Los conteos JSON se muestran como metadatos. Cuando estén disponibles, se contrastan con los CSV de asignación. Una diferencia se reporta como inconsistencia, no se corrige silenciosamente.
- Los CSV complementarios son opcionales: si el conteo complementario es cero y el archivo no existe, se muestra cero. Si el conteo es mayor que cero y falta el archivo, se informa que el catálogo complementario no está disponible.
- Los archivos de lección se procesan con el delimitador `;` y el formato CSV existente, que admite campos entrecomillados. No se debe tratar la primera fila como encabezado.
- La selección del curso y la unidad, el `practiceType`, la frase actual, el orden generado de la sesión y los contadores de vocabulario practicado y pronunciado correctamente se persisten en el almacenamiento local del navegador. La implementación actual no sincroniza datos entre navegadores o dispositivos; la estructura debe permitir incorporar Firebase para sincronización en una versión futura. Ningún estado del usuario se escribe en la carpeta del curso.

## Correspondencia con el curso de ejemplo

`courses/ESIT-NounsFrequentlyUsedByRank_Top500/` tiene `course_details.json`, `course_vocabulary_focus_by_unit.csv` y 17 carpetas de unidad. El JSON del curso declara nivel `A1`, 498 elementos de vocabulario foco y cero complementarios. Los JSON de unidad declaran sus propios títulos, descripciones y conteos; por ejemplo, `Unit_1` tiene 30 elementos foco y `Unit_17` tiene 18.

El curso de ejemplo no incluye `course_vocabulary_complementary_by_unit.csv`, lo cual concuerda con su conteo complementario de cero. Sus lecciones son CSV de dos columnas con ejemplos español–italiano, sin encabezado; su `course_details.json` identifica los idiomas con `idioma_nativo: "es"` e `idioma_destino: "it"`. `course_details.json` define tres modos en `practiceType`: `Práctica individual` usa la fila 1 de cada CSV; `Uso simple` usa las filas 1, 2 y 3; y `Uso en preguntas` usa la fila 4. Por ejemplo, al seleccionar `Uso simple`, se agregan primero las filas 1, 2 y 3 del CSV del primer vocabulario de la unidad y luego las filas 1, 2 y 3 del CSV del siguiente vocabulario, siguiendo el orden de `course_vocabulary_focus_by_unit.csv`. La interfaz debe reflejar esos datos y no asumir que todos los cursos tienen vocabulario complementario ni otros campos que no estén definidos en sus JSON.

## Navegación

- La opción `Cursos` se agrega a las opciones existentes de `Load Phrases` (`Prompt`, `Load from file` y `Predefined Sets`) y abre la pantalla de cursos.
- Seleccionar la tarjeta de un curso abre su pantalla de detalles.
- Seleccionar una unidad establece la unidad actual. Al iniciar o reanudar su práctica, se construye y carga en la sesión un CSV combinado con las frases de todos los CSV de lecciones de esa unidad que correspondan a las filas definidas por el `practiceType` activo.
- Volver a cursos conserva el progreso y permite cambiar de curso o unidad.
