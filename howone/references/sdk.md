# Integrate the installed SDK

Read this when changing login, AI execution or the app's SDK adapters. Resolve SDK methods from the
version the app actually imports, rather than copying code from another app or an npm release.

## Find matching documentation

The starter pins published npm versions of `@howone/sdk` and `@howone/db` in `package.json`. After
installation, read the matching SDK guides:

- `node_modules/@howone/sdk/docs/app-auth.md` for UC login, cookies and server authorization.
- `node_modules/@howone/sdk/docs/app-ai.md` for AI actions, manifests and the execution route.

Check the installed package's version, exports and `.d.ts` files first. Documentation ships in the
SDK package, so it is available offline after dependency installation. If an older App uses a local
`file:` SDK snapshot, read that resolved package's docs/types instead. Do not silently replace its
dependency or assume the global Skill matches it. An older package without docs can still be
inspected through its declarations and existing adapters; upgrade only when the feature requires it.

## Environment comes from the App

The SDK accepts explicit endpoints and auth bindings supplied by the App/CLI. It does not choose
`dev`/`prod`, infer region from a hostname, or embed an environment's service addresses. Keep those
choices in project configuration and inject their resolved values. Current CLI resource operations
support dev only; this boundary allows later production and regional targets without another SDK.

## Select the entry point

| Import | Runs in | Purpose |
|---|---|---|
| `@howone/sdk/auth` | Browser | App login, session and UC user state through same-origin routes |
| `@howone/sdk/ai` | Browser | Typed actions and streaming execution through the App API |
| `@howone/sdk/server` | Node server | UC verification, cookies, OAuth, EAX and (new SDK) action handler binding |
| `@howone/sdk/actions` (new SDK) | Browser / CLI | Pure shared action definitions, contract export and typed App API client |
| `@howone/db/schema` | Server / CLI | App Mongo schema and migration contract |
| `@howone/db` | Node server | Restricted App database access |

The starter composes browser clients in `src/lib/sdk.ts`. Keep server adapters in
`src/server/*.server.ts` and HTTP endpoints under `src/routes/api`. Read the existing adapter before
introducing another client or route. Use the supported exports and signatures in the installed
package; the old root SDK's dynamic Entity helpers are not the new App data API.

## Trace the feature end to end

For login, trace the custom login page → browser auth client → `/api/auth/*` → server SDK → UC.
UC tokens use server-managed HttpOnly cookies. Browser JavaScript gets a session user; App users use that
verified UC ID. CLI `howone login` is a separate creator credential and does not create this session.
See [setup](setup.md) for `auth init` and provider configuration.

For AI, trace a typed action → authenticated App API → server runtime → EAX. Use the actual
CLI-synced manifest and ready capability. The dev AI token stays in server env. Handle progress,
upstream errors and cancellation according to the installed runtime; a stopped browser request does
not prove the upstream job stopped. See [AI](ai.md) for authoring and persistence.

The default AI client calls `POST /api/ai/workflow/execute/{projectId}/{workflowId}`. A new App needs
the matching authenticated Server Route; the starter only supplies its runtime factory. Check this
route first for a local 404, then use the installed `docs/app-ai.md` example for body/response wiring.

For the shared-contract runtime, read installed `docs/app-actions.md` and [App Skill delivery](app-skill.md).
Its APIs require SDK beta.5/CLI beta.8; preserve legacy routes when those exports are unavailable.

Business routes own validation, user authorization and database writes. A business exception is not
an authentication failure; preserve that distinction in API responses and UI recovery.

## Verify the affected boundary

Run typecheck and build to detect unsupported SDK exports and accidental server imports. For auth
changes, check anonymous/session behavior and mutations with a verified user when credentials are
available. For AI changes, distinguish mocked transport checks from a live workflow execution and
persist successful output before claiming durable history. Do not trigger OTP or paid generation
solely as a health probe.
