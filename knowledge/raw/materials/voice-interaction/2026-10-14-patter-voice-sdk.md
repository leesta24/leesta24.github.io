# Patter：可替换供应商的电话 Agent 栈

- 作者 / 发布方：PatterAI
- 原文：[链接](https://github.com/PatterAI/Patter) · [链接](https://github.com/PatterAI/Patter/blob/main/README.md)
- 发布日期：未知
- 归档日期：2026-10-14（Asia/Shanghai）
- 标签：语音, 电话, Realtime, Fallback
- 保存形式：摘要与解读，不保存原文全文
- 阅读 / 核验状态：已阅读所引页面的相关正文；未运行代码或复现实验

## 一句话摘要

用统一 Python/TypeScript SDK 组合电话运营商、语音模型及 Agent loop。

## 主要要点

- 提供 Realtime、STT→LLM→TTS Pipeline 与 Hybrid 三种模式。
- 模型、转写、合成、实时引擎与运营商可替换，支持 Twilio、Telnyx、Plivo。
- README 描述通话中 LLM failover、工具调用、转接和 OpenTelemetry；提供本地模拟与模板。

## 证据与局限

SDK 开源不代表通话或模型服务免费；未实测打断、噪声环境、延迟或跨供应商故障恢复。

[模块索引](README.md) · [总索引](../../INDEX.md)
