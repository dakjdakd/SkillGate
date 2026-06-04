import { GeneratedPolicyBundle, GeneratedPolicyFile, ProjectSkillProfile } from '../types';

function getSkillIds(profile: ProjectSkillProfile, activation: 'enabled' | 'manual_only' | 'disabled') {
  return profile.skills.filter(skill => skill.activation === activation).map(skill => skill.skillId);
}

function getReason(profile: ProjectSkillProfile, skillId: string) {
  return profile.skills.find(skill => skill.skillId === skillId)?.reason || 'No reason recorded.';
}

function renderSkillSection(profile: ProjectSkillProfile, title: string, intro: string, skillIds: string[]) {
  return `## ${title}

${intro}

${skillIds.length > 0 ? skillIds.map(id => `- \`${id}\`\n  - ${getReason(profile, id)}`).join('\n\n') : '- None'}`;
}

function renderConflictRules(profile: ProjectSkillProfile) {
  if (profile.conflicts.length === 0) {
    return '## Conflict Rules\n\nNo explicit conflict rules are active for this profile.';
  }

  return `## Conflict Rules

${profile.conflicts.map(conflict => {
  const responsibilities = Object.entries(conflict.responsibilities || {})
    .map(([skill, responsibility]) => `- \`${skill}\`: ${responsibility}`)
    .join('\n');

  return `### ${conflict.skills.map(skill => `\`${skill}\``).join(' + ')}

Resolution: \`${conflict.resolution}\`

${responsibilities || conflict.reason || 'Follow the recorded resolution for these skills.'}

Reason: ${conflict.reason || 'No reason recorded.'}`;
}).join('\n\n')}`;
}

export function generateAgentsMarkdown(profile: ProjectSkillProfile) {
  const enabled = getSkillIds(profile, 'enabled');
  const manualOnly = getSkillIds(profile, 'manual_only');
  const disabled = getSkillIds(profile, 'disabled');

  return `# Project Skill Policy

This project uses SkillGate to define project-level skill boundaries.

## Project Context

Project Name: ${profile.projectName}
Project Path: ${profile.projectPath}
Default Mode: ${profile.defaultMode}
Detected Project Type: ${profile.detectedProjectType || 'None'}
Requirement: ${profile.requirement || 'N/A'}

${renderSkillSection(profile, 'Enabled Skills', 'Use these skills by default when relevant:', enabled)}

${renderSkillSection(profile, 'Manual-Only Skills', 'Use these only when the user explicitly requests them:', manualOnly)}

## Disabled By Default

Do not use these unless the user explicitly changes the project policy:

${disabled.length > 0 ? disabled.map(id => `- \`${id}\``).join('\n') : '- None'}

${renderConflictRules(profile)}

## Small Change Rule

For small code edits, bug fixes, copy updates, or simple style tweaks, keep changes scoped and avoid activating unnecessary Skill workflows.

## Enforcement Level

This is a Soft Policy. It guides agent behavior through project instructions and does not hard-disable skills at runtime.`;
}

export function generateClaudeMarkdown(profile: ProjectSkillProfile) {
  return generateAgentsMarkdown(profile).replace(
    '# Project Skill Policy',
    '# Claude Code Skill Policy\n\nFollow this project-level SkillGate policy when working in this repository.'
  );
}

export function generateSkillPolicyMarkdown(profile: ProjectSkillProfile) {
  return generateAgentsMarkdown(profile).replace(
    '# Project Skill Policy',
    '# SkillGate Policy\n\nGeneric project-level skill boundary definition.'
  );
}

export function generateSessionPrompt(profile: ProjectSkillProfile) {
  const enabled = getSkillIds(profile, 'enabled');
  const manualOnly = getSkillIds(profile, 'manual_only');
  const disabled = getSkillIds(profile, 'disabled');

  const conflictText = profile.conflicts.length > 0
    ? `\n${profile.conflicts.map(conflict => {
      const responsibilities = Object.entries(conflict.responsibilities || {})
        .map(([skill, responsibility]) => `- ${skill}: ${responsibility}`)
        .join('\n');
      return `When ${conflict.skills.join(' and ')} both apply, use this resolution: ${conflict.resolution}.\n${responsibilities || conflict.reason || ''}`;
    }).join('\n\n')}`
    : '';

  return `For this project, follow the SkillGate policy below.

Use only enabled skills by default. Manual-only skills require an explicit user request. Disabled skills should not be used unless the user changes the project policy.

Current project mode: ${profile.defaultMode}.

Enabled skills:
${enabled.length > 0 ? enabled.map(id => `- ${id}`).join('\n') : '- None'}

Manual-only skills:
${manualOnly.length > 0 ? manualOnly.map(id => `- ${id}`).join('\n') : '- None'}

Disabled skills:
${disabled.length > 0 ? disabled.map(id => `- ${id}`).join('\n') : '- None'}
${conflictText}

For small code edits, bug fixes, copy updates, or simple style tweaks, keep changes scoped and avoid activating unnecessary Skill workflows.`;
}

export function generatePolicyBundle(profile: ProjectSkillProfile): GeneratedPolicyBundle {
  const agentsMd = generateAgentsMarkdown(profile);
  const claudeMd = generateClaudeMarkdown(profile);
  const skillPolicyMd = generateSkillPolicyMarkdown(profile);
  const profileJson = JSON.stringify(profile, null, 2);
  const sessionPrompt = generateSessionPrompt(profile);
  const files: GeneratedPolicyFile[] = [
    ...(profile.targets.includes('codex') ? [{ path: 'AGENTS.md', content: agentsMd }] : []),
    ...(profile.targets.includes('claude-code') ? [{ path: 'CLAUDE.md', content: claudeMd }] : []),
    { path: '.skillgate/profile.json', content: profileJson },
    { path: '.skillgate/skill-policy.md', content: skillPolicyMd },
    { path: '.skillgate/session-prompt.txt', content: sessionPrompt }
  ];

  return {
    agentsMd,
    claudeMd,
    skillPolicyMd,
    profileJson,
    sessionPrompt,
    files
  };
}
