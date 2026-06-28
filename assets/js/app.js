(function () {
  const sampleText = ["a", "s", "d", "f", "j", "k", "l", ";", "a", "f", "j", "l", "s", "d", "k", ";"];

  const keyboardNames = {
    "macbook-air": "MacBook Air",
    "dell-xps-2018": "Dell XPS 2018"
  };

  const languageNames = {
    sk: "Slovencina",
    cs: "Cestina",
    "en-us": "US English",
    "en-gb": "British English",
    es: "Spanielcina"
  };

  const keyboardRows = [
    ["Esc", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],
    ["Tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]"],
    ["Caps", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'"],
    ["Shift", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "Shift"],
    ["Fn", "Ctrl", "Opt", "Cmd", "Space", "Cmd", "Opt"]
  ];

  const dom = {
    profileForm: document.querySelector("#profileForm"),
    profileName: document.querySelector("#profileName"),
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
    profile: null,
    currentIndex: 0,
    cookiesEnabled: false
  };

  function cookiesAvailable() {
    if (!window.Cookies) {
      return false;
    }

    const testKey = "strojopis_cookie_test";
    Cookies.set(testKey, "1", { sameSite: "strict" });
    const ok = Cookies.get(testKey) === "1";
    Cookies.remove(testKey);
    return ok;
  }

  function loadProfile() {
    if (!state.cookiesEnabled) {
      return null;
    }

    const rawProfile = Cookies.get("strojopis_active_profile");
    if (!rawProfile) {
      return null;
    }

    try {
      return JSON.parse(rawProfile);
    } catch (error) {
      return null;
    }
  }

  function saveProfile(profile) {
    state.profile = profile;

    if (state.cookiesEnabled) {
      Cookies.set("strojopis_active_profile", JSON.stringify(profile), {
        expires: 365,
        sameSite: "strict"
      });
    }

    render();
  }

  function buildProfile(name) {
    return {
      id: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") || "profil",
      name: name.trim(),
      keyboardModel: dom.keyboardModel.value,
      languageLayout: dom.languageLayout.value,
      updatedAt: new Date().toISOString()
    };
  }

  function updateCurrentProfileSettings() {
    if (!state.profile) {
      render();
      return;
    }

    saveProfile({
      ...state.profile,
      keyboardModel: dom.keyboardModel.value,
      languageLayout: dom.languageLayout.value,
      updatedAt: new Date().toISOString()
    });
  }

  function renderTypingStrip() {
    dom.typingStrip.innerHTML = sampleText
      .map((char, index) => {
        const className = index === state.currentIndex ? "typing-token is-current" : "typing-token";
        return `<span class="${className}">${char}</span>`;
      })
      .join("");
  }

  function renderKeyboard() {
    dom.keyboardPreview.innerHTML = keyboardRows
      .map((row) => {
        const keys = row
          .map((label) => {
            const classes = ["key"];
            if (["Tab", "Caps", "Shift", "Ctrl", "Opt", "Cmd"].includes(label)) {
              classes.push("is-wide");
            }
            if (label === "Space") {
              classes.push("is-space");
            }
            if (label.toLowerCase() === sampleText[state.currentIndex]) {
              classes.push("is-active");
            }
            return `<span class="${classes.join(" ")}">${label}</span>`;
          })
          .join("");

        return `<div class="keyboard-row">${keys}</div>`;
      })
      .join("");
  }

  function renderStorageStatus() {
    if (state.cookiesEnabled) {
      dom.storageStatus.textContent = "Cookies su povolene. Profil sa ulozi do prehliadaca.";
      dom.storageStatus.className = "helper-text is-ok";
      return;
    }

    dom.storageStatus.textContent = "Cookies nie su dostupne. Profil bude fungovat iba do obnovy stranky.";
    dom.storageStatus.className = "helper-text is-warning";
  }

  function renderStats() {
    const profileName = state.profile ? state.profile.name : "-";
    dom.activeProfileChip.textContent = state.profile ? state.profile.name : "Bez profilu";
    dom.statProfile.textContent = profileName;
    dom.statKeyboard.textContent = keyboardNames[dom.keyboardModel.value];
    dom.statLanguage.textContent = languageNames[dom.languageLayout.value];
  }

  function render() {
    renderStorageStatus();
    renderStats();
    renderTypingStrip();
    renderKeyboard();
  }

  function bindEvents() {
    dom.profileForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = dom.profileName.value.trim();
      if (!name) {
        dom.profileName.focus();
        return;
      }

      saveProfile(buildProfile(name));
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
    state.cookiesEnabled = cookiesAvailable();
    state.profile = loadProfile();

    if (state.profile) {
      dom.profileName.value = state.profile.name;
      dom.keyboardModel.value = state.profile.keyboardModel || "macbook-air";
      dom.languageLayout.value = state.profile.languageLayout || "sk";
    }

    bindEvents();
    render();
  }

  boot();
})();
