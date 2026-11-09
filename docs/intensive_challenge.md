# Intensive Challenge: descripción funcional

## Propósito

**Intensive Challenge** es un modo de práctica oral por turnos. Para cada fila del CSV, la aplicación presenta la frase en el idioma nativo y empieza a escuchar. El usuario intenta decir la traducción en el **Target Language** configurado. Al completar el intento, la aplicación revela y lee la frase objetivo. Si el primer intento falla por silencio, repite la misma frase tantas veces como reintentos forzados adicionales estén configurados, aunque las repeticiones posteriores sean correctas; luego pasa a otra fila.

El intento se cierra de una de estas dos maneras:

- **Éxito:** un resultado final de reconocimiento alcanza el umbral **Min. Similarity (%)**.
- **Fallido por silencio:** vence **Silence Wait (sec)** sin que se haya alcanzado el umbral.

El modo reutiliza el reconocimiento, la comparación de palabras, las opciones de voz y los efectos visuales que ya existen en la aplicación, pero tiene sus propias reglas de cierre y avance. El silencio cierra el intento y revela la respuesta. Si falla el primer intento y hay reintentos forzados configurados, vuelve a escuchar la misma frase después de leerla hasta completar todas las repeticiones, independientemente de sus resultados.

## Preparación y configuración

- El usuario selecciona **Intensive Challenge** desde la lista de modos del panel **Practice**.
- El CSV debe contener frases en sus dos columnas. **Idioma nativo** y **Target Language** en **Settings > Languages** determinan a qué idioma corresponde cada columna.
- **Target Language** determina la columna objetivo de pronunciación. **Idioma nativo** es el estímulo visible al comenzar cada frase. No hay un selector independiente de idioma de práctica.
- **Min. Similarity (%)** es compartido con Speaking Practice. Su valor se limita al intervalo de 50 a 100 y, si no está configurado, el valor inicial es 90.
- **Silence Wait (sec)** también es compartido. Su valor mínimo es un segundo y el valor inicial es 3 segundos.
- **Forced retries after failure**, en **Settings > Course Settings**, determina cuántas veces adicionales se repite obligatoriamente la misma frase después de un fallo por silencio en el primer intento. Las repeticiones se completan aunque alguna pronunciación posterior sea correcta. Acepta enteros no negativos, su valor inicial es 2 y se guarda en el navegador.
- La voz, velocidad y tono configurados en la aplicación se usan para leer la frase objetivo.
- Este modo no usa **Wait After Reach Min. Similarity (sec)** para decidir cuándo avanzar: después de un éxito, espera a que termine la lectura en voz alta.

## Controles e interacción

Los controles de la barra de navegación inferior son los mismos para todos los modos:

- **Start** inicia Intensive Challenge desde la frase seleccionada. Al entrar al modo, la selección se coloca en la primera fila; si el usuario detiene el modo y navega manualmente a otra frase, Start comienza desde esa frase.
- **Stop** detiene el modo: cancela la lectura en curso, aborta el reconocimiento y limpia los temporizadores. No revela la respuesta ni avanza a otra fila.
- **Random** controla el orden de las frases siguientes. Al entrar a Intensive Challenge se desactiva temporalmente, de modo que el modo empieza en orden secuencial. El usuario puede activarlo o desactivarlo desde la misma barra durante la sesión. Al volver a seleccionar el modo, se restablece el orden secuencial.
- El ajuste secuencial inicial de Intensive Challenge no cambia la preferencia Random guardada para los demás modos.
- Los controles **First**, **Previous** y **Next** permiten cambiar la frase mientras la práctica está detenida. No cambian la frase durante un intento activo o durante la lectura de la respuesta.

El panel de Intensive Challenge muestra el progreso y porcentaje de la frase, la transcripción reconocida, el estado del intento, el contador de silencio y el número de frases correctas de la sesión. No incluye controles propios de idioma, Random, Start ni Stop.

Si el usuario cambia **Target Language** en **Settings > Languages** mientras el modo está activo, la práctica se detiene y la frase visible se actualiza al nuevo idioma. Para continuar, debe iniciar de nuevo.

## Inicio y selección de frases

1. Al seleccionar el modo, la aplicación posiciona la selección en la primera fila del CSV y establece el orden secuencial para Intensive Challenge.
2. Al pulsar **Start**, se muestran ambas frases internamente, pero solo queda visible el texto en **Idioma nativo**. La frase objetivo permanece oculta.
3. La aplicación inicia el reconocimiento de voz en **Target Language** inmediatamente; no lee el estímulo inicial en voz alta.
4. Después de cada intento, la siguiente fila es la siguiente del CSV en modo secuencial, con retorno a la primera fila al llegar al final. Si **Random** está activo, se elige aleatoriamente una fila del CSV para el siguiente intento. La elección aleatoria puede repetir la misma fila.
5. Cambiar Random durante un intento no altera la frase actual; determina cómo se elige la siguiente.

## Reconocimiento y evaluación

- El modo usa una misma instancia del reconocimiento de voz del navegador (`SpeechRecognition` o `webkitSpeechRecognition`) durante toda la sesión, con escucha continua, resultados intermedios y una alternativa de reconocimiento. La escucha permanece abierta mientras se lee la respuesta; los resultados solo se procesan durante el intento. Esto evita volver a iniciar el reconocimiento y solicitar acceso al micrófono por cada frase.
- La transcripción y la puntuación se actualizan mientras el usuario habla. Los resultados intermedios sirven para mostrar el progreso, pero **solo un resultado final** puede cerrar el intento como éxito.
- La comparación usa las reglas compartidas de Speaking Practice: normalización del texto, comparación de palabras en orden y similitud por palabra de al menos 70 % para marcar una coincidencia. El porcentaje de la frase es la proporción de palabras objetivo coincidentes, redondeada a un entero. Véase [Speaking Practice Rules](./speaking_practice.md) para los detalles compartidos del cálculo.
- El contador de **Silence Wait (sec)** comienza al iniciar la escucha y se reinicia al recibir actividad de voz reconocida. Si el temporizador vence antes del éxito, el intento termina como fallido, incluso si hubo voz pero la puntuación no alcanzó el umbral.
- Si el primer intento termina por silencio y quedan reintentos forzados, la respuesta se revela y se lee; al terminar la lectura, se oculta de nuevo y comienza la primera repetición con la misma frase. Una vez iniciada esa secuencia, cada repetición se completa incluso si se pronuncia correctamente. Después de cada intento se vuelve a leer la respuesta antes de la siguiente repetición o de avanzar. Cada intento tiene su propio contador de silencio.
- Si el navegador no ofrece reconocimiento, se informa que la función no está disponible. Si se deniega el micrófono, se informa que hay que permitir su acceso. En ambos casos, el modo no avanza automáticamente.

## Resultado del intento

### Éxito

Cuando un resultado final alcanza **Min. Similarity (%)**:

1. Se cierra la fase de escucha y se cancelan los temporizadores de silencio. La instancia de reconocimiento permanece activa durante la sesión, pero sus resultados se ignoran durante la lectura.
2. Se revela la frase objetivo en **Target Language**.
3. Se muestra la celebración visual de éxito y aumenta el contador de frases correctas de la sesión.
4. La aplicación lee la frase objetivo con la voz y los ajustes configurados.
5. Si es el primer intento de la frase, cuando termina la lectura se selecciona y muestra la siguiente frase y comienza una nueva fase de escucha. Si ocurre durante la secuencia forzada de repeticiones iniciada por un fallo inicial, la lectura termina y comienza la siguiente repetición de la misma frase, si aún quedan.

### Fallo por silencio

Cuando vence **Silence Wait (sec)** sin éxito:

1. Se cierra la fase de escucha y se cancelan los temporizadores de silencio. La instancia de reconocimiento permanece activa durante la sesión, pero sus resultados se ignoran durante la lectura.
2. Se revela la frase objetivo, sin celebración de éxito ni incremento del contador de frases correctas.
3. La aplicación lee la frase objetivo con la voz y los ajustes configurados.
4. Si es el primer intento y quedan reintentos forzados configurados, al terminar la lectura se oculta la respuesta y comienza otra fase de escucha de la misma frase. La secuencia continúa hasta completar el número configurado de repeticiones; los éxitos o fallos de esas repeticiones no acortan ni extienden la secuencia. Al terminar la última, se selecciona y muestra la siguiente frase y comienza una nueva fase de escucha.

El valor inicial permite dos repeticiones forzadas adicionales tras un fallo inicial, es decir, hasta tres intentos por frase. Si el primer intento tiene éxito, la práctica continúa después de leer la respuesta sin repeticiones adicionales. Si falla, la práctica avanza al terminar las repeticiones configuradas, independientemente de si fueron correctas o no. El efecto visual de éxito puede desaparecer según su duración configurada, pero no agrega una espera independiente al avance. Si la síntesis de voz falla, el modo informa el error y no inicia otro intento ni avanza a otra frase.

En una sesión de curso, al avanzar después de leer la respuesta se suma una práctica a la palabra asociada con esa frase, tanto si el ciclo terminó con éxito como por silencio. Los reintentos forzados son parte del mismo ciclo y no generan prácticas adicionales. La pronunciación correcta, cuando corresponde, se registra por separado en el progreso global de la palabra; véase [Funcionalidad de cursos](./cursos.md).

## Límites de la sesión

- **Stop** o el cambio a otro modo interrumpe el intento actual, cancela la síntesis de voz y aborta el reconocimiento. Los eventos tardíos de un intento detenido no pueden avanzar la sesión.
- Al detener, la frase actual vuelve a mostrarse solo como estímulo; no se lee ni se revela automáticamente.
- El contador de reintentos forzados se reinicia al comenzar una frase nueva o detener la práctica. El ajuste no modifica la evaluación ni el flujo de los demás modos.
- El contador de frases correctas se reinicia al iniciar una nueva sesión. Un intento fallido no lo incrementa.
- El comportamiento de Intensive Challenge no debe cambiar la evaluación, los tiempos ni el flujo de los demás modos de práctica.
