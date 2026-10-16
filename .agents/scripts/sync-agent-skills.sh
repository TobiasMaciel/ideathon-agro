#!/usr/bin/env bash
# Actualiza el harness addyosmani/agent-skills en este proyecto (Claude Code + Gemini CLI).
# Uso: bash scripts/sync-agent-skills.sh [ref]   (ref por defecto: main)
set -euo pipefail

REF="${1:-main}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

git clone --quiet --depth 1 --branch "$REF" https://github.com/addyosmani/agent-skills.git "$TMP/agent-skills"
SRC="$TMP/agent-skills"
cd "$ROOT"

# Skills y referencias (Claude lee .claude/, Gemini lee .agents/).
# Solo se reemplazan las skills que vienen de agent-skills: las de UI (better-*, taste) se conservan.
for base in .claude .agents; do
  mkdir -p "$base/skills" "$base/references"
  for dir in "$SRC"/skills/*/; do
    name="$(basename "$dir")"
    rm -rf "${base:?}/skills/${name:?}"
    cp -r "$dir" "$base/skills/$name"
  done
  cp "$SRC"/references/*.md "$base/references/"
done

# Comandos: Claude sin prefijo de plugin y /plan -> /planning. orchestrate.* es propio, no se toca.
for f in "$SRC"/.claude/commands/*.md; do
  n="$(basename "$f")"; [ "$n" = plan.md ] && n=planning.md
  sed 's/agent-skills://g' "$f" > ".claude/commands/$n"
done
cp "$SRC"/.gemini/commands/*.toml .gemini/commands/

# Personas upstream -> fuente compartida, luego regenerar subagentes de ambos CLIs
cp "$SRC"/agents/*.md .agents/agents/
node .agents/scripts/build-agents.mjs

echo "agent-skills sincronizado en $(cd "$SRC" && git rev-parse --short HEAD). Actualizá el commit en AGENTS.md."
