import { classifyRequirement } from '../../src/core/classifyRequirement';
import { detectConflicts } from '../../src/core/detectConflicts';
import { resolveSkills } from '../../src/core/resolveSkills';
import { ProjectSkillProfile, ProjectSkillState, RequirementClassification, SkillEntry } from '../../src/types';

type RecommendProfileInput = {
  profileDraft?: Partial<ProjectSkillProfile>;
  requirement: string;
  skills?: SkillEntry[];
  userOverrides?: ProjectSkillState[];
};

type RecommendProfileResult = {
  profile: ProjectSkillProfile;
  classification: RequirementClassification;
  warnings: string[];
};

function createProfileId() {
  return `prj-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function recommendProfile(input: RecommendProfileInput): RecommendProfileResult {
  const now = new Date().toISOString();
  const profileDraft = input.profileDraft || {};
  const registry = input.skills || [];
  const requirement = input.requirement || profileDraft.requirement || '';
  const classification = classifyRequirement(requirement);
  const skillStates = resolveSkills({
    skills: registry,
    classification,
    userOverrides: input.userOverrides || profileDraft.skills
  });
  const conflictResult = detectConflicts({ selectedSkills: skillStates, registry });

  const profile: ProjectSkillProfile = {
    id: profileDraft.id || createProfileId(),
    version: profileDraft.version || '0.1.0',
    projectName: profileDraft.projectName || 'Untitled',
    projectPath: profileDraft.projectPath || '',
    description: profileDraft.description,
    repositoryType: profileDraft.repositoryType,
    framework: profileDraft.framework,
    language: profileDraft.language,
    defaultMode: profileDraft.defaultMode || classification.projectType,
    requirement,
    detectedProjectType: classification.projectType,
    targets: profileDraft.targets && profileDraft.targets.length > 0 ? profileDraft.targets : ['codex', 'claude-code'],
    skills: skillStates,
    conflicts: conflictResult.conflicts,
    createdAt: profileDraft.createdAt || now,
    updatedAt: now
  };

  return {
    profile,
    classification,
    warnings: [
      ...conflictResult.warnings,
      ...(registry.length === 0 ? ['No local skills were provided. Scan local skills before generating a skill policy.'] : [])
    ]
  };
}
