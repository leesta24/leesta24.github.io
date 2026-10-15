# [Sandbox] Agent Substrate — CNCF Sandbox 申请（Issue #523）

- **来源**: GitHub（cncf/sandbox issues#523）
- **链接**: https://github.com/cncf/sandbox/issues/523
- **项目仓库**: https://github.com/agent-substrate/substrate
- **归档日期**: 2026-10-01
- **标签**: Agent 基础设施, Kubernetes, 沙箱, CNCF, 高密度调度

## 一句话摘要

Agent Substrate 申请加入 CNCF Sandbox：一个跑在 Kubernetes 上的高密度、低延迟 agent 运行时——把大量"actor"（agent，多为 idle）多路复用到少量"worker" pod 上，通过 gVisor 进程 checkpoint / microVM 内存快照实现亚秒级 suspend/resume，目标 O(100M) 级 agent 并发；由 Google 工程师主导，NVIDIA、Solo.io、微软参与，计划 2026 年 11 月 KubeCon NA 官宣。

## 要点

- **项目定位**: "Kubernetes for agents" —— 大规模 AI agent 部署的高密度低延迟运行时环境，弥合传统容器编排与 agent 系统运维需求之间的鸿沟。
- **核心思想**: 把大量逻辑 actor（agent 类应用 90%+ 时间 idle）映射到少量 ready worker 上重度多路复用；提供 actor 生命周期管理（create/destroy、suspend/resume）、实时调度、流量路由。
- **关键数字**: 30x–100x 密度（数千 idle agent 复用到少量 worker pod）；sub-second 状态恢复（gVisor checkpoint / Cloud Hypervisor microVM 内存快照，保留完整 RAM + 本地文件系统状态）；路线图目标 sub-100ms p95 激活延迟（分层缓存：local zswap → 本地 SSD → P2P → 对象存储）、100 万+ 并发 actor。
- **控制面组件**: ateapi（gRPC 控制面）、atelet（节点 supervisor DaemonSet）、ateom（沙箱内 agent）、atenet（Envoy ext_proc 网关 + CoreDNS mesh，位置透明路由、按需唤醒）；CRD：WorkerPool、ActorTemplate、SandboxConfig；mTLS 全链路（SPIFFE/SPIRE）。
- **网络**: agent-aware networking mesh，Envoy ext_proc 检查入站流量 → 控制面唤醒目标 actor → mTLS 隧道动态路由 → 不活跃后休眠；CoreDNS 自定义插件解析 actor 域名。
- **安全**: 零信任默认拒绝网络隔离；经代理透明注入凭证，避免 Bearer token 进不可信沙箱；actor 独立加密身份；actor 间 A2A 调用策略。
- **沙箱**: 可插拔——gVisor（runsc）和 microVM（Kata Containers / Cloud Hypervisor，user-faultfd 内存按需分页）。
- **框架无关**: ADK、LangChain（远程工具执行）、Claude Code / CodeX（有状态 coding 环境）、MCP server hosting。
- **与 K8s/Knative/Kueue 的区别**: K8s 编排容器在机器上，Substrate 编排沙箱化 actor 在 worker 上；规模目标 O(100M) vs O(100K)；机制是 suspend/resume 而非 start/stop。Knative 是粗粒度容器冷启动（秒级、丢内存状态），Substrate 是 sub-pod 级内存 checkpoint/restore。直接互补 kagent（CNCF Sandbox），做其底层高密度有状态执行运行时。
- **竞品区分**: Firecracker / Cloud Hypervisor / gVisor / E2B / OpenShell / Daytona / Modal / Fly.io Machines / 各前沿实验室内部沙箱——多数要么是整 VM 供给、要么缺 K8s 原生编排；Substrate 独特在 K8s CRD + 高密度多路复用 + 跨 gVisor/microVM 的亚秒内存 suspend/resume。
- **申请背景**: 2026 年 5 月公开发布；1.8k+ star、307+ fork、90+ 贡献者（Google、NVIDIA、Solo.io、微软）；2026-08-06 与 CNCF TOC 主席 Karena Angell 完成 Sandbox Readiness Assessment；Slack #substrate-users/#substrate-dev；每周四社区会；计划 KubeCon North America（2026 年 11 月）官宣转交。
- **联系人**: zlammerts@google.com、thockin@google.com（K8s 联合创始人）、broyal@google.com、bentheelder@google.com。

## Issue 原文（节选关键段落）

> Agent Substrate delivers a performant, high density runtime environment for large scale agent deployments. The agent substrate control plane provides full lifecycle management for agent sandboxes, delivering sub-second agent resume/suspend operations, and allows heavy multiplexing of agents onto the same computer infrastructure. It supports multiple sandbox technologies including microVMs and gVisor, enabling consistent lifecycle operations for all sandbox types.

> At its core, Agent Substrate maps a larger set of "actors" (applications such as agents) onto a smaller set of ready "workers", relying on the fact that agent-like applications tend to be idle most of the time to achieve heavy multiplexing.

> Traditional Kubernetes architectures assume long-running, continuous container processes where Pod creation, scheduling, and image pulling take multiple seconds. In contrast, AI agents are bursty, stateful, and interactive—spending up to 90%+ of their time idle waiting for human prompts, tool outputs, or model responses.

> **30x–100x Density via Worker Multiplexing**: Decouples logical actors from physical pods, dynamically multiplexing thousands of idle agent instances onto a small pool of active worker pods.
