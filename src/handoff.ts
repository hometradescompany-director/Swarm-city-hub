import type { AdmissionDecision, HandoffOffer } from "./contracts.js";
import { inspectClaim } from "./breathalyzer.js";

export type HandoffGate = "source-departure" | "peer-recognition" | "destination-admission" | "destination-arrival";
export interface HandoffGateReceipt {
  gate: HandoffGate;
  accepted: boolean;
  reasons: string[];
  correlationId: string;
}

/**
 * Each crossing is checked separately. Evidence is not authority: callers must
 * additionally validate authentic signatures, Atlas authority and local policy.
 */
export function inspectHandoffGate(
  offer: HandoffOffer,
  gate: HandoffGate,
  decision?: AdmissionDecision
): HandoffGateReceipt {
  const reasons: string[] = [];
  if (offer.sourceCity === offer.destinationCity) reasons.push("self_peer");
  if (!offer.idempotencyKey.trim() || !offer.correlationId.trim() || !offer.opaqueAgentRef.trim() || !offer.authorityRef.trim()) reasons.push("missing_reference");
  if (offer.sourceReceipt.sourceCity !== offer.sourceCity || offer.sourceReceipt.standing !== "verified") reasons.push("source_evidence_unverified");
  const source = inspectClaim({ statement: "source residence transition verified", standing: "verified", evidence: [offer.sourceReceipt], failureCodes: [] });
  if (source.reviewRequired) reasons.push("source_breathalyzer_failed");
  if (gate === "destination-admission" || gate === "destination-arrival") {
    if (!decision || decision.decision !== "accepted") reasons.push("destination_not_admitted");
    else {
      if (decision.evidence.sourceCity !== offer.destinationCity) reasons.push("destination_receipt_mismatch");
      const result = inspectClaim({ statement: "destination admission verified", standing: "verified", evidence: [decision.evidence], failureCodes: [] });
      if (result.reviewRequired) reasons.push("destination_breathalyzer_failed");
    }
  }
  return { gate, accepted: reasons.length === 0, reasons, correlationId: offer.correlationId };
}

export function mayRecordArrival(offer: HandoffOffer, decision: AdmissionDecision): boolean {
  return inspectHandoffGate(offer, "destination-arrival", decision).accepted;
}
