# Deliver the App usage Skill

The generic `howone` Skill teaches development. An App-specific Skill teaches an Agent to use that
App's implemented business APIs. Include this in a new callable App's delivery without waiting for
another user request. Refresh after an exposed API changes or is removed; UI-only edits do not
require regeneration. Apps without suitable server actions keep an empty declaration and need no
empty usage Skill. Generation is an Agent completion step, not a build or deployment hook.

## Choose the installed contract

Read `actions.source`, existing routes and installed SDK exports. Check `howone app --help` and
`howone app skill --help` once for the installed version. The new shared-contract flow requires CLI
`1.0.0-beta.8` and SDK `1.0.0-beta.5`; these must actually be installed/published before using it.
Older beta.7/beta.4 Apps remain valid: keep their explicit metadata and path invocation rather than
importing unavailable APIs or rebuilding resources. Git Skill updates alone do not update npm.

### Shared contracts (new action runtime)

`src/lib/actions.ts` exports `defineActions({...})` from `@howone/sdk/actions`. Define the stable
business name, description, input/output Zod schemas, read/write access, side effects and
`retry: 'manual'`. Keep the module pure: no env, server imports, database or AI readiness checks.
Its `exportContract()` produces serializable metadata; it never executes a business handler.

`src/server/actions.server.ts` binds the same definitions to handlers with `createActionHandler`
from `/server`. Reuse the SDK `withUser` integration and derive owner from `ctx.user.id`. The
handler receives validated input, can emit progress, and returns validated business output after
persistence. Web and terminal call the same action API, including image generation and saving.
The starter mounts GET `/api/actions` and POST `/api/actions/<name>`; do not add a second CLI-only
business implementation or expose every existing route automatically.

Use the installed SDK's `docs/app-actions.md` and types for exact signatures. Schemas describe JSON
wire values; no coerce/default/transform in portable contracts. Put business normalization and
cross-record checks in the server handler. Date/ObjectId values must be serialized for output.

Discover before invoking; query only the relevant capability rather than loading every schema:

```bash
howone app actions list
howone app actions describe images.generate
howone app call images.generate --input input.json --invocation-id <stable-id> --json
```

Discovery is local and credential-free. Calling requires a running App server; CLI checks its App
identity and contract hash before sending Bearer. A mismatch is a setup/version issue, not permission
to bypass the checks. The server still verifies identity and owns authorization and persistence.

### Legacy metadata (existing Apps)

The older `actions.source` typically points to `src/server/actions.ts` and exports a JSON-compatible
`{schemaVersion:1, actions:[...]}`. Declare actual method/path/input/output/auth/sideEffects and
invocation-ID behavior. This declaration does not register routes, validate requests or implement
idempotency. Keep its schemas aligned with the real validator/handler until explicitly migrating.
Call a verified local route with `howone app call /api/... --input input.json --json`.

## Generate, install and check

After checking the handler, identity, inputs/outputs and requested persistence:

```bash
howone app skill validate
howone app skill install --agent all
```

Install regenerates `.howone/app-skill/manifest.json` and `SKILL.md`, then installs the usage guide
into project Agent directories. `generate` exports without installing; it is not a required extra
step. The current command checks declaration structure, not real route behavior. Inspect existing
copies before replacing known generated content with `--force`, preserving custom guidance outside
generated files. Update removed actions too. Never include credentials, Cookie values or Mongo URLs.

When the installed CLI supports it, `howone app skill check` compares the source and generated/
installed contracts without executing business operations. A stale result calls for regeneration,
not another paid image request. A source or manifest hash cannot prove a route was tested.

## Invocation and real completion

Use the saved authorized CLI creator credential, not browser Cookie extraction or an input owner ID.
The SDK's local `cliPrincipal` bridge asks the control plane to verify App ownership and trusted UC
identity; it does not sign a browser into the App. Preserve browser Cookie/Origin protections.

Use one stable invocation ID per business intent. `manual` does not promise automatic deduplication
or recovery: inspect known run/history state before retrying an uncertain write. A forwarded header
alone is not replay safety. Never enable a proposed replayable mode without an implemented store.

The new runtime returns final JSON envelopes or SSE progress plus a single result/error terminal
frame. Success requires valid business output after requested storage; HTTP 200 or a normal EOF is
insufficient. The new CLI returns an error/unknown outcome for failure or an incomplete stream.
Older EAX-style SSE uses run_complete/run_error; inspect its actual terminal event and persistence.
Stopping client waiting is not confirmed upstream cancellation or durable background execution.

Reuse existing relevant feature evidence; do not repeat paid AI work just to generate a Skill.
Report the callable action, installed Skill location, local URL and actual verification or exact
missing dependency. Skill export does not start/deploy the server, grant other users access, or
implement public/remote App invocation. Those capabilities remain outside the local phase.
