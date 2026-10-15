# OpenAgentCore — Open-source, self-hosted implementation of the OpenAI Agents API

- **来源**: GitHub 仓库（MiniMax-AI/OpenAgentCore）
- **链接**: https://github.com/MiniMax-AI/OpenAgentCore
- **归档日期**: 2026-10-01
- **标签**: Agent 框架, 开源, OpenAI Agents API, 自托管, 沙箱, MIT

## 一句话摘要

MiniMax 开源的 OpenAgentCore：在自己的基础设施上跑 AI agent，对外暴露与 OpenAI 完全相同的 Agents API（/v1），每个 Session 可选原生 harness（Codex / Claude Code / MiniMax Code）+ 自选模型供应商 + 可插拔沙箱；附 Web 管理控制台与 durable execution 状态。

## 要点

- **定位**: "One core. Many agents." —— 开源、自托管的 OpenAI Agents API 实现；官方 OpenAI SDK 或纯 HTTP 直接指向自建实例即可，无需学新客户端。
- **三选自由**: 选 agent（每个 Session 跑一个原生 harness：Codex、Claude Code 或 MiniMax Code）+ 选模型供应商 + 选机器（托管沙箱 Docker/microsandbox/E2B，或自己的 Linux/macOS/Windows）。
- **可插拔**: 沙箱、harness、模型供应商都通过 defined protocol 接入，任一部分可独立替换。
- **两套 API**: Agents API（`/v1`，给应用用，协议与 OpenAI Agents API 一致）+ Core API（`/core/v1`，给运维用，经 Web 控制台）。
- **架构**: Core 持有 durable execution state；Runtime 在 Environment 里跑选定的 harness；各连接都是明确定义的协议。
- **安装**: Linux amd64 + Docker + Python 3.9，一行 install.sh；装完在 Web 控制台配置域名/HTTPS、设默认模型、发 Project API key、加执行容量（node / E2B / 自有机器）。
- **技术栈**: Go workspace + pnpm monorepo（packages/ + apps/ + services/ + internal/）；contracts/agents-api 目录放 API 契约；deploy/ 放部署；有完整文档站（mintlify，docs.json）与中英文 README。
- **仓库元数据**（2026-10-01）: star 76，fork 5，commit 646，release 2，MIT，建仓 2026-09-21（很新）。Topics: agent-runtime, ai-agents, claude-code, codex, coding-agent, mcp, openai-agents-api, sandbox, self-hosted。

## README 原文

# OpenAgentCore

An open-source, self-hosted implementation of the OpenAI Agents API with multiple native harnesses.

## What it is

OpenAgentCore runs AI agents on your own infrastructure behind the OpenAI Agents API.

- **Same API as OpenAI.** Point the official OpenAI SDK, or plain HTTP, at your installation. No new client to learn.
- **Your choice of agent.** Each Session runs a native harness: Codex, Claude Code or MiniMax Code, with the model provider you configure.
- **Your choice of machine.** Agents work in a managed sandbox (Docker, microsandbox or E2B), or on your own Linux, macOS or Windows machine.
- **Every part is replaceable.** Sandboxes, harnesses and model providers plug in through defined protocols.

## How it fits together

Applications and operators use these Core APIs:

| API | Path | Used by |
| --- | --- | --- |
| **Agents API** | `/v1` | Your applications. Same protocol as OpenAI's Agents API |
| **Core API** | `/core/v1` | Operators, through Web |

Core keeps durable execution state. The Runtime runs the chosen harness inside the Environment. Each connection is a defined protocol, so any part can be replaced on its own.

## Install

On a Linux amd64 host with Docker and Python 3.9+:

```
curl -fsSL https://github.com/MiniMax-AI/OpenAgentCore/releases/latest/download/install.sh | bash
```

Then: sign in to Web (admin console) with the installer-created Core key, configure domain and HTTPS; set a default model and issue a Project API key; add execution capacity (a node, E2B, or your own machine); run your first Session with the OpenAI SDK.
