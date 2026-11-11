# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: assessors and tutors.** University of Essex Online markers and tutors who evaluate the portfolio against each module's learning outcomes. They need to find the outcomes, the evidence for each, the critical reflection and the feedback response quickly and by direct link. Their job is to judge learning, not to be persuaded.

**Secondary: employers and recruiters.** Hiring managers in AI education, educational technology, training, enablement and customer education. Their job is to see how the learning transfers to professional practice.

**When the two conflict, assessors and tutors win.** Academic evidence, critical reflection, module outcomes and direct navigation take precedence over visual promotion or recruiter-style brevity.

Peers, mentors and the author's own future reference may benefit from the public site but are not formal audiences and must not drive design decisions.

## Product Purpose

An e-portfolio for Mark Martin's postgraduate computing and artificial intelligence programme. It documents decisions, mistakes, feedback and growth across modules, so a reader can follow how understanding changed, not only what was produced. Success means an assessor can locate the evidence for any learning outcome in a few clicks, and an employer can see the professional transfer without the site becoming a résumé.

## Positioning

"A record of learning. Not a gallery of finished work. Evidence of decisions, mistakes, feedback and growth across a programme of study." The claim a neighbouring portfolio could not truthfully copy is the visible record of difficulty, feedback and revision, written by an experienced educator, rather than polished outputs.

## Operating Context

- Live site: https://m2coach-ai.github.io/ (GitHub Pages, project repository `m2coach-ai.github.io`, main branch `main`; the question-led version is developed on `question-first`, the desk-and-book version on `enhancements`).
- Static HTML, CSS and JavaScript with Three.js loaded from jsDelivr for an optional WebGL homepage.
- Coursework and its source material live in a separate local folder; module READMEs there map units, files, marks and feedback. The master notes file for marks and feedback is `_portfolio-notes/Dig portfolio things essex modules webpage.docx`, with `marks-and-feedback-transcribed.md` for screenshots (per that folder's CLAUDE.md).
- Evidence is published as separate pages per artefact so each can be linked directly.

## Capabilities and Constraints

- The site must work without WebGL, without JavaScript beyond progressive enhancement, and under reduced motion. All assessed content and navigation stay reachable in every case.
- Direct links to individual evidence pages must be preserved.
- GitHub Pages limits: static files only, no server code, files over 100 MB are not hosted ("too large for GitHub, embed instead").
- No new framework and no new animation library. The existing desk-and-book WebGL homepage is retained.
- Confirmed publishing rules carried over from the coursework folder's instructions:
  - Private or extenuating-circumstances documents are never opened, described or published.
  - Classmates' posts and names are not published (peer content). The author's own reply text may appear once edited.
  - Quotations of feedback and finding sentences are word for word from the source files.
- **Decided (6 Nov 2026):** numeric marks are not shown. Each assessment shows its UK classification (for example "Distinction") with word-for-word quoted feedback. One explanatory line appears once, on the About or Learning Loop page: "UK postgraduate marking: 70% and above is a Distinction, the highest classification." No GPA conversion is stated on the site.
- **Open decision:** the official learning-outcome text for each module, not yet inserted (the Numerical Analysis hub holds a placeholder).
- Only Modules 1 to 3 are mapped in the coursework folder; Module 4 is not yet mapped.

## Brand Commitments

- The desk-and-book homepage identity stays: a record book under a lamp that opens and turns a page per chapter.
- Existing name line: "Mark Martin / E-portfolio", with the small ribbon-bookmark mark.
- The three-link site structure (About, Modules, Learning Loop) and the homepage chapters ("A record of learning.", "Practice meets inquiry.", "Evidence, not decoration.", "Across the programme.") are established voice.
- The site must not become a generic AI start-up page, a design-agency page, a personal-brand site or a commercial landing page.

## Evidence on Hand

In the repository today:
- One module hub: `modules/numerical-analysis/` with pages for an R analysis entry (`entries/recovery-frequency.html`), reflection, skills matrix and action plan, and meeting notes.
- Those pages are structural: the module hub states that official learning outcomes and final module details are still to be inserted, and the artefact card states that peer or tutor feedback is "Not yet available".
- A second module slot is shown as "Next module, Ready to add".
- `about/` and `learning-loop/` pages exist; the README lists final About Me content and engaged academic literature as still to add.

Not on hand in the repository and not to be fabricated: official learning-outcome text, tutor or peer feedback, marks, dated meeting records, quotations, reflections and results. Future work must take these from the source files only.

## Assessed Structure Takes Precedence

Assessment-specified headings, section names, learning outcomes and required evidence structures take precedence over the design system. The design may improve hierarchy, pacing, navigation and presentation, but must not rewrite the assessed structure.

In practice:
- Supplied headings stay exactly as provided.
- Required sections are not renamed, removed, merged or reordered without Mark's explicit approval.
- Learning outcomes are not invented or paraphrased; they are reproduced word for word from the official source.
- Any structure the design system offers (including the 13-part case-study checklist in DESIGN.md) is an optional presentation and evidence checklist, not a replacement for a supplied structure.
- Employer-facing presentation, including the professional-transfer section, cannot shorten, hide or demote required academic content.

## Product Principles

1. **Evidence before presentation.** Every claim of learning points to a page a reader can open directly.
2. **Show the difficulty.** Mistakes, failed approaches, feedback and revision are first-class content, not appendices.
3. **Assessors first, transfer visible.** Serve the outcome-by-outcome reader first, then make professional transfer to teaching and AI practice plain without turning the site into a résumé.
4. **The book is the way in, never the way through.** The WebGL homepage is an optional entrance; all essential content and navigation work without it.
5. **Never invent academic content.** Content that does not exist yet is left out: no page tells a reader that something is still to be added (decided 10 Nov 2026, replacing the earlier "shown as missing" rule).

## Accessibility & Inclusion

Target WCAG 2.2 AA. Target a Lighthouse accessibility score of at least 95 and a mobile performance score of at least 90, documenting any WebGL-related exception. No horizontal scrolling at 390 px. Respect `prefers-reduced-motion`.
