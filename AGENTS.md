This project is:

- using Astro.build, refer to documentation here https://docs.astro.build/llms.txt
- using npm package manager

Please do this:

- after completing a feature, run "npm run precommit" to check for issues
- if you are adding a page, add the link to index.astro

## Shared Styles & Layouts

- **Tool pages** (calculators, converters, cheatsheets): use `src/layouts/ToolLayout.astro`. It provides page background (`#FAF9F7`), body font (`system-ui`), `main` container, headline (`h1`), and `.subtitle` styling. Do not duplicate these styles inline in tool pages.
- **Car Loan pages**: use `src/layouts/CarLayout.astro` (includes segmented tabs for price/monthly modes).
- **EV Charging pages**: use `src/layouts/EvChargingLayout.astro` (includes segmented tabs for cost/time modes).
- **Shared components**: `src/shared/Header.astro`, `src/shared/Footer.astro`, `src/shared/Head.astro` are used by all pages.
- **Design system**: colors, typography, spacing, and component specs are in `DESIGN.md`. The single accent color is Dependable Blue (`#3573C6`). Never use indigo (`#4F46E5`) or violet (`#7C3AED`).

Attention for coding agents:

- Codex will review your output once you are done
- to verify your work, check http://localhost:4321/ is up before spawing dev server. most of the time the dev server is already up.
