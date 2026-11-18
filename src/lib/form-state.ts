/**
 * Shared shape for what a server action hands back to its form.
 *
 * This lives outside the "use server" modules on purpose: a file marked
 * "use server" may only export async functions, so the plain helper below
 * would be rejected there.
 *
 * `values` echoes what was submitted. React resets an uncontrolled form once
 * its action resolves, which would otherwise wipe everything the user typed
 * the moment a single field fails validation — a rider who forgets the
 * consent box would have to retype their whole registration. Returning the
 * submission lets the form re-seed its defaults, so React's reset lands on
 * the user's own input instead of on blank fields.
 */
export interface FormResult {
  error?: string;
  ok?: string;
  /** The field the error belongs to, so a multi-step form can jump to it. */
  field?: string;
  values?: Record<string, string>;
}

export type FormState = null | FormResult;

/** Flattens a submission into plain strings so it can cross back to the client. */
export function echo(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value !== "string") continue;
    // Repeated keys (multi-selects, channel checkbox groups) collapse to a
    // comma-joined list; the form components split them again on the way in.
    out[key] = key in out ? `${out[key]},${value}` : value;
  }
  return out;
}

/** True when a checkbox named `name` was ticked in an echoed submission. */
export function echoedChecked(values: Record<string, string> | undefined, name: string): boolean {
  return Boolean(values && name in values);
}
