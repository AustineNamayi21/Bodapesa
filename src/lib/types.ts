export type Lang = "EN" | "SW" | "SH";
export type Channel = "SMS" | "USSD" | "WHATSAPP" | "APP";
export type ProductCategory = "SAVINGS" | "CREDIT" | "INSURANCE" | "INVESTMENT" | "PENSION";
export type RiderStatus = "PROSPECT" | "ENROLLED" | "ACTIVE" | "ONBOARDED" | "DORMANT" | "OPTED_OUT";
export type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "DECLINED";
export type MessageStatus = "QUEUED" | "SENT" | "DELIVERED" | "READ" | "FAILED";
export type ModuleKey = "SAVINGS" | "CREDIT" | "INVESTMENT" | "INSURANCE";

export interface Partner {
  id: string;
  code: string;
  name: string;
  kind: string;
  tagline: string | null;
  description: string | null;
  accent: string;
  contactMsisdn: string | null;
  website: string | null;
  createdAt: string;
}

export interface Stage {
  id: string;
  name: string;
  subCounty: string;
  ward: string | null;
  lat: number | null;
  lng: number | null;
  chairperson: string | null;
  chairMsisdn: string | null;
  createdAt: string;
}

export interface Rider {
  id: string;
  msisdn: string;
  firstName: string;
  lastName: string;
  nationalId: string | null;
  gender: string | null;
  ageBand: string | null;
  language: Lang;
  channelPref: Channel;
  stageId: string | null;
  dailyIncomeBand: string | null;
  ownsMotorbike: number;
  hasBankAccount: number;
  saccoMember: number;
  hasInsurance: number;
  usesMobileMoney: number;
  status: RiderStatus;
  literacyScore: number;
  consent: number;
  consentAt: string | null;
  registeredVia: string;
  /** 1 for generated demonstration riders — never sent a real message. */
  isSynthetic: number;
  lastActiveAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RiderWithStage extends Rider {
  stageName: string | null;
  subCounty: string | null;
}

export interface Product {
  id: string;
  partnerId: string;
  code: string;
  name: string;
  category: ProductCategory;
  icon: string;
  summaryEn: string;
  summarySw: string;
  summarySh: string;
  detailsEn: string;
  detailsSw: string;
  minAmount: number | null;
  maxAmount: number | null;
  interestRate: string | null;
  premium: string | null;
  termLabel: string | null;
  eligibility: string | null;
  requiresMembership: number;
  featured: number;
  active: number;
  createdAt: string;
}

export interface ProductWithPartner extends Product {
  partnerName: string;
  partnerCode: string;
  partnerAccent: string;
}

export interface Lesson {
  id: string;
  moduleKey: ModuleKey;
  order: number;
  code: string;
  titleEn: string;
  titleSw: string;
  titleSh: string;
  bodyEn: string;
  bodySw: string;
  bodySh: string;
  smsEn: string;
  smsSw: string;
  smsSh: string;
  durationMin: number;
  active: number;
}

export interface QuizQuestion {
  id: string;
  lessonId: string;
  order: number;
  promptEn: string;
  promptSw: string;
  promptSh: string;
  optionsJson: string;
  correctIndex: number;
  explanationEn: string;
  explanationSw: string;
}

export interface Campaign {
  id: string;
  name: string;
  objective: string;
  productId: string | null;
  bodyEn: string;
  bodySw: string;
  bodySh: string;
  channels: string;
  segmentJson: string;
  status: string;
  scheduledAt: string | null;
  sentAt: string | null;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  campaignId: string | null;
  riderId: string;
  channel: Channel;
  language: Lang;
  body: string;
  direction: string;
  status: MessageStatus;
  providerRef: string | null;
  costKes: number;
  error: string | null;
  createdAt: string;
  sentAt: string | null;
  deliveredAt: string | null;
  readAt: string | null;
}

export interface Lead {
  id: string;
  riderId: string;
  productId: string;
  partnerId: string;
  status: LeadStatus;
  source: string;
  note: string | null;
  valueKes: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Segment {
  stageIds?: string[];
  subCounties?: string[];
  languages?: Lang[];
  statuses?: RiderStatus[];
  saccoMember?: boolean;
  hasInsurance?: boolean;
  hasBankAccount?: boolean;
  literacyBelow?: number;
  incomeBands?: string[];
  consentOnly?: boolean;
}
