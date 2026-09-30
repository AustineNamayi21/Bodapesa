/**
 * The USSD code riders dial. It appears in lessons, campaign messages and
 * screens, so it is kept in one place.
 *
 * On the Africa's Talking sandbox this is the shared code *384# plus the
 * channel number reserved for BodaPesa. A dedicated Safaricom short code would
 * replace it here.
 */
export const USSD_CODE = "*384*14791#";

/** Codes used by earlier builds, rewritten to USSD_CODE in stored content. */
export const LEGACY_USSD_CODES = ["*384*7788#"];
