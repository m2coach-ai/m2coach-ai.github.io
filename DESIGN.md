---
name: Mark Martin E-portfolio
description: A record book on a dark desk; inner pages are leaves of that book, written in ink and read as evidence.
colors:
  desk-black: "#120d09"
  desk-ink: "#f1eadc"
  desk-body: "#e2d9c8"
  desk-muted: "#b4a994"
  lamp-amber: "#e0b46e"
  brass: "#c99a62"
  slate-blue: "#8fb0c8"
  paper: "#efe8d8"
  page-ink: "#2a2620"
  page-body: "#3b352d"
  page-muted: "#6b6358"
  ink-blue: "#28466a"
  ink-blue-deep: "#1a2f4a"
  oxide: "#8a3b2a"
typography:
  display:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "clamp(2.5rem, 6vw, 5.25rem)"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "clamp(1.8rem, 4vw, 3rem)"
    fontWeight: 500
    lineHeight: 1.05
  title:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "1.25rem"
    fontWeight: 500
    lineHeight: 1.2
  body:
    fontFamily: "Inter, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "1.05rem"
    fontWeight: 400
    lineHeight: 1.2
rounded:
  sheet: "3px"
  card: "8px"
  pill: "99px"
spacing:
  xs: "0.5rem"
  sm: "1rem"
  md: "1.5rem"
  lg: "3rem"
  xl: "5rem"
components:
  button-pill:
    backgroundColor: "{colors.desk-black}"
    textColor: "{colors.desk-ink}"
    rounded: "{rounded.pill}"
    padding: "0.78rem 1.1rem"
  card-evidence:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.page-ink}"
    rounded: "{rounded.card}"
    padding: "1.4rem"
  callout-note:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.page-body}"
    padding: "1rem 1.25rem"
  chapter-band:
    backgroundColor: "{colors.ink-blue}"
    textColor: "{colors.paper}"
    padding: "3rem 1.5rem"
---

# Design System: Mark Martin E-portfolio

> **Superseded in part (11 Nov 2026).** The site's landing page is now built on one question, "It ran. Can it be
> trusted?", and the desk-and-book world described below is no longer the site's identity. Colour and the frame
> have been replaced. Until this document is rewritten from the finished build, the block below is the authority
> for colour, and `assets/css/page.css` and `assets/css/question.css` are the authority for everything else.
> Anything below that describes the desk, the lamp, the book, cream paper, lamp gold or navy is historical.
>
> **Colour: where it comes from.** The question, and how work gets marked.
>
> | Role | Value | Used for |
> |---|---|---|
> | Paper | `#f5f6f8` | The page. A printed sheet, cool white, not parchment |
> | Sheet | `#ffffff` | Cards, tables and demonstration panels on the paper |
> | Ink | `#15171c` | Text, the header strip, section labels, module page openings |
> | Ink body / muted | `#2b2f38` / `#5b616e` | Running text / secondary text |
> | Red | `#b3261a` (deep `#8f1c12`, wash `#fbe9e6`) | Wrong, or in doubt. The landing hero is a field of it. Nowhere else |
> | Blue | `#1b3fb5` (deep `#122c85`, wash `#e8edfb`, on ink `#a9bcff`) | Checked. Every link, evidence notes, the page-progress bar, the "Two ways in" field |
>
> **Rules.** Red and blue each mean one thing and are never decoration. Neither is ever the only signal: each sits
> beside words that say what it means. No photograph, texture or gradient stands behind text. Type is unchanged:
> Newsreader for headings and quotations, Inter for running text.


## Overview

**Creative North Star: "The Record Book"**

The homepage is a dark desk: a leather record book under a lamp that opens and turns one page per chapter. Every other page is a leaf of that book: warm paper, dark ink, ink-blue accents. The site is a record kept by a working educator, not a showcase. It reads like careful marginalia, with evidence set in the middle of the page and the author's reasoning written beside it.

The system borrows ten patterns from the Shorthand reference studied in this session (strong editorial hierarchy, large chapter-opening colour bands, short readable text measures, visible chapter navigation, clear beginning-to-ending pacing, timelines, outcome cards, pull-out evidence blocks, plain download controls, purposeful full-width media) and rejects the rest of that story's mechanics (scroll-jacking, long pinned sequences, layered sticky and fixed stacks, collage decoration, text over busy images). Shorthand is a source of editorial patterns, not an identity. Existing visual authority is the incumbent CSS in `assets/css/global.css` and `assets/css/experience.css`.

Tokens marked **proposed** below do not exist in the code yet; everything else is read from the incumbent CSS. All styling proposals (colours, chapter bands, tonal ramps, typography, components) are provisional until Mark has seen a first prototype.

**Assessed structure takes precedence.** Assessment-specified headings, section names, learning outcomes and required evidence structures take precedence over the design system. The design may improve hierarchy, pacing, navigation and presentation, but must not rewrite the assessed structure.
- Supplied headings stay exactly as provided.
- Required sections are not renamed, removed, merged or reordered without Mark's explicit approval.
- Learning outcomes are not invented or paraphrased.
- The 13-part case-study structure below is an optional presentation and evidence checklist, not a replacement for any supplied structure.
- Employer-facing presentation cannot shorten or hide required academic content.

**Key Characteristics:**
- Dark desk on the homepage, paper leaves everywhere else.
- Serif display (Newsreader) over a quiet sans body (Inter).
- One warm accent on the desk (lamp amber), one cool accent on paper (ink blue).
- Flat leaves with one soft shadow for the sheet itself; no stacked card shadows.
- Motion only where it shows how the book works.

## Colors

Two palettes share one family. The desk palette is warm and dark; the paper palette is aged paper with ink. The names `--cyan`, `--violet` and `--pink` in the incumbent CSS are legacy; they hold amber, slate-blue and brass respectively and become the accent on paper (`--cyan` is re-pointed to ink blue inside `.content-shell`).

### Primary
- **Lamp Amber** (#e0b46e): the single accent on the dark desk. Links on hover, eyebrows, the ribbon bookmark and primary page-turn button. Used sparingly.
- **Ink Blue** (#28466a): the accent on paper. Links, callout rules, table headers, chapter bands (**proposed use**) and focus outlines.

### Secondary
- **Slate Blue** (#8fb0c8): quiet callouts on the dark desk.
- **Brass** (#c99a62): reserved legacy accent; do not add new uses.
- **Oxide** (#8a3b2a, **proposed**): the one warm signal on paper, used only to mark difficulty, mistake or failed approach so it is findable at a glance.

### Neutral
- **Desk Black** (#120d09): homepage and header background.
- **Desk Ink** (#f1eadc) and **Desk Body** (#e2d9c8): text on the desk.
- **Desk Muted** (#b4a994): captions and footer on the desk.
- **Paper** (#efe8d8): the page sheet.
- **Page Ink** (#2a2620), **Page Body** (#3b352d), **Page Muted** (#6b6358): text on paper.
- **Ink Blue Deep** (#1a2f4a): link hover on paper.

### Named Rules
**The Two-Palette Rule.** Desk colours never appear on a paper leaf and paper colours never appear on the desk, except the ribbon bookmark.

**The Oxide Rule.** Oxide marks difficulty only. It is never used for decoration, errors in forms or branding, so a reader who looks for "where it went wrong" finds it every time.

**The Contrast Rule.** Body text must reach 4.5:1 and large text and UI boundaries 3:1 on the surface they sit on. Computed approximately from the values above: Page Ink on Paper about 12:1, Page Muted on Paper about 4.7:1 (the floor for muted text, never lighter), Ink Blue on Paper about 8:1, Paper on Ink Blue about 8:1, Lamp Amber on Desk Black about 10:1, Desk Muted on Desk Black about 8:1. Re-measure with a tool before relying on any value; these are estimates.

## Typography

**Display Font:** Newsreader (Georgia, serif fallback)
**Body Font:** Inter (Arial, sans-serif fallback)
**Label/Mono Font:** Newsreader italic for eyebrows and page labels; Consolas for code only.

**Character:** a literary serif for the voice of the record and a neutral sans for the working text. The italic serif eyebrow acts like a margin note.

### Hierarchy
- **Display** (500, clamp(2.5rem, 6vw, 5.25rem), 1.0, -0.02em): page titles and chapter openers.
- **Headline** (500, clamp(1.8rem, 4vw, 3rem), 1.05): section titles inside a leaf.
- **Title** (500, 1.25rem, 1.2): sub-sections and component titles.
- **Body** (400, 1rem, 1.65): prose, on paper in Page Body (#3b352d).
- **Label** (italic 400, 1.05rem, 1.2): eyebrows, captions and chapter labels in the accent colour.

### Named Rules
**The Measure Rule.** Prose lines are 60 to 72 characters (`max-width: 68ch`). The incumbent `.prose` is 820px, which is about 100 characters at 16px and is too long; it is a known gap to close during the build.

**The Hierarchy Rule.** One `h1` per page, then `h2` for sections and `h3` for sub-sections without skipping levels. The case-study section names (below) are `h2`s.

**The Font-Loading Rule.** The incumbent loads fonts through a CSS `@import` from Google Fonts. Preferred: move to `<link rel="preconnect">` plus a `<link>` with `display=swap` in each page head, or self-host the two families as WOFF2. Either is a later task.

## Layout

The page is a single sheet centred on the dark body: `min(1040px, 100% - 2rem)`, padded with `clamp(1.4rem, 5vw, 4.5rem)`. The homepage is full-viewport scenes with the text card right-aligned. Homepage content max width is 1180px; the sheet is narrower on purpose, so the reading column is the main event.

Spacing is rem-based on a loose 0.5 / 1 / 1.5 / 3 / 5 scale. Vary the rhythm: tighter inside components, generous between chapters. Grids are 12 columns with a 1rem gap; cards span 6 columns above 700px and 12 below.

**Breakpoints:** 390px is the narrowest supported width (no horizontal scrolling); 700px is the incumbent mobile/desktop switch; 1040px is the sheet width.

**Responsive behaviour:**
- **Mobile (below 700px):** one column, the sheet nearly full width (`calc(100% - 1rem)`), cards span the full width, chapter navigation collapses into a single `Contents` disclosure at the top of the page.
- **Tablet (700px to about 1040px):** two-column cards, chapter list inline above the content.
- **Desktop (above about 1040px):** sheet at full width; the chapter list may sit as a slim in-flow column beside the case-study; it is sticky only if it is the page's single sticky element.

## Elevation & Depth

Depth comes from the metaphor, not from component shadows. The paper sheet has one large soft shadow and a faint inner highlight, and a spine gradient on its left edge. Components on the sheet are flat: borders and tone only.

### Shadow Vocabulary
- **Sheet** (`box-shadow: 0 30px 90px rgba(0,0,0,.55), 0 2px 0 rgba(255,255,255,.04) inset`): the page sheet on the desk.
- **Card hairline** (`box-shadow: 0 1px 0 rgba(42,38,32,.08)`): evidence cards on paper.
- **Desk panel** (`box-shadow: 0 24px 60px rgba(0,0,0,.35)`): the homepage text card; it also carries a translucent background with `backdrop-filter: blur(14px)`.

### Named Rules
**The One Shadow Rule.** Only the sheet and the homepage text card cast shadows. Cards, callouts, figures and buttons on paper do not.

## Shapes

A paper leaf is almost square-cornered (3px). Cards are softly rounded (8px, the incumbent .5rem). Buttons and the nav toggle are pills (99px). The ribbon bookmark is a notched rectangle, a clip-path that echoes a bookmark in the book. Rules are 1px hairlines. No new corner radii.

## Components

### Buttons
- **Shape:** pill (99px).
- **Default:** dark fill with a hairline border, Desk Ink text; used in the header.
- **Hover / Focus:** border turns amber (desk) or ink blue (paper), a 2px upward nudge; focus shows a visible 2px outline with a 2px offset in the accent colour.
- **Primary page-turn:** amber fill with dark text, only in the homepage book controls.
- **Download control:** a plain bordered pill or text link with the file type and size in the label (for example "Download the R script (R, 12 KB)"). No icon-only buttons.

### Cards / Containers (outcome and evidence cards)
- **Corner Style:** 8px.
- **Background:** translucent white over paper (`rgba(255,255,255,.32)`).
- **Border:** 1px hairline in the paper line colour; hover turns the border ink blue.
- **Internal Padding:** 1.4rem.
- Use cards for comparison (outcome against evidence). Do not use cards for sequential content; that is a timeline.

### Chapter Band (**proposed**)
A full-width band at the start of each case-study section, in Ink Blue with Paper text, carrying the section number as an italic Newsreader eyebrow and the section name as the `h2`. It is flat colour with no photograph and no texture behind the text, so text never sits on a busy image. It is the Shorthand colour-band pattern, translated to the ink palette.

### Pull-out Evidence Block (**proposed**)
A figure or quoted extract set off from the prose with a left rule in Ink Blue, a caption in the label style, a source line and a direct link to the full evidence page. Quotations are word for word from the source and attributed.

### Difficulty Note (**proposed**)
The incumbent `.callout` pattern with the rule in Oxide and the label "Difficulty" or "Mistake". It is the only use of Oxide.

### Timeline (**proposed**)
An ordered list with a 1px vertical rule and dated entries, used only when chronology matters (meetings, drafts, feedback and revision). Dates come from the source; none are invented.

### Navigation
- **Site header:** fixed on the homepage, sticky on inner pages, with the brand and a Menu or "All modules" control. Inner pages show the breadcrumb above the title.
- **Chapter navigation (**proposed**):** a visible list of the case-study sections as in-page anchors, always rendered in the document, not hidden behind a toggle, with `aria-current` on the section in view, updated by a small `IntersectionObserver` that is progressive enhancement.
- **Homepage book controls:** a fixed Previous / Next pill with a live chapter label. Retained as the incumbent pattern.

### Signature Component: The Book
The WebGL record book (journal, lamp and pen models) with pages turned by scroll and by the Previous / Next controls. It stays. It never carries essential content that is not also in the HTML.

## Do's and Don'ts

### Do:
- **Do** keep the homepage as the dark desk and every other page as a paper leaf.
- **Do** use Newsreader for headings and eyebrows and Inter for body text.
- **Do** keep prose at 60 to 72 characters wide.
- **Do** mark difficulty with Oxide and nothing else.
- **Do** put the evidence, its caption and its link in the main reading flow.
- **Do** show missing evidence as missing ("Feedback not yet available").

### Don't:
- **Don't** use scroll-jacking, long pinned sequences or more than one sticky storytelling sequence per module page.
- **Don't** stack fixed or sticky layers; the homepage already has a fixed header, stage and book controls, so inner pages add none beyond the header.
- **Don't** use image collages as decoration or place text directly over busy images.
- **Don't** publish media without alt text (or a justified empty `alt`).
- **Don't** load every evidence image immediately.
- **Don't** hide navigation behind a toggle on a case-study page.
- **Don't** add decorative motion that does not communicate learning.
- **Don't** add GSAP ScrollTrigger or any animation library, or migrate to React, Next.js or another framework.
- **Don't** replace the WebGL homepage.
- **Don't** drift toward a generic AI start-up, design-agency, résumé or personal-brand look.
- **Don't** use gradient text, glassmorphism on paper, or dark-mode neon.

## Portfolio System Rules

These sections extend the canonical eight with the portfolio-specific rules this project needs. They are rules, not observed tokens.

### 1. Purpose and audiences
A record of learning, not a gallery of finished work. Primary audience: University of Essex Online assessors and tutors evaluating against module learning outcomes. Secondary audience: employers and recruiters in AI education, educational technology, training, enablement and customer education. Assessors win any conflict. Professional transfer is visible as one labelled section per case study, not as a résumé, skills cloud or personal-brand page.

### 2. Information architecture
- `/` homepage (the desk and book; optional enhancement over a complete HTML story).
- `/about/` About me (final content still to be supplied).
- `/modules/<module>/` one hub per module (section order follows the assessed structure where one is supplied; the evidence index is an addition, not a replacement).
- `/modules/<module>/<evidence>.html` or `/entries/<evidence>.html` one directly linkable page per artefact, reflection, matrix and meeting record.
- `/learning-loop/` programme synthesis across modules.
- Every evidence page has a stable URL, a breadcrumb and a link back to its module hub. Never move or rename a published evidence URL without a redirect page.

### 3. Homepage rules
- Keep the desk, the book, the lamp and the chapter copy. The first screen shows the title "A record of learning." and the positioning line as real HTML.
- The text card keeps a solid translucent panel so text never rests on the 3D scene.
- The skip link and Menu stay first in tab order. "Evidence, not decoration." links straight to the module list.
- The static poster (`assets/img/desk-poster.webp`) appears if WebGL is slow, fails or motion is reduced.

### 4. Reusable module case-study structure (optional checklist)
This is an optional presentation and evidence checklist, not a replacement for any supplied structure. Where an assessment, brief or module specifies headings, section names, order or required evidence, that structure is used exactly as supplied: headings keep their exact wording, and no required section is renamed, removed, merged or reordered without Mark's explicit approval. The items below are used only to organise material the assessed structure does not already cover, or to check that evidence is complete. Where used, a section with no real content shows an honest placeholder, never invented text. If a chapter band is applied to a supplied section, it carries the supplied heading word for word.

1. **Module orientation:** module code and title, the official learning outcomes, and where the evidence sits against each.
2. **Starting assumptions:** what the author believed or could do at the start.
3. **Assignment or problem:** the task as set, in the author's words or quoted from the brief.
4. **Approach and decisions:** what was done and why, with the alternatives considered.
5. **Evidence:** the artefacts themselves (code, figures, tables, documents) as Pull-out Evidence Blocks with captions and download controls.
6. **Difficulty, mistake or failed approach:** a Difficulty Note, with what went wrong and how it was noticed.
7. **Feedback:** tutor or peer feedback, quoted word for word and attributed. Peer content from classmates is not published.
8. **Revision or response:** what changed because of the feedback, ideally as a timeline.
9. **Result:** what was produced and how it relates to the outcomes. Marks appear only if the open marks-policy decision allows it.
10. **Critical reflection:** analysis of learning, drawing on literature where it is available.
11. **Professional transfer to teaching or AI practice:** the employer-facing section; concrete, short, and tied to the evidence above. It adds to the academic content and never shortens, hides or replaces any required part of it.
12. **Next action:** one specific next step.
13. **Direct evidence index:** a list of every evidence page and file for the module with type, size and link; the assessor's shortcut. It also sits near the top of the hub as a skip link.

### 5. Evidence, reflection, feedback and revision components
- **Evidence block:** title, type, caption, source line and a link to the artefact page or download.
- **Reflection:** prose in the standard measure under the Critical reflection heading, first person, with citations when literature is used.
- **Feedback:** a quotation block with the source (tutor, date if known) and an explicit "Not yet available" state when absent.
- **Revision:** a before-and-after pairing or a short timeline linking each feedback point to the change made.
- **Outcome card:** a card per learning outcome with the evidence links beneath it. Cards are used when comparison matters. The outcome text is the official wording, reproduced word for word, never paraphrased or shortened.

### 6. Typography and line length
See Typography. Measure 60 to 72 characters; body at least 16px; line height 1.65; headings are real heading elements; no justified text; no all-caps paragraphs.

### 7. Colour roles and contrast
See Colors. 4.5:1 for body text, 3:1 for large text and UI boundaries, 3:1 for focus indicators. Colour never carries meaning alone; Oxide notes also carry a text label.

### 8. Spacing and layout
Use the rem scale in the frontmatter. One column of prose; wide media may break out to the full sheet width but never beyond it. Keep related items closer than unrelated ones.

### 9. Desktop, tablet and mobile
See Layout. No horizontal scrolling at 390px. Tap targets at least 44px high. Tables scroll inside their own container, not the page. Sticky chapter navigation, if used, becomes ordinary document flow on narrow screens.

### 10. Navigation and scroll-position orientation
- Header with the brand and a route back to all modules on every page.
- Breadcrumb above every inner `h1`.
- Visible chapter list on every case-study page, with `aria-current` for the section in view as progressive enhancement.
- Heading ids for every section so each can be linked, with a visible focus offset (`scroll-margin-top`) for the sticky header.
- The homepage keeps its Previous / Next controls and live chapter label.
- No hidden navigation, no scroll-triggered redirects, no gesture-only navigation.

### 11. Images, captions, alt text and lazy loading
- Every evidence image uses `<figure>` with a `<figcaption>`, a width and height, and an `alt` that says what the image shows and why it is evidence. Decorative images use `alt=""` with a justification in a nearby comment.
- Charts and code screenshots also have a text equivalent (table, code block or transcript) in the page.
- Images below the opening viewport use `loading="lazy"` and `decoding="async"`. The first image in view is not lazy.
- Prefer WebP or AVIF with a JPEG or PNG fallback; maximum 1600px wide, aim for 150 KB or less per image; serve responsive `srcset` where a large image is needed.
- Full-width media is used only when the content needs the width (a wide chart or table), never as decoration.

### 12. Animation and reduced motion
- Allowed: the book's page turn and scroll response on the homepage; the one-time title "ink-in" reveal; view transitions between pages.
- Each must have a reduced-motion equivalent: the existing global `prefers-reduced-motion` reset stays, the canvas is hidden and the poster is shown, and the title is simply visible.
- No autoplay video. No parallax. No looping or attention-seeking animation. No animation that hides or delays content.
- Motion needs a reason: it must show how the book works or how learning changed.

### 13. WebGL fallback
- The homepage must be fully usable with WebGL off, blocked, slow or failing: the HTML chapters, menu, skip link and Previous / Next controls all work and the poster displays.
- If WebGL fails or the CDN is unreachable, the poster stays and no error is shown to the visitor.
- Module and evidence pages never load Three.js.

### 14. Performance budgets
Initial limits, to be tightened where the existing site is already better:
- No new framework and no new animation library.
- Module and evidence pages: HTML, CSS and JS together at most 100 KB over the wire, excluding images and fonts; initial page weight at most 500 KB including the opening viewport's images and fonts.
- Each evidence image at most about 150 KB; none below the opening viewport loads eagerly.
- Core Web Vitals targets on mobile: LCP 2.5s or less, CLS 0.1 or less, INP 200ms or less.
- Lighthouse mobile performance 90 or more and accessibility 95 or more on module and evidence pages.
- **Documented WebGL exception (homepage):** the Three.js scene loads about 3.5 MB of models (`journal.glb` 1.5 MB, `lamp.glb` 1.4 MB, `pen.glb` 0.6 MB), about 1.7 MB of textures, and Three.js from jsDelivr. The homepage may fall below 90 on mobile because of this; the poster fallback and non-blocking loading are the mitigations, and the exception is expected rather than hidden. Any reduction (compressed GLB, smaller textures) is a welcome later task.

### 15. Accessibility
- Target WCAG 2.2 AA; Lighthouse accessibility 95 or more.
- Skip link first on every page; landmarks (`header`, `nav`, `main`, `footer`); one `h1`.
- Keyboard: every control reachable and operable; visible focus (at least 2px, 3:1); no keyboard traps; the menu closes on Escape (incumbent).
- Target size at least 24px (WCAG 2.2), at least 44px for primary controls on touch.
- Focus is not obscured by the sticky header (`scroll-margin-top`, WCAG 2.2 Focus Not Obscured).
- Links are descriptive ("Download the R script", not "click here"); external links are marked.
- Tables use `th` and `scope`; charts have text equivalents.
- `lang="en"` on every page; text can be zoomed to 200% without loss.

### 16. Prohibited patterns
Scroll-jacking; long pinned sequences; excess sticky or fixed layers; image collages as decoration; text over busy images; media without alt text; eager loading of all evidence images; hidden navigation; decorative motion; GSAP ScrollTrigger or any animation dependency; migration to React, Next.js or another framework; replacing the WebGL homepage; a generic AI-start-up, design-agency, résumé or personal-brand look; invented marks, feedback, quotations, dates, reflections or evidence.

### 17. Progressive enhancement
1. The HTML alone tells the complete story and carries every link.
2. CSS adds the sheet, type and layout.
3. JavaScript adds the menu, chapter highlight and page controls; the pages work without it.
4. WebGL adds the book scene on capable devices only.
5. Enhancement features are detected (`webgl-ready` class, `matchMedia`), never assumed.

### 18. GitHub Pages and static-site constraints
- Static HTML, CSS and JS only; no server, no build requirement. Any build step must be optional and its output committed.
- Relative paths are used so the site works at the repository root and in a subpath; keep a working `404.html`.
- No file over 100 MB; embed large media from a host instead.
- Third-party loads are limited to Three.js from jsDelivr (pinned to 0.168.0) and the two Google Fonts families; any addition needs a stated reason.
- Direct links to evidence pages are permanent; keep filenames stable and lower-case.
