import type { Criterion } from "./types";

const GEN_DECIMALS = 18;

export function parseGen(value: string): bigint | null {
  const normalized = value.trim();
  if (!/^(?:0|[1-9][0-9]*)(?:\.[0-9]{1,18})?$/.test(normalized)) return null;
  const [whole, fraction = ""] = normalized.split(".");
  const wei = BigInt(whole) * 10n ** BigInt(GEN_DECIMALS) + BigInt(fraction.padEnd(GEN_DECIMALS, "0") || "0");
  return wei > 0n ? wei : null;
}

export function nextCriterionId(criteria: Criterion[]) {
  const highest = criteria.reduce((maximum, criterion) => {
    const match = /^criterion-([1-9][0-9]*)$/.exec(criterion.id);
    return match ? Math.max(maximum, Number(match[1])) : maximum;
  }, 0);
  return `criterion-${highest + 1}`;
}
