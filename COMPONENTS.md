# Inner-page components

Reusable building blocks for the portfolio's inner pages. All styling is in `assets/css/page.css`; the only script is `assets/js/page.js` (section-list highlight, one-time reveal, table scroll hint). Every component works without JavaScript.

A temporary visual test page lives in `_component-gallery/index.html` (GitHub Pages does not publish folders that start with an underscore). Delete it once the components are approved.

## Rules that apply to every component

- **Use a component only when the page has real, verified content for it.** An empty component is worse than none. Never add a component to fill space.
- **Content comes from the source.** Official learning outcomes, headings, titles, feedback and quotations are reproduced word for word. Do not paraphrase, shorten or "tidy" them. Do not invent dates, marks, feedback, evidence or reflections.
- **Missing content stays visibly missing.** Keep a plain note, for example `<div class="note"><strong>Content checkpoint:</strong> ...</div>`, or a neutral placeholder such as `[Verified evidence title]`. Never guess what belongs there.
- **Privacy.** Do not publish classmates' names or identifiable peer posts, private feedback, extenuating-circumstances material or unverified marks. Refer to a peer as "a peer" unless the person has agreed in writing to be named. Meeting and study entries must not name classmates.
- **Page skeleton.** `body.page`, a skip link, `.site-header`, `main#main > .opening`, `.sheet > (.rail?) + .chapters > .chapter*`, optional `.pagenav`, `footer`. Each chapter is `section.chapter` with `aria-labelledby` pointing at its `h2`. Heading levels never skip.
- **Reveal once.** Add the class `block` to a component that is a distinct piece of evidence (pull-out, timeline, figure, table, code). `page.js` fades it in once when it enters the viewport, and only when motion is welcome.
- **Link wording.** A link names its destination or action: "Download [title]", "Read the full [title]", "Source: [title]". Never "click here", "this link" or "read more". Put file type and size inside the link text.
- **Touch targets** are at least 44 by 44 CSS pixels (`2.8rem`). Components never rely on hover.

---

## 1. Official learning-outcome cards

**Use when:** the module's official learning outcomes are available and you want to show which evidence supports each one.
**Do not use when:** the outcomes are not yet supplied (keep the placeholder note), or for your own goals or paraphrased outcomes.

```html
<ol class="outcomes" aria-label="Learning outcomes">
  <li class="outcome" id="outcome-1">
    <h3 class="outcome-ref">[Official reference]</h3>   <!-- optional: only if the university labels the outcome -->
    <p class="outcome-text">[Official learning outcome]</p>
    <div class="outcome-evidence">
      <p class="outcome-evidence-label">Evidence</p>
      <ul>
        <li><a href="...">[Verified evidence title]</a></li>
      </ul>
    </div>
  </li>
  <li class="outcome" id="outcome-2">
    <p class="outcome-text">[Official learning outcome]</p>
    <div class="outcome-evidence outcome-evidence--empty">
      <p class="outcome-evidence-label">Evidence</p>
      <p>[Evidence has not been linked yet]</p>
    </div>
  </li>
</ol>
```

- **Required:** `ol.outcomes`, `li.outcome`, `p.outcome-text`. **Optional:** `h3.outcome-ref`, `.outcome-evidence` (use `--empty` when nothing is linked), `id` on each `li` so other pages can link to an outcome.
- **Accessibility:** an ordered list with an `aria-label`. The outcome text is plain text, not an image. Evidence links name the evidence. If you use `h3.outcome-ref`, it sits under the section's `h2`. Numbering comes from the official reference, never from CSS, so it can never drift from the source.
- **Mobile:** the grid collapses to one column. Cards keep equal reading order.
- **Reduced motion:** no motion of its own.
- **Content rules:** the outcome wording is copied exactly from the official source. Do not add a "How I met it" paragraph unless you have written one; if so, put it in the chapter text, not in the card.

## 2. Pull-out evidence blocks

**Use when:** one short, verified passage deserves emphasis: a feedback quotation, or an extract from an artefact, with its source.
**Do not use when:** for decoration, for your own summary of something (use normal prose), for long passages, or for anything you cannot attribute.

```html
<figure class="pullout block">
  <blockquote>
    <p>[Verified feedback quotation]</p>
  </blockquote>
  <figcaption>
    <cite>[Verified source title]</cite>, <time datetime="YYYY-MM-DD">[Verified date]</time>.
    <a href="...">Read the full [verified evidence title]</a>
  </figcaption>
</figure>
```

- **Variant:** add `pullout--extract` for an extract that is not a spoken or written opinion (the text is set upright instead of italic).
- **Required:** `figure.pullout`, `blockquote > p`, `figcaption` naming the source. **Optional:** `block`, `<time>`, a link to the full evidence.
- **Accessibility:** quotation semantics (`blockquote`, `cite`, `time`). Every block has a caption with its source. Do not use colour alone to mark it; the rules above and below remain visible.
- **Mobile:** padding tightens; text wraps within the page width.
- **Reduced motion:** the one-time reveal is off.
- **Content rules:** quote exactly. If you must trim, mark the cut with an ellipsis in square brackets and link to the full text. Name a peer only with written permission; otherwise write "a peer". Never quote private feedback.

## 3. Feedback and revision timeline

**Use when:** you can show, in order, feedback received, what you decided and what changed, with verified dates.
**Do not use when:** there is only one step (use a pull-out and a paragraph), or the dates are unknown.

```html
<ol class="timeline timeline--revision block" aria-label="Feedback and revision, oldest first">
  <li class="timeline-item">
    <time class="timeline-when" datetime="YYYY-MM-DD">[Verified date]</time>
    <div class="timeline-main">
      <p class="timeline-kind">Feedback received</p>
      <p class="timeline-title">[Verified feedback title]</p>
      <p class="timeline-body">[Verified feedback quotation]</p>
    </div>
  </li>
  <li class="timeline-item">... <p class="timeline-kind">Response</p> ...</li>
  <li class="timeline-item">... <p class="timeline-kind">Revision</p> ... <a href="...">See the revised [verified evidence title]</a></li>
</ol>
```

- **Required:** `ol.timeline`, `li.timeline-item`, `time.timeline-when`, `div.timeline-main`, `p.timeline-kind`, `p.timeline-title`. **Optional:** `p.timeline-body`, `block`, links.
- **Accessibility:** an ordered list in oldest-first order with an `aria-label` that says so. The step type is written text (`timeline-kind`), so meaning never depends on colour or position. `<time>` carries a machine-readable date.
- **Mobile:** each entry stacks as date, kind, title, body. The line and dot stay on the left.
- **Reduced motion:** no motion of its own; the one-time reveal is off.
- **Content rules:** every date is a verified date. Use the kinds "Feedback received", "Response" and "Revision" only for things that happened. State the reason when you did not adopt a suggestion.

## 4. Meeting and study timelines

**Use when:** dated records of tutor or team meetings and study sessions exist, in chronological order.
**Do not use when:** you have no dated record, or for anything that would name classmates or reveal private discussion.

```html
<ol class="timeline timeline--log block" aria-label="Meetings and study sessions, oldest first">
  <li class="timeline-item">
    <time class="timeline-when" datetime="YYYY-MM-DD">[Verified date]</time>
    <div class="timeline-main">
      <p class="timeline-kind">Meeting</p>            <!-- or "Study session" -->
      <p class="timeline-title">[Verified meeting title]</p>
      <dl class="timeline-details">
        <dt>Discussed</dt><dd>[Verified summary of what was discussed]</dd>
        <dt>Decisions</dt><dd>[Verified decision]</dd>
        <dt>Follow-up</dt><dd><ul><li>[Verified action]</li></ul></dd>
      </dl>
    </div>
  </li>
</ol>
```

- **Required:** the same as the feedback timeline. **Optional:** `dl.timeline-details` with any of Discussed, Decisions, Follow-up, Focus, Outcome (only terms you can fill).
- **Accessibility:** ordered list plus a description list, so each label is tied to its value. The kind is written text.
- **Mobile:** details stack as label above value.
- **Reduced motion:** same as the feedback timeline.
- **Content rules:** record what was actually said and agreed. Do not name classmates; write "team members" or "a peer". Leave out private or extenuating-circumstances matters. A study session needs a verified date and a verified outcome or next step.

## 5. Captioned full-width figures

**Use when:** a chart, screenshot or diagram is itself evidence, and it needs the width to be read.
**Do not use when:** the image is decorative (use no image), when you have no alt text and caption, or for photographs of people without consent.

```html
<figure class="figure block">
  <img src="..." width="1200" height="600"
       alt="[Alt text saying what the figure shows and why it is evidence]"
       loading="lazy" decoding="async">
  <figcaption><span class="figure-label">[Figure label]</span> [Verified caption].
    <a href="...">Source: [verified source title]</a></figcaption>
  <details class="figure-text">
    <summary>Text description of [figure label]</summary>
    <p>[Verified text equivalent: the values, trend or structure the figure shows]</p>
  </details>
</figure>
```

- **Required:** `figure.figure`, `img` with `alt`, `width` and `height`, `figcaption`. **Optional:** `block`, `.figure-label`, a source link, `details.figure-text` (required whenever the figure carries data, such as a chart).
- **Images below the first screen** use `loading="lazy"` and `decoding="async"`. The first image in view must not be lazy. Keep each image under about 150 KB and 1600 px wide, preferably WebP or AVIF with a fallback.
- **Accessibility:** meaningful alt text; a visible caption; a text equivalent for data. An inline SVG figure uses `role="img"` with `aria-labelledby` pointing at its `<title>` and `<desc>`.
- **Mobile:** the image scales to the page width and keeps its aspect ratio (no horizontal scroll); the caption wraps.
- **Reduced motion:** the one-time reveal is off.
- **Content rules:** the caption states what the figure shows and where it came from. Do not crop or edit a figure so that it changes the result. Do not include identifying details of other people.

## 6. Accessible download and source links

**Use when:** a file or an external source supports the page and the reader may want it.
**Do not use when:** the file is not published on the site (do not link to a path that does not exist), or to link to private material.

```html
<ul class="resources">
  <li class="resource">
    <a class="resource-link" href="..." download>
      <span class="resource-title">Download [verified evidence title]</span>
      <span class="resource-meta"><span class="resource-type">[File type]</span> <span class="resource-size">[File size]</span></span>
    </a>
  </li>
  <li class="resource resource--source">
    <a class="resource-link" href="https://..." rel="noopener" target="_blank">
      <span class="resource-title">Source: [verified source title]</span>
      <span class="resource-meta"><span class="resource-type">[Publisher or site]</span> <span>Opens in a new tab</span></span>
    </a>
  </li>
</ul>
```

- **Required:** `ul.resources`, `li.resource`, `a.resource-link`, `.resource-title`. **Optional:** `.resource-meta` with type and size, `resource--source` for external sources, `download` (same-origin files only), `rel="noopener"` with `target="_blank"` for new tabs.
- **Wording:** start with the action and name the thing: "Download [title]", "Source: [title]". Put file type and size inside the link so screen readers announce them. If the link opens a new tab, say so in the text.
- **Accessibility:** one link per row, a visible focus ring, at least 44 px tall, and never colour alone: the hover and focus states change fill and outline.
- **Mobile:** links fill the width and wrap their metadata.
- **Reduced motion:** colour changes only; no movement.
- **Content rules:** never link to a file you have not uploaded. State the real file size and type. Large files (over 100 MB) cannot be hosted on GitHub Pages; embed or host them elsewhere and say so.

## 7. Section navigation

**Use when:** the page has **three or more** sections (`section.chapter`). It is the "On this page" list.
**Do not use when:** the page has fewer than three sections.

```html
<div class="sheet">
  <nav class="rail" aria-label="Sections on this page">
    <p class="rail-label">On this page</p>
    <ol>
      <li><a href="#question-and-method">Question and method</a></li>
      <li><a href="#output">Output</a></li>
      <li><a href="#interpretation">Interpretation</a></li>
    </ol>
  </nav>
  <div class="chapters">
    <section class="chapter" id="question-and-method" aria-labelledby="h-question-and-method">
      <div class="chapter-head"><h2 id="h-question-and-method">Question and method</h2></div>
      ...
```

- **Required:** `nav.rail` with an `aria-label`, an `ol` of links whose text is exactly the section's `h2`, and a matching `id` on each `section.chapter`. List the sections in page order.
- **Accessibility:** a labelled navigation landmark and real links, so it works without JavaScript. `page.js` sets `aria-current="true"` on the link for the section in view; the current link is also styled, not coloured alone.
- **Desktop:** the list sits beside the chapters and stays in view while you scroll (only when motion is welcome). **Mobile:** the list becomes ordinary content above the sections, as wrapped chips; nothing is sticky.
- **Reduced motion:** the list is not sticky and smooth scrolling is off.
- **Content rules:** link text equals the heading text exactly; never rename a heading to suit the list.
