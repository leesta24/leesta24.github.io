# NanoJev 与 Nimble：两种可研究的决策模型实现

- 作者 / 发布方：TianyuCodings；Bespoke Labs
- 原文：[链接](https://github.com/TianyuCodings/NanoJev) · [链接](https://github.com/bespokelabsai/nimble)
- 发布日期：NanoJev 更新 2026-09-20；Nimble 首发 2026-09-18
- 归档日期：2026-10-14（Asia/Shanghai）
- 标签：决策模型, 分类, 概率校准, 训练
- 保存形式：摘要与解读，不保存原文全文
- 阅读 / 核验状态：已读两仓库 README 的架构、能力、训练及限制章节；未运行

## 一句话摘要

分别从小模型决策头和候选 token 打分理解低延迟决策模型。

## 主要要点

- NanoJev：Qwen3-0.6B 加决策头；状态、问题和候选输入，输出 Choice/Boolean/Score 概率，不生成回答 token；提供游戏数据与训练流程。
- Nimble：Qwen3.5-9B 的 LoRA 方案，对允许的答案 token logits 打分；通过只改一个关键事实、让标签翻转的对比数据训练。
- Nimble 的 MLX 路径复用共享上下文，CUDA 路径按字段独立评分，不能把所有后端都描述为同样的并行实现。
- 适合探索路由、策略判断、裁判与低延迟控制；与通用 LLM 的任务规划可组合。

## 证据与局限

候选概率不等于业务正确率，需本域校准并提供无匹配选项。NanoJev 游戏评测和 Nimble 合成标签评测都较窄；未复现，也不能称为 Jev 内部架构的精确复刻。

[模块索引](README.md) · [总索引](../../INDEX.md)
