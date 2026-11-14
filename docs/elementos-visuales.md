# Inventario de elementos visuales

Este inventario describe la interfaz implementada en `index.html`. Distingue la estructura presente en el documento de los controles que se crean o muestran de forma condicional. Las referencias entre paréntesis son selectores estables (`id`, `data-*`, roles o clases de componente) cuando existen.

## 1. Marco de la aplicación

1.1. **Contenedor principal** (`.app-shell`, `.phone-frame`): marco que contiene la pantalla.

1.2. **Cabecera** (`.topbar`): nombre de la aplicación (`.brand`) e indicador del par de idiomas (`#languagePairIndicator`).

1.3. **Contexto del curso** (`#courseContextHeader`, repetido como `#courseContextHeaderInSheet` dentro de Cursos): incluye etiquetas de curso y unidad (`[data-course-context="course"]`, `[data-course-context="unit"]`) y un botón para el tipo de práctica (`button[data-course-context="practice"]`). Los textos se completan según el contexto activo.

## 2. Área de práctica

2.1. **Frases** (`main.main-view`, `#row-phrases`, `#phrasesView`): dos líneas reutilizables (`.phrase-line[data-pos="1"]` y `[data-pos="2"]`), cada una con etiqueta de idioma (`#lang-tag-1`, `#lang-tag-2`), texto (`#text-1`, `#text-2`) y botón de reproducción individual (`#replay-1`, `#replay-2`).

2.2. **Paneles de práctica condicionales**:
- Speaking: `#speakingPracticePanel` (`.speaking-practice-panel`), con tarjeta generada al activar el modo; muestra la cantidad de frases practicadas hoy, progreso, transcripción, estado, contador de silencio y aviso de celebración.
- Escritura/dictado: `#writingPracticePanel` (`.writing-practice-panel`), con tarjeta generada al activar el modo; muestra progreso, puntuación, estado, avance y campo de respuesta (`#wr-input-host`).
- Ambos contenedores están vacíos hasta que se representa el modo correspondiente y utilizan la clase `visible` cuando se muestran.

2.3. **Controles de frase** (`.transport-bar`): orden aleatorio (`#randomToggle`), primera frase (`#btnFirst`), detener (`#btnStopAuto`), iniciar (`#btnStartAuto`), anterior (`#btnPrevPhrase`) y siguiente (`#btnNextPhrase`). Los botones de inicio y detención cambian de propósito según el modo.

## 3. Menú inferior y paneles

3.1. **Fondo y panel deslizante**: fondo (`#sheetBackdrop`) y panel contenedor (`#bottomSheet`). El panel contiene vistas identificadas por `[data-panel]`; la vista activa usa la clase `active`.

3.2. **Navegación principal** (`nav.bottom-nav[aria-label="Main navigation"]`): seis botones reutilizables `.nav-item[data-sheet]`: `practice`, `voices`, `visualization`, `load`, `csv` y `settings`. El elemento activo se indica con `active`; todos apuntan a `#bottomSheet`.

## 4. Práctica y modos

4.1. **Vista Practice** (`[data-panel="practice"]`): selector de modo oculto visualmente (`#modeSelect`) y lista de botones (`.mode-option[data-mode]`) para Manual Mode, Speaking Practice Mode, Intensive Challenge y Writing Practice Mode. El modo seleccionado se indica con `active`. El selector también contiene la opción Auto Mode.

4.2. **Contenido del modo** (`#modeContent`): se reemplaza según el modo:
- Manual: no añade controles propios al contenedor; siguen disponibles los controles de frase de 2.3.
- Auto: intervalo (`#autoInterval`), aleatorio (`#auto-random`), inicio (`#autoStart`), detención (`#autoStop`) y estado (`#autoStatus`).
- Speaking: panel de transcripción y puntuación (`#sp-live`, `#sp-progress`, `#sp-score`, `#sp-silence-counter`), opción aleatoria (`#sp-random`), similitud mínima (`#sp-min`), esperas (`#sp-wait`, `#sp-after-min`), inicio y detención (`#sp-start`, `#sp-stop`) y estado (`#sp-status`). La tarjeta de práctica complementaria descrita en 2.2 muestra el contador diario (`#sp-practiced-today`) y los indicadores de práctica.
- Intensive Challenge: la tarjeta condicional de `#speakingPracticePanel` muestra la cantidad de frases practicadas hoy (`#ic-practiced-today`), transcripción, progreso, estado, contador y celebración (`#ic-live`, `#ic-progress`, `#ic-score`, `#ic-status`, `#ic-silence-counter`, `#ic-celebration`).
- Escritura: opción aleatoria (`#wr-random`), inicio y detención (`#wr-start`, `#wr-stop`) y estado (`#wr-status`); la tarjeta de `#writingPracticePanel` contiene el campo de respuesta y sus indicadores.

4.3. **Acceso a estadísticas**: tarjeta `button[data-open-statistics]` dentro de la vista Practice.

## 5. Estadísticas

5.1. **Vista** (`[data-panel="statistics"]`): cabecera con retorno a Practice (`[data-statistics-back]`), título y subtítulo.

5.2. **Pestañas** (`#statisticsTabs[role="tablist"]`): Activity, Year Effort y Words (`[data-statistics-tab]`). Cada pestaña controla su panel correspondiente (`[data-statistics-panel]`); los paneles no seleccionados pueden estar `hidden`.

5.3. **Activity** (`#statisticsActivity[role="tabpanel"]`): mes (`#activityMonthLabel`), navegación de mes (`#activityPreviousMonth`, `#activityNextMonth`), calendario (`#activityCalendar[role="grid"]`) y resumen (`#activitySummary`).

5.4. **Year Effort** (`#statisticsYear`): descripción (`#yearEffortDescription`), lista de periodos (`#yearEffortCalendar`) y escala de intensidad (`.effort-legend`).

5.5. **Words** (`#statisticsWords`): selector de idioma (`#statisticsLanguageSelect`) y resultados dinámicos (`#statisticsWordResults[aria-live]`).

## 6. Voces y visualización

6.1. **Voces** (`[data-panel="voices"]`, `#row-tts`): selectores de voz (`#voice-1`, `#voice-2`), actualización (`#refreshVoices`), idiomas leídos (`#read-1`, `#read-2`) y opciones plegables de velocidad, tono e intervalo (`#rate`, `#pitch`, `#autoInterval`).

6.2. **Visualización** (`[data-panel="visualization"]`, `#row-show-panel`): tamaño de texto (`#fontRange`, valor `#fontValue`), tema claro/oscuro (`#themeToggle`) y visibilidad de cada idioma (`#show-1`, `#show-2`).

## 7. Carga de frases y cursos

7.1. **Selector de fuente** (`[data-panel="load"]`, `#loadOptions`): tarjetas `button[data-load-target]` para archivo (`file`), generación mediante prompt (`ai`), conjuntos predefinidos (`predefined`) y cursos (`courses`). Cada destino está asociado con su sección mediante `aria-controls`.

7.2. **Prompt** (`#loadAiPage[data-load-screen="ai"]`, inicialmente `hidden`): retorno (`[data-load-back]`), tema (`#aiTopic`), nivel (`#aiLevel`), cantidad (`#aiQuantity`), mínimo de palabras (`#aiMinWords`), token (`#openaiToken`), carga (`#btnLoadAI`) y estado (`#aiStatus`).

7.3. **Archivo** (`#loadFilePage[data-load-screen="file"]`, inicialmente `hidden`): retorno, selector de archivo (`#fileInput`), nota (`#fileLoadNote`) y estado de carga (`#fileLoadStatus`).

7.4. **Conjuntos predefinidos** (`#loadPredefinedPage[data-load-screen="predefined"]`, inicialmente `hidden`): retorno, lista (`#predefinedSelect`) y botón de carga (`#btnLoadPredefined`).

7.5. **Cursos** (`#coursesApp[data-load-screen="courses"]`, inicialmente `hidden`): cabecera adhesiva, contexto del curso, retorno (`#coursesBack`), título (`#coursesPageTitle`), estado (`#coursesStatus`) y contenido dinámico (`#coursesContent`). Según la vista, el contenido genera:
- Catálogo: búsqueda (`#courseSearch`), filtro de nivel (`#courseLevelFilter`), tarjetas (`[data-course-card]`) con métricas, progreso y acciones `data-action` para seleccionar, ver detalles o retirar selección.
- Detalles del curso: resumen y tarjetas de unidad (`[data-course-unit-card]`, `data-unit-id`), con acciones de selección y detalle.
- Detalle de unidad: pestañas de vocabulario `data-action="unit-tab"` (`focus` y `complementary`), filas de palabras y acción para seleccionar unidad y practicar; la navegación hacia atrás se realiza con el botón **Back** superior o el botón Atrás del dispositivo.
- Tipo de práctica: opciones `data-action="choose-practice-type"` y aplicación `data-action="apply-practice-type"`.

7.6. **Estados de carga**: mensajes como `Loading…` o `Loading courses…` se presentan en sus áreas de estado correspondientes (por ejemplo, `#aiStatus`, `#coursesStatus` o `#fileLoadStatus`); la estructura examinada no define una pantalla de carga global independiente.

## 8. Visor CSV

La vista `[data-panel="csv"]` contiene el editor `#csvBox` y su presentación superpuesta `#csvBoxViewerDisplay` dentro de `.viewer-wrapper`. La barra de herramientas ofrece ajuste de línea (`#wrapCsv`) y colores de frase (`#color1`, `#color2`); `#csvColorControls` agrupa estos últimos.

## 9. Ajustes

La vista `[data-panel="settings"]` contiene `#settingsPanel`. El menú `[data-settings-view="menu"]` ofrece botones `data-settings-open` para `appearance`, `languages`, `speaking`, `course` y `goal`. Las vistas de detalle usan `[data-settings-view]`, botones de retorno `[data-settings-back]` y, antes de seleccionarse, `aria-hidden="true"` e `inert`.

9.1. **Appearance** (`[data-settings-view="appearance"]`): nombre de tema (`#activeThemeName`), opciones de tema (`#visualThemeChoices`, `label[data-theme]` con radios `name="visualTheme"`) y estado (`#themeSaveStatus`).

9.2. **Languages** (`[data-settings-view="languages"]`): idioma nativo (`#lang1Select`) y objetivo (`#lang2Select`).

9.3. **Speaking** (`[data-settings-view="speaking"]`): controles de similitud y tiempos (`#sp-min-settings`, `#sp-wait-settings`, `#sp-after-min-settings`, `#sp-celebration-settings`) con botones de incremento/decremento `data-step-target`; grupos de sonidos `fieldset[data-speaking-sound-group]`, con radios y botones de vista previa `data-sound-preview`; estado `#speaking-sound-status`.

9.4. **Course** (`[data-settings-view="course"]`): umbrales de progreso (`#courseKnownThreshold`, `#courseLearningThreshold`, `#courseLearnedThreshold`, `#courseMasteredThreshold`), reintentos de Intensive Challenge (`#courseIntensiveChallengeForcedRetries`) y estado (`#courseSettingsStatus`). Los controles numéricos con pasos tienen botones `data-step-target`.

9.5. **Goal** (`[data-settings-view="goal"]`): meta diaria (`#dailyPracticeGoal`), botones de incremento/decremento `data-step-target` y estado (`#dailyPracticeGoalStatus`).

## 10. Aviso global y diagnóstico auxiliar

10.1. **Aviso de actualización** (`#updateNotice[role="region"]`): oculto inicialmente mediante `hidden`. Incluye mensaje accesible (`#updateNoticeMessage[role="status"]`) y acciones de actualizar (`#updateNowButton`) o posponer (`#updateLaterButton`).

10.2. **Diagnóstico de Speaking**: durante la inicialización, el código crea un bloque de depuración con botones `#spDbgToggle`, `#spDbgClear`, `#spDbgDownload` y registro `#sp-debug-log`. Su inserción se intenta únicamente si existe `.container`; ese contenedor no está presente en la estructura actual de `index.html`, por lo que este bloque no queda montado en la interfaz descrita.
