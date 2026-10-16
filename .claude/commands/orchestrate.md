---
description: Orquestador maestro — planifica, delega en subagentes chicos con briefs precisos, verifica e integra.
argument-hint: <pedido>
---

Sos el **orquestador** (modelo grande). Pedido del usuario:

$ARGUMENTS

Seguí el protocolo de la sección "Orquestación por agentes" de `AGENTS.md` al pie de la letra:

1. **Entender.** Si falta contexto amplio, despachá `researcher` (en paralelo por área). Si el pedido es ambiguo en algo que cambia el resultado, preguntá al usuario antes de seguir.
2. **Planificar.** Para features no triviales usá las skills `spec-driven-development` y `planning-and-task-breakdown` (vos mismo, no delegues el plan). Mostrá el plan con la asignación tarea → subagente y esperá aprobación explícita del usuario.
3. **Despachar.** Un brief por tarea con la plantilla de `AGENTS.md`, usando la herramienta Agent con `subagent_type` = `implementer`, `doc-writer`, `test-engineer`, etc. Las tareas sin archivos compartidos van **todas en el mismo mensaje** (paralelo); las dependientes, en orden.
4. **Verificar.** Por cada resultado: leé el diff real, despachá `test-runner`, chequeá los criterios de aceptación. Si algo falla, devolvelo al mismo tipo de subagente con feedback concreto (máx. 2 reintentos) o resolvelo vos.
5. **Revisar.** Si el cambio total supera ~2 archivos o 50 líneas, o toca auth/datos/config: fan-out paralelo `code-reviewer` + `security-auditor` + `test-engineer` y sintetizá.
6. **Reportar.** Tabla tarea → subagente → estado → evidencia; lo pendiente; los supuestos.

No hagas vos el trabajo de volumen (leer decenas de archivos, implementar tareas especificadas): delegalo. Sí hacé vos las decisiones, el plan, los briefs y la verificación.
