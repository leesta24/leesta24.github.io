# XERJ：给 AI agent 的本地搜索（autoindex + reference coding）

- **标题**: XERJ
- **作者/发布方**: xerj-org（官网 xerj.org）
- **原文 URL**: https://github.com/xerj-org/xerj
- **发布日期**: 仓库建于 2026-06-30（持续发布，归档时 311 个 release）
- **归档日期**: 2026-10-19
- **标签**: 检索, 本地搜索, Agent 工具, MCP, Elasticsearch 兼容, Rust, RAG, Agent Memory, Apache-2.0
- **保存形式**: 摘要（基于 README 全文阅读）
- **阅读/核验状态**: 已读 README 全文；性能数据为发布方自测，未独立验证

## 一句话摘要

XERJ 是 Rust 写的单静态二进制本地搜索引擎：一条 `xerj autoindex <文件夹>` 自动索引代码、文档、日志、PDF、SQLite、邮件等，让 coding agent 查索引拿精确片段而不是 grep 逐文件读（号称省 40x tokens）；兼容 Elasticsearch REST API（conformance 1366/1369），原生暴露 MCP server（13 个 tools），附带 agent memory 命名空间和 Jev 重排集成。

## 主要要点

- **解决的问题**: agent 烧 context window 读文件（WordPress core PHP 约 5.2M tokens = 26 个完整上下文窗口）；grep 只能定位行，判断仍需打开整文件。查索引每次提问只花 KB 级 tokens。
- **autoindex**: 零配置，自动嗅探文件类型、每个数据集建一个索引；代码经 tree-sitter 解析，带 symbol 和行号（AST-aware，不是纯文本）；重索引增量（内容 hash 不变跳过解析）。
- **核心用例 reference coding**: agent 把任务最接近的开源项目 clone 下来索引，先检索"别人怎么解决的"再写自己的代码。发布方对照实验（8 任务、4 语言、每臂 16 runs、`claude -p` 真实 token 计数）：XERJ 输出 tokens 9,982 vs grep 26,477 vs 纯记忆 260,916，同等 16/16 solve rate；日常开发用户报告约 5x。价值受记忆影响：私有/内部/冷门/训练截止后代码上赢，已被模型记住的流行库上中性甚至有害。
- **Jev 集成**（与知识库已有 TypeSafe Jev 卡片相关）:
  1. 可选 rerank：`_search` 加 `"rerank": {}` 把 top 结果送 Jev 重排，FiQA nDCG@10 0.24→0.36；需配 key，文档明示会把结果文本发到 TypeSafe 服务器；
  2. 本地 `/_decide`：基于已标注样本的历史投票（`xerj-history-vote-1`），数据不出本机。
- **MCP**: `xerj mcp` 即 stdio server（13 tools：search / semantic / vector / hybrid、memory store-recall、second-brain 图链接、code_search 等）；`xerj init` 一键接入 Claude Code / Cursor。
- **Agent memory**: `/_memory/{namespace}` 按语义跨会话召回 + second brain 文档关系图。
- **ES 兼容与性能**: 实现 ES REST API（indices、search、aggs、kNN、scroll 等），Kibana 和官方客户端直连；对 ES 8.13.4 实测 55 胜 26 平 4 负，ingest 吞吐 1.72x，磁盘占用小 1.61x；4 个败项都是高并发写入下的读 p99，发布方如实列出。
- **安全模型**: `--insecure` 是明确的信任边界（无 TLS、无 auth，调用者即超管），默认只绑 127.0.0.1；非 insecure 启动默认开 auth。
- **社区机制**: 加入方式 = 跑起来 + 交一份 field report（`user-feedback/` 下一个 markdown PR，CLA 豁免）；人类和 agent 都欢迎。
- **仓库元数据**（归档时）: star 8,721，fork 470，commit 3,385，Apache-2.0。

## 适用场景

- 给 coding agent 配本地代码库索引，替代"grep + 读整文件"的工作流
- Agent 长期记忆（语义召回 + 关系图）
- 轻量 ES 替代：单二进制、无 JVM 部署

## 相关资料

- [Jev-as-a-Judge for Agent Evaluations](../evaluation/2026-10-07-jev-as-a-judge-for-agent-evaluations.md) — TypeSafe Jev 决策模型
- [NanoJev 与 Nimble：两种可研究的决策模型实现](../decision-models/2026-10-14-nanojev-nimble.md)
- [Turbopuffer v3：为什么不再以向量索引作为主索引](2026-10-14-turbopuffer-vector-primary-index.md) — 向量索引架构取舍对照
