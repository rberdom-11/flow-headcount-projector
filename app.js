// app.js — fluid manual-entry wiring: live updates on every keystroke, no button needed.

let rates = loadRates();

const softCapInput = document.getElementById("softCap");
const hardCapInput = document.getElementById("hardCap");
const cycleBInput = document.getElementById("cycleBHours");
const cycleCInput = document.getElementById("cycleCHours");
const resultsTableBody = document.querySelector("#resultsTable tbody");
const settingsGrid = document.getElementById("settingsGrid");
const resetBtn = document.getElementById("resetBtn");

// Pre-fill cycle hours from rates
cycleBInput.value = rates.cycleBHours;
cycleCInput.value = rates.cycleCHours;

function recompute() {
  rates.cycleBHours = Number(cycleBInput.value) || window.DEFAULT_RATES.cycleBHours;
  rates.cycleCHours = Number(cycleCInput.value) || window.DEFAULT_RATES.cycleCHours;
  saveRates(rates);

  const caps = {
    softCap: Number(softCapInput.value) || 0,
    hardCap: Number(hardCapInput.value) || 0,
  };
  const rows = buildProjectionRows(caps, rates);
  resultsTableBody.innerHTML = "";
  if (rows.length === 0) {
    resultsTableBody.innerHTML = '<tr><td colspan="9" style="color:#999;">Enter a soft or hard cap above to see the projection.</td></tr>';
    return;
  }
  rows.forEach((r) => {
    const tr = document.createElement("tr");
    tr.className = r.meets === "Yes" ? "meet" : "no-meet";
    tr.innerHTML = `
      <td>${r.cycle}</td><td>${r.level}</td><td>${r.volume}</td>
      <td>${r.inductNeeded}</td><td>${r.stowNeeded}</td>
      <td>${r.recommended}</td><td>${r.achievable}</td>
      <td>${r.meets}</td><td>${r.shortfall}</td>`;
    resultsTableBody.appendChild(tr);
  });
}

// Live updates on every keystroke — no submit button, no debounce needed at this scale.
[softCapInput, hardCapInput, cycleBInput, cycleCInput].forEach((el) =>
  el.addEventListener("input", recompute)
);

// Enter key moves focus forward for fast keyboard-only entry
[softCapInput, hardCapInput].forEach((el, i, arr) => {
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const next = arr[i + 1] || cycleBInput;
      next.focus();
      next.select?.();
    }
  });
});

function renderSettings() {
  settingsGrid.innerHTML = "";
  Object.entries(rates).forEach(([key, val]) => {
    if (key === "cycleBHours" || key === "cycleCHours") return; // already in quick-entry
    const label = document.createElement("label");
    label.textContent = key;
    const input = document.createElement("input");
    input.type = "number";
    input.step = "any";
    input.value = val;
    input.addEventListener("input", () => {
      rates[key] = Number(input.value);
      saveRates(rates);
      recompute();
    });
    label.appendChild(input);
    settingsGrid.appendChild(label);
  });
}

resetBtn.addEventListener("click", () => {
  rates = { ...window.DEFAULT_RATES };
  saveRates(rates);
  cycleBInput.value = rates.cycleBHours;
  cycleCInput.value = rates.cycleCHours;
  renderSettings();
  recompute();
});

renderSettings();
recompute();


// --- Paste-and-parse dashboard dump ---
const pasteBox = document.getElementById("pasteBox");
const parseStatus = document.getElementById("parseStatus");

let pasteDebounce;
pasteBox.addEventListener("input", () => {
  clearTimeout(pasteDebounce);
  pasteDebounce = setTimeout(() => {
    const text = pasteBox.value.trim();
    if (!text) {
      parseStatus.textContent = "";
      parseStatus.className = "hint";
      return;
    }
    try {
      const parsed = parseCapDump(text);
      const caps = extractCapsFromParsed(parsed);
      if (caps.softCap == null && caps.hardCap == null) {
        parseStatus.textContent = "Couldn't find Soft cap / Hard cap labels in the pasted text — check the format, or enter values manually below.";
        parseStatus.className = "hint err";
        return;
      }
      if (caps.softCap != null) softCapInput.value = caps.softCap;
      if (caps.hardCap != null) hardCapInput.value = caps.hardCap;
      const parts = [];
      if (caps.timestamp) parts.push(`as of ${caps.timestamp}`);
      if (caps.softCap != null) parts.push(`Soft cap ${caps.softCap}`);
      if (caps.hardCap != null) parts.push(`Hard cap ${caps.hardCap}`);
      if (caps.breakdown.length) parts.push(`breakdown [${caps.breakdown.join(", ")}]`);
      parseStatus.textContent = "Parsed: " + parts.join(" · ");
      parseStatus.className = "hint ok";
      recompute();
    } catch (e) {
      parseStatus.textContent = "Parse error: " + e.message;
      parseStatus.className = "hint err";
    }
  }, 150);
});
