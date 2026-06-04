# 2026-06-04 追加任务：真实本机 Skill 扫描

- [x] 8. 真实本机 Skill 扫描
  - [x] 8.1 服务端自动追加本机常见 Skill 根目录，不再只依赖 Settings 中手动配置的路径。
  - [x] 8.2 扫描 Codex/Agents/Claude 用户目录与 Codex 插件缓存目录，提升本机真实 Skill 覆盖率。
  - [x] 8.3 为本地扫描结果返回完整 `SKILL.md` 文件路径。
  - [x] 8.4 Skill Registry 头部展示 Local / Merged / Builtin 数量，并在详情面板展示完整 `SKILL.md` 文件路径。
  - [x] 8.5 提高本地递归扫描深度，覆盖 Codex 插件缓存中的深层 `SKILL.md` 文件。

## 追加验证记录

- `npm.cmd run lint`：通过。
- `npm.cmd run build`：通过。
- 本地扫描函数验证：通过，返回 24 个 Skill 条目，其中 `merged: 9`、`local: 8`、`builtin: 7`，并返回真实 `SKILL.md` 文件路径。

## 追加相关文件

- `server/services/skillScanner.ts`：自动发现本机常见 Skill 根目录，扫描插件缓存，并返回本地 `SKILL.md` 文件路径。
- `src/types.ts`：为 Skill 条目补充 `sourceFile` 字段。
- `src/pages/SkillRegistry.tsx`：展示 Local / Merged / Builtin 来源计数，并在详情中显示完整 `SKILL.md` 文件路径。
- `TASKS.md`：记录本次真实本机 Skill 扫描修复任务、验证项与相关文件。

# 2026-06-04 追加任务：彻底改为真实本机 Skill 扫描

- [x] 9. 真实本机 Skill 扫描 Local-Only 化
  - [x] 9.1 删除内置 `knownSkills` 假数据文件，扫描结果不再混入示例 Skill。
  - [x] 9.2 服务端扫描 API 只返回真实解析到的本地 `SKILL.md` 文件。
  - [x] 9.3 前端扫描结果增加客户端过滤，旧后端返回的非本地条目也不会展示。
  - [x] 9.4 Registry 初始为空，刷新后必须重新扫描才显示 Skill。
  - [x] 9.5 清除旧浏览器持久化扫描缓存，避免继续显示历史 `Detected: 17`。
  - [x] 9.6 Project Setup 必须先扫描到真实本地 Skill，才允许生成推荐策略。
  - [x] 9.7 排除 Codex 插件缓存中的 `plugin-backup-*` 备份目录。

## 追加验证记录

- `npm.cmd run lint`：通过。
- `npm.cmd run build`：通过。
- 本地扫描函数验证：通过，`scannerMode: local-only`，`scannerVersion: local-skill-scan-v2`，返回 16 个真实本地 `SKILL.md` 文件，`warnings: []`。

## 追加相关文件

- `server/services/skillScanner.ts`：移除内置数据合并，只扫描本机真实 `SKILL.md`，并排除插件备份目录。
- `server/routes/skills.ts`：移除 `includeBuiltIn` 扫描参数。
- `src/api/client.ts`：对扫描结果做本地真实性过滤，并把旧后端的缺失目录 ENOENT 从 WARN 转为 INFO。
- `src/core/knownSkills.ts`：删除内置假 Skill Registry 数据文件。
- `src/pages/SkillRegistry.tsx`：Registry 默认空列表，只展示真实本地 Skill，并显示扫描器版本与 `SKILL.md` 路径。
- `src/pages/Dashboard.tsx`：Dashboard 扫描入口改为 local-only 扫描。
- `src/pages/ProjectSetup.tsx`：没有真实扫描结果时禁止生成推荐。
- `src/pages/PolicyBuilder.tsx`：策略页只从真实扫描结果读取 Skill 详情。
- `src/store.ts`：不再持久化扫描结果，并在加载旧缓存时强制清空旧扫描数据。
- `src/types.ts`：收窄 Skill 来源类型，并补充扫描器模式/版本字段。
- `TASKS.md`：记录本次 local-only 扫描修复、验证结果和相关文件。

# SkillGate Implementation Tasks

## 执行规则

- 不需要每个子任务都向用户确认，可以连续执行代码直到全部完成。
- 每完成一个子任务，立刻将对应清单从 `[ ]` 修改为 `[x]`。
- 若父任务下属全部子任务均完成，同步将父任务标记为 `[x]`。
- 出现新增工作项时，补充到本清单。
- 每次新建或改动文件，都同步维护「相关文件」栏目。
- 每完成一个大章节，运行必要验证，提交代码，并推送到 GitHub 远端 `main` 分支。
- commit message 使用一句简短中文。
- 如果推送因认证、远端、网络或权限失败，保留本地 commit，并记录失败原因。

## 当前进度

- 当前章节：完成
- 当前子任务：无。

## 任务清单

- [x] 1. 任务清单初始化
  - [x] 1.1 创建 `TASKS.md`，写入执行规则、章节任务、当前进度、相关文件栏目。

- [x] 2. 修复基础可运行性
  - [x] 2.1 安装或恢复依赖，确认 `npm.cmd run lint` 能实际执行。
  - [x] 2.2 修复当前 TypeScript/JSX 字符串、乱码和编译错误。
  - [x] 2.3 跑通 `npm.cmd run lint` 和 `npm.cmd run build`。

- [x] 3. Core 业务逻辑层
  - [x] 3.1 新增 Skill Registry 数据模块并替换 `store.ts` 内硬编码 knownSkills。
  - [x] 3.2 新增需求分类模块。
  - [x] 3.3 新增 Skill 推荐模块。
  - [x] 3.4 新增冲突检测模块。
  - [x] 3.5 新增 Policy 生成模块，并让 OutputPreview 使用统一生成器。

- [x] 4. 本地后端 API
  - [x] 4.1 新增 Express API 服务骨架和 health endpoint。
  - [x] 4.2 实现 Skill 扫描 API。
  - [x] 4.3 实现推荐 API。
  - [x] 4.4 实现 Policy 预览 API。
  - [x] 4.5 实现 Policy 确认写入 API。

- [x] 5. 前端接线与功能完善
  - [x] 5.1 新增 API client，并保留后端不可用时的错误提示。
  - [x] 5.2 Project Setup 接入真实推荐。
  - [x] 5.3 Skill Registry 接入真实扫描。
  - [x] 5.4 Output Preview 接入 preview/apply 流程。
  - [x] 5.5 Dashboard 和 Settings 同步真实状态与文案。

- [x] 6. 最终验证与收尾
  - [x] 6.1 跑通 `npm.cmd run lint`。
  - [x] 6.2 跑通 `npm.cmd run build`。
  - [x] 6.3 启动本地服务并验证核心页面流程。
  - [x] 6.4 验证 Apply 写入预览确认机制。
  - [x] 6.5 更新最终相关文件列表和剩余风险。

## 验证记录

- `npm.cmd run lint`：通过。
- `npm.cmd run build`：通过。
- `GET http://localhost:8787/api/health`：通过，返回 `skillgate-api` 健康状态。
- `POST /api/skills/scan`：通过，能合并内置 Skill 与本机 `SKILL.md` 扫描结果，并返回不可读目录 warning。
- `POST /api/profile/recommend`：通过，电商前端需求被识别为 `frontend_ecommerce_app`，并生成 enabled/manual_only/disabled Skill 状态。
- `POST /api/policy/preview`：通过，能返回 AGENTS.md、CLAUDE.md 与 `.skillgate` 目标文件预览和覆盖状态。
- `POST /api/policy/apply`：通过，空 `confirmedPaths` 时 `writtenFiles` 为 0，所有目标文件进入 `skippedFiles`，且未创建 `AGENTS.md`、`CLAUDE.md` 或 `.skillgate`。
- 前端服务：`npm.cmd run dev` 可正常启动；使用 `node .\node_modules\vite\bin\vite.js --port=3000 --host=127.0.0.1` 后，`GET http://127.0.0.1:3000` 返回 200。
- 浏览器插件验证：本地地址被客户端策略拦截并返回 `net::ERR_BLOCKED_BY_CLIENT`，因此未能在插件内截图；已用 HTTP 服务探测和 API 流程验证替代。

## 剩余风险

- PowerShell 直接构造含中文路径的 JSON 请求时可能显示为 `??`，浏览器和前端 `fetch` 的 UTF-8 请求不受该终端编码现象影响。
- V1 是 Soft Policy，只生成项目级约束文件和会话提示，不会在运行时硬禁用 Codex 或 Claude Code Skill。

## 相关文件

- `TASKS.md`：记录项目后端落地、前端接线、验证和分章提交推送的执行清单。
- `src/store.ts`：维护当前前端状态、内置 Skill 数据、需求分类推荐逻辑和后端扫描结果缓存。
- `src/App.tsx`：修复侧边栏选中标记乱码并清理无用导入。
- `src/pages/ProjectSetup.tsx`：接入后端推荐 API，保留分析弹层并修复示例需求、模式说明等可见乱码。
- `src/pages/SkillRegistry.tsx`：接入后端 Skill 扫描 API，展示扫描结果、扫描根目录数量、warning 和错误提示。
- `src/pages/PolicyBuilder.tsx`：修复策略编辑页可见乱码、高风险提示、冲突说明和小改动规则。
- `src/pages/Dashboard.tsx`：接入后端 Skill 扫描 API，展示最近扫描、检测数量、warning 和错误状态，并修复空状态文案。
- `src/pages/Settings.tsx`：同步展示本地后端 API、最近扫描、检测 Skill 数量和清理状态文案。
- `.gitignore`：忽略 npm 本地缓存目录 `.npm-cache/`。
- `.gitignore`：忽略本地 API 冒烟测试日志 `.skillgate-api*.log`。
- `src/core/knownSkills.ts`：集中维护 V1 内置 Skill Registry 数据，供前端状态层和后续后端复用。
- `src/types.ts`：补充需求分类、生成文件包和扫描结果等共享类型。
- `src/core/classifyRequirement.ts`：提供 V1 规则式需求分类能力。
- `src/core/resolveSkills.ts`：根据需求分类和用户覆盖项生成 Skill 启用状态。
- `src/core/detectConflicts.ts`：集中维护 Skill 冲突规则和高风险启用提醒。
- `src/core/generatePolicy.ts`：统一生成 AGENTS.md、CLAUDE.md、SkillGate policy、profile JSON 和 session prompt。
- `src/pages/OutputPreview.tsx`：接入后端 Policy preview/apply 流程，展示目标路径、覆盖提醒、写入状态，并保留复制和下载输出。
- `src/api/client.ts`：封装 scan、recommend、preview、apply API 请求，并在后端不可用时提供清晰错误。
- `vite.config.ts`：新增开发环境 `/api` 代理到本地 SkillGate 后端，并清理乱码注释。
- `src/vite-env.d.ts`：补充 Vite 客户端类型声明，支持读取 `import.meta.env`。
- `server/index.ts`：Express 本地 API 入口，挂载 health、skills、profile 和 policy 路由。
- `server/routes/skills.ts`：Skill 扫描 API 路由。
- `server/routes/profile.ts`：Profile 推荐 API 路由。
- `server/routes/policy.ts`：Policy 预览与写入 API 路由。
- `package.json`：新增 `npm.cmd run server` 本地后端启动脚本。
- `server/services/skillScanner.ts`：扫描本机 `SKILL.md` 并合并内置 Skill Registry。
- `server/services/profileRecommender.ts`：根据需求文本生成项目 Profile 推荐结果。
- `server/services/policyFiles.ts`：生成策略文件预览并按确认路径写入项目目录。

## 2026-06-04 追加任务：Skill 扫描来源透明化

- [x] 7. Skill 扫描来源透明化
  - [x] 7.1 为扫描结果补充 `LOCAL` / `BUILTIN` / `MERGED` 来源标识，并在 Skill Registry 列表与详情中展示。
  - [x] 7.2 将不存在的可选 Skill 根目录提示从 WARN 调整为 INFO，避免误判为扫描失败。
  - [x] 7.3 扫描 `.system` 子目录中的本机系统 Skill，减少真实本地 Skill 被内置兜底覆盖的情况。

### 追加验证记录

- `npm.cmd run lint`：通过。
- `npm.cmd run build`：通过。

### 追加相关文件

- `server/services/skillScanner.ts`：补充来源标记、`.system` 扫描支持，并把不存在的可选目录归入 notices。
- `src/types.ts`：补充 Skill 来源类型、来源验证状态和扫描 INFO 提示字段。
- `src/pages/SkillRegistry.tsx`：展示 Skill 来源徽标与详情中的本地 `SKILL.md` 验证状态，并区分 WARN 与 INFO。
- `TASKS.md`：追加记录本次来源透明化任务、验证项与相关文件。
# 2026-06-04 追加任务：本地 Skill 扫描链路诊断与旧后端拦截

- [x] 10. 本地 Skill 扫描链路诊断与旧后端拦截
  - [x] 10.1 复现当前 `localhost:8787` API 返回旧版内置假数据、无 `sourceFile`、无 `scannerVersion` 的问题。
  - [x] 10.2 服务端扫描结果补充 `rootReports`，展示每个根目录的扫描状态和命中 `SKILL.md` 数量。
  - [x] 10.3 客户端检测旧后端/假数据响应，直接提示重启 `npm.cmd run server`，避免静默过滤后显示 `Detected: 0`。
  - [x] 10.4 Registry 页面展示扫描根目录诊断，便于确认真实 skill 根目录是否被读取。
  - [x] 10.5 修正 YAML 字符串解析，避免 `name: "xxx"` 显示为带引号名称。
  - [x] 10.6 服务端增加端口占用兜底，8787 被旧进程占用时自动尝试 8788/8789/8790。
  - [x] 10.7 客户端扫描接口增加多端口探测，遇到旧后端假数据时继续寻找新版扫描服务。

## 追加验证记录

- 直接读取真实 Skill：通过，`C:\Users\MR\.agents\skills\karpathy-guidelines\SKILL.md` 存在且为 Codex 可用 skill。
- 本地扫描函数验证：通过，返回 16 个真实本地 `SKILL.md` 文件。
- 8787 端口旧服务复现：通过，确认旧服务返回无 `sourceFile` 的内置假数据，会被 local-only 前端过滤为 0。
- `npm.cmd run lint`：通过。
- `npm.cmd run build`：通过。
- 端口兜底验证：通过，旧 8787 不动时新版服务落到 8788，返回 16 个真实本地 `SKILL.md`，`scannerVersion: local-skill-scan-v3`。

## 追加相关文件

- `server/services/skillScanner.ts`：新增扫描根目录诊断 `rootReports`，升级扫描器版本为 `local-skill-scan-v3`，并修正 YAML 引号解析。
- `server/index.ts`：增加本地 CORS 支持和 8787-8790 端口占用兜底。
- `src/api/client.ts`：识别旧后端返回的无真实 `SKILL.md` 假数据，并给出重启后端的明确错误。
- `src/pages/SkillRegistry.tsx`：展示每个扫描根目录的状态和命中数量。
- `src/types.ts`：补充 `ScanRootReport` 与扫描结果诊断字段。
- `TASKS.md`：记录本次扫描链路诊断、验证结果和相关文件。

# 2026-06-04 追加任务：开发启动与端口发现修复

- [x] 11. 开发启动与端口发现修复
  - [x] 11.1 将开发启动命令调整为同时启动前端和本地 API，避免只运行前端时继续命中旧后端。
  - [x] 11.2 将普通 API 请求与扫描 API 一样支持 8787-8790 多端口探测，兼容后端自动端口兜底。
  - [x] 11.3 更新本次验证记录和相关文件说明。

## 追加验证记录

- `npm.cmd run lint`：通过。
- `npm.cmd run build`：通过。
- `node --check scripts\dev.mjs`：通过。
- 运行时验证：通过，旧 8787 不动时新版后端自动落到 `http://localhost:8788`，`/api/health` 返回 `scannerVersion: local-skill-scan-v3`，`/api/skills/scan` 返回 16 个真实本地 `SKILL.md` 文件，且 16 个条目都有 `sourceFile`。

## 追加相关文件

- `package.json`：将 `dev` 调整为同时启动前端和本地 API，并保留 `dev:frontend` 作为纯前端启动命令。
- `scripts/dev.mjs`：新增本地开发并发启动脚本，统一拉起 API 与 Vite。
- `src/api/client.ts`：普通 API 请求增加新版后端 health 探测和 8787-8790 多端口发现。
- `server/index.ts`：health endpoint 返回当前本地扫描器模式与版本，供前端识别新版后端。
- `server/services/skillScanner.ts`：导出扫描器版本常量，避免 health 与扫描结果版本漂移。
- `TASKS.md`：记录本次开发启动与端口发现修复任务。

# 2026-06-04 追加任务：GitHub README 完善与版本推送

- [ ] 12. GitHub README 完善与版本推送
  - [x] 12.1 将 README 改写为适合作为 GitHub 仓库首页的完整项目介绍。
  - [x] 12.2 在 README 顶部展示本地 `logo.png`，替换默认模板 banner。
  - [x] 12.3 README 使用项目作者视角与项目陈述，不出现对话式助手文案。
  - [x] 12.4 完成验证、提交并推送到 GitHub `main` 分支。

## 追加验证记录

- `npm.cmd run lint`：通过。
- `npm.cmd run build`：通过。
- `node --check scripts\dev.mjs`：通过。

## 追加相关文件

- `README.md`：重写 GitHub 仓库首页文档，包含项目定位、核心能力、真实本机 Skill 扫描、工作流程、API、架构、目录结构、常见问题和 Roadmap。
- `logo.png`：作为 README 顶部品牌图展示。
- `TASKS.md`：记录 README 完善与版本推送任务。
