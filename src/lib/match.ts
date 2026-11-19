import type { Product, Rider } from "@/lib/types";

/**
 * Ranks products against what the rider already told you at registration.
 *
 * Every field used here is one the registration form already collects and
 * then ignored: income band, whether they own the bike, whether they have
 * cover, a bank account, SACCO membership. A rider who rides their own bike
 * uninsured should not have to scroll past a retirement account.
 *
 * The reason string matters as much as the ranking. "Because you ride your
 * own bike and told us you have no cover" is a different conversation from an
 * unexplained list, and it is the rider's own words being quoted back.
 */

export type Match = {
  product: Product;
  score: number;
  /** Shown to the rider, in their language. */
  reason: { en: string; sw: string; sh: string } | null;
};

type Reason = { en: string; sw: string; sh: string };

const R = (en: string, sw: string, sh: string): Reason => ({ en, sw, sh });

function incomeRank(band: string | null | undefined): number {
  switch (band) {
    case "<500":
      return 0;
    case "500-1000":
      return 1;
    case "1000-1500":
      return 2;
    case ">1500":
      return 3;
    default:
      return 1;
  }
}

/**
 * Scores one product for one rider.
 *
 * Positive points are fit; negative points push something down without
 * hiding it, because a rider is allowed to want a product the rules did not
 * predict. Nothing here filters the catalogue — it only orders it.
 */
function scoreProduct(rider: Rider, product: Product): { score: number; reason: Reason | null } {
  let score = 0;
  let reason: Reason | null = null;

  const owns = Number(rider.ownsMotorbike) === 1;
  const insured = Number(rider.hasInsurance) === 1;
  const banked = Number(rider.hasBankAccount) === 1;
  const sacco = Number(rider.saccoMember) === 1;
  const income = incomeRank(rider.dailyIncomeBand);

  switch (product.category) {
    case "INSURANCE": {
      if (!insured) {
        score += 40;
        reason = owns
          ? R(
              "You ride your own bike and told us you have no cover yet.",
              "Unaendesha pikipiki yako mwenyewe na ulituambia huna bima bado.",
              "Una bike yako na ulisema huna cover bado.",
            )
          : R(
              "You told us you have no cover yet.",
              "Ulituambia huna bima bado.",
              "Ulisema huna cover bado.",
            );
      } else {
        score -= 10;
      }
      if (owns) score += 15;
      break;
    }

    case "SAVINGS": {
      if (!banked) {
        score += 35;
        reason = R(
          "You told us you do not have a bank account yet — this is the simplest place to start.",
          "Ulituambia huna akaunti ya benki bado — hapa ndipo rahisi kuanzia.",
          "Ulisema huna bank account bado — hapa ndio poa kuanzia.",
        );
      } else {
        score += 12;
      }
      // Riders on the thinnest margins benefit most from a place to put
      // money that is not their pocket.
      if (income <= 1) score += 12;
      break;
    }

    case "CREDIT": {
      // Credit before a savings habit is how a rider ends up worse off, so it
      // ranks below savings unless they are already saving and earning more.
      if (!banked) score -= 15;
      if (income >= 2) score += 18;
      if (owns) {
        score += 10;
      } else {
        score += 20;
        reason = R(
          "You do not own the bike you ride yet.",
          "Bado huna pikipiki yako mwenyewe.",
          "Bado hauna bike yako.",
        );
      }
      break;
    }

    case "INVESTMENT":
    case "PENSION": {
      // Only sensible once the basics are in place.
      if (!banked) score -= 25;
      if (income >= 2) score += 15;
      if (banked && insured) {
        score += 20;
        reason = R(
          "You already have cover and somewhere to save — this is the next step.",
          "Tayari una bima na mahali pa kuweka akiba — hii ndiyo hatua inayofuata.",
          "Tayari una cover na pa kusave — hii ndio next step.",
        );
      }
      break;
    }

    default:
      break;
  }

  if (Number(product.requiresMembership) === 1) {
    if (sacco) {
      score += 10;
    } else {
      // Not disqualifying — joining is part of the offer — but it is friction.
      score -= 12;
    }
  }

  if (Number(product.featured) === 1) score += 5;

  return { score, reason };
}

/**
 * Orders the catalogue for one rider.
 *
 * Archived products are dropped. Everything else is returned, ranked — the
 * rider keeps the right to ask about anything.
 */
export function rankProducts(rider: Rider, products: Product[]): Match[] {
  return products
    .filter((p) => Number(p.active) === 1)
    .map((product) => {
      const { score, reason } = scoreProduct(rider, product);
      return { product, score, reason };
    })
    .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name));
}

export function reasonIn(match: Match, lang: string): string | null {
  if (!match.reason) return null;
  if (lang === "SW") return match.reason.sw;
  if (lang === "SH") return match.reason.sh;
  return match.reason.en;
}
