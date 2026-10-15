# Converge AI 开源 a13n Agent 框架调研分析

- **来源**: GitHub 仓库源码 + 官方文档/spec（实地 clone 检查）
- **仓库**: https://github.com/converge-ai-labs/agent-foundation
- **文档站**: https://a13n-docs.converge.ai/
- **归档日期**: 2026-10-01
- **标签**: Agent 框架, 开源, Pydantic AI, 企业级, 沙箱, Durable Execution, CodeAct

## 一句话摘要

a13n（Agent Foundation）是 Converge AI 开源的企业级 AI Agent 基础设施（Apache 2.0）：它**不自造 agent loop，而是直接构建在 Pydantic AI 2 之上**，提供可嵌入的运行时（Harness）+ 可自托管的多租户服务（Service）+ 沙箱环境（envd），解决的是 agent 从 demo 到生产落地的 hosting 问题——多租户、权限、记忆、沙箱隔离、可观测、可续跑、成本计量。

---

## 1. 项目简介与背景

- **一句话**: 开源、自托管的企业 AI Agent 地基：托管 agent、记忆、沙箱、computer use、durable execution 的库 + 平台。
- **背景**: Converge AI 是做 Proxy（浏览器操作 agent，2024 年 12 月上线）的英国 AI agent 公司，以"让 agent 在动态界面中完成复杂人类任务"见长。a13n 是他们把内部 agent 基础设施开源的产物，2026 年 8 月 18 日建仓，目前处于活跃的 0.x 开发阶段（API 仍可能变）。
- **仓库现状**（2026-10-01 实测）: ★120 / fork 10 / commit 752 / release 128，Apache 2.0。Topics: `agent-framework` `pydantic-ai` `multi-agent-systems` `observability`。

---

## 2. 整体架构

### 2.1 三层结构

```
┌─────────────────────────────────────────────────────────────┐
│ 产品 / 内部服务（你的应用）                                    │
│  API 与体验 / 认证与业务策略（Host 拥有）                       │
├─────────────────────────────────────────────────────────────┤
│ a13n-service（可选：多租户托管运行时）                          │
│  control（HTTP API /api/v1, thread stream）                    │
│  worker（claim run 并执行）                                     │
│  PostgreSQL（唯一真相源） + Redis（仅加速）                      │
├─────────────────────────────────────────────────────────────┤
│ a13n-harness（核心：可嵌入 Python SDK）                         │
│  AgentDefinition → HarnessBuilder → ExecutableAgent           │
│  RunBindings + HarnessState → 逻辑 Run → 结果                   │
│  └─ 底层：Pydantic AI 2（原生 agent loop，不 fork）              │
├─────────────────────────────────────────────────────────────┤
│ a13n-envd（Rust 沙箱守护进程，EIP 协议）                        │
│  Docker / E2B / Daytona / Modal / Runloop 等执行环境            │
└─────────────────────────────────────────────────────────────┘
```

**三种使用方式**：直接在进程里嵌入 Harness（你的应用拥有持久化、凭证、恢复策略）；跑 Harness UI（终端/浏览器 playground，个人或小团队交互式使用）；部署 Service（多租户托管，Console 管理）。Service 的 worker 里**嵌入的是同一个 Harness**，没有第二套 agent 执行引擎。

### 2.2 核心概念（Harness）

| 概念 | 含义 |
|---|---|
| `AgentDefinition` | 不可变的、code-first 的构建输入：AgentSpec（原生 Pydantic AI spec）+ 输出契约 + 模型 + Capabilities + 插件 + 子 agent 拓扑 |
| `HarnessBuilder.build()` | 同步构建，产出可复用的 `ExecutableAgent`；构建过程不触碰模型、环境和外部 I/O |
| `ExecutableAgent` | 可复用的已构建 agent，无 `close()`，不拥有任何 run 资源 |
| `RunBindings` | 每次 run 新鲜构造的"当前可信输入"：身份、环境运行时、模型解析器、调用期能力、策略 |
| `HarnessState` | 可移植的续跑状态：thread_id、Pydantic 消息历史、版本化 Capability 命名空间；**不含凭证、身份、live 资源**（State restores data, not authority） |
| Thread / Run / ModelAttempt | Thread = 一条独立推进的消息历史；Run = 一次逻辑执行（一个 run_id）；ModelAttempt = 内部一次 `Agent.run_stream_events()` 调用（一次 Run 可含多次 attempt，用于模型中断恢复） |

### 2.3 Agent loop 与一次 Run 的数据流

**关键设计：Harness 不创建第二套 agent loop。** spec 原话："adds one reusable build boundary and one canonical logical-run boundary around Pydantic AI; it does not create a second Agent loop or a serialized Agent-definition language." 推理循环、工具调度、消息编解码全部复用 Pydantic AI 的原生实现，Harness 只做 hosting 侧的组合。

一次 `run()` 的流程（来自 spec 01）：

```
1. 进入新鲜的 Environment adapter，原子发布初始挂载集
2. 可选 input_factory 生成语义输入
3. 用 fresh bindings + 拷贝的 Capability 状态创建 AgentContext
4. 绑定 run plugins，冻结 BoundPluginContext
5. 插件链懒启动
6. 跑一次 ModelAttempt（唯一 model-attempt ID）
7. 模型可恢复中断 → 归一化历史，在连续失败预算内重试（Environment facade 保持活跃）
8. 产出/挂起/取消/失败/硬停 → 构建唯一 terminal candidate
9. 展开可信结果中间件
10. 建立 terminal fence，关闭所有 run 资源后交付结果
```

`stream()` 是懒加载、单入口、单消费者的事件流；每个事件带 `thread_id` + `run_id` + 单调递增 sequence。还支持**中途 steer**：`stream.steer(input)` 通过 Pydantic AI 的 `priority="asap"` 队列向正在运行的 agent 注入用户输入。

**Run 结果四种终态**：`completed`（带校验过的业务输出）、`suspended`（deferred tool/approval 等待外部输入，可 resume）、`failed`（安全归一化的失败）、`cancelled`。

### 2.4 Capability 模型（功能组合机制）

功能组合不靠第二套注册表/调度器，而是直接用 **Pydantic AI 的 `AbstractCapability`**。Harness 提供一等公民 Capabilities：context、codeact、delegation、documents、input、interaction、lifecycle、memory、skills、steering、subagents、tool_proxy、tool_review、video_url、web、working_state 等。

四个可信来源：`AgentSpec.capabilities`（声明式）→ `AgentDefinition` → Harness 插件贡献 → `RunBindings.capabilities`（调用期策略/MCP）。显式原则：**Capability 的存在本身不授权外部工作**，跨管理边界的工具仍要走 fresh run policy 和 provider enforcement。

### 2.5 Service：durable execution

Service 把"输入"变成"持久化 run"：调用方把输入追加到 thread inbox → accept 选出一条创建 run（冻结 agent revision、pins、mounts）→ worker 以租约 claim → 嵌入 Harness 执行 → 在安全边界提交 checkpoint（消费掉的输入 + 可续跑状态一起落盘）→ seal 成不可变 facts（PostgreSQL）→ webhook/thread stream/用量记录对外交付。

设计原则很"基础设施味"：
- **PostgreSQL 拍板**：run 归属、输入消费、凭证、审计全在 PG；Redis 只做 claim 唤醒、临时流、限流——丢了只降级不决策。
- **短事务**：绝不在 DB 事务里持有模型调用、工具调用、流。
- **显式不确定性**：可能已生效但结果未知的外部操作记为 unknown，绝不盲目重试。
- 三进程角色（control / worker / 迁移任务），一个镜像通过角色选择运行。

### 2.6 Environments：沙箱执行

- `a13n-envd` 是 Rust 写的设备守护进程，实现 Environment Interaction Protocol (EIP 0.1)，管文件/命令/后台进程/stdin/端口观察。
- Harness 侧是 provider 中立的 `BoundEnvironment` facade：一次 run 一个挂载命名空间，run 结束非破坏性关闭。
- 支持 Docker 本地沙箱和 E2B、Daytona、Modal、Runloop、Sprites、Vercel 等云沙箱；动态环境能力（`DynamicEnvironmentCapability`）按需把操作暴露给模型。

### 2.7 上下文、记忆、可观测

- **上下文管理**：`filters/`（cold_start/content/image/integrity）——cold-start filter 默认空闲 1 小时后自动裁剪已消费工具结果中的超大字符串（保留 pending 结果、用户输入、thinking），拿缓存前缀换更小的冷请求；支持 compaction。
- **记忆**：文件记忆（`DirectoryFileStore`，条件写防并发覆盖）+ 记录记忆（mem0 集成或自定义 RecordStore）；工作记忆用 working_state（任务/笔记，单会话）。
- **可观测**：`a13n-stream-protocol` 把 Harness 事件映射为 **AG-UI 1.0** 标准事件（刚从旧版迁移）；OpenTelemetry instrumentation；用量/计费（genai-prices 做价格快照）。
- **模型层**：14 种 provider 类型（含云 API、网关、本地 Ollama）；**Sign in with ChatGPT**（用 ChatGPT 订阅额度而不用 API key）；默认开启 `SelfHealingModelCapability`（对 provider-history 不兼容做一次性精确修复）；请求级亲和性（prompt cache key、session affinity header）。

---

## 3. 关键设计决策与技术亮点

### 3.1 最大胆的决策：不 fork Pydantic AI

spec 用整整一章（01）讲这个 trade-off：直接依赖 Pydantic AI 2 换来生态兼容和上游修复，代价是必须跟随上游 public API 变化。Harness 明确**不 fork、不复刻**：Agent 图、Model 接口、Capability 生命周期、Toolset 组合、消息编解码、deferred tool 模型、usage 累加器——全部复用。甚至 spec 里写"与 Pydantic 合作，把通用能力推回上游抽象，而不是长出平行 schema"。

这意味着：a13n 不是"又一个 agent 框架"，而是 **Pydantic AI 的 hosting 层**。

### 3.2 CodeAct：受限 Python 编排

技术亮点之一。`CodeActCapability` 让 agent 用**受限 Python**（基于 `pydantic-monty`——Pydantic 的沙箱 Python 方言运行时，代码里注明改编自 pydantic-ai-harness）来组合工具调用，而不是一次次 JSON tool call：

- 工具 owner 必须用 `CodeActPolicyToolset` **显式发布**哪些工具允许被 CodeAct 调用（白名单制，不从元数据推断）；
- 生成的 typed host 函数在沙箱里跑（无文件/网络/进程/环境/凭证访问），嵌套调用走**原生 Pydantic AI ToolManager**，所以 policy、事件、用量、deferred 行为完全一致；
- `ToolProxy` 解决大工具集问题：runner 只拿到 search/call 两个函数，按需发现 schema；
- 另有 `store`/`load`/`forget` 键值状态（默认 256 条/10MB），但**不进 HarnessState**——跨 run 续存要靠 host 保存 state。

对应 CodeAct 论文（2024）的思想：代码即行动，复杂控制流（循环、分支、数据处理）用代码表达比多轮 tool call 更高效。

### 3.3 内联子 agent vs 异步子 agent 的刻意边界

- **内联**：声明式有限无环子 agent 拓扑，父进程内同步执行，借用父的 Environment（不重新进入），子状态可续跑（`resume_subagent`）。
- **异步**：子 agent 可能活得比父 run 长时，Host 自备 `SubagentOperator` 实现 delegate/info/wait/steer/cancel/resume；**Harness 刻意不提供**进程内调度器、默认存储、回调、跨进程取消路由——"把分布式语义留给 Host"。

### 3.4 Human-in-the-loop 是一等公民

复用 Pydantic AI 原生 deferred tool 模型：工具调用可挂起（`suspended` 结果带 `deferred` 批次），外部给反馈后用同一状态 resume。`stream()` 上的 `steer()` 允许运行中插话。Service 层把 approval wait 做成了 durable 的。

### 3.5 与主流框架对比

| 维度 | a13n | LangGraph | CrewAI / AutoGen |
|---|---|---|---|
| 定位 | Pydantic AI 的 hosting/企业落地层 | 图编排框架 | 多 agent 协作框架 |
| 编排原语 | 单 agent loop + Capability 组合；复杂流程用 CodeAct/子 agent | 显式节点/边状态机，checkpoint 内置 | 角色、群聊、任务分工抽象 |
| 状态/续跑 | `HarnessState` 可移植续跑，但**持久化是 Host 的事**；Service 提供 durable run | 内置 checkpointer（Postgres/Redis） | 各自的记忆/状态机制 |
| 多 agent | 声明式内联子 agent + Host 托管异步子 agent，无角色抽象 | 子图/ Send API | 一等公民（Crew、GroupChat） |
| 工具/沙箱 | Environment Provider 抽象 + Rust envd 沙箱守护进程 + MCP 原生 | 工具函数，沙箱靠外部 | 工具函数 |
| 模型层 | 14 provider + ChatGPT 订阅登录 + self-healing | 各家 SDK 拼装 | 各家 SDK 拼装 |
| 部署形态 | 库 / 本地 UI / Docker Compose 多租户 Service | 库（LangGraph Platform 另收费） | 库为主 |
| 哲学 | "不重造轮子"：loop 复用上游，Harness 只解决 hosting | "图即程序" | "拟人协作" |

**一句话差异**：LangGraph 回答"怎么编排步骤"，CrewAI/AutoGen 回答"怎么让多个 agent 协作"，a13n 回答"agent 跑在生产环境里需要的 surrounding infrastructure 是什么"——三者其实可以叠加（a13n 的 agent 里也可以跑 LangGraph 子流程，概念上不冲突）。

---

## 4. 适用场景与局限

**适合**：
- 要**自托管**、面向企业的 agent 平台（多租户、权限、审计、用量计量）；
- 已经在用 Pydantic AI，想补上 hosting 能力（沙箱、记忆、可观测、续跑）而不换框架；
- 需要 computer use / 代码执行隔离（envd 沙箱）；
- 需要 durable run：长任务可中断、可审批、可恢复；
- 想快速搭一个带 Console 的 agent 服务做内部工具（Docker Compose 一键起）。

**局限 / 注意**：
- 0.x 阶段，API 在 minor 版本间可能 breaking change；
- 强绑定 Pydantic AI 生态：上游 API 变了 Harness 就得跟；不用 Pydantic AI 的团队迁移成本高；
- 早期项目（★120），社区、周边生态、生产案例都还薄；
- 没有内置图工作流引擎——复杂 DAG 编排得自己用 CodeAct/子 agent 拼，或叠 LangGraph；
- 异步子 agent 的调度/存储/回调要自己实现 `SubagentOperator`，Harness 只给接口；
- Python 为主（Rust 只负责 envd），重度 Go/Java 栈团队不顺手；
- 文档是中英双语且 spec 极其详细（`spec/` 下 20+ 份契约文档），学习曲线陡，但这是优点——spec-driven，改实现先改契约。

---

## 5. 仓库信息

- **仓库**: https://github.com/converge-ai-labs/agent-foundation
- **文档**: https://a13n-docs.converge.ai/
- **Star**: 120（2026-10-01）| Fork: 10 | Commit: 752 | Release: 128
- **建仓**: 2026-08-18
- **License**: Apache 2.0（README 明确标 "Commercial Friendly"）
- **语言**: Python 3.13（主）+ Rust（envd 沙箱 daemon）+ TypeScript（Console/Harness UI 前端）
- **核心依赖**: `pydantic-ai>=2.51,<3`、`pydantic-monty>=1.0,<2`（CodeAct 沙箱）、AG-UI 1.0（流协议）

---

## 6. 备注（调研方法与可信度）

- 本报告基于 2026-10-01 实际 `git clone`（commit `9369f69`）的源码、`docs/` 用户文档与 `spec/` 架构契约交叉验证，非转述二手资料。
- Converge AI 背景：Proxy 浏览器 agent 的公司；网上有 Salesforce 收购 Convergence.AI 的报道（2026 年初），但与本仓库的组织关系未在仓库内明确说明，报告中未做断言。
- Star 数等仓库元数据取自调研当日 GitHub 页面，会随时间变化。
