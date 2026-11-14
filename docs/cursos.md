# Funcionalidad de cursos

## Acceso y catálogo

Abre **Load Phrases > Courses** para consultar los cursos disponibles. El catálogo se descubre a partir de las carpetas de `courses/`; permite buscar por nombre o descripción, filtrar por nivel y consultar título, idioma objetivo, nivel, descripción, vocabulario y progreso. Abrir una tarjeta o pulsar **View details** muestra sus unidades sin cambiar la selección actual. Solo **Select** en una tarjeta del catálogo selecciona ese curso: reanuda directamente una sesión incompleta si existe; de lo contrario, abre sus detalles y selecciona la unidad con progreso más reciente o, si no hay progreso, la primera unidad. **Deselect** quita la selección y oculta el contexto del curso, sin borrar el progreso guardado.

Las pantallas Courses, Course details y Unit details no muestran el encabezado contextual del curso. La información del curso se presenta separada visualmente de las tarjetas de unidades. Al pulsar una tarjeta de unidad se abren sus detalles; sus botones de acción mantienen sus funciones independientes. El botón Atrás del dispositivo vuelve de Unit details a Course details y de Course details al catálogo, antes de cerrar Load Phrases.

La selección actual se guarda como un único par válido curso/unidad. La etiqueta **Current** aparece solo en el curso y la unidad de ese par; cambiar de curso no reutiliza el identificador de unidad anterior.

## Unidades y vocabulario

Las unidades `Unit_N` se presentan en orden numérico. Sus tarjetas muestran título, descripción, cantidades de vocabulario foco y complementario, progreso y estado de dominio. Al pulsar en cualquier parte de una tarjeta se abre Unit details. **Select** inicia o reanuda la práctica de la unidad.

Los detalles de unidad tienen pestañas para vocabulario foco y complementario. Las palabras aparecen en el orden de los CSV de asignación, con su nivel de dominio, prácticas completadas y pronunciaciones correctas. Si el curso declara cero palabras complementarias y no tiene el CSV correspondiente, la pestaña informa que no hay vocabulario complementario.

## Formato y sesión de práctica

En la pantalla principal de práctica, el encabezado contextual muestra el curso, la unidad y el formato activo, incluso antes de iniciar la práctica de la unidad. Se oculta al abrir Settings, Load Phrases u otra hoja. Practice Format presenta las opciones disponibles y marca el formato actual; el encabezado permanece en la parte superior y en la misma posición mientras se muestra esta pantalla. Se cierra al volver a pulsar Practice Type o con el botón Atrás del dispositivo, y puede volver a abrirse después del cierre. Vuelve a la pantalla desde la que se abrió y no incluye un botón Atrás propio. Al aplicar otra opción, la aplicación reconstruye la sesión de la unidad y la reinicia desde la primera frase.

El formato (`practiceType`) determina qué filas de las lecciones se incluyen; el modo de práctica general determina cómo se ejercitan esas frases. Para construir la sesión, la aplicación mezcla el orden de las palabras foco de la unidad, carga el CSV de cada palabra y agrega las filas indicadas por `rows`, en el orden configurado. La numeración de filas empieza en 1 y no cuenta encabezado. La sesión resultante avanza secuencialmente; el control **Random** queda desactivado mientras esté activa una sesión de curso.

Los idiomas del curso se aplican automáticamente: el idioma nativo ocupa la primera columna y el idioma destino es el objetivo de práctica. Una sesión incompleta conserva su CSV combinado, formato y posición para reanudarla sin volver a mezclar el orden.

Con un par válido de curso y unidad seleccionado, aunque no haya una sesión activa, **Read Aloud Languages** mantiene habilitada la casilla del idioma nativo y deshabilita la del idioma destino. La selección no cambia el valor marcado ni sobrescribe las preferencias guardadas; al quitarla, ambas casillas vuelven a estar disponibles con sus valores anteriores. Si el par de idiomas se invierte, los controles siguen los idiomas correspondientes.

En una sesión de curso, si está activada la lectura del idioma nativo, cada frase nueva se lee únicamente en el idioma nativo y el reconocimiento empieza cuando termina esa lectura. Esto también se aplica en Intensive Challenge, aunque la preferencia guardada de lectura del idioma destino esté activada. La preferencia guardada del idioma destino no añade una lectura a este aviso inicial. La lectura de la respuesta revelada en Intensive Challenge y sus reintentos forzados siguen siendo solo en el idioma destino.

## Progreso y configuración

- Al completar una frase de una sesión de curso, aumenta una vez el contador de prácticas de la palabra de vocabulario asociada a esa frase. El avance tras una pronunciación correcta, una respuesta escrita correcta, la finalización de la reproducción o el cierre del ciclo de **Intensive Challenge** completan la frase; sus reintentos forzados cuentan como un solo ciclo. Cambiar de frase manualmente, detener o abandonar la práctica no cuenta como completar la frase.
- Los contadores de prácticas, pronunciaciones correctas y niveles son globales para la persona usuaria en este navegador: la misma palabra del mismo idioma comparte progreso en todos los cursos y unidades donde aparezca. Se normalizan mayúsculas, acentos y puntuación para identificar la palabra; palabras iguales en idiomas distintos conservan progreso separado.
- En **Speaking Practice** e **Intensive Challenge**, una pronunciación correcta de la palabra foco suma una vez al contador global de pronunciaciones correctas. Los demás modos no incrementan este contador.
- Los niveles se calculan a partir del contador de prácticas: **Sin practicar**, **Conocida**, **En aprendizaje**, **Aprendida** y **Mastered**. Los umbrales iniciales son 1, 2, 6 y 8 prácticas, respectivamente.
- **Settings > Course Settings** permite cambiar esos cuatro umbrales. Deben ser enteros positivos en orden estrictamente creciente; al guardarlos se recalculan los niveles y porcentajes sin alterar los contadores.
- **Forced retries after failure** configura cuántas veces adicionales se repite obligatoriamente la frase en Intensive Challenge tras un fallo por silencio en el primer intento. Las repeticiones continúan aunque los intentos posteriores sean correctos. Acepta enteros no negativos y su valor inicial es 2.
- El porcentaje de unidad y curso se calcula con el vocabulario foco, limitando los puntos por palabra al umbral **Mastered**. El progreso del vocabulario complementario también se muestra y comparte globalmente, pero no determina esos porcentajes ni el estado de dominio de la unidad o del curso.

La selección, los umbrales, los reintentos forzados de Intensive Challenge, el progreso global y las sesiones se guardan en el almacenamiento local del navegador. El progreso compartido es entre cursos en ese navegador; no se sincroniza entre dispositivos. Los recursos de curso descargados se almacenan localmente para reutilizarlos; los que todavía no se han cargado requieren conexión.

## Datos de los cursos

Cada curso reside en `courses/<id>/` y contiene `course_details.json`, `course_vocabulary_focus_by_unit.csv`, el CSV complementario opcional y las carpetas `Units/Unit_N/`. Cada unidad incluye `unit_details.json` y `Lessons/<palabra>.csv`.

El JSON del curso define sus metadatos, los códigos de `idioma_nativo` y `idioma_destino`, cantidades de vocabulario y al menos un `practiceType` con `id`, `name`, `description` y una lista no vacía de filas positivas. Los CSV de lecciones tienen dos columnas —idioma nativo y destino—, separadas por punto y coma y sin encabezado. Los CSV de asignación relacionan palabras con unidades mediante columnas de vocabulario y unidad.

La aplicación valida metadatos, unidades, asignaciones y filas solicitadas. Para localizar un CSV de lección, prioriza el nombre exacto y permite equivalencias no ambiguas entre espacios, guiones bajos, apóstrofes, mayúsculas y diacríticos; si más de un archivo coincide, muestra un error en lugar de escoger uno arbitrariamente. Si falta un recurso requerido, una fila seleccionada o el CSV combinado queda vacío, muestra el error y no inicia una sesión incompleta. Las diferencias entre cantidades declaradas y CSV de asignación se notifican como inconsistencias.
