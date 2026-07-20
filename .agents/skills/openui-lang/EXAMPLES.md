# OpenUI Lang — examples

Each example is a complete, renderable `.openui` file. Copy-paste, adapt, save.

## Hello world (smallest renderable)

```openui
root = Stack([title, body, cta])
title = TextContent("Hello, world", "large-heavy")
body = TextContent("This is OpenUI Lang.", "default")
cta = Button("Got it", Action([@ToAssistant("ack")]), "primary")
```

## Marketing landing page

```openui
root = Stack([hero, calloutsRow, faq, finalCta], "column", "l", "stretch", "start")

hero = Card([Stack([eyebrow, headline, sub, badges], "column", "m", "center", "start")])
eyebrow = TextContent("ANNOUNCING", "small")
headline = TextContent("Sketch UIs at the speed of thought", "large-heavy")
sub = TextContent("Your AI agent writes an OpenUI Lang file. We render it live in your editor.", "default")
badges = Stack([
  Tag("v0.1.0", null, "sm", "info"),
  Tag("MIT", null, "sm", "neutral"),
], "row", "s", "center", "start")

calloutsRow = Stack([info, success, warning, danger], "column", "s", "stretch", "start")
info = Callout("info", "New", "Drop-in renderer modules. Add a format by writing one TSX file.")
success = Callout("success", "Verified", "End-to-end on VS Code, Cursor, Windsurf, VSCodium.")
warning = Callout("warning", "Heads up", "Webview bundle is 2.3 MB.")
danger = Callout("danger", "Breaking", "The renderOn=type config key is reserved but not implemented.")

faq = Card([
  TextContent("Common questions", "large-heavy"),
  Accordion([
    AccordionItem("q1", "Why preview-only?", "The extension is a faithful renderer for what your agent wrote."),
    AccordionItem("q2", "What about other formats?", "Roadmap. The renderer module architecture makes them drop-in."),
  ]),
])

finalCta = Card([
  Stack([
    TextContent("Ready to try it?", "large-heavy"),
    Buttons([
      Button("Install", Action([@ToAssistant("install")]), "primary"),
      Button("GitHub", Action([@ToAssistant("github")]), "secondary"),
    ], "row"),
  ], "column", "m", "stretch", "start"),
])
```

## Form with validation

```openui
root = Card([title, subtitle, form])
title = TextContent("Create a workspace", "large-heavy")
subtitle = TextContent("Free plan supports up to 3 projects.", "small")

form = Form("create", actions, [nameField, slugField, planField, termsField])

nameField = FormControl("Workspace name", Input("name", "Acme", "text", { required: true, minLength: 2 }))
slugField = FormControl("URL slug", Input("slug", "acme", "text", { required: true, pattern: "^[a-z0-9-]+$" }))

planField = FormControl("Plan", Select("plan", [
  SelectItem("free", "Free — up to 3 projects"),
  SelectItem("pro", "Pro — unlimited, $12/mo"),
], null, null, "free"))

termsField = FormControl("", CheckBoxItem("Terms of service", "I agree to the Terms and Privacy Policy", "terms", false))

actions = Buttons([
  Button("Cancel", Action([@ToAssistant("cancel")]), "secondary"),
  Button("Create", Action([@ToAssistant("submit")]), "primary"),
], "row")
```

## Dashboard with charts and table (static data — no toolProvider needed)

```openui
root = Stack([header, kpiRow, chartsRow, recent], "column", "l", "stretch", "start")

header = CardHeader("Last 7 days", "Renders and errors across your workspace")

kpiRow = Stack([k1, k2, k3], "row", "m", "stretch", "start", true)
k1 = Card([TextContent("Renders", "small"), TextContent("12,408", "large-heavy")])
k2 = Card([TextContent("P50 latency", "small"), TextContent("23 ms", "large-heavy")])
k3 = Card([TextContent("Errors", "small"), TextContent("47", "large-heavy")])

chartsRow = Stack([trends, breakdown], "row", "m", "stretch", "start", true)

trends = Card([
  CardHeader("Renders per day", null),
  LineChart(
    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    [Series("OpenUI", [1420, 1680, 1810, 2010, 2240, 1450, 1798])]
  ),
])

breakdown = Card([
  CardHeader("Errors by type", null),
  PieChart(["Parse", "Schema", "Network"], [27, 12, 5], "donut"),
])

recent = Card([
  CardHeader("Recent renders", null),
  Table([
    Col("File",    ["dashboard.openui", "signup.openui", "settings.openui"]),
    Col("Renders", [2410, 1820, 980], "number"),
    Col("P50 ms",  [21, 18, 27], "number"),
  ]),
])
```

## Settings tour with tabs + reactive switches

```openui
$notif_deploy = true
$notif_pr = false

root = Stack([header, mainTabs], "column", "l", "stretch", "start")

header = CardHeader("Account settings", "Notifications and preferences")

mainTabs = Tabs([generalTab, notifTab])

generalTab = TabItem("general", "General", [
  Card([
    TextContent("Display preferences", "large-heavy"),
    FormControl("Display name", Input("displayName", "Gina", "text", { required: true })),
    FormControl("Time zone", Select("tz", [
      SelectItem("utc", "UTC"),
      SelectItem("ict", "Indochina (ICT)"),
    ], null, null, "ict")),
  ]),
])

notifTab = TabItem("notifications", "Notifications", [
  Card([
    TextContent("Email me when", "large-heavy"),
    SwitchGroup("notifs", [
      SwitchItem("Deployment succeeded", null, "deploy", $notif_deploy),
      SwitchItem("Review requested", null, "pr", $notif_pr),
    ]),
  ]),
])
```

Note: `Tabs(items)` takes one arg. The second `$tab` arg from earlier OpenUI versions is no longer accepted. `SwitchItem(label, description, name, defaultChecked?)` — `name` is the third positional.

## Modal triggered by a button (reactive `$variable`)

```openui
$showInvite = false

root = Stack([landing, inviteModal], "column", "m", "stretch", "start")

landing = Card([
  TextContent("Workspace members", "large-heavy"),
  TextContent("You and 3 teammates have access.", "default"),
  Buttons([
    Button("Invite a teammate", Action([@Set($showInvite, true)]), "primary"),
  ]),
])

inviteModal = Modal("Invite teammate", $showInvite, [
  Form("invite", inviteActions, [emailField, roleField]),
])

emailField = FormControl("Email", Input("email", "name@company.com", "email", { required: true, email: true }))
roleField = FormControl("Role", Select("role", [
  SelectItem("viewer", "Viewer"),
  SelectItem("editor", "Editor"),
], null, null, "editor"))

inviteActions = Buttons([
  Button("Send invite", Action([@ToAssistant("invite"), @Set($showInvite, false)]), "primary"),
  Button("Cancel",      Action([@Set($showInvite, false)]), "secondary"),
], "row")
```

## Media gallery

```openui
root = Stack([header, gallery, code], "column", "l", "stretch", "start")

header = CardHeader("Recent prototypes", "Latest from the team this week")

gallery = Card([
  ImageGallery([
    { src: "https://placehold.co/400x300/4f46e5/ffffff?text=Dashboard", alt: "Dashboard prototype" },
    { src: "https://placehold.co/400x300/ef4444/ffffff?text=Signup",    alt: "Signup form" },
    { src: "https://placehold.co/400x300/10b981/ffffff?text=Settings",  alt: "Settings page" },
    { src: "https://placehold.co/400x300/f59e0b/ffffff?text=Billing",   alt: "Billing screen" },
  ]),
])

code = Card([
  CardHeader("It's just text", "5 lines for a complete card"),
  CodeBlock("openui", "root = Stack([title, body, cta])\ntitle = TextContent(\"Hello\", \"large-heavy\")\nbody = TextContent(\"This is OpenUI Lang.\", \"default\")\ncta = Button(\"Go\", Action([@ToAssistant(\"go\")]), \"primary\")"),
])
```

## Notes on adapting these

1. **Strip what you don't need** — these are dense to showcase capability. Real prototypes are 30-60 lines.
2. **`$variables` are optional** — only declare them when the UI needs to react to user input (form binding, modal open/close, tab switch).
3. **Always trace from `root` outward** — any variable not reachable from root is silently dropped. The renderer doesn't warn.
4. **Stick to static data unless you have a `toolProvider`** — `Query` and `Mutation` calls render placeholder data without one. The Genui extension does NOT provide a `toolProvider` in v1.
