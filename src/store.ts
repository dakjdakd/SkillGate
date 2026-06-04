import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GlobalSettings, ProjectSkillProfile, ProjectSkillState, SkillConflictRule, SkillEntry } from './types';

export const knownSkills: SkillEntry[] = [
  {
    id: 'design-taste-frontend',
    name: 'design-taste-frontend',
    platform: 'generic',
    category: 'frontend_design',
    risk: 'medium',
    defaultActivation: 'auto_candidate',
    description: '用于前端页面、落地页、品牌页、作品集、视觉方向和设计质量控制。',
    sourcePath: '~/.agents/skills/design-taste-frontend'
  },
  {
    id: 'baseline-ui',
    name: 'baseline-ui',
    platform: 'generic',
    category: 'frontend_quality',
    risk: 'low',
    defaultActivation: 'auto_candidate',
    description: '用于组件质量、可访问性、响应式布局和 Tailwind UI 稳定性检查。',
    sourcePath: '~/.agents/skills/baseline-ui'
  },
  {
    id: 'browser:control-in-app-browser',
    name: 'browser:control-in-app-browser',
    platform: 'generic',
    category: 'browser_testing',
    risk: 'low',
    defaultActivation: 'auto_candidate',
    description: '用于打开本地页面、检查布局、截图和验证交互。',
    sourcePath: '~/.codex/skills/browser'
  },
  {
    id: 'playwright-interactive',
    name: 'playwright-interactive',
    platform: 'generic',
    category: 'browser_testing',
    risk: 'medium',
    defaultActivation: 'manual_candidate',
    description: '用于较复杂的 Playwright 浏览器交互调试和 UI 验证。'
  },
  {
    id: 'imagegen',
    name: 'imagegen',
    platform: 'generic',
    category: 'image_generation',
    risk: 'medium',
    defaultActivation: 'manual_candidate',
    description: '用于生成位图图片、商品图、banner、插图和视觉素材。',
    sourcePath: '~/.agents/skills/imagegen'
  },
  {
    id: 'netlify-deploy',
    name: 'netlify-deploy',
    platform: 'generic',
    category: 'deployment',
    risk: 'high',
    defaultActivation: 'manual_candidate',
    description: '只在用户明确要求部署或发布网站时使用。'
  },
  {
    id: 'openai-docs',
    name: 'openai-docs',
    platform: 'generic',
    category: 'openai_docs',
    risk: 'low',
    defaultActivation: 'disabled_candidate',
    description: '用于查询和引用 OpenAI 官方文档。'
  },
  {
    id: 'documents:documents',
    name: 'documents:documents',
    platform: 'generic',
    category: 'document_editing',
    risk: 'medium',
    defaultActivation: 'disabled_candidate',
    description: '用于创建或编辑 Word / Docx 文档。'
  },
  {
    id: 'spreadsheets:Spreadsheets',
    name: 'spreadsheets:Spreadsheets',
    platform: 'generic',
    category: 'spreadsheet_analysis',
    risk: 'medium',
    defaultActivation: 'disabled_candidate',
    description: '用于创建或编辑 Excel / CSV 表格。'
  },
  {
    id: 'presentations:Presentations',
    name: 'presentations:Presentations',
    platform: 'generic',
    category: 'presentation_building',
    risk: 'medium',
    defaultActivation: 'disabled_candidate',
    description: '用于创建 PPT / 幻灯片。'
  },
  {
    id: 'storage-analyzer',
    name: 'storage-analyzer',
    platform: 'generic',
    category: 'storage_analysis',
    risk: 'high',
    defaultActivation: 'disabled_candidate',
    description: '用于分析本地存储空间和文件占用。'
  },
  {
    id: 'karpathy-guidelines',
    name: 'karpathy-guidelines',
    platform: 'generic',
    category: 'generic_coding',
    risk: 'low',
    defaultActivation: 'auto_candidate',
    description: '用于保持代码改动克制、清晰和可验证。'
  }
];

const LOCAL_STORAGE_KEY = 'skillgate-v1-storage';

interface SkillGateState {
  profile: ProjectSkillProfile | null;
  recentProfiles: ProjectSkillProfile[];
  settings: GlobalSettings;
  lastScanTime: string | null;
  setProfile: (profile: ProjectSkillProfile) => void;
  deleteProfile: (id: string) => void;
  loadProfile: (id: string) => void;
  updateSkillState: (skillId: string, updates: Partial<ProjectSkillState>) => void;
  analyzeRequirement: (requirement: string) => void;
  updateSettings: (settings: Partial<GlobalSettings>) => void;
  resetAll: () => void;
  setLastScanTime: (time: string) => void;
}

const defaultSettings: GlobalSettings = {
  skillSources: '~/.codex/skills\n~/.agents/skills\n~/.claude/skills\nproject/.codex/skills\nproject/.agents/skills',
  defaultTargets: ['codex', 'claude-code'],
  outputPrefs: ['agents', 'claude', 'profile', 'policy', 'prompt'],
  isCRT: false,
  hasBooted: false
};

function generateDynamicConflicts(skills: ProjectSkillState[]): SkillConflictRule[] {
  const conflicts: SkillConflictRule[] = [];
  const isEnabled = (id: string) => skills.find(s => s.skillId === id)?.activation === 'enabled';

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

  return conflicts;
}

function classifyRequirement(requirement: string) {
  const text = requirement.toLowerCase();

  if (text.includes('淘宝') || text.includes('电商') || text.includes('商品') || text.includes('购物车') || text.includes('结算') || text.includes('order')) {
    return 'frontend_ecommerce_app';
  }

  if (text.includes('落地页') || text.includes('品牌') || text.includes('官网') || text.includes('视觉') || text.includes('设计') || text.includes('landing')) {
    return 'design_landing_page';
  }

  if (text.includes('部署') || text.includes('上线') || text.includes('netlify') || text.includes('deploy') || text.includes('publish')) {
    return 'deployment_task';
  }

  if (text.includes('文档') || text.includes('报告') || text.includes('word') || text.includes('docx')) {
    return 'documentation_task';
  }

  if (text.includes('bug') || text.includes('修复') || text.includes('小改') || text.includes('文案')) {
    return 'minimal_task';
  }

  return 'frontend';
}

function resolveSkillState(skill: SkillEntry, detectedType: string): ProjectSkillState {
  let activation: ProjectSkillState['activation'] = 'disabled';
  let reason = '当前项目暂未匹配到该 Skill 的默认使用场景。';

  if (['netlify-deploy', 'imagegen', 'playwright-interactive'].includes(skill.id)) {
    activation = 'manual_only';
    reason = '该 Skill 影响范围较大或属于生成/执行型能力，默认需要用户明确要求。';
  }

  if (['storage-analyzer'].includes(skill.id)) {
    activation = 'disabled';
    reason = '该 Skill 会扫描本机存储，当前项目默认不需要。';
  }

  if (detectedType === 'frontend_ecommerce_app') {
    if (['design-taste-frontend', 'baseline-ui', 'browser:control-in-app-browser'].includes(skill.id)) {
      activation = 'enabled';
      reason = '电商前端项目需要页面结构、组件质量和浏览器验证能力。';
    }
    if (['imagegen', 'netlify-deploy', 'playwright-interactive'].includes(skill.id)) {
      activation = 'manual_only';
      reason = '仅在用户明确要求生成图片、部署或深度浏览器调试时启用。';
    }
  }

  if (detectedType === 'design_landing_page') {
    if (['design-taste-frontend', 'baseline-ui', 'browser:control-in-app-browser'].includes(skill.id)) {
      activation = 'enabled';
      reason = '设计型前端项目需要视觉方向、组件质量和浏览器检查。';
    }
  }

  if (detectedType === 'deployment_task' && skill.id === 'netlify-deploy') {
    activation = 'manual_only';
    reason = '部署能力已匹配到需求，但仍需要用户明确确认后执行。';
  }

  if (detectedType === 'documentation_task') {
    if (skill.id === 'documents:documents') {
      activation = 'enabled';
      reason = '文档任务需要 Word / Docx 处理能力。';
    }
    if (['design-taste-frontend', 'baseline-ui', 'browser:control-in-app-browser'].includes(skill.id)) {
      activation = 'disabled';
      reason = '文档任务默认不需要前端设计或浏览器验证能力。';
    }
  }

  if (detectedType === 'minimal_task') {
    if (skill.id === 'karpathy-guidelines') {
      activation = 'enabled';
      reason = '小改动需要保持范围克制、可验证。';
    }
    if (['baseline-ui', 'browser:control-in-app-browser'].includes(skill.id)) {
      activation = 'manual_only';
      reason = '小改动只有在涉及 UI 或交互验证时才需要。';
    }
    if (['design-taste-frontend', 'imagegen', 'netlify-deploy'].includes(skill.id)) {
      activation = 'disabled';
      reason = '小改动默认不触发设计重构、图片生成或部署能力。';
    }
  }

  if (detectedType === 'frontend' && ['baseline-ui', 'browser:control-in-app-browser', 'karpathy-guidelines'].includes(skill.id)) {
    activation = 'enabled';
    reason = '普通前端项目需要基础 UI 质量、浏览器验证和克制的工程执行规则。';
  }

  return {
    skillId: skill.id,
    activation,
    reason
  };
}

export const useStore = create<SkillGateState>()(
  persist(
    (set) => ({
      profile: null,
      recentProfiles: [],
      settings: defaultSettings,
      lastScanTime: null,

      setProfile: (profile) => set((state) => {
        const existingIdx = state.recentProfiles.findIndex(p => p.id === profile.id);
        let newRecents = [...state.recentProfiles];
        if (existingIdx >= 0) {
          newRecents[existingIdx] = profile;
        } else {
          newRecents = [profile, ...newRecents].slice(0, 50);
        }
        return { profile, recentProfiles: newRecents };
      }),

      deleteProfile: (id) => set((state) => ({
        recentProfiles: state.recentProfiles.filter(p => p.id !== id),
        profile: state.profile?.id === id ? null : state.profile
      })),

      loadProfile: (id) => set((state) => ({
        profile: state.recentProfiles.find(p => p.id === id) || null
      })),

      updateSkillState: (skillId, updates) => set((state) => {
        if (!state.profile) return state;

        const newSkills = state.profile.skills.map(skill =>
          skill.skillId === skillId ? { ...skill, ...updates } : skill
        );

        const updatedProfile = {
          ...state.profile,
          skills: newSkills,
          conflicts: generateDynamicConflicts(newSkills),
          updatedAt: new Date().toISOString()
        };

        return {
          profile: updatedProfile,
          recentProfiles: state.recentProfiles.map(p => p.id === updatedProfile.id ? updatedProfile : p)
        };
      }),

      analyzeRequirement: (requirement: string) => set((state) => {
        if (!state.profile) return state;

        const detectedType = classifyRequirement(requirement);
        const newSkills = knownSkills.map(skill => resolveSkillState(skill, detectedType));
        const updatedProfile = {
          ...state.profile,
          requirement,
          detectedProjectType: detectedType,
          skills: newSkills,
          conflicts: generateDynamicConflicts(newSkills),
          updatedAt: new Date().toISOString()
        };

        return {
          profile: updatedProfile,
          recentProfiles: state.recentProfiles.map(p => p.id === updatedProfile.id ? updatedProfile : p)
        };
      }),

      updateSettings: (updates) => set((state) => ({
        settings: { ...state.settings, ...updates }
      })),

      resetAll: () => set({
        profile: null,
        recentProfiles: [],
        settings: defaultSettings,
        lastScanTime: null
      }),

      setLastScanTime: (time) => set({ lastScanTime: time })
    }),
    {
      name: LOCAL_STORAGE_KEY,
    }
  )
);
