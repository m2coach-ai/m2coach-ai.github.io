---
name: Mark Martin E-portfolio
description: One question, "It ran. Can it be trusted?", set in ink on paper, with red for what is wrong and blue for what has been checked.
colors:
  paper: "#f5f6f8"
  sheet: "#ffffff"
  ink: "#15171c"
  ink-body: "#2b2f38"
  ink-muted: "#5b616e"
  red: "#b3261a"
  red-deep: "#8f1c12"
  red-wash: "#fbe9e6"
  red-on-ink: "#e5402f"
  blue: "#1b3fb5"
  blue-deep: "#122c85"
  blue-wash: "#e8edfb"
  blue-on-ink: "#a9bcff"
  neutral-bar: "#5b616e"
typography:
  display:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "clamp(2.75rem, 7vw, 5.5rem)"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "clamp(1.5rem, 3.2vw, 2.15rem)"
    fontWeight: 500
    lineHeight: 1.1
  title:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "1.3rem"
    fontWeight: 500
    lineHeight: 1.2
  quote:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "clamp(1.2rem, 2.4vw, 1.5rem)"
    fontWeight: 400
    lineHeight: 1.45
  body:
    fontFamily: "Inter, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Inter, Arial, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 400
    lineHeight: 1.5
  code:
    fontFamily: "Consolas, 'Courier New', monospace"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.55
rounded:
  hairline: "3px"
  sm: "0.35rem"
  md: "0.5rem"
  pill: "99px"
spacing:
  gutter: "clamp(0.5rem, 3vw, 2rem)"
  block: "1.4rem"
  section: "2.25rem"
  page-width: "1180px"
  measure: "52ch"
components:
  header-strip:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  section-label:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.headline}"
    padding: "0.6rem 1.2rem 0.65rem"
  module-opening:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  pill:
    textColor: "{colors.blue}"
    rounded: "{rounded.pill}"
    padding: "0.55rem 1.1rem"
  pill-hover:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.paper}"
  card:
    backgroundColor: "{colors.sheet}"
    rounded: "{rounded.md}"
    padding: "1.4rem"
  evidence-note:
    backgroundColor: "{colors.blue-wash}"
    textColor: "{colors.ink-body}"
    rounded: "{rounded.sm}"
    padding: "0.9rem 1.1rem 0.95rem"
  hero-field:
    backgroundColor: "{colors.red}"
    textColor: "{colors.sheet}"
  ways-in-field:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.sheet}"
  demo-sheet:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink-body}"
    rounded: "{rounded.md}"
---

# Design System: Mark Martin E-portfolio

## Overview

**Creative North Star: "The Marked Paper"**

The site asks one question of every piece of work in it: it ran, but can it be trusted? Its look comes from the place that question is normally settled, a marked piece of work. There is the work itself, in ink on a clean sheet. There is red, where something is wrong or in doubt. There is blue, where something has been checked and can be followed up. Nothing else carries colour.

The landing page states the question on a full field of red, then shows it once per module on paper, each time with a small working demonstration built from the real artefact, and ends on a full field of blue that leads to the evidence. Every other page is a document: an ink strip across the top, ink labels for sections, a calm reading column, blue links. The reader is a university assessor marking against learning outcomes, so the frame carries the identity and the reading column stays quiet.

The site was first built around a desk, a lamp and a record book. That world has been retired. No photograph, texture, lamp glow, paper grain, ribbon or bookmark shape belongs here.

**Key Characteristics:**
- Ink on cool white paper. Not cream, not parchment.
- Two colours with fixed meanings: red is wrong or in doubt, blue is checked.
- Colour owns whole regions on the landing page (a red field, a blue field) and is sparing everywhere else.
- A serif for headings and quoted words, a sans for running text.
- Flat. Depth appears only under the demonstration sheets on the landing page.
- One section at a time on long pages, with the whole page one click away.

## Colors

Ink and paper, with two colours that each mean one thing.

### Primary
- **Marking Red** (`red`): wrong, or in doubt. The landing hero is a field of it. Inside demonstrations it marks the duplicate, the missed case, the row that does not add up. On inner pages it appears only where a page records a mistake or difficulty. **Deep Red** (`red-deep`) is its text colour on a **Red Wash** (`red-wash`) panel. **Red on Ink** (`red-on-ink`) is the question's own mark on the dark frame, used at display size only: the brand dot and the module number. It never colours small text.

### Secondary
- **Checked Blue** (`blue`): checked, and able to be followed up. Every link, the "Where to see it" notes, the page-progress bar, the current item in a section list, and the "Two ways in" field on the landing page. **Deep Blue** (`blue-deep`) is the hover and the text colour on a **Blue Wash** (`blue-wash`) panel. **Blue on Ink** (`blue-on-ink`) is the link colour on the dark frame.

### Neutral
- **Paper** (`paper`): the page. A printed sheet, cool white.
- **Sheet** (`sheet`): cards, tables and demonstration panels lying on the paper.
- **Ink** (`ink`): headings, the header strip, section labels, module page openings, the words-only panel.
- **Ink Body** (`ink-body`): running text.
- **Ink Muted** (`ink-muted`): captions, breadcrumbs, secondary labels. Also the "no opinion" segment of the Row 8 bar (`neutral-bar`).
- Hairlines are ink at 16% opacity.

### Named Rules
**The Two Meanings Rule.** Red means wrong or in doubt. Blue means checked. Neither is ever used for decoration, emphasis or variety.

**The Words Beside It Rule.** Colour is never the only signal. Every red or blue mark sits beside words that say what it means.

**The Nothing Behind Text Rule.** No photograph, texture or gradient sits behind text. Fields are flat colour.

## Typography

**Display Font:** Newsreader (with Georgia, serif)
**Body Font:** Inter (with Arial, sans-serif)
**Label/Mono Font:** Consolas (with Courier New) for code, output and typed input only

**Character:** A reading serif for anything that is a title or someone's quoted words, and a plain sans for everything that has to be read at length. The pairing was chosen by the author and is fixed.

### Hierarchy
- **Display** (500, `clamp(2.75rem, 7vw, 5.5rem)`, line-height 1): page titles. The landing question runs larger, up to 8.5rem on wide screens.
- **Headline** (500, `clamp(1.5rem, 3.2vw, 2.15rem)`, 1.1): section headings, set in paper on an ink label.
- **Title** (500, 1.3rem, 1.2): headings inside a section, card titles.
- **Quote** (400, often italic, `clamp(1.2rem, 2.4vw, 1.5rem)`, 1.45): quoted feedback, the module's question under its title, passages in the author's own words.
- **Body** (400, 1rem, 1.65): running text, held to 52ch, about 70 characters.
- **Label** (400, 0.9rem): captions, breadcrumbs, source lines.
- **Code** (14px, 1.55): scripts, console output, the demonstration input.

### Named Rules
**The Serif Speaks Rule.** Serif is for titles and for words that are being quoted or claimed. Running explanation is always sans.

## Layout

Inner pages share one skeleton: an ink header strip, an opening (breadcrumb, title, one-sentence description), then a sheet with a section list on the left and the sections on the right, inside a 1180px container. Text holds a 52ch measure; tables, figures, cards and code may run the full width of the column. Below 62rem the section list moves above the content as wrapped chips and nothing is sticky.

Pages with four or more sections read one section at a time: the section list, the previous and next controls and the arrow keys move between sections with a short fade, a thin bar shows progress, and "Show everything on one page" restores the long page. Printing always prints everything.

Module pages and the Learning Loop open on a full-width ink band. On module pages the band holds the module number, large, beside the title and the module's question.

The landing page is three full-width fields in order: red (the question), paper (one scene per module, words on one side and a demonstration on the other, alternating), blue (two ways in and the module list).

Spacing follows one rhythm: 1.4rem between blocks, 2.25rem above a section label, generous vertical padding between landing scenes.

## Elevation & Depth

Flat. Cards and tables are white sheets on paper, separated by a hairline, with no shadow. The header strip and the ink bands sit flush.

### Shadow Vocabulary
- **Demonstration sheet** (`0 18px 40px -18px rgba(21, 23, 28, .28), 0 2px 6px rgba(21, 23, 28, .06)`): only the demonstration panels on the landing page, so they read as sheets laid on the paper.
- **Floating control** (`0 6px 20px rgba(0, 0, 0, .25)`): the "Top" button on narrow screens.

### Named Rules
**The Flat Document Rule.** Inner pages carry no shadows on content. If something needs separating, use a hairline or white on paper.

## Shapes

Rectangles with small radii. Hairline panels and tables use 3px; notes and inputs 0.35rem; cards, panels and demonstration sheets 0.5rem. Buttons and chips are full pills. Section labels are square-cornered ink blocks that fit their text. The brand mark is a small red dot. No ribbons, swallowtails, folded corners, rotations or clipped shapes.

## Components

### Buttons
- **Shape:** pill (99px), at least 2.8rem tall.
- **On paper:** blue outline and text; fills blue with paper text on hover.
- **On ink:** paper outline and text; the primary is solid paper with ink text.
- **On the red field:** the primary is white with deep-red text; the secondary is a white outline.
- **Focus:** a 2px outline, blue on paper and white on a field, offset 3px.

### Section labels
An ink block with the section heading in paper-coloured serif. It sizes to its text and wraps on narrow screens. One per section.

### Cards / Containers
- **Corner Style:** 0.5rem
- **Background:** white on paper
- **Shadow Strategy:** none; a hairline border
- **Internal Padding:** 1.2rem to 1.4rem
- Used for learning outcomes (outcome, how the artefacts meet it, evidence links) and artefact cards.

### Quotations
A top rule in blue and a bottom hairline, the words in italic serif, the source underneath in small sans. Used only for words quoted exactly, with their source.

### Evidence notes
A blue-wash panel with a thin blue border, headed "Where to see it", listing each claim in a passage with a link to the exact place that proves it. It follows the passage; on wide screens it sits in the right margin.

### Inputs / Fields
The demonstration text box: paper background, a darker hairline, monospace text, blue caret. Choices are pill-shaped radio buttons that fill ink when selected.

### Navigation
The header strip holds the name, a Home pill, a Module hub pill on artefact pages, and a Modules menu. The section list marks the current section with a solid blue item. Breadcrumbs sit above the title.

### Demonstration (signature component)
A white sheet on the landing page that lets a reader try the artefact's own finding: the two name-sorting scripts, the three decision thresholds, Brown's Row 8 as printed and reconstructed. The artefact's real result is in the HTML before any script runs, every figure comes from the artefact page, and red and blue mark what is wrong and what was checked. A module with nothing to demonstrate uses an ink panel carrying a second quoted sentence.

## Do's and Don'ts

### Do:
- **Do** use red only for wrong or in doubt, and blue only for checked or followable.
- **Do** put words beside every red or blue mark.
- **Do** keep running text in Inter on paper, at a 52ch measure.
- **Do** keep inner pages flat: hairlines and white sheets, no shadows on content.
- **Do** take every number in a demonstration from the artefact page, and show the real result without JavaScript.
- **Do** copy a module's question line word for word from its scene heading on the landing page.

### Don't:
- **Don't** add a third accent colour, or use red or blue for decoration.
- **Don't** bring back the desk, lamp, book, cream paper, lamp gold, navy ribbon or bookmark shapes.
- **Don't** place a photograph, texture or gradient behind text.
- **Don't** set running text in the serif, or headings in the sans.
- **Don't** write that content is still to be added. Leave the block out.
- **Don't** change the Newsreader and Inter pairing.
