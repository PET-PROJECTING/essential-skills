#!/usr/bin/env node

import * as p from '@clack/prompts';
import { existsSync } from 'node:fs';
import { cp, mkdir, readdir, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { overheadHint, PRESETS, skillIdsForPreset } from './presets.js';

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

const NAV = {
  BACK: '__back__',
};

function onCancel() {
  p.cancel('Cancelled.');
  process.exit(0);
}

function resolveCancel(value) {
  if (p.isCancel(value)) onCancel();
  return value;
}

function navMessage(message, canBack) {
  return canBack ? `${message}  (← back)` : message;
}

function swallowLeftArrow(onLeft) {
  const input = process.stdin;
  const origEmit = input.emit;

  input.emit = function patchedEmit(event, ...args) {
    if (event === 'keypress') {
      const key = args[1];
      if (key?.name === 'left' && !key.ctrl && !key.meta && !key.shift) {
        onLeft();
        return false;
      }
    }

    return origEmit.call(this, event, ...args);
  };

  return () => {
    input.emit = origEmit;
  };
}

async function withNav(factory, canBack = true) {
  if (!canBack) return resolveCancel(await factory());

  const ac = new AbortController();
  let back = false;
  const restore = swallowLeftArrow(() => {
    if (back || ac.signal.aborted) return;
    back = true;
    ac.abort();
  });

  try {
    const value = await factory(ac.signal);
    if (back) return NAV.BACK;
    return resolveCancel(value);
  } finally {
    restore();
  }
}

function selectNav(opts, canBack = true) {
  return withNav(
    (signal) =>
      p.select({
        ...opts,
        message: navMessage(opts.message, canBack),
        ...(signal ? { signal } : {}),
      }),
    canBack,
  );
}

function multiselectNav(opts, canBack = true) {
  return withNav(
    (signal) =>
      p.multiselect({
        ...opts,
        message: navMessage(opts.message, canBack),
        ...(signal ? { signal } : {}),
      }),
    canBack,
  );
}

function firstSentence(text) {
  const compact = (text || '').replace(/\s+/g, ' ').trim();
  if (!compact) return '';
  const idx = compact.search(/\.\s/);
  const sentence = idx === -1 ? compact : compact.slice(0, idx);
  return sentence.replace(/[.!?]+$/, '');
}

function catalogLines(skills, selectedIds) {
  const byId = new Map(skills.map((skill) => [skill.id, skill]));
  return selectedIds
    .map((id) => byId.get(id) || { id, name: id, description: '' })
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((skill) => {
      const summary = firstSentence(skill.description) || skill.name;
      return `/${skill.id} — ${truncate(summary, 88)}`;
    });
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

async function installedPackSkillIds(destRoots, packIds) {
  const found = new Set();

  for (const destRoot of destRoots) {
    if (!existsSync(destRoot)) continue;

    const entries = await readdir(destRoot, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && packIds.has(entry.name)) found.add(entry.name);
    }
  }

  return [...found].sort((a, b) => a.localeCompare(b));
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

async function promptLocation(action) {
  return selectNav({
    message:
      action === 'install'
        ? 'How do you want to install these skills?'
        : 'Where should skills be removed from?',
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
}

async function promptAgents(location, action) {
  const detected = detectedAgentIds();
  const initialAgents = detected.length > 0 ? detected : ['claude-code', 'cursor'];

  return multiselectNav({
    message:
      action === 'install'
        ? 'Which agents should receive these skills?'
        : 'Which agents should be cleaned up?',
    options: AGENTS.map((agent) => ({
      value: agent.id,
      label: agent.label,
      hint: [agent.hint, displayDest(agent, location)].filter(Boolean).join(' · '),
    })),
    initialValues: initialAgents,
    required: true,
  });
}

function destRootsFor(selectedAgents, location) {
  return [
    ...new Set(
      AGENTS.filter((agent) => selectedAgents.includes(agent.id)).map((agent) =>
        destFor(agent, location),
      ),
    ),
  ];
}

async function promptSkillSelection(skills) {
  const allIds = skills.map((skill) => skill.id);

  while (true) {
    const mode = await selectNav({
      message: 'How do you want to pick skills?',
      options: [
        ...PRESETS.map((preset) => ({
          value: preset.id,
          label: preset.label,
          hint: preset.hint,
        })),
        {
          value: 'manual',
          label: 'Choose manually',
          hint: 'Pick each skill yourself',
        },
      ],
    });

    if (mode === NAV.BACK) return NAV.BACK;

    if (mode === 'manual') {
      const selected = await multiselectNav({
        message: 'Select skills to install',
        options: skills.map((skill) => ({
          value: skill.id,
          label: skill.name,
          hint: truncate(overheadHint(skill.id) || skill.description),
        })),
        initialValues: allIds,
        required: true,
      });

      if (selected === NAV.BACK) continue;
      return selected;
    }

    const presetIds = skillIdsForPreset(mode, allIds);
    const preset = PRESETS.find((entry) => entry.id === mode);
    const excluded = allIds.filter((id) => !presetIds.includes(id));

    p.note(
      [
        `Installing ${presetIds.length} skill${presetIds.length === 1 ? '' : 's'} from "${preset.label}".`,
        excluded.length > 0
          ? `Skipping ${excluded.length} (e.g. ${excluded.slice(0, 3).join(', ')}${excluded.length > 3 ? ', …' : ''}).`
          : '',
      ]
        .filter(Boolean)
        .join('\n'),
      'Preset',
    );

    return presetIds;
  }
}

async function promptAction() {
  return selectNav(
    {
      message: 'What would you like to do?',
      options: [
        {
          value: 'install',
          label: 'Install skills',
          hint: 'Copy skills into project or global agent folders',
        },
        {
          value: 'clear',
          label: 'Clear installed skills',
          hint: 'Remove this pack from project or global folders',
        },
      ],
    },
    false,
  );
}

async function runInstall(skills) {
  let location;
  let selectedAgents;
  let selected;
  let step = 'location';

  while (step !== 'install') {
    if (step === 'location') {
      const result = await promptLocation('install');
      if (result === NAV.BACK) return NAV.BACK;
      location = result;
      step = 'agents';
      continue;
    }

    if (step === 'agents') {
      const result = await promptAgents(location, 'install');
      if (result === NAV.BACK) {
        step = 'location';
        continue;
      }
      selectedAgents = result;
      step = 'skills';
      continue;
    }

    if (step === 'skills') {
      const result = await promptSkillSelection(skills);
      if (result === NAV.BACK) {
        step = 'agents';
        continue;
      }
      selected = result;
      step = 'conflicts';
      continue;
    }

    const destRoots = destRootsFor(selectedAgents, location);
    const destLabels = destRoots.map(formatPath).join(', ');
    const conflicts = existingSkillIds(destRoots, selected);

    if (step === 'conflicts' && conflicts.length > 0) {
      const nameById = new Map(skills.map((skill) => [skill.id, skill.name]));
      const names = conflicts.map((id) => nameById.get(id) || id);
      const action = await selectNav({
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

      if (action === NAV.BACK) {
        step = 'skills';
        continue;
      }
      if (action === 'cancel') onCancel();
    }

    step = 'install';
  }

  const destRoots = destRootsFor(selectedAgents, location);
  const destLabels = destRoots.map(formatPath).join(', ');

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
  p.note(catalogLines(skills, selected).join('\n'), 'Installed skills');
  p.outro(
    'Restart your agent session to pick up the new skills. Run /show-skill-catalog anytime for this list.',
  );
}

async function runClear(skills) {
  let location;
  let selectedAgents;
  let selected;
  let step = 'location';

  while (step !== 'remove') {
    if (step === 'location') {
      const result = await promptLocation('clear');
      if (result === NAV.BACK) return NAV.BACK;
      location = result;
      step = 'agents';
      continue;
    }

    if (step === 'agents') {
      const result = await promptAgents(location, 'clear');
      if (result === NAV.BACK) {
        step = 'location';
        continue;
      }
      selectedAgents = result;
      step = 'skills';
      continue;
    }

    const destRoots = destRootsFor(selectedAgents, location);
    const destLabels = destRoots.map(formatPath).join(', ');
    const packIds = new Set(skills.map((skill) => skill.id));
    const installed = await installedPackSkillIds(destRoots, packIds);

    if (step === 'skills') {
      if (installed.length === 0) {
        p.log.warn(`No essential-skills pack skills found at ${destLabels}.`);
        step = 'agents';
        continue;
      }

      const nameById = new Map(skills.map((skill) => [skill.id, skill.name]));
      const picked = await multiselectNav({
        message: 'Select skills to remove',
        options: installed.map((id) => ({
          value: id,
          label: nameById.get(id) || id,
          hint: truncate(skills.find((skill) => skill.id === id)?.description || ''),
        })),
        initialValues: installed,
        required: true,
      });

      if (picked === NAV.BACK) {
        step = 'agents';
        continue;
      }

      selected = picked;
      step = 'confirm';
      continue;
    }

    if (step === 'confirm') {
      const decision = await selectNav({
        message: `Remove ${selected.length} skill${selected.length === 1 ? '' : 's'} from ${destLabels}?`,
        options: [
          {
            value: 'remove',
            label: 'Yes, remove them',
            hint: 'Delete only skills from this pack',
          },
          {
            value: 'cancel',
            label: 'Cancel',
            hint: 'Leave installed skills as they are',
          },
        ],
      });

      if (decision === NAV.BACK) {
        step = 'skills';
        continue;
      }
      if (decision === 'cancel') onCancel();

      step = 'remove';
    }
  }

  const destRoots = destRootsFor(selectedAgents, location);
  const destLabels = destRoots.map(formatPath).join(', ');

  const spinner = p.spinner();
  const countLabel = `${selected.length} skill${selected.length === 1 ? '' : 's'}`;
  spinner.start(`Removing ${countLabel}`);

  for (const destRoot of destRoots) {
    for (const id of selected) {
      await rm(path.join(destRoot, id), { recursive: true, force: true });
    }
  }

  spinner.stop(`Removed ${countLabel} from ${destLabels}`);
  p.outro('Restart your agent session so it stops loading the removed skills.');
}

async function main() {
  p.intro('essential-skills');

  const skills = await listSkills();
  if (skills.length === 0) {
    p.cancel('No skills found in this pack.');
    process.exit(1);
  }

  while (true) {
    const action = await promptAction();

    if (action === 'clear') {
      const result = await runClear(skills);
      if (result === NAV.BACK) continue;
      return;
    }

    const result = await runInstall(skills);
    if (result === NAV.BACK) continue;
    return;
  }
}

main().catch((error) => {
  p.cancel(error.message);
  process.exit(1);
});
