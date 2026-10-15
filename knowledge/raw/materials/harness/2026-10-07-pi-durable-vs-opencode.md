# Pi Durable vs. OpenCode: An Architectural Comparison

- **作者**: Josh Rosen（@JoshARosen，认证账号）
- **来源**: X 长文（X Article，帖子本身无文字）
- **链接**: https://x.com/josharosen/status/2107840212915077350
- **发布日期**: 2026-10-07
- **归档日期**: 2026-10-07
- **标签**: Agent 架构, Durable Execution, Pi, OpenCode, 编程智能体

## 一句话摘要

Josh Rosen 的架构对比长文：主流 coding harness（Claude Code、Codex、Pi、OpenCode）都是会话式架构，而 Pi Durable 引入全新架构——把 agent 循环序列化进存储、一切皆任务、可被调度器接管；六处对比（执行账本、可调度性、应用状态与对话结合、压缩移出关键路径、委派即工作图、工具调用即持久化工作），结论是"微调度 agent 系统"，调度器成为 harness 的核心组件。

## 要点

- **背景**: 以往主流编码 harness（Claude Code、Codex、Pi、OpenCode）都采用相似的会话式架构；Pi Durable 引入了全新架构。
- **1. 把 agent 循环序列化进存储**: OpenCode 持久化的是会话状态，活跃执行仍只存在于进程内存；Pi Durable 把一切（模型生成、工具调用等）都建模为任务，形成可被其他进程接管的可持久执行账本。
- **2. 让工作可被调度**: OpenCode 由运行中的 agent 循环驱动工作推进；Pi Durable 把这个职责交给调度器——笔记本休眠、容器重部署之后，可由其他进程继续执行任务。
- **3. 应用状态与对话结合**: OpenCode 持久化的结构化状态主要为运行自身服务；Pi Durable 引入类型化文档（typed documents，存放计划、待办等），与对话条目、任务一起原子提交；分支分叉时文档有明确的跟随策略。
- **4. 压缩移出关键路径**: OpenCode 的压缩是会话生命周期的特定环节；Pi Durable 把压缩本身做成任务——可在后台提前开始、进程中断也能恢复，而不阻塞 agent 循环。
- **5. 委派即工作图**: OpenCode 的子 agent/子会话协调仍由运行中的 harness 管理；Pi Durable 把任务与会话组织为所有权树，支持跨会话的中止传播、后台工作越界继续、对话空闲时任务继续运行。
- **6. 工具调用变为可持久化工作**: OpenCode 的工具调用在活跃 agent 循环中执行；Pi Durable 在工具执行前先将其作为任务落盘，能区分未请求/运行中/已完成状态，并由工具声明是否可安全重放（防止部署、支付等副作用被重复执行）。
- **结语**: "Microscheduling Agent Systems"——Pi Durable 指向 agent 系统的新篇章，调度器成为 harness 的核心组件，文中以操作系统中进程与调度器的关系作类比。
