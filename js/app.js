import { initTheme, toggleTheme } from "./theme.js";
import { loadRoadmap, loadLesson } from "./content-loader.js";
import { renderSidebar, setupSidebarSearch, updateOverallProgress } from "./sidebar.js";
import { getCurrentLessonId, navigateToLesson, onRouteChange } from "./router.js";
import { markLessonViewed, markRetyped, isRetyped, checkLessonCompletion } from "./progress.js";
import { createRetypeEditor } from "./code-editor.js";
import { checkRetype } from "./retype-checker.js";
import { getRaw, setRaw } from "./storage.js";

let roadmap = null;

async function boot() {
  initTheme();
  initSidebarCollapse();
  document.getElementById("themeToggleBtn").addEventListener("click", () => {
    toggleTheme();
    if (window.lucide) window.lucide.createIcons();
  });
  document.getElementById("mobileMenuBtn").addEventListener("click", toggleSidebar);
  document.getElementById("sidebarOverlay").addEventListener("click", toggleSidebar);
  document.getElementById("sidebarCollapseBtn").addEventListener("click", () => setSidebarCollapsed(true));
  document.getElementById("sidebarOpenBtn").addEventListener("click", () => setSidebarCollapsed(false));

  roadmap = await loadRoadmap();
  const defaultLesson = roadmap.modules[0].topics[0].lesson;
  const lessonId = getCurrentLessonId(defaultLesson);

  renderSidebar(roadmap, lessonId, selectLesson);
  setupSidebarSearch(roadmap);
  await selectLesson(lessonId, false);

  onRouteChange((id) => selectLesson(id, false));
  if (window.lucide) window.lucide.createIcons();
}

function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
  document.getElementById("sidebarOverlay").classList.toggle("open");
}

function initSidebarCollapse() {
  setSidebarCollapsed(getRaw("sidebarCollapsed", "false") === "true");
}

function setSidebarCollapsed(collapsed) {
  document.getElementById("appShell").classList.toggle("sidebar-collapsed", collapsed);
  setRaw("sidebarCollapsed", String(collapsed));
}

async function selectLesson(lessonId, updateHash = true) {
  if (updateHash) navigateToLesson(lessonId);
  const lesson = await loadLesson(lessonId);
  renderLesson(lesson);
  renderSidebar(roadmap, lessonId, selectLesson);
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("sidebarOverlay").classList.remove("open");
  window.scrollTo(0, 0);
  document.querySelector(".main-scroll").scrollTo(0, 0);

  markLessonViewed(lesson.id);
  checkLessonCompletion(lesson);
  updateOverallProgress(roadmap);
}

function el(tag, className, html) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (html !== undefined) e.innerHTML = html;
  return e;
}

function renderLesson(lesson) {
  const root = document.getElementById("lessonContent");
  root.innerHTML = "";

  const header = el("div", "lesson-header");
  header.innerHTML = `
    <h1>${lesson.title}</h1>
    <p class="lesson-desc">${lesson.description || ""}</p>
    ${
      lesson.objectives?.length
        ? `<div class="lesson-objectives"><h3>Learning Objectives</h3><ul>${lesson.objectives
            .map((o) => `<li>${o}</li>`)
            .join("")}</ul></div>`
        : ""
    }
  `;
  root.appendChild(header);

  const retypeRefs = Object.fromEntries((lesson.retypePractice || []).map((r) => [r.id, r.reference]));

  lesson.sections.forEach((section) => {
    const node = renderSection(section, lesson, retypeRefs);
    if (node) root.appendChild(node);
  });

  if (window.lucide) window.lucide.createIcons();
  Prism.highlightAllUnder(root);
  attachCodeProtection(root);
  attachInterviewToggles(root);
  attachRetypeEditors(root, lesson);
}

function renderSection(section, lesson) {
  switch (section.type) {
    case "heading":
      return el("h2", "sec-heading", section.text);

    case "paragraph":
      return el("p", "sec-paragraph lesson-section", section.text);

    case "definition":
      return el(
        "div",
        "card def-card lesson-section",
        `<div class="def-term">${section.term}</div><div class="def-text">${section.text}</div>`
      );

    case "note":
      return el(
        "div",
        "callout callout-note lesson-section",
        `<i data-lucide="info" class="icon"></i><div>${section.text}</div>`
      );

    case "warning":
      return el(
        "div",
        "callout callout-warning lesson-section",
        `<i data-lucide="alert-triangle" class="icon"></i><div>${section.text}</div>`
      );

    case "tip":
      return el(
        "div",
        "callout callout-tip lesson-section",
        `<i data-lucide="lightbulb" class="icon"></i><div>${section.text}</div>`
      );

    case "realLifeExample":
      return el(
        "div",
        "real-life-card lesson-section",
        `<div class="rl-title">${section.title || "Real-Life Example"}</div><div>${section.text}</div>`
      );

    case "flow": {
      const stepsHtml = section.steps
        .map((s, i) => `<div class="flow-step">${s}</div>${i < section.steps.length - 1 ? '<span class="flow-arrow">→</span>' : ""}`)
        .join("");
      const wrap = el("div", "lesson-section");
      wrap.innerHTML = `${section.title ? `<div class="key-points-title">${section.title}</div>` : ""}<div class="flow-diagram">${stepsHtml}</div>`;
      return wrap;
    }

    case "keyPoints":
      return el(
        "div",
        "card lesson-section",
        `${section.title ? `<div class="key-points-title">${section.title}</div>` : ""}<ul class="key-points-list">${section.points
          .map((p) => `<li>${p}</li>`)
          .join("")}</ul>`
      );

    case "memoryTrick":
      return el(
        "div",
        "memory-trick lesson-section",
        `<div class="mt-title">${section.title || "Memory Trick"}</div><div class="mt-text">${section.text}</div>`
      );

    case "commonMistakes":
      return el(
        "div",
        "card common-mistakes lesson-section",
        `<div class="cm-title">${section.title || "Common Mistakes"}</div><ul>${section.items.map((i) => `<li>${i}</li>`).join("")}</ul>`
      );

    case "table": {
      const rows = section.rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("");
      const headers = section.headers.map((h) => `<th>${h}</th>`).join("");
      const wrap = el("div", "lesson-section");
      wrap.innerHTML = `${section.title ? `<div class="table-title">${section.title}</div>` : ""}<table class="data-table"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
      return wrap;
    }

    case "code":
      return renderCodeBlock(section);

    case "interviewQuestions":
      return renderInterviewQuestions(section);

    case "quickCheck":
      return el(
        "div",
        "card quick-check lesson-section",
        `<div class="cm-title">${section.title || "Quick Understanding Check"}</div><ol>${section.questions
          .map((q) => `<li>${q}</li>`)
          .join("")}</ol>`
      );

    default:
      return null;
  }
}

function renderCodeBlock(section) {
  const wrap = el("div", "lesson-section");
  const codeId = `code-${Math.random().toString(36).slice(2, 9)}`;
  const lineCount = section.code.split("\n").length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1).join("\n");

  wrap.innerHTML = `
    <div class="code-block">
      <div class="code-block-header">
        <span class="cb-lang">${section.lang || "cpp"}</span>
        ${section.filename ? `<span class="cb-filename">${section.filename}</span>` : "<span></span>"}
        <span class="cb-protected-note">read-only · type it yourself below</span>
      </div>
      <div class="code-body protected" id="${codeId}">
        <div class="code-lines">${lineNumbers}</div>
        <pre><code class="language-cpp">${escapeHtml(section.code)}</code></pre>
      </div>
      ${section.output ? `<div class="code-output"><span class="co-label">Output</span>${escapeHtml(section.output)}</div>` : ""}
    </div>
  `;

  if (section.retypePractice && section.retypeId) {
    const retypeWrap = el("div", "retype-wrapper");
    retypeWrap.dataset.retypeId = section.retypeId;
    retypeWrap.innerHTML = `
      <div class="retype-block">
        <div class="retype-header">
          <div class="rt-title"><i data-lucide="keyboard" class="icon"></i> Retype &amp; Practice</div>
          <div class="retype-stats">
            <span>Attempts: <span class="attempt-count">0</span></span>
            <span class="retyped-badge" style="display:${isRetyped(section.retypeId) ? "inline" : "none"};color:var(--success);font-weight:600;">✓ Completed</span>
          </div>
        </div>
        <div class="retype-editor"></div>
        <div class="retype-actions">
          <button class="btn btn-primary check-code-btn">Check Code</button>
          <button class="btn reset-code-btn">Reset</button>
        </div>
        <div class="retype-result"></div>
      </div>
    `;
    wrap.appendChild(retypeWrap);
  }

  return wrap;
}

function renderInterviewQuestions(section) {
  const wrap = el("div", "lesson-section");
  const qHtml = section.questions
    .map(
      (q, i) => `
      <div class="interview-q-card">
        <button class="interview-q-header" data-idx="${i}">
          <span>Q${i + 1}. ${q.question}</span>
          <i data-lucide="chevron-down" class="icon"></i>
        </button>
        <div class="interview-q-answer">${q.answer}</div>
      </div>
    `
    )
    .join("");

  wrap.innerHTML = `
    <h2 class="sec-heading">${section.title || "Interview Questions"}</h2>
    <div class="interview-block">${qHtml}</div>
    ${
      section.thirtySecondAnswer
        ? `<div class="thirty-sec-answer"><div class="tsa-title">🎤 30-Second Interview-Ready Answer</div>${section.thirtySecondAnswer}</div>`
        : ""
    }
  `;
  return wrap;
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function attachCodeProtection(root) {
  root.querySelectorAll(".code-body.protected").forEach((block) => {
    block.addEventListener("copy", (e) => e.preventDefault());
    block.addEventListener("cut", (e) => e.preventDefault());
    block.addEventListener("contextmenu", (e) => e.preventDefault());
    block.addEventListener("dragstart", (e) => e.preventDefault());
    block.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") e.preventDefault();
    });
    block.addEventListener("selectstart", (e) => {
      if (window.getSelection && block.contains(document.activeElement)) {
        // discourage selection-drag copying
      }
    });
  });
}

function attachInterviewToggles(root) {
  root.querySelectorAll(".interview-q-header").forEach((btn) => {
    btn.addEventListener("click", () => {
      const answer = btn.nextElementSibling;
      answer.classList.toggle("open");
    });
  });
}

async function attachRetypeEditors(root, lesson) {
  const retypeRefs = Object.fromEntries((lesson.retypePractice || []).map((r) => [r.id, r.reference]));

  for (const wrap of root.querySelectorAll(".retype-wrapper")) {
    const retypeId = wrap.dataset.retypeId;
    const reference = retypeRefs[retypeId];
    const editorContainer = wrap.querySelector(".retype-editor");
    const resultBox = wrap.querySelector(".retype-result");
    const attemptCountEl = wrap.querySelector(".attempt-count");
    const retypedBadge = wrap.querySelector(".retyped-badge");
    let attempts = 0;

    const theme = document.documentElement.getAttribute("data-theme") || "light";
    const editor = await createRetypeEditor(editorContainer, theme);

    wrap.querySelector(".check-code-btn").addEventListener("click", () => {
      attempts++;
      attemptCountEl.textContent = attempts;
      const typed = editor.getValue();
      const result = checkRetype(typed, reference);
      resultBox.className = "retype-result show " + (result.status === "success" ? "success" : result.status === "error" ? "error" : "warn");
      resultBox.textContent = result.detail ? `${result.message} — ${result.detail}` : result.message;
      if (result.status === "success") {
        markRetyped(retypeId);
        retypedBadge.style.display = "inline";
        checkLessonCompletion(lesson);
        updateOverallProgress(roadmap);
      }
    });

    wrap.querySelector(".reset-code-btn").addEventListener("click", () => {
      editor.setValue("");
      resultBox.classList.remove("show");
    });
  }
}

boot();
