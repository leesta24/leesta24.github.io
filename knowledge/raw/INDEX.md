# 知识库索引

## 知识模块

| 模块 | 范围 | 资料数 |
| --- | --- | --- |
| [Agent 框架与运行时](materials/harness/README.md) | Agent loop、Harness 接口、持久执行、会话与任务编排。框架整体分析归这里，侧重部署资源与沙箱的文章归 infrastructure。 | 7 |
| [上下文与记忆](materials/context-memory/README.md) | 上下文构造、压缩、prompt cache、长期记忆和用户建模。 | 3 |
| [评测与优化](materials/evaluation/README.md) | 评测集、裁判、轨迹评估、迭代优化与可观测性。 | 5 |
| [Agent 基础设施](materials/infrastructure/README.md) | 沙箱、部署、多租户、资源调度、MCP 网关与工具接入设施。 | 7 |
| [检索与数据](materials/retrieval-data/README.md) | 向量搜索、全文检索、混合检索、RAG 与数据库。 | 3 |
| [软件工程](materials/software-engineering/README.md) | 通用软件设计、工程方法与经典文章。 | 2 |
| [逆向工程](materials/reverse-engineering/README.md) | 程序行为分析、逆向方法和工具。 | 1 |
| [Computer Use 与设备操作](materials/computer-use/README.md) | 浏览器、桌面和手机的感知、操作、验证与执行策略；通用浏览器托管和资源部署归 infrastructure。 | 1 |
| [决策模型](materials/decision-models/README.md) | 候选打分、分类、概率校准、决策模型训练与推理；以裁判应用为主的文章归 evaluation。 | 1 |
| [语音与实时交互](materials/voice-interaction/README.md) | 流式 ASR、TTS、实时语音、电话 Agent 与音频交互链路。 | 2 |
| [生成式媒体](materials/generative-media/README.md) | AI 生成的视频、图像等多媒体内容的 prompt、案例与工作流灵感。 | 1 |
| [模型推理与服务](materials/model-inference/README.md) | LLM 推理引擎、并行与调度策略、KV cache、解码优化与线上服务架构。 | 1 |

## 全部资料（按归档日期倒序）

| 日期 | 标题与归档链接 | 来源 | 标签 | 一句话摘要 |
| --- | --- | --- | --- | --- |
| 2026-10-23 | [Muse 与 Town：按模块拆解个人 Agent 的实现方案](materials/harness/2026-10-23-muse-town-module-implementation-analysis.md) | 技术分析 | Personal Agent, 记忆, 主动性, 沙箱, 持久执行, 权限 | 按技术与功能模块拆解记忆、后台工作、交付、凭证、双层沙箱、URI 文件闸门和产物运行时，明确事实、推断、参考实现与版本冲突。 |
| 2026-10-22 | [Amp Self-Hosted Orbs：把 agent 执行环境搬进自己的基础设施](materials/infrastructure/2026-10-22-amp-self-hosted-orbs.md) | Amp | Agent 基础设施, 沙箱, 自托管, 执行环境 | Amp 开放自托管其 agent 执行环境 Orbs：provider 外连 Amp 收 spawn/pause/delete，dispatch 到用户自备程序（Docker/E2B/K8s/Modal 等），控制面托管、执行面 BYOC。 |
| 2026-10-22 | [Waku Agent：local-first 的个人 agent harness](materials/harness/2026-10-22-waku-agent-local-first-harness.md) | GitHub (ShenSeanChen/waku-agent) | Agent 框架, Personal Agent, 本地优先, Memory, Eval, Python, MIT | 四支柱（Harness/Loop/Memory/Eval）极简实现：loop 约 95 行 Python，memory 单个 SQLite 文件，eval 内置双轨评测与发布门禁；自称 OpenClaw 同架构 1/100 代码量。 |
| 2026-10-21 | [DeepInfer：DeepSeek 官方开源推理框架](materials/model-inference/2026-10-21-deepinfer-deepseek-inference.md) | GitHub (deepseek-ai/DeepInfer) | LLM 推理, DeepSeek, MoE, 投机解码, vLLM, 昇腾 | DeepSeek 线上推理栈的开源版：vLLM 底座 + FlashMLA/DeepGEMM/DeepEP，自研并行（Attention DP、MoE EP+EPLB）与 DSpark 投机解码，支持 SM100 与昇腾 950。 |
| 2026-10-19 | [MotionVideo：AI 生成动态视频灵感库](materials/generative-media/2026-10-19-motionvideo-xyz.md) | MotionVideo（社区策展） | AI 视频, Prompt 灵感, 动态设计 | 社区策展的 AI 生成动态视频画廊：每条是 prompt/skill 生成的短视频作品，覆盖 showreel、产品宣传片、UGC 广告等，附原帖链接。 |
| 2026-10-19 | [XERJ：给 AI agent 的本地搜索](materials/retrieval-data/2026-10-19-xerj-local-ai-search.md) | GitHub (xerj-org/xerj) | 本地搜索, Agent 工具, MCP, Elasticsearch 兼容, Rust, Agent Memory, Apache-2.0 | Rust 单二进制本地搜索引擎：autoindex 任意文件夹，agent 查索引拿精确片段而非 grep 读文件；ES API 兼容，原生 MCP server，带 agent memory 与 Jev 重排。 |
| 2026-10-14 | [Netlify：从 V8 isolates 到 Firecracker MicroVM](materials/infrastructure/2026-10-14-netlify-microvm-edge-functions.md) | Netlify / Jake Champion、Aarthy Chandrasekhar、Ivan Zarea | 沙箱, MicroVM, 冷启动 | 通过请求路由、镜像缓存和快照恢复协同降低边缘执行开销。 |
| 2026-10-14 | [Turbopuffer v3：为什么不再以向量索引作为主索引](materials/retrieval-data/2026-10-14-turbopuffer-vector-primary-index.md) | Turbopuffer / Dan Harrison | 向量检索, 存储架构, 写放大 | ANN 作为主索引限制了多向量文档、全文检索和聚合，v3 尝试解耦。 |
| 2026-10-14 | [Personal Agent Protocol：个人 Agent 的服务授权入口](materials/infrastructure/2026-10-14-personal-agent-protocol.md) | Sierra / Bret Taylor、Clay Bavor | OAuth, 授权, Agent 协议 | 围绕用户授权与商家控制，统一个人 Agent 访问网站、API 和企业 Agent 的会话。 |
| 2026-10-14 | [Artemis：Android 操作、验证与历史压缩](materials/computer-use/2026-10-14-artemis-android-automation.md) | Google / Artemis 项目 | Android, Computer Use, MCP, 验证 | 将真实 Android 设备操作接入 Agent，并区分快速执行与规划验证。 |
| 2026-10-14 | [NanoJev 与 Nimble：两种可研究的决策模型实现](materials/decision-models/2026-10-14-nanojev-nimble.md) | TianyuCodings；Bespoke Labs | 决策模型, 分类, 概率校准, 训练 | 分别从小模型决策头和候选 token 打分理解低延迟决策模型。 |
| 2026-10-14 | [Raft、OpenMuse、nanoMuse：个人 Agent 架构参考](materials/harness/2026-10-14-personal-agent-reference-architectures.md) | Botiverse；CopilotKit；nano-muse | Personal Agent, 持久执行, 多端, 自托管 | 三个项目分别提供协作工作区、持久任务应用和跨设备执行的参考。 |
| 2026-10-14 | [Patter：可替换供应商的电话 Agent 栈](materials/voice-interaction/2026-10-14-patter-voice-sdk.md) | PatterAI | 语音, 电话, Realtime, Fallback | 用统一 Python/TypeScript SDK 组合电话运营商、语音模型及 Agent loop。 |
| 2026-10-14 | [Confucius4-R2T2：稳定前缀流式语音识别](materials/voice-interaction/2026-10-14-confucius-r2t2-streaming-asr.md) | 网易有道 | 流式 ASR, 稳定前缀, 实时交互 | 只提交稳定的转写前缀，使下游 Agent 可持续消费已确认文本。 |
| 2026-10-14 | [Langfuse：如何把用户信号用于 Agent 评估](materials/evaluation/2026-10-14-langfuse-user-signals.md) | Langfuse / Lotte Verheyden | 用户反馈, 评测, Proactive | 把用户行为作为发现问题的入口，而非直接替代任务质量指标。 |
| 2026-10-14 | [Persimmon：多轮、多用户行为模拟与评测](materials/evaluation/2026-10-14-persimmon-user-simulation.md) | humans& | 用户模拟, 多轮评测, 分布匹配 | 以人类行为分布为目标，研究比通用助手更真实的用户模拟。 |
| 2026-10-14 | [Assistant Benchmark：把真实助理任务转成测试用例](materials/evaluation/2026-10-14-assistant-benchmark-use-cases.md) | Assistant Benchmark | Personal Agent, 用例, 评测 | 从具体任务、证据和失败边界构建测试集，比只收藏总排名更有用。 |
| 2026-10-14 | [Muse 记忆与后台整理：非官方档案阅读](materials/context-memory/2026-10-14-muse-memory-unofficial-archive.md) | asgeirtj/system_prompts_leaks 非官方整理 | 记忆, 后台任务, 逆向分析 | 档案呈现短期记录、长期事实和关系页分层，以及后台整理的设计。 |
| 2026-10-14 | [loop-me：把重复事务整理成可实现的工作流规格](materials/software-engineering/2026-10-14-loop-me-workflow-specs.md) | Matt Pocock | Skills, 需求分析, 工作流 | 通过逐轮澄清，把生活或工作的重复模式写成可交付给实现者的规格。 |
| 2026-10-14 | [Kernel：浏览器会话、认证与可观测性基础设施](materials/infrastructure/2026-10-14-kernel-browser-infrastructure.md) | Kernel | 浏览器, 会话, 认证, 可观测性 | 将浏览器执行、登录状态与运行证据作为 Agent 的独立基础设施。 |
| 2026-10-14 | [Linq：面向 Personal Agent 的 iMessage 接入](materials/infrastructure/2026-10-14-linq-imessage-api.md) | Linq | iMessage, 消息接入, Webhook, 群聊 | 通过 REST API 与事件回调，把 Agent 放进既有消息渠道。 |
| 2026-10-14 | [TypeSafe coding agent 思考：KV cache、工具发现与上下文重建（摘录）](materials/context-memory/2026-10-14-typesafe-context-design-excerpts.md) | 作者身份未独立确认 | 上下文, KV cache, 工具发现, 路由 | 从缓存依赖重新审视小模型路由、工具 schema 和通用 compaction 的取舍。 仅有摘录，全文未读取。 |
| 2026-10-11 | [REA: Reverse Engineer Anything](materials/reverse-engineering/2026-10-11-rea-reverse-engineer-anything.md) | GitHub (morluto/rea) | 逆向工程, MCP, Agent 工具, 二进制分析, MIT | MCP 服务器，把逆向工程工具接给 AI agent：无源码调查任意应用，从应用行为深挖到原生二进制，解释原理、给证据链、帮你复刻；分析全本地，91.9k star。 |
| 2026-10-07 | [Pi Durable vs. OpenCode: An Architectural Comparison](materials/harness/2026-10-07-pi-durable-vs-opencode.md) | X @JoshARosen | Agent 架构, Durable Execution, Pi, OpenCode, 编程智能体 | Josh Rosen 的架构对比：主流 coding harness 是会话式架构，Pi Durable 把 agent 循环序列化进存储、一切皆任务；六处对比（执行账本、可调度性、状态与对话结合、压缩移出关键路径、委派即工作图、工具调用持久化），结论是"微调度 agent 系统"。 |
| 2026-10-07 | [Jev-as-a-Judge for Agent Evaluations](materials/evaluation/2026-10-07-jev-as-a-judge-for-agent-evaluations.md) | X @omarsar0 | LLM 评测, LLM-as-Judge, Agent 评测, Jev, TypeSafe AI | elvis 的长文：把 TypeSafe AI 的决策模型 Jev 用作 agent 评测的 LLM 裁判——看整条轨迹而非最终回复，把标准写成带概率选项的问题；accept-or-escalate 模式比单用 GPT-6 准确率高 0.9pp、成本仅 41%；先验证再信任，附六条清单。 |
| 2026-10-06 | [Constructed Initial Context（Raft 冷唤醒成本降低 60%）](materials/context-memory/2026-10-06-raft-constructed-initial-context.md) | X @istdrc | Agent 基础设施, 上下文管理, 成本优化, Raft, Claude Code | Raft 团队：长会话 agent 因 prompt cache 一小时过期，每天约 22 次冷唤醒、每次中位数重写 643K tokens；改用闲置超 1 小时且 session 超 128K 时开新 session、用约 10K tokens 独立 block 构造首输入；单次唤醒成本降 60%，compaction 停滞降 73%，行为评判 60/63 good；已在 Raft Computer 1.0.40 上线。 |
| 2026-10-06 | [No Silver Bullet — Essence and Accidents of Software Engineering](materials/software-engineering/2026-10-06-no-silver-bullet-brooks.md) | F. P. Brooks, Jr.（1986/87） | 软件工程, 经典论文, 本质复杂度, 偶然复杂度 | Brooks 断言十年内无任何技术/管理方法能让软件生产率提升一个数量级：困难分本质与偶然，过去进步都来自消除偶然；本质困难是复杂度、一致性、可变性、不可见性，处方是买不造、快速原型、渐进增长、培养顶级设计师。 |
| 2026-10-05 | [Designing MCP Gateway: Uber's MCP Management Platform](materials/infrastructure/2026-10-05-uber-mcp-gateway.md) | X @UberEng | MCP, Uber, Agent 基础设施, 网关, 服务发现, 安全 | Uber 自建的集中式 MCP 网关：Registry（控制平面）+ Proxy Gateway（数据平面）+ AutoCrawler（IDL 自动发现），托管 800+ MCP 服务器和 5000+ 工具；扩展有 Omni MCP（渐进发现）、Response Projection（响应裁剪）、Code Mode（aifx CLI 直调）。 |
| 2026-10-01 | [Sandbox Agent Substrate — CNCF Sandbox 申请（Issue #523）](materials/infrastructure/2026-10-01-agent-substrate-cncf-sandbox-523.md) | GitHub (cncf/sandbox#523) | Agent 基础设施, Kubernetes, 沙箱, CNCF, 高密度调度 | Google 主导申请加入 CNCF Sandbox 的 agent 运行时：K8s 上高密度多路复用（30-100x），gVisor/microVM 内存快照实现亚秒级 suspend/resume，目标 O(100M) 并发；1.8k star，计划 2026 年 11 月 KubeCon NA 官宣。 |
| 2026-10-01 | [OpenAgentCore: self-hosted OpenAI Agents API with native harnesses](materials/harness/2026-10-01-openagentcore.md) | GitHub (MiniMax-AI/OpenAgentCore) | Agent 框架, OpenAI Agents API, 自托管, 沙箱, MIT | MiniMax 开源：在自有基础设施上跑 agent，对外暴露与 OpenAI 相同的 Agents API；每个 Session 可选 Codex / Claude Code / MiniMax Code harness + 自选模型 + 可插拔沙箱，附 Web 控制台与 durable execution。 |
| 2026-10-01 | [OAR (Open Agent Runtime): programming interface for all agent harnesses](materials/harness/2026-10-01-oar-open-agent-runtime.md) | GitHub (botiverse/oar) | Agent 框架, TypeScript, 编程智能体, 统一接口 | Botiverse 开源的供应商无关编程接口，统一对接 Claude Code / Codex / Cursor / Kimi Code 等 coding-agent harness，提供扁平化事件流、记录流契约 spec、库 + CLI。 |
| 2026-10-01 | [Converge AI a13n Agent 框架架构分析](materials/harness/2026-10-01-a13n-agent-framework-analysis.md) | GitHub 源码调研 | Agent 框架, Pydantic AI, 开源, 企业级, CodeAct, Durable Execution | Converge AI 开源的企业级 agent 基础设施，不自造 agent loop 而构建在 Pydantic AI 2 之上，提供可嵌入运行时 + 自托管多租户服务 + Rust 沙箱，亮点是 CodeAct 受限 Python 编排与 durable execution。 |
| 2026-09-29 | [Automating eval design and hillclimbing with Claude](materials/evaluation/2026-09-29-automating-eval-design-and-hillclimbing.md) | claude.dev | LLM 评测, Eval, Hillclimbing, Claude Code, 过拟合 | claude-api skill 的 build-eval/hillclimb 命令详解：评测设计四要素、对抗采样原则，以及用 train/test 切分防过拟合的逐轮改进流程，附降本与提性能两个实战案例。 |
| 2026-09-29 | [Lakebase Search: State-of-the-art full text and vector search for Postgres](materials/retrieval-data/2026-09-29-lakebase-search-postgres.md) | Databricks Blog | 向量搜索, PostgreSQL, BM25, 混合搜索, AI Agent | Databricks 为 Lakebase Postgres 推出 lakebase_vector（IVF+RaBitQ 量化）与 lakebase_text（原生 BM25）扩展，实现 serverless 按量计费的混合搜索，直指 pgvector 三大痛点。 |
