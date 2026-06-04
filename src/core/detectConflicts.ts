import { ProjectSkillState, SkillConflictRule, SkillEntry } from '../types';

type DetectConflictsInput = {
  selectedSkills: ProjectSkillState[];
  registry: SkillEntry[];
};

type DetectConflictsResult = {
  conflicts: SkillConflictRule[];
  warnings: string[];
};

export function detectConflicts({ selectedSkills, registry }: DetectConflictsInput): DetectConflictsResult {
  const conflicts: SkillConflictRule[] = [];
  const warnings: string[] = [];
  const stateById = new Map(selectedSkills.map(skill => [skill.skillId, skill.activation]));
  const registryById = new Map(registry.map(skill => [skill.id, skill]));

  const isEnabled = (id: string) => stateById.get(id) === 'enabled';
  const isManualOnly = (id: string) => stateById.get(id) === 'manual_only';

  if (isEnabled('design-taste-frontend') && isEnabled('baseline-ui')) {
    conflicts.push({
      id: 'design-taste-frontend-vs-baseline-ui',
      skills: ['design-taste-frontend', 'baseline-ui'],
      resolution: 'split_responsibility',
      responsibilities: {
        'design-taste-frontend': '负责视觉方向、页面结构、产品体验和整体设计判断。',
        'baseline-ui': '负责组件质量、可访问性、响应式布局、交互状态和实现稳定性。'
      },
      reason: '两者都可能参与前端任务，因此需要明确职责边界，避免重复驱动同一层决策。'
    });
  }

  if (isEnabled('imagegen') || isManualOnly('imagegen')) {
    conflicts.push({
      id: 'imagegen-manual-boundary',
      skills: ['imagegen'],
      resolution: 'manual',
      reason: '图片生成属于生成型能力，只应在用户明确要求生成 bitmap 素材时启用。'
    });
  }

  selectedSkills.forEach(skillState => {
    const skill = registryById.get(skillState.skillId);
    if (skill?.risk === 'high' && skillState.activation === 'enabled') {
      warnings.push(`${skill.id} 是高风险 Skill，建议保持 manual_only，除非当前项目确实需要默认启用。`);
    }
  });

  return { conflicts, warnings };
}
