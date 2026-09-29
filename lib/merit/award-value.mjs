/** Coverage is a maximum for a program family, not a promise to every applicant. */
export function coverageFromValue(value) {
  // Permitted uses of a cash award do not establish coverage of those costs.
  // Likewise, a historical or explicitly unconfirmed award cannot set a badge.
  const v = value.toLowerCase().split(/(?<=[.!?;])\s+/).filter((sentence) =>
    !/\b(?:historical|not confirmed|not established|no longer offered|discontinued)\b/.test(sentence) &&
    !/\b(?:usable|used|use) (?:only )?for\b/.test(sentence) &&
    !/\$[\s\S]*?\b(?:for|towards?|usable for)\s+(?:undergraduate(?:\/graduate)?\s+)?tuition/.test(sentence)
  ).join(" ");
  if (/\b(?:not|no)\s+(?:a\s+)?full[- ](?:ride|cost|tuition)/.test(v)) return null;
  const variable = /\b(?:up to|ranges?|ranging|partial|half|depending|varies|vary)\b/.test(v);
  const prefix = variable ? "Up to " : "";
  if (/full[- ](?:estimated )?cost|full[- ]ride|comprehensive college costs/.test(v)) return prefix + (variable ? "full cost" : "Full cost");
  if (/tuition, (mandatory )?fees?,? (room|housing)|tuition,( on-campus)? housing|tuition, room|tuition and required fees.*housing|tuition and covered fees, (?:standard )?double-occupancy housing|tuition, fees, room|tuition, books, room/.test(v))
    return prefix + (variable ? "tuition + housing" : "Tuition + housing");
  if (/full[- ](?:undergraduate |four[- ]year )?tuition|value of tuition|four years of tuition|100% of (?:annual )?tuition/.test(v)) return prefix + (variable ? "full tuition" : "Full tuition");
  return null;
}

/** Do not turn an aggregate prize pool into one applicant's award amount. */
export function maxDollarsFromValue(value) {
  if (/\b(?:pool|pooled|aggregate|combined prizes)\b/i.test(value)) return 0;
  const amounts = [...value.matchAll(/\$\s?([\d,]+(?:\.\d+)?)\s*(k|million)?/gi)].map((m) => {
    const n = parseFloat(m[1].replace(/,/g, ""));
    const unit = (m[2] || "").toLowerCase();
    const before = value.slice(0, m.index);
    const after = value.slice(m.index + m[0].length);
    const isFloor = /\b(?:minimum(?: (?:annual|award|amount|of)){0,4}|at least|more than|starting at|starts at)\s*$/i.test(before) || /^\s*(?:minimum\b|\+)/i.test(after);
    return { amount: unit === "k" ? n * 1_000 : unit === "million" ? n * 1_000_000 : n, isFloor };
  });
  const maximum = amounts.length ? Math.max(...amounts.map(({ amount }) => amount)) : 0;
  // A listed minimum plus a smaller stipend does not establish an upper bound.
  if (amounts.some(({ amount, isFloor }) => isFloor && amount === maximum)) return 0;
  return maximum;
}
