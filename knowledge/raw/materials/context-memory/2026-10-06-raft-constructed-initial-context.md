# Constructed Initial Context — Raft 冷唤醒成本降低 60%

- **作者**: stdrc（@istdrc，Raft 团队）
- **来源**: X 长文（X Article）
- **链接**: https://x.com/istdrc/status/2107182410559578355
- **发布日期**: 2026-10-06
- **归档日期**: 2026-10-06
- **标签**: Agent 基础设施, 上下文管理, 成本优化, Raft, Claude Code

## 一句话摘要

Raft 团队的文章：长期运行的 agent 因 prompt cache 一小时过期，每天要经历约 22 次"冷唤醒"，每次中位数重写 643K tokens；他们改用"构造式初始上下文"——cache 过期且 session 超 128K tokens 时直接抛弃旧 session 开新 session，用约 10K tokens 的独立 block（MEMORY.md 头、最近消息、近期文件、近期动作、唤醒消息原文）构造首输入；单次唤醒成本降 60%，每千请求成本降 29%，compaction 停滞降 73%，行为评判 60/63 为 good；已在 Raft Computer 1.0.40 全量 Claude Code agent 上线。

## 要点

### 问题
- Raft 上的 agent 是长期运行的：单个 runtime session 可持续数周，消息来了唤醒、处理完闲置。
- 实测（十几个 Claude Code agent、同一台机器、1M-token 模型、95 天）：请求中位数携带 558K tokens 上下文，session 峰值中位数 882K；111,015 次写 cache 的请求里只有 1 次用了非一小时寿命——prompt cache 一小时过期，所以几乎每次静默一小时后的唤醒都要把整个上下文重新写入 cache，只为读一条新消息。
- 结果：每天约 22 次 cold wake，每次中位数写 643K tokens；按列表价，70% 成本在 cache 读、25% cache 写、4% 输出，cold rewrite + compaction 合计占 22%。
- compaction 还很慢：每天约 9.5 次，1M-window agent 中位数 128 秒；一台 200K-window 模型的 agent 每天约 7 次，平均 318 秒，最长 1,048 秒。
- 作者的立场："Sessions that are never reset"——runtime（Claude Code/Codex）拥有 agent 的上下文，Raft 只拥有 agent 工作的世界（channels、threads、tasks、files），"channel management is the new context management"。

### 做法：Constructed Initial Context
- 规则极简：agent 闲置超过一小时 **且** session 超过 128K tokens → 抛弃旧 session，开新 session；否则照常 resume。一小时是 cache 确定过期的时间点（一小时内 resume 很便宜，读 cache 只要十分之一输入价；超一小时 resume 要重写整个上下文，而新 session 首请求约 50K tokens）。128K 阈值在 baseline 流量中覆盖 89.8% 的 cold wakes 与 98.6% 的重写 tokens。
- idle check：Raft 每 10 分钟检查闲置超 cache 寿命、session 超阈值、且无后台任务仍在运行的进程（通过 transcript 中任务起止配对计数判断），停掉这些进程，下一条消息走上面的决策。读不到 session 大小/闲置时间时一律 resume。
- 新 session 首个输入约 10K tokens（中位数 9.7K），由相互独立的 block 组成：
  1. agent 自己 MEMORY.md 的头部（约 4K tokens 上限）
  2. 旧 session 最近看到/发出的 Raft 消息，去重后最新 25 条
  3. 最近两小时触碰过的文件：从磁盘读新鲜内容；更老的只列名字（指针）
  4. 最近十二个动作，失败标 `!`、写操作标 `*`
  5. 唤醒消息原样不变
- 三个设计铁律（每个都来自被砍掉的方案）：输入**从不说** session 被重置了；**不列**未解决的问题清单；超过两小时没碰过的东西只以指针出现；敏感路径的文件不贡献内容。block 相互独立，改进视野只需增删 block。

### 被砍掉的方案（184 个真实 cold-wake 切点上用"接下来 40 个真实动作触碰实体的召回率"衡量）
- 只留 transcript 尾部：召回 53.5%/48.7%，但旧信息召回仅 13.2%/10.7%，faithfulness 被判 1.6–2.0/5（把陈旧内容当当前）——砍掉。
- 宣布重置、让 agent 自己查笔记：13 个新 session 全都先读笔记和任务列表而不处理消息（而 1,301 个全上下文 continuations 只有 8% 这样）——移除"宣布"。
- 提前列出过去失败：80% 的 continuations 不会早期触碰旧失败，列表变成隐藏待办清单——改为只用 `!` 标记。
- 包含触碰过文件的全文：500K 上下文中稀释的笔记，在 10K 里会显得像指令——老文件变指针。
- 两个教训：**ritual**——输入不再说 session 是新的之后，源于输入的仪式行为消失了；**dilution**——问题不是装什么，而是保持什么小，因为短输入里的每样东西都比在长上下文里更有分量。

### 收益（同一台机器，baseline vs now）
- 开新 session 的唤醒成本 **−60%**（21 次 wakes）；每 1,000 请求成本 −29%（请求量涨到 2.35 倍，按请求口径）
- cold wake 中位数写入 tokens：643K → 183K；每请求中位数上下文 558K → 342K；每 session 最大上下文中位数 882K → 354K
- 每 1,000 请求 compactions：1.44 → 0.48（−67%）；compaction 停滞秒数 192 → 52（−73%）
- 行为：三家模型供应商（Claude、GPT、Kimi）评判员盲审，参照是功能上线前录制的 1,301 个真实闲置边界 continuations；新 session 行为 "good" 裁决 **60/63**。16/21 wakes 首动作处理了唤醒消息；9 个 ritual 全部来自 agent 自身 MEMORY.md 规则、无一归因于 constructed input；旧失败早回归 8 次（参照 20%），其中 6 次是 rate-limit 锁死后恢复中断工作；无人重做已成功的动作（参照 8%）。
- 第二台机器（三台 agent）结果一致：26 次 wakes 中位数省 59%，25/26 首动作对准消息，无 ritual，77/78 裁决 good。残留的 compaction 都发生在长工作段中间（中位数上下文 967K），那里没有闲置时刻可重启。

### 影响与下一步
- 已在 **Raft Computer 1.0.40**（9 月 29 日发布）上线；1.0.40 及以上的所有 Claude Code agent 全部启用，旧版继续 resume；其他 runtime 目前仍一律 resume。
- 下一步：扩展到其他 runtime（今天只有 Claude Code 暴露规则所需的 session 大小与闲置时间；Codex 每天约 compaction 54 次，多在工作中段）；在大小上限处也重启（replay baseline 流量显示 256K 上限可再省 43–49%）。
- 金句收尾："Channel management is the new context management still holds, and constructed initial context is where the two meet."
