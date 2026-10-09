import type { AdmissionDecision, HandoffOffer } from "./contracts.js";
import { inspectHandoffGate, type HandoffGateReceipt } from "./handoff.js";

export const SWARM_HOME_FEDERATION_PROTOCOL = "SwarmHomeFederation/v1" as const;

export interface PeerAdvertisement {
  homeRef: string;
  protocolVersion: string;
  capabilityRefs: readonly string[];
  evidenceReceiptIds: readonly string[];
  nonce: string;
  observedAt: string;
}
export interface PeerCheck {
  accepted: boolean;
  reasons: string[];
  correlationId: string;
}

export interface ReplayStore {
  has(peerRef: string, nonce: string): boolean;
  add(peerRef: string, nonce: string): void;
}
export class MemoryReplayStore implements ReplayStore {
  private readonly seen = new Set<string>();
  has(peerRef: string, nonce: string): boolean { return this.seen.has(JSON.stringify([peerRef, nonce])); }
  add(peerRef: string, nonce: string): void { this.seen.add(JSON.stringify([peerRef, nonce])); }
}

/** Local peer recognition only. Authentication and authority remain external. */
export function inspectPeerAdvertisement(
  localHomeRef: string,
  peer: PeerAdvertisement,
  correlationId: string,
  replay: ReplayStore
): PeerCheck {
  const reasons: string[] = [];
  if (!localHomeRef.trim() || !peer.homeRef.trim() || !correlationId.trim()) reasons.push("missing_reference");
  if (localHomeRef === peer.homeRef) reasons.push("self_peer");
  if (peer.protocolVersion !== SWARM_HOME_FEDERATION_PROTOCOL) reasons.push("unsupported_protocol");
  if (!peer.nonce.trim()) reasons.push("missing_nonce");
  if (!peer.evidenceReceiptIds.length || peer.evidenceReceiptIds.some(id => !id.trim())) reasons.push("missing_evidence");
  if (!Number.isFinite(Date.parse(peer.observedAt))) reasons.push("invalid_observation_time");
  if (peer.nonce && replay.has(peer.homeRef, peer.nonce)) reasons.push("replayed_nonce");
  if (!reasons.length) replay.add(peer.homeRef, peer.nonce);
  return { accepted: reasons.length === 0, reasons, correlationId };
}

export interface CityCrossingResult {
  accepted: boolean;
  receipts: HandoffGateReceipt[];
  reasons: string[];
  correlationId: string;
}

/** Evidence gates only; destination local admission, Atlas authority and transport authentication are required separately. */
export function inspectCityCrossing(
  offer: HandoffOffer,
  decision: AdmissionDecision,
  peer: PeerCheck
): CityCrossingResult {
  const gates = [
    inspectHandoffGate(offer, "source-departure"),
    inspectHandoffGate(offer, "peer-recognition"),
    inspectHandoffGate(offer, "destination-admission", decision),
    inspectHandoffGate(offer, "destination-arrival", decision)
  ];
  const reasons = [...peer.reasons, ...gates.flatMap(g => g.reasons)];
  if (!peer.accepted) reasons.push("peer_not_recognised");
  if (peer.correlationId !== offer.correlationId) reasons.push("correlation_mismatch");
  return { accepted: reasons.length === 0, receipts: gates, reasons, correlationId: offer.correlationId };
}
