# Example: Todo App

This is the complete flow a teammate can use after installing the HowOne Skill.

## User request to an agent

If the current agent session does not have the Skill yet, start with:

```bash
npx skills add taox-ai/skill --skill howone
```

```text
请先使用 HowOne Skill，然后创建一个中文 Todo 全栈 App：支持 UC 登录，每个用户只能看到自己的 Todo，
支持创建、完成、删除和筛选；页面使用 TanStack Start 和 shadcn；再加一个 AI 能力，
可以根据 Todo 内容生成一张图片并保存生成记录。只使用 dev 环境。
```

The agent should create normal TanStack source code and use HowOne only for platform resources.
The App owns its Mongo collections and API routes; it does not use dynamic Entity APIs.

## One-time workstation setup

```bash
npm install --global howone@beta
npx skills add taox-ai/skill --skill howone
howone login
```

`howone login` saves the developer credential in `~/.config/howone/auth.json`. It does not log a
browser user into the App.

## Create and bind the App

```bash
mkdir todo-app
cd todo-app
howone init app todo-app --tanstack --region cn
howone db init
howone auth init
howone ai init
```

Use `--region global` for the overseas HowOne brand. The generated `dev.yaml` points at the
memtest control plane and remote dev services. No Mongo, UC or AI service binding should contain
`localhost`, `127.0.0.1` or `.svc.cluster.local`.

The generated ignored `.env.local` contains the App binding:

```text
HOWONE_APP_ID=<short-id>
MONGO_URL=<restricted-app-mongo-url>
MONGO_DB_NAME=app_<short-id>
HOWONE_AI_URL=https://eax-orchestrator.howone.dev
HOWONE_AI_TOKEN=<temporary-cli-bearer-token>
```

The token is server-only and must never be copied into `VITE_*` variables or browser code.

## Build the business feature

The agent edits `src/server/schema.ts` to declare `users` and `todos`, then writes ordinary
server repositories and TanStack routes. Ownership always comes from the verified UC identity:

```bash
howone db generate
howone db migrate
```

The App UI can now run locally:

```bash
bun install
bun run dev
```

The App origin may be `http://localhost:3000` because it is the user's own local server. This is
different from infrastructure bindings written by `db init`, `auth init` and `ai init`.

## Add the AI capability

The agent declares the image workflow in `src/server/capabilities.ts`, keeping input/output
schemas stable:

```bash
howone ai validate
howone ai generate
howone ai migrate
howone ai status --job <job-id>
howone ai sync --job <job-id>
```

Only after the job is completed and the Release is published does the agent bind the generated
manifest in server code. The browser calls the App's same-origin API; it never receives the CLI
token or an EAX service credential. Image history belongs in an App collection such as
`generated_images`, scoped by the verified UC user ID.

## Expected result

The finished App has a real login page, isolated user Todo data, Mongo migrations in `migrations/`,
an AI capability pinned by `src/lib/generated/ai-manifest.json`, and a normal `bun run dev` command.
The next schema or AI change repeats the corresponding `generate` and `migrate` flow; no Studio
dynamic Entity operation is involved.
