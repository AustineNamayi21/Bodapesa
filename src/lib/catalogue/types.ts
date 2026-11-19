import type { ProductCategory } from "@/lib/types";

/**
 * One researched product, before it is written to the database.
 *
 * `code` is the stable key: installing the catalogue updates a product that
 * already carries the code rather than creating a second copy, so the
 * install can be re-run after a partner changes its terms.
 *
 * Every entry carries `sourceUrl` and `verifiedOn`. A programme that quotes
 * a rider a premium owes them a page it came from and a date it was read.
 */
export type CatalogueEntry = {
  code: string;
  name: string;
  category: ProductCategory;
  icon: string;
  featured: 0 | 1;
  requiresMembership: 0 | 1;
  minAmount?: number;
  maxAmount?: number;
  interestRate?: string;
  premium?: string;
  termLabel?: string;
  eligibility?: string;
  summaryEn: string;
  summarySw: string;
  summarySh: string;
  detailsEn: string;
  detailsSw: string;
  sourceUrl: string;
  verifiedOn: string;
};
