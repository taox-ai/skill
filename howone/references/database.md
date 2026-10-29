# App-owned Mongo schema and migrations

Use the app's schema builder and native Mongo repositories. The CLI manages resources and DDL;
normal App routes manage business data. Drizzle is not the Mongo runtime in this project.

```ts
import { collection, defineDatabase, field } from '@howone/db/schema'

export const users = collection('users', { _id: field.string().min(1).max(64) })
export const notes = collection('notes', {
  ownerId: field.string().min(1).max(64), // references the verified UC users._id
  text: field.string().min(1).max(1000),
  createdAt: field.date(),
}).index('notes_owner_created', { ownerId: 1, createdAt: -1 })
export const database = defineDatabase({ users, notes })
export default database.manifest
```

Only add notes or other business collections when required. ObjectId is the default document key;
users explicitly declares its string key. Optional fields use `.optional()`. Native driver filters,
updates and indexes remain available through `db.collection('notes')`.

For example, a server repository reads only the verified user's records:

```ts
import { getAppDatabase } from '@/server/db.server'

export async function listNotes(ucUserId: string) {
  const notes = await getAppDatabase().collection('notes')
  return notes.find({ ownerId: ucUserId }).sort({ createdAt: -1 }).limit(50).toArray()
}
```

Here the repository is `src/server/notes.server.ts`; a route passes `user.id` from `protectedApi`,
never a request body/query owner. Convert Mongo IDs/dates into your response contract before JSON.

```bash
howone db validate
howone db generate
howone db migrate
howone db status
```

`generate` imports the configured schema and writes a numbered immutable snapshot such as `migrations/0000_db.json`. Unchanged schema produces no new file.
`migrate` validates snapshot hashes, App identity and the per-kind parent chain, then applies saved DB snapshots in order. It does not import the current source schema. The control plane records execution. A repeated applied hash is idempotent. No intermediate push is needed.
`db push` instead reads and applies the current source directly; it is a separate convenience path.

Current runner limits: new collections and indexes are supported; field-validator replacement,
index replacement and removals are rejected without an explicit dev archive plan. Generate is a
snapshot generator, not a complete sequential migration-script engine. `diff` currently shows local
schema and remote status rather than a complete field-level diff. Do not imply otherwise.

`--archive-existing` preserves incompatible dev collections under operation-specific archive names;
it does not transform data. Do not use it as a generic production migration. `prune-archives` requires
an explicit applied migration hash and permanently removes only its recorded archives; use it when
archive deletion is in scope and authorized. Keep normal migration history and active App data.

Runtime repositories scope every query with the current user's ID. Never accept arbitrary ownerId
from the request. For saved AI results, persist prompt, result URL, owner and timestamps needed by
the product, plus a unique run ID when replay must be deduplicated. Actual file bytes normally remain
in object storage; the database records their URL and business metadata.

The runtime wraps Mongoose models and the native driver: `await db.model('notes')` supports model
queries, validation and aggregation; `await db.collection('notes')` exposes typed native access.
Runtime creation requires the configured project shortId matching `app_<shortId>` and its restricted
credential. CLI resolves shortId to the immutable PG UUID for migration and AI histories. The URI path
is also the authentication database by default; never add `authSource=admin`. Server permissions allow only this App’s declared business collections and read-only
metadata; root/admin or cross-App credentials are rejected. Per-user ownership is still the App’s
responsibility. Automatic model/index creation is disabled; all DDL stays in the CLI.
