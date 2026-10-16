@./AGENTS.md

## Específico de Gemini CLI

- La sesión principal usa **Gemini Pro** (`.gemini/settings.json` → `model.name`). Es el orquestador.
- Subagentes en `.gemini/agents/` con `model` Flash fijado en el frontmatter.
- Delegá llamando al subagente como herramienta (su nombre, p.ej. `implementer`) pasándole el brief de la plantilla,
  o forzalo escribiendo `@implementer ...`. Varias llamadas en el mismo turno = paralelo.
- Las skills están en `.agents/skills/` y se activan con `activate_skill`. Verificá con `/skills list`.
- Usá `/planning` (no `/plan`, que choca con un comando interno de Gemini).
- `/orchestrate <pedido>` ejecuta el flujo completo maestro → trabajadores.
