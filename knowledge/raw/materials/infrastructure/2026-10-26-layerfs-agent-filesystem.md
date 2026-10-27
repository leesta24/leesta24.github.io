# LayerFS：给 agent 的"临时工作区 + 永久共享历史"文件系统

- **标题**: LayerFS — Ephemeral Workspaces, durable shared history
- **作者/发布方**: Ephemeral-AI-Lab（layerfs.ai）
- **原文 URL**: https://github.com/Ephemeral-AI-Lab/layerfs
- **发布日期**: 仓库建于 2026-08-10（归档时版本 1.1.0）
- **归档日期**: 2026-10-26
- **标签**: Agent 基础设施, 文件系统, FUSE, 沙箱, 内容寻址, 去重, SQLite, MIT
- **保存形式**: 摘要（基于 README 全文阅读）
- **阅读/核验状态**: 已读 README 全文；性能数据为发布方自测，未独立验证

## 一句话摘要

LayerFS 是为 agent 设计的 FUSE 文件系统：每个 agent 在共享提交历史之上挂载一个完整可写的 Workspace（无需复制基底），并行工作、把改动以去重 checkpoint 形式提交，随后分支、回滚或合并——核心是"算力临时存在，历史永久共享"，现通过 DeepSeek Harness 的 dsh-layerfs 插件落地。

## 主要要点

- **六大核心想法**:
  1. Ephemeral Computing：计算只在命令运行时存在；每次 Bash 调用 = 挂载 → 执行 → 提交 → 卸载；
  2. Decentralized Agents：多台机器上的 agent 共享一个无服务器 Store；
  3. Multiagent Coordination：一个项目多 Branch，一个 Branch 多 agent；
  4. Recursive Filesystem：任意深度、任意 Commit 均可递归 fork；
  5. Ultra Storage Optimization：内容分块去重存储，真实项目 157 个快照仅 100 MB（Btrfs+zstd 的 1/19.9）；
  6. Instant Bootstrap：依赖随每次挂载自带，无需重装（Workspace 包含 .git、忽略文件、依赖与构建产物）。
- **配套机制**: 每个 agent 步骤即自动 checkpoint；对象只追加不重写；冲突规则（同文件两处改动拒绝提交，`.lww` 规则文件可声明"最新编辑获胜"）；大文件小改动只花改动量（chunk 级）。
- **实现**: Store 是单个 SQLite 文件（存所有 Branch、Commit 与内容对象，无数据库服务器，daemon 与 SDK 直接打开）；Branch 是可写的 Commit 链，发布到 main 即增加一层 Layer；Workspace 是 FUSE 视图（已提交根 + 自身 overlay），卸载时只删 overlay、不删历史。
- **工具调用路径**: 文件工具经 SDK 进程内直写 Store；Bash 走挂载-执行-提交-卸载。
- **实测（发布方，1.0.0、main@e5c7aaae05、单样本）**: Cloudflare fs-bench 1.71× 快（12 场景赢 10）；157 快照去重 19.9×；pjdfstest 0 意外失败（overlayfs 通过数的 76%，其余均为有意的格式限制）；fsx 14/14；fsstress 3,755/3,755 一致；smallfile 9/9 更快；fio 混合读写 1.49–2.23×，但顺序写 0.31×、顺序读 0.81×、随机写 0.40× 更慢。
- **与先行工作的差异**: overlayfs/UnionFS（上层丢弃或只存目录，LayerFS 把上层变成带历史/合并/冲突的不可变快照）；Btrfs/ZFS（按 extent 共享，LayerFS 按内容分块，全量重写文件仍只存新 chunk）；Git worktrees（Workspace 含整个树，Commit 按工具调用发生而非手动）；`try`（单机单 overlay，LayerFS 多 agent 共享一 Store）；Apiary（隔离桌面应用，LayerFS 面向 agent 工具调用结果的保留/分支/合并）。
- **诚实局限**（README 明示）: Store 仅 Disposable profile，无断电/崩溃耐久性——"只用来存 agent 工作与历史，别当唯一数据副本"；FUSE 视图故意省略 FIFO、socket、设备节点、set-id 位、独立 atime/ctime；顺序 I/O 带宽弱。
- **落地形态**: 现主要通过 LayerFS × DSH（DeepSeek Harness 的 dsh-layerfs 插件），session 内 fork Branch、在 Sandbox 中测试、合并发布，Work/History 标签页实时显示各 agent 的 Branch；1.1.0 起支持 Windows dsh Live（WSL2）与 Linux Docker Engine；JS API 已拆为 @layerfs/agent、@layerfs/backend、@layerfs/runtime（与 1.0.0 不兼容）。
- **仓库元数据**（归档时）: star 2,112，fork 107，commit 4,135，MIT，另有 WeChat 交流群。

## 适用场景

- 多 agent 并行改同一项目时的"工作区 + 历史"底座（分支/回滚/合并按工具调用粒度）
- 需要 checkpoint 式可回放、可分支的 agent 执行环境设计参考
- 与 sandbox 运行时（Amp Orbs、Agent Substrate）对照：LayerFS 解决的是"状态与历史层"，而非"算力层"

## 相关资料

- [Amp Self-Hosted Orbs：把 agent 执行环境搬进自己的基础设施](2026-10-22-amp-self-hosted-orbs.md) — agent 执行环境的算力层对照
- [Sandbox Agent Substrate — CNCF Sandbox 申请（Issue #523）](2026-10-01-agent-substrate-cncf-sandbox-523.md) — K8s 沙箱运行时对照
