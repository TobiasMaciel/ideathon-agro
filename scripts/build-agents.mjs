#!/usr/bin/env node
// Genera los subagentes de Claude Code (.claude/agents) y Gemini CLI (.gemini/agents)
// a partir de una única fuente: .agents/agents/*.md (frontmatter name/description + cuerpo).
// Modelo, herramientas y skills de cada rol se configuran en ROLES.
//
// Uso: node scripts/build-agents.mjs

import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, '.agents', 'agents');

// Modelos de los trabajadores. El orquestador (sesión principal) se configura en
// .claude/settings.json y .gemini/settings.json.
const MODELS = {
  claude: { large: 'sonnet', small: 'haiku' },
  gemini: { large: 'gemini-3-flash-preview', small: 'gemini-3-flash-preview' },
};

const READ_ONLY = {
  claude: ['Read', 'Grep', 'Glob'],
  gemini: ['read_file', 'read_many_files', 'grep_search', 'glob', 'list_directory'],
};
const SHELL = { claude: ['Bash'], gemini: ['run_shell_command'] };
const WRITE = { claude: ['Write', 'Edit'], gemini: ['write_file', 'replace'] };
const WEB = { claude: ['WebFetch', 'WebSearch'], gemini: ['web_fetch', 'google_web_search'] };

// tools: null => hereda todas las herramientas de la sesión.
const ROLES = {
  researcher: { tier: 'small', tools: [READ_ONLY, WEB], maxTurns: 20, skills: [] },
  implementer: {
    tier: 'large', tools: null, maxTurns: 40, timeout: 20,
    skills: ['incremental-implementation', 'test-driven-development'],
  },
  'test-runner': { tier: 'small', tools: [READ_ONLY, SHELL], maxTurns: 15, skills: [] },
  'doc-writer': { tier: 'small', tools: [READ_ONLY, WRITE], maxTurns: 20, skills: ['documentation-and-adrs'] },
  'code-reviewer': { tier: 'large', tools: [READ_ONLY, SHELL], maxTurns: 25, skills: ['code-review-and-quality'] },
  'security-auditor': { tier: 'large', tools: [READ_ONLY, SHELL], maxTurns: 25, skills: ['security-and-hardening'] },
  'test-engineer': {
    tier: 'large', tools: [READ_ONLY, SHELL, WRITE], maxTurns: 30, timeout: 15,
    skills: ['test-driven-development'],
  },
  'web-performance-auditor': {
    tier: 'large', tools: [READ_ONLY, SHELL, WEB], maxTurns: 25, skills: ['performance-optimization'],
  },
};

const WORKER_FOOTER = `

---

## Protocolo de trabajador (ideathon-agro)

Sos un subagente despachado por el orquestador. No ves la conversación: el brief es todo tu contexto.
No llames a otros agentes. Si el brief es ambiguo, hacé el supuesto mínimo y declaralo en tu respuesta.
Respondé en el idioma del brief y en el formato de respuesta que pida (o el de este archivo si no pide ninguno).
`;

function parse(file) {
  const text = readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const m = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`Sin frontmatter: ${file}`);
  const fm = Object.fromEntries(
    m[1].split('\n').filter(Boolean).map((l) => {
      const i = l.indexOf(':');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
  );
  return { name: fm.name, description: fm.description, body: m[2].trim() };
}

const yamlStr = (s) => JSON.stringify(s);
const tools = (role, host) => role.tools && [...new Set(role.tools.flatMap((g) => g[host]))];

function claude(a, role) {
  const lines = ['---', `name: ${a.name}`, `description: ${yamlStr(a.description)}`, `model: ${MODELS.claude[role.tier]}`];
  const t = tools(role, 'claude');
  if (t) lines.push(`tools: ${t.join(', ')}`);
  if (role.skills.length) lines.push('skills:', ...role.skills.map((s) => `  - ${s}`));
  lines.push('---');
  return `${lines.join('\n')}\n\n${a.body}${WORKER_FOOTER}`;
}

function gemini(a, role) {
  const lines = [
    '---', `name: ${a.name}`, `description: ${yamlStr(a.description)}`, 'kind: local',
    `model: ${MODELS.gemini[role.tier]}`,
  ];
  const t = tools(role, 'gemini');
  if (t && role.skills.length) t.push('activate_skill');
  if (t) lines.push('tools:', ...t.map((x) => `  - ${x}`));
  lines.push(`max_turns: ${role.maxTurns}`, `timeout_mins: ${role.timeout ?? 10}`, '---');
  const skillNote = role.skills.length
    ? `\n\nAntes de empezar, activá estas skills (están en .agents/skills/): ${role.skills.map((s) => `\`${s}\``).join(', ')}.`
    : '';
  return `${lines.join('\n')}\n\n${a.body}${skillNote}${WORKER_FOOTER}`;
}

for (const dir of ['.claude/agents', '.gemini/agents']) mkdirSync(join(ROOT, dir), { recursive: true });

for (const f of readdirSync(SRC).filter((x) => x.endsWith('.md'))) {
  const a = parse(join(SRC, f));
  const role = ROLES[a.name];
  if (!role) throw new Error(`Falta configurar el rol "${a.name}" en ROLES`);
  writeFileSync(join(ROOT, '.claude/agents', f), claude(a, role));
  writeFileSync(join(ROOT, '.gemini/agents', f), gemini(a, role));
  console.log(`ok  ${a.name.padEnd(24)} claude=${MODELS.claude[role.tier]}  gemini=${MODELS.gemini[role.tier]}`);
}
