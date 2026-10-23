# Amp Self-Hosted Orbs：把 agent 执行环境搬进自己的基础设施

- **标题**: Self-Hosted Orbs
- **作者/发布方**: Amp（ampcode.com）
- **原文 URL**: https://ampcode.com/news/self-hosted-orbs
- **发布日期**: 2026-10-22
- **归档日期**: 2026-10-22
- **标签**: Agent 基础设施, 沙箱, 自托管, Amp, 执行环境, Kubernetes
- **保存形式**: 摘要（基于原文全文阅读）
- **阅读/核验状态**: 已读原文全文

## 一句话摘要

Amp 把其云端 agent 执行环境 Orbs（每个 thread 一个）开放自托管：在自己基础设施里跑 `amp orb provider`，它主动外连 Amp 接收 spawn/pause/delete 请求，再分发给你自备的 dispatch 程序（环境变量契约）去真正启停机器——Docker、E2B、K8s、Modal、Daytona 等都能接，Amp 只定义契约、不管你的实现。

## 主要要点

- **背景**: Orbs 是 Amp 托管的 agent 运行环境（每个 thread 一个 orb，在里面 clone 仓库、跑 setup、执行 agent 工具）。自托管版让你用自己的算力复刻这个体验。
- **对算力的定性要求**: 快速启动新机器、同样快速地休眠与恢复、能长期保留、能 scale to zero（大量休眠 orb 不产生负担）。
- **架构（控制面外置、执行面自备）**:
  1. 在你的基础设施内运行 `amp orb provider ./dispatch.sh`，provider 主动向 ampcode.com 建立连接并等待事件——**不需要任何入站端口**；
  2. Amp 按 thread 发送 spawn / pause / delete 请求；
  3. provider 把请求分发给用户提供的任意程序，契约是环境变量：`ORB_OPERATION`（spawn/pause/delete）、`ORB_ID`、`ORB_TOKEN`、`ORB_IMAGE`、`AMP_URL`；
  4. 机器起来后在其中运行 `amp orb bootstrap`（带 ORB_TOKEN），orb 反向连回它所属的 thread。
- **官方示例后端**: Docker、E2B、Apple containers、Modal、Vercel Sandbox、Daytona、exe.dev，各给完整 dispatch 脚本；Kubernetes 有官方 Helm chart（GKE/EKS/AKS），paused orb 存入快照存储、可在另一个 worker 节点恢复，免写 dispatch。
- **实现差异由后端吸收**: 如 Modal 没有 pause，示例用"快照文件系统 + terminate"模拟 pause、从快照恢复模拟 resume；Vercel 用 persistent sandbox + snapshot 管理。
- **镜像**: 可用 Amp 预置的 `ORB_IMAGE`（含 Amp CLI 与依赖），也可换任意 Linux 镜像，只要能在里面启动 `amp orb bootstrap`。
- **Amp 自己的劝退**: 标题直言 "You Probably Shouldn't Self-Host Orbs"——为受合规约束（代码运行位置）、需访问内网或需定制硬件的企业而建；接口开放的代价是 Amp 只支持契约的自己那一端，不支持你接的每种基础设施。
- **定价**: 个人与团队免费；企业自 2026-10-29 起按标准 orb 定价收费（此前全 workspace 免费）。

## 适用场景

- 企业把 coding agent 执行环境落在自有云/内网的设计参考
- "控制面托管 + 执行面 BYOC" 的沙箱接口设计：一个三操作（spawn/pause/delete）+ 环境变量的最小契约

## 相关资料

- [Sandbox Agent Substrate — CNCF Sandbox 申请（Issue #523）](2026-10-01-agent-substrate-cncf-sandbox-523.md) — 另一条 agent 沙箱运行时路线（K8s 高密度 + 快照 suspend/resume）
- [Netlify：从 V8 isolates 到 Firecracker MicroVM](2026-10-14-netlify-microvm-edge-functions.md) — 边缘执行环境的快照恢复思路对照
