/** @typedef {'high' | 'medium' | 'low'} TaskOverhead */

/**
 * Skills that add meaningful time to each task (test runs, sub-agents, interview
 * rounds, large rule sets). Used for preset hints and README.
 *
 * @type {Record<string, { overhead: TaskOverhead, reason: string }>}
 */
export const SKILL_OVERHEAD = {
  'develop-with-tdd': {
    overhead: 'high',
    reason: 'Red-green-refactor cycle; must write failing tests and run the test suite before and after each change',
  },
  'write-unit-tests': {
    overhead: 'high',
    reason: 'Writes and runs unit tests; pulls in TDD test-quality rules',
  },
  'write-e2e-tests': {
    overhead: 'high',
    reason: 'End-to-end specs are slow to author and execute',
  },
  'write-storybook': {
    overhead: 'medium',
    reason: 'Extra story files and states per component',
  },
  'review-code': {
    overhead: 'high',
    reason: 'Spawns two parallel sub-agents over the full diff',
  },
  'grill-me': {
    overhead: 'medium',
    reason: 'Interview rounds and plan confirmation before any implementation',
  },
  'specify-context': {
    overhead: 'medium',
    reason: 'Interview rounds to fill project context files, one file per invocation',
  },
  'create-feature-spec': {
    overhead: 'medium',
    reason: 'Interview rounds to write a unit spec and update the progress tracker',
  },
  'fix-tech-debt': {
    overhead: 'medium',
    reason: 'Repo scan, domain inventory, selection, then grilling rounds before implementation',
  },
  'apply-best-practices': {
    overhead: 'medium',
    reason: '70 React/Next.js performance rules; can trigger broad refactors',
  },
  'feature-sliced-design': {
    overhead: 'medium',
    reason: 'Architecture migrations, Steiger linting, layer boundaries',
  },
  'use-hybrid-folder-structure': {
    overhead: 'medium',
    reason: 'Multi-file refactors across responsibility and feature folders',
  },
  'request-refactor-plan': {
    overhead: 'medium',
    reason: 'Interview rounds, then a GitHub issue with a tiny-commit plan',
  },
  'apply-solid-principles': {
    overhead: 'medium',
    reason: 'Can split modules and invert dependencies across several files',
  },
  'apply-style-guide': {
    overhead: 'low',
    reason: 'Style pass on touched files',
  },
  'apply-prettier': {
    overhead: 'low',
    reason: 'Format-only; runs on demand',
  },
  'fix-lint': {
    overhead: 'low',
    reason: 'Lint fix on named or changed files',
  },
  'create-commit': {
    overhead: 'low',
    reason: 'Only when you ask to commit',
  },
  'write-handoff': {
    overhead: 'low',
    reason: 'Only when handing off a session',
  },
  'show-skill-catalog': {
    overhead: 'low',
    reason: 'Routing help only',
  },
  'find-skills': {
    overhead: 'low',
    reason: 'Discovery only',
  },
};

/**
 * Display and install order. Context skills stay first; picker bundles appear
 * at the first member's position (specify-context + create-feature-spec).
 *
 * @type {string[]}
 */
export const SKILL_ORDER = [
  'grill-me',
  'review-code',
  'specify-context',
  'create-feature-spec',
  'show-skill-catalog',
  'find-skills',
  'fix-tech-debt',
  'request-refactor-plan',
  'apply-solid-principles',
  'create-commit',
  'fix-lint',
  'apply-prettier',
  'apply-style-guide',
  'write-handoff',
  'develop-with-tdd',
  'write-unit-tests',
  'write-e2e-tests',
  'write-storybook',
  'apply-best-practices',
  'feature-sliced-design',
  'use-hybrid-folder-structure',
];

const FULL_ONLY = new Set([
  'review-code',
  'develop-with-tdd',
  'write-unit-tests',
  'write-e2e-tests',
  'write-storybook',
  'apply-best-practices',
  'feature-sliced-design',
  'use-hybrid-folder-structure',
]);

const skillOrderIndex = new Map(SKILL_ORDER.map((id, index) => [id, index]));

export function compareSkillIds(a, b) {
  const left = skillOrderIndex.has(a) ? skillOrderIndex.get(a) : Number.POSITIVE_INFINITY;
  const right = skillOrderIndex.has(b) ? skillOrderIndex.get(b) : Number.POSITIVE_INFINITY;
  if (left !== right) return left - right;
  return a.localeCompare(b);
}

/** @type {Array<{ id: string, label: string, hint: string, skillIds: string[] }>} */
export const PRESETS = [
  {
    id: 'quick',
    label: 'Quick (pet projects)',
    hint: 'Fast iteration — planning and hygiene, no TDD or test overhead',
    skillIds: SKILL_ORDER.filter((id) => !FULL_ONLY.has(id)),
  },
  {
    id: 'full',
    label: 'Full (production)',
    hint: 'Everything — TDD, testing, review, and architecture skills included',
    skillIds: null,
  },
];

/**
 * Skills that must install or clear together. The CLI picker shows one row;
 * after install each member is still its own slash command.
 *
 * @type {Array<{ id: string, label: string, hint: string, skillIds: string[] }>}
 */
export const BUNDLES = [
  {
    id: 'spec-driven-context',
    label: 'Spec-driven context',
    hint: 'moderate — /specify-context and /create-feature-spec (always installed together)',
    skillIds: ['specify-context', 'create-feature-spec'],
  },
];

export function skillIdsForPreset(presetId, allSkillIds) {
  const known = new Set(allSkillIds);
  const preset = PRESETS.find((p) => p.id === presetId);
  const ids = !preset || preset.skillIds === null ? allSkillIds : preset.skillIds;
  return ids.filter((id) => known.has(id)).sort(compareSkillIds);
}

export function overheadHint(skillId) {
  const info = SKILL_OVERHEAD[skillId];
  if (!info || info.overhead === 'low') return undefined;
  const tag = info.overhead === 'high' ? 'slow' : 'moderate';
  return `${tag} — ${info.reason}`;
}

export function expandSelectedIds(selectedIds) {
  const out = [];
  const seen = new Set();

  for (const id of selectedIds) {
    const bundle = BUNDLES.find((entry) => entry.id === id);
    const ids = bundle ? bundle.skillIds : [id];
    for (const skillId of ids) {
      if (seen.has(skillId)) continue;
      seen.add(skillId);
      out.push(skillId);
    }
  }

  return out;
}

function bundleForSkill(skillId) {
  return BUNDLES.find((bundle) => bundle.skillIds.includes(skillId));
}

/**
 * Picker rows in SKILL_ORDER. Bundles replace their members at the first
 * member's position (spec-driven context after grill-me and review-code).
 *
 * @param {Array<{ id: string, name: string, description: string }>} skills
 */
export function pickerEntries(skills) {
  const byId = new Map(skills.map((skill) => [skill.id, skill]));
  const seen = new Set();
  const entries = [];
  const leftover = skills.map((skill) => skill.id).filter((id) => !skillOrderIndex.has(id));

  for (const id of [...SKILL_ORDER, ...leftover]) {
    const bundle = bundleForSkill(id);
    if (bundle) {
      if (seen.has(bundle.id)) continue;
      if (!bundle.skillIds.some((skillId) => byId.has(skillId))) continue;
      seen.add(bundle.id);
      entries.push({
        value: bundle.id,
        label: bundle.label,
        hint: bundle.hint,
      });
      continue;
    }

    const skill = byId.get(id);
    if (!skill || seen.has(skill.id)) continue;
    seen.add(skill.id);
    entries.push({
      value: skill.id,
      label: skill.name,
      hint: overheadHint(skill.id) || skill.description,
    });
  }

  return entries;
}

/** Map installed skill ids to picker values (bundle id if any member is present). */
export function pickerValuesForInstalled(installedIds) {
  const installed = new Set(installedIds);
  const values = [];
  const covered = new Set();
  const leftover = [...installedIds].filter((id) => !skillOrderIndex.has(id));

  for (const id of [...SKILL_ORDER, ...leftover]) {
    const bundle = bundleForSkill(id);
    if (bundle) {
      if (covered.has(bundle.id)) continue;
      if (!bundle.skillIds.some((skillId) => installed.has(skillId))) continue;
      covered.add(bundle.id);
      for (const skillId of bundle.skillIds) covered.add(skillId);
      values.push(bundle.id);
      continue;
    }

    if (!installed.has(id) || covered.has(id)) continue;
    covered.add(id);
    values.push(id);
  }

  return values;
}
