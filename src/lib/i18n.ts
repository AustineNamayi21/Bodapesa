import type { Lang } from "./types";

export const LANGUAGES: { code: Lang; label: string; native: string }[] = [
  { code: "EN", label: "English", native: "English" },
  { code: "SW", label: "Kiswahili", native: "Kiswahili" },
  { code: "SH", label: "Sheng", native: "Sheng" },
];

/** Pick the right localised field off a record, e.g. pick(product, "summary", "SW"). */
export function pick<T extends object>(row: T, base: string, lang: Lang): string {
  const record = row as Record<string, unknown>;
  const suffix = lang === "EN" ? "En" : lang === "SW" ? "Sw" : "Sh";
  const value = record[`${base}${suffix}`];
  if (typeof value === "string" && value.trim()) return value;
  // graceful fallback chain: Sheng -> Kiswahili -> English
  const fallback = (record[`${base}Sw`] ?? record[`${base}En`]) as string | undefined;
  return fallback ?? "";
}

type Dict = Record<string, Record<Lang, string>>;

const STRINGS: Dict = {
  appName: { EN: "BodaPesa", SW: "BodaPesa", SH: "BodaPesa" },
  tagline: {
    EN: "Financial know-how for every rider",
    SW: "Maarifa ya fedha kwa kila mwendeshaji",
    SH: "Finance skills kwa kila rider",
  },
  learn: { EN: "Learn", SW: "Jifunze", SH: "Soma" },
  products: { EN: "Products", SW: "Bidhaa", SH: "Deals" },
  savings: { EN: "Savings", SW: "Akiba", SH: "Kubank" },
  credit: { EN: "Credit", SW: "Mikopo", SH: "Loan" },
  investment: { EN: "Investment", SW: "Uwekezaji", SH: "Invest" },
  insurance: { EN: "Insurance", SW: "Bima", SH: "Bima" },
  pension: { EN: "Pension", SW: "Pensheni", SH: "Pension" },
  myGoals: { EN: "My savings goal", SW: "Lengo langu la akiba", SH: "Goal yangu" },
  quiz: { EN: "Quiz", SW: "Jaribio", SH: "Quiz" },
  startLesson: { EN: "Start lesson", SW: "Anza somo", SH: "Anza" },
  continue: { EN: "Continue", SW: "Endelea", SH: "Endelea" },
  done: { EN: "Done", SW: "Imekamilika", SH: "Imeisha" },
  interested: { EN: "I'm interested", SW: "Ninavutiwa", SH: "Niko down" },
  requestSent: {
    EN: "Request sent — the provider will call you.",
    SW: "Ombi limetumwa — mtoa huduma atakupigia simu.",
    SH: "Request imeenda — watakucall.",
  },
  score: { EN: "Score", SW: "Alama", SH: "Points" },
  correct: { EN: "Correct!", SW: "Sahihi!", SH: "Iko sawa!" },
  wrong: { EN: "Not quite", SW: "Si sahihi", SH: "Umekosea" },
  minRead: { EN: "min", SW: "dak", SH: "min" },
  literacyScore: { EN: "Literacy score", SW: "Alama za maarifa", SH: "Score yako" },
  lessonsDone: { EN: "Lessons completed", SW: "Masomo yaliyokamilika", SH: "Masomo umemaliza" },
  saved: { EN: "Saved", SW: "Umeweka akiba", SH: "Umesave" },
  target: { EN: "Target", SW: "Lengo", SH: "Target" },
  addDeposit: { EN: "Add deposit", SW: "Ongeza akiba", SH: "Add doo" },
};

export function t(key: keyof typeof STRINGS | string, lang: Lang): string {
  const entry = STRINGS[key];
  if (!entry) return key;
  return entry[lang] ?? entry.EN;
}

export const MODULE_LABELS: Record<string, Record<Lang, string>> = {
  SAVINGS: { EN: "Savings", SW: "Akiba", SH: "Kubank Doo" },
  CREDIT: { EN: "Credit & Debt", SW: "Mikopo na Madeni", SH: "Loan na Deni" },
  INVESTMENT: { EN: "Investment", SW: "Uwekezaji", SH: "Kuinvest" },
  INSURANCE: { EN: "Insurance", SW: "Bima", SH: "Bima" },
};

/**
 * Normalise a Kenyan phone number to E.164 (+2547XXXXXXXX / +2541XXXXXXXX).
 * Accepts 07..., 7..., 2547..., +2547...
 */
export function normaliseMsisdn(input: string): string | null {
  const digits = input.replace(/[^0-9]/g, "");
  let local: string;
  if (digits.startsWith("254")) local = digits.slice(3);
  else if (digits.startsWith("0")) local = digits.slice(1);
  else local = digits;
  if (!/^[17]\d{8}$/.test(local)) return null;
  return `+254${local}`;
}

export function displayMsisdn(msisdn: string): string {
  const local = msisdn.replace("+254", "0");
  return local.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3");
}

/** GSM-7 aware SMS part counter. */
export function smsParts(body: string): { chars: number; parts: number; unicode: boolean } {
  const unicode = /[^\u0000-\u007F -ÿ]/.test(body);
  const chars = body.length;
  const single = unicode ? 70 : 160;
  const multi = unicode ? 67 : 153;
  const parts = chars <= single ? 1 : Math.ceil(chars / multi);
  return { chars, parts: Math.max(parts, 1), unicode };
}
