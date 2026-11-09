# Almacenamiento local del cliente

La aplicación persiste datos en el `localStorage` del navegador bajo tres claves. Los valores JSON se serializan con `JSON.stringify`; por lo tanto, cada clave contiene una cadena que se debe parsear para obtener su objeto. Los datos pertenecen al navegador y al origen desde el que se abre la aplicación: no se sincronizan con otros navegadores o dispositivos.

## `lang_trainer_config_v1`

Guarda preferencias generales de práctica y la sesión de frases que se está usando fuera de una sesión de curso. Se restaura al abrir la aplicación.

| Campo | Qué representa |
|---|---|
| `lang1`, `lang2` | Códigos de los idiomas seleccionados para las dos columnas. |
| `show`, `read`, `voices` | Objetos indexados por código de idioma. Guardan, respectivamente, si se muestra cada columna, si se lee en voz alta y la voz de síntesis seleccionada. |
| `rate`, `pitch` | Velocidad y tono de la voz. |
| `font` | Tamaño de fuente de las frases. |
| `themeDark`, `visualTheme` | Tema claro/oscuro y tema visual seleccionado. |
| `mode`, `randomEnabled` | Modo de práctica y opción de orden aleatorio. |
| `aiLevel`, `aiTopic`, `aiQuantity`, `aiMinWords` | Parámetros de generación de frases con IA (nivel, tema, cantidad y mínimo de palabras). `aiMinWords` puede no estar presente en datos antiguos o cuando no se proporciona. |
| `predefined` | Conjunto de frases predefinidas seleccionado. |
| `csv` | Texto CSV de las frases cargadas o editadas; permite restaurarlas al volver a abrir la aplicación. |
| `wrapCsv` | Si el texto CSV se ajusta visualmente en el área de edición. |
| `color1`, `color2` | Colores usados para resaltar las dos columnas del CSV. |
| `speakingMin`, `speakingWait`, `speakingAfterMin`, `speakingCelebrationSeconds` | Umbral de similitud, espera por silencio, espera adicional y duración de la celebración de Speaking Practice. |

Las preferencias se guardan al cambiar los controles relacionados. La selección de un conjunto predefinido también guarda su identificador y el CSV cargado. El contenido CSV, incluidas frases generadas con IA, queda persistido cuando se ejecuta un guardado de configuración; la carga de IA por sí sola no guarda inmediatamente ese contenido.

## `language_courses_state_v1`

Guarda la selección, configuración, progreso y sesiones de práctica de cursos. Sus principales campos son:

| Campo | Estructura y función |
|---|---|
| `selectedCourseId`, `selectedUnitId` | Identificadores del curso y la unidad seleccionados; pueden ser `null`. |
| `practiceTypes` | Mapa `idCurso → idFormato`, con el formato de práctica seleccionado para cada curso. |
| `thresholds` | Objeto con los umbrales de dominio `known`, `learning`, `learned` y `mastered`. |
| `intensiveChallengeRetries` | Número entero no negativo de repeticiones forzadas tras un fallo en Intensive Challenge. Es el nombre usado al persistir; el código también reconoce `forcedIntensiveChallengeRetries` en datos previos. |
| `wordProgress` | Mapa de progreso global por idioma y palabra. La clave combina el código del idioma destino, un separador nulo (`\u0000`) y la palabra normalizada (sin diferencias de mayúsculas, acentos ni puntuación). Cada valor contiene `practices` y `pronunciationCorrect`, ambos contadores; Statistics usa `practices` para el historial de palabras de cursos. |
| `dailyPracticeGoal` | Cantidad entera de frases que se deben practicar al día para completar la meta; el valor inicial es 10 y el intervalo admitido es 1–1000. |
| `practiceActivity` | Mapa de fecha local `AAAA-MM-DD` a frases practicadas. Conserva los 400 días más recientes; los calendarios Activity y Year Effort comparan estos conteos con la meta diaria actual. |
| `practiceWordCounts` | Mapa de idioma y palabra normalizada a su palabra visible y cantidad acumulada de prácticas fuera de cursos. Statistics combina estos conteos con `wordProgress` para ordenar las palabras por frecuencia. |
| `sessions` | Mapa `idCurso → idUnidad → sesión guardada`, descrito abajo. |
| `activeSessionKey` | Clave de la sesión activa en formato `idCurso::idUnidad`. |
| `progress` | Estructura heredada de progreso por curso, unidad y palabra (`progress[idCurso].units[idUnidad].words[palabra]`). Se migra a `wordProgress` para los cursos reconocidos; datos de cursos que no están disponibles pueden permanecer. |

Una sesión incompleta conserva el CSV combinado y su posición para poder reanudarla. Incluye `courseId`, `unitId`, `practiceTypeId`, `languageNative`, `languageTarget`, `csv`, `metadata`, `focusWords`, `complementaryWords`, `currentIndex`, `phraseVisitId`, `lastCompletedPhraseVisitId`, `completedPhraseIndices` y `completed`. Cada elemento de `metadata` asocia una fila con `vocabulary`, `source` y `sourceRow`. Una sesión completada se reduce a `courseId`, `unitId`, `practiceTypeId`, `currentIndex`, `languageNative`, `languageTarget` y `completed: true`.

El progreso de palabras es compartido entre cursos y unidades del mismo navegador. Se incrementan por separado las prácticas completadas y las pronunciaciones correctas; los umbrales determinan el nivel de dominio mostrado. La selección de curso o unidad no elimina el progreso guardado. Statistics registra actividad cuando se completa una frase al avanzar manualmente o al avanzar un modo de práctica; los conteos de palabras de cursos provienen de `wordProgress` y los de otros modos se guardan en `practiceWordCounts`.

## `openai_token`

Guarda como texto el token de OpenAI que la persona usuaria introduce en la interfaz. Se escribe al iniciar una carga de frases con IA y se vuelve a cargar en el campo del token al iniciar la aplicación. No se incluye en el repositorio ni se sincroniza; al estar en `localStorage`, puede ser accesible para scripts que se ejecuten en el mismo origen, por lo que conviene usar un navegador y equipo de confianza.

## Otros datos del navegador

Los archivos de recursos de cursos descargados se guardan por separado en **IndexedDB**, no en `localStorage`. La base de datos se llama `language-practice-course-files` y utiliza los almacenes `files` y `directories`, con `path` como clave. Esta caché evita volver a descargar recursos ya consultados; no representa progreso ni configuración del usuario.
