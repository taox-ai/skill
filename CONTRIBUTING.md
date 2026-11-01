# Maintain the HowOne Skill

`howone/` is the only maintained Skill source in `taox-ai/skill`. Keep one generic Skill with a
short entrypoint and task-specific references. Add a separate Skill only for a distinct user task,
not for every framework file, CLI command, template or App.

## Content ownership

- `README.md`: installation, user entrypoint, distribution and version compatibility.
- `howone/SKILL.md`: task routing, essential platform boundaries and completion behavior.
- `howone/references/`: decisions and operations for a particular task; link from its caller.
- `howone/examples/`: a product flow, without App IDs, credentials or provisioned Releases.
- `howone/scripts/`: concrete checks that benefit from deterministic execution.
- `howone/agents/openai.yaml`: UI metadata matching the Skill; preserve implicit invocation.

Document commands supported by the actual released CLI. Read installed SDK docs/types for signatures;
do not add unreleased runtime APIs to the Skill merely because an architecture document proposes them.
Keep business-specific usage Skills generated inside Apps; this repository teaches how to deliver them.

## Check changes

```bash
node scripts/check.mjs
```

This checks required entrypoints, minimal Skill frontmatter and repository-local Markdown links.
It is a documentation check, not proof of real UC login, database operations or AI execution.
The Studio checkout maintains behavioral evaluation prompts in `packages/skills/evals/scenarios.md`.
Review new App delivery, existing-App updates, UI-only edits and missing-service recovery when changing
workflow guidance. Use approved test resources for live checks; do not generate paid images as a linter.

## Sync and distribute

Studio includes this repository as its `skills` Git submodule. After editing this source, run from
the Studio root:

```bash
node scripts/sync-howone-sdk-skill.mjs --write
node scripts/sync-howone-sdk-skill.mjs --check
```

The script produces the skills package, SDK, CLI and starter copies. Do not edit those copies as
independent sources. Check links and packaging before publication; the CLI archive must contain the
new references, and the starter AGENTS/README must point at available bundled guides.

Commit and publish the Skill repository changes before updating Studio's submodule pointer. Review
both repositories' staged content so a new reference is not left untracked. Git Skill publication,
Studio source submission and npm publication are separate operations. Publish only when authorized;
report the exact Git revision and npm versions actually released.
