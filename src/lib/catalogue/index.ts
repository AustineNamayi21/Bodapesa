import { STIMA_PRODUCTS } from "./stima";
import { BRITAM_PRODUCTS } from "./britam";
import type { CatalogueEntry } from "./types";

export type { CatalogueEntry } from "./types";

/**
 * The verified catalogue, keyed by the partner code it belongs to.
 *
 * Products are matched to partners by the partner's own `code` column rather
 * than by name, so renaming "Britam" in the console does not orphan fifteen
 * products.
 */
export const CATALOGUE: Record<string, CatalogueEntry[]> = {
  STIMA: STIMA_PRODUCTS,
  BRITAM: BRITAM_PRODUCTS,
};

export function catalogueSize(): number {
  return Object.values(CATALOGUE).reduce((n, list) => n + list.length, 0);
}
