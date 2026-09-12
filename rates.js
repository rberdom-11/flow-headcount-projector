// rates.js — defaults mirroring the headcount workbook's "Rates & Settings" sheet.
// These are only the DEFAULTS; the app loads any saved overrides from localStorage on top.

window.DEFAULT_RATES = {
  inductRate: 131,
  stowRate: 117,
  inductSpecMult: 2,
  stowSpecMult: 1.2,
  efficiencyContinuous: 0.875,
  efficiencyStarved: 0.7,
  inductMaxHeads: 2,
  stowMaxHeads: 2,
  cycleBHours: 2,
  cycleCHours: 3,
};

const STORAGE_KEY = "flowHeadcountRates";

function loadRates() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return { ...window.DEFAULT_RATES, ...(saved || {}) };
  } catch {
    return { ...window.DEFAULT_RATES };
  }
}

function saveRates(rates) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rates));
}
