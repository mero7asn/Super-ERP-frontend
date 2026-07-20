---
name: openui-lang
description: Author valid OpenUI Lang (.openui) files for live preview via the Genui VS Code extension or @openuidev/react-lang renderer. Use when generating a UI prototype, writing a .openui file, mocking up a screen for design review, or when the user mentions OpenUI Lang, Genui, generative UI, or asks for a UI sketch to preview.
---

# OpenUI Lang

OpenUI Lang is a compact declarative DSL for UI prototypes. Each `.openui` file describes one screen. An AI agent writes the file; a renderer (the Genui VS Code extension, the OpenUI playground, or a React app embedding `@openuidev/react-lang`) renders it live.

## The 5 rules that matter

1. **`root = Stack([...])` is the entry point.** Every program must define it. UI shell appears first; data fills in.
2. **Each statement on its own line:** `identifier = Expression`. References can be forward-declared (hoisted).
3. **Arguments are POSITIONAL. NO object/colon syntax in component calls.** Write `Stack([kids], "row", "l")` — NOT `Stack({direction: "row"})`. The parser silently drops object args.
4. **Every variable must be reachable from `root`.** Define a variable but forget to reference it from a parent's array → it's silently dropped.
5. **Strings only:** double quotes with backslash escaping.

## Quick start — minimal renderable file

```openui
root = Stack([title, body, cta])
title = TextContent("Hello, world", "large-heavy")
body = TextContent("This is OpenUI Lang. Edit me, save, and see the preview update.", "default")
cta = Button("Got it", Action([@ToAssistant("ack")]), "primary")
```

## Workflow

1. **Read [REFERENCE.md](REFERENCE.md) first** — verified positional signatures for every component, with corrections that the upstream `generatePrompt()` doc misses ([spec.txt](spec.txt) has "undefined" placeholders for some type names).
2. **Draft** the `.openui` file following the 5 rules above. Place `root = Stack(...)` first.
3. **Run the validator first:** `node scripts/validate.mjs path/to/file.openui` runs the streaming parser AND surfaces schema errors from `meta.errors`. It catches most write-time bugs without needing a render:
   - `missing-required` — wrong positional arg count (e.g. `AccordionItem("title", "body")` — missing third arg `content`)
   - `unknown-component` — name typo (e.g. `StepItem` vs `StepsItem`)
   - parse warnings: orphaned vars (defined, never referenced), unresolved references
4. **What the validator still misses — verify in Genui:** the red error banner with `[Jump →]` is the final source of truth. The validator can't catch:
   - "expected one of ..." — invalid enum value (e.g. `Callout("alert", ...)` — should be `"warning"`)
   - Wrong positional ORDER when count is right (e.g. `Image("url-only")` — parser accepts it as a 1-arg call satisfying `alt`, semantics reversed)
   - Runtime-only errors (Query/Mutation, action handlers)
5. **Reach for [EXAMPLES.md](EXAMPLES.md)** when starting from a similar shape (form, dashboard, landing page, settings, modal flow).

## Pitfalls that bite (the catalog of "we learned this the hard way")

### Names that differ from intuition

- **`StepsItem`** — NOT `StepItem`. Has an extra `s`. Used inside `Steps`.
- **`Slice`** — NOT `ChartSlice`. Used for one slice of a pie/radial chart.
- **`Point`** — NOT `DataPoint`. Used inside `ScatterSeries`.

### Positional order is the Zod schema field order

The renderer maps positional args to Zod schema fields in declaration order. This means some signatures are not what you'd guess from the React component's TypeScript props:

- **`Callout(variant, title, description)`** — variant FIRST. Valid variants: `"info" | "success" | "warning" | "danger" | "neutral"` (NOT `"alert"` or `"error"`).
- **`Image(alt, src)`** — `alt` FIRST (required), `src` optional. Backwards from typical HTML.
- **`AccordionItem(value, trigger, content)`** — three required positional strings (or content can be a component).
- **`TabItem(value, trigger, content)`** — same shape: unique id, label, children array.
- **`RadioItem(label, description, value)`** — three required strings. `value` is the third positional, not first.
- **`CheckBoxItem(label, description, name, defaultChecked?)`** — `name` is the **third** positional. No `rules` field.
- **`SwitchItem(label?, description?, name, defaultChecked?)`** — `name` is the **third** positional. Pass `null` for label/description if omitting.
- **`Tag(value, icon, size, variant)`** — `"sm"` is a SIZE, not a variant. Variants are `"info" | "success" | "warning" | "danger" | "neutral"`.
- **`Form(name, buttons, fields)`** — `buttons` is the **second** arg (a `Buttons` reference). `fields` is third.
- **`StepsItem(title, details)`** — both required. `details` is descriptive text, NOT a status enum like "done"/"pending".

### No controlled-state second arg

- **`Tabs(items)`** — takes only the items array. NO second `$value` arg for controlled state. Tab switching is internal to the component.

### Object literals ARE valid (only) as data

Object/colon syntax silently breaks for component CALLS. But object literals ARE valid as data values inside arrays:

- **`ImageGallery([{ src: "...", alt: "..." }, ...])`** — items are `{src, alt, details?}` literals.
- **`Input("name", "placeholder", "text", { required: true, minLength: 8 })`** — the `rules` arg is an object literal because it's a data structure, not a component call.

### Other gotchas

- **Color tokens, variants, sizes are short canonical strings** — never localized labels. `"large-heavy"` not `"Large Heavy"`.
- **Workspace must include the file's folder** for the Genui extension's watcher to fire on save (PRD §6.1).
- **`@openuidev/react-headless@0.8.1` is a peer dep of react-ui** — must be installed alongside react-lang + react-ui or rendering crashes silently.

## Advanced

See [REFERENCE.md](REFERENCE.md) for the full component catalog with verified signatures, and [EXAMPLES.md](EXAMPLES.md) for ready-to-adapt scenes (landing page, form, dashboard, settings tour, modal flow, media gallery).

If you're authoring for a non-OpenUI library (`@openuidev/react-ui` is the default), the same syntax rules apply but the component set differs — generate a fresh spec via `generatePrompt(yourLibrary)` from `@openuidev/react-lang`.
