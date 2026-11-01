# HowOne Skill

Build full-stack AI apps with HowOne (xcamel in CN), using Codex, Claude Code or Pi.
The Agent handles CLI setup, App resources and application code; users describe the product.

```bash
npx skills add taox-ai/skill --skill howone
```

Then ask:

> 帮我用 HowOne 做一个带登录、数据库和 AI 图片生成的待办 App，保存我的数据和图片历史。
> 请完成安装、开发、验证和启动，并交付这个 App 在终端里的使用 Skill；需要我登录时再提示我。

With a compatible HowOne CLI, `howone skills install howone --agent all` installs the copy bundled
with that CLI. Browser sign-in or provider verification may require the user; credentials do not
belong in the Skill. The public tooling currently targets dev resources and local Node Apps.

## Two kinds of Skill

| Kind | Purpose | Source |
|---|---|---|
| Generic `howone` | Teach the Agent to build, update and troubleshoot Apps | This repository's `howone/` |
| App-specific usage Skill | Teach the Agent to call an App's tested business APIs | Generated inside that App after development |

A new callable App includes its usage Skill in the Agent's default delivery flow. Exposed API changes
refresh it; visual-only changes do not. A frontend-only App without server actions needs no empty
usage Skill. Generating instructions does not deploy or start the App's API.

## How the guidance is organized

[SKILL.md](howone/SKILL.md) is the entrypoint. It selects the relevant reference instead of loading
all guides, source files or component catalogs. CLI help owns command syntax, and installed SDK
docs/types own API signatures. Guides cover building, template structure, resource setup, data,
AI, SDK integration, App Skill delivery and troubleshooting.

The design draws from [Vercel Skills](https://vercel.com/docs/agent-resources/skills),
[Void's Agent integration](https://void.cloud/integrations/agents) and
[OpenCLI's usage Skill](https://github.com/jackwener/opencli/blob/97dc0cd5214b9602bcda78d7422f231ee8a803e9/skills/opencli-usage/SKILL.md):
short entrypoints, version-matched documentation and capability discovery through the actual CLI.
HowOne's command surface remains authoritative; planned APIs are not instructions for installed releases.

## Version compatibility

The legacy starter baseline is CLI `howone@1.0.0-beta.7`, SDK `@howone/sdk@1.0.0-beta.4` and
DB `@howone/db@1.0.0-beta.1`. The shared-contract runtime requires CLI `1.0.0-beta.8` and SDK
`1.0.0-beta.5`; publish/install those packages before using its new commands. This Git update alone
does not make npm versions available. The Agent checks actual command help and installed exports,
keeps working legacy Apps on their supported flow, and never imports a proposed/unavailable API.

Git installs follow the selected Git revision; a CLI's bundled Skill stays with that npm version.
An existing App's bundled guide and pinned packages take precedence over a newer global copy.
GitHub updates do not republish npm packages or update existing projects automatically.

See the [Todo example](howone/examples/todolist.md) for a full flow and
[maintenance guide](CONTRIBUTING.md) for the source and release process.
