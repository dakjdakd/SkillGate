import { RequirementClassification } from '../types';

type Rule = {
  projectType: string;
  keywords: string[];
  categories: string[];
  reasons: string[];
  confidence: number;
};

const rules: Rule[] = [
  {
    projectType: 'frontend_ecommerce_app',
    keywords: ['淘宝', '电商', '商品', '购物车', '结算', '订单', '价格', '分类', '店铺', '支付', 'ecommerce', 'cart', 'checkout', 'product'],
    categories: ['frontend_design', 'frontend_quality', 'browser_testing'],
    confidence: 0.86,
    reasons: ['需求包含电商或商品交易关键词。', '该项目需要页面结构、组件质量和浏览器验证。']
  },
  {
    projectType: 'design_landing_page',
    keywords: ['落地页', '品牌页', '作品集', '视觉', '动效', '官网', '高级感', '设计', '重构', 'landing', 'portfolio', 'brand'],
    categories: ['frontend_design', 'frontend_quality', 'browser_testing'],
    confidence: 0.78,
    reasons: ['需求偏向视觉设计或品牌页面。', '该项目需要设计判断和浏览器布局验证。']
  },
  {
    projectType: 'documentation_task',
    keywords: ['文档', '报告', 'word', 'docx', '说明书', '合同', 'redline', 'document'],
    categories: ['document_editing'],
    confidence: 0.82,
    reasons: ['需求包含文档生成或编辑关键词。']
  },
  {
    projectType: 'deployment_task',
    keywords: ['部署', '发布', '上线', 'netlify', 'host', 'deploy', 'publish'],
    categories: ['deployment'],
    confidence: 0.74,
    reasons: ['需求包含部署或发布关键词。']
  },
  {
    projectType: 'minimal_task',
    keywords: ['bug', '修复', '小改', '文案', '按钮', '颜色', '简单', '不要大改', 'copy', 'minor'],
    categories: ['generic_coding'],
    confidence: 0.7,
    reasons: ['需求描述为小范围修改，应避免触发重型 Skill。']
  },
  {
    projectType: 'frontend_app',
    keywords: ['网页', '网站', '页面', '前端', 'react', 'vue', 'tailwind', 'ui', '组件', '布局', '响应式', 'frontend'],
    categories: ['frontend_quality', 'browser_testing'],
    confidence: 0.68,
    reasons: ['需求包含前端页面或 UI 关键词。']
  }
];

export function classifyRequirement(text: string): RequirementClassification {
  const normalized = text.trim().toLowerCase();
  if (!normalized) {
    return {
      projectType: 'manual_profile',
      matchedCategories: [],
      confidence: 0,
      reasons: ['未提供需求文本，允许用户手动维护 Skill 状态。']
    };
  }

  const matched = rules
    .map(rule => ({
      rule,
      hits: rule.keywords.filter(keyword => normalized.includes(keyword.toLowerCase()))
    }))
    .filter(match => match.hits.length > 0)
    .sort((a, b) => b.hits.length - a.hits.length || b.rule.confidence - a.rule.confidence);

  if (matched.length === 0) {
    return {
      projectType: 'generic_project',
      matchedCategories: ['generic_coding'],
      confidence: 0.35,
      reasons: ['未匹配到明确项目类型，使用通用工程策略。']
    };
  }

  const primary = matched[0].rule;
  const categorySet = new Set<string>();
  const reasons = new Set<string>();

  matched.forEach(match => {
    match.rule.categories.forEach(category => categorySet.add(category));
    match.rule.reasons.forEach(reason => reasons.add(reason));
    reasons.add(`匹配关键词：${match.hits.join('、')}`);
  });

  return {
    projectType: primary.projectType,
    matchedCategories: Array.from(categorySet),
    confidence: Math.min(0.95, primary.confidence + Math.max(0, matched[0].hits.length - 1) * 0.03),
    reasons: Array.from(reasons)
  };
}
