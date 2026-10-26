import { createStorage } from "./storage.js";
import { createProfileManager } from "./profiles.js";
import { KEYBOARD_MODELS, getKeyboardModel } from "./keyboard-models.js";
import { DEFAULT_LAYOUT_ID, loadKeyboardLayout } from "./keyboard-layouts.js";
import { loadCourse, loadCourseCatalog, prepareLessons } from "./lesson-loader.js";
import { createTypingEngine } from "./typing-engine.js";
import { getFingerForCode, getFingerName, getFingerClass, getModifierCodes, renderHandIllustrations, updateHandGuide } from "./hand-guide.js";

import { prepareExercise, targetsFromText } from './lessons.js';
import { DIFFICULTIES } from './sentences.js';
import { SENTENCE_COUNTS } from './data-model.js';

const storage = createStorage();
const profiles = createProfileManager(storage);
const typing = createTypingEngine();

const dom = {
  profileForm: /** @type {HTMLFormElement} */ (document.querySelector("#profileForm")),
  profileName: /** @type {HTMLInputElement} */ (document.querySelector("#profileName")),
  profileSelect: /** @type {HTMLSelectElement} */ (document.querySelector("#profileSelect")),
  activeProfileChip: /** @type {HTMLElement} */ (document.querySelector("#activeProfileChip span:last-child")),
  storageStatus: /** @type {HTMLElement} */ (document.querySelector("#storageStatus")),
  keyboardModel: /** @type {HTMLSelectElement} */ (document.querySelector("#keyboardModel")),
  languageLayout: /** @type {HTMLSelectElement} */ (document.querySelector("#languageLayout")),
  keyboardLocale: /** @type {HTMLSelectElement} */ (document.querySelector('#keyboardLocale')),
  keyboardPlatform: /** @type {HTMLSelectElement} */ (document.querySelector('#keyboardPlatform')),
  sentencePosition: /** @type {HTMLElement} */ (document.querySelector('#sentencePosition')),
  lessonSelect: /** @type {HTMLSelectElement} */ (document.querySelector("#lessonSelect")),
  lessonMeta: /** @type {HTMLElement} */ (document.querySelector("#lessonMeta")),
  typingStrip: /** @type {HTMLElement} */ (document.querySelector("#typingStrip")),
  feedbackLine: /** @type {HTMLElement} */ (document.querySelector("#feedbackLine")),
  keyboardWorkbench: /** @type {HTMLElement} */ (document.querySelector(".keyboard-workbench")),
  keyboardPreview: /** @type {HTMLElement} */ (document.querySelector("#keyboardPreview")),
  statProfile: /** @type {HTMLElement} */ (document.querySelector("#statProfile")),
  statKeyboard: /** @type {HTMLElement} */ (document.querySelector("#statKeyboard")),
  statLanguage: /** @type {HTMLElement} */ (document.querySelector("#statLanguage")),
  statAccuracy: /** @type {HTMLElement} */ (document.querySelector("#statAccuracy")),
  statErrors: /** @type {HTMLElement} */ (document.querySelector("#statErrors")),
  statTotal: /** @type {HTMLElement} */ (document.querySelector('#statTotal')),
  statCorrect: /** @type {HTMLElement} */ (document.querySelector('#statCorrect')),
  statRemaining: /** @type {HTMLElement} */ (document.querySelector('#statRemaining')),
  progressPercent: /** @type {HTMLElement} */ (document.querySelector('#progressPercent')),
  resetButton: /** @type {HTMLButtonElement} */ (document.querySelector("#resetButton")),
  practicePanel: /** @type {HTMLElement} */ (document.querySelector(".practice-panel")),
  practiceTitle: /** @type {HTMLElement} */ (document.querySelector("#practiceTitle")),
  guideToggle: /** @type {HTMLButtonElement} */ (document.querySelector("#guideToggle")),
  guideToggleStatus: /** @type {HTMLElement} */ (document.querySelector("#guideToggleStatus")),
  handGuide: /** @type {HTMLElement} */ (document.querySelector("#handGuide")),
  fingerInstruction: /** @type {HTMLElement} */ (document.querySelector("#fingerInstruction")),
  fingerLegend: /** @type {HTMLElement} */ (document.querySelector("#fingerLegend")),
  targetBadge: /** @type {HTMLElement} */ (document.querySelector("#targetBadge")),
  fingerName: /** @type {HTMLElement} */ (document.querySelector("#fingerName")),
  fingerDescription: /** @type {HTMLElement} */ (document.querySelector("#fingerDescription")),
  upcomingKeys: /** @type {HTMLElement} */ (document.querySelector("#upcomingKeys")),
  exercisePosition: /** @type {HTMLElement} */ (document.querySelector("#exercisePosition")),
  exerciseProgress: /** @type {HTMLElement} */ (document.querySelector("#exerciseProgress")),
  progressFill: /** @type {HTMLElement} */ (document.querySelector("#progressFill")),
  guideFooter: /** @type {HTMLElement} */ (document.querySelector("#guideFooter")),
  difficulty: /** @type {HTMLInputElement} */ (document.querySelector('#difficulty')),
  difficultyName: /** @type {HTMLElement} */ (document.querySelector('#difficultyName')),
  difficultyDescription: /** @type {HTMLElement} */ (document.querySelector('#difficultyDescription')),
  difficultySample: /** @type {HTMLElement} */ (document.querySelector('#difficultySample')),
  difficultyPending: /** @type {HTMLElement} */ (document.querySelector('#difficultyPending')),
  rememberButton: /** @type {HTMLButtonElement} */ (document.querySelector('#rememberButton')),
  deleteProfileButton: /** @type {HTMLButtonElement} */ (document.querySelector('#deleteProfileButton')),
  deleteAllButton: /** @type {HTMLElement} */ (document.querySelector('#deleteAllButton')),
  profileMessage: /** @type {HTMLElement} */ (document.querySelector('#profileMessage')),
  profileProgress: /** @type {HTMLElement} */ (document.querySelector('#profileProgress')),
  trainingInput: /** @type {HTMLTextAreaElement} */ (document.querySelector('#trainingInput')),
  resultPanel: /** @type {HTMLElement} */ (document.querySelector('#resultPanel')),
  resultTitle: /** @type {HTMLElement} */ (document.querySelector('#resultTitle')),
  resultMetrics: /** @type {HTMLElement} */ (document.querySelector('#resultMetrics')),
  resultProgress: /** @type {HTMLElement} */ (document.querySelector('#resultProgress')),
  repeatButton: /** @type {HTMLElement} */ (document.querySelector('#repeatButton')),
  nextButton: /** @type {HTMLElement} */ (document.querySelector('#nextButton')),
  deleteDialog: /** @type {HTMLDialogElement} */ (document.querySelector('#deleteDialog')),
  deleteDescription: /** @type {HTMLElement} */ (document.querySelector('#deleteDescription')),
  cancelDeleteButton: /** @type {HTMLElement} */ (document.querySelector('#cancelDeleteButton')),
  confirmDeleteButton: /** @type {HTMLElement} */ (document.querySelector('#confirmDeleteButton')),
  guideExplanation: /** @type {HTMLElement} */ (document.querySelector(".guide-toolbar p"))
};

/** @type {{activeProfile: import('./types').Profile|null, courseCatalog: {id:string,name:string,courseUrl:string}[], course: import('./types').Course|null, keyboardLayout: import('./types').KeyboardLayout|null, lessons: import('./types').Lesson[], sentences: import('./types').Sentence[], guideEnabled:boolean, difficulty:number, typing:ReturnType<typeof typing.snapshot>}} */
const state = {
  activeProfile: profiles.getActiveProfile(),
  courseCatalog: [],
  course: null,
  keyboardLayout: null,
  lessons: [],
  guideEnabled: profiles.getActiveProfile()?.guideEnabled ?? true,
  difficulty: profiles.getActiveProfile()?.difficulty ?? 1,
  sentences: [],
  typing: typing.snapshot()
};

function activeSettings() {
  return {
    keyboardModel: dom.keyboardModel.value,
    languageLayout: dom.languageLayout.value || DEFAULT_LAYOUT_ID,
    keyboardLocale: dom.keyboardLocale.value || 'sk-sk',
    keyboardPlatform: dom.keyboardPlatform.value || 'mac',
    difficulty: state.difficulty,
    guideEnabled: state.guideEnabled
  };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function setControlsFromProfile(profile) {
  if (!profile) {
    return;
  }

  state.guideEnabled = profile.guideEnabled;
  state.difficulty = profile.difficulty;
  dom.difficulty.value = String(state.difficulty);
  dom.keyboardModel.value = profile.keyboardModel || "macbook-air";
  dom.keyboardLocale.value = profile.keyboardLocale;
  dom.keyboardPlatform.value = profile.keyboardPlatform;
  const languageLayout = profile.languageLayout || DEFAULT_LAYOUT_ID;
  const hasLanguageOption = Array.from(dom.languageLayout.options).some((option) => option.value === languageLayout);
  dom.languageLayout.value = hasLanguageOption ? languageLayout : state.course?.id || DEFAULT_LAYOUT_ID;
}

function syncActiveProfile() {
  state.activeProfile = profiles.getActiveProfile();
  setControlsFromProfile(state.activeProfile);
}

function renderProfileSelect() {
  const items = profiles.listProfiles();

  if (!items.length) {
    dom.profileSelect.innerHTML = '<option value="">Žiadny profil</option>';
    dom.profileSelect.disabled = true;
    return;
  }

  dom.profileSelect.disabled = false;
  dom.profileSelect.innerHTML = items
    .map((profile) => {
      const selected = state.activeProfile && profile.id === state.activeProfile.id ? " selected" : "";
      return `<option value="${escapeHtml(profile.id)}"${selected}>${escapeHtml(profile.name)}</option>`;
    })
    .join("");
}

let stripRunId = '', renderedTokenIndex = -1;
function renderTypingStrip() {
  if (stripRunId !== state.typing.runId) {
    stripRunId = state.typing.runId;
    renderedTokenIndex = -1;
    dom.typingStrip.scrollTop = 0;
    dom.typingStrip.innerHTML = state.typing.exercise
    .map((target, index) => {
      const classes = ["typing-token"];
      if (index === state.typing.currentIndex) {
        classes.push("is-current");
      }
      if (state.typing.results[index] === "done") {
        classes.push("is-done");
      }
      if (state.typing.results[index] === "error") {
        classes.push("is-error");
      }
      const label = target.char === " " ? "␣" : target.char;
      if (target.char === " ") {
        classes.push("is-space-token");
      }
      return `<span class="${classes.join(" ")}"${index === state.typing.currentIndex ? ' aria-current="true"' : ""}>${escapeHtml(label)}</span>`;
    })
    .join("");
  }
  const changedIndices = renderedTokenIndex >= 0
    ? Array.from({ length: Math.max(0,state.typing.currentIndex - renderedTokenIndex) + 1 }, (_, offset) => renderedTokenIndex + offset)
    : [state.typing.currentIndex];
  for (const index of changedIndices) {
    const token = dom.typingStrip.children[index];
    if (!(token instanceof HTMLElement)) continue;
    token.classList.toggle('is-current', index === state.typing.currentIndex);
    token.classList.toggle('is-done', state.typing.results[index] === 'done');
    token.classList.toggle('is-error', state.typing.results[index] === 'error');
    if (index === state.typing.currentIndex) token.setAttribute('aria-current', 'true');
    else token.removeAttribute('aria-current');
  }
  renderedTokenIndex = state.typing.currentIndex;

  keepCurrentTokenVisible();
}

function keepCurrentTokenVisible() {
  const token = /** @type {HTMLElement|null} */ (dom.typingStrip.querySelector('.typing-token.is-current'));
  if (!token) return;
  const style = getComputedStyle(dom.typingStrip);
  const topPadding = parseFloat(style.paddingTop);
  const bottomPadding = parseFloat(style.paddingBottom);
  if (token.offsetTop < dom.typingStrip.scrollTop + topPadding ||
      token.offsetTop + token.offsetHeight > dom.typingStrip.scrollTop + dom.typingStrip.clientHeight - bottomPadding) {
    dom.typingStrip.scrollTop = token.offsetTop - topPadding - token.offsetHeight - parseFloat(style.rowGap);
  }
}
new ResizeObserver(keepCurrentTokenVisible).observe(dom.typingStrip);

let guidanceStep = 0;
const pressedCodes = new Set();
function guidanceTarget() {
  const target = state.typing.currentTarget;
  const stroke = target.steps?.[Math.min(guidanceStep, target.steps.length - 1)];
  const resolved = stroke ? { ...target, code: stroke.code, steps: [stroke] } : target;
  const physicalCodes = new Set(getKeyboardModel(dom.keyboardModel.value).keys.map(key => key.code));
  return physicalCodes.has(resolved.code) && getModifierCodes(resolved).every(code => physicalCodes.has(code)) ? resolved : { ...target, code:'',steps:[] };
}

function keyClasses(code, target = guidanceTarget()) {
  const classes = ["key"];

  if (["Tab", "CapsLock", "ShiftLeft", "ShiftRight", "ControlLeft", "ControlRight", "AltLeft", "AltRight", "MetaLeft", "MetaRight", "Backspace", "Enter"].includes(code)) {
    classes.push("is-wide");
  }

  if (code === "Backspace") {
    classes.push("is-backspace");
  }

  if (code === "Enter") {
    classes.push("is-enter");
  }

  if (code === "Space") {
    classes.push("is-space");
  }

  if (["KeyA", "KeyS", "KeyD", "KeyF", "KeyJ", "KeyK", "KeyL", "Semicolon"].includes(code)) {
    classes.push("is-home");
  }

  const finger = getFingerForCode(code);
  if (finger) classes.push(getFingerClass(finger.finger));
  if (state.guideEnabled && getModifierCodes(target).includes(code)) {
    classes.push("is-modifier");
  }
  if (state.guideEnabled && code === target.code) {
    classes.push("is-active");
  }
  if (pressedCodes.has(code)) classes.push('is-pressed');

  return classes.join(" ");
}

let renderedKeyboard = '';
function renderKeyboard() {
  const model = getKeyboardModel(dom.keyboardModel.value);
  const layout = state.keyboardLayout;
  if (!layout) return;
  const target = guidanceTarget();

  const signature = `${model.id}:${layout.platform}:${layout.id}`;
  if (signature !== renderedKeyboard) {
    renderedKeyboard = signature;
    dom.keyboardPreview.style.aspectRatio = `${model.width} / ${model.height}`;
    dom.keyboardPreview.dataset.variant = model.variant;
    dom.keyboardPreview.innerHTML = model.keys.map(key => {
      const code = key.code;
      const label = code === 'Space' ? 'medzerník' : key.label || layout.labels[code] || code;
      const finger = getFingerForCode(code)?.finger;
      const cutout = key.shape === 'iso-enter' ? 'clip-path:polygon(0 0,100% 0,100% 100%,16.667% 100%,16.667% 50%,0 50%);' : '';
      const style = `left:calc(${key.x / model.width * 100}% + var(--key-gap));top:calc(${key.y / model.height * 100}% + var(--key-gap));width:calc(${key.width / model.width * 100}% - 2 * var(--key-gap));height:calc(${key.height / model.height * 100}% - 2 * var(--key-gap));${cutout}`;
      return `<span class="${keyClasses(code,target)}" data-code="${escapeHtml(code)}"${finger ? ` data-finger="${finger}"` : ''} style="${style}">${escapeHtml(label)}</span>`;
    }).join('');
  } else {
    dom.keyboardPreview.querySelectorAll('[data-code]').forEach(key => {
      key.className = keyClasses(/** @type {HTMLElement} */ (key).dataset.code,target);
    });
  }
  updateHands();
}

function updateHands() {
  updateHandGuide(dom.keyboardWorkbench, guidanceTarget(), state.guideEnabled && !state.typing.isComplete, { model: getKeyboardModel(dom.keyboardModel.value), pressedCodes });
}

function renderStorageStatus() {
  const { persistent, blocked, reason } = storage.status();
  const messages = {
    memory: 'Bez zapamätania: zmeny zostanú iba v otvorenej stránke.',
    saved: 'Zapamätanie je zapnuté. Profil aj progres zostanú v tomto prehliadači.',
    future: 'Údaje vytvorila novšia verzia. Chránime ich pred prepísaním; nové zmeny zostanú iba v otvorenej stránke.',
    'read-error': 'Uložené údaje sa nedajú bezpečne načítať. Tréning funguje v pamäti; nové zmeny po zatvorení nezostanú uložené.',
    'write-error': 'Zápis sa nepodaril alebo je úložisko plné. Nové zmeny po zatvorení nezostanú uložené. Pôvodné cookies pri neúspešnom prenose zostali zachované.',
    'delete-error': 'Vymazanie sa nepodarilo. V prehliadači môžu zostať pôvodné údaje; ďalšie zmeny zostanú iba v pamäti.'
  };
  dom.storageStatus.textContent = messages[reason];
  dom.storageStatus.className = `helper-text ${['memory','saved'].includes(reason) ? '' : 'is-warning'}`;
  dom.rememberButton.textContent = persistent ? 'Vypnúť zapamätanie' : 'Zapamätať tréning';
  dom.rememberButton.disabled = blocked;
}

function renderStats() {
  const profileName = state.activeProfile ? state.activeProfile.name : "-";
  const keyboard = getKeyboardModel(dom.keyboardModel.value);
  const layout = state.keyboardLayout;

  dom.activeProfileChip.textContent = state.activeProfile ? state.activeProfile.name : "Bez profilu";
  dom.statProfile.textContent = profileName;
  dom.statKeyboard.textContent = keyboard.name;
  dom.statLanguage.textContent = layout ? layout.name : "-";
  dom.statAccuracy.textContent = `${state.typing.accuracy}%`;
  dom.statErrors.textContent = String(state.typing.errors);
  const total = state.typing.exercise.length;
  const completed = state.typing.completed;
  const remaining = total - completed;
  const progress = total ? completed / total * 100 : 0;
  dom.statTotal.textContent = String(total);
  dom.statCorrect.textContent = String(completed);
  dom.statRemaining.textContent = characterCountLabel(remaining);
  dom.progressPercent.textContent = `${Math.floor(progress)} %`;
  dom.progressFill.style.width = `${progress}%`;
  dom.exerciseProgress.setAttribute('aria-valuemax', String(total || 1));
  dom.exerciseProgress.setAttribute('aria-valuenow', String(completed));
  dom.exerciseProgress.setAttribute('aria-valuetext', `Správne ${completed} z ${total} znakov. Zostáva ${characterCountLabel(remaining)}.`);
}

/** @param {number} count */
function characterCountLabel(count) {
  return `${count} ${count === 1 ? 'znak' : count >= 2 && count <= 4 ? 'znaky' : 'znakov'}`;
}

function renderFeedback() {
  if (state.typing.isComplete) { dom.feedbackLine.textContent = 'Hotovo! Výsledok nájdeš v prehľade tréningu.'; dom.feedbackLine.className = 'feedback-line'; return; }
  if (!state.typing.lastError) {
    dom.feedbackLine.textContent = state.typing.completed ? "Výborne, pokračuj ďalším znakom." : "Začni zvýrazneným znakom. Máš čas.";
    dom.feedbackLine.className = "feedback-line";
    return;
  }

  dom.feedbackLine.textContent = `Skús ešte raz: ${state.typing.lastError.expected === " " ? "medzerník" : state.typing.lastError.expected}.`;
  dom.feedbackLine.className = "feedback-line is-error";
}

function renderFingerGuidance() {
  if (!state.keyboardLayout) return;
  const target = guidanceTarget();
  const guide = getFingerForCode(target.code);
  const colorClass = getFingerClass(guide?.finger);
  dom.practicePanel.classList.toggle("guidance-off", !state.guideEnabled);
  dom.guideToggle.setAttribute("aria-checked", String(state.guideEnabled));
  dom.guideToggleStatus.textContent = state.guideEnabled ? "Zapnuté" : "Vypnuté";
  dom.guideExplanation.textContent = state.guideEnabled ? "Rovnaká farba = rovnaký prst." : "Trénuj samostatne, svojím tempom.";
  [dom.handGuide, dom.fingerInstruction, dom.fingerLegend].forEach((element) => {
    element.hidden = !state.guideEnabled || state.typing.isComplete;
  });
  dom.fingerInstruction.className = `finger-instruction ${colorClass}`;
  dom.keyboardWorkbench.className = `keyboard-workbench ${colorClass}`;
  dom.targetBadge.textContent = target.char === " " ? "␣" : target.char;
  dom.fingerName.textContent = getFingerName(guide?.finger);
  const label = state.keyboardLayout.labels[target.code] || target.char;
  const modifiers = getModifierCodes(target);
  const layoutLabels = state.keyboardLayout.labels;
  const modifierLabel = code => layoutLabels[code] || code;
  const modifierText = modifiers.map(code => ` + ${modifierLabel(code)}`).join('');
  const stepCount = state.typing.currentTarget.steps?.length ?? 1;
  const stepText = stepCount > 1 ? `Krok ${guidanceStep + 1} z ${stepCount}. ${target.steps?.[0]?.dead ? 'Najprv stlač znamienko, potom písmeno. ' : ''}` : '';
  dom.fingerDescription.textContent = guide
    ? target.code === "Space" ? 'Stlač medzerník palcom.' : `${stepText}Kláves ${label}${modifierText}.`
    : 'Pre tento znak nie je overený postup na zvolenej klávesnici. Napíš ho svojím systémovým rozložením.';
  dom.guideFooter.textContent = state.guideEnabled ? "Sleduj znak → nájdi prst → stlač kláves" : "Samostatný tréning · pomôcku môžeš kedykoľvek zapnúť";
  dom.upcomingKeys.innerHTML = state.typing.exercise.slice(state.typing.currentIndex + 1, state.typing.currentIndex + 5)
    .map((item) => {
      const finger = getFingerForCode(item.code)?.finger;
      return `<span class="upcoming-key ${getFingerClass(finger)}" title="${escapeHtml(getFingerName(finger))}">${escapeHtml(item.char === " " ? "␣" : item.char)}</span>`;
    }).join("") || '<span class="helper-text">Koniec cvičenia</span>';
  const total = state.typing.exercise.length;
  dom.exercisePosition.textContent = `${Math.min(state.typing.currentIndex + 1, total)} / ${total}`;
  const count = state.typing.lesson.sentenceCount ?? 0;
  const currentSentence = (state.typing.lesson.sentenceEnds ?? []).filter(end => end <= state.typing.currentIndex).length + 1;
  dom.sentencePosition.textContent = count ? `Veta ${Math.min(currentSentence, count)} zo ${count}` : 'Cvičenie klávesov a slov';
}

function renderLessonMeta() {
  dom.practiceTitle.textContent = state.typing.lesson.name;
  dom.lessonMeta.textContent = state.typing.lesson.fallback
    ? 'Pre zvolený počet viet z doteraz prebraných znakov tu nie je dostatok textov. Precvičuješ klávesy alebo slová. Vety všetkých úrovní nájdeš vo voľnom tréningu.'
    : `${state.typing.lesson.phase}: ${state.typing.lesson.description}`;
}

function renderSettingsOptions() {
  const selectedKeyboard = dom.keyboardModel.value || 'macbook-air';
  dom.keyboardModel.innerHTML = Object.values(KEYBOARD_MODELS)
    .map((model) => `<option value="${escapeHtml(model.id)}">${escapeHtml(model.name)}</option>`)
    .join("");

  dom.languageLayout.innerHTML = state.courseCatalog
    .map((course) => `<option value="${escapeHtml(course.id)}">${escapeHtml(course.name)}</option>`)
    .join("");

  renderLessonOptions();

  setControlsFromProfile(state.activeProfile);
  if (!state.activeProfile) {
    dom.keyboardModel.value = selectedKeyboard;
    dom.languageLayout.value = state.course?.id || DEFAULT_LAYOUT_ID;
  }
  dom.lessonSelect.value = state.typing.lesson.id;
}

function render() {
  renderStorageStatus();
  renderProfileSelect();
  renderStats();
  renderLessonMeta();
  renderFeedback();
  renderTypingStrip();
  renderFingerGuidance();
  renderKeyboard();
  renderDifficulty();
  renderResult();
}

function renderDifficulty() {
  if (previewDifficulty !== state.difficulty && state.course && state.keyboardLayout) {
    prepareLessonPreviews();
    renderLessonOptions();
  }
  const rule = DIFFICULTIES[state.difficulty - 1];
  dom.difficulty.value = String(state.difficulty);
  dom.difficulty.setAttribute('aria-valuetext', `${state.difficulty}. ${rule.name}`);
  dom.difficultyName.textContent = `${state.difficulty} / 4 · ${rule.name}`;
  const count = SENTENCE_COUNTS[state.difficulty - 1];
  dom.difficultyDescription.textContent = `${count} ${count < 5 ? 'vety' : 'viet'} v cvičení · ${rule.audience}.`;
  dom.difficultySample.textContent = state.sentences.find(s => s.difficulty === state.difficulty)?.text ?? '';
  dom.difficultyPending.textContent = state.difficulty !== state.typing.lesson.difficulty ? 'Nová úroveň sa použije pri ďalšom cvičení alebo po stlačení Odznova.' : '';
}

function renderResult() {
  const s = state.typing;
  dom.resultPanel.hidden = !s.isComplete;
  dom.trainingInput.disabled = s.isComplete || loading;
  dom.lessonSelect.disabled = loading;
  dom.keyboardLocale.disabled = loading;
  dom.keyboardPlatform.disabled = loading;
  dom.practicePanel.setAttribute('aria-busy', String(loading));
  dom.deleteProfileButton.disabled = !state.activeProfile;
  const courses = Object.values(state.activeProfile?.courses ?? {});
  const summaries = courses.flatMap(c => Object.values(c.lessons));
  const count = summaries.reduce((n, item) => n + item.completedAttempts, 0);
  dom.profileProgress.textContent = state.activeProfile ? `${summaries.length} dokončených lekcií · ${count} dokončených pokusov` : 'Profil je voliteľný. Vytvor si ho pre vlastné nastavenia a progres.';
  if (!s.isComplete || !state.course) return;
  dom.resultMetrics.textContent = `${s.lesson.sentenceCount ? `${s.lesson.sentenceCount} ${s.lesson.sentenceCount < 5 ? 'vety' : 'viet'} · ` : ''}${s.accuracy} % presnosť · ${s.attempts} pokusov o znak · ${s.errors} chýb · ${(s.durationMs / 1000).toFixed(1)} s aktívneho času`;
  const summary = state.activeProfile?.courses[state.course.id]?.lessons[s.lesson.id];
  dom.resultProgress.textContent = summary
    ? `Táto lekcia: ${summary.completedAttempts} dokončených pokusov. Najlepšia presnosť: ${summary.bestResult.accuracy} %. ${storage.status().persistent ? 'Výsledok je uložený v tomto prehliadači.' : 'Výsledok zostáva v pamäti otvorenej stránky.'}`
    : 'Vytvor si profil pre zaznamenávanie ďalších výsledkov.';
}

function rememberLesson() {
  if (!state.course) return;
  state.activeProfile = profiles.selectLesson(state.course.id, state.typing.lesson.id);
}
/** @type {Map<string, import('./types').Lesson>} */
let lessonPreviews = new Map();
let previewDifficulty = 0;

/** Prepare the exact texts advertised in the lesson picker; choosing one reuses it. */
function prepareLessonPreviews() {
  if (!state.course || !state.keyboardLayout) return;
  const language = state.course.id;
  const layout = state.keyboardLayout;
  lessonPreviews = new Map(state.lessons.map(lesson => [lesson.id,
    prepareExercise(lesson, state.sentences, language, state.difficulty, layout,
      lesson.id === state.typing.lesson.id ? state.typing.lesson.textId : state.activeProfile?.courses[language]?.lessons[lesson.id]?.lastResult.textId)
  ]));
  previewDifficulty = state.difficulty;
}

function renderLessonOptions() {
  dom.lessonSelect.innerHTML = state.lessons.map(lesson => {
    const length = lesson.id === state.typing.lesson.id ? state.typing.exercise.length : lessonPreviews.get(lesson.id)?.targets.length ?? 0;
    return `<option value="${escapeHtml(lesson.id)}">${escapeHtml(lesson.name)} · ${characterCountLabel(length)}</option>`;
  }).join('');
  dom.lessonSelect.value = state.typing.lesson.id;
}

function startExercise(id = state.typing.lesson.id, fresh = false) {
  if (!state.course || !state.keyboardLayout) return;
  if (previewDifficulty !== state.difficulty) prepareLessonPreviews();
  const base = state.lessons.find(l => l.id === id) ?? state.lessons[0];
  const prepared = (!fresh && lessonPreviews.get(base.id)) || prepareExercise(base, state.sentences, state.course.id, state.difficulty, state.keyboardLayout, state.typing.lesson.textId ?? state.activeProfile?.courses[state.course.id]?.lessons[id]?.lastResult.textId);
  const exercise = { ...prepared, targets: targetsFromText(prepared.text, state.keyboardLayout.charMap) };
  lessonPreviews.set(base.id, exercise);
  state.typing = typing.setLessons([exercise], exercise.id);
  guidanceStep = 0;
  pressedCodes.clear();
  renderLessonOptions();
  rememberLesson();
}
let loadSequence = 0;
let loading = false;
async function loadActiveCourse(courseId, preferredLessonId) {
  const sequence = ++loadSequence;
  loading = true;
  renderResult();
  const resolved = state.courseCatalog.some(c => c.id === courseId) ? courseId : DEFAULT_LAYOUT_ID;
  const course = await loadCourse(resolved, state.courseCatalog);
  const [layout, response] = await Promise.all([loadKeyboardLayout(dom.keyboardLocale.value || 'sk-sk', /** @type {import('./types').KeyboardPlatform} */ (dom.keyboardPlatform.value || 'mac'), getKeyboardModel(dom.keyboardModel.value).variant), fetch(`content/sentences/${resolved}.json`)]);
  if (!response.ok) throw new Error(`Obsah viet nie je dostupný: ${response.status}`);
  const sentences = await response.json();
  if (sequence !== loadSequence) return;
  state.course = course;
  state.keyboardLayout = layout;
  state.sentences = sentences;
  state.lessons = [...prepareLessons(course, layout), { id: 'free-practice', name: 'Voľný tréning viet', phase: 'Vety bez obmedzenia klávesov', description: 'Pripravené vety podľa jazyka a náročnosti.', text: '', targets: [] }];
  prepareLessonPreviews();
  loading = false;
  const last = preferredLessonId ?? state.activeProfile?.courses[resolved]?.lastLessonId;
  startExercise(last ?? state.lessons[0].id);
  renderSettingsOptions();
  render();
}
async function loadActiveLayout() {
  const sequence = ++loadSequence;
  loading = true;
  renderResult();
  const layout = await loadKeyboardLayout(dom.keyboardLocale.value, /** @type {import('./types').KeyboardPlatform} */ (dom.keyboardPlatform.value), getKeyboardModel(dom.keyboardModel.value).variant);
  if (sequence !== loadSequence) return;
  state.keyboardLayout = layout;
  state.typing = typing.remapTargets(targetsFromText(state.typing.lesson.text, layout.charMap));
  guidanceStep = 0;
  pressedCodes.clear();
  loading = false;
  render();
}
async function restoreProfile() {
  state.activeProfile = profiles.getActiveProfile();
  if (state.activeProfile) setControlsFromProfile(state.activeProfile);
  else { state.difficulty = 1; state.guideEnabled = true; dom.keyboardModel.value = 'macbook-air'; dom.keyboardLocale.value = 'sk-sk'; dom.keyboardPlatform.value = 'mac'; }
  await loadActiveCourse(state.activeProfile?.languageLayout ?? DEFAULT_LAYOUT_ID);
}
function saveSettings() {
  state.activeProfile = profiles.updateActiveProfileSettings(activeSettings());
}
const focusTraining = () => dom.trainingInput.focus({ preventScroll: true });
function acceptText(text) {
  if (!text || !state.course || loading) return;
  state.typing = typing.handleText(text);
  guidanceStep = 0;
  const result = typing.claimResult(state.course.id);
  if (result) state.activeProfile = profiles.recordResult(result);
  render();
  if (result) dom.resultTitle.focus({ preventScroll: true });
}
let deleteAction = '';
function requestDeletion(action) {
  deleteAction = action;
  dom.deleteDescription.textContent = action === 'profile'
    ? `Vymazať profil ${state.activeProfile?.name} aj jeho nastavenia a výsledky? Tento krok sa nedá vrátiť.`
    : action === 'forget' ? 'Odstrániť zapamätaný záznam z prehliadača? Profily zostanú v pamäti do zatvorenia tejto stránky.'
    : 'Vymazať všetky profily, nastavenia a výsledky Strojopisu v tomto prehliadači? Tento krok sa nedá vrátiť.';
  dom.deleteDialog.showModal();
}
function onAsync(action) { action().catch(showLoadError); }
function showLoadError(error) {
  loading = false; renderResult();
  dom.feedbackLine.textContent = 'Obsah sa nepodarilo načítať. Skús znova vybrať kurz alebo obnov stránku spustenú cez lokálny server.';
  dom.feedbackLine.className = 'feedback-line is-error';
  dom.storageStatus.textContent = String(error.message);
}
function bindEvents() {
  dom.rememberButton.addEventListener('click', () => {
    if (storage.status().persistent) requestDeletion('forget');
    else {
      const previousId = state.activeProfile?.id;
      storage.enable();
      state.activeProfile = profiles.getActiveProfile();
      if (state.activeProfile?.id !== previousId) onAsync(restoreProfile);
      render();
    }
  });
  dom.deleteProfileButton.addEventListener('click', () => requestDeletion('profile'));
  dom.deleteAllButton.addEventListener('click', () => requestDeletion('all'));
  dom.cancelDeleteButton.addEventListener('click', () => dom.deleteDialog.close());
  dom.confirmDeleteButton.addEventListener('click', () => {
    dom.deleteDialog.close();
    if (deleteAction === 'forget') { storage.disable(); render(); }
    else if (deleteAction === 'profile') { profiles.deleteActiveProfile(); onAsync(restoreProfile); }
    else { storage.clear(); onAsync(restoreProfile); }
  });
  dom.profileForm.addEventListener('submit', event => {
    event.preventDefault();
    try {
      state.activeProfile = profiles.createProfile(dom.profileName.value, activeSettings());
      dom.profileName.value = ''; dom.profileMessage.textContent = '';
      onAsync(async () => { await restoreProfile(); focusTraining(); });
    } catch (error) { dom.profileMessage.textContent = error.message; dom.profileName.focus(); }
  });
  dom.profileSelect.addEventListener('change', () => {
    profiles.setActiveProfile(dom.profileSelect.value);
    onAsync(restoreProfile);
  });
  for (const control of [dom.keyboardModel, dom.keyboardLocale, dom.keyboardPlatform]) {
    control.addEventListener('change', () => { saveSettings(); onAsync(loadActiveLayout); });
  }
  dom.languageLayout.addEventListener('change', () => {
    const id = dom.languageLayout.value;
    saveSettings();
    onAsync(() => loadActiveCourse(id));
  });
  dom.lessonSelect.addEventListener('change', () => { startExercise(dom.lessonSelect.value); render(); });
  dom.difficulty.addEventListener('input', () => {
    state.difficulty = Number(dom.difficulty.value);
    renderDifficulty();
  });
  dom.difficulty.addEventListener('change', () => { state.difficulty = Number(dom.difficulty.value); saveSettings(); render(); });
  dom.guideToggle.addEventListener('click', event => {
    state.guideEnabled = !state.guideEnabled;
    saveSettings(); render();
    if (event.detail > 0) focusTraining();
  });
  const restart = event => { startExercise(state.typing.lesson.id, true); render(); if (event.detail > 0) focusTraining(); };
  dom.resetButton.addEventListener('click', restart);
  dom.repeatButton.addEventListener('click', restart);
  dom.nextButton.addEventListener('click', event => {
    const index = state.lessons.findIndex(l => l.id === state.typing.lesson.id);
    const nextId = state.lessons[Math.min(index + 1, state.lessons.length - 1)].id;
    startExercise(nextId, nextId === state.typing.lesson.id);
    render(); if (event.detail > 0) focusTraining();
  });
  new ResizeObserver(updateHands).observe(dom.keyboardWorkbench);
  dom.typingStrip.addEventListener('click', focusTraining);
  let composing = false, composedInput = '';
  dom.trainingInput.addEventListener('compositionstart', () => { composing = true; });
  dom.trainingInput.addEventListener('compositionend', event => {
    composing = false; composedInput = event.data.normalize('NFC');
    acceptText(composedInput); dom.trainingInput.value = '';
  });
  dom.trainingInput.addEventListener('input', event => {
    if (composing || event.isComposing) return;
    const text = (event.data ?? dom.trainingInput.value).normalize('NFC');
    if (composedInput && text === composedInput) { composedInput = ''; dom.trainingInput.value = ''; return; }
    composedInput = ''; acceptText(text); dom.trainingInput.value = '';
  });
  dom.trainingInput.addEventListener('paste', event => event.preventDefault());
  dom.trainingInput.addEventListener('keydown', event => { if (!composing && (event.key === 'Enter' || event.repeat)) event.preventDefault(); });
  window.addEventListener('keydown', event => {
    const active = document.activeElement;
    const tag = active?.tagName ?? '';
    if (dom.deleteDialog.open || (active !== dom.trainingInput && (['INPUT','SELECT','TEXTAREA','BUTTON','SUMMARY','A'].includes(tag) || active instanceof HTMLElement && active.isContentEditable))) return;
    if (loading || state.typing.isComplete) return;
    pressedCodes.add(event.code);
    const stroke = guidanceTarget().steps?.[0];
    if (stroke?.dead && event.code === stroke.code && getModifierCodes(guidanceTarget()).every(code => pressedCodes.has(code))) guidanceStep = Math.min(guidanceStep + 1, (state.typing.currentTarget.steps?.length ?? 1) - 1);
    renderFingerGuidance();
    renderKeyboard();
    if (composing || event.metaKey || event.isComposing || event.repeat || Array.from(event.key).length !== 1) return;
    const altGraph = event.getModifierState('AltGraph') || event.ctrlKey && event.altKey || event.altKey && event.key === state.typing.currentTarget.char && (state.typing.currentTarget.altGraph || state.typing.currentTarget.steps?.some(step => step.modifiers?.some(code => code.startsWith('Alt'))));
    if ((event.ctrlKey || event.altKey) && !altGraph) return;
    event.preventDefault(); composedInput = ''; acceptText(event.key);
  });
  window.addEventListener('keyup', event => { pressedCodes.delete(event.code); renderKeyboard(); });
  const pauseTraining = () => { typing.pause(); pressedCodes.clear(); guidanceStep = 0; composing = false; composedInput = ''; dom.trainingInput.value = ''; renderKeyboard(); };
  document.addEventListener('focusin', event => { if (event.target !== dom.trainingInput) pauseTraining(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pauseTraining(); });
  window.addEventListener('blur', pauseTraining);
  dom.trainingInput.addEventListener('blur', pauseTraining);
}
async function boot() {
  state.courseCatalog = await loadCourseCatalog();
  renderHandIllustrations(dom.handGuide);
  await restoreProfile();
  bindEvents();
  render();
}
boot().catch(showLoadError);
