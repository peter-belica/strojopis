const MEMORY_STORE = new Map();

function hasCookieApi() {
  return Boolean(window.Cookies);
}

function detectCookies() {
  if (!hasCookieApi()) {
    return false;
  }

  const key = "strojopis_cookie_test";
  Cookies.set(key, "1", { sameSite: "strict" });
  const enabled = Cookies.get(key) === "1";
  Cookies.remove(key);
  return enabled;
}

export function createStorage() {
  const cookiesEnabled = detectCookies();

  function readRaw(key) {
    if (cookiesEnabled) {
      return Cookies.get(key) || null;
    }

    return MEMORY_STORE.has(key) ? MEMORY_STORE.get(key) : null;
  }

  function writeRaw(key, value) {
    if (cookiesEnabled) {
      Cookies.set(key, value, {
        expires: 365,
        sameSite: "strict"
      });
      return;
    }

    MEMORY_STORE.set(key, value);
  }

  function readJSON(key, fallback) {
    const raw = readRaw(key);
    if (!raw) {
      return fallback;
    }

    try {
      return JSON.parse(raw);
    } catch (error) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    writeRaw(key, JSON.stringify(value));
  }

  function remove(key) {
    if (cookiesEnabled) {
      Cookies.remove(key);
      return;
    }

    MEMORY_STORE.delete(key);
  }

  return {
    cookiesEnabled,
    readJSON,
    writeJSON,
    remove
  };
}
