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
  CANCEL: '__cancel__',
};

function navOptions(canBack = true) {
  const options = [];
  if (canBack) {
    options.push({
      value: NAV.BACK,
      label: '← Go back',
      hint: 'Return to the previous step',
    });
  }
  options.push({
    value: NAV.CANCEL,
    label: 'Cancel',
    hint: 'Exit without changes',
  });
  return options;
}

function resolveNav(value) {
  if (p.isCancel(value) || value === NAV.CANCEL) onCancel();
  return value;
}

function onCancel() {
  p.cancel('Cancelled.');
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

async function promptLocation(action, { canBack = true } = {}) {
  const location = await p.select({
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
      ...navOptions(canBack),
    ],
  });

  return resolveNav(location);
}

async function confirmMultiselect(message, selected) {
  const action = await p.select({
    message,
    options: [
      {
        value: 'continue',
        label: 'Continue',
        hint: `${selected.length} selected`,
      },
      ...navOptions(true),
    ],
  });

  const resolved = resolveNav(action);
  if (resolved === NAV.BACK) return NAV.BACK;
  return selected;
}

async function promptAgents(location, action) {
  const detected = detectedAgentIds();
  const initialAgents = detected.length > 0 ? detected : ['claude-code', 'cursor'];

  while (true) {
    const selectedAgents = await p.multiselect({
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

    if (p.isCancel(selectedAgents)) onCancel();

    const confirmed = await confirmMultiselect(
      action === 'install'
        ? 'Continue with these agents?'
        : 'Continue with these agents to clean up?',
      selectedAgents,
    );

    if (confirmed === NAV.BACK) continue;
    return confirmed;
  }
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
    const mode = await p.select({
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
        ...navOptions(true),
      ],
    });

    const resolvedMode = resolveNav(mode);
    if (resolvedMode === NAV.BACK) return NAV.BACK;

    if (resolvedMode === 'manual') {
      while (true) {
        const selected = await p.multiselect({
          message: 'Select skills to install',
          options: skills.map((skill) => ({
            value: skill.id,
            label: skill.name,
            hint: truncate(overheadHint(skill.id) || skill.description),
          })),
          initialValues: allIds,
          required: true,
        });

        if (p.isCancel(selected)) onCancel();

        const confirmed = await confirmMultiselect(
          'Continue with these skills?',
          selected,
        );

        if (confirmed === NAV.BACK) continue;
        return confirmed;
      }
    }

    const presetIds = skillIdsForPreset(resolvedMode, allIds);
    const preset = PRESETS.find((entry) => entry.id === resolvedMode);
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
  const action = await p.select({
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
      ...navOptions(false),
    ],
  });

  return resolveNav(action);
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
          ...navOptions(true),
        ],
      });

      const resolvedAction = resolveNav(action);
      if (resolvedAction === NAV.BACK) {
        step = 'skills';
        continue;
      }
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
  p.outro(
    'Restart your agent session to pick up the new skills. Then run /show-skill-catalog to see what each skill does.',
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
        p.cancel(`No essential-skills pack skills found at ${destLabels}.`);
        process.exit(0);
      }

      const nameById = new Map(skills.map((skill) => [skill.id, skill.name]));

      while (true) {
        const picked = await p.multiselect({
          message: 'Select skills to remove',
          options: installed.map((id) => ({
            value: id,
            label: nameById.get(id) || id,
            hint: truncate(skills.find((skill) => skill.id === id)?.description || ''),
          })),
          initialValues: installed,
          required: true,
        });

        if (p.isCancel(picked)) onCancel();

        const confirmed = await confirmMultiselect(
          'Continue with these skills to remove?',
          picked,
        );

        if (confirmed === NAV.BACK) continue;
        selected = confirmed;
        step = 'confirm';
        break;
      }
      continue;
    }

    if (step === 'confirm') {
      const decision = await p.select({
        message: `Remove ${selected.length} skill${selected.length === 1 ? '' : 's'} from ${destLabels}?`,
        options: [
          {
            value: 'remove',
            label: 'Yes, remove them',
            hint: 'Delete only skills from this pack',
          },
          ...navOptions(true),
        ],
      });

      const resolved = resolveNav(decision);
      if (resolved === NAV.BACK) {
        step = 'skills';
        continue;
      }

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
