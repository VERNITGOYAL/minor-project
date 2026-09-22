const SETTINGS_KEY = "researchai-settings";

const DEFAULT_SETTINGS = {
  notifications: true,
  citations: true,
  compact: false,
};

function getStoredSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
  } catch {
    return {};
  }
}

export function getSettings() {
  return {
    ...DEFAULT_SETTINGS,
    ...getStoredSettings(),
  };
}

export function saveSettings(settings) {
  const updatedSettings = {
    ...DEFAULT_SETTINGS,
    ...settings,
  };

  localStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify(updatedSettings)
  );

  return updatedSettings;
}

export function resetSettings() {
  localStorage.removeItem(SETTINGS_KEY);

  return {
    ...DEFAULT_SETTINGS,
  };
}