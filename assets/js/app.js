import { createStorage } from "./storage.js";
import { createProfileManager } from "./profiles.js";
import { KEYBOARD_MODELS, getKeyboardModel } from "./keyboard-models.js";
import { KEYBOARD_LAYOUTS, getKeyboardLayout } from "./keyboard-layouts.js";

const sampleText = ["a", "s", "d", "f", "j", "k", "l", ";", "a", "f", "j", "l", "s", "d", "k", ";"];

const storage = createStorage();
const profiles = createProfileManager(storage);

const dom = {
  profileForm: document.querySelector("#profileForm"),
  profileName: document.querySelector("#profileName"),
  profileSelect: document.querySelector("#profileSelect"),
  activeProfileChip: document.querySelector("#activeProfileChip span"),
  storageStatus: document.querySelector("#storageStatus"),
  keyboardModel: document.querySelector("#keyboardModel"),
  languageLayout: document.querySelector("#languageLayout"),
  typingStrip: document.querySelector("#typingStrip"),
  keyboardPreview: document.querySelector("#keyboardPreview"),
  statProfile: document.querySelector("#statProfile"),
  statKeyboard: document.querySelector("#statKeyboard"),
  statLanguage: document.querySelector("#statLanguage"),
  resetButton: document.querySelector("#resetButton")
};

const state = {
  activeProfile: profiles.getActiveProfile(),
  currentIndex: 0
};

function activeSettings() {
  return {
    keyboardModel: dom.keyboardModel.value,
    languageLayout: dom.languageLayout.value
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
  dom.languageLayout.value = profile.languageLayout || "sk";
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
  dom.typingStrip.innerHTML = sampleText
    .map((char, index) => {
      const className = index === state.currentIndex ? "typing-token is-current" : "typing-token";
      return `<span class="${className}">${escapeHtml(char)}</span>`;
    })
    .join("");
}

function keyClasses(code, label) {
  const classes = ["key"];

  if (["Tab", "CapsLock", "ShiftLeft", "ShiftRight", "ControlLeft", "ControlRight", "AltLeft", "AltRight", "MetaLeft", "MetaRight", "Backspace", "Enter"].includes(code)) {
    classes.push("is-wide");
  }

  if (code === "Space") {
    classes.push("is-space");
  }

  if (label.toLowerCase() === sampleText[state.currentIndex]) {
    classes.push("is-active");
  }

  return classes.join(" ");
}

function renderKeyboard() {
  const model = getKeyboardModel(dom.keyboardModel.value);
  const layout = getKeyboardLayout(dom.languageLayout.value);

  dom.keyboardPreview.innerHTML = model.rows
    .map((row) => {
      const keys = row
        .map((code) => {
          const label = layout.labels[code] || code;
          return `<span class="${keyClasses(code, label)}">${escapeHtml(label)}</span>`;
        })
        .join("");

      return `<div class="keyboard-row">${keys}</div>`;
    })
    .join("");
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
  const layout = getKeyboardLayout(dom.languageLayout.value);

  dom.activeProfileChip.textContent = state.activeProfile ? state.activeProfile.name : "Bez profilu";
  dom.statProfile.textContent = profileName;
  dom.statKeyboard.textContent = keyboard.name;
  dom.statLanguage.textContent = layout.name;
}

function renderSettingsOptions() {
  dom.keyboardModel.innerHTML = Object.values(KEYBOARD_MODELS)
    .map((model) => `<option value="${escapeHtml(model.id)}">${escapeHtml(model.name)}</option>`)
    .join("");

  dom.languageLayout.innerHTML = Object.values(KEYBOARD_LAYOUTS)
    .map((layout) => `<option value="${escapeHtml(layout.id)}">${escapeHtml(layout.name)}</option>`)
    .join("");

  setControlsFromProfile(state.activeProfile);
}

function render() {
  renderStorageStatus();
  renderProfileSelect();
  renderStats();
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
    state.currentIndex = 0;
    render();
  });

  dom.keyboardModel.addEventListener("change", updateCurrentProfileSettings);
  dom.languageLayout.addEventListener("change", updateCurrentProfileSettings);

  dom.resetButton.addEventListener("click", () => {
    state.currentIndex = 0;
    render();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key.length !== 1) {
      return;
    }

    if (event.key === sampleText[state.currentIndex]) {
      state.currentIndex = (state.currentIndex + 1) % sampleText.length;
      render();
    }
  });
}

function boot() {
  syncActiveProfile();
  renderSettingsOptions();
  bindEvents();
  render();
}

boot();
