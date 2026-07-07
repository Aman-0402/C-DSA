# AGENTS.md — C++ + DSA + LeetCode Interactive eBook

Instructions for any AI agent (Claude, Copilot, etc.) working in this repo.

## Project Summary

Frontend-only interactive learning platform for C++, Data Structures & Algorithms, and LeetCode prep. Built like a premium personal coding eBook + IDE, not a blog or plain docs site.

**Content generation rule (updated):** the user gives a topic name only. The agent writes the full lesson content itself — explanations, analogies, code examples, common mistakes, interview Q&A, memory tricks — matching the established teaching style of prior lessons (beginner-first, explicitly flags concepts "not learned yet" rather than front-loading unintroduced syntax, one topic per lesson, DSA/interview-oriented). Practice questions and LeetCode problems are still only added when the user explicitly asks or supplies them — do not invent graded practice/LeetCode content on your own.

## Tech Stack (frontend-only, no backend)

- HTML5, CSS3, Vanilla JavaScript ES6+ (ESM, modular files — no framework)
- Monaco Editor — code-writing/practice areas
- Prism.js — syntax highlighting for displayed code
- Lucide Icons
- JSON — all lesson content
- localStorage — all persistence (progress, notes, bookmarks, mistakes, theme, etc.)
- Fonts: Inter (UI), JetBrains Mono (code)

**Never add:** React/Vue/Angular/Next.js, Node/Express backend, any database, auth backend, real C++ compilation/execution. This is a static frontend site — no server-side code of any kind.

## File Structure

```
/
├── index.html
├── css/        style.css, layout.css, sidebar.css, lesson.css, code.css, practice.css, responsive.css
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

Section content types: `paragraph, heading, definition, what, why, how, note, warning, tip, syntax, code, output, table, keyPoints, memoryTrick, commonMistakes, dryRun, pointerVisualization, recursionVisualization, stlVisualization`

Practice-question validation config lives in JSON, e.g.:
```json
{ "requiredKeywords": ["for", "cout"], "forbiddenKeywords": [], "expectedPatterns": [], "expectedOutput": "1 2 3 4 5" }
```

## Practice/Checker Rules

- Frontend-only checker: keyword/header/pattern/output matching against JSON rules. **Never claim real C++ compilation or hidden test execution** — this is learning-focused validation only.
- Retype editor: paste disabled (Ctrl+V, context-menu paste, paste event blocked). Typing never blocked.
- Displayed learning code: copy-discouraged (selection/copy/context-menu disabled) but never claimed as un-copyable/secure.
- Hints are progressive (clue → approach → pseudocode) — never reveal the full solution automatically.
- LeetCode solutions: never auto-revealed; only shown via explicit "Reveal Solution" and only if solution content was provided or explicitly requested.

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
