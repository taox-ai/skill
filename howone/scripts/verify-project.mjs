#!/usr/bin/env node
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

const root = path.resolve(process.argv[2] || process.cwd())
// Resolve dependencies from the App, including when this Skill is installed globally.
const require = createRequire(path.join(root, 'package.json'))
const errors = [],
  warnings = []
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8')
let project, pkg, canonicalAppId
try {
  const { parse } = require('yaml')
  project = parse(read('howone.yaml'))
  pkg = JSON.parse(read('package.json'))
} catch (error) {
  console.error(error.message)
  process.exit(1)
}
if (!project.project?.appId) errors.push('Missing project.appId')
if (project.database?.mode !== 'app_owned' || project.database?.engine !== 'mongodb')
  errors.push('Expected app-owned MongoDB')
if (project.profile !== 'dev') errors.push('Only dev is currently supported')
for (const name of [project.database?.schema, project.ai?.source, 'src/lib/sdk.ts']) {
  if (!name || !fs.existsSync(path.resolve(root, name)))
    errors.push(`Missing project source: ${name}`)
}
if (!['src/server/auth.server.ts'].some((name) => fs.existsSync(path.join(root, name))))
  errors.push('Missing server auth integration source')
for (const name of [
  '@howone/sdk/auth',
  '@howone/sdk/ai',
  '@howone/sdk/server',
  '@howone/db/schema',
]) {
  try {
    require.resolve(name)
  } catch {
    errors.push(`Dependency export unavailable: ${name}; run bun install`)
  }
}
try {
  const app = JSON.parse(read('.howone/app.json'))
  canonicalAppId = app.appId
  if ((app.appId !== project.project.appId && app.shortId !== project.project.appId) || app.identity !== 'uc')
    errors.push('App contract does not match howone.yaml / UC identity')
} catch {
  errors.push('Missing or invalid .howone/app.json')
}
const aiPath = path.join(root, 'src/lib/generated/ai-manifest.json')
if (fs.existsSync(aiPath)) {
  try {
    const ai = JSON.parse(fs.readFileSync(aiPath, 'utf8'))
    if (ai.appId !== (canonicalAppId || project.project.appId) || !ai.releaseId || !ai.releaseHash)
      errors.push('AI release does not match this App')
    if (
      !Array.isArray(ai.capabilities) ||
      ai.capabilities.some((c) => !c.workflowId || !c.inputSchema || !c.outputSchema)
    )
      errors.push('Invalid synced AI capability contract')
  } catch {
    errors.push('Invalid AI manifest')
  }
} else warnings.push('No AI Release synced; expected until an AI feature is requested')
if (!fs.existsSync(path.join(root, '.env.local')))
  warnings.push('No local server env; real platform capabilities require configuration')
console.log(
  JSON.stringify(
    {
      ok: errors.length === 0,
      check: 'static-project-contract',
      appId: project.project?.appId,
      errors,
      warnings,
    },
    null,
    2,
  ),
)
if (errors.length) process.exitCode = 1
