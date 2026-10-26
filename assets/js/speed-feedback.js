export const SPEEDOMETER_MAX = 600;

/** The runner responds to current correct-character throughput, never to errors.
 * @param {number} cpm Correct characters per minute.
 */
export function getSpeedPace(cpm) {
  if (cpm <= 0) return 'idle';
  if (cpm < 120) return 'stroll';
  if (cpm < 240) return 'walk';
  if (cpm < 360) return 'run';
  return 'sprint';
}

/** @param {ReturnType<ReturnType<typeof import('./typing-engine.js').createTypingEngine>['snapshot']>} state */
export function getSpeedFeedback(state) {
  const pace = state.isComplete ? 'complete' : state.isPaused ? 'paused' : getSpeedPace(state.currentCpm);
  const labels = { idle: state.attempts ? 'Naberáme tempo' : 'Pripravený na štart', paused: 'Prestávka', stroll: 'Pomalá chôdza', walk: 'Svižná chôdza', run: 'Bežíme!', sprint: 'Šprintujeme!', complete: 'V cieli. Výborne!' };
  const value = state.isComplete ? state.averageCpm : state.currentCpm;
  return { pace, label: labels[pace], value, moving: !['idle', 'paused', 'complete'].includes(pace),
    fill: Math.min(value / SPEEDOMETER_MAX, 1) * 100,
    stepSeconds: Math.max(0.14, 0.66 - value / 850), stride: Math.min(64, 18 + value / 8), lean: Math.min(16, value / 30) };
}
