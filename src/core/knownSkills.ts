import { SkillEntry } from '../types';

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
    description: '用于较复杂的 Playwright 浏览器交互调试和 UI 验证。',
    sourcePath: '~/.agents/skills/playwright-interactive'
  },
  {
    id: 'imagegen',
    name: 'imagegen',
    platform: 'generic',
    category: 'image_generation',
    risk: 'medium',
    defaultActivation: 'manual_candidate',
    description: '用于生成位图图片、商品图、banner、插图和视觉素材。',
    sourcePath: '~/.codex/skills/imagegen'
  },
  {
    id: 'netlify-deploy',
    name: 'netlify-deploy',
    platform: 'generic',
    category: 'deployment',
    risk: 'high',
    defaultActivation: 'manual_candidate',
    description: '只在用户明确要求部署或发布网站时使用。',
    sourcePath: '~/.codex/skills/netlify-deploy'
  },
  {
    id: 'openai-docs',
    name: 'openai-docs',
    platform: 'generic',
    category: 'openai_docs',
    risk: 'low',
    defaultActivation: 'disabled_candidate',
    description: '用于查询和引用 OpenAI 官方文档。',
    sourcePath: '~/.codex/skills/openai-docs'
  },
  {
    id: 'documents:documents',
    name: 'documents:documents',
    platform: 'generic',
    category: 'document_editing',
    risk: 'medium',
    defaultActivation: 'disabled_candidate',
    description: '用于创建或编辑 Word / Docx 文档。',
    sourcePath: '~/.codex/plugins/documents'
  },
  {
    id: 'spreadsheets:Spreadsheets',
    name: 'spreadsheets:Spreadsheets',
    platform: 'generic',
    category: 'spreadsheet_analysis',
    risk: 'medium',
    defaultActivation: 'disabled_candidate',
    description: '用于创建、编辑或分析 Excel / CSV 表格。',
    sourcePath: '~/.codex/plugins/spreadsheets'
  },
  {
    id: 'presentations:Presentations',
    name: 'presentations:Presentations',
    platform: 'generic',
    category: 'presentation_building',
    risk: 'medium',
    defaultActivation: 'disabled_candidate',
    description: '用于创建 PPT / 幻灯片。',
    sourcePath: '~/.codex/plugins/presentations'
  },
  {
    id: 'storage-analyzer',
    name: 'storage-analyzer',
    platform: 'generic',
    category: 'storage_analysis',
    risk: 'high',
    defaultActivation: 'disabled_candidate',
    description: '用于分析本地存储空间和文件占用。',
    sourcePath: '~/.codex/skills/storage-analyzer'
  },
  {
    id: 'karpathy-guidelines',
    name: 'karpathy-guidelines',
    platform: 'generic',
    category: 'generic_coding',
    risk: 'low',
    defaultActivation: 'auto_candidate',
    description: '用于保持代码改动克制、清晰和可验证。',
    sourcePath: '~/.agents/skills/karpathy-guidelines'
  },
  {
    id: 'skill-creator',
    name: 'skill-creator',
    platform: 'generic',
    category: 'automation',
    risk: 'medium',
    defaultActivation: 'manual_candidate',
    description: '用于创建或更新 Codex Skill。',
    sourcePath: '~/.codex/skills/skill-creator'
  },
  {
    id: 'skill-installer',
    name: 'skill-installer',
    platform: 'generic',
    category: 'automation',
    risk: 'medium',
    defaultActivation: 'manual_candidate',
    description: '用于安装 curated skill 或 GitHub skill。',
    sourcePath: '~/.codex/skills/skill-installer'
  },
  {
    id: 'plugin-creator',
    name: 'plugin-creator',
    platform: 'generic',
    category: 'automation',
    risk: 'medium',
    defaultActivation: 'manual_candidate',
    description: '用于创建 Codex 插件目录和 manifest。',
    sourcePath: '~/.codex/skills/plugin-creator'
  },
  {
    id: 'find-skills',
    name: 'find-skills',
    platform: 'generic',
    category: 'automation',
    risk: 'low',
    defaultActivation: 'manual_candidate',
    description: '用于查找适合某个工作流的可安装 Skill。',
    sourcePath: '~/.agents/skills/find-skills'
  }
];
