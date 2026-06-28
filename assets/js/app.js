import { createStorage } from "./storage.js";
import { createProfileManager } from "./profiles.js";
import { KEYBOARD_MODELS, getKeyboardModel } from "./keyboard-models.js";
import { getKeyboardLayout, US_LAYOUT_ID } from "./keyboard-layouts.js";
import { createTypingEngine } from "./typing-engine.js";
import { getHomeFingerForCode, updateHandGuide } from "./hand-guide.js";

const storage = createStorage();
const profiles = createProfileManager(storage);
const typing = createTypingEngine();

const dom = {
  profileForm: document.querySelector("#profileForm"),
  profileName: document.querySelector("#profileName"),
  profileSelect: document.querySelector("#profileSelect"),
  activeProfileChip: document.querySelector("#activeProfileChip span"),
  storageStatus: document.querySelector("#storageStatus"),
  keyboardModel: document.querySelector("#keyboardModel"),
  typingStrip: document.querySelector("#typingStrip"),
  feedbackLine: document.querySelector("#feedbackLine"),
  keyboardWorkbench: document.querySelector(".keyboard-workbench"),
  keyboardPreview: document.querySelector("#keyboardPreview"),
  statProfile: document.querySelector("#statProfile"),
  statKeyboard: document.querySelector("#statKeyboard"),
  statLanguage: document.querySelector("#statLanguage"),
  statAccuracy: document.querySelector("#statAccuracy"),
  statErrors: document.querySelector("#statErrors"),
  resetButton: document.querySelector("#resetButton")
};

const state = {
  activeProfile: profiles.getActiveProfile(),
  typing: typing.snapshot()
};

function activeSettings() {
  return {
    keyboardModel: dom.keyboardModel.value,
    languageLayout: US_LAYOUT_ID
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

  dom.keyboardModel.value = profile.keyboardModel || "macbook-air";
}

function syncActiveProfile() {
  state.activeProfile = profiles.getActiveProfile();
  setControlsFromProfile(state.activeProfile);
}

function renderProfileSelect() {
  const items = profiles.listProfiles();

  if (!items.length) {
    dom.profileSelect.innerHTML = '<option value="">Ziadny profil</option>';
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

function renderTypingStrip() {
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
      return `<span class="${classes.join(" ")}">${escapeHtml(target.char)}</span>`;
    })
    .join("");
}

function keyClasses(code) {
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

  const homeFinger = getHomeFingerForCode(code);
  if (homeFinger) {
    classes.push(`home-${homeFinger}`);
  }

  if (code === state.typing.currentTarget.code) {
    classes.push("is-active");
  }

  return classes.join(" ");
}

function renderKeyboard() {
  const model = getKeyboardModel(dom.keyboardModel.value);
  const layout = getKeyboardLayout();

  dom.keyboardPreview.innerHTML = model.rows
    .map((row) => {
      const keys = row
        .map((code) => {
          const label = layout.labels[code] || code;
          return `<span class="${keyClasses(code)}" data-code="${escapeHtml(code)}">${escapeHtml(label)}</span>`;
        })
        .join("");

      return `<div class="keyboard-row">${keys}</div>`;
    })
    .join("");

  updateHandGuide(dom.keyboardWorkbench, state.typing.currentTarget.code);
}

function renderStorageStatus() {
  if (storage.cookiesEnabled) {
    dom.storageStatus.textContent = "Cookies su povolene. Profily a nastavenia sa ukladaju do prehliadaca.";
    dom.storageStatus.className = "helper-text is-ok";
    return;
  }

  dom.storageStatus.textContent = "Cookies nie su dostupne. Profily funguju iba do obnovy stranky.";
  dom.storageStatus.className = "helper-text is-warning";
}

function renderStats() {
  const profileName = state.activeProfile ? state.activeProfile.name : "-";
  const keyboard = getKeyboardModel(dom.keyboardModel.value);
  const layout = getKeyboardLayout();

  dom.activeProfileChip.textContent = state.activeProfile ? state.activeProfile.name : "Bez profilu";
  dom.statProfile.textContent = profileName;
  dom.statKeyboard.textContent = keyboard.name;
  dom.statLanguage.textContent = layout.name;
  dom.statAccuracy.textContent = `${state.typing.accuracy}%`;
  dom.statErrors.textContent = String(state.typing.errors);
}

function renderFeedback() {
  if (!state.typing.lastError) {
    dom.feedbackLine.textContent = "Stlac aktualny znak.";
    dom.feedbackLine.className = "feedback-line";
    return;
  }

  dom.feedbackLine.textContent = `Ocakavane: ${state.typing.lastError.expected}, zadane: ${state.typing.lastError.typed}`;
  dom.feedbackLine.className = "feedback-line is-error";
}

function renderSettingsOptions() {
  dom.keyboardModel.innerHTML = Object.values(KEYBOARD_MODELS)
    .map((model) => `<option value="${escapeHtml(model.id)}">${escapeHtml(model.name)}</option>`)
    .join("");

  setControlsFromProfile(state.activeProfile);
}

function render() {
  renderStorageStatus();
  renderProfileSelect();
  renderStats();
  renderFeedback();
  renderTypingStrip();
  renderKeyboard();
}

function createProfileFromForm() {
  const name = dom.profileName.value.trim();
  if (!name) {
    dom.profileName.focus();
    return;
  }

  state.activeProfile = profiles.createProfile(name, activeSettings());
  dom.profileName.value = "";
  setControlsFromProfile(state.activeProfile);
  render();
}

function updateCurrentProfileSettings() {
  const updated = profiles.updateActiveProfileSettings(activeSettings());
  if (updated) {
    state.activeProfile = updated;
  }

  render();
}

function bindEvents() {
  dom.profileForm.addEventListener("submit", (event) => {
    event.preventDefault();
    createProfileFromForm();
  });

  dom.profileSelect.addEventListener("change", () => {
    if (!dom.profileSelect.value) {
      return;
    }

    state.activeProfile = profiles.setActiveProfile(dom.profileSelect.value);
    setControlsFromProfile(state.activeProfile);
    state.typing = typing.reset();
    render();
  });

  dom.keyboardModel.addEventListener("change", updateCurrentProfileSettings);

  dom.resetButton.addEventListener("click", () => {
    state.typing = typing.reset();
    render();
  });

  window.addEventListener("keydown", (event) => {
    const activeTag = document.activeElement ? document.activeElement.tagName : "";
    if (["INPUT", "SELECT", "TEXTAREA"].includes(activeTag)) {
      return;
    }

    const nextState = typing.handleKeydown(event);
    state.typing = nextState;
    render();
  });
}

function boot() {
  syncActiveProfile();
  renderSettingsOptions();
  bindEvents();
  render();
}

boot();
