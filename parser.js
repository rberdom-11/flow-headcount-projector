// parser.js — parses a raw copy/paste dump from the caps dashboard, e.g.:
//
// 10 Sep 2026 18:30:00 BST
// Package count
// Soft cap
// 195
// 1
// 23
// 106
// 130
//
// 10 Sep 2026 18:30:00 BST
// Package count
// Monitor
//
// 1
// 23
// 106
// 130
//
// 10 Sep 2026 18:30:00 BST
// Package count
// Hard cap
// 292
// 1
// 23
// 106
// 130
//
// Each block = one timestamped row. "Monitor" rows carry no cap value (blank line
// after the label) — those are skipped for projection but shown for reference.

const TIMESTAMP_RE = /^\d{1,2} \w{3} \d{4} \d{2}:\d{2}:\d{2}/;
const NUMBER_RE = /^-?\d+(\.\d+)?$/;

function parseCapDump(text) {
  const lines = text.split("\n").map((l) => l.trim());
  const blocks = [];
  let current = [];
  lines.forEach((l) => {
    if (TIMESTAMP_RE.test(l)) {
      if (current.length) blocks.push(current);
      current = [l];
    } else {
      current.push(l);
    }
  });
  if (current.length) blocks.push(current);

  return blocks
    .filter((b) => b.length > 1)
    .map((block) => {
      const timestamp = block[0];
      let rest = block.slice(1);
      let idx = 0;
      if (rest[idx] === "Package count") idx += 1;
      const label = rest[idx] || null;
      idx += 1;
      const hasNoValue = rest[idx] === "";
      if (hasNoValue) idx += 1;
      const numsStr = rest.slice(idx).filter((l) => l !== "");
      const nums = numsStr.filter((l) => NUMBER_RE.test(l)).map(Number);
      const value = hasNoValue ? null : nums[0] ?? null;
      const breakdown = hasNoValue ? nums : nums.slice(1);
      return { timestamp, label, value, breakdown };
    });
}

// Convenience: pull out soft cap / hard cap values specifically, plus the latest
// breakdown seen (e.g. per-lane or per-zone package counts) for display.
function extractCapsFromParsed(parsed) {
  const find = (labelMatch) =>
    parsed.find((r) => r.label && r.label.toLowerCase().includes(labelMatch));
  const soft = find("soft cap");
  const hard = find("hard cap");
  const monitor = find("monitor");
  return {
    softCap: soft ? soft.value : null,
    hardCap: hard ? hard.value : null,
    timestamp: (soft || hard || monitor || {}).timestamp || null,
    breakdown: (soft || hard || monitor || {}).breakdown || [],
  };
}
