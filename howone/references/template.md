# Work in the App starter

Read the project's `AGENTS.md`, `howone.yaml`, `package.json` and the affected files first. Use the
installed package docs and actual CLI help; the clean starter and a previously generated App may
be on different versions. Preserve working behavior, App identity, bindings and business records.

## Find the edit point

| Change | Default location |
|---|---|
| Pages and navigation | `src/routes/*.tsx`; compose the page in its file route |
| HTTP APIs | `src/routes/api/*`; thin request/response adapters |
| Reusable product UI | `src/components`; the starter's login form is here |
| UI primitives | `src/components/ui`; official shadcn source, import only what the screen uses |
| Browser SDK, query hooks, pure validators and types | `src/lib` |
| UC, Mongo, EAX adapters and business repositories | `src/server/*.server.ts` |
| Database declaration | `database.schema` in YAML; default `src/server/schema.ts` |
| AI authoring declaration | `ai.source`; default `src/server/capabilities.ts` |
| App usage contract | `actions.source`; new default `src/lib/actions.ts`; legacy Apps may use `src/server/actions.ts` |
| Local UI state | `src/store`; keep sessions and remote data in TanStack Query |

Keep `routes/components/lib/server/store` as the initial layout. Add a module when a real feature
needs it; do not pre-create CRUD layers, per-feature folders, business tables or a generic service
framework. TanStack pages live in `routes`, not another `pages` directory. Small page components
can remain in their route; extract reusable UI as it becomes useful.

The default starter includes only a `users` declaration plus empty AI and App action declarations.
The homepage can render before resources are initialized. Build the requested business rather than
copying a Todo fixture, its IDs or a pre-existing AI Release. Initialize only needed resources.

## Keep boundaries visible

Browser components import browser-safe `lib` modules and UI. Server Routes import server adapters;
server adapters access UC/Mongo/EAX. Browser code must not import `.server.ts`, Mongo runtime,
server credentials or AI execution tokens. Public Vite values come from the explicit YAML allowlist;
never expose the whole environment or config object. The SDK receives resolved configuration.

Shared validators and types can live in `lib`, but must not initialize platform services. Keep AI
readiness checks beside execution, so reading a contract does not require a provisioned workflow.
Use the installed SDK contract. Shared `defineActions` and `createActionHandler` require the new
SDK/CLI pair documented in [App Skill delivery](app-skill.md); legacy Apps keep their working routes.

Keep HTTP handlers small. Validate inputs and derive the user from the server auth integration;
business functions own queries, AI orchestration and persistence. Reuse that business function for
Web and terminal APIs. New shared contracts drive validation, capability export and usage guidance through the server
action runtime. Legacy `server/actions.ts` metadata only describes routes; it provides no runtime
validation, authorization, idempotency or route registration by itself.

Root providers create Query and UI state per rendered app. Do not put mutable per-user state in
server module singletons; server connection factories can cache their connection/runtime. Use the
existing auth client and one consistent session query key when adding authenticated pages.

## Components, generated files and delivery

The template ships all shadcn components selected for its CLI release (currently 63 source files).
Keep the library available and import the needed components directly; do not read or mount the
entire library to build one screen. Reuse its tokens and variants before adding global CSS overrides.
`components.json` is the installation configuration; future component updates use the official CLI.

`src/routeTree.gen.ts` is Router-generated. `src/lib/generated/ai-manifest.json` is written by
`howone ai sync`. CLI migrations and `.howone` bindings have their own owners; do not hand-edit
IDs, runtime snapshots or hashes to make checks pass. `.env` and credential bindings stay ignored.

Run the changed feature's checks; the starter provides `typecheck`, `build` and `verify`. Verify
user-facing behavior and persistence where relevant. A new or changed callable business API also
follows [App Skill delivery](app-skill.md). A visual-only edit needs no resource migration or AI run.
