import { getJSON, setJSON } from "./storage.js";

function getState() {
  return getJSON("progress", { completedLessons: {}, retyped: {}, viewedSections: {} });
}

function saveState(state) {
  setJSON("progress", state);
}

export function markRetyped(retypeId) {
  const state = getState();
  state.retyped[retypeId] = true;
  saveState(state);
}

export function isRetyped(retypeId) {
  return !!getState().retyped[retypeId];
}

export function markLessonViewed(lessonId) {
  const state = getState();
  state.viewedSections[lessonId] = true;
  saveState(state);
}

export function checkLessonCompletion(lesson) {
  const state = getState();
  const requiredRetypes = lesson.completionRules?.requireRetypeIds || [];
  const allRetyped = requiredRetypes.every((id) => state.retyped[id]);
  const viewed = !!state.viewedSections[lesson.id];
  const complete = viewed && allRetyped;
  if (complete) {
    state.completedLessons[lesson.id] = true;
    saveState(state);
  }
  return complete;
}

export function isLessonCompleted(lessonId) {
  return !!getState().completedLessons[lessonId];
}

export function getOverallProgress(allLessonIds) {
  const state = getState();
  const total = allLessonIds.length || 1;
  const done = allLessonIds.filter((id) => state.completedLessons[id]).length;
  return Math.round((done / total) * 100);
}
