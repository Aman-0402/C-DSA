# AGENTS.md — C++ + DSA + LeetCode Interactive eBook

Instructions for any AI agent (Claude, Copilot, etc.) working in this repo.

## Project Summary

Frontend-only interactive learning platform for C++, Data Structures & Algorithms, and LeetCode prep. Built like a premium personal coding eBook + IDE, not a blog or plain docs site.

**Content generation rule (updated):** the user gives a topic name only. The agent writes the full lesson content itself — explanations, analogies, code examples, common mistakes, interview Q&A, memory tricks — matching the established teaching style of prior lessons (beginner-first, explicitly flags concepts "not learned yet" rather than front-loading unintroduced syntax, one topic per lesson, DSA/interview-oriented). Practice questions and LeetCode problems are still only added when the user explicitly asks or supplies them — do not invent graded practice/LeetCode content on your own.

**LeetCode integration (live):** every DSA topic lesson (45 topics, `trees` module onward through `greedy-dp`) has one or more `"leetcode"` sections appended to `sections`, per the schema below — 247 problem instances total, cross-referenced from the user's roadmap table. The same LeetCode number may appear in multiple lesson files (different `id` suffix, e.g. `lc-70`, `lc-70-dp`, `lc-70-memo`) when one problem teaches multiple patterns — this is intentional, not a duplicate bug. When adding more LeetCode problems to a lesson: append after the last existing section, before `codeExamples`; write a Brute Force → Optimal `approaches` pair with real, hand-traced-correct C++ output; validate JSON with `node -e "JSON.parse(require('fs').readFileSync('data/lessons/<file>.json'))"` before every commit; **one commit per problem** (not batched) unless the user says otherwise for that session.

## Tech Stack (frontend-only, no backend)

- HTML5, CSS3, Vanilla JavaScript ES6+ (ESM, modular files — no framework)
- Monaco Editor — two editor modes: `createRetypeEditor` (paste-blocked, checked against a reference, for concept-lesson retype practice) and `createScratchEditor` (freeform, no paste-block, no reference-checking, for LeetCode "Try It Yourself")
- Prism.js — syntax highlighting for displayed code
- Lucide Icons (+ two hotlinked brand images for the social-float LinkedIn/GitHub links, see `index.html`)
- JSON — all lesson content
- localStorage — all persistence (progress, notes, bookmarks, mistakes, theme, LeetCode solved-state, etc.)
- Fonts: Inter (UI), JetBrains Mono (code)
- Deployed via GitHub Pages: <https://aman-0402.github.io/C-DSA/>

**Never add:** React/Vue/Angular/Next.js, Node/Express backend, any database, auth backend, real C++ compilation/execution. This is a static frontend site — no server-side code of any kind.

## File Structure

```
/
├── index.html
├── css/        style.css, layout.css, sidebar.css, lesson.css, code.css, practice.css, leetcode.css, responsive.css
├── js/         app.js, router.js, content-loader.js, sidebar.js, code-editor.js,
│               retype-checker.js, practice-checker.js, progress.js, storage.js,
│               search.js, bookmarks.js, notes.js, theme.js
├── data/       roadmap.json, lessons/*.json
└── assets/     images/, icons/
```

Keep JS modular — one concern per file. Never dump everything into one giant HTML/JS file. Reuse existing render functions instead of duplicating.

## Content Workflow (every time user gives a topic name)

1. Write the lesson content: explanations, definitions, syntax, examples, code, output, common mistakes, interview Qs — matching the depth/tone of prior lessons in `data/lessons/`.
2. Only introduce concepts already covered in earlier lessons as "known" — flag anything not yet taught with a warning/note, same as existing lessons do.
3. Structure into the lesson JSON schema (see below).
4. Pick UI components that fit THIS content — don't force every lesson into the same layout, don't add empty/irrelevant sections.
5. Implement/extend HTML, CSS, JS, JSON.
6. Wire into roadmap, sidebar, search, progress system.
7. Add "Retype & Practice" under every full C++ code example; add coding-challenge workspace only for practice questions the user explicitly asked for.
8. Verify: navigation, responsive layout, localStorage, theme, editors, practice checker, progress, search, bookmarks, notes.
9. Report: topic added, files created/updated, interactive components added.

**Always produce a plan before implementing new content** (see Planning rule below), then wait for explicit go-ahead if the plan is non-trivial.

## Lesson JSON Schema (flexible)

Lesson: `id, moduleId, title, description, objectives, sections, codeExamples, retypePractice, practiceQuestions, interviewQuestions, leetcode, completionRules`

Section content types: `paragraph, heading, definition, what, why, how, note, warning, tip, syntax, code, output, table, keyPoints, memoryTrick, commonMistakes, dryRun, pointerVisualization, recursionVisualization, stlVisualization, leetcode`

`"leetcode"` section shape: `{ type: "leetcode", id, number, title, difficulty, link, problemStatement, examples: [{input, output, explanation?}], constraints: [], hints: [], approaches: [{label: "Brute Force"|"Better"|"Optimal", explanation, code, output, timeComplexity, spaceComplexity}] }`. Rendered as a card with problem statement, examples/constraints, a freeform "Try It Yourself" Monaco scratchpad, a progressive hints accordion, and a Brute Force → Optimal solutions accordion — plus a per-problem "Mark as Solved" toggle tracked in `localStorage` against the sitewide `X / total` LeetCode counter shown in the sidebar (see `js/progress.js`, `js/content-loader.js#allLeetcodeIds`).

Practice-question validation config lives in JSON, e.g.:
```json
{ "requiredKeywords": ["for", "cout"], "forbiddenKeywords": [], "expectedPatterns": [], "expectedOutput": "1 2 3 4 5" }
```

## Practice/Checker Rules

- Frontend-only checker: keyword/header/pattern/output matching against JSON rules. **Never claim real C++ compilation or hidden test execution** — this is learning-focused validation only.
- Retype editor: paste disabled (Ctrl+V, context-menu paste, paste event blocked). Typing never blocked.
- Displayed learning code: copy-discouraged (selection/copy/context-menu disabled) but never claimed as un-copyable/secure.
- Hints are progressive (clue → approach → pseudocode) — never reveal the full solution automatically.
- LeetCode `approaches` (Brute Force → Optimal solutions) live in a collapsed-by-default accordion under the hints, not gated behind a separate "prove you tried" reveal — the hints above it are the progressive-disclosure layer.

## Design Direction

Premium modern SaaS/developer aesthetic. Light + dark mode. Rounded corners, soft shadows, subtle borders, strong type hierarchy, small purposeful animations. Avoid: heavy gradients, glassmorphism, neon, over-animation, empty space. Desktop-first, fully responsive (sidebar collapses to menu on mobile).

## Git Workflow (mandatory)

**Every change/update must be committed and pushed** — do not leave work uncommitted locally.

- Create commits with a clear, concise message (why > what).
- No co-author trailer — commits are authored solely as the user (Aman), no `Co-Authored-By` line.
- Push to `origin main` after each commit unless the user says otherwise.
- Never force-push, never skip hooks, never amend existing commits — always new commits.
- Follow standard safety rules: check `git status` before any destructive op, never touch secrets, review staged files before commit.

## Extending, Not Rebuilding

- Never rebuild the project from scratch for new content — extend it.
- Maintain the existing design system and component set.
- Reuse rendering functions; keep CSS/JS organized and modular.
- No lorem ipsum, no fake/placeholder lessons, no fake LeetCode problems, no fake interview content.
- Don't remove existing user content unless explicitly told to.
