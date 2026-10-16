# AGENTS.md — Reglas compartidas (Claude Code + Gemini CLI)

Este archivo es la fuente única de reglas para cualquier agente que trabaje en este proyecto.
`CLAUDE.md` y `GEMINI.md` lo importan y solo agregan lo específico de cada CLI.

Proyecto: **ideathon-agro** — Desafío 03 · Del subproducto al mercado (cascarilla de arroz y biomasa forestal).

**Documento principal:** `docs/desafio.md` — enunciado, contexto e investigación del desafío. Es la fuente de verdad del proyecto: leelo antes de proponer o implementar algo, y respetá sus etiquetas de datos ([C], [P], [NV]).

---

## 1. Harness de skills (addyosmani/agent-skills)

Instalado desde https://github.com/addyosmani/agent-skills (commit `aeac41d`).

- Skills: `.claude/skills/` (Claude Code) y `.agents/skills/` (Gemini CLI). Mismo contenido.
- Checklists de referencia: `.claude/references/` y `.agents/references/`.
- Comandos del ciclo de vida: `/spec` → `/planning` → `/build` → `/test` → `/review` → `/code-simplify` → `/ship`
  (+ `/constraints`, `/webperf`, `/orchestrate`).
- Para actualizar: `bash scripts/sync-agent-skills.sh`.

Si una skill aplica a la tarea (aunque sea dudoso), **usala**. No implementes "rápido" salteando la skill.

| Intención | Skill |
|---|---|
| Feature nueva | `spec-driven-development` → `planning-and-task-breakdown` → `incremental-implementation` + `test-driven-development` |
| Idea difusa | `idea-refine` / `interview-me` |
| Bug / falla | `debugging-and-error-recovery` |
| Revisión | `code-review-and-quality` |
| Refactor | `code-simplification` |
| API / interfaz | `api-and-interface-design` |
| UI | `frontend-ui-engineering` |
| Seguridad | `security-and-hardening` |
| Release | `shipping-and-launch` |

---

## 2. Orquestación por agentes: maestro grande, trabajadores chicos

La sesión principal corre con el **modelo grande** (Claude Opus / Gemini Pro) y actúa como **orquestador**.
El trabajo de volumen lo hacen **subagentes con modelos más chicos** (Claude Sonnet/Haiku, Gemini Flash),
cada uno recibiendo un *brief* preciso escrito por el maestro.

### Roles

| Subagente | Modelo Claude | Modelo Gemini | Para qué | Escribe archivos |
|---|---|---|---|---|
| `researcher` | haiku | flash | Leer/buscar código o docs y devolver un resumen | No |
| `implementer` | sonnet | flash | Implementar UNA tarea acotada con tests | Sí |
| `test-runner` | haiku | flash | Correr tests/build/lint y resumir fallas | No |
| `doc-writer` | haiku | flash | README, ADRs, docs, comentarios | Sí (solo docs) |
| `code-reviewer` | sonnet | flash | Review de 5 ejes | No |
| `security-auditor` | sonnet | flash | Auditoría de seguridad | No |
| `test-engineer` | sonnet | flash | Estrategia/cobertura de tests | Sí (solo tests) |
| `web-performance-auditor` | sonnet | flash | Core Web Vitals / perf | No |

### Qué hace el maestro (y qué NO delega)

El maestro **se queda con**: entender el pedido, decisiones de arquitectura, el spec y el plan,
partir el trabajo en tareas, escribir los briefs, **verificar** lo que vuelve, integrar y hablar con el usuario.

El maestro **delega**: lectura masiva de archivos, implementación de tareas ya especificadas,
corridas de tests, documentación, reviews especializados.

No delegues si la tarea es trivial (≤ ~2 archivos, cambio obvio): hacerlo directo es más barato que escribir un brief.

### Flujo

1. **Entender** — si hace falta contexto amplio, mandar `researcher` (en paralelo si son áreas independientes).
2. **Decidir y planificar** — el maestro escribe/actualiza `SPEC.md` y `tasks/plan.md` (skills de spec y planning).
3. **Despachar** — un brief por tarea. Tareas independientes (sin archivos compartidos) → **en paralelo, en el mismo turno**.
   Tareas que tocan los mismos archivos → secuenciales.
4. **Verificar** — nunca aceptar un "listo" sin evidencia: leer el diff, correr `test-runner`, chequear criterios de aceptación.
   Si falla, devolver al subagente con feedback concreto (máx. 2 reintentos) o resolverlo el maestro.
5. **Revisar** — para cambios no triviales, fan-out paralelo `code-reviewer` + `security-auditor` + `test-engineer`, y el maestro sintetiza.
6. **Reportar** al usuario: qué se hizo, qué se verificó, qué queda pendiente.

### Reglas duras

- Los subagentes **no** llaman a otros subagentes. Solo el maestro orquesta.
- Un subagente = una tarea = un objetivo verificable.
- El subagente no ve la conversación: **todo lo que necesita va en el brief**.
- El maestro no confía en el resumen del subagente: verifica contra los archivos/tests.

### Plantilla de brief (obligatoria al delegar)

```
## Objetivo
<una oración: qué tiene que quedar hecho>

## Contexto
<por qué, decisiones ya tomadas, stack, convenciones del repo relevantes>

## Archivos
- Leer: <rutas>
- Modificar/crear: <rutas>   (nada fuera de esta lista)

## Pasos sugeridos
1. ...

## Restricciones
- No tocar: <rutas / APIs>
- No agregar dependencias sin decirlo
- Seguir la skill: <nombre-de-skill>

## Criterios de aceptación
- [ ] <verificable: test X pasa, comando Y sale 0, endpoint Z responde ...>

## Formato de respuesta
- Resumen de 3–6 bullets
- Archivos tocados (ruta + qué cambió)
- Comandos corridos y resultado
- Dudas / supuestos / cosas que NO hiciste
```

Buenos briefs: rutas exactas, criterios medibles, ejemplos de entrada/salida, qué está fuera de alcance.
Malos briefs: "mejorá el código", "arreglá el bug" sin reproducción, "fijate qué hace falta".

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
