export function shortAddress(value?: string | null) {
  if (!value) return "—";
  return `${value.slice(0, 7)}…${value.slice(-5)}`;
}

export function formatDate(value?: number) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(value * 1000);
}

export function formatGen(value: number | string | bigint) {
  const amount = typeof value === "bigint" ? value : BigInt(value || 0);
  const whole = amount / 10n ** 18n;
  const fraction = (amount % 10n ** 18n).toString().padStart(18, "0").slice(0, 4).replace(/0+$/, "");
  return `${whole}${fraction ? `.${fraction}` : ""} GEN`;
}

export function stateSentence(state: string) {
  const labels: Record<string, string> = {
    OFFERED: "Waiting for the worker to accept",
    ACTIVE: "Work is underway",
    SUBMITTED: "Evidence is ready for independent review",
    PAYABLE: "Work satisfied the agreement; release is available",
    CURE_REQUIRED: "The work needs a bounded correction",
    EVIDENCE_REPAIR: "The evidence could not be verified",
    RELEASED: "Escrow was released to the worker",
    REFUNDED: "Escrow was refunded to the client",
    DECLINED: "The worker declined the offer",
    CANCELLED: "The parties cancelled this commitment",
  };
  return labels[state] ?? state;
}

