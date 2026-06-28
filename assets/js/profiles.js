const INDEX_KEY = "strojopis_profiles_index";
const ACTIVE_KEY = "strojopis_active_profile_id";
const LEGACY_ACTIVE_PROFILE_KEY = "strojopis_active_profile";

const DEFAULT_PROFILE_SETTINGS = {
  keyboardModel: "macbook-air",
  languageLayout: "sk"
};

function profileKey(id) {
  return `strojopis_profile_${id}`;
}

function slugify(value) {
  const cleaned = value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return cleaned || "profil";
}

function readIndex(storage) {
  const index = storage.readJSON(INDEX_KEY, []);
  return Array.isArray(index) ? index : [];
}

function writeIndex(storage, ids) {
  storage.writeJSON(INDEX_KEY, Array.from(new Set(ids)));
}

function makeUniqueId(storage, baseId) {
  const ids = readIndex(storage);
  if (!ids.includes(baseId)) {
    return baseId;
  }

  let counter = 2;
  let candidate = `${baseId}-${counter}`;

  while (ids.includes(candidate)) {
    counter += 1;
    candidate = `${baseId}-${counter}`;
  }

  return candidate;
}

function now() {
  return new Date().toISOString();
}

function migrateLegacyProfile(storage) {
  const legacy = storage.readJSON(LEGACY_ACTIVE_PROFILE_KEY, null);
  if (!legacy || !legacy.name) {
    return;
  }

  const id = makeUniqueId(storage, slugify(legacy.name));
  const profile = {
    id,
    name: legacy.name,
    keyboardModel: legacy.keyboardModel || DEFAULT_PROFILE_SETTINGS.keyboardModel,
    languageLayout: legacy.languageLayout || DEFAULT_PROFILE_SETTINGS.languageLayout,
    createdAt: legacy.updatedAt || now(),
    updatedAt: now()
  };

  const ids = readIndex(storage);
  writeIndex(storage, ids.concat(profile.id));
  storage.writeJSON(profileKey(profile.id), profile);
  storage.writeJSON(ACTIVE_KEY, profile.id);
  storage.remove(LEGACY_ACTIVE_PROFILE_KEY);
}

export function createProfileManager(storage) {
  migrateLegacyProfile(storage);

  function listProfiles() {
    return readIndex(storage)
      .map((id) => storage.readJSON(profileKey(id), null))
      .filter(Boolean);
  }

  function getActiveProfileId() {
    return storage.readJSON(ACTIVE_KEY, null);
  }

  function getActiveProfile() {
    const id = getActiveProfileId();
    if (!id) {
      return null;
    }

    return storage.readJSON(profileKey(id), null);
  }

  function setActiveProfile(id) {
    storage.writeJSON(ACTIVE_KEY, id);
    return getActiveProfile();
  }

  function createProfile(name, settings = {}) {
    const profileName = name.trim();
    const id = makeUniqueId(storage, slugify(profileName));
    const timestamp = now();
    const profile = {
      id,
      name: profileName,
      ...DEFAULT_PROFILE_SETTINGS,
      ...settings,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    const ids = readIndex(storage);
    writeIndex(storage, ids.concat(profile.id));
    storage.writeJSON(profileKey(profile.id), profile);
    storage.writeJSON(ACTIVE_KEY, profile.id);
    return profile;
  }

  function updateActiveProfileSettings(settings) {
    const profile = getActiveProfile();
    if (!profile) {
      return null;
    }

    const updated = {
      ...profile,
      ...settings,
      updatedAt: now()
    };

    storage.writeJSON(profileKey(updated.id), updated);
    return updated;
  }

  return {
    listProfiles,
    getActiveProfile,
    setActiveProfile,
    createProfile,
    updateActiveProfileSettings
  };
}
