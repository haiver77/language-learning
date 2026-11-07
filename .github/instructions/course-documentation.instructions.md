---
description: "Use when changing course functionality, shared practice behavior, or documentation in docs/. Keep the functional guides aligned with the implemented application."
applyTo:
  - "index.html"
  - "courses/**"
  - "docs/**"
---

# Mantener la documentación funcional

- Cuando un cambio afecte una funcionalidad documentada, actualiza en el mismo cambio todos los documentos de `docs/` que describan ese comportamiento.
- Usa el código y el comportamiento implementado como fuente de verdad. No documentes propuestas que aún no estén implementadas ni cambies el código para ajustarlo a documentación desactualizada, salvo que la tarea lo solicite.
- Revisa los documentos relacionados según el alcance:
  - `docs/cursos.md`: catálogo, selección de cursos y unidades, formatos, sesiones, progreso y configuración de cursos.
  - `docs/speaking_practice.md`: reconocimiento, similitud, silencio, opciones y flujo de Speaking Practice; incluye el efecto en el progreso de pronunciación de cursos cuando corresponda.
  - `docs/intensive_challenge.md`: reconocimiento, resultados, silencio, voz, avance y comportamiento de Intensive Challenge, también al usar una sesión de curso.
  - Revisa los demás documentos de `docs/` cuando el cambio afecte la funcionalidad que describen.
- Si un cambio compartido afecta varias funcionalidades, actualiza todas las guías afectadas y mantén consistentes las reglas compartidas. Evita repetir detalles: enlaza la documentación relacionada cuando sea suficiente.
- Mantén la documentación concisa y precisa. No modifiques documentos que no estén afectados por el cambio.
- Antes de terminar, comprueba que las afirmaciones actualizadas correspondan al código y que no contradigan otras guías relacionadas.
