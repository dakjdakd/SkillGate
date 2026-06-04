<div align="center">
  <img src="./logo.png" alt="SkillGate logo" width="720" />

  <h1>SkillGate</h1>

  <p>
    Project-level Skill Policy Manager for Codex, Claude Code, and local coding-agent workflows.
  </p>

  <p>
    <strong>我用 SkillGate 为每个项目划定清晰的能力边界：</strong>
    扫描本机真实 Skill，理解项目需求，推荐启用策略，并生成可落地的项目级 Policy 文件。
  </p>

  <p>
    <a href="#核心能力">核心能力</a>
    ·
    <a href="#快速开始">快速开始</a>
    ·
    <a href="#真实本机-skill-扫描">真实扫描</a>
    ·
    <a href="#输出文件">输出文件</a>
    ·
    <a href="#技术架构">技术架构</a>
  </p>
</div>

---

## 项目定位

SkillGate 是一个本地运行的项目级 Skill 管理器。它解决的不是“如何安装更多 Skill”，而是“如何让一个项目只启用真正需要的 Skill”。

当 Codex、Claude Code、插件、MCP、浏览器控制、设计审查、文档处理、图片生成、部署工具越来越多时，项目上下文会变得越来越嘈杂。SkillGate 把这些能力放到一个可视化工作台里，通过扫描、分析、推荐和生成策略文件，让每个项目都有一份明确的 Skill 使用边界。

一句话概括：

```text
给每个项目划定 AI Coding Agent 的能力边界。
```

SkillGate 当前采用 **Soft Policy** 模式：它不直接修改 Codex 或 Claude Code 的底层调度逻辑，而是生成项目级说明文件和结构化 profile，让编码 Agent 在当前项目中遵守明确的能力规则。

## 为什么需要 SkillGate

Skill 变多之后，真正的问题不是“能力不够”，而是“能力太多但缺少边界”。

常见场景包括：

- 同一个任务同时命中多个 Skill，执行策略互相打架。
- 只是修改按钮文案，却触发设计重构、浏览器测试、截图验证等过重流程。
- 文档、表格、演示、部署、图片生成等 Skill 在不相关项目中误触发。
- 不同项目需要不同 Skill 组合，但全局 Skill 配置无法表达项目差异。
- Codex 与 Claude Code 使用的项目说明文件不同，维护起来容易分散。
- 本地到底安装了哪些 Skill、它们来自哪里、是不是假数据，缺少可视化确认入口。

SkillGate 的核心目标是让项目开始前就回答清楚三个问题：

1. 当前项目应该默认启用哪些 Skill？
2. 哪些 Skill 只能在明确需要时手动启用？
3. 哪些 Skill 在这个项目中应该默认禁用？

## 核心能力

### 1. 真实本机 Skill 扫描

SkillGate 会扫描本机真实存在的 `SKILL.md` 文件，而不是展示写死的示例数据。

默认扫描位置包括：

```text
%USERPROFILE%\.codex\skills
%USERPROFILE%\.agents\skills
%USERPROFILE%\.claude\skills
%USERPROFILE%\.codex\plugins\cache
项目目录\.codex\skills
项目目录\.agents\skills
%APPDATA%\Codex\skills
```

扫描结果会展示：

- Skill 名称
- Skill 描述
- 来源类型
- 风险等级
- 推荐启用状态
- 完整 `SKILL.md` 文件路径
- 每个扫描根目录的状态
- 命中的 `SKILL.md` 数量
- 缺失目录的 INFO 提示

如果某个目录不存在，SkillGate 会把它作为正常诊断信息展示，而不是误判为扫描失败。

### 2. 项目需求分析

在 Project Setup 中输入项目需求后，SkillGate 会根据需求文本识别项目类型和能力需求。

示例需求：

```text
我要做一个电商前端页面，需要商品列表、搜索、购物车、结算流程和移动端适配。
```

SkillGate 会分析出：

- 项目类型
- 匹配到的 Skill 分类
- 置信度
- 推荐理由
- 当前项目适合启用、手动启用或禁用的 Skill

### 3. Skill 启用策略

每个 Skill 在项目中只有三种状态：

| 状态 | 含义 | 适用场景 |
| --- | --- | --- |
| `enabled` | 默认启用 | 当前项目高频需要、低风险或核心相关 |
| `manual_only` | 手动启用 | 有价值但成本较高、需要明确触发 |
| `disabled` | 默认禁用 | 当前项目不相关、风险较高或容易误触发 |

这种三段式状态比简单开关更贴近真实工作流：有些 Skill 不应该彻底禁掉，但也不应该自动介入每个任务。

### 4. 冲突检测

SkillGate 会把潜在冲突显式写入 profile 和 policy。

例如前端页面任务中可能同时出现：

```text
design-taste-frontend
baseline-ui
browser:control-in-app-browser
playwright-interactive
```

SkillGate 会把它们拆成更明确的职责：

- 视觉方向和高级审美：设计类 Skill
- 组件可访问性和基础 UI 规范：baseline 类 Skill
- 页面交互验证：浏览器控制类 Skill
- 持续调试和复杂流程测试：Playwright 类 Skill

冲突不再靠运行时猜测，而是在项目级策略中提前说明。

### 5. Policy 预览与写入

SkillGate 会根据项目 profile 生成多份可落地文件，并在写入前提供预览。

支持输出：

```text
AGENTS.md
CLAUDE.md
.skillgate/profile.json
.skillgate/skill-policy.md
.skillgate/session-prompt.md
```

写入前会检查目标文件是否已存在，并展示覆盖风险。用户确认后才会写入。

### 6. 本地 API 后端

SkillGate 不只是一层静态前端壳子。它包含本地 Express API，用于执行真实文件系统扫描、需求推荐、Policy 预览和文件写入。

主要接口：

```text
GET  /api/health
POST /api/skills/scan
POST /api/profile/recommend
POST /api/policy/preview
POST /api/policy/apply
```

后端默认从 `8787` 端口启动。如果端口被旧进程占用，会自动尝试：

```text
8788
8789
8790
```

前端也会自动探测这些端口，并确认后端返回的是当前新版扫描器：

```text
scannerVersion: local-skill-scan-v3
```

这样可以避免浏览器误连旧后端并展示假数据。

## 页面概览

SkillGate 当前包含 6 个主要页面：

| 页面 | 作用 |
| --- | --- |
| Dashboard | 查看项目状态、最近扫描结果、策略概览和快速入口 |
| Project Setup | 输入项目需求，生成项目 Skill Profile 推荐 |
| Skill Registry | 扫描并查看本机真实 Skill，展示路径和扫描根目录诊断 |
| Policy Builder | 调整 Skill 启用策略、冲突规则和项目级行为边界 |
| Output Preview | 预览并写入 `AGENTS.md`、`CLAUDE.md` 和 `.skillgate` 文件 |
| Settings | 管理扫描源、默认目标平台和本地状态 |

## 工作流程

完整使用路径如下：

```text
1. 启动 SkillGate
2. 扫描本机真实 Skill
3. 输入项目需求
4. 生成 Skill 推荐策略
5. 调整 enabled / manual_only / disabled
6. 检查冲突规则
7. 预览项目级 Policy 文件
8. 确认写入目标项目
9. 在 Codex / Claude Code 工作流中使用生成的项目约束
```

## 快速开始

### 环境要求

- Node.js 20 或更高版本
- npm
- Windows、macOS 或 Linux

当前项目在 Windows + PowerShell 环境下重点验证，命令示例使用 `npm.cmd`。

### 安装依赖

```powershell
npm.cmd install
```

### 启动开发环境

```powershell
npm.cmd run dev
```

这条命令会同时启动：

- 本地 API 后端
- Vite 前端开发服务

默认访问地址：

```text
http://localhost:3000
```

如果 `8787` 已经被旧后端占用，控制台会出现类似信息：

```text
Port 8787 is in use. Trying http://localhost:8788...
SkillGate API listening on http://localhost:8788
```

这是正常行为。前端会自动找到新版后端。

### 只启动后端

```powershell
npm.cmd run server
```

### 只启动前端

```powershell
npm.cmd run dev:frontend
```

一般开发时推荐使用 `npm.cmd run dev`，避免只启动前端导致浏览器继续命中旧后端。

### 类型检查

```powershell
npm.cmd run lint
```

### 生产构建

```powershell
npm.cmd run build
```

## 真实本机 Skill 扫描

SkillGate 判断一个 Skill 是否真实存在，核心依据是本机文件系统里的 `SKILL.md`。

典型结构：

```text
C:\Users\<User>\.codex\skills\skill-name\SKILL.md
C:\Users\<User>\.agents\skills\skill-name\SKILL.md
C:\Users\<User>\.codex\plugins\cache\plugin-name\...\skills\skill-name\SKILL.md
```

`SKILL.md` 通常包含：

```markdown
---
name: skill-name
description: When this skill should be used.
---

# Skill instructions

...
```

SkillGate 会读取 frontmatter 和正文，提取：

- `name`
- `description`
- 文件夹路径
- `SKILL.md` 路径
- 分类推断
- 风险推断
- 默认启用建议

### Local-only 原则

当前版本坚持 local-only：

- 不混入内置假 Skill。
- 不展示没有 `sourceFile` 的条目。
- 不从旧缓存恢复历史扫描结果。
- 每次扫描完成后才展示当前机器真实存在的 Skill。
- 旧后端返回的示例数据会被前端拦截。

扫描成功时，界面中应该能看到类似结果：

```text
Detected: 16
Scanner: local-skill-scan-v3
```

并且每个 Skill 都应带有完整 `SKILL.md` 路径。

## 输出文件

SkillGate 生成的文件分为两类：给编码 Agent 阅读的 Markdown，以及给 SkillGate 复用的结构化 JSON。

### AGENTS.md

面向 Codex 或通用 coding-agent 工作流的项目说明文件。

包含：

- 当前项目默认模式
- 允许启用的 Skill
- 需要手动确认的 Skill
- 默认禁用的 Skill
- 冲突处理规则
- 小改动执行规则
- 高风险能力约束

### CLAUDE.md

面向 Claude Code 的项目说明文件。

结构与 `AGENTS.md` 保持一致，但表述更适合 Claude Code 项目上下文读取。

### .skillgate/profile.json

机器可读的项目 Skill Profile。

示例结构：

```json
{
  "version": "1.0.0",
  "projectName": "demo-shop",
  "projectPath": "D:/Projects/demo-shop",
  "defaultMode": "frontend_ecommerce_app",
  "targets": ["codex", "claude-code"],
  "skills": [
    {
      "skillId": "design-taste-frontend",
      "activation": "enabled",
      "reason": "Frontend visual quality is central to this project."
    }
  ],
  "conflicts": []
}
```

### .skillgate/skill-policy.md

完整的人类可读策略说明，适合放入项目仓库长期维护。

### .skillgate/session-prompt.md

可复制到新会话中的项目级启动提示，用于快速恢复同一套 Skill 边界。

## API 说明

### GET /api/health

用于确认当前后端版本和扫描器能力。

示例响应：

```json
{
  "ok": true,
  "name": "skillgate-api",
  "version": "0.1.0",
  "scannerMode": "local-only",
  "scannerVersion": "local-skill-scan-v3",
  "time": "2026-06-04T10:00:00.000Z"
}
```

### POST /api/skills/scan

扫描本机真实 Skill。

请求示例：

```json
{
  "roots": [],
  "projectPath": "D:/Projects/demo-shop"
}
```

响应包含：

- `skills`
- `warnings`
- `notices`
- `scannedRoots`
- `rootReports`
- `scannerMode`
- `scannerVersion`

### POST /api/profile/recommend

根据项目需求和扫描到的 Skill 生成推荐 profile。

### POST /api/policy/preview

根据 profile 生成待写入文件预览。

### POST /api/policy/apply

在确认目标路径后，将策略文件写入项目目录。

## 技术架构

SkillGate 使用前后端分离但本地一体化的结构。

```text
SkillGate
├─ React + Vite 前端
│  ├─ Dashboard
│  ├─ Project Setup
│  ├─ Skill Registry
│  ├─ Policy Builder
│  ├─ Output Preview
│  └─ Settings
│
├─ Express 本地 API
│  ├─ /api/health
│  ├─ /api/skills/scan
│  ├─ /api/profile/recommend
│  └─ /api/policy/*
│
├─ Core 业务逻辑
│  ├─ 需求分类
│  ├─ Skill 推荐
│  ├─ 冲突检测
│  └─ Policy 生成
│
└─ 本地文件系统
   ├─ ~/.codex/skills
   ├─ ~/.agents/skills
   ├─ ~/.claude/skills
   ├─ ~/.codex/plugins/cache
   └─ 项目目录/.skillgate
```

## 项目结构

```text
.
├─ logo.png
├─ README.md
├─ TASKS.md
├─ package.json
├─ vite.config.ts
├─ scripts/
│  └─ dev.mjs
├─ server/
│  ├─ index.ts
│  ├─ routes/
│  │  ├─ policy.ts
│  │  ├─ profile.ts
│  │  └─ skills.ts
│  └─ services/
│     ├─ policyFiles.ts
│     ├─ profileRecommender.ts
│     └─ skillScanner.ts
├─ src/
│  ├─ api/
│  │  └─ client.ts
│  ├─ core/
│  │  ├─ classifyRequirement.ts
│  │  ├─ detectConflicts.ts
│  │  ├─ generatePolicy.ts
│  │  └─ resolveSkills.ts
│  ├─ pages/
│  │  ├─ Dashboard.tsx
│  │  ├─ OutputPreview.tsx
│  │  ├─ PolicyBuilder.tsx
│  │  ├─ ProjectSetup.tsx
│  │  ├─ Settings.tsx
│  │  └─ SkillRegistry.tsx
│  ├─ App.tsx
│  ├─ store.ts
│  └─ types.ts
└─ dist/
```

## 设计原则

### 项目级优先

Skill 策略不应该全局固定。同一个开发者在不同项目中会需要完全不同的能力组合。SkillGate 以项目为单位保存策略。

### 真实来源优先

Skill Registry 只展示本机真实扫描到的 Skill。没有 `SKILL.md` 路径的条目不会进入当前 registry。

### 人可读，也可机器读取

`AGENTS.md`、`CLAUDE.md` 和 `skill-policy.md` 适合人类阅读和长期维护；`profile.json` 适合后续继续编辑和自动化处理。

### 软约束优先

当前版本不强行拦截 Agent 底层行为，而是通过项目说明文件建立明确规则。这种方式更稳、更透明，也更容易跨工具使用。

### 小改动保持轻量

SkillGate 会在策略中强调：小范围文本、样式或单点修复不应触发过重 Skill 流程。复杂能力应该服务于复杂任务，而不是制造额外成本。

## 常见问题

### 为什么扫描结果是 0？

常见原因：

- 本机没有安装任何包含 `SKILL.md` 的 Skill。
- Skill 放在未配置的目录中。
- 只启动了旧前端或旧后端。
- 浏览器缓存仍指向旧 API。

推荐启动方式：

```powershell
npm.cmd run dev
```

然后刷新页面，重新点击 `Scan Local Skills`。

### 为什么 `.claude\skills` 显示 missing？

这是正常诊断信息。SkillGate 会扫描多个常见候选目录，某些目录在当前机器上不存在时会显示为 missing。只要其他目录能扫描到 `SKILL.md`，就不影响使用。

### 为什么不保留内置示例 Skill？

SkillGate 的目标是管理当前机器真实可用的 Skill。示例数据容易让用户误以为某些能力已经安装，因此当前版本移除了内置假数据。

### 端口 8787 被占用怎么办？

后端会自动尝试 8788、8789、8790。前端也会自动探测这些端口，并确认后端返回 `local-skill-scan-v3`。

### 会不会直接修改 Codex 或 Claude Code 的底层配置？

当前版本不会。SkillGate 只生成项目级策略文件，并在用户确认后写入目标项目目录。

## 开发命令

| 命令 | 作用 |
| --- | --- |
| `npm.cmd install` | 安装依赖 |
| `npm.cmd run dev` | 同时启动本地 API 和前端 |
| `npm.cmd run dev:frontend` | 只启动 Vite 前端 |
| `npm.cmd run server` | 只启动 Express API |
| `npm.cmd run lint` | TypeScript 类型检查 |
| `npm.cmd run build` | 生产构建 |
| `npm.cmd run preview` | 预览构建产物 |

## 当前状态

SkillGate 已完成第一版核心链路：

- 本机真实 Skill 扫描
- 扫描根目录诊断
- 旧后端假数据拦截
- 项目需求分类
- Skill 推荐
- 冲突检测
- Policy 预览
- 确认写入
- 前后端一键开发启动
- 多端口后端发现

当前验证通过：

```text
npm.cmd run lint
npm.cmd run build
node --check scripts\dev.mjs
```

## Roadmap

- 更精细的 Skill 分类规则
- Profile 导入与导出
- 多项目 Profile 管理
- Skill 变更差异对比
- 更丰富的冲突规则编辑器
- 针对 Codex / Claude Code 的模板进一步细分
- 可选的命令行版本
- 更完整的跨平台路径扫描策略

## License

当前仓库未声明开源许可证。使用、分发或二次开发前应先补充明确的 License 文件。
