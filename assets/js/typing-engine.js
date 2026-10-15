/** @typedef {import('./types').Lesson} Lesson */
const EMPTY = { id: 'empty', name: 'Načítavam', phase: '', description: '', text: '', targets: [] };
/** Pure training state; no DOM or persistence.
 * @param {Lesson[]} initialLessons
 * @param {() => number} clock
 */
export function createTypingEngine(initialLessons = [], clock = () => performance.now()) {
  /** @type {Lesson[]} */ let lessons = initialLessons;
  let lesson = lessons[0] ?? EMPTY;
  let index = 0, attempts = 0, errors = 0, activeMs = 0;
  /** @type {number|null} */ let startedAt = null;
  /** @type {number|null} */ let finishedMs = null;
  /** @type {{expected:string, typed:string}|null} */ let lastError = null;
  /** @type {string[]} */ let results = [];
  let runId = crypto.randomUUID();
  let claimed = false;
  const elapsed = () => Math.round(finishedMs ?? (activeMs + (startedAt === null ? 0 : Math.max(0, clock() - startedAt))));
  function snapshot() {
    return { lesson, exercise: lesson.targets, currentIndex: index, currentTarget: lesson.targets[index] ?? { char: '', code: '' }, attempts, errors, completed: index, isComplete: lesson.targets.length > 0 && index === lesson.targets.length, accuracy: attempts ? Math.round((attempts - errors) / attempts * 100) : 100, lastError, results: [...results], durationMs: elapsed(), runId };
  }
  function reset() {
    index = attempts = errors = activeMs = 0;
    startedAt = finishedMs = lastError = null;
    results = lesson.targets.map(() => 'pending');
    runId = crypto.randomUUID(); claimed = false;
    return snapshot();
  }
  /** @param {string} text */
  function handleText(text) {
    for (const char of Array.from(text.normalize('NFC'))) {
      if (!lesson.targets.length || snapshot().isComplete) break;
      startedAt ??= clock();
      attempts++;
      if (char === lesson.targets[index].char) {
        results[index++] = 'done'; lastError = null;
        if (index === lesson.targets.length) { finishedMs = elapsed(); startedAt = null; }
      } else {
        errors++; results[index] = 'error'; lastError = { expected: lesson.targets[index].char, typed: char };
      }
    }
    return snapshot();
  }
  function handleKeydown(event) {
    const altGraph = event.getModifierState?.('AltGraph') || event.ctrlKey && event.altKey || event.altKey && snapshot().currentTarget.altGraph && event.key === snapshot().currentTarget.char;
    if (event.isComposing || event.repeat || event.metaKey || ((event.ctrlKey || event.altKey) && !altGraph) || Array.from(event.key).length !== 1) return snapshot();
    return handleText(event.key);
  }
  // Hidden tabs and unfocused windows do not add to active completion time.
  function pause() { if (startedAt !== null) { activeMs += Math.max(0, clock() - startedAt); startedAt = null; } }
  /** @param {import('./types').Language} language @returns {import('./types').TrainingResult|null} */
  function claimResult(language) {
    const s = snapshot();
    if (!s.isComplete || claimed) return null;
    claimed = true;
    return { id: `r-${runId}`, lessonId: lesson.id, textId: lesson.textId ?? lesson.id, language, difficulty: lesson.difficulty ?? 1, attempts, errors, accuracy: s.accuracy, durationMs: elapsed(), length: lesson.targets.length, completedAt: new Date().toISOString() };
  }
  function setLesson(id) { lesson = lessons.find(l => l.id === id) ?? lessons[0] ?? EMPTY; return reset(); }
  /** @param {Lesson[]} next @param {string} [id] */
  function setLessons(next, id) { lessons = next; return setLesson(id); }
  reset();
  return { snapshot, reset, handleText, handleKeydown, pause, claimResult, setLesson, setLessons };
}
