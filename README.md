# HowOne Skill

Build HowOne full-stack AI apps with Codex, Claude Code, Pi and the HowOne CLI.

## Install with skills CLI

```bash
npx skills add taox-ai/skill --skill howone
```

Then a novice user can give the agent one request. The agent handles CLI installation, login checks,
App resources and startup:

```text
请先使用 HowOne Skill，然后帮我创建一个完整可运行的 Todo App，带真实登录、MongoDB 数据库、
用户数据隔离和 AI 图片生成功能。请你自己完成安装、登录检查、App、数据库、Auth、AI 初始化、
迁移和启动；我只负责在浏览器里完成必要登录，不要让我记命令或填写 token。
```

## Install with HowOne CLI

```bash
howone skills install howone --agent all
```

The `howone` skill is the canonical agent workflow for creating TanStack full-stack apps with App-owned MongoDB, UC authentication and HowOne AI capabilities.

## Design

The Skill uses a short entrypoint and task-specific references, following the
[Vercel CLI Skill](https://github.com/vercel/vercel/blob/main/skills/vercel-cli/SKILL.md).
Like [Void's agent integration](https://void.cloud/integrations/agents), it directs agents to
documentation shipped with the installed SDK so API guidance matches the project's version.
CLI help owns command syntax; the Skill explains resource targeting, workflow decisions and completion.

## Example

See [`howone/examples/todolist.md`](howone/examples/todolist.md) for a complete teammate flow:
install the Skill, log in with the CLI, create a TanStack Todo App, initialize Mongo/UC/AI, and
continue implementation through Codex, Claude Code or Pi.
