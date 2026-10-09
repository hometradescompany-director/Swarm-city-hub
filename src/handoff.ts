import type { AdmissionDecision, HandoffOffer } from "./contracts";

export function mayRecordArrival(offer: HandoffOffer, decision: AdmissionDecision): boolean {
  return offer.sourceCity !== offer.destinationCity &&
    Boolean(offer.idempotencyKey && offer.correlationId && offer.opaqueAgentRef && offer.authorityRef) &&
    decision.decision === "accepted" &&
    decision.evidence.sourceCity === offer.destinationCity &&
    decision.evidence.standing === "verified" &&
    offer.sourceReceipt.sourceCity === offer.sourceCity &&
    offer.sourceReceipt.standing === "verified";
}
