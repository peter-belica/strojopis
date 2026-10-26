/** @typedef {import('./types').Lesson} Lesson */
const EMPTY = { id: 'empty', name: 'Načítavam', phase: '', description: '', text: '', targets: [] };
const SPEED_WINDOW_MS = 5000, SPEED_IDLE_MS = 2000;
/** Correct characters per active minute; the first second is a measurement warm-up. */
export const charactersPerMinute = (characters, durationMs) => durationMs >= 1000 ? Math.round(characters * 60000 / durationMs) : 0;
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
  /** @type {number[]} */ let correctTimes = [];
  /** @type {number|null} */ let paceStartedAt = null;
  /** @type {number|null} */ let lastCorrectAt = null;
  const elapsed = () => Math.round(finishedMs ?? (activeMs + (startedAt === null ? 0 : Math.max(0, clock() - startedAt))));
  function snapshot() {
    const now = clock(), durationMs = elapsed();
    const isComplete = lesson.targets.length > 0 && index === lesson.targets.length;
    const speedDuration = paceStartedAt === null ? 0 : Math.min(SPEED_WINDOW_MS, now - paceStartedAt);
    const moving = startedAt !== null && lastCorrectAt !== null && now - lastCorrectAt < SPEED_IDLE_MS && !isComplete;
    const currentCpm = moving ? charactersPerMinute(correctTimes.filter(time => time > now - SPEED_WINDOW_MS).length, speedDuration) : 0;
    return { lesson, exercise: lesson.targets, currentIndex: index, currentTarget: lesson.targets[index] ?? { char: '', code: '' }, attempts, errors, completed: index, isComplete, accuracy: attempts ? Math.round((attempts - errors) / attempts * 100) : 100, lastError, results: [...results], durationMs, runId, currentCpm, averageCpm: charactersPerMinute(index, durationMs), isPaused: attempts > 0 && startedAt === null && !isComplete };
  }
  function reset() {
    index = attempts = errors = activeMs = 0;
    startedAt = finishedMs = lastError = null;
    results = lesson.targets.map(() => 'pending');
    runId = crypto.randomUUID(); claimed = false;
    correctTimes = []; paceStartedAt = lastCorrectAt = null;
    return snapshot();
  }
  /** @param {string} text */
  function handleText(text) {
    for (const char of Array.from(text.normalize('NFC'))) {
      if (!lesson.targets.length || snapshot().isComplete) break;
      const now = clock();
      startedAt ??= now;
      paceStartedAt ??= now;
      attempts++;
      if (char === lesson.targets[index].char) {
        if (lastCorrectAt === null || now - lastCorrectAt >= SPEED_IDLE_MS) {
          correctTimes = []; paceStartedAt = now;
        }
        correctTimes = correctTimes.filter(time => time > now - SPEED_WINDOW_MS);
        correctTimes.push(now); lastCorrectAt = now;
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
  function pause() {
    if (startedAt !== null) { activeMs += Math.max(0, clock() - startedAt); startedAt = null; }
    correctTimes = []; paceStartedAt = lastCorrectAt = null;
  }
  /** @param {import('./types').Language} language @returns {import('./types').TrainingResult|null} */
  function claimResult(language) {
    const s = snapshot();
    if (!s.isComplete || claimed) return null;
    claimed = true;
    return { id: `r-${runId}`, lessonId: lesson.id, textId: lesson.textId ?? lesson.id, textIds: lesson.textIds ?? [], sentenceCount: lesson.sentenceCount ?? 0, exerciseVersion: lesson.exerciseVersion ?? 1, language, difficulty: lesson.difficulty ?? 1, attempts, errors, accuracy: s.accuracy, durationMs: elapsed(), length: lesson.targets.length, completedAt: new Date().toISOString() };
  }
  function setLesson(id) { lesson = lessons.find(l => l.id === id) ?? lessons[0] ?? EMPTY; return reset(); }
  /** @param {Lesson[]} next @param {string} [id] */
  function setLessons(next, id) { lessons = next; return setLesson(id); }
  /** Change the visual input recipe without resetting the text or measurements.
   * @param {import('./types').Target[]} targets
   */
  function remapTargets(targets) {
    if (targets.length !== lesson.targets.length || targets.some((target, i) => target.char !== lesson.targets[i].char)) throw new Error('Mapovanie musí zachovať text cvičenia.');
    lesson = { ...lesson, targets };
    return snapshot();
  }
  reset();
  return { snapshot, reset, handleText, handleKeydown, pause, claimResult, setLesson, setLessons, remapTargets };
}
