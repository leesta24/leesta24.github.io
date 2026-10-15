# Confucius4-R2T2：稳定前缀流式语音识别

- 作者 / 发布方：网易有道
- 原文：[链接](https://huggingface.co/netease-youdao/Confucius4-R2T2)
- Slack 发现依据：[分享/讨论](https://today-ai.slack.com/archives/C0A37E94PHD/p1790161375974989)
- 发布日期：未知
- 归档日期：2026-10-14（Asia/Shanghai）
- 标签：流式 ASR, 稳定前缀, 实时交互
- 保存形式：摘要与解读，不保存原文全文
- 阅读 / 核验状态：已阅读所引页面的相关正文；未运行代码或复现实验

## 一句话摘要

只提交稳定的转写前缀，使下游 Agent 可持续消费已确认文本。

## 主要要点

- 基于 Qwen3-ASR，结合稳定前缀数据、强制对齐和 token 级音频分段训练。
- 模型卡描述 append-only 输出与 80ms–2s 可配置 chunk，提供 vLLM 和 transformers 路径。
- 对 Agent 的价值是减少回改引起的重复推理与状态修正；这是工程适用性判断。

## 证据与局限

读取了模型卡概述与能力说明，未跑音频；Slack 中的 Mac/GGUF 部署说法本次未验证，不作为官方支持结论。

[模块索引](README.md) · [总索引](../../INDEX.md)
