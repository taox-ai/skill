# Project setup and runtime

The CLI package is `howone`; install it with the environment's chosen package manager. If it is not
installed, use `npx --yes howone@beta init app my-app --yes` or install `howone@beta` globally.
The unqualified npm `latest` still points at the old CLI. Read only the relevant command's help.

`howone.yaml` is the single App configuration file. It declares `profile: dev`, `project.appId`
(the platform-generated shortId), runtime region, brand, control-plane URL, auth origin, schema and AI source.
New Apps do not have a separate `dev.yaml` or `environmentFiles` mapping. Keep project declarations
and public settings in this Git-tracked YAML; CLI resource init writes server connection values and
credentials into the ignored `.env`. Do not add another config layer or move secrets into YAML.
Older split projects remain readable when their manifest explicitly declares `environmentFiles`.
Existing Apps with `.env.local` keep receiving init updates in that file, since their startup scripts
and Bun/Vite may give it priority over `.env`. To migrate, preserve and merge its settings into `.env`,
update explicit startup/test `--env-file` paths, then remove `.env.local` and restart. Do not leave
competing credentials in both files or copy secrets into YAML.
Backend retains the PG UUID internally and verifies shortId ownership before resolving it. Existing UUID
manifests remain valid for migration; new scaffolds and HOWONE_APP_ID use shortId.
App ID changes are resource targeting changes, not a way to gain access. The project/CLI selects
environment and region, then supplies explicit URLs and auth context to the SDK. The SDK must not
infer these from hostnames or select a different environment itself. This release executes dev
resource operations only; future dev/prod and CN/global targets belong to external project configuration.
Brand is howone globally and xcamel in CN.

Init creates a runnable homepage, Node server, users schema, optional SDK auth/AI integration points,
and the local Skill. It registers App metadata in Studio PG through the
dev Backend; it does not provision Mongo or change UC accounts.
Database defaults, Todo business data and generated AI service Releases are not copied from an example.

## Resource connection

The operator supplies `controlPlane.url` (dev defaults to `https://api.memtest.howone.dev`) and a platform creator token from `HOWONE_TOKEN`, `--token`
or the local dev credential store. The
Backend verifies the platform session and PG ownership for each DB/AI request. Raw UC tokens and
App-user tokens cannot create/manage Apps. Never save creator tokens in project YAML. The dev-only
AI runtime receives its creator token through ignored server env during `ai init`.

```bash
howone db init
howone db generate
howone db migrate
```

`db init` writes only the restricted App database binding into ignored `.env`. Repeating an
unchanged init does not rewrite the file or restart the app. Run `bun run dev` from the app.
A configured backend must allow this App ID; local scaffolding does not extend its authorization.

To call a local App action from an Agent terminal, use the same App server and saved creator credential:

```bash
howone app call /api/images/generate --input input.json --invocation-id <stable-id> --json
```

The App must pass `cliPrincipal` to `createAppAuthRuntime`. Backend verifies the creator, App ownership
and trusted UC association before the App handler receives `user.id`. This dev bridge accepts only a
loopback `auth.origin`, never sends Mongo credentials, and does not accept `ownerId` from the request.

## UC application login

The template mounts `/api/auth/*` with the server SDK and includes a custom `/login` page.
Run `howone auth init` to install SDK-managed authentication configuration. UC connection details
come from the platform; App developers do not configure UC URL/business/tenant or an auth secret.
Google/GitHub still require the App’s own provider credentials (`HOWONE_GOOGLE_CLIENT_ID`,
`HOWONE_GOOGLE_CLIENT_SECRET`, `HOWONE_GITHUB_CLIENT_ID`, `HOWONE_GITHUB_CLIENT_SECRET`).
Init does not generate an `.env.example`; resource commands install the actual runtime settings. The browser origin must match the configured
origin and provider callback URLs:

- `{origin}/api/auth/callback/google`
- `{origin}/api/auth/callback/github`

Email/phone use UC login-or-register, so no registration tab is needed. WeChat is not included.
A successful UC identity sets App-scoped HttpOnly Cookies containing UC-issued tokens. `/api/auth/session` returns
current user information without exposing tokens. `users` recording is optional and best effort;
Mongo failure never turns a valid UC login into a failed login. No Mongo session table is required.
Missing configuration is a setup requirement, not permission to invent a demo identity or bypass UC.

Database init provisions only the selected App’s logical database, database-scoped runtime account
and limited role, then writes HOWONE_APP_ID, MONGO_URL and MONGO_DB_NAME into .env (0600).
It preserves unrelated env values and never prints connection passwords. Schema changes remain
generate → migrate. Database init can be repeated; do not invent a db connect command.

## Developer/AI credentials

`howone login` opens the hosted login page (`https://xcamel.dev` for dev, `https://howone.ai` for prod),
receives its `localStorage.auth_token` on a one-time `127.0.0.1` callback and saves it. `howone whoami`
prints the saved identity, issuing site and expiry; `howone logout` removes that entry and
`howone logout --all` clears every environment.

The store is device-scoped and keyed by the token's issuing site, not by the App: one file,
`~/.config/howone/auth.json` (directory 0700, file 0600), shared by every App and every local port.
`--env`, `--site` and `--config-dir` (or `HOWONE_CONFIG_DIR`) choose the entry; a token from the
environment or `--token` is not added to the device store; `ai init` copies the selected token to the App server env. These identity commands do not need `howone.yaml`,
so they also run before the App exists. Never place a credential in `howone.yaml`; ignore runtime env
and binding files in Git.
Use only a token authorized by the user/operator; do not fabricate one or borrow another account.

Current dev AI execution uses the saved platform creator identity for billing, separate from UC login.
`howone ai init` configures the EAX runtime and writes the EAX URL plus temporary `HOWONE_AI_TOKEN`
to ignored `.env`. The memtest EAX runtime authenticates with `Authorization: Bearer` using
that CLI token and no release header. There is no Backend execution gateway or per-App credential-file
projection. `--token`, `HOWONE_TOKEN` and the saved CLI credential all use this same initialization path.

`howone auth init` fetches this App’s platform UC configuration and installs ignored `.howone/auth.json`
(mode 0600), with the trusted origin from `howone.yaml.auth.origin`. The server SDK loads it automatically and checks
the App ID. Keep this file with the runtime when packaging; start Node from the App root.
The command removes retired UC/session/origin env keys and preserves unrelated settings. It does not
generate a session key. UC verifies tokens; the SDK handles HttpOnly Cookies, refresh and OAuth state/PKCE.
After changing `auth.origin` or the App's local port, run `howone auth init` again and restart the App;
the SDK uses the installed binding snapshot, not a live read of `howone.yaml`.
A migration from the old encrypted Cookie requires signing in again.
It does not log a user in. Google/GitHub require the App’s own provider credentials; the command
never downloads the platform’s shared OAuth client secrets.

## App structure

Use [App structure](template.md) for the file map, page/server boundaries, shadcn and generated files.
These directory names are the starter's convention. TanStack's file routing and server boundaries
remain authoritative; there is no required `features` or `pages` layer.
