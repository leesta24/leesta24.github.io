# Reason Network：用 iroh P2P + MCP 工具层实现的 agent 间通信

- **标题**: Reason Network — your team's coding agents, talking to each other
- **作者/发布方**: Reason Machines（reasonmachines.com；引擎源自 Lars Talian 的 tincan）
- **原文 URL**: https://reasonmachines.com/network · 引擎 https://github.com/reason-machines/reason-network · 设计文档 DESIGN.md
- **发布日期**: 引擎仓库建于 2026-10-16
- **归档日期**: 2026-10-28
- **标签**: Agent 通信, P2P, iroh, MCP, 多智能体, 协作, Rust, 开源
- **保存形式**: 摘要（基于官网、引擎 README 与 DESIGN.md 前段阅读）
- **阅读/核验状态**: 已读官网网络页、引擎 README 全文与 DESIGN.md 概念/架构/网络层部分；未读源码

## 一句话摘要

Reason Network 不是用 Google 的 A2A 协议，而是自研的 P2P 网络：每台电脑跑一个 Rust daemon（iroh QUIC 传输），agent 通过 MCP 工具（list_team / send_message / check_inbox / ask_user）互发消息；核心不是消息本身，而是一份"团队实时会话目录"（谁、在哪台机器、哪个 repo/分支、忙还是闲、在干什么），让 agent 能选对收件人而不是广播——从而避免多个 live agent 在同一代码上碰撞。

## 主要要点

- **定位澄清**: 这里的 A2A 是泛指 agent-to-agent，不是 Google 的 A2A 标准（无 Agent Card、无 HTTP+JSON-RPC）。Reason 自建了一套：P2P 传输 + MCP 工具接口 + 会话目录。
- **架构**: 每台机器一个静态 Rust 二进制 daemon（`reason-network daemon`，SQLite 存 roster、目录、邮箱），agent 侧通过 stdio MCP server（`reason-network mcp`，unix socket `~/.reason/network/sock`）连 daemon；另有 `reason-network hook`（状态/上下文注入/唤醒）与 `bridge`（Hermes 等原生适配器的 JSON-lines 传输）。
- **传输层**: iroh 1.4——QUIC，ed25519 身份认证；同一 Wi-Fi 用 mDNS 发现，互联网用打洞（hole punching），失败则经 HTTPS relay 中转（relay 只看到加密字节）；默认用 Reason 的区域 relay（地址列表经签名后从 reasonmachines.com/network/relays.json 获取），团队也可自建 relay（`reason-network relay <url>`），此时机器不再接触 n0。
- **成员制与身份**: roster 复制到每台机器，每条目由成员机器密钥签名；准入链（创始人自签，之后由已准入机器签名）；invite 是 hash(secret)+过期+单次使用；连接门禁：非活跃成员直接丢弃；名字由 Reason 登录（Google/GitHub/Apple/邮箱）验证，机器只能代表自己的人说话；一台电脑一次只在一个网络。
- **寻址与会话目录**: 层级 team → person → machine → session；地址如 `alice/api-claude`、`alice/*`、`repo:acme/api`、`*`；session 名默认 `<repo-or-dir>-<agent>`，冲突加 -2/-3；名字绑定到会话（`<agent>:<id>`），重启/恢复后名字回归且离线消息跟随，名字保留一天后失效；目录信息（repo、分支、忙闲、在干什么）来自会话自己的标题与 todo 列表，agent 无需主动汇报。
- **四个工具**:
  - `list_team`：看谁在线、各会话的机器、repo、分支与忙闲；
  - `send_message`：发给指定 session，回复回到自己的会话；
  - `check_inbox`：给无法直接投递的 agent 拉取消息；
  - `ask_user`：仅本机 agent 可用，在用户屏幕弹 pop-up（Approve/Deny），答案直接作为用户本人的回答回给 agent（不可由他人伪造）。
- **投递分层**（按 agent 能力）:
  - Push 直达（会话中送达、idle 可唤醒）: Claude Code（收件箱）、Codex（queue）、opencode / pi 插件、Reason；
  - Hook 注入（工具调用后或 turn 结束时）: Gemini、Copilot、Grok、Cursor、无 codex 二进制的 Codex；
  - Inbox 拉取: DeepSeek Harness、ZCode 及一般 MCP 客户端；
  - 托管助手（Grok Bot、Muse、ChatGPT 的 Dots）: 经 Reason 服务器 + MCP 端点 `https://mcp.reasonmachines.com/mcp` 接入，非 P2P 直连。
- **附件与安全**: 消息可带最多 10 个文本文件（各 256 KB，共 512 KB），接收方存 `~/.reason/network/inbox`，永不设可执行、永不自动打开；离线消息等待对方上线再发；同机两 engine 间约 2 ms，暖 agent 答短问题约 2 秒（主要是模型思考）。
- **与同类项目的区别**（DESIGN.md 自述）: 2026 年约 15 个 agent 互发消息项目，几乎全是单机、单人或仅 Claude；最接近的 agentbus 是 Tailscale 内的个人设备 P2P、他人只是 headless responder，agents-party 是共享加密房间而非目录；Reason 的核心是带上下文的团队实时会话目录。
- **仓库元数据**（归档时）: star 1,291，fork 109，commit 279，MIT/Apache-2.0 双许可；Reason CLI（负责安装）免费但不开源。

## 适用场景

- 多 agent 协作的通信层设计参考：会话目录 + 按能力分层的投递 + 冲突避免（先问再干）
- P2P agent 网络的成员制与身份设计（签名 roster、invite、relay 仅转发密文）
- 与 MCP 工具层结合的 agent 间消息接口设计

## 相关资料

- [Amp Self-Hosted Orbs：把 agent 执行环境搬进自己的基础设施](2026-10-22-amp-self-hosted-orbs.md) — agent 执行环境的算力层对照
- [LayerFS：给 agent 的"临时工作区 + 永久共享历史"文件系统](2026-10-26-layerfs-agent-filesystem.md) — 多 agent 并行时的状态层对照
