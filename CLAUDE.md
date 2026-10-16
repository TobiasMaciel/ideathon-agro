@AGENTS.md

## Específico de Claude Code

- La sesión principal usa **Opus** (`.claude/settings.json` → `"model": "opus"`). Es el orquestador.
- Subagentes en `.claude/agents/` con `model: sonnet` o `model: haiku` fijado en el frontmatter.
- Delegá con la herramienta **Agent** usando `subagent_type: "<nombre>"` y el brief de la plantilla como `prompt`.
  Varias llamadas Agent en el mismo mensaje = ejecución en paralelo.
- Para búsquedas rápidas de solo lectura también sirve el subagente nativo `Explore` (Haiku).
- Las skills se invocan con la herramienta **Skill** usando el nombre sin prefijo (p.ej. `incremental-implementation`).
- `/orchestrate <pedido>` ejecuta el flujo completo maestro → trabajadores.
