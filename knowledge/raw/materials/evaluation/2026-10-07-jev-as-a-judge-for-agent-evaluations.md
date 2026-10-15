# Jev-as-a-Judge for Agent Evaluations

- **作者**: elvis（@omarsar0，认证账号；文章称与他的研究型 agent 合写）
- **来源**: X 长文（X Article）
- **链接**: https://x.com/omarsar0/status/2107472222398886011
- **发布日期**: 2026-10-06
- **归档日期**: 2026-10-07
- **标签**: LLM 评测, LLM-as-Judge, Agent 评测, Jev, TypeSafe AI

## 一句话摘要

elvis 的长文：介绍把 TypeSafe AI 的新决策模型 Jev 用作 agent 评测的 LLM 裁判——裁判不看最终回复、而看整条轨迹（请求、规则、所有工具调用与结果、最终回复），把评判标准写成带概率选项的问题；核心收获是 Jev-as-Judge 能提升裁判的可靠性和一致性，对生产级裁判/验证器/监控系统很重要。

## 要点

- **动机**: 手动评审无法扩展；agent 评测的难点是 agent 可能"听起来正确但实际失败"（如退款工具超时却声称已处理）；Jev 是 TypeSafe AI 为决策场景打造的模型，不写长评、而从预定义答案选项中选择并给出各选项概率。
- **看轨迹不看最终回复**: 只看最终回复的裁判只能听信 agent；读轨迹的裁判能把回复与实际行为（各工具调用及结果）核对。
- **把标准写成问题**: 答案选项要写成可验证的具体标准；TypeSafe 的 answer types 页面和 confidence guide 文档了答案类型与概率计算方式（含 yes/no 问题类型 Noul）。
- **Playground 示例**: 退款场景三问，三个运行的最终回复几乎相同、只有工具结果不同——工具结果决定裁决；policy box 按 80% 阈值把 yes 概率转成决策（≥80% 通过、≤20% 失败、中间送人工复核）；"未知结果"案例按政策正确但 Jev 只有约 50% 置信，故送复核。
- **先验证再信任**（六条清单）: 收集含超时和违规的真实轨迹；人工标注小样本；对比 Jev 裁决与人工标签；重复运行查稳定性；比较 agent 版本时固定问题和阈值；不确定/高风险案例送更强模型或人工。一刀切的事实性检查用代码即可（如"必须先调用 lookup_order"），Jev 留给需要阅读理解的问题。
- **论文依据**: "JEV-as-a-Judge: Accept When Confident, Escalate When Unsure" (Li et al., 2026)——accept-or-escalate 模式：有把握的 Jev 裁决直接接受，其余送更强推理模型；该设置比单用 GPT-6 准确率高 0.9 个百分点，成本只有 41%；证据直接可读的场景表现最好（与 GPT-6 相差 3 个百分点内，成本仅 0.36%），但在需要数学/代码/逻辑的答案、刻意误导风格的对比、无参考答案的写作上落后；建议在自己的数据上验证阈值。
- **完整评测**: playground 一次只评一个轨迹；完整 lab 里生成轨迹、优化问题、对照人工标签验证 Jev、修复 agent 并度量变化。
- **配套资源**: 交互式指南 / playground / lab：https://academy.dair.ai/labs/jev-as-a-judge-for-agent-evals
- **作者跟帖**: 正在做 Jev 与其他 decision API 的 benchmark 对比；提到 OpenAI Decisions API 刚上线、是做详细对比的好时机，还将比较 Perplexity 的 Decisions API。
