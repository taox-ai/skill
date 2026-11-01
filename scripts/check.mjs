import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const issues = []
const skill = path.join(root, 'howone/SKILL.md')

if (!fs.existsSync(skill)) issues.push('Missing howone/SKILL.md')
else {
  const content = fs.readFileSync(skill, 'utf8')
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(content)?.[1]
  if (!frontmatter) issues.push('Missing Skill frontmatter')
  else {
    if (!/^name:\s*howone\s*$/m.test(frontmatter)) issues.push('Expected Skill name: howone')
    if (!/^description:\s*\S.+$/m.test(frontmatter)) issues.push('Missing Skill description')
  }
}

function markdownFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith('.')) return []
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) return markdownFiles(file)
    return entry.isFile() && entry.name.endsWith('.md') ? [file] : []
  })
}

const files = markdownFiles(root)
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8')
  for (const match of content.matchAll(/\]\(([^)]+)\)/g)) {
    const target = match[1].replace(/^<|>$/g, '')
    if (/^(?:[a-z][a-z0-9+.-]*:|#)/i.test(target)) continue
    const relative = decodeURIComponent(target.split('#')[0])
    if (!relative) continue
    const absolute = path.resolve(path.dirname(file), relative)
    if (!absolute.startsWith(`${root}${path.sep}`)) {
      issues.push(`${path.relative(root, file)}: link leaves repository: ${target}`)
    } else if (!fs.existsSync(absolute)) {
      issues.push(`${path.relative(root, file)}: missing link: ${target}`)
    }
  }
}

if (issues.length) {
  console.error(issues.join('\n'))
  process.exitCode = 1
} else console.log(`HowOne Skill entrypoint and local links passed (${files.length} Markdown files).`)
