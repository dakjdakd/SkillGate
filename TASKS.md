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

- 当前章节：4. 本地后端 API
- 当前子任务：5.1 新增 API client，并保留后端不可用时的错误提示。

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

- [ ] 5. 前端接线与功能完善
  - [ ] 5.1 新增 API client，并保留后端不可用时的错误提示。
  - [ ] 5.2 Project Setup 接入真实推荐。
  - [ ] 5.3 Skill Registry 接入真实扫描。
  - [ ] 5.4 Output Preview 接入 preview/apply 流程。
  - [ ] 5.5 Dashboard 和 Settings 同步真实状态与文案。

- [ ] 6. 最终验证与收尾
  - [ ] 6.1 跑通 `npm.cmd run lint`。
  - [ ] 6.2 跑通 `npm.cmd run build`。
  - [ ] 6.3 启动本地服务并验证核心页面流程。
  - [ ] 6.4 验证 Apply 写入预览确认机制。
  - [ ] 6.5 更新最终相关文件列表和剩余风险。

## 相关文件

- `TASKS.md`：记录项目后端落地、前端接线、验证和分章提交推送的执行清单。
- `src/store.ts`：维护当前前端状态、内置 Skill 数据、临时需求分类和推荐逻辑；第二章修复乱码业务文案。
- `src/App.tsx`：修复侧边栏选中标记乱码并清理无用导入。
- `src/pages/ProjectSetup.tsx`：修复项目配置页可见乱码、示例需求和模式说明。
- `src/pages/PolicyBuilder.tsx`：修复策略编辑页可见乱码、高风险提示、冲突说明和小改动规则。
- `src/pages/Dashboard.tsx`：修复首页空状态、分区标题和软策略说明的可见乱码。
- `src/pages/Settings.tsx`：修复设置页危险区域标题乱码并保留现有设置结构。
- `.gitignore`：忽略 npm 本地缓存目录 `.npm-cache/`。
- `.gitignore`：忽略本地 API 冒烟测试日志 `.skillgate-api*.log`。
- `src/core/knownSkills.ts`：集中维护 V1 内置 Skill Registry 数据，供前端状态层和后续后端复用。
- `src/types.ts`：补充需求分类、生成文件包和扫描结果等共享类型。
- `src/core/classifyRequirement.ts`：提供 V1 规则式需求分类能力。
- `src/core/resolveSkills.ts`：根据需求分类和用户覆盖项生成 Skill 启用状态。
- `src/core/detectConflicts.ts`：集中维护 Skill 冲突规则和高风险启用提醒。
- `src/core/generatePolicy.ts`：统一生成 AGENTS.md、CLAUDE.md、SkillGate policy、profile JSON 和 session prompt。
- `src/pages/OutputPreview.tsx`：改为使用统一 Policy 生成器展示、复制和下载输出。
- `server/index.ts`：Express 本地 API 入口，挂载 health、skills、profile 和 policy 路由。
- `server/routes/skills.ts`：Skill 扫描 API 路由。
- `server/routes/profile.ts`：Profile 推荐 API 路由。
- `server/routes/policy.ts`：Policy 预览与写入 API 路由。
- `package.json`：新增 `npm.cmd run server` 本地后端启动脚本。
- `server/services/skillScanner.ts`：扫描本机 `SKILL.md` 并合并内置 Skill Registry。
- `server/services/profileRecommender.ts`：根据需求文本生成项目 Profile 推荐结果。
- `server/services/policyFiles.ts`：生成策略文件预览并按确认路径写入项目目录。
