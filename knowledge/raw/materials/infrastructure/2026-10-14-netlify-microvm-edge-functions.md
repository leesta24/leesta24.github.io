# Netlify：从 V8 isolates 到 Firecracker MicroVM

- 作者 / 发布方：Netlify / Jake Champion、Aarthy Chandrasekhar、Ivan Zarea
- 原文：[链接](https://www.netlify.com/blog/edge-functions-firecracker-microvms/)
- 发布日期：2026-09-29
- 归档日期：2026-10-14（Asia/Shanghai）
- 标签：沙箱, MicroVM, 冷启动
- 保存形式：摘要与解读，不保存原文全文
- 阅读 / 核验状态：已阅读所引页面的相关正文；未运行代码或复现实验

## 一句话摘要

通过请求路由、镜像缓存和快照恢复协同降低边缘执行开销。

## 主要要点

- 请求携带运行时、平台和用户代码镜像规格，规格与站点信息共同确定服务身份。
- Rendezvous hashing 保持缓存亲和性，热点超过阈值后扩散到多节点；EROFS 与内存映射减少加载工作。
- 官方报告热调用 p50 约 5–6ms；冷调用平均约 9ms。将 5–6ms 描述为启动延迟不够准确。

## 证据与局限

数据属于特定边缘函数工作负载，不可直接视为通用 Agent 沙箱的启动性能。

[模块索引](README.md) · [总索引](../../INDEX.md)
