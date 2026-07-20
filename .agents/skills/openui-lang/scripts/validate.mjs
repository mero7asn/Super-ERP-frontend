#!/usr/bin/env node
// validate.mjs — parse + schema check for .openui files.
//
// Catches the error categories the streaming parser surfaces in `meta.errors`:
//   - "missing required field" (wrong positional arg count → required prop unset)
//   - "Unknown component" (typo on a component name)
//   - parse warnings: orphaned variables, unresolved references
//
// What it still MISSES (only surface at render time):
//   - Invalid enum values (e.g. Tag size "wrongsize")
//   - Wrong positional ORDER when count is right (e.g. Image("url-only") —
//     parser accepts it as a 1-arg call satisfying the first required prop,
//     even though semantics are reversed)
//   - Runtime-only errors (Query/Mutation failures, action handler issues)
//
// For full validation, render in the Genui VS Code extension — the red error
// banner with jump-to-line is the source of truth.
//
// Usage: node validate.mjs <path-to-openui-file> [...]

import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const filePaths = process.argv.slice(2)
if (filePaths.length === 0) {
  console.error('usage: validate.mjs <path-to-openui-file> [...]')
  process.exit(2)
}

let openuiLibrary
let createStreamingParser
try {
  ;({ openuiLibrary } = await import('@openuidev/react-ui/genui-lib'))
  ;({ createStreamingParser } = await import('@openuidev/react-lang'))
} catch (e) {
  console.error(`could not import @openuidev/*: ${e.message}`)
  process.exit(2)
}

let totalFailed = 0

for (const filePath of filePaths) {
  let source
  try {
    source = await readFile(resolve(filePath), 'utf8')
  } catch (e) {
    console.error(`${filePath}: could not read — ${e.message}`)
    totalFailed++
    continue
  }

  try {
    const sp = createStreamingParser(openuiLibrary.toJSONSchema(), openuiLibrary.root)
    const result = sp.set(source)
    if (!result?.root) {
      console.error(`${filePath}: parsed but produced no renderable root`)
      totalFailed++
      continue
    }
    const orphaned = result.meta?.orphaned ?? []
    const unresolved = result.meta?.unresolved ?? []
    const errors = result.meta?.errors ?? []

    if (errors.length > 0 || orphaned.length > 0 || unresolved.length > 0) {
      console.error(`${filePath}:`)
      for (const e of errors) {
        const where = e.statementId ? ` in \`${e.statementId}\`` : ''
        const path = e.path ? ` (at ${e.path})` : ''
        console.error(`  ✖ ${e.code}${where}: ${e.message}${path}`)
      }
      for (const o of orphaned) console.error(`  ⚠ orphaned (unreferenced from root): ${o}`)
      for (const u of unresolved) console.error(`  ⚠ unresolved reference: ${u}`)
      totalFailed++
      continue
    }
    console.log(`${filePath}: ok (parse + schema — enum values still verified by Genui at render time)`)
  } catch (e) {
    console.error(`${filePath}: parser threw — ${e.message}`)
    totalFailed++
  }
}

process.exit(totalFailed > 0 ? 1 : 0)
