# Raft、OpenMuse、nanoMuse：个人 Agent 架构参考

- 作者 / 发布方：Botiverse；CopilotKit；nano-muse
- 原文：[链接](https://github.com/botiverse/raft-source) · [链接](https://github.com/CopilotKit/openmuse) · [链接](https://github.com/nano-muse/nanoMuse)
- 发布日期：未知；以 2026-10-14 README 为阅读版本
- 归档日期：2026-10-14（Asia/Shanghai）
- 标签：Personal Agent, 持久执行, 多端, 自托管
- 保存形式：摘要与解读，不保存原文全文
- 阅读 / 核验状态：已读 Raft README、OpenMuse 架构与持久化章节、nanoMuse README；未运行

## 一句话摘要

三个项目分别提供协作工作区、持久任务应用和跨设备执行的参考。

## 主要要点

- Raft：server、daemon、computer runtime 分层；Agent 以独立身份参加频道和任务，daemon 代理凭证。该仓库是发布快照镜像，采用 FSL source-available 许可证。
- OpenMuse：API、持久任务 worker、浏览器 worker 和可选 Linux 容器；SQL leases 恢复工作，外部写入结果不确定时避免隐藏重试。
- OpenMuse 是 alpha；所有模式仍依赖 CopilotKit Intelligence 的会话服务，不是完全离线的一体化系统。
- nanoMuse：各设备运行自己的 Agent，经 relay 交换对话和任务；用户可编辑记忆文件，支持后台目标与例行任务。README 明确 iOS 不具备系统级屏幕操作能力。

## 证据与局限

只做 README 架构比较，未部署或源码审计；许可证与外部依赖各异。Raft 原有冷唤醒文档是单项上下文策略，本卡片归档的是整体项目架构。

[模块索引](README.md) · [总索引](../../INDEX.md)
