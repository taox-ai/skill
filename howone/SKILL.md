---
name: howone
description: Build and update full-stack AI apps with HowOne (xcamel in CN), using its CLI for App resources, MongoDB migrations, UC login and AI workflows. Use for HowOne app development or troubleshooting these integrations.
---

# Build HowOne apps

Turn the user's product request into a working TanStack Start app. Handle the platform setup and
write ordinary application code; the user does not need to choose CLI commands or design the schema.
Initialize only the database, auth and AI capabilities the product needs.

## Use the project's version

In an existing app, read its `AGENTS.md`, nearest `howone.yaml`, selected profile and affected code.
Prefer its bundled `.howone/skills/howone` guidance to a newer global copy. Preserve its App ID,
business data and conventions; resource operations resolve the manifest from the working directory.

Use installed CLI help for command syntax and prerequisites. Read `howone --version` and the relevant
`howone <family> <command> --help` once per unfamiliar operation; reuse it during the task. For SDK
methods, read the app's installed docs and types as described in [SDK integration](references/sdk.md).
Do not assume a newer global Skill describes an older CLI or SDK.

For a new workstation, follow [bootstrap](references/build-app.md#bootstrap). The full-stack CLI is
currently distributed as `howone@beta`; unqualified `npx howone` selects the older `latest` release.
Handle installation and `howone login` when needed. The user completes the browser sign-in; continue
independent work while waiting, and resume resource setup after the credential is available.

## Load the relevant guide

| Task | Guide |
|---|---|
| New app or a feature spanning UI, APIs and data | [Build an app](references/build-app.md) |
| Mongo schema, queries or migrations | [Database](references/database.md) |
| AI create/update, asynchronous authoring or saved results | [AI](references/ai.md) |
| UC login, credentials or environment setup | [Setup](references/setup.md) |
| SDK imports and browser/server integration | [SDK integration](references/sdk.md) |
| Failed login, connection, migration or AI task | [Troubleshooting](references/troubleshooting.md) |

Load only the guide needed for the current step. UI-only work normally needs no resource operation.

## Keep the platform boundaries

- **Dev only.** The starter is TanStack Start on Node. `init app` registers an owned App and creates
  source; `db init`, `auth init` and `ai init` install their resource bindings. Deployment is not implemented.
- **The app owns APIs and data.** Use its restricted Mongo database and normal server repositories.
  All DDL uses CLI `generate → migrate` or optional `push`, never a runtime request. Only `users` is
  a default collection; choose other collections from the product. Dynamic Entity APIs are retired.
- **UC owns identity.** `users._id` is the verified UC ID string. Mongo user recording is best effort
  and never gates a valid UC login. Scope private reads and writes by the server-verified user.
- **Browser and server have separate credentials.** Browser SDK requests are same-origin. Mongo and
  `@howone/sdk/server` stay server-side. CLI login authorizes resource management, not App-user login.
  Dev `ai init` temporarily copies the creator token into ignored server env; never expose it to clients.
- **AI submission is asynchronous.** Keep the returned job ID, continue independent code work and
  poll that job. Sync a completed, published Release before binding SDK actions. Workflow output
  schemas do not create database collections; persist requested history in app business code.

## Deliver observable behavior

Run the app's relevant checks; a fresh starter provides `typecheck`, `build` and `verify`. Check the
changed user flow, persistence and ownership when applicable. The Skill's
`scripts/verify-project.mjs <app-root>` checks the generated project contract; it does not prove a
real UC login or AI execution.

Report the runnable URL, implemented behavior, actual checks and any concrete remaining service or
credential dependency. A queued AI job, simulated login or unsaved preview is not a completed feature.
