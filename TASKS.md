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
