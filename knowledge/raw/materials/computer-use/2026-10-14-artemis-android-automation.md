# Artemis：Android 操作、验证与历史压缩

- 作者 / 发布方：Google / Artemis 项目
- 原文：[链接](https://github.com/google/artemis) · [链接](https://github.com/google/artemis/blob/main/README.md)
- 发布日期：未知
- 归档日期：2026-10-14（Asia/Shanghai）
- 标签：Android, Computer Use, MCP, 验证
- 保存形式：摘要与解读，不保存原文全文
- 阅读 / 核验状态：已阅读所引页面的相关正文；未运行代码或复现实验

## 一句话摘要

将真实 Android 设备操作接入 Agent，并区分快速执行与规划验证。

## 主要要点

- 结合无障碍树、OCR 和视觉定位；元素定位失败时使用坐标或视觉回退。
- Flash 为观察—行动循环；Pro 包含 Planner、Operator、动作前检查与只读 Checker。
- 旧截图转换为视觉摘要，完成步骤压缩为可检索历史；MCP 可返回设备状态和诊断信息。
- README 报告 AndroidWorld 99%+ 完成率；iOS 扩展仍列在路线图。

## 证据与局限

只读 README，未检查全量源码或跑实机；基准成绩不能外推到任意应用。

[模块索引](README.md) · [总索引](../../INDEX.md)
