# Waku Agent：local-first 的个人 agent harness（四支柱极简实现）

- **标题**: Waku Agent — local-first AI agent harness you actually own
- **作者/发布方**: ShenSeanChen（Sean Chen，seanchen.io / AutoManus）
- **原文 URL**: https://github.com/ShenSeanChen/waku-agent
- **发布日期**: 仓库建于 2026-07-10（持续更新）
- **归档日期**: 2026-10-22
- **标签**: Agent 框架, Personal Agent, 本地优先, Memory, Eval, Python, SQLite, MIT
- **保存形式**: 摘要（基于 README 全文阅读）
- **阅读/核验状态**: 已读 README 全文；未读源码

## 一句话摘要

Waku Agent 是一个 local-first 的个人 AI 助手 harness，主打"代码少到一下午能读完"：用四支柱（Harness / Loop / Memory / Eval）把认真做 agent 的核心机制全部摊开——loop 约 95 行纯 Python，memory 是单个 SQLite 文件，eval 内置确定性测试 + LLM-as-judge 并排与发布门禁；对比 OpenClaw / Hermes 自称"同架构，1/100 代码量"。

## 主要要点

- **定位**: 与 ChatGPT / Claude Desktop 这类"你用的产品"相对，Waku 是"你拥有的代码库"——loop、memory schema、记忆门、eval harness 全部可读可改。配套有 20 分钟代码走读视频与系统设计白板图（每个框对应一个文件）。
- **四支柱**:
  - **Harness**: 多 gateway 围绕同一个 loop——终端、浏览器 dashboard（localhost:7777，可视化每条消息流经 harness）、voice、Telegram、Discord、WhatsApp。
  - **Loop**: 约 95 行纯 Python（reason → act → repeat，两种停止方式）。
  - **Memory**: 三层——semantic（事实）+ episodic（经历）+ procedural（skills）；两个关键机制：gate 决定"要不要记"，consolidation 决定"留什么"。本地状态只有一个文件 `~/.waku/state.db`（SQLite），任何目录启动都共用。
  - **Eval / LLM-Ops**: 确定性测试与 LLM-as-judge 并排，带 release gate；每一轮对话都有 trace。
- **多模型**: Anthropic（默认）、OpenAI、Gemini、DeepSeek、MiniMax、Kimi、GLM、OpenRouter、OpenCode Zen/Go；loop 里只用一种 dialect，其余靠一个约 60 行的 adapter 抹平。`pip install waku-agent` 即可跑。
- **Waku Memory（托管版）**: waku.one——跨 agent 共享的托管 memory（在 Claude Code 里存、在 Waku 里取），`waku connect waku-memory` 通过 MCP 接入；另可 `waku skill export --to claude,codex` 把 Waku 的 skills 导出给 Claude Code / Codex。另有 treg（作者的实时数据服务）可 connect 做研究时取数。
- **许可证**: 主体（`waku/`、PyPI 包）MIT；`hosted/` 目录是 Elastic License 2.0（可自用含商用，不可作为服务提供给他人）；Waku 品牌另行保留。
- **仓库元数据**（归档时）: star 2,074，fork 409，commit 455，release 4。

## 适用场景

- 想读懂一个完整个人 agent 的最小实现（loop / memory / eval 全摊开），做自己 harness 的参考底本
- 研究 memory 三层设计与"记忆门 + 巩固"的具体做法

## 相关资料

- [Raft、OpenMuse、nanoMuse：个人 Agent 架构参考](2026-10-14-personal-agent-reference-architectures.md) — 同类个人 agent 参考实现对照
- [Converge AI 开源 a13n Agent 框架调研分析](2026-10-01-a13n-agent-framework-analysis.md) — 企业级对照（构建在 Pydantic AI 之上）
