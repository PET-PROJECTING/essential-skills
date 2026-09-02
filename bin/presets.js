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

/** @type {Array<{ id: string, label: string, hint: string, skillIds: string[] }>} */
export const PRESETS = [
  {
    id: 'quick',
    label: 'Quick (pet projects)',
    hint: 'Fast iteration — planning and hygiene, no TDD or test overhead',
    skillIds: [
      'show-skill-catalog',
      'find-skills',
      'grill-me',
      'request-refactor-plan',
      'apply-solid-principles',
      'create-commit',
      'fix-lint',
      'apply-prettier',
      'apply-style-guide',
      'write-handoff',
    ],
  },
  {
    id: 'full',
    label: 'Full (production)',
    hint: 'Everything — TDD, testing, review, and architecture skills included',
    skillIds: null,
  },
];

export function skillIdsForPreset(presetId, allSkillIds) {
  const preset = PRESETS.find((p) => p.id === presetId);
  if (!preset) return allSkillIds;
  if (preset.skillIds === null) return allSkillIds;
  return preset.skillIds.filter((id) => allSkillIds.includes(id));
}

export function overheadHint(skillId) {
  const info = SKILL_OVERHEAD[skillId];
  if (!info || info.overhead === 'low') return undefined;
  const tag = info.overhead === 'high' ? 'slow' : 'moderate';
  return `${tag} — ${info.reason}`;
}
