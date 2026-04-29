---
name: random
description: Focused everyday tools, daylight-clear and tactiley confident.
colors:
  dependable-blue: "#3573C6"
  dependable-blue-hover: "#2960AD"
  dependable-blue-light: "#EBF2FA"
  desk-brown: "#8B6D4F"
  page: "#FAF9F7"
  surface: "#FFFFFF"
  text: "#1A1A1A"
  text-secondary: "#555555"
  text-tertiary: "#888888"
  text-muted: "#999999"
  border: "#E8E6E2"
  border-hover: "#D0CDC7"
  divider: "#F0EFED"
typography:
  display:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "clamp(2rem, 6vw, 3rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "system-ui, -apple-system, sans-serif"
    fontSize: "2rem"
    fontWeight: 400
    lineHeight: 1.2
  body:
    fontFamily: "system-ui, -apple-system, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "system-ui, -apple-system, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 600
    lineHeight: 1.4
  mono:
    fontFamily: "Source Code Pro, monospace"
    fontSize: "0.85rem"
    fontWeight: 500
    lineHeight: 1.6
  card-title:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "1.1rem"
    fontWeight: 400
    lineHeight: 1.3
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.dependable-blue}"
    textColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.dependable-blue-hover}"
    textColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "12px 24px"
  input-text:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "10px 13px"
  input-text-focus:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "10px 13px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: "16px"
  card-hover:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: "16px"
  tab-active:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  result-panel:
    backgroundColor: "{colors.dependable-blue-light}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: "16px"
---

# Design System: random

## 1. Overview

**Creative North Star: "The Daylight Desk"**

A well-lit workspace where everything is visible, trustworthy, and ready to hand. The surface is warm like a wooden desk, the instruments are confident blue like a quality pen, and nothing hides in shadow. Daylight means no guessing: if you can see it, you can tell what it does. The design serves the task, not the other way around.

This system rejects ambiguity. Anti-reference: skillsmp.com, where dark mode obscures boundaries, buttons are indistinguishable from text, and interactive elements lack affordance. The Daylight Desk is the opposite: surfaces are warm and bright, interactive elements announce themselves, and the accent color is reserved for action and state.

**Key Characteristics:**

- **Warm light surfaces** with barely-tinted backgrounds that feel like natural light on wood
- **Confident blue accent** that earns trust through consistency and restraint
- **Tactile interactivity** where every clickable element looks and feels clickable
- **Serif-display warmth** for personality, system-sans clarity for tools
- **Flat-by-default elevation** with state-triggered lift

## 2. Colors

The palette is warm neutrals grounded by a single confident blue. Brown desk warmth for brand moments, blue for action and focus.

### Primary

- **Dependable Blue** (#3573C6): Primary interactive color. Used for active tabs, buttons, links, focus rings, selected states, and result highlights. Professional, trustworthy, calm. Not the SaaS cliché purple-indigo nor the Tailwind default. This blue has just enough warmth to sit comfortably on warm backgrounds.

### Neutral

- **Page** (#FAF9F7): The desk surface. Warm off-white with the faintest yellow-green tint. Never pure white, never gray. The warmth of natural daylight filtering through a window.
- **Surface** (#FFFFFF): Cards, panels, input backgrounds. Pure white sits well against the warm page, creating depth through temperature rather than shadow.
- **Text** (#1A1A1A): Primary text. Near-black with no hue bias, grounded and readable.
- **Text Secondary** (#555555): Labels, secondary descriptions, form field labels with strong text.
- **Text Tertiary** (#888888): Subtle hints, timestamps, helper text.
- **Text Muted** (#999999): Cards' fine print, disclaimers. The quietest voice.
- **Desk Brown** (#8B6D4F): Warm accent for brand moments only. Homepage card icons, footer hover links. The color of the wooden desk surface, not the instrument on it.
- **Border** (#E8E6E2): Card borders, input borders at rest. Warm-gray, never cold.
- **Border Hover** (#D0CDC7): Borders on hover/focus states. Darker warm-gray with presence.
- **Divider** (#F0EFED): Subtle separators within lists and panels.

### Derived Surfaces

- **Dependable Blue Light** (#EBF2FA): Tinted backgrounds for results panels, selected rows, highlighted states. The blue barely present, just enough to group related results.
- **Dependable Blue Focus** (rgba(53, 115, 198, 0.18)): Focus rings on inputs and interactive elements. 2px solid this color, replacing the current indigo variant.

**The One Voice Rule.** The dependable blue accent appears on no more than 10% of any tool screen at rest. It emerges in action: focus, active, selected, primary buttons. At rest, the palette is warm neutrals. Blue is the instrument you pick up, not the desk you sit at.

## 3. Typography

**Display Font:** Newsreader (Georgia, serif fallback)
**Body Font:** system-ui, -apple-system, sans-serif
**Mono Font:** Source Code Pro (monospace fallback)

**Character:** A serif with personality for moments that need warmth (the homepage title, card headings) and a platform-native sans for everything else. The serif brings the human; the sans brings the tool. Source Code Pro appears only in the homepage tagline where "A.I." needs typographic distinction.

### Hierarchy

- **Display** (Newsreader, 400, clamp(2rem, 6vw, 3rem), line-height 1, letter-spacing -0.02em): Homepage title only. The serif establishes brand warmth on arrival.
- **Headline** (system-ui, 400, 2rem, line-height 1.2): Tool page h1. Unassuming. A label for the task, not a headline.
- **Card Title** (Newsreader, 400, 1.1rem, line-height 1.3): Homepage card headings. Serif warmth at small scale.
- **Body** (system-ui, 400, 0.85rem, line-height 1.6): Descriptions, form labels, results. Compact but breathable. Max line length 65-75ch for prose.
- **Label** (system-ui, 600, 0.85rem, line-height 1.4): Form field labels, table headers, tab text. Semibold for scanability.
- **Mono** (Source Code Pro, 500, 0.85rem, line-height 1.6): Only for the homepage "A.I." tagline. Nowhere else.

**The Quiet Headline Rule.** Headlines are weight 400, same size or just above body. This is a tool, not a magazine. If the hierarchy needs shouting, use spacing and color, not font-weight escalation.

## 4. Elevation

Flat by default. Depth is conveyed through surface color temperature: warm page behind cool-white cards creates natural separation. Shadows appear only as state responses, never as decoration.

### Shadow Vocabulary

- **Card Rest** (none): Cards sit on temperature contrast alone.
- **Card Hover** (0 2px 12px rgba(0, 0, 0, 0.06)): A barely-there lift on hover, confirming the card is interactive.
- **Panel** (0 1px 3px rgba(0, 0, 0, 0.1)): Subtle shadow on form containers and calculator panels.
- **Header** (1px solid rgba(139, 109, 79, 0.12) + backdrop-filter blur(12px)): The fixed header uses a warm border and blur instead of shadow.

**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows and lifts appear only as a response to state change (hover, elevation). If a stationary element casts a shadow, it had better need the affordance.

## 5. Components

### Buttons

- **Shape:** 8px border-radius, medium height ~44px (meets touch target minimum)
- **Primary:** Dependable Blue background (#3573C6), white text, 12px 24px padding, 8px radius
- **Primary Hover:** Deeper blue (#2960AD), same metrics
- **Active/Press:** Background deepens slightly, no transform. Confirmed, not bounced.
- **Focus:** 2px outline of dependable-blue-focus rgba, offset 2px from the button edge
- **Secondary / Ghost:** White background, Dependable Blue text, 1px border (#3573C6). Same padding and radius.
- **Danger:** White background, #DC2626 text, 1px #FCA5A5 border (from calculator "Clear" button)
- **Calculator keys:** 48px height grid, 1px border (#E8E6E2), white background. Function keys (AC, +/-, %) use light blue-none (#F8F7FF → update to Dependable Blue Light), operator keys use Dependable Blue text. Equals key: solid Dependable Blue background.

### Tabs (Segmented)

- **Shape:** Pill container with 6px border-radius, 4px inner radius for active tab, warm-gray background (#F0F0F0)
- **Active Tab:** White background, text-primary color, font-weight 600, subtle shadow (0 1px 2px rgba(0,0,0,0.08))
- **Inactive Tab:** Transparent background, text-secondary (#666), hover darkens to #333
- **Group:** Two or three tabs, flex, equal width. Minimum touch target 44px height.

### Cards / Page Cards (Homepage)

- **Corner Style:** 8px border-radius
- **Background:** #FFFFFF
- **Border:** 1px solid #E8E6E2, hover transitions to #D0CDC7
- **Shadow Strategy:** None at rest. Hover shadow (0 2px 12px rgba(0,0,0,0.06))
- **Padding:** 16px
- **Arrow indicator:** Top-right positioned arrow fades in on hover with a 4px horizontal slide. Color: desk-brown (#8B6D4F).

### Inputs / Fields

- **Style:** White background, 1px solid #DDD (to be updated to border token), 6px border-radius, 10px 13px padding
- **Focus:** Border shifts to Dependable Blue, 2px box-shadow of rgba(53, 115, 198, 0.18). Immediate and obvious.
- **Range inputs:** accent-color: Dependable Blue. Thumb height meets 44px touch target.
- **Select inputs:** Same styling as text inputs. arrow cursor.

### Result Panels

- **Background:** Dependable Blue Light (#EBF2FA)
- **Border:** 1px solid (from #E8E6F5 → update to a blue-tinted border derived from dependable-blue at 15% opacity)
- **Radius:** 8px
- **Rows:** Separated by 1px dividers in the same blue-tint. Monthly/total row upsized to 1.2rem with Dependable Blue value text.

### Calculator Keys

- **Shape:** 8px radius, 48px minimum height, 1px border
- **Digit keys:** White background, text color, border #E8E6E2
- **Function keys:** Dependable Blue Light background, Dependable Blue text, border tinted
- **Operator keys:** Dependable Blue Light background, Dependable Blue text at 1.3rem, font-weight 500
- **Equals key:** Solid Dependable Blue background, white text, font-weight 600

### Navigation Header

- **Style:** Fixed top, translucent warm-white background (rgba(250, 249, 247, 0.92)) with 12px backdrop blur
- **Border-bottom:** 1px solid rgba(139, 109, 79, 0.12) — warm, barely visible
- **Brand:** Flask SVG icon (to update from violet to Dependable Blue) + Newsreader wordmark at 1.25rem
- **Inner padding:** 12px 24px (mobile 10px 16px)

## 6. Do's and Don'ts

### Do:

- **Do** use Dependable Blue exclusively for interactive elements and active states. If it is clickable, selected, or primary, it should be blue.
- **Do** keep the accent below 10% of any tool surface at rest. Blue appears when the user acts, not before.
- **Do** use warm neutral borders (#E8E6E2) that announce edges without shouting.
- **Do** make interactive elements obviously interactive with clear hover states, focus rings, and color changes.
- **Do** use Serif-display (Newsreader) only for the homepage brand moments and card titles. Everything else is system-sans.
- **Do** ensure minimum 44px touch targets for all interactive elements.
- **Do** use temperature contrast (warm page + cool surface) for depth instead of heavy shadows.
- **Do** use Dependable Blue focus rings (2px, rgba(53, 115, 198, 0.18)) on all focusable elements. Visible focus is an accessibility affordance, not optional decoration.

### Don't:

- **Don't** make buttons that look like text. Every interactive element needs background, border, or both, sufficient to distinguish it from static content at a glance. (Anti-reference: skillsmp.com)
- **Don't** use dark mode by default. The Daylight Desk is warm and bright. Dark mode would invert the entire metaphor.
- **Don't** use border-left or border-right greater than 1px as a colored accent stripe on cards, list items, callouts, or alerts.
- **Don't** use gradient text (background-clip: text). Emphasis comes from weight and size, not color effects.
- **Don't** use glassmorphism as decoration. The header blur is structural (fixed overlay readability), not aesthetic.
- **Don't** create hero-metric patterns (big number, small label, gradient accent). The calculator results show financial figures with table clarity, not dashboard theatrics.
- **Don't** mix indigo (#4F46E5) or violet (#7C3AED) with Dependable Blue. The old accent colors are replaced. One blue, one system.
- **Don't** leave heading weights at 600+ without reason. Body text and headlines default to 400 weight. Quiet, not loud.
- **Don't** animate layout properties. Transitions apply to color, shadow, and transform only.
