# OpenDuet：CopilotKit 的开源主动式 agent 模板

- **标题**: OpenDuet — An open-source proactive agent that gets your work done and keeps you in the loop
- **作者/发布方**: CopilotKit（同为 OpenBot 与 AG-UI 协议的团队；此前库中 OpenMuse 亦出自该团队）
- **原文 URL**: https://github.com/CopilotKit/OpenDuet
- **发布日期**: 仓库建于 2026-10-21
- **归档日期**: 2026-10-28
- **标签**: Agent 框架, 主动式 Agent, Personal Agent, 自托管, 审批边界, CopilotKit, MIT
- **保存形式**: 摘要（基于 README 全文阅读）
- **阅读/核验状态**: 已读 README 全文；未运行

## 一句话摘要

OpenDuet 是 CopilotKit 的开源主动式个人 agent 模板：不等你提问，先给晨报（morning brief）、在自己的电脑上继续干活、只在需要你时回来；核心是建在 OpenBot 自托管平台之上的"审批边界"（发送/付款/签署/删除前必须先展示并等你点头），且全部 OpenDuet 特征收敛在一个 tenant 文件夹里，复制即可改造成自己的助手。

## 主要要点

- **主动式定位**: 不等提问——每天一则晨报（今天有什么、变了什么、哪些要你决策），在自己的电脑（真实浏览器、自己的文件、仅授予的工具）上继续工作，完成后或卡住时汇报；作者明言这是对 Claude Duet 这类主动式助手类别的开源回应（与 Anthropic 无隶属关系）。
- **审批边界（核心设计）**:
  - 每个 agent 动作都经 gateway：先按 policy 检查、写审计记录、再执行；需询问的动作暂停并展示确切动作与触发规则，给出 Refuse / Allow once / Always allow；Deny 规则直接拒绝；
  - 给他人发消息永远先问一次，展示收件人与全文；发送、付款、签署、删除类默认都要问；
  - 密码走 masked secret box：值直达目标站点，不进 agent 可读的对话记录；存储的凭据加密、只写、API 不返回、审计日志中脱敏；
  - 无法正面归类为"读"的工具一律按"写"处理。
- **架构**: OpenBot server（Hono + CopilotKit runtime）→ triage（区分"需要你 / 可以等"，附带标签集实测 `evals/triage`）与晨报 → AG-UI 协议的 agent（不限框架：LangGraph / Mastra / CrewAI / Pydantic AI / Google ADK 或手写）→ 每个 agent 独立容器电脑（Chromium、/workspace、shell、浏览器 profile）；线程与记忆走 CopilotKit Intelligence（需免费 Developer 计划的 key，server 无此 key 不启动）；policy/审批/审计/加密凭据存 Postgres + pgvector；MCP 连接器（Google Drive、Notion 等，Composio 代理更多）。
- **"复制即拥有"**: 全部 OpenDuet 特征在 `openbot/examples/openduet` 一个文件夹（brand.yaml、agents.yaml、channels.yaml、model.yaml、skills.yaml），复制后改 `TENANT_PACKAGE_DIR` 指向自己的包，底层 OpenBot 代码不动、后续仍可合入上游修复。
- **已落地功能**: 晨报、triage、Tasks 标签页（建议任务 Start/Hide、Working / Ready for review / Needs input 状态机）、Make（设计系统/看板/幻灯片/文档/网页）、Channels（按工作主题分频道）、语音输入、Gmail + Google Calendar（每人自连 OAuth，另有内置 fake Google 供演示）、Slack / Teams 通道。
- **默认模型**: OpenAI `gpt-5.6-terra`（model.yaml 可改；Anthropic 需 `BOT_PROVIDER=anthropic`）。
- **运行**: Docker + Bun 1.3+ + Node；`bash scripts/start.sh` 起 Postgres、各 Bot 电脑、API server 与 routine worker，访问 localhost:3010；数据（DB、各 Bot 文件与浏览器 profile）存 Docker volume；托管/部署指南尚未发布。
- **仓库元数据**（归档时）: star 530，fork 75，commit 69，MIT，状态 early development。

## 适用场景

- 主动式个人助手的产品设计参考：晨报 + triage + 审批边界的组合
- 自托管 agent 平台的审批/审计边界实现参考（gateway 模式、凭据处理）
- 用 OpenBot 做自己助手时的起点模板

## 相关资料

- [Raft、OpenMuse、nanoMuse：个人 Agent 架构参考](2026-10-14-personal-agent-reference-architectures.md) — 同团队 OpenMuse 的个人 agent 参考
- [Muse 与 Town：按模块拆解个人 Agent 的实现方案](2026-10-23-muse-town-module-implementation-analysis.md) — 个人 agent 模块化拆解对照
- [Waku Agent：local-first 的个人 agent harness](2026-10-22-waku-agent-local-first-harness.md) — 极简个人 agent 对照
