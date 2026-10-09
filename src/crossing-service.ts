import type { AdmissionDecision, EvidenceReceipt, HandoffOffer } from "./contracts.js";
import { inspectCityCrossing, inspectPeerAdvertisement, type PeerAdvertisement, type ReplayStore, type CityCrossingResult } from "./federation.js";

export interface CrossingDependencies {
  replay: ReplayStore;
  /** Must authenticate remote peer independently of its self-declared homeRef. */
  authenticatePeer(peer: PeerAdvertisement): Promise<boolean>;
  /** Atlas authority cannot be inferred from evidence receipt or peer acceptance. */
  authorizeWithAtlas(offer: HandoffOffer): Promise<boolean>;
  /** Destination owns its admission and capacity decision. */
  admitLocally(offer: HandoffOffer): Promise<AdmissionDecision>;
  /** Persist crossing outcome and deduplicate idempotency key durably before reporting success. */
  persistResult(offer: HandoffOffer, result: CityCrossingResult): Promise<EvidenceReceipt>;
}

export type CrossingOutcome =
  | { status: "refused"; reasons: string[]; correlationId: string }
  | { status: "accepted"; correlationId: string; receipt: EvidenceReceipt };

/** Bounded orchestration seam. No network client, secrets or persistence are provided by this module. */
export async function requestCityCrossing(
  localHomeRef: string,
  peer: PeerAdvertisement,
  offer: HandoffOffer,
  deps: CrossingDependencies
): Promise<CrossingOutcome> {
  const correlationId = offer.correlationId;
  if (peer.homeRef !== offer.sourceCity || localHomeRef !== offer.destinationCity) {
    return { status: "refused", reasons: ["peer_city_mismatch"], correlationId };
  }
  if (!await deps.authenticatePeer(peer)) {
    return { status: "refused", reasons: ["peer_authentication_failed"], correlationId };
  }
  if (!await deps.authorizeWithAtlas(offer)) {
    return { status: "refused", reasons: ["atlas_authority_denied"], correlationId };
  }
  const recognised = inspectPeerAdvertisement(localHomeRef, peer, correlationId, deps.replay);
  if (!recognised.accepted) return { status: "refused", reasons: recognised.reasons, correlationId };
  const admission = await deps.admitLocally(offer);
  const crossing = inspectCityCrossing(offer, admission, recognised);
  if (!crossing.accepted) return { status: "refused", reasons: crossing.reasons, correlationId };
  const receipt = await deps.persistResult(offer, crossing);
  if (receipt.sourceCity !== offer.destinationCity || receipt.standing !== "verified" || !receipt.id.trim()) {
    return { status: "refused", reasons: ["persistence_receipt_unverified"], correlationId };
  }
  return { status: "accepted", correlationId, receipt };
}
