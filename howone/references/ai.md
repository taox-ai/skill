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

The default browser client posts to `/api/ai/workflow/execute/{projectId}/{workflowId}`. Implement
the matching TanStack Server Route when adding AI: the starter provides the runtime factory, not
this business endpoint. Use `manifest.appId` as the client project ID, check the path against that
manifest on the server, validate the submitted `inputs`, and return the authenticated SSE response.
Read the installed SDK's `docs/app-ai.md` for its exact body and route example. A 404 at this App path
usually means the route is absent or mismatched; it is not evidence that authoring needs resubmission.

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

## Edit an existing workflow

The CLI authoring source accepts `mode: 'create'` or `mode: 'update'`. For an edit, keep the capability's
stable name and existing `workflowId` from the previous generated snapshot or synced manifest:

```ts
export default {
  mode: 'update',
  capability: [{
    name: 'generateImage',
    workflowId: existingWorkflowId,
    description: 'Updated product behavior',
    inputSchema,
    outputSchema,
  }],
}
```

Change the configured source, then use the same `validate → generate → migrate → status → sync`
flow. Generate reuses the previous snapshot's workflow ID for the same capability name when the
source omits it. Do not rename or remove the identity to work around an authoring failure.
A new capability uses `create`; keep each submission in one mode and submit related edits together.

HowOne records JSON contracts and opaque service references; it does not manage EAX's internal
version numbers. There are no CLI delete, deprecate or restore workflow commands in this release.
Studio's internal AI contract operations are not CLI subcommands. Removing an action from app code
or restoring a Git snapshot alone does not delete or roll back a remote workflow.

Resume from the job recorded in `migrations/.ai-receipt.json` after a session interruption. Query
its status before submitting again; keep the previous manifest until the replacement is published
and verified by sync.
