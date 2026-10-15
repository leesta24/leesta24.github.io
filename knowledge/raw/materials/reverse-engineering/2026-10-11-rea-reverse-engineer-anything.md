# REA: Reverse Engineer Anything（morluto/rea）

- **来源**: GitHub 仓库（morluto/rea）
- **链接**: https://github.com/morluto/rea
- **官网**: https://rea.tools
- **归档日期**: 2026-10-11
- **标签**: 逆向工程, MCP, Agent 工具, 二进制分析, 开源, MIT

## 一句话摘要

REA（Reverse Engineer Anything）：一个 MCP 服务器，把逆向工程工具链接到 AI agent——agent 可以在没有源码的情况下调查任意应用，从应用行为一直深挖到原生二进制，解释功能原理、给出证据链，并帮你复刻实现；分析全在本地跑，不上传目标。

## 要点

- **定位**: "One MCP for reverse engineering across binaries, applications, and runtime behavior." 口号是"看到喜欢的功能，搞懂它怎么 work，一直到二进制层面"。
- **工作流**: agent 通过 MCP 调用 REA 调查本地目标 → REA 驱动分析工具检查、追踪相关代码 → 返回带证据的发现（含结论的证据与局限）→ agent 追问、解释原理，或直接写代码实现并测试。CLI 命令走同一套工作流。
- **支持的分析目标**:
  - 原生二进制：伪代码、汇编、字符串、符号、调用关系（需 Hopper / Ghidra / IDA，setup 可代装 Hopper）
  - 离线 ELF 布局、WASM、EVM 字节码、Linux crash 录制
  - JavaScript / Electron 应用：模块、导入、source map、路由、IPC、native addon 关系（无需原生分析引擎）
  - 网站（页面结构、脚本、网络观测、截图）、HAR 网络抓包
  - .NET 程序集（纯静态）、Android APK（JADX 反编译）/ Android 设备（adb）、JEB 项目、固件（binwalk/unblob）、安装包资源、进程行为抓取（PTY 终端输出、文件系统观测）
- **接入**: `npx rea-agents setup` 一键注册 MCP server + 安装配套 workflow 指令，支持 Claude Code、Codex、Cursor、Gemini CLI、Grok Build 等；其他支持本地 MCP 的 agent 可手动注册；另有 skill（skills.sh）。
- **实战案例（showcases）**: DX-Ball——重构声音声像计算（3,205 个原始 x86 用例通过）；Notion——追踪 Electron 剪贴板桥（renderer → preload → IPC → main）；TH04——恢复 DOS 弹幕游戏的子弹环计算（16 位 PC-98 指令）。
- **隐私**: 分析在本地进行，不上传被分析的应用；agent 的模型供应商有自己的数据政策。
- **仓库元数据**（2026-10-11）: star 91,945，fork 20,424，commit 2,325，release 35，MIT，建仓 2026-04-14；README 有 18 种语言版本；有 Discord 逆向工程社区。
- **声明**: 仅用于合法逆向工程研究；项目方未发行任何加密货币，同名 token 与项目无关。
