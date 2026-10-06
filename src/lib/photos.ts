/**
 * Photography used across the platform.
 *
 * Every photo is published under the Unsplash License (free for commercial and
 * non-commercial use, no permission needed). Photographers are credited on the
 * landing page all the same.
 */
export interface Photo {
  src: string;
  alt: string;
  credit: string;
  page: string;
  /** CSS object-position — where to keep the subject when cropped */
  focus?: string;
}

const u = (id: string) => `https://images.unsplash.com/${id}`;

export const PHOTOS = {
  heroRider: {
    src: u("photo-1667844141318-ee2ba9d088d6"),
    alt: "A boda boda rider in a red jacket carrying a passenger down a dusty road",
    credit: "Zach Wear",
    page: "https://unsplash.com/photos/aTD4x4IW11A",
    focus: "50% 45%",
  },
  kenyanPlate: {
    src: u("photo-1641295437743-2ea0b8453392"),
    alt: "A rider and passenger on a boda boda with a yellow Kenyan number plate, seen from behind in traffic",
    credit: "Dieuvain Musaghi",
    page: "https://unsplash.com/photos/AG7ia_fS2WQ",
    focus: "50% 55%",
  },
  stage: {
    src: u("photo-1551356522-050fbef473bf"),
    alt: "Boda boda riders waiting with their motorcycles on a busy roadside",
    credit: "Random Institute",
    page: "https://unsplash.com/photos/oZwH8m9gV7M",
    focus: "40% 50%",
  },
  resting: {
    src: u("photo-1551357140-3ef82d766abd"),
    alt: "A rider resting across the seat of his red motorcycle between trips",
    credit: "Random Institute",
    page: "https://unsplash.com/photos/MTghRQsc5XQ",
    focus: "55% 50%",
  },
  matatus: {
    src: u("photo-1664181220898-ad6a29e87525"),
    alt: "Matatus and traffic filling a Nairobi street",
    credit: "Michael Njoroge",
    page: "https://unsplash.com/photos/bHOOp42Od3o",
    focus: "50% 50%",
  },
  skyline: {
    src: u("photo-1741991110666-88115e724741"),
    alt: "The Nairobi skyline on a sunny day",
    credit: "imsogabriel stock",
    page: "https://unsplash.com/photos/IaJm3mq0F5o",
    focus: "50% 60%",
  },
  phoneSmile: {
    src: u("photo-1528123778681-01e39b42808e"),
    alt: "A young man smiling at a message on his phone",
    credit: "Nel Ranoko",
    page: "https://unsplash.com/photos/iaHFmpXVltw",
    focus: "45% 40%",
  },
  helmet: {
    src: u("photo-1601979107535-46367552bc25"),
    alt: "A rider in a red helmet with a passenger behind him",
    credit: "Edouard Tamba",
    page: "https://unsplash.com/photos/g-I1MUt16dc",
    focus: "60% 40%",
  },
  market: {
    src: u("photo-1672079806540-6791a00ce239"),
    alt: "A crowd gathered around a busy street stall",
    credit: "Nichika Sakurai",
    page: "https://unsplash.com/photos/7PcZ2UonkIw",
    focus: "50% 50%",
  },
  vendor: {
    src: u("photo-1687422808248-f807f4ea2a2e"),
    alt: "A trader in an apron checking payments on his phone at his stall",
    credit: "Ali Mkumbwa",
    page: "https://unsplash.com/photos/uk3ey_vhDKA",
    focus: "40% 40%",
  },
  countryRoad: {
    src: u("photo-1524581855427-4f2d2026a0f1"),
    alt: "A rider carrying jerrycans on a red dirt road",
    credit: "Melissa Askew",
    page: "https://unsplash.com/photos/1D6d4KiNTmg",
    focus: "55% 60%",
  },
  mirror: {
    src: u("photo-1715250670734-ccd0fb7947f8"),
    alt: "A boda boda rider reflected in a car's side mirror",
    credit: "Imani Bahati",
    page: "https://unsplash.com/photos/B2tBSU3BakM",
    focus: "50% 50%",
  },
} satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof PHOTOS;

/** One photo per curriculum module, for lesson headers and module tiles. */
export const MODULE_PHOTO: Record<string, PhotoKey> = {
  SAVINGS: "market",
  CREDIT: "vendor",
  INVESTMENT: "skyline",
  INSURANCE: "helmet",
};

/** Colour identity per module: fill, soft background, readable text. */
export const MODULE_THEME: Record<string, { fill: string; soft: string; text: string; emoji: string }> = {
  SAVINGS: { fill: "var(--green)", soft: "var(--green-soft)", text: "var(--brand-strong)", emoji: "savings" },
  CREDIT: { fill: "var(--green)", soft: "var(--green-soft)", text: "var(--brand-strong)", emoji: "credit" },
  INVESTMENT: { fill: "var(--green)", soft: "var(--green-soft)", text: "var(--brand-strong)", emoji: "investment" },
  INSURANCE: { fill: "var(--green)", soft: "var(--green-soft)", text: "var(--brand-strong)", emoji: "insurance" },
  PENSION: { fill: "var(--green)", soft: "var(--green-soft)", text: "var(--brand-strong)", emoji: "pension" },
};
