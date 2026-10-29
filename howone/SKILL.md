---
name: howone
description: Build and iterate full-stack AI apps with HowOne (xcamel in CN). Use when a user asks for an app with HowOne capabilities, or changes to its MongoDB data, UC login integration or AI workflows. Coordinates CLI resources and ordinary TanStack application code.
---

# Build HowOne apps

The user describes a product; deliver its working full-stack implementation. Handle CLI setup,
project initialization, business schema, authenticated APIs, UI and AI integration as one task.
Choose appropriate interfaces and collections from the requirement; the user does not need to know
HowOne command names or select separate database/auth/AI skills.

## Start with the real environment

Use the installed CLI's help as the command reference:

```bash
howone --version
howone init app --help
howone db migrate --help
```

Before an unfamiliar operation, read `howone <family> <command> --help` for its required arguments,
local/remote effects and prerequisites. Never invent a command or treat a placeholder as implemented.
If the CLI is missing or incompatible, follow [build an app](references/build-app.md#bootstrap).

In an existing project, read its nearest `howone.yaml`, selected profile, `AGENTS.md` and relevant
feature code. The CLI resolves parent manifests; confirm the intended App ID and dev profile before
resource operations. Do not substitute another App to get around missing permissions.

## Route the task

| User's goal | Read and execute |
|---|---|
| New full-stack app, or a feature spanning UI/API/data/AI | [Build an app](references/build-app.md) for the complete delivery flow |
| Database schema or persistence change | [Database](references/database.md) for schema, generate → migrate and ownership |
| AI capability or saved AI results | [AI](references/ai.md) for asynchronous authoring, SDK binding and persistence |
| App login, credentials or runtime wiring | [Setup](references/setup.md) for the UC and server boundaries |
| Broken login, connection, migration or generation | [Troubleshooting](references/troubleshooting.md), then only the affected reference |
| UI-only iteration | Relevant app components; no resource operation needed |

Load the reference needed for the current step; do not load every reference in advance.

## Platform boundaries

- **Dev only.** TanStack Start on Node is the only starter. Global branding is howone; CN is xcamel.
  Init registers an owned App through the dev Backend and generates source. Mongo provisioning
  and deployment are separate steps.
- **The app owns its data and APIs.** Use app-owned Mongo logical databases and ordinary repositories.
  Do not use dynamic Entity, usershares or retired Agent design tools. Only `users` is a default
  collection; app requirements decide every other collection and user business field.
- **UC owns identity.** `users._id` is the verified UC ID string; Mongo recording never gates a valid
  UC login. Business references use this ID. Derive ownership on the server and scope reads/writes.
  Never accept a browser-supplied owner as authorization.
- **The CLI manages resources; the SDK serves the app.** Use `db init`, `auth init` and `ai init` for the product’s required capabilities; each installs its
  server environment. Database init provisions the selected App and writes its restricted runtime env; database DDL uses
  `generate → migrate` or
  optional direct `push`. Runtime requests never apply DDL. Browser SDK calls are same-origin;
  `@howone/sdk/server` and database access stay on the server.
- **AI authoring and AI execution are different.** CLI submission returns a job, not a usable result.
  Bind SDK actions only after syncing the verified published Release. Save results in an app business
  collection when the product needs history; AI workflow schemas do not create collections.
- **Credentials stay outside browser code.** YAML contains public configuration and env references.
  Use authorized local/server credentials without printing them. Missing credentials require a
  precise setup step, never a fabricated token or demo identity. Browser CLI login and deployment
  are not implemented; the current AI service credential-file bridge is for local dev.

## Complete the user-visible feature

For a new generated app, run typecheck, build and its verify script; for an existing app, use its
actual checks and run the verifier from this Skill with the project root when applicable. Verify
changed routes and persistence, not just compilation. Test login/user isolation when changed;
distinguish simulated checks from real UC login and real AI execution.

Report the runnable app, implemented behavior, checks completed and any concrete missing setup.
Do not report a queued AI job, a mock login, or an image preview without requested persistence as
finished work. Continue independent code work while authoring runs; retain job IDs and real failures.
