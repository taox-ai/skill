# Deliver a full-stack app

Use this flow when the user asks for a product, not just one CLI operation. Adapt the business model,
UI and API to their request. This is one Skill; the linked references supply details for each step.

## Bootstrap

Use a compatible installed `howone`, or the package runner `npx --yes howone@beta` for this release.
For a persistent installation, use `npm install --global howone@beta`. In package-runner mode,
replace the `howone` prefix in the examples below with `npx --yes howone@beta`.
Check `init app --help` supports TanStack and `db migrate --help` describes generated snapshots.
If missing, install the beta CLI with the user's chosen package manager and check again. Do not
upgrade a compatible existing installation just to match a remembered command.

This architecture may be newer than the npm release. In the HowOne source checkout, run
`bun run build` in `packages/cli` and use `node <repo>/packages/cli/bin/index.mjs` as the command prefix.
A supplied CLI tarball can also be installed. Do not silently generate a legacy Vite/Entity app if
the registry release lacks these capabilities; report the exact missing compatible release instead.
Dependencies include Bun and a supported Node version for the Node app runtime.

## 1. Establish the app target

For a new app:

```bash
howone init app my-app --yes --json
cd my-app
```

Init installs dependencies by default and includes compatible SDK/Mongo runtime packages, a users
schema, custom login UI and server integration points. It creates no business collections or AI
workflow. Before init, use an authorized dev platform creator token (saved credential or
`HOWONE_TOKEN`) and the dev Backend endpoint (`https://api.memtest.howone.dev`, overridable with `HOWONE_CONTROL_URL` or `--control-url`). Init calls
the real creation API and writes its returned App ID. Use `--app-id <allocated-id>` to verify and bind
an existing owned App. Retry the same target after network failure to reuse its saved creation key.
If generation finished but installation failed, run `bun install` in the generated project. Use `--region cn` only when CN/xcamel is intended; the environment remains dev.

For an existing app, preserve its selected App and structure. Read the nearest `howone.yaml`, profile
and feature code. Do not initialize over the existing project or replace its business model.

## 2. Design the actual feature

Define only what the product needs: records, user relationships, API requests/responses, screens
and AI input/output. Add business fields to `users` or create related collections according to the
actual requirement; no universal profile/organization tables. The default identity key is UC ID.

Read [SDK integration](sdk.md) before wiring auth or AI methods; use the app's installed docs and
types. Implement UI, typed API calls, validation and server queries together. Put the page in
`src/routes/index.tsx` (or another file route), reusable UI in `src/components`, client helpers and
query hooks in `src/lib`, and database queries in `src/server/*.server.ts`. Use the installed
shadcn primitives from `src/components/ui`. Put UI state in `src/store`; session and remote data
stay in TanStack Query. The starter supplies `src/lib/sdk.ts`, `src/server/auth.server.ts`,
`src/server/db.server.ts` and `protectedApi` in `src/server/http.server.ts`. Keep HTTP route handlers
small and keep the starter's flat structure; do not add a `features` or `pages` layer by default.

## 3. Connect data and identity

Read [setup](setup.md) for configured service/credential requirements and [database](database.md)
for schema definitions. Use authorized dev control-plane configuration already available to the
operator. All schema management uses CLI:

```bash
howone db init
howone db generate
howone db migrate
```

Database init also writes the restricted App connection into ignored .env.local; there is no separate
db connect command. Re-running init repairs the binding and preserves unrelated configuration.
For an already provisioned app, perform only the required operations. `db status` reads remote
state; `db generate` is a local snapshot, not a remote operation. `db push` is an alternative to
generate/migrate. Neither path belongs in an App request handler.

Use the SDK's existing UC login integration. Configure the actual UC context and OAuth providers
using `howone auth init`, which installs the platform-managed authentication binding for the SDK; no UC/session env is needed.
Google/GitHub provider credentials remain App-specific and require separate configuration. Never add a simulated-login path.
Every private repository query uses the server-verified UC user, even if app-user recording fails.

## 4. Generate and wire AI when needed

Read [AI](ai.md). Declare the capability's product input/output, generate its contract and submit it.
Capture the returned job ID and poll status while writing independent UI/API/data code. Never bind
invented workflow or Release IDs. On completed + published, sync the manifest and connect runtime
credentials with `howone ai init`. Use SDK actions for browser execution and the server AI service runtime behind
authenticated routes.

When history is part of the feature, add its business collection through step 3. Validate successful
output, save it with verified owner/run ID on the server, then report completion. Handle workflow
errors and loading explicitly. Browser-only state does not fulfill durable history.

## 5. Verify and hand over a runnable result

Run the app's typecheck/build and checks for the changed feature. A fresh starter also has
`bun run verify`. From another project layout, the same static check can be invoked as
`node <skill-directory>/scripts/verify-project.mjs <app-root>`.

Check the browser, anonymous/authenticated API behavior and persistence/isolation as relevant. A
static verifier does not prove a successful live login or AI run. Actual OAuth/OTP still requires
the user's provider proof; perform independent implementation/checks while awaiting that step.

Start the local App for review when requested or useful. Report its URL, what works, checks performed,
and any exact unavailable credential/service. Continue all work not blocked by that dependency.
`howone deploy` is not implemented, and `howone login` only saves the CLI developer credential
in `~/.config/howone/auth.json` — it does not sign a browser into the App, so it cannot complete the
user's OAuth/OTP steps for you.
