#!/usr/bin/env node
/**
 * Publish-content orchestrator.
 *
 * For new entries in content/{posts,projects,gallery}/ that aren't yet listed in
 * app/not-found.tsx's `destinations` array:
 *   1. optimize-images
 *   2. backfill_alt_and_tldr.py  (TL;DRs + LLM-generated shortName per entry)
 *   3. build_graph.py
 *   4. interactive review of each shortName, then patch not-found.tsx
 *
 * Idempotent — re-runs do nothing if there are no new slugs.
 */

import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const APP_DIR = path.join(__dirname, '..')

// ─── Output formatting ─────────────────────────────────────────────────────

const useColor = process.stdout.isTTY && !process.env.NO_COLOR
const ansi = (code) => (s) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : s)
const dim = ansi('2')
const bold = ansi('1')
const cyan = ansi('36')
const green = ansi('32')
const yellow = ansi('33')
const red = ansi('31')
const magenta = ansi('35')

const TOTAL_STEPS = 4
const stepStart = []

function fmtElapsed(ms) {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function progressBar(done, total, width = 24) {
  const filled = Math.round((done / total) * width)
  const bar = '█'.repeat(filled) + '░'.repeat(width - filled)
  const pct = Math.round((done / total) * 100)
  return `${cyan(bar)} ${dim(`${pct}%`)}`
}

function step(n, label) {
  stepStart[n] = Date.now()
  const counter = bold(cyan(`[${n}/${TOTAL_STEPS}]`))
  console.log(`\n${counter} ${bold(label)}`)
  console.log(`  ${progressBar(n - 1, TOTAL_STEPS)}\n`)
}

function stepDone(n) {
  const ms = Date.now() - stepStart[n]
  console.log(`\n  ${green('✓')} ${dim(`step ${n} completed in ${fmtElapsed(ms)}`)}`)
  console.log(`  ${progressBar(n, TOTAL_STEPS)}`)
}
const CONTENT_DIR = path.join(APP_DIR, 'content')
const NOT_FOUND_PATH = path.join(APP_DIR, 'app', 'not-found.tsx')
const SUMMARIES_PATH = path.join(CONTENT_DIR, 'generated', 'section-summaries.json')

const TYPES = [
  { dir: 'posts', kind: 'post', urlPrefix: '/blog/', section: '// Blog' },
  { dir: 'projects', kind: 'project', urlPrefix: '/projects/', section: '// Projects' },
  { dir: 'gallery', kind: 'gallery', urlPrefix: '/gallery/', section: '// Gallery' },
]

// ─── Utilities ─────────────────────────────────────────────────────────────

function listSlugs(dir) {
  const full = path.join(CONTENT_DIR, dir)
  if (!fs.existsSync(full)) return []
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''))
    .filter((s) => !/_zh-tw$/i.test(s))
    .filter((s) => !s.startsWith('.') && !s.startsWith('_'))
}

function readNotFound() {
  return fs.readFileSync(NOT_FOUND_PATH, 'utf8')
}

function existingPaths(source) {
  const paths = new Set()
  for (const m of source.matchAll(/path:\s*"([^"]+)"/g)) paths.add(m[1])
  return paths
}

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', cwd: APP_DIR, ...opts })
    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${cmd} ${args.join(' ')} exited ${code}`))
    })
  })
}

function pythonBin() {
  const venvPy = path.join(APP_DIR, '.venv', 'bin', 'python3')
  return fs.existsSync(venvPy) ? venvPy : 'python3'
}

function loadSummaries() {
  if (!fs.existsSync(SUMMARIES_PATH)) return {}
  try {
    return JSON.parse(fs.readFileSync(SUMMARIES_PATH, 'utf8'))
  } catch {
    return {}
  }
}

function frontmatterTitle(slug, dir) {
  const file = path.join(CONTENT_DIR, dir, `${slug}.md`)
  if (!fs.existsSync(file)) return slug
  const text = fs.readFileSync(file, 'utf8')
  const m = text.match(/^---\s*\n([\s\S]*?)\n---/)
  if (!m) return slug
  const t = m[1].match(/^title:\s*["']?(.+?)["']?\s*$/m)
  return t ? t[1] : slug
}

// Insert one `{ label, path }` line into the right section of not-found.tsx.
// Section is delimited by `// <Name>` comment and the next `// ` comment or `];`.
function insertEntry(source, sectionMarker, label, urlPath) {
  const sectionIdx = source.indexOf(sectionMarker)
  if (sectionIdx === -1) {
    throw new Error(`Could not find section marker ${sectionMarker} in not-found.tsx`)
  }
  // End of section = next "// " comment after sectionMarker, or `];`
  const tail = source.slice(sectionIdx + sectionMarker.length)
  const nextCommentRel = tail.search(/\n\s*\/\/\s/)
  const closerRel = tail.indexOf('];')
  const endRel =
    nextCommentRel !== -1 && nextCommentRel < closerRel ? nextCommentRel : closerRel
  const endIdx = sectionIdx + sectionMarker.length + endRel

  // Walk back from endIdx to find the last item line; insert right after it.
  // Items end with "},\n". Find the last such occurrence in [sectionIdx, endIdx].
  const slice = source.slice(sectionIdx, endIdx)
  const lastItemRel = slice.lastIndexOf('},')
  if (lastItemRel === -1) {
    throw new Error(`No existing items in section ${sectionMarker}`)
  }
  const insertAt = sectionIdx + lastItemRel + 2 // after "},"
  const escapedLabel = label.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  const newLine = `\n  { label: "${escapedLabel}", path: "${urlPath}" },`
  return source.slice(0, insertAt) + newLine + source.slice(insertAt)
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const wallStart = Date.now()
  console.log(`${bold(cyan('◆'))} ${bold('publish-content')} ${dim('· portfolio pipeline')}`)
  console.log(dim('  Scanning content for new entries...'))

  const source = readNotFound()
  const known = existingPaths(source)

  const newEntries = []
  for (const t of TYPES) {
    for (const slug of listSlugs(t.dir)) {
      if (!known.has(`${t.urlPrefix}${slug}`)) {
        newEntries.push({ ...t, slug })
      }
    }
  }

  if (newEntries.length === 0) {
    console.log(`\n  ${green('✓')} No new entries. Nothing to publish.`)
    return
  }

  console.log(
    `\n  ${green('●')} ${bold(newEntries.length)} new ${newEntries.length === 1 ? 'entry' : 'entries'}:`,
  )
  for (const e of newEntries) {
    const tag = e.kind === 'post' ? cyan('post') : e.kind === 'project' ? magenta('project') : yellow('gallery')
    console.log(`    ${dim('•')} ${tag} ${dim('·')} ${e.slug}`)
  }

  // 1. Image optimization
  step(1, '📷 Optimizing images')
  await run('node', ['scripts/optimize-images.js'])
  stepDone(1)

  // 2. TL;DRs + shortName generation
  step(2, '✍️  Generating TL;DRs & short names ' + dim('(OpenRouter)'))
  await run(pythonBin(), ['scripts/backfill_alt_and_tldr.py'])
  stepDone(2)

  // 3. Knowledge graph
  step(3, '🕸️  Rebuilding knowledge graph')
  await run(pythonBin(), ['scripts/build_graph.py'])
  stepDone(3)

  // 4. Interactive shortName review + patch not-found.tsx
  step(4, '📝 Reviewing rangefinder labels')
  const summaries = loadSummaries()
  const rl = readline.createInterface({ input, output })

  let patched = readNotFound()
  const applied = []
  try {
    for (let i = 0; i < newEntries.length; i++) {
      const e = newEntries[i]
      const key = `${e.kind}/${e.slug}/en`
      const suggested = summaries[key]?.shortName?.trim() || frontmatterTitle(e.slug, e.dir)
      const counter = dim(`(${i + 1}/${newEntries.length})`)
      const tag = e.kind === 'post' ? cyan('post') : e.kind === 'project' ? magenta('project') : yellow('gallery')
      console.log(`\n  ${counter} ${tag} ${dim('·')} ${e.slug}`)
      console.log(`        ${dim('suggested:')} ${bold(`"${suggested}"`)}`)
      const answer = (
        await rl.question(`        ${dim('Enter to accept, or type new label:')} `)
      ).trim()
      const label = answer || suggested
      patched = insertEntry(patched, e.section, label, `${e.urlPrefix}${e.slug}`)
      applied.push({ ...e, label })
      console.log(`        ${green('✓')} ${green(`"${label}"`)}`)
    }
  } finally {
    rl.close()
  }

  fs.writeFileSync(NOT_FOUND_PATH, patched, 'utf8')
  stepDone(4)

  console.log(`\n${bold(green('✔'))} ${bold('Pipeline complete')} ${dim(`· ${fmtElapsed(Date.now() - wallStart)}`)}`)
  console.log(dim(`  Patched app/not-found.tsx (${applied.length} entr${applied.length === 1 ? 'y' : 'ies'})`))
  console.log(dim('  Review diff: git diff app/not-found.tsx'))
}

main().catch((err) => {
  console.error('\n❌ publish-content failed:', err.message)
  process.exit(1)
})
