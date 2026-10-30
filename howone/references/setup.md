# Project setup and runtime

The CLI package is `howone`; install it with the environment's chosen package manager. If it is not
installed, `npx howone init app my-app --yes` is the package-runner form once this CLI release is
published. Check `howone --help`, `howone init app --help`, `howone db --help`, `howone ai --help`.

`howone.yaml` selects `dev.yaml` and declares project.appId (the platform-generated shortId), database.schema and ai.source.
Backend retains the PG UUID internally and verifies shortId ownership before resolving it. Existing UUID
manifests remain valid for migration; new scaffolds and HOWONE_APP_ID use shortId.
App ID changes are resource targeting changes, not a way to gain access. Service URLs differ across
environments; this release rejects non-dev profiles. Brand is howone globally and xcamel in CN.

Init creates a runnable homepage, Node server, users schema, optional SDK auth/AI integration points,
and the local Skill. It registers App metadata in Studio PG through the
dev Backend; it does not provision Mongo or change UC accounts.
Database defaults, Todo business data and generated AI service Releases are not copied from an example.

## Resource connection

The operator supplies `controlPlane.url` (dev defaults to `https://api.memtest.howone.dev`) and a platform creator token from `HOWONE_TOKEN`, `--token`
or the local dev credential store. Newly initialized profiles select creator authentication; the
Backend verifies the platform session and PG ownership for each DB/AI request. Raw UC tokens and
App-user tokens cannot create/manage Apps. Legacy dev fixtures retain only their explicitly scoped
`HOWONE_APP_CONTROL_TOKEN`. Never save creator/control tokens in app runtime env or project YAML.

```bash
howone db init
howone db generate
howone db migrate
```

`db init` writes only the restricted App database binding into ignored `.env.local`. Repeating an
unchanged init does not rewrite the file or restart the app. Run `bun run dev` from the app.
A configured backend must allow this App ID; local scaffolding does not extend its authorization.

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
and limited role, then writes HOWONE_APP_ID, MONGO_URL and MONGO_DB_NAME into .env.local (0600).
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
environment or `--token` is never written to disk. These identity commands do not need `howone.yaml`,
so they also run before the App exists. Never place a credential in `howone.yaml`, `dev.yaml` or
the App directory.
Use only a token authorized by the user/operator; do not fabricate one or borrow another account.

Current dev AI execution uses the saved platform creator identity for billing, separate from UC login.
`howone ai init` configures the EAX runtime and writes the EAX URL plus temporary `HOWONE_AI_TOKEN`
to ignored `.env.local`. The memtest EAX runtime authenticates with `Authorization: Bearer` using
that CLI token and no release header. Older control planes may return a gateway binding; its App key
is kept in ignored `.howone/ai.json`.

`howone auth init` fetches this App’s platform UC configuration and installs ignored `.howone/auth.json`
(mode 0600), with the trusted origin from `dev.yaml`. The server SDK loads it automatically and checks
the App ID. Keep this file with the runtime when packaging; start Node from the App root.
The command removes retired UC/session/origin env keys and preserves unrelated settings. It does not
generate a session key. UC verifies tokens; the SDK handles HttpOnly Cookies, refresh and OAuth state/PKCE.
A migration from the old encrypted Cookie requires signing in again.
It does not log a user in. Google/GitHub require the App’s own provider credentials; the command
never downloads the platform’s shared OAuth client secrets.

## App structure

TanStack Start uses `src/routes` for file-based pages and HTTP Server Routes. A page's component can
live directly in its route file, as in the official examples. `src/router.tsx` registers the generated
`src/routeTree.gen.ts`; do not edit the generated file. There is no separate `pages` directory.
Use Server Routes for HTTP APIs and Server Functions for App-internal RPC.

The default HowOne starter keeps five source directories:

```text
src/
  routes/       pages (__root.tsx, index.tsx, login.tsx) and api/ HTTP routes
  components/   app components; ui/ contains installed shadcn components
  lib/          browser-safe SDK, Query, hooks, contracts and generated/ AI bindings
  server/       UC/Mongo/AI adapters, repositories, schema.ts and capabilities.ts
  store/        client UI state; provider creates a separate store per rendered app
  router.tsx
  routeTree.gen.ts  generated by TanStack Router
```

The `components/lib/server/store` split is our starter convention, not a TanStack requirement. Do not
introduce `features`, `pages`, or extra layers into this starter without an actual need. Keep page
composition in route files and extract reusable UI to `components`. Use `@/` imports throughout.

Server-only implementations end in `.server.ts`; a browser component may import a `*.functions.ts`
wrapper but must never import a server adapter directly. Mongo declarations and AI authoring input
live in `server/schema.ts` and `server/capabilities.ts`, selected explicitly by `howone.yaml`.
TanStack Query owns session and remote data; the Zustand store holds UI state, without copying
credentials or query results. Create the store inside its provider so SSR requests never share it.

shadcn is configured in `components.json` with Tailwind v4, `rsc: false`, and `@/components/ui`.
Common components are included as source. Add more from the app root:

```bash
bunx shadcn@latest add <component>
```

References: [TanStack file routes](https://tanstack.com/router/latest/docs/framework/react/routing/file-based-routing),
[TanStack server functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions),
[shadcn TanStack installation](https://ui.shadcn.com/docs/installation/tanstack).

The CLI ships local versioned runtime packages under `.howone/runtime`, referenced by `file:`.
Keep them with generated source until a reviewed upgrade replaces them with compatible releases.
They contain runtime code, not credentials or generated business resources. Check installed exports
and typings when binding SDK calls. Do not assume the npm beta has unreleased workspace APIs.
