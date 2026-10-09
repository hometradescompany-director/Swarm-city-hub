import test from "node:test";
import assert from "node:assert/strict";
import { MemoryReplayStore, inspectPeerAdvertisement, inspectCityCrossing } from "../dist/federation.js";
const evidence = (city, standing = "verified") => ({ id: "receipt", sourceCity: city, eventId: "event", occurredAt: "2026-10-09T00:00:00Z", standing });
const advert = () => ({ homeRef: "swarm-home", protocolVersion: "SwarmHomeFederation/v1", capabilityRefs: [], evidenceReceiptIds: ["receipt"], nonce: "n1", observedAt: "2026-10-09T00:00:00Z" });
const offer = () => ({ schema: "swarm.city.handoff/v1", idempotencyKey: "id1", correlationId: "corr1", sourceCity: "swarm-home", destinationCity: "second-city", opaqueAgentRef: "agent1", authorityRef: "atlas-authority", sourceReceipt: evidence("swarm-home") });
test("recognises peer once and refuses nonce replay", () => {
  const replay = new MemoryReplayStore();
  assert.equal(inspectPeerAdvertisement("second-city", advert(), "corr1", replay).accepted, true);
  const again = inspectPeerAdvertisement("second-city", advert(), "corr1", replay);
  assert.equal(again.accepted, false);
  assert.ok(again.reasons.includes("replayed_nonce"));
});
test("refuses self peer, missing evidence and protocol mismatch", () => {
  const replay = new MemoryReplayStore();
  assert.ok(inspectPeerAdvertisement("swarm-home", advert(), "corr1", replay).reasons.includes("self_peer"));
  assert.ok(inspectPeerAdvertisement("second-city", { ...advert(), evidenceReceiptIds: [] }, "corr1", replay).reasons.includes("missing_evidence"));
  assert.ok(inspectPeerAdvertisement("second-city", { ...advert(), protocolVersion: "v2" }, "corr1", replay).reasons.includes("unsupported_protocol"));
});
test("each crossing includes four breathalyzer receipts", () => {
  const peer = { accepted: true, reasons: [], correlationId: "corr1" };
  const result = inspectCityCrossing(offer(), { decision: "accepted", evidence: evidence("second-city") }, peer);
  assert.equal(result.accepted, true);
  assert.deepEqual(result.receipts.map(r => r.gate), ["source-departure", "peer-recognition", "destination-admission", "destination-arrival"]);
});
test("refuses incoherent destination evidence and correlation mismatch", () => {
  const result = inspectCityCrossing(offer(), { decision: "accepted", evidence: evidence("second-city", "unknown") }, { accepted: true, reasons: [], correlationId: "wrong" });
  assert.equal(result.accepted, false);
  assert.ok(result.reasons.includes("correlation_mismatch"));
  assert.ok(result.reasons.includes("destination_breathalyzer_failed"));
});
