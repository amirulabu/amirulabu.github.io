---
name: browser-automation
description: >
  Browser automation via Chrome DevTools using chrome-devtools-axi. Use when the
  user needs to automate browser interactions, navigate web pages, click elements,
  fill forms, take screenshots, extract data, debug console/network activity, run
  Lighthouse audits, or control a Chrome/Chromium browser programmatically.
allowed-tools: Bash(npx -y chrome-devtools-axi:*)
---

# Browser Automation with chrome-devtools-axi

Run `npx -y chrome-devtools-axi` for browser automation. No global install needed — `npx -y` handles it.

## Quick Start

```bash
# Open a page
npx -y chrome-devtools-axi open https://example.com

# Take a snapshot of current page state
npx -y chrome-devtools-axi snapshot

# Click an element (ref from snapshot, e.g. @1)
npx -y chrome-devtools-axi click @1

# Fill a form field
npx -y chrome-devtools-axi fill @2 "user@example.com"

# Evaluate JavaScript
npx -y chrome-devtools-axi eval "document.title"

# Take a screenshot
npx -y chrome-devtools-axi screenshot ./page.png

# Close when done
npx -y chrome-devtools-axi stop
```

## How It Works

```
┌───────────────────────┐
│  chrome-devtools-axi  │  CLI — parse args, format output
└──────────┬────────────┘
           │ HTTP (localhost:9224)
           ▼
┌───────────────────────┐
│     Bridge Server     │  Persistent process, manages MCP session
└──────────┬────────────┘
           │ stdio
           ▼
┌───────────────────────┐
│  chrome-devtools-mcp  │  Headless Chrome via DevTools Protocol
└───────────────────────┘
```

- **Persistent bridge** — starts on first command, stays alive across invocations
- **Auto-lifecycle** — bridge PID written to `~/.chrome-devtools-axi/bridge.pid`
- **TOON encoding** — token-efficient structured output (~40% savings vs JSON)
- **Contextual suggestions** — every response includes actionable next-step hints

## Navigation

| Command             | Description                                     |
| ------------------- | ----------------------------------------------- |
| `open <url>`        | Navigate to URL and snapshot                    |
| `snapshot`          | Capture current page state (accessibility tree) |
| `screenshot <path>` | Save a screenshot to a file                     |
| `scroll <dir>`      | Scroll: up, down, top, bottom                   |
| `back`              | Navigate back                                   |
| `wait <ms\|text>`   | Wait for time or text to appear                 |
| `eval <js>`         | Evaluate a JavaScript expression or function    |
| `run`               | Execute a multi-step script from stdin          |

`eval` wraps plain input as `() => (<expr>)`. For multi-statement logic, pass an arrow function or IIFE:

```bash
npx -y chrome-devtools-axi eval "document.title"
npx -y chrome-devtools-axi eval "(() => { const rows = [...document.querySelectorAll('tr')]; return rows.map(r => r.textContent) })()"
```

## Interaction

| Command                    | Description                                        |
| -------------------------- | -------------------------------------------------- |
| `click @<uid>`             | Click an element by ref                            |
| `fill @<uid> <text>`       | Fill a form field                                  |
| `type <text>`              | Type text at current focus                         |
| `press <key>`              | Press a keyboard key (Enter, Tab, ArrowDown, etc.) |
| `hover @<uid>`             | Hover over an element                              |
| `drag @<from> @<to>`       | Drag an element onto another                       |
| `fillform @<uid>=<val>...` | Fill multiple form fields at once                  |
| `dialog <accept\|dismiss>` | Handle a browser dialog                            |
| `upload @<uid> <path>`     | Upload a file through an input                     |

## Page Management

| Command           | Description                 |
| ----------------- | --------------------------- |
| `pages`           | List all open tabs          |
| `newpage <url>`   | Open a new tab              |
| `selectpage <id>` | Switch to a tab by ID       |
| `closepage <id>`  | Close a tab by ID           |
| `resize <w> <h>`  | Resize the browser viewport |

## Emulation

| Command   | Description                     |
| --------- | ------------------------------- |
| `emulate` | Emulate device/network/viewport |

Emulation flags:

```bash
npx -y chrome-devtools-axi emulate --viewport "390x844x3,mobile"
npx -y chrome-devtools-axi emulate --color-scheme dark
npx -y chrome-devtools-axi emulate --network "Slow 3G"
npx -y chrome-devtools-axi emulate --cpu 4
npx -y chrome-devtools-axi emulate --geolocation "37.7749x-122.4194"
npx -y chrome-devtools-axi emulate --user-agent "Mozilla/5.0..."
```

## DevTools Debugging

| Command            | Description                    |
| ------------------ | ------------------------------ |
| `console`          | List console messages          |
| `console-get <id>` | Get a specific console message |
| `network`          | List network requests          |
| `network-get [id]` | Get a specific network request |

## Performance

| Command                     | Description                   |
| --------------------------- | ----------------------------- |
| `lighthouse`                | Run a Lighthouse audit        |
| `perf-start`                | Start a performance trace     |
| `perf-stop`                 | Stop the performance trace    |
| `perf-insight <set> <name>` | Analyze a performance insight |
| `heap <path>`               | Capture a heap snapshot       |

## Bridge

| Command | Description             |
| ------- | ----------------------- |
| `start` | Start the bridge server |
| `stop`  | Stop the bridge server  |

Running with no command shows the CLI home view with `bin` and `description` metadata, plus the current snapshot if a browser session is active.

## Flags

| Flag                        | Description                                 |
| --------------------------- | ------------------------------------------- |
| `--help`                    | Show usage information                      |
| `-v`, `-V`, `--version`     | Show installed CLI version                  |
| `--full`                    | Show complete output without truncation     |
| `--background`              | Open new page in background (newpage)       |
| `--uid @<uid>`              | Target a specific element (screenshot)      |
| `--full-page`               | Capture entire scrollable page (screenshot) |
| `--format <fmt>`            | Image format: png, jpeg, webp (screenshot)  |
| `--viewport <spec>`         | Viewport like "390x844x3,mobile" (emulate)  |
| `--color-scheme <val>`      | dark, light, or auto (emulate)              |
| `--network <cond>`          | Network throttle: Slow 3G, etc. (emulate)   |
| `--cpu <rate>`              | CPU throttling rate 1-20 (emulate)          |
| `--geolocation <lat>x<lon>` | Set geolocation (emulate)                   |
| `--user-agent <str>`        | Custom user agent (emulate)                 |
| `--type <type>`             | Filter by type (console, network)           |
| `--limit <n>`               | Max items to return (console, network)      |
| `--page <n>`                | Pagination (console, network)               |
| `--device <device>`         | desktop or mobile (lighthouse)              |
| `--mode <mode>`             | navigation or snapshot (lighthouse)         |
| `--output-dir <path>`       | Directory for reports (lighthouse)          |
| `--no-reload`               | Skip page reload (perf-start)               |
| `--no-auto-stop`            | Disable auto-stop (perf-start)              |
| `--file <path>`             | Save trace data to file (perf-start/stop)   |
| `--response-file <path>`    | Save response body (network-get)            |
| `--request-file <path>`     | Save request body (network-get)             |

## Configuration

- Bridge port defaults to `9224`. Override: `export CHROME_DEVTOOLS_AXI_PORT=9225`
- State stored in `~/.chrome-devtools-axi/`
- Session hooks auto-install to `~/.claude/settings.json` and `~/.codex/hooks.json` (disable with `CHROME_DEVTOOLS_AXI_DISABLE_HOOKS=1`)

## Examples

### Form submission

```bash
npx -y chrome-devtools-axi open https://example.com/login
npx -y chrome-devtools-axi fill @1 "user@example.com"
npx -y chrome-devtools-axi fill @2 "s3cret"
npx -y chrome-devtools-axi click @3
npx -y chrome-devtools-axi snapshot
```

### Fill multiple fields at once

```bash
npx -y chrome-devtools-axi open https://example.com/register
npx -y chrome-devtools-axi fillform @1=alice @2=alice@example.com @3=password123
npx -y chrome-devtools-axi click @4
```

### Multi-tab workflow

```bash
npx -y chrome-devtools-axi open https://example.com
npx -y chrome-devtools-axi newpage https://example.com/other
npx -y chrome-devtools-axi pages
npx -y chrome-devtools-axi selectpage 0
npx -y chrome-devtools-axi snapshot
npx -y chrome-devtools-axi closepage 1
```

### Debugging with DevTools

```bash
npx -y chrome-devtools-axi open https://example.com
npx -y chrome-devtools-axi click @4
npx -y chrome-devtools-axi fill @7 "test"
npx -y chrome-devtools-axi console
npx -y chrome-devtools-axi network
```

### Performance tracing

```bash
npx -y chrome-devtools-axi open https://example.com
npx -y chrome-devtools-axi perf-start
npx -y chrome-devtools-axi click @4
npx -y chrome-devtools-axi fill @7 "test"
npx -y chrome-devtools-axi perf-stop --file trace.json
```

### Screenshot capture

```bash
npx -y chrome-devtools-axi open https://example.com
npx -y chrome-devtools-axi screenshot ./homepage.png
npx -y chrome-devtools-axi screenshot ./full-page.png --full-page
npx -y chrome-devtools-axi screenshot ./element.png --uid @5
```

### Mobile emulation

```bash
npx -y chrome-devtools-axi open https://example.com
npx -y chrome-devtools-axi resize 390 844
npx -y chrome-devtools-axi emulate --viewport "390x844x3,mobile" --network "Slow 3G"
npx -y chrome-devtools-axi snapshot
```
