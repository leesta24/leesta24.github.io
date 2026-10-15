# OAR — Open Agent Runtime: programming interface for all agent harnesses

- **来源**: GitHub 仓库（botiverse/oar）
- **链接**: https://github.com/botiverse/oar
- **归档日期**: 2026-10-01
- **标签**: Agent 框架, 开源, TypeScript, 编程智能体, 统一接口

## 一句话摘要

Botiverse 开源的 OAR（Open Agent Runtime）：与供应商无关的编程接口，统一对接各类 coding-agent harness（Claude Code、Codex、Cursor、Kimi Code、Pi 等），让开发者删掉 harness 适配逻辑、只关注产物和 UX；提供库 + CLI + 记录流/查询契约 spec。

## 要点

- **定位**: provider-independent 的编程接口，为构建 agent workspace 和其他应用打地基；口号是 "Delete harness logic and focus on outcomes and UX."
- **支持的 runtimes**: Antigravity、Claude Code、Codex、Cursor、Grok Build、Kimi Code、Pi。
- **库用法**: `import { promptAndWait, runtimes } from "@botiverse/oar"`；`runtimes.require("grok")` 拿 runtime → `session()` 建会话 → `session.events(cb)` 订阅扁平化事件流（text_delta / tool_call_started / turn_ended 等，每个事件带 seq 和 agentPath）→ `promptAndWait(session, prompt)` 跑一轮。
- **事件模型**: `events()` 是"扁平、带归因的会话读取"——每个事实一个 Event（用户消息回显、文本、推理、工具调用起/中/止、回合起止、用量、模型、effort、compaction、重试、应用请求、控制拒绝、进程退出）；`{ coalesceText: true }` 按块收文本；`session.rawEvents()` / `session.records()` 暴露底层原生记录流（含完整 native payload）。
- **文档体系**: docs/design/（设计动机与关键设计问题）、docs/spec/（record-stream 与查询契约）、Conversation projection（从请求/响应/原生消息构建对话 UI）、docs/spec/inventory.md（独立 native skill、MCP server 与工具查询）、docs/runtimes/（各 runtime 原生语义与 oar 的映射）、docs/prior-arts/feature-comparison.md（竞品按特性与证据对比）、docs/design/decisions.md（设计决策、证据与重审条件）、docs/design/roadmap.md。
- **系统观**: docs/design/system.md 把 library、evidence layer、projections、continuation 描述为一个面向 agent 的整体系统。
- **CLI**: `npx @botiverse/oar-cli list` / `oar run claude "What does this repo do?" --record run.jsonl`，单独发布为 `@botiverse/oar-cli`。
- **技术栈**: TypeScript，ESM-only，要求 Node.js 24+；pnpm monorepo（packages/ + apps/arena + sea-trial + experiments）。
- **仓库元数据**（2026-10-01）: star 96，commit 372，Apache-2.0，建仓 2026-08-05；所属 org botiverse 还有 antiproton（durable multi-tenant runtime，凭证不进模型上下文）、hands、k-carrier 等项目。

## README 原文

# OAR - *programming interface for all agent harnesses*

OAR (**O**pen **A**gent **R**untime) is a provider-independent programming interface for coding-agent runtimes: a solid foundation for building agent workspaces and other applications.

**Delete harness logic and focus on outcomes and UX.**

## Supported runtimes

- Antigravity, Claude Code, Codex, Cursor, Grok Build, Kimi Code, Pi

## Library

```ts
import { promptAndWait, runtimes } from "@botiverse/oar";

const grok = runtimes.require("grok");
const installation = await grok.installation?.();
if (installation?.kind === "available") {
  const session = await grok.session(installation, { cwd: process.cwd() });
  session.events((event) => {
    switch (event.kind) {
      case "text_delta": process.stdout.write(event.text); break;
      case "tool_call_started": console.log(`[${event.tool}]`); break;
      case "turn_ended": console.log(event.outcome.kind); break;
    }
  });
  const run = await promptAndWait(session, "Inspect this repository", { timeoutMs: 120_000 });
  console.log(run.kind === "rejected" ? run.code : run.outcome);
  await session.dispose();
}
```

`events()` is the flat, attributed reading of the session: one `Event` per fact (native user message echoes, text, reasoning, tool call start / progress / end, turn start and end, usage, model, effort, compaction, retry, app requests, control rejections, the process exit), with `seq` and `agentPath` on each. Pass `{ coalesceText: true }` to get text in blocks instead of pieces. When the runtime's own frame matters, `session.rawEvents()` and `session.records()` expose the underlying record stream with every native payload verbatim.

## CLI

```
npx @botiverse/oar-cli list
oar run claude "What does this repo do?" --record run.jsonl
```

ESM-only, requires Node.js 24+, Apache-2.0.
