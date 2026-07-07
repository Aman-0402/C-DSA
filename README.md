# C++ + DSA + LeetCode Interactive eBook

A personal, frontend-only interactive learning platform for C++, Data Structures & Algorithms, and LeetCode preparation — built to feel like a premium coding IDE fused with an interactive eBook.

All learning content (lessons, code examples, practice questions, interview questions, LeetCode references) is authored by the user and added incrementally. This repo contains no invented course content.

## Tech Stack

- HTML5, CSS3, Vanilla JavaScript (ES6+, ESM) — no frontend framework
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for interactive code practice
- [Prism.js](https://prismjs.com/) for syntax-highlighted code display
- [Lucide](https://lucide.dev/) icons
- JSON-driven lesson content
- `localStorage` for all progress, notes, bookmarks, and settings persistence
- Fonts: Inter (UI), JetBrains Mono (code)

100% static, frontend-only — no backend, no database, no server-side execution.

## Features

- Nested sidebar course roadmap (C++ fundamentals → OOP → STL → DSA → LeetCode) with progress tracking
- Interactive eBook-style lesson content (definitions, syntax boxes, notes/warnings/tips, comparison tables, dry runs)
- Syntax-highlighted, copy-discouraged code examples with a "Retype & Practice" section using Monaco
- Frontend-only practice checker (keyword/pattern/output-based validation against JSON rules — not a real compiler)
- Progressive hint system for coding challenges
- Mistake Notebook, Revision Mode, and Interview Mode
- Bookmarks, personal notes, and global search — all stored locally
- DSA dry-run, pointer, and recursion visualizers
- Light/dark themes, fully responsive layout

## Project Structure

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

## Running Locally

No build step required — it's a static site. Serve the root folder with any static server, e.g.:

```powershell
npx serve .
# or
python -m http.server 5500
```

Then open the served URL in a browser.

## Content Workflow

New lessons are added by supplying raw content (explanations, code, questions). Content is analyzed, structured into the lesson JSON schema, and rendered through existing reusable components — the project is extended, never rebuilt, for each new topic. See [AGENTS.md](AGENTS.md) for the full workflow and conventions followed when building this project.

## Status

🚧 In progress — content and features are added incrementally as lessons are provided.
