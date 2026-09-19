# MySuperpowers

一个更轻、更自主的 [Superpowers](https://github.com/obra/superpowers) 分支。

它保留规划、调试、测试、代码审查和并行协作等核心技能，但不再在每次会话开始时强制加载完整工作流。你可以按任务需要调用技能，让简单任务保持简单。

## 为什么做这个版本

原版 Superpowers 擅长为复杂开发任务建立严格流程，但完整流程也会被带入很小的修改，增加上下文、确认步骤和重复思考。

MySuperpowers 做了三项关键调整：

1. **移除自动工作流入口**
   - 删除 `using-superpowers` 技能及其目录。
   - 各运行环境只注册技能，不在会话启动或上下文压缩时注入完整工作流。
   - 其他技能仍保留自己的触发条件，也可以由用户显式调用。

2. **将 `writing-plans` 改为计划大纲**
   - 计划只描述目标、范围、任务顺序、依赖关系和验收条件。
   - 不再提前编写实现代码、测试代码、具体函数签名或逐命令步骤。
   - 实现细节在执行当前任务时结合代码库确定，减少规划与实施之间的重复思考。

3. **移除 `diagnosing-superpowers`**
   - 删除会话诊断技能、模板、提示词、测试和 Issue 模板。
   - 日常代码问题继续使用 `systematic-debugging`。

## 适合谁

这个版本适合希望保留工程技能库，同时自己决定工作流强度的人：

- 小修改希望直接完成，不想先走完整设计和计划流程。
- 复杂任务需要计划，但计划应保持在大纲层级。
- 希望明确调用某个技能，而不是让启动入口串联所有技能。
- 已有自己的任务管理、审批或 Agent 编排方式。

## 可用技能

| 技能 | 用途 |
| --- | --- |
| `brainstorming` | 在实现前梳理需求和设计选择 |
| `writing-plans` | 编写简洁、可验收的计划大纲 |
| `executing-plans` | 在当前会话内执行计划 |
| `subagent-driven-development` | 按任务分派实现和审查 Agent |
| `dispatching-parallel-agents` | 并行处理互不依赖的任务 |
| `test-driven-development` | 使用 RED–GREEN–REFACTOR 开发 |
| `systematic-debugging` | 系统定位故障根因 |
| `verification-before-completion` | 在宣布完成前验证结果 |
| `requesting-code-review` | 发起代码审查 |
| `receiving-code-review` | 处理审查意见 |
| `using-git-worktrees` | 使用隔离工作树开发 |
| `finishing-a-development-branch` | 完成、合并或保留开发分支 |
| `writing-skills` | 创建和测试新的技能 |

各运行环境的工具映射集中在 [`skills/references`](skills/references)。

## 安装

先克隆本仓库：

```bash
git clone https://github.com/Felix-bin/MySuperpowers.git
cd MySuperpowers
```

### Codex

将仓库作为本地插件或技能目录加载。若只需要技能，可把 `skills/` 中需要的技能复制或链接到 Codex 的技能目录：

```text
%USERPROFILE%\.codex\skills\
```

也可以使用跨运行环境的技能目录：

```text
%USERPROFILE%\.agents\skills\
```

### Claude Code、Cursor 和兼容插件的客户端

从本地目录安装插件，或让客户端加载仓库内的 `.claude-plugin`、`.cursor-plugin` 和 `skills/`。本版本的启动钩子为空，不会注入完整工作流。

### Gemini CLI

```bash
gemini extensions install https://github.com/Felix-bin/MySuperpowers
```

### Kimi Code

```text
/plugins install https://github.com/Felix-bin/MySuperpowers
```

### Pi

```bash
pi install git:github.com/Felix-bin/MySuperpowers
```

### Hermes Agent

```bash
hermes plugins install Felix-bin/MySuperpowers --enable
```

### OpenCode

仓库保留 OpenCode V1 和 V2 的技能注册逻辑。插件只注册 `skills/` 下的技能，不修改会话消息。

不同客户端的本地插件安装方式可能随版本变化。安装后可调用 `writing-plans`，确认客户端能够发现技能。

## 使用示例

显式指定技能：

```text
使用 writing-plans，为这个功能写一个简短的实施大纲。
```

输出会聚焦于任务和验收条件：

```markdown
# 列表搜索计划

**目标：** 用户可以搜索列表，并在没有匹配项时看到明确提示。
**范围：** 现有列表页面的搜索交互和结果展示。

### Task 1: 添加搜索与清空恢复
- [ ] 修改：添加大小写不敏感的文本搜索，清空查询时恢复完整列表。
- 验证：不同大小写可以匹配；清空查询后恢复全部条目。

### Task 2: 展示无结果状态
- [ ] 修改：查询没有匹配项时显示无结果提示。
- 验证：无匹配时显示提示；出现匹配项或清空查询后移除提示。
```

计划不会预写过滤函数、测试代码或逐条执行命令；这些内容在实施对应任务时确定。

## 与原版的主要差异

| 项目 | 原版 Superpowers | MySuperpowers |
| --- | --- | --- |
| 会话启动 | 注入 `using-superpowers` 工作流 | 不注入工作流 |
| 小任务 | 可能进入完整方法论流程 | 根据任务直接处理 |
| 计划粒度 | 具体到代码、测试和命令步骤 | 目标、任务和验收条件 |
| 执行衔接 | 依赖详细实施计划 | 执行时补齐当前任务细节 |
| 会话诊断 | 提供 `diagnosing-superpowers` | 已移除 |
| 技能调用 | 自动引导为主 | 用户选择与技能自身触发并存 |

## 验证

本分支包含针对精简入口的检查：

```bash
node --test tests/manual-entrypoints.test.mjs tests/pi/test-pi-extension.mjs
node tests/opencode/test-skill-registration.mjs .opencode/plugins/superpowers.js
python tests/hermes/test_plugin.py
bash tests/hooks/test-session-start.sh
bash tests/kimi/test-plugin-manifest.sh
bash tests/antigravity/test-antigravity-tools.sh
```

这些检查确认：

- `using-superpowers` 和 `diagnosing-superpowers` 不再被发现。
- 其余技能仍能注册。
- 受支持的启动入口不再注入工作流上下文。
- OpenCode V1/V2、Pi、Hermes、Kimi 和 Antigravity 的相关配置保持一致。

Windows Git Bash 可能无法在测试临时目录中创建真正的符号链接，因此 OpenCode 的完整安装测试需要在支持符号链接的环境中运行。

## 项目来源与许可

本项目修改自 [obra/superpowers](https://github.com/obra/superpowers)，原项目由 Jesse Vincent 和贡献者开发。

项目继续使用 MIT License，详见 [LICENSE](LICENSE)。保留原版权声明和许可证文本。

## 维护说明

这是一个偏向轻量工作流的个人分支，与上游 Superpowers 的设计目标不同。同步上游更新时，应优先检查以下内容：

- 是否重新引入会话启动注入。
- 是否重新添加 `using-superpowers` 或 `diagnosing-superpowers`。
- `writing-plans` 和执行技能是否仍兼容大纲式计划。
- 新增运行环境是否只注册技能，而不会强制启动完整工作流。
