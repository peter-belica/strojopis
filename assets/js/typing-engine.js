const FINGER_REACH_EXERCISE = [
  { char: "q", code: "KeyQ" },
  { char: "a", code: "KeyA" },
  { char: "w", code: "KeyW" },
  { char: "s", code: "KeyS" },
  { char: "e", code: "KeyE" },
  { char: "d", code: "KeyD" },
  { char: "r", code: "KeyR" },
  { char: "f", code: "KeyF" },
  { char: "u", code: "KeyU" },
  { char: "j", code: "KeyJ" },
  { char: "i", code: "KeyI" },
  { char: "k", code: "KeyK" },
  { char: "o", code: "KeyO" },
  { char: "l", code: "KeyL" },
  { char: "p", code: "KeyP" },
  { char: ";", code: "Semicolon" },
  { char: "a", code: "KeyA" },
  { char: "f", code: "KeyF" },
  { char: "j", code: "KeyJ" },
  { char: "l", code: "KeyL" },
  { char: "s", code: "KeyS" },
  { char: "d", code: "KeyD" },
  { char: "k", code: "KeyK" },
  { char: ";", code: "Semicolon" }
];

function emptyResults() {
  return FINGER_REACH_EXERCISE.map(() => "pending");
}

export function createTypingEngine() {
  const state = {
    currentIndex: 0,
    attempts: 0,
    errors: 0,
    completed: 0,
    lastError: null,
    results: emptyResults()
  };

  function currentTarget() {
    return FINGER_REACH_EXERCISE[state.currentIndex] || FINGER_REACH_EXERCISE[FINGER_REACH_EXERCISE.length - 1];
  }

  function accuracy() {
    if (!state.attempts) {
      return 100;
    }

    return Math.max(0, Math.round(((state.attempts - state.errors) / state.attempts) * 100));
  }

  function snapshot() {
    return {
      exercise: FINGER_REACH_EXERCISE,
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
    state.attempts += 1;

    if (typed === expected && event.code === target.code) {
      state.results[state.currentIndex] = "done";
      state.currentIndex = (state.currentIndex + 1) % FINGER_REACH_EXERCISE.length;
      state.completed += 1;
      state.lastError = null;

      if (state.currentIndex === 0) {
        state.results = emptyResults();
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
    state.results = emptyResults();
    return snapshot();
  }

  return {
    handleKeydown,
    reset,
    snapshot
  };
}
