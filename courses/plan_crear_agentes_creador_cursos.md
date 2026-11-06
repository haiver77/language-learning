# CREACIÓN DE CURSOS

## Resumen
Este documento define el proceso y los agentes para crear cursos de aprendizaje de idiomas a partir de una lista de `vocabulario foco`, estructurados en carpetas, archivos JSON y CSVs. Define tres agentes:

- **`curso_ll_orquestador`**: coordina todo el flujo de creación del curso, invocando a los otros dos agentes y completando al final los conteos reales en `course_details.json`.
- **`curso_ll_crear_linea_base`**: crea la estructura de carpetas, los archivos JSON (con datos dummy si aún no hay información real) y reparte el `vocabulario foco` entre unidades.
- **`curso_ll_generar_csvs`**: genera los CSVs de lección por cada vocabulario y construye el listado de vocabulario complementario por unidad.

## Definiciones 
- `Idioma nativo`: identifica el idioma nativo del usuario
- `Idioma destino`: idioma que el usuario está aprendiendo
- `vocabulario foco`: Palabras individuales, frases o chunks útiles y reusables que el usuario quiere aprender.
- `Nivel curso`: Nivel de dominio del usuario sobre el idioma que está aprendiendo, puede ser por ejemplo "Principiante" o "Intermedio", o también puede ser en término de niveles CEFR como "A1" o "B2".
- `Nombre curso`: Nombre del curso
- `Consideraciones especificas`: Se refiere a las solicitudes, restricciones o especificaciones que el usuario ingresa al momento de ejecutar el agente o el prompt y que pueden redirigir, mejorar o cambiar el comportamiento del agente.
- `estructura curso`: define la organización del curso en diversas carpetas y ficheros.
- `Criterio separación unidades`: criterio en lenguaje natural que ingresa el usuario para indicar cómo se debe repartir el `vocabulario foco` entre las unidades. El agente debe interpretarlo y seguirlo tal cual. Por ejemplo: "10 vocabulario por unidad", o "los primeros 20 en la unidad 1, del 21 al 25 en la unidad 2, etc.".

## Contexto creación cursos
- Un curso se compone de una o más unidades, cada una de ellas cubre una o más `vocabulario foco` y todos los artefactos se escriben en la siguiente `estructura curso`:
```
Courses/
│
├── ESIT-FrequentlyUsedByRank_Top_1000/
│   ├── course_details.json
│   ├── course_vocabulary_focus_by_unit.csv
│   ├── course_vocabulary_complementary_by_unit.csv
│   ├── Units/
│	 	├── Unit_1/
│	    │	├── unit_details.json
│	    │	└── Lessons/
│	    │		├── word1.csv
│	    │		├── word2.csv
│	    │		├── phrase1.csv
│	    │		└── phrase2.csv
│		└── Unit_2/
│	      	├── unit_details.json
│	   	    └── Lessons/
│	       		├── word1.csv
│	   	    	├── word2.csv
│	   	    	├── phrase1.csv
│	   	    	└── phrase2.csv
│
└── ESIT-OtroCursoMas/
    └── ....
```

- Archivo `course_details.json`:
```json
{
  "id": "ESIT-FrequentlyUsedByRank_Top_1000",
  "title": "Top 1000 palabras más usadas en páginas web en italiano",
  "description": "Top 1000 palabras más usadas en páginas web en italiano.",
  "focusVocabularyCount": 25,
  "supplementaryVocabularyCount": 40,
  "level": "A1",
  "practiceModes": [
    {
      "id": "individual_practice",
      "name": "Práctica individual",
      "description": "Presenta únicamente la primera frase de cada archivo CSV.",
      "rows": [1]
    },
    {
      "id": "simple_usage",
      "name": "Uso simple",
      "description": "Presenta las tres primeras frases de cada archivo CSV.",
      "rows": [1, 2, 3]
    },
    {
      "id": "question_usage",
      "name": "Uso en preguntas",
      "description": "Presenta únicamente la frase de la fila 4 de cada archivo CSV.",
      "rows": [4]
    }
  ]
}
```

- Archivo `unit_details.json`:
```json
{
  "title": "Título unidad",
  "description": "Explicación unidad",
  "focusVocabularyCount": 25,
  "supplementaryVocabularyCount": 40
}
```

# Agentes requeridos

## Agente creador de la línea base del curso
- Nombre Agente: curso_ll_crear_linea_base
- Propósito: crear la estructura base del curso (carpetas y subcarpetas), los archivos JSON con información dummy cuando aún no haya información real, y realizar la separación del `vocabulario foco` por unidades. No genera los CSVs de lección; eso lo hace el agente `curso_ll_generar_csvs`.

### Información de Entrada
- `Nombre curso`
- `Idioma nativo`
- `Idioma destino`
- Ubicación o mecanismo para conseguir el `vocabulario foco`
- `Criterio separación unidades`
- `Nivel curso`
- `Consideraciones especificas`

### Procedimiento
1. Validar que el `vocabulario foco` se pueda consultar apropiadamente. Si el `vocabulario foco` no se puede consultar, informar al usuario el motivo y detener toda la ejecución (no continuar con ningún paso posterior).
2. Verificar si la carpeta del curso ya existe dentro de `Courses/`:
   - Si **no existe**, crear las carpetas y subcarpetas de la `estructura curso` y continuar con el flujo de creación normal (pasos 3 en adelante).
   - Si **ya existe**, no recrear el curso desde cero. En su lugar, revisar cuidadosamente las indicaciones y `Consideraciones especificas` que está dando el usuario para determinar cuál es el cambio, ajuste, mejora o modificación que desea realizar sobre la línea base del curso existente, y aplicar únicamente ese cambio sobre los artefactos correspondientes.
3. Determinar cuántos `vocabulario foco` hay en total.
4. Conservando el orden en el que se encuentra el origen del `vocabulario foco`, crear el archivo `course_vocabulary_focus_by_unit.csv` que contenga la lista del `vocabulario foco` (primera columna) y la unidad a la que pertenece (segunda columna), haciendo la separación en unidades según el `Criterio separación unidades` indicado en los datos de entrada. El agente debe interpretar el criterio ingresado por el usuario (por ejemplo, una cantidad fija por unidad o rangos explícitos de vocabulario por unidad) y aplicarlo respetando el orden del origen. Si al aplicar el criterio la última unidad queda con menos `vocabulario foco` del que normalmente contendría, dejarla incompleta con el `vocabulario foco` que falte.
5. Crear la subcarpeta de cada unidad (`Units/Unit_N/` y su carpeta `Lessons/`) según la cantidad de unidades resultante de la separación anterior.
6. Crear los archivos JSON de la estructura con información dummy cuando aún no exista información real para ellos:
   - `course_details.json` en la raíz del curso, con los datos conocidos del curso (`id`, `title`, `description`, `level`) y valores dummy o provisionales para los conteos (`focusVocabularyCount`, `supplementaryVocabularyCount`) que luego se completarán.
   - `unit_details.json` dentro de cada `Unit_N/`, con `title`, `description` y conteos dummy o provisionales.

### Salida
- La `estructura curso` creada con sus carpetas y subcarpetas.
- El archivo `course_vocabulary_focus_by_unit.csv` con la separación del `vocabulario foco` por unidad.
- Los archivos `course_details.json` y `unit_details.json` creados con información dummy cuando no haya información real todavía.

## Agente generador de los CSVs
- Nombre Agente: curso_ll_generar_csvs
- Propósito: generar los CSVs de lección por cada `vocabulario foco` del curso, escribiéndolos en la carpeta `Lessons/` de la unidad correspondiente, y construir el archivo `course_vocabulary_complementary_by_unit.csv` con el vocabulario complementario (palabras individuales únicas, aparte del `vocabulario foco`) encontrado en los CSVs de cada unidad. Parte de la línea base ya creada por el agente `curso_ll_crear_linea_base`; no crea la estructura de carpetas ni la separación por unidades.

### Información de Entrada
- `Nombre curso`
- `Idioma nativo`
- `Idioma destino`
- `Nivel curso`
- `Cantidad de frases por vocabulario` (entero positivo)
- `Consideraciones especificas`

### Procedimiento
1. Leer el archivo 'catalogo_de_instrucciones.md' para tener el contexto de qué instrucciones se deberían usar para generar los CSVs dependiendo del tipo de `vocabulario foco`.
2. Lee las `Consideraciones especificas` (Si hay).
3. Leer el archivo 'course_vocabulary_focus_by_unit.csv' correspondiente al `Nombre curso` actual, y genera los CSVs por cada vocabulario del `vocabulario foco` que contiene, escribiendo los archivos csv dentro de la carpeta "/Lessons/" de la Unidad "/Unit_" correspondiente según la unidad indicada para el `vocabulario foco`.
4. Luego de completar la generación de CSV de una unidad, identifica cuales palabras individuales únicas aparte del `vocabulario foco` hay en todos los CSVs de la unidad, y añade esta lista de estas palabras en el archivo 'course_vocabulary_complementary_by_unit.csv'. Este archivo debe estar ordenado por unidades.



## Agente orquestador de creación de curso
- Nombre Agente: curso_ll_orquestador
- Propósito: orquestar la creación completa de un curso a partir de una lista de `vocabulario foco`, coordinando a los agentes `curso_ll_crear_linea_base` y `curso_ll_generar_csvs` y completando al final el archivo `course_details.json` con los conteos reales. No crea la estructura ni genera los CSVs directamente; delega esas tareas en los agentes correspondientes.

### Información de Entrada
- `Nombre curso`
- `Idioma nativo`
- `Idioma destino`
- Ubicación o mecanismo para conseguir el `vocabulario foco`
- `Criterio separación unidades`
- `Nivel curso`
- `Cantidad de frases por vocabulario` (entero positivo)
- `Cantidad máxima de agentes curso_ll_generar_csvs en paralelo` (entero positivo)
- `Consideraciones especificas`

### Procedimiento

Basado en la información de entrada

1. Iniciar un agente `curso_ll_crear_linea_base`, transmitiéndole la información de entrada que recibió del usuario, para que cree la `estructura curso`, los archivos JSON con información dummy y la separación del `vocabulario foco` por unidades (`course_vocabulary_focus_by_unit.csv`).
2. Esperar a que el agente `curso_ll_crear_linea_base` termine. Si dicho agente detuvo la ejecución (por ejemplo, porque el `vocabulario foco` no se pudo consultar), no continuar.
3. Leer `course_vocabulary_focus_by_unit.csv`, validar sus filas y obtener las unidades distintas en orden.
4. Calcular el número de trabajadores como el menor entre el máximo indicado por el usuario y el total de unidades. Repartir las unidades, en orden, en colas exclusivas y equilibradas. Iniciar un agente `curso_ll_generar_csvs` en modo `unit-queue` por cada cola, transmitiendo la cantidad de frases por vocabulario y todos los datos del curso. Cada agente genera exactamente esa cantidad de frases por vocabulario, procesa una unidad a la vez y, tras validarla, continúa con la siguiente unidad pendiente de su propia cola. No se crean agentes nuevos por cada unidad ni se permite que dos trabajadores escriban en la misma carpeta `Lessons/`.
5. Esperar a que terminen todos los agentes. Si alguno informa bloqueo o no valida todas las lecciones de su cola, detener el flujo sin agregar vocabulario complementario ni actualizar conteos; informar qué unidades terminaron, cuáles quedaron incompletas o pendientes y esperar a los demás trabajadores activos.
6. Solo cuando todas las unidades terminen correctamente, invocar una vez `curso_ll_generar_csvs` en modo `aggregate-complementary`, transmitiendo los mismos datos del curso, incluida la cantidad de frases por vocabulario. Debe validar las lecciones existentes y crear o actualizar `course_vocabulary_complementary_by_unit.csv` sin regenerar lecciones.
7. Esperar a que el agente confirme que el CSV complementario quedó completo y validado. Si hay bloqueo, no actualizar los conteos finales.
8. Leer `course_vocabulary_focus_by_unit.csv` y `course_vocabulary_complementary_by_unit.csv` y contar registros de datos, excluyendo encabezados. Actualizar únicamente `focusVocabularyCount` y `supplementaryVocabularyCount` en `course_details.json`, conservar los demás campos y verificar los conteos contra los CSV fuente.