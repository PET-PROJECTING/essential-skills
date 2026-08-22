#!/usr/bin/env node

import * as p from '@clack/prompts';
import { existsSync } from 'node:fs';
import { cp, mkdir, readdir, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HOME = os.homedir();
const SKILLS_ROOT = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'skills',
);

const AGENTS = [
  {
    id: 'claude-code',
    label: 'Claude Code',
    projectDir: '.claude/skills',
    globalDir: path.join(HOME, '.claude', 'skills'),
    detect: [path.join(HOME, '.claude')],
  },
  {
    id: 'cursor',
    label: 'Cursor',
    projectDir: '.cursor/skills',
    globalDir: path.join(HOME, '.cursor', 'skills'),
    detect: [path.join(HOME, '.cursor')],
  },
  {
    id: 'codex',
    label: 'Codex',
    projectDir: '.agents/skills',
    globalDir: path.join(HOME, '.codex', 'skills'),
    detect: [path.join(HOME, '.codex')],
  },
  {
    id: 'github-copilot',
    label: 'GitHub Copilot',
    projectDir: '.agents/skills',
    globalDir: path.join(HOME, '.copilot', 'skills'),
    detect: [path.join(HOME, '.copilot')],
  },
  {
    id: 'gemini-cli',
    label: 'Gemini CLI',
    projectDir: '.agents/skills',
    globalDir: path.join(HOME, '.gemini', 'skills'),
    detect: [path.join(HOME, '.gemini')],
  },
  {
    id: 'opencode',
    label: 'OpenCode',
    projectDir: '.agents/skills',
    globalDir: path.join(HOME, '.config', 'opencode', 'skills'),
    detect: [path.join(HOME, '.config', 'opencode')],
  },
  {
    id: 'windsurf',
    label: 'Windsurf',
    projectDir: '.windsurf/skills',
    globalDir: path.join(HOME, '.codeium', 'windsurf', 'skills'),
    detect: [path.join(HOME, '.codeium', 'windsurf'), path.join(HOME, '.codeium')],
  },
  {
    id: 'universal',
    label: 'Universal',
    hint: 'Amp, Cline, Zed, and others',
    projectDir: '.agents/skills',
    globalDir: path.join(HOME, '.agents', 'skills'),
    detect: [path.join(HOME, '.agents')],
  },
];

function unquote(value) {
  if (
    (value.startsWith("'") && value.endsWith("'")) ||
    (value.startsWith('"') && value.endsWith('"'))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};

  const data = {};
  const lines = match[1].split('\n');
  let key = null;
  let buffer = [];
  let folded = false;

  const commit = () => {
    if (!key) return;
    const raw = buffer.join(folded ? ' ' : '\n').replace(/\s+/g, ' ').trim();
    data[key] = unquote(raw);
    key = null;
    buffer = [];
    folded = false;
  };

  for (const line of lines) {
    const block = line.match(/^([A-Za-z0-9_-]+):\s*(>\-?|\|-?)\s*$/);
    if (block) {
      commit();
      key = block[1];
      folded = block[2].startsWith('>');
      continue;
    }

    const scalar = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (scalar && !line.startsWith(' ') && !line.startsWith('\t')) {
      commit();
      key = scalar[1];
      buffer = [scalar[2]];
      continue;
    }

    if (key) buffer.push(line.trim());
  }

  commit();
  return data;
}

function truncate(text, max = 64) {
  if (!text || text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

function onCancel() {
  p.cancel('Installation cancelled.');
  process.exit(0);
}

function destFor(agent, location) {
  return location === 'global'
    ? agent.globalDir
    : path.join(process.cwd(), agent.projectDir);
}

function displayDest(agent, location) {
  const dest = destFor(agent, location);
  return dest.startsWith(HOME) ? dest.replace(HOME, '~') : path.relative(process.cwd(), dest) || dest;
}

function formatPath(dest) {
  return dest.startsWith(HOME) ? dest.replace(HOME, '~') : dest;
}

function existingSkillIds(destRoots, selectedIds) {
  const found = new Set();

  for (const destRoot of destRoots) {
    for (const id of selectedIds) {
      if (existsSync(path.join(destRoot, id))) found.add(id);
    }
  }

  return [...found];
}

function detectedAgentIds() {
  return AGENTS.filter((agent) => agent.detect.some((dir) => existsSync(dir))).map(
    (agent) => agent.id,
  );
}

async function listSkills() {
  const entries = await readdir(SKILLS_ROOT, { withFileTypes: true });
  const skills = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    try {
      const content = await readFile(
        path.join(SKILLS_ROOT, entry.name, 'SKILL.md'),
        'utf8',
      );
      const meta = parseFrontmatter(content);
      skills.push({
        id: entry.name,
        name: meta.name || entry.name,
        description: meta.description || '',
      });
    } catch {
      // Skip directories that are not skills.
    }
  }

  skills.sort((a, b) => a.name.localeCompare(b.name));
  return skills;
}

async function main() {
  p.intro('essential-skills');

  const skills = await listSkills();
  if (skills.length === 0) {
    p.cancel('No skills found to install.');
    process.exit(1);
  }

  const location = await p.select({
    message: 'How do you want to install these skills?',
    options: [
      {
        value: 'global',
        label: 'Global (home)',
        hint: 'Available in every project',
      },
      {
        value: 'project',
        label: 'Current project',
        hint: 'Kept in this repo',
      },
    ],
  });

  if (p.isCancel(location)) onCancel();

  const detected = detectedAgentIds();
  const initialAgents = detected.length > 0 ? detected : ['claude-code', 'cursor'];

  const selectedAgents = await p.multiselect({
    message: 'Which agents should receive these skills?',
    options: AGENTS.map((agent) => ({
      value: agent.id,
      label: agent.label,
      hint: [agent.hint, displayDest(agent, location)].filter(Boolean).join(' · '),
    })),
    initialValues: initialAgents,
    required: true,
  });

  if (p.isCancel(selectedAgents)) onCancel();

  const selected = await p.multiselect({
    message: 'Select skills to install',
    options: skills.map((skill) => ({
      value: skill.id,
      label: skill.name,
      hint: truncate(skill.description),
    })),
    initialValues: skills.map((skill) => skill.id),
    required: true,
  });

  if (p.isCancel(selected)) onCancel();

  const destRoots = [
    ...new Set(
      AGENTS.filter((agent) => selectedAgents.includes(agent.id)).map((agent) =>
        destFor(agent, location),
      ),
    ),
  ];
  const destLabels = destRoots.map(formatPath).join(', ');

  const conflicts = existingSkillIds(destRoots, selected);
  if (conflicts.length > 0) {
    const nameById = new Map(skills.map((skill) => [skill.id, skill.name]));
    const names = conflicts.map((id) => nameById.get(id) || id);
    const action = await p.select({
      message:
        conflicts.length === 1
          ? `${names[0]} is already installed at ${destLabels}. Override it?`
          : `${conflicts.length} selected skills are already installed at ${destLabels} (${names.join(', ')}). Override them?`,
      options: [
        {
          value: 'override',
          label: 'Override',
          hint: 'Replace the existing copies',
        },
        {
          value: 'cancel',
          label: 'Cancel',
          hint: 'Leave existing skills as they are',
        },
      ],
    });

    if (p.isCancel(action) || action === 'cancel') onCancel();
  }

  const spinner = p.spinner();
  const countLabel = `${selected.length} skill${selected.length === 1 ? '' : 's'}`;
  spinner.start(`Installing ${countLabel}`);

  for (const destRoot of destRoots) {
    await mkdir(destRoot, { recursive: true });

    for (const id of selected) {
      const destSkill = path.join(destRoot, id);
      await rm(destSkill, { recursive: true, force: true });
      await cp(path.join(SKILLS_ROOT, id), destSkill, { recursive: true });
    }
  }

  spinner.stop(`Installed ${countLabel} to ${destLabels}`);
  p.outro(
    'Restart your agent session to pick up the new skills. Then run /show-skill-catalog to see what each skill does.',
  );
}

main().catch((error) => {
  p.cancel(error.message);
  process.exit(1);
});
