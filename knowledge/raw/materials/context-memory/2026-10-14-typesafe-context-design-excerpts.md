# TypeSafe coding agent 思考：KV cache、工具发现与上下文重建（摘录）

- 作者 / 发布方：作者身份未独立确认
- 原文：[链接](https://docs.google.com/document/d/1G61uUB0FifUnmmrPzFQojZ3KpczYKmXGpgEXDJ2l_Zg/edit)
- 发布日期：未知
- 归档日期：2026-10-14（Asia/Shanghai）
- 标签：上下文, KV cache, 工具发现, 路由
- 保存形式：摘要与解读，不保存原文全文
- 阅读 / 核验状态：部分可读：仅核对现有摘录，原文全文待读

## 一句话摘要

从缓存依赖重新审视小模型路由、工具 schema 和通用 compaction 的取舍。

## 主要要点

- 线程摘录提出：切到小模型再切回大模型可能因重新处理上下文而更贵。
- 预先放入所有工具定义会占用上下文；可用简短能力描述和按需完整 schema 分层发现。
- 统一压缩状态假定未来任务需要同一份信息；按当前任务构造上下文可能更有针对性。

## 证据与局限

Google Docs 只返回标题，未取得正文；以上仅归纳 现有原文摘录，属于设计观点，不是已验证性能结论。

[模块索引](README.md) · [总索引](../../INDEX.md)
