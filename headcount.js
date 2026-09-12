// headcount.js — projection math (mirrors the workbook's "Capacity Check" sheet).

function projectHeadcount(volume, hours, rates, efficiency) {
  if (!volume || !hours) return null;
  const inductRatePerHead = rates.inductRate * rates.inductSpecMult * efficiency;
  const stowRatePerHead = rates.stowRate * rates.stowSpecMult * efficiency;

  const inductNeeded = Math.ceil(volume / (inductRatePerHead * hours));
  const stowNeeded = Math.ceil(volume / (stowRatePerHead * hours));

  const inductCapped = Math.min(inductNeeded, rates.inductMaxHeads);
  const stowCapped = Math.min(stowNeeded, rates.stowMaxHeads);
  const flagged = inductNeeded > rates.inductMaxHeads || stowNeeded > rates.stowMaxHeads;

  const achievable = Math.min(
    inductCapped * inductRatePerHead * hours,
    stowCapped * stowRatePerHead * hours
  );
  const shortfall = Math.max(0, volume - achievable);

  return {
    inductNeeded,
    stowNeeded,
    recommended: `${inductCapped + stowCapped}${flagged ? "+" : ""}`,
    achievable: Math.round(achievable),
    meets: achievable >= volume ? "Yes" : "No",
    shortfall: Math.round(shortfall),
  };
}

function buildProjectionRows(caps, rates) {
  const cycles = [
    { label: "Cycle B", hours: rates.cycleBHours },
    { label: "Cycle C", hours: rates.cycleCHours },
  ];
  const levels = [
    { label: "Soft cap", volume: caps.softCap },
    { label: "Hard cap", volume: caps.hardCap },
  ];

  const rows = [];
  cycles.forEach(({ label: cycleLabel, hours }) => {
    levels.forEach(({ label: levelLabel, volume }) => {
      if (!volume) return;
      const r = projectHeadcount(volume, hours, rates, rates.efficiencyContinuous);
      if (r) rows.push({ cycle: cycleLabel, level: levelLabel, volume, ...r });
    });
  });
  return rows;
}
