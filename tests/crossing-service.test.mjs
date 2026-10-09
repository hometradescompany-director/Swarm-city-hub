import test from "node:test";
import assert from "node:assert/strict";
import { requestCityCrossing } from "../dist/crossing-service.js";
import { MemoryReplayStore } from "../dist/federation.js";

const receipt = (city, standing = "verified") => ({ id: "r", sourceCity: city, eventId: "e", occurredAt: "2026-10-09T00:00:00Z", standing });
const peer = { homeRef: "swarm-home", protocolVersion: "SwarmHomeFederation/v1", capabilityRefs: [], evidenceReceiptIds: ["r"], nonce: "unique", observedAt: "2026-10-09T00:00:00Z" };
const offer = { schema: "swarm.city.handoff/v1", idempotencyKey: "k", correlationId: "c", sourceCity: "swarm-home", destinationCity: "second-city", opaqueAgentRef: "a", authorityRef: "atlas", sourceReceipt: receipt("swarm-home") };
function deps(overrides = {}) {
  return {
    replay: new MemoryReplayStore(),
    authenticatePeer: async () => true,
    authorizeWithAtlas: async () => true,
    admitLocally: async () => ({ decision: "accepted", evidence: receipt("second-city") }),
    persistResult: async () => receipt("second-city"),
    ...overrides
  };
}
test("crossing requires authentication and Atlas approval", async () => {
  const noPeer = await requestCityCrossing("second-city", peer, offer, deps({ authenticatePeer: async () => false }));
  assert.deepEqual(noPeer.reasons, ["peer_authentication_failed"]);
  const noAtlas = await requestCityCrossing("second-city", peer, offer, deps({ authorizeWithAtlas: async () => false }));
  assert.deepEqual(noAtlas.reasons, ["atlas_authority_denied"]);
});
test("crossing refuses local admission denial and unverified persistence", async () => {
  const denied = await requestCityCrossing("second-city", peer, offer, deps({ admitLocally: async () => ({ decision: "rejected", reason: "full", evidence: receipt("second-city") }) }));
  assert.equal(denied.status, "refused");
  const badReceipt = await requestCityCrossing("second-city", peer, offer, deps({ persistResult: async () => receipt("second-city", "unknown") }));
  assert.deepEqual(badReceipt.reasons, ["persistence_receipt_unverified"]);
});
test("crossing returns verified destination receipt", async () => {
  const outcome = await requestCityCrossing("second-city", peer, offer, deps());
  assert.equal(outcome.status, "accepted");
  assert.equal(outcome.correlationId, "c");
  assert.equal(outcome.receipt.sourceCity, "second-city");
});
