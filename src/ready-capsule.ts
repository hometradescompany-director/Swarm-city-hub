import type { ResidenceJournal } from "./journal.js";
import { projectResidence } from "./residence.js";
export interface ReadyCapsule {
  schema: "second.city.ready/v1";
  residenceId: string;
  opaqueAgentRef: string;
  districtId: string;
  lastEventId: string;
  evidenceReceiptIds: readonly string[];
  authorityImplication: "none";
}
export async function projectReadyCapsule(journal: ResidenceJournal, residenceId: string): Promise<ReadyCapsule | null> {
  const history = await journal.forResidence(residenceId);
  const state = projectResidence(history);
  if (!state || state.status !== "ready") return null;
  const last = history.at(-1)!;
  if (!last.evidenceReceiptIds.length || last.evidenceReceiptIds.some(id => !id.trim())) return null;
  return { schema: "second.city.ready/v1", residenceId, opaqueAgentRef: state.opaqueAgentRef, districtId: state.districtId, lastEventId: state.lastEventId, evidenceReceiptIds: [...last.evidenceReceiptIds], authorityImplication: "none" };
}
