export const DEFAULT_LAYOUT_ID = "en-gb";

const LAYOUT_BASE_URL = "content/keyboard-layouts";

/** @returns {Promise<import('./types').KeyboardLayout>} */
export async function loadKeyboardLayout(id = DEFAULT_LAYOUT_ID) {
  const response = await fetch(`${LAYOUT_BASE_URL}/${id}.json`, { cache: "no-cache" });

  if (!response.ok) {
    throw new Error(`Cannot load keyboard layout ${id}: ${response.status}`);
  }

  return response.json();
}
