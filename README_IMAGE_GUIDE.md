# README Image Guide / README 配图建议

| 位置 | 推荐文件名 | 图片类型 | 内容说明 | 尺寸建议 | 是否必需 | 没有图片时的占位方式 |
| --- | --- | --- | --- | --- | --- | --- |
| Logo / Icon | `assets/readme-logo.png` | 品牌 Logo | 顶部 Hero 使用的 SkillGate 标识。应保持透明背景或纯净浅色背景，能在 GitHub 白底上清晰显示。当前仓库已有该文件，可继续优化清晰度和留白。 | 宽 1000-1400px，透明 PNG 或 WebP | 必需 | `[Project Logo]` |
| Hero Banner 或 Hero Demo | `assets/readme-hero-demo.png` | 产品主视觉 / 工作流截图 | 展示 Dashboard、Skill Registry、Policy Builder 和 Output Preview 的组合工作流，重点露出“扫描真实 Skill → 调整策略 → 预览输出”的主链路。 | 1600x900 或 1920x1080 | 推荐必需 | `[Hero Demo Image: show the main SkillGate workflow here]` |
| 主功能截图 | `assets/readme-skill-registry.png` | 界面截图 | 展示 Skill Registry 的真实扫描结果，包含 Skill 名称、来源路径、风险等级、扫描根目录状态和 `scannerVersion: local-skill-scan-v3`。 | 1600x1000 | 必需 | `[Screenshot: local Skill scan result with source paths]` |
| 核心流程图 | `assets/readme-workflow.png` | 流程图 | 用简洁图形展示 `SKILL.md` 扫描、需求分类、Profile 推荐、Policy Builder、Output Preview、文件写入之间的数据流。README 正文已有 Mermaid，可在需要更强视觉时替换为图片。 | 1400x800 | 可选 | 使用 README 中的 Mermaid 图 |
| 使用场景图或结果图 | `assets/readme-policy-output.png` | 输出结果截图 | 展示生成后的 `AGENTS.md`、`CLAUDE.md`、`.skillgate/profile.json`、`.skillgate/skill-policy.md` 文件列表和预览内容，强调输出可落地。 | 1600x1000 | 推荐 | `[Screenshot: generated policy files preview]` |
| 配置界面或配置示例图 | `assets/readme-settings.png` | 设置页截图 | 展示 Settings 页面中的扫描源、默认目标平台或本地状态配置，让用户知道哪些配置可以在界面中管理。 | 1400x900 | 可选 | `[Screenshot: settings and scan source configuration]` |
| 架构图 | `assets/readme-architecture.png` | 架构图 | 展示 React/Vite 前端、Express API、`src/core` 推荐逻辑、文件系统扫描和策略输出之间的关系。适合放在“技术架构”章节。 | 1400x900 | 可选 | 使用 README 中的目录树 |
| 可选 GIF / 动图 | `assets/readme-scan-to-policy.gif` | 8-12 秒 GIF | 录制从点击扫描、输入项目需求、生成推荐、切换到 Output Preview 的完整路径。节奏要快，避免展示敏感本地路径。 | 1280x720，建议小于 8MB | 可选 | `[GIF: scan local skills and generate policy]` |
| 社区、赞助或生态相关图片 | `assets/readme-ecosystem.png` | 生态示意图 | 如果后续出现插件市场、社区 Skill 列表、赞助入口或生态伙伴，可展示 SkillGate 与 Codex、Claude Code、local Skills、插件缓存之间的生态关系。当前阶段不必添加。 | 1400x800 | 暂不必需 | `[Ecosystem image: optional when community links exist]` |

