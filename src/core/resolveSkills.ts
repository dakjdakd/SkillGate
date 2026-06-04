import { ProjectSkillState, RequirementClassification, SkillEntry } from '../types';

type ResolveSkillsInput = {
  skills: SkillEntry[];
  classification: RequirementClassification;
  userOverrides?: ProjectSkillState[];
};

const manualOnlyByDefault = new Set([
  'imagegen',
  'netlify-deploy',
  'playwright-interactive',
  'skill-creator',
  'skill-installer',
  'plugin-creator',
  'find-skills'
]);

const disabledByDefault = new Set([
  'openai-docs',
  'documents:documents',
  'spreadsheets:Spreadsheets',
  'presentations:Presentations',
  'storage-analyzer'
]);

function baseState(skill: SkillEntry): ProjectSkillState {
  if (manualOnlyByDefault.has(skill.id)) {
    return {
      skillId: skill.id,
      activation: 'manual_only',
      reason: '该 Skill 影响范围较大或属于生成/执行型能力，默认需要用户明确要求。'
    };
  }

  if (disabledByDefault.has(skill.id)) {
    return {
      skillId: skill.id,
      activation: 'disabled',
      reason: '当前项目默认不需要该 Skill，避免误触发无关能力。'
    };
  }

  return {
    skillId: skill.id,
    activation: 'disabled',
    reason: '当前项目暂未匹配到该 Skill 的默认使用场景。'
  };
}

function resolveByProjectType(skill: SkillEntry, projectType: string): ProjectSkillState {
  const state = baseState(skill);

  if (projectType === 'frontend_ecommerce_app') {
    if (['design-taste-frontend', 'baseline-ui', 'browser:control-in-app-browser'].includes(skill.id)) {
      return {
        skillId: skill.id,
        activation: 'enabled',
        reason: '电商前端项目需要页面结构、组件质量和浏览器验证能力。'
      };
    }
    if (['imagegen', 'netlify-deploy', 'playwright-interactive'].includes(skill.id)) {
      return {
        skillId: skill.id,
        activation: 'manual_only',
        reason: '仅在用户明确要求生成图片、部署或深度浏览器调试时启用。'
      };
    }
  }

  if (projectType === 'design_landing_page') {
    if (['design-taste-frontend', 'baseline-ui', 'browser:control-in-app-browser'].includes(skill.id)) {
      return {
        skillId: skill.id,
        activation: 'enabled',
        reason: '设计型前端项目需要视觉方向、组件质量和浏览器检查。'
      };
    }
    if (skill.id === 'imagegen') {
      return {
        skillId: skill.id,
        activation: 'manual_only',
        reason: '仅在用户明确要求生成图片、纹理、banner 或视觉素材时启用。'
      };
    }
  }

  if (projectType === 'frontend_app') {
    if (['baseline-ui', 'browser:control-in-app-browser', 'karpathy-guidelines'].includes(skill.id)) {
      return {
        skillId: skill.id,
        activation: 'enabled',
        reason: '普通前端项目需要基础 UI 质量、浏览器验证和克制的工程执行规则。'
      };
    }
  }

  if (projectType === 'minimal_task') {
    if (skill.id === 'karpathy-guidelines') {
      return {
        skillId: skill.id,
        activation: 'enabled',
        reason: '小改动需要保持范围克制、可验证。'
      };
    }
    if (['baseline-ui', 'browser:control-in-app-browser'].includes(skill.id)) {
      return {
        skillId: skill.id,
        activation: 'manual_only',
        reason: '小改动只有在涉及 UI 或交互验证时才需要。'
      };
    }
    if (['design-taste-frontend', 'imagegen', 'netlify-deploy'].includes(skill.id)) {
      return {
        skillId: skill.id,
        activation: 'disabled',
        reason: '小改动默认不触发设计重构、图片生成或部署能力。'
      };
    }
  }

  if (projectType === 'documentation_task') {
    if (skill.id === 'documents:documents') {
      return {
        skillId: skill.id,
        activation: 'enabled',
        reason: '文档任务需要 Word / Docx 处理能力。'
      };
    }
    if (['design-taste-frontend', 'baseline-ui', 'browser:control-in-app-browser'].includes(skill.id)) {
      return {
        skillId: skill.id,
        activation: 'disabled',
        reason: '文档任务默认不需要前端设计或浏览器验证能力。'
      };
    }
  }

  if (projectType === 'deployment_task' && skill.id === 'netlify-deploy') {
    return {
      skillId: skill.id,
      activation: 'manual_only',
      reason: '部署能力已匹配到需求，但仍需要用户明确确认后执行。'
    };
  }

  return state;
}

export function resolveSkills({ skills, classification, userOverrides = [] }: ResolveSkillsInput): ProjectSkillState[] {
  const overrides = new Map(userOverrides.map(state => [state.skillId, state]));

  return skills.map(skill => {
    const override = overrides.get(skill.id);
    if (override) {
      return {
        ...override,
        reason: override.reason || 'User override'
      };
    }

    return resolveByProjectType(skill, classification.projectType);
  });
}
