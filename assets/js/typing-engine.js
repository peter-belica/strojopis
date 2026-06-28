import { getLesson } from "./lessons.js";

function emptyResults(targets) {
  return targets.map(() => "pending");
}

export function createTypingEngine() {
  const state = {
    lesson: getLesson("home-row"),
    currentIndex: 0,
    attempts: 0,
    errors: 0,
    completed: 0,
    lastError: null,
    results: []
  };

  state.results = emptyResults(state.lesson.targets);

  function currentTarget() {
    return state.lesson.targets[state.currentIndex] || state.lesson.targets[state.lesson.targets.length - 1];
  }

  function accuracy() {
    if (!state.attempts) {
      return 100;
    }

    return Math.max(0, Math.round(((state.attempts - state.errors) / state.attempts) * 100));
  }

  function snapshot() {
    return {
      lesson: state.lesson,
      exercise: state.lesson.targets,
      currentIndex: state.currentIndex,
      currentTarget: currentTarget(),
      attempts: state.attempts,
      errors: state.errors,
      completed: state.completed,
      accuracy: accuracy(),
      lastError: state.lastError,
      results: [...state.results]
    };
  }

  function handleKeydown(event) {
    if (event.key.length !== 1) {
      return snapshot();
    }

    const target = currentTarget();
    const typed = event.key.toLowerCase();
    const expected = target.char.toLowerCase();
    const codeMatches = target.code ? event.code === target.code : true;
    state.attempts += 1;

    if (typed === expected && codeMatches) {
      state.results[state.currentIndex] = "done";
      state.currentIndex = (state.currentIndex + 1) % state.lesson.targets.length;
      state.completed += 1;
      state.lastError = null;

      if (state.currentIndex === 0) {
        state.results = emptyResults(state.lesson.targets);
      }

      return snapshot();
    }

    state.errors += 1;
    state.results[state.currentIndex] = "error";
    state.lastError = {
      expected: target.char,
      typed: event.key
    };

    return snapshot();
  }

  function reset() {
    state.currentIndex = 0;
    state.attempts = 0;
    state.errors = 0;
    state.completed = 0;
    state.lastError = null;
    state.results = emptyResults(state.lesson.targets);
    return snapshot();
  }

  function setLesson(id) {
    state.lesson = getLesson(id);
    state.currentIndex = 0;
    state.attempts = 0;
    state.errors = 0;
    state.completed = 0;
    state.lastError = null;
    state.results = emptyResults(state.lesson.targets);
    return snapshot();
  }

  return {
    handleKeydown,
    reset,
    setLesson,
    snapshot
  };
}
