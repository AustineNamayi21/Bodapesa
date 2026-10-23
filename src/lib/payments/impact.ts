/**
 * What a gift makes possible, shown beside the donation form.
 *
 * EDIT THESE to match your real costs before going live. The defaults are
 * derived from the platform's own SMS cost estimate (about KSh 0.80 per
 * 160-character message, see providers.ts) and are illustrative, not audited.
 * Donors trust specific, honest numbers — keep them true.
 */
export const IMPACT_TIERS: { amountKes: number; text: string }[] = [
  { amountKes: 200, text: "pays for roughly 250 lesson SMS reaching riders on any phone" },
  { amountKes: 500, text: "keeps a stage of riders learning over SMS for weeks" },
  { amountKes: 1000, text: "funds a full month of lessons for a rider group" },
  { amountKes: 2500, text: "helps us reach a whole new stage with the 12-lesson curriculum" },
];
