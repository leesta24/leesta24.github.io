# DeepInfer：DeepSeek 官方开源推理框架

- **标题**: DeepInfer: High-performance, large-scale inference framework for DeepSeek models
- **作者/发布方**: DeepSeek-AI
- **原文 URL**: https://github.com/deepseek-ai/DeepInfer
- **发布日期**: 2026-10-16（仓库创建）
- **归档日期**: 2026-10-21
- **标签**: LLM 推理, DeepSeek, MoE, 投机解码, vLLM, Apache-2.0, 昇腾
- **保存形式**: 摘要（基于 README 全文阅读）
- **阅读/核验状态**: 已读 README 全文；性能图为发布方自测，未独立验证

## 一句话摘要

DeepSeek 支撑其大规模线上服务的推理框架开源版（离线推理部分）：基于 vLLM 构建，集成 FlashMLA / DeepGEMM / DeepEP 等自研 kernel、Attention DP + MoE EP+EPLB 并行、DSpark 投机解码与置信度调度验证、SWA 有界回放和 batch-invariant 确定性采样；仅支持 DeepSeek-V4.1-Flash，硬件限 NVIDIA SM100 与华为昇腾 950。

## 主要要点

- **定位**: DeepSeek 生产推理栈的开源释放，本次只给 offline inference；KV cache 系统、Prefill/Decode 分离、DP replica 负载均衡未包含（README 明说 VE/PD 分离"大部分引擎功能已实现"但不在本次发布内）。
- **支持模型**: 仅 DeepSeek-V4.1-Flash（默认 checkpoint `DeepSeek-V4.1-Flash-1017`）。
- **优化 kernel**: FlashMLA、DeepGEMM、DeepEP、TileKernels、DeepSelect 及自研 TileLang kernel。
- **并行策略**: Attention 侧 DP / balanced CP；MoE 侧 EP + EPLB（专家并行负载均衡）。
- **DSpark 与置信度调度验证**: 用 draft tokens 加速解码，按置信度估计调度验证；环境变量 `DEEPINFER_ENABLE_MTP_VARLEN=1` 开启，`DEEPINFER_USE_NEXTN_DECODE` 控制最大 draft 长度（默认 5）。
- **Decoder SWA bounded replay**: prefill 只回放有界后缀以减少计算（保留后缀须覆盖 SWA 窗口 + 最大回溯长度）。
- **异步调度**: CPU batch 调度与设备执行重叠（zero-overhead batch scheduler），默认开启。
- **Batch-invariant 与确定性采样**: 结果不随 batch 组合变化；固定 `seq_seed` 可复现输出（仅 NVIDIA）。
- **结构化输出**: regex / JSON schema / EBNF 约束，`SamplingParams` 传 `so_args`。
- **硬件与构建**: NVIDIA SM100（CUDA 13）与华为昇腾 950（CANN 9.2）双平台；Linux、GCC ≥ 13、Python 3.12，源码构建。
- **性能（发布方自测）**: prefill 测 4×SM100，decode 测 64×SM100（各一个 scale-up domain），图表给出吞吐-延迟曲线，复现脚本 `run_sweep.sh`。
- **血统**: 主要基于 vLLM 构建，另借鉴 SGLang 与 TensorRT-LLM。
- **仓库元数据**（归档时）: star 14,279，fork 1,356，commit 仅 3（典型一次性开源 dump），Apache-2.0。

## 适用场景

- 研究 DeepSeek 线上推理栈的工程实现（kernel 选型、并行策略、投机解码调度）
- 大规模 MoE 模型推理优化参考
- 昇腾平台 LLM 推理部署参考

## 相关资料

- 暂无（模型推理与服务模块首篇）
