# AI capability generation and SDK handoff

Declare a stable capability name, description, inputSchema and outputSchema in the configured
`src/server/capabilities.ts`. Workflow output schemas describe results, not database DDL.

```ts
export default {
  mode: 'create',
  capability: [{
    name: 'generateImage',
    description: 'Generate one image from a scene description and return its accessible URL.',
    inputSchema: { type: 'object', properties: {
      prompt: { type: 'string', description: 'Desired scene, style and composition.' },
    }, required: ['prompt'], additionalProperties: false },
    outputSchema: { type: 'object', properties: {
      generated_image_url: { type: 'string', format: 'uri', description: 'Accessible HTTP(S) image URL.' },
    }, required: ['generated_image_url'], additionalProperties: false },
  }],
}
```

Input/output field names must not overlap because AI service wires edges by parameter name. File fields
use accessible URLs. Describe the product result and avoid database writes, authentication or UI
steps in the workflow. The service supports text work, image generation/editing/analysis and other
catalogued workflows; inspect the operator's service contract before promising a new media family.

```bash
howone ai validate
howone ai generate
howone ai migrate
howone ai status --job <returned-job-id>
# Continue component/API/repository work while polling status; do not resubmit the same job.
howone ai sync --job <returned-job-id>
howone ai init
```

Generate writes a numbered snapshot such as migrations/0001_ai.json and retains workflow IDs; an unchanged contract creates no new file. Migrate returns a job ID, not a ready workflow. Poll until completed,
failed, canceled or invalid_request; report real errors. Never replace failure with a static result.
AI migrate submits the latest complete saved contract; it returns a job ID. It does not execute older AI authoring jobs in sequence.
Sync requires completed + published and verifies project/Release identity, then writes
`src/lib/generated/ai-manifest.json`. Preserve previous bindings until a new result is verified.

After sync, bind the action from its manifest; `defineAiAction` takes **Zod schemas**, not raw JSON Schema.
For this image contract, `src/lib/image-actions.ts` can contain:

```ts
import { defineAiAction } from '@howone/sdk/ai'
import { z } from 'zod'
import manifest from '@/lib/generated/ai-manifest.json'

export const imageInput = z.object({ prompt: z.string().trim().min(1).max(2000) }).strict()
export const imageOutput = z.object({
  generated_image_url: z.url().refine(value => ['http:', 'https:'].includes(new URL(value).protocol)),
})
const capability = manifest.capabilities.find(item => item.name === 'generateImage')!
if (capability?.setupStatus !== 'ready') throw new Error('Sync a ready generateImage capability')
export const imageActions = {
  generateImage: defineAiAction('generateImage', {
    workflowId: capability.workflowId, inputSchema: imageInput, outputSchema: imageOutput,
  }),
}
```

Compose those actions in the existing `src/lib/sdk.ts` with
`withAiActions(createAppAiClient({ projectId: manifest.appId }), imageActions)`; keep its auth client.
Components call `howone.ai.generateImage.run({ prompt }, { signal, onProgress })`. For another
capability, derive names and schemas from its synced contract rather than copying image fields.

The browser transport is same-origin. The App API validates inputs and the known App/workflow,
authenticates its UC Cookie and calls the server's `createAiRuntime` with the CLI-synced manifest.
Release/hash/config IDs pin execution; credentials never enter the browser. The starter supplies
`createAppAiRuntime(manifest)` in `src/server/ai.server.ts`, but does not invent an AI binding before sync.

The verified image example takes one scene description and returns one `generated_image_url`.
Reference images or batch behavior require matching supported contracts; do not promise them merely
by adding UI controls. Output only the fields the product uses. Dimensions belong in supported
service size parameters, not prompt text.

If saved output/history is required, add an App business collection via db generate/migrate. Derive
owner from UC, save verified server results before publishing completion, deduplicate by run ID and
scope history to the user. Browser state alone is not durable storage. A Node stream can continue
saving after browser disconnection, but process restart requires a durable worker/reconciliation
plan; do not claim that a detached promise survives deployment or Vite restart.

Current runtime defaults allow up to 15 minutes; stopping browser waiting does not prove that the
upstream task was cancelled. Submission/execute errors and credit errors are real UI states.

## AI capability design operations

HowOne records a local AI contract and the opaque references returned by the external AI service. It
does not reproduce or renumber that service's internal version, revision, generation or Release
lifecycle.

Read-only capability operations are:

```text
get_current_ai_capabilities
get_ai_capability
get_current_ai_version
list_ai_capability_versions
get_ai_capability_version
get_ai_artifacts
```

HowOne contract operations are:

```text
create_capability
update_capability
delete_capability
deprecate_capability
apply_capability_patch
restore_capability_version
```

Use `create_capability` for a new capability and `update_capability` for editing an existing one.
An update must carry the existing manifest's `workflowId`; never turn a failed update into a new
create. Deletion and deprecation are contract operations: prefer `deprecate_capability` while source
code still references a capability, and delete only after references and runtime bindings are gone.
`restore_capability_version` restores a HowOne contract snapshot, not the external service's runtime
data or internal version.

External workflow authoring uses `create` for a new workflow and `update` for an existing workflow.
Keep one request's operations in one mode and do not mix create/update. When a request changes several
capabilities, build one complete patch/snapshot and submit it once. `howone ai generate` writes the
local snapshot; `howone ai migrate` submits the latest complete snapshot. The snapshot may record
service job, workflow and Release IDs/hashes as opaque metadata, but HowOne does not manage those IDs.
