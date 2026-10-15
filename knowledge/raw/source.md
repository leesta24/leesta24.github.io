# 优质信息源目录

维护日期：2026-10-14。用途：用户手动要求扫描时，Agent 从此清单选择来源，阅读有价值的新内容，按 [AGENTS.md](AGENTS.md) 归档到知识模块。已收藏文章在 [INDEX.md](INDEX.md)，不在这里重复维护。

## 使用方式
- 按用户指定的范围扫描；未指定时默认最近 14 天并说明。优先相关主题，不要求每次遍历全部来源。
- 下列入口来自此前分享和已有归档。**未注明已验证的入口，其当前可访问性、更新入口和 RSS 仍待验证；下方记录本次实际阅读范围**；没有承诺自动采集或无遗漏覆盖。
- 博客看文章列表再读原文；GitHub 看 Release、README 和设计文档的重要变化，忽略常规 commit 噪声；X 用于发现原始文章/代码，读不到长文则注明。
- 阅读重点：具体问题、技术方法、工程取舍、代码与实验依据。普通融资、营销和无新增信息的转发不收。
- 同一篇内容跨渠道出现只归档一次；对照 INDEX.md 和 materials/ 中的原文链接、标题检查。
- 来源可直接增删、补充阅读说明。验证后在本表的依据/状态处写明检查日期、可用入口或失败原因，不需要独立状态系统。
- Slack 仅用于最初发现这些来源，不是后续扫描的数据源。本目录保存在 GitHub，没有额外 SaaS 依赖。

## 长期发布源与作者
同一发布方的多个渠道合并一行。产品来源只筛有技术细节、工程实践或有价值实测的内容。

| 来源 | 入口 | 关注主题 | 怎么阅读/整理 | 发现依据 / 阅读状态 |
| --- | --- | --- | --- | --- |
| humans& | [入口](https://persimmon.humansand.ai/blog/) | 用户模拟、交互评测 | 博客列表 → 原文 | 此前分享 Persimmon；2026-10-14 已读研究预览与评测方法，未运行验证 |
| Sakana AI | [入口](https://x.com/SakanaAILabs) | 模型编排与研究 | 动态 → 官方研究/代码 | 此前编排模型分享 |
| Qwen | [入口](https://qwen.ai/blog) / [入口](https://x.com/Alibaba_Qwen) | 全模态、实时交互、工具调用 | 博客/发布动态 → 技术文档 | 此前 Omni 与音频分享 |
| OpenAI | [入口](https://developers.openai.com/) / [入口](https://x.com/OpenAIDevs) | 工具调用、上下文与 Agent 工程 | 发布动态 → 开发文档 | 此前 Programmatic Tool Calling 分享 |
| Langfuse | [入口](https://langfuse.com/) | 评测、可观测性、用户信号 | 定位博客 → 筛选技术文章 | 此前用户信号评测分享；2026-10-14 已读 Academy Capturing signals，未运行验证 |
| Coder | [入口](https://coder.com/blog) | 云端 Agent、自托管执行 | 文章列表 → 原文 | 此前 Agent Relay 分享 |
| RadixArk / Miles | [入口](https://x.com/radixark) | RL、后训练与 Rollout | 动态 → 博客/代码 | 此前 Miles 分享 |
| Meta Research | [入口](https://research.meta.ai/blog/) | Agent、多模态与交互技术 | 博客列表 → 原文 | 此前 Muse 技术文章分享 |
| Yandex | [入口](https://medium.com/yandex) | 搜索模型与 Agentic Search | 文章列表 → 原文 | 此前 Alice AI Search 分享 |
| Databricks | [入口](https://www.databricks.com/blog) | 检索、数据库与 Agent 数据层 | 博客列表 → 相关技术文章 | 已有 Lakebase 资料 |
| claude.dev | [入口](https://claude.dev/blog/) | 评测与 Agent 工程 | 博客列表 → 原文；发布方身份需核验 | 已有评测设计资料 |
| Uber Engineering | [入口](https://x.com/UberEng) | MCP、工具治理、Agent 基础设施 | 动态/长文 → 工程文章 | 已有 MCP Gateway 资料 |
| Harrison Chase | [入口](https://x.com/hwchase17) | Memory、Harness、工程观点 | 作者动态 → 原始长文 | 此前 Memory 讨论 |
| Noah Shinn / Instinct | [入口](https://x.com/noahrshinn) | 主动执行、记忆、协作 | 动态 → 有技术细节的发布 | 此前 Instinct 分享 |
| Ashwin Gopinath | [入口](https://x.com/ashwingop) | 长期状态与记忆分析 | 作者动态 → 分析文章 | 此前记忆架构分析 |
| Rohan Adwankar | [入口](https://rohanadwankar.github.io/posts/platforms.html) | 产品架构分析 | 从已知文章导航至文章列表 | 此前架构文章；持续入口待定位 |
| mthli | [入口](https://mthli.xyz/) | 知识沉淀与开发工作流 | 博客列表 → 原文 | 此前 Git Knowledge Loop |
| Matt Pocock | [入口](https://github.com/mattpocock/skills) | Skills、工作流设计 | README/变更 → 相关 Skill | 此前 loop-me；2026-10-14 已读 loop-me SKILL.md，未运行验证 |
| elvis / DAIR.AI | [入口](https://x.com/omarsar0) / [入口](https://academy.dair.ai/labs/jev-as-a-judge-for-agent-evals) | 评测与决策模型 | 作者动态 → 技术长文/lab | 已有 Jev-as-a-Judge |
| Josh Rosen | [入口](https://x.com/JoshARosen) | 持久执行与 Agent 架构 | 作者动态 → 原始长文 | 已有 Pi Durable 对比 |
| stdrc / Botiverse | [入口](https://x.com/istdrc) / [入口](https://github.com/botiverse) | 上下文、Raft、Agent Runtime | 作者长文/组织仓库 → 设计文档 | 已有 Raft 与 OAR |
| Town | [入口](https://www.town.com/) / [入口](https://x.com/TownAI) | 协作、实时交互、长期上下文 | 产品更新 → 技术解释与实测 | 此前产品分享 |
| Poke | [入口](https://poke.com/docs/api) | 消息驱动与任务接入 | 文档导航/更新 → 接口变化 | 此前 API 分享 |
| Muse | [入口](https://x.com/Muse) | Skills、Connectors、目标驱动 | 官方动态 → 技术材料 | 此前产品分享 |
| Kernel | [入口](https://www.kernel.sh/) | 浏览器运行环境与会话 | 定位文档/博客 → 技术更新 | 此前浏览器基础设施分享；2026-10-14 已读官网能力说明，未运行验证 |
| Linq | [入口](https://linqapp.com/imessage-api) | 通讯接入与会话事件 | 文档/产品更新 → 能力变化 | 此前 iMessage API 分享；2026-10-14 已读产品页与 FAQ，未运行验证 |
| Vyra | [入口](https://www.vyraagi.com/) | 目标状态、记忆整理 | 有技术说明或更新时阅读 | 此前 Personal AI 分享 |
| Assistant Benchmark | [入口](https://assistantbenchmark.com/) | 任务、评分规则与实测 | 方法/用例/运行记录；不只看排名 | 此前评测分享；2026-10-14 已读用例页代表性条目，未运行验证 |
| Unipat | [入口](https://unipat.ai/) | 真实环境评测 | 定位方法/案例 → 具体证据 | 此前评测产品分享 |
| Netlify Engineering | [博客](https://www.netlify.com/blog/) | MicroVM、边缘计算、缓存与调度 | 筛选架构文章，区分热调用和冷启动指标 | Slack 10 月 1 日分享；2026-10-14 已读 Edge Functions 文章；RSS 未验证 |
| Turbopuffer | [博客](https://turbopuffer.com/blog) | 检索、存储布局、索引 | 读设计演进及实验条件，区分路线图和已上线 | Slack 10 月 1 日分享；2026-10-14 已读 v3 架构文章；RSS 未验证 |
| Sierra | [博客](https://sierra.ai/blog) | Personal Agent 协议、授权、服务互操作 | 优先协议说明与参考实现，跟进规范发布状态 | Slack 10 月 7 日分享；2026-10-14 已读 PAP 公告；持续入口未扫描 |

## 项目观察清单
具体项目用于跟踪重要版本与设计变化，不等同于订阅作者的所有内容。默认读 README、Release、设计文档；没有新信息则跳过。未标注阅读状态的入口仍待首次扫描验证。

| 项目 | 入口 | 重点 |
| --- | --- | --- |
| SoL-Pi | [入口](https://github.com/NVlabs/SoL-Pi) | 上下文、自进化 |
| Ego Lite | [入口](https://github.com/citrolabs/ego-lite) | 浏览器 Agent |
| Antiproton | [入口](https://github.com/botiverse/antiproton) | 云端 Agent 架构 |
| Raft | [入口](https://github.com/botiverse/raft-source) | 多人协作；注意其许可证；2026-10-14 已读 README，FSL source-available，未运行验证 |
| OAR | [入口](https://github.com/botiverse/oar) | Harness 统一接口 |
| a13n | [入口](https://github.com/converge-ai-labs/agent-foundation) | 框架与托管运行时 |
| OpenAgentCore | [入口](https://github.com/MiniMax-AI/OpenAgentCore) | 自托管 Agent |
| Agent Substrate | [入口](https://github.com/agent-substrate/substrate) | 沙箱与调度 |
| NanoJev | [入口](https://github.com/TianyuCodings/NanoJev) | 轻量决策；2026-10-14 已读 README，未运行验证 |
| Nimble | [入口](https://github.com/bespokelabsai/nimble) | 决策模型；范围待核验；2026-10-14 已读 README 架构与训练章节，未运行验证 |
| Artemis | [入口](https://github.com/google/artemis) | Android 自动化；2026-10-14 已读 README，未运行验证 |
| Phone Harness | [入口](https://github.com/ShawnPana/phone-harness) | 手机操作 |
| Patter | [入口](https://github.com/PatterAI/Patter) | 电话能力接入；2026-10-14 已读 README，未运行验证 |
| OpenMuse | [入口](https://github.com/CopilotKit/OpenMuse) | Agent 产品；范围待核验；2026-10-14 已读 README 架构及持久化章节，未运行验证 |
| Confucius4-R2T2 | [入口](https://huggingface.co/netease-youdao/Confucius4-R2T2) | 流式语音；2026-10-14 已读模型卡概述，未运行验证 |
| WeMM-Embedding | [入口](https://github.com/Tencent/WeMM-Embedding) | 多模态检索 |
| Omni-Interaction-Agent | [入口](https://omni-interaction-gander.github.io/Omni-Interaction-Agent/) | 全模态交互 |
| REA | [入口](https://github.com/morluto/rea) | 逆向工具 |
| nanoMuse | [入口](https://github.com/nano-muse/nanoMuse) | 跨设备 Agent、relay、端侧操作；2026-10-14 已读 README，未运行 |

## 待补全的来源
- TypeSafe 创始人：[已分享的思考笔记](https://docs.google.com/document/d/1G61uUB0FifUnmmrPzFQojZ3KpczYKmXGpgEXDJ2l_Zg/edit)。主题是 KV cache、工具发现、上下文构造；尚未确认作者的持续发布入口，暂不当作更新源。2026-10-14 仅取得标题和 Slack 摘录，未读到 Docs 正文。
- Manus 评测作者 Hoodie：[已分享文章](https://mp.weixin.qq.com/s/2CXssAsQMxdPn_5aLcaijw)。需核实原作者与持续发布渠道，不能把转载账号当官方来源。
- 非官方系统提示词/Skills 档案只作为按需参考，不能据此确认产品完整实现，也不作为默认高优先级来源。

## 单次整理提示
读取用户关心的主题与时间范围，选择相关来源。打开候选原文，筛出有具体技术方法、代码、实验或重要产品机制的内容。
先检查已归档标题和原文 URL，重复跳过，重大更新修改原卡片。
用中文归纳“问题、方法、证据、局限”，区分发布方宣称和自己核验。
保存到最合适的模块；没有合适模块就依照 AGENTS.md 新建，并同步索引。
最后报告新增、更新、跳过及无法访问的来源，不把只看到标题的页面说成已阅读全文。

## 本次访问限制（2026-10-14）

这是用户指定的一次 Slack 历史回扫，不改变 Slack 不作为默认日常数据源的约定。成功阅读仅表示对应文章或 README 可读，不表示整个站点、RSS、性能或产品能力均已验证。

- [Poke proactive 提示词线索](https://gist.github.com/burritosoftware/f7b240a001ccbac474859846c4bb229b)：本次无法读取。
- [Manus 评测文章](https://mp.weixin.qq.com/s/2CXssAsQMxdPn_5aLcaijw)：本次无法读取。
- [Harrison Chase 记忆观点](https://x.com/hwchase17/status/2099858455079026817)：X 正文无法读取。
