This project is:

- using Astro.build, refer to documentation here https://docs.astro.build/llms.txt
- using npm package manager

Please do this:

- after completing a feature, run "npm run precommit" to check for issues
- if you are adding a page, add an entry to `src/data/tools.ts` — the homepage renders its index from there
- **always `git add docs/` before committing.** The `docs/` directory is the built output that gets deployed directly — there is no build step in deploy. Every commit must include the latest `docs/` files or the deployed site will be stale.

## Shared Styles & Layouts

- **Tool pages** (calculators, converters, cheatsheets): use `src/layouts/ToolLayout.astro`. It provides page background (`#FAF9F7`), body font (`system-ui`), `main` container, headline (`h1`), and `.subtitle` styling. Do not duplicate these styles inline in tool pages.
- **Tabbed tool pages** (car loan, house loan, EV charging): use `src/layouts/TabbedToolLayout.astro` and declare the tabs in `src/data/navigation.ts`.
- **Shared CSS**: `src/styles/tool-form.css` (tool-form classes) and `src/styles/article-prose.css`. Imported by the layouts; do not copy these rules into pages.
- **Loan maths**: `src/lib/loan.ts` owns flat-rate and reducing-balance quotes, inversions, schedules and chart series. Tests: `npm test`.
- **Shared components**: `src/shared/Header.astro`, `src/shared/Footer.astro`, `src/shared/Head.astro` are used by all pages.
- **Design system**: colors, typography, spacing, and component specs are in `DESIGN.md`. The single accent color is Dependable Blue (`#3573C6`). Never use indigo (`#4F46E5`) or violet (`#7C3AED`).

Attention for coding agents:

- Codex will review your output once you are done
- to verify your work, check http://localhost:4321/ is up before spawing dev server. most of the time the dev server is already up.
