# Funcionalidad de cursos

## Acceso y catálogo

Abre **Load Phrases > Courses** para consultar los cursos disponibles. El catálogo se descubre a partir de las carpetas de `courses/`; permite buscar por nombre o descripción, filtrar por nivel y consultar título, idioma objetivo, nivel, descripción, vocabulario y progreso. **View details** abre las unidades. **Select** selecciona el curso y reanuda directamente una sesión incompleta si existe; de lo contrario, abre sus detalles. En ese caso queda seleccionada la unidad con progreso más reciente o, si no hay progreso, la primera unidad. **Deselect** quita la selección y oculta el contexto del curso, sin borrar el progreso guardado.

## Unidades y vocabulario

Las unidades `Unit_N` se presentan en orden numérico. Sus tarjetas muestran título, descripción, cantidades de vocabulario foco y complementario, progreso y estado de dominio. **Select** inicia o reanuda la práctica de la unidad; **Details** abre su vocabulario.

Los detalles de unidad tienen pestañas para vocabulario foco y complementario. Las palabras aparecen en el orden de los CSV de asignación, con su nivel de dominio, prácticas completadas y pronunciaciones correctas. Si el curso declara cero palabras complementarias y no tiene el CSV correspondiente, la pestaña informa que no hay vocabulario complementario.

## Formato y sesión de práctica

El encabezado del curso muestra el curso, la unidad y el formato de práctica activo. Al pulsar el formato se pueden consultar sus opciones y descripciones. Al aplicar otra opción, la aplicación reconstruye la sesión de la unidad y la reinicia desde la primera frase.

El formato (`practiceType`) determina qué filas de las lecciones se incluyen; el modo de práctica general determina cómo se ejercitan esas frases. Para construir la sesión, la aplicación mezcla el orden de las palabras foco de la unidad, carga el CSV de cada palabra y agrega las filas indicadas por `rows`, en el orden configurado. La numeración de filas empieza en 1 y no cuenta encabezado. La sesión resultante avanza secuencialmente; el control **Random** queda desactivado mientras esté activa una sesión de curso.

Los idiomas del curso se aplican automáticamente: el idioma nativo ocupa la primera columna y el idioma destino es el objetivo de práctica. Una sesión incompleta conserva su CSV combinado, formato y posición para reanudarla sin volver a mezclar el orden.

## Progreso y configuración

- Al completar secuencialmente una sesión hasta su última frase, aumenta una vez el contador de prácticas de cada palabra única asignada a la unidad, tanto foco como complementaria. Una sesión incompleta no lo aumenta.
- En **Speaking Practice** e **Intensive Challenge**, una pronunciación correcta de la palabra foco suma una vez al contador de pronunciaciones correctas. Los demás modos no incrementan este contador.
- Los niveles se calculan a partir del contador de prácticas: **Sin practicar**, **Conocida**, **En aprendizaje**, **Aprendida** y **Mastered**. Los umbrales iniciales son 1, 2, 6 y 8 prácticas, respectivamente.
- **Settings > Course Settings** permite cambiar esos cuatro umbrales. Deben ser enteros positivos en orden estrictamente creciente; al guardarlos se recalculan los niveles y porcentajes sin alterar los contadores.
- El porcentaje de unidad y curso se calcula con el vocabulario foco, limitando los puntos por palabra al umbral **Mastered**. El vocabulario complementario tiene niveles y contadores propios, pero no determina esos porcentajes ni el estado de dominio de la unidad o del curso.

La selección, los umbrales, el progreso y las sesiones se guardan en el navegador. Los recursos de curso descargados se almacenan localmente para reutilizarlos; los que todavía no se han cargado requieren conexión.

## Datos de los cursos

Cada curso reside en `courses/<id>/` y contiene `course_details.json`, `course_vocabulary_focus_by_unit.csv`, el CSV complementario opcional y las carpetas `Units/Unit_N/`. Cada unidad incluye `unit_details.json` y `Lessons/<palabra>.csv`.

El JSON del curso define sus metadatos, los códigos de `idioma_nativo` y `idioma_destino`, cantidades de vocabulario y al menos un `practiceType` con `id`, `name`, `description` y una lista no vacía de filas positivas. Los CSV de lecciones tienen dos columnas —idioma nativo y destino—, separadas por punto y coma y sin encabezado. Los CSV de asignación relacionan palabras con unidades mediante columnas de vocabulario y unidad.

La aplicación valida metadatos, unidades, asignaciones y filas solicitadas. Si falta un recurso requerido, una fila seleccionada o el CSV combinado queda vacío, muestra el error y no inicia una sesión incompleta. Las diferencias entre cantidades declaradas y CSV de asignación se notifican como inconsistencias.
