# Personal Agent Protocol：个人 Agent 的服务授权入口

- 作者 / 发布方：Sierra / Bret Taylor、Clay Bavor
- 原文：[链接](https://sierra.ai/blog/introducing-personal-agent-protocol)
- 发布日期：2026-10-06
- 归档日期：2026-10-14（Asia/Shanghai）
- 标签：OAuth, 授权, Agent 协议
- 保存形式：摘要与解读，不保存原文全文
- 阅读 / 核验状态：已阅读所引页面的相关正文；未运行代码或复现实验

## 一句话摘要

围绕用户授权与商家控制，统一个人 Agent 访问网站、API 和企业 Agent 的会话。

## 主要要点

- 从网站发现服务，先以访客身份启动；需要账户能力时再登录授权。
- 基于 OAuth，用户选择读写权限；网站、MCP/OpenAPI 接口及企业 Agent 可共享连续会话。
- 适合研究个人 Agent 如何代表用户行动，而不只解决工具调用格式。

## 证据与局限

公告称 v0.1 规范与参考实现将在后续发布；本次仅核验该公告，不把规划当作已发布实现。

[模块索引](README.md) · [总索引](../../INDEX.md)
