# Mark Martin E-portfolio

A static postgraduate computing and artificial intelligence e-portfolio, published with GitHub Pages at https://m2coach-ai.github.io/ from the `main` branch.

## Structure

- `index.html`: landing page. One question, "It ran. Can it be trusted?", and one scene per module
- `mark/`: every learning outcome with its evidence. Generated from the module pages; do not edit by hand
- `about/`: About Me
- `modules/`: one folder per module, with the module page, artefact pages (`entries/`) and downloadable files (`files/`)
- `learning-loop/`: programme synthesis
- `assets/css/question.css`, `assets/js/question.js`, `assets/js/demos/`: the landing page and its demonstrations
- `assets/css/page.css`, `assets/js/page.js`: every other page

## Rules

- Nothing is invented. Learning outcomes, submitted work and feedback are reproduced word for word.
- Content that does not exist yet is left out. No page says that something is still to be added.
- Classmates are never named, and their posts are not published.
- Results are shown as classifications, not percentages.

## Notes

Plain HTML, CSS and JavaScript with no build step. Every page works without JavaScript. The demonstrations on the landing page show the artefact's real result in the HTML; the scripts only let a reader try other inputs. Each script lists its figures and the page they came from.

`assets/js/experience.js`, `assets/css/experience.css`, `assets/css/global.css`, `assets/models/` and `assets/textures/` belong to an earlier desk-and-book landing page, kept on the `enhancements` branch. This version does not load them. The journal, lamp, pen and wood in that scene are CC0 assets from Poly Haven (polyhaven.com).
