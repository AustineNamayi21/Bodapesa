import { all, count } from "./db";
import type { Rider, Segment } from "./types";

/**
 * Translates an audience definition into SQL. Every campaign is targeted
 * through this function so the count shown in the composer is guaranteed to
 * match the audience that actually receives the messages.
 */
export function segmentWhere(segment: Segment): { sql: string; params: unknown[] } {
  // Numbers registered from the integrations page to test delivery are never
  // part of a campaign audience.
  const clauses: string[] = ["r.status != 'OPTED_OUT'", "r.registeredVia != 'TEST'"];
  const params: unknown[] = [];

  if (segment.consentOnly !== false) clauses.push("r.consent = 1");

  if (segment.stageIds?.length) {
    clauses.push(`r.stageId IN (${segment.stageIds.map(() => "?").join(",")})`);
    params.push(...segment.stageIds);
  }
  if (segment.subCounties?.length) {
    clauses.push(`s.subCounty IN (${segment.subCounties.map(() => "?").join(",")})`);
    params.push(...segment.subCounties);
  }
  if (segment.languages?.length) {
    clauses.push(`r.language IN (${segment.languages.map(() => "?").join(",")})`);
    params.push(...segment.languages);
  }
  if (segment.statuses?.length) {
    clauses.push(`r.status IN (${segment.statuses.map(() => "?").join(",")})`);
    params.push(...segment.statuses);
  }
  if (segment.incomeBands?.length) {
    clauses.push(`r.dailyIncomeBand IN (${segment.incomeBands.map(() => "?").join(",")})`);
    params.push(...segment.incomeBands);
  }
  if (typeof segment.saccoMember === "boolean") {
    clauses.push("r.saccoMember = ?");
    params.push(segment.saccoMember ? 1 : 0);
  }
  if (typeof segment.hasInsurance === "boolean") {
    clauses.push("r.hasInsurance = ?");
    params.push(segment.hasInsurance ? 1 : 0);
  }
  if (typeof segment.hasBankAccount === "boolean") {
    clauses.push("r.hasBankAccount = ?");
    params.push(segment.hasBankAccount ? 1 : 0);
  }
  if (typeof segment.literacyBelow === "number") {
    clauses.push("r.literacyScore < ?");
    params.push(segment.literacyBelow);
  }

  return { sql: clauses.join(" AND "), params };
}

export async function segmentRiders(segment: Segment): Promise<Rider[]> {
  const { sql, params } = segmentWhere(segment);
  return await all<Rider>(
    `SELECT r.* FROM Rider r LEFT JOIN Stage s ON s.id = r.stageId WHERE ${sql} ORDER BY r.createdAt DESC`,
    params,
  );
}

export async function segmentSize(segment: Segment): Promise<number> {
  const { sql, params } = segmentWhere(segment);
  return await count(
    `SELECT COUNT(*) AS n FROM Rider r LEFT JOIN Stage s ON s.id = r.stageId WHERE ${sql}`,
    params,
  );
}

export function parseSegment(json: string): Segment {
  try {
    return JSON.parse(json) as Segment;
  } catch {
    return {};
  }
}

/** Human-readable description of an audience, for the campaign list. */
export function describeSegment(segment: Segment): string {
  const bits: string[] = [];
  if (segment.statuses?.length) bits.push(segment.statuses.join(" / ").toLowerCase());
  if (segment.subCounties?.length) bits.push(`in ${segment.subCounties.join(", ")}`);
  if (segment.stageIds?.length) bits.push(`${segment.stageIds.length} selected stage(s)`);
  if (segment.languages?.length) bits.push(`speaking ${segment.languages.join("/")}`);
  if (segment.saccoMember === false) bits.push("not yet SACCO members");
  if (segment.saccoMember === true) bits.push("SACCO members");
  if (segment.hasInsurance === false) bits.push("uninsured");
  if (segment.hasInsurance === true) bits.push("insured");
  if (typeof segment.literacyBelow === "number") bits.push(`literacy score below ${segment.literacyBelow}`);
  if (segment.incomeBands?.length) bits.push(`earning ${segment.incomeBands.join(", ")}/day`);
  return bits.length ? `Riders ${bits.join(", ")}` : "All consented riders";
}
