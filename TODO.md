# Todos los menus de opciones abren an pantalla completa
Cada opción del menú (modo práctica, visualización, escucha, etc.) debe abrirse como una página completa dentro de la misma aplicación en lugar de como paneles pequeños. Solo se debe conservar el menú inferior principal. 
 * Navegación fluida: Mantén la estructura de Single Page Application (SPA) cambiando el contenido principal según la opción seleccionada.
 * Opciones incluidas: Aplica este comportamiento a todas las secciones (Practice Mode, visualización, escucha, carga de frases, CSV y configuraciones).


# Boton atras redirije a pantalla princioal
Redirige el botón "Atrás" de Android directamente a la pantalla principal de la aplicación, sin importar en qué submenú se encuentre el usuario.
 * Comportamiento actual: Al pulsar "Atrás" desde una opción de menú, retrocede paso a paso por el historial de navegación.
 * Comportamiento deseado: Al pulsar "Atrás" desde cualquier sección interna, la aplicación envía al usuario de inmediato al inicio en lugar de cerrar vistas previas.