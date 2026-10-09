import type { ResidenceJournal } from "./journal.js";
import { projectResidence } from "./residence.js";
export interface District { id: string; capacity: number; enabled: boolean }
export interface AdmissionRequest { residenceId: string; districtId: string; opaqueAgentRef: string; authorityApproved: boolean; evidenceReceiptIds: string[] }
export interface AdmissionResult { admitted: boolean; reason: string; districtId: string }
export async function inspectDistrictAdmission(request: AdmissionRequest, district: District, journal: ResidenceJournal, existingResidenceIds: readonly string[]): Promise<AdmissionResult> {
  const refuse = (reason: string): AdmissionResult => ({ admitted: false, reason, districtId: district.id });
  if (!request.authorityApproved) return refuse("atlas_authority_required");
  if (!district.enabled || request.districtId !== district.id || !Number.isSafeInteger(district.capacity) || district.capacity < 1) return refuse("district_unavailable");
  if (!request.residenceId.trim() || !request.opaqueAgentRef.trim() || !request.evidenceReceiptIds.length || request.evidenceReceiptIds.some(id => !id.trim())) return refuse("missing_evidence_or_identity");
  const requested = projectResidence(await journal.forResidence(request.residenceId));
  if (!requested || requested.status !== "requested" || requested.opaqueAgentRef !== request.opaqueAgentRef || requested.districtId !== district.id) return refuse("residence_not_requested");
  let occupied = 0;
  for (const id of new Set(existingResidenceIds)) {
    const snapshot = projectResidence(await journal.forResidence(id));
    if (snapshot?.districtId === district.id && ["admitted", "resting", "ready"].includes(snapshot.status)) occupied++;
  }
  return occupied >= district.capacity ? refuse("district_at_capacity") : { admitted: true, reason: "local_policy_eligible", districtId: district.id };
}
/** This preflight is not an atomic capacity reservation. Production requires a durable admission transaction. */
