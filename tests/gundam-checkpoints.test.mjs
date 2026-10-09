import test from "node:test";
import assert from "node:assert/strict";
import { GUNDAM_CHECKPOINTS, screenCrossing } from "../dist/gundam-checkpoints.js";
const offer = { schema: "swarm.city.handoff/v1", idempotencyKey: "key", correlationId: "trace", sourceCity: "swarm-home", destinationCity: "second-city", opaqueAgentRef: "agent", authorityRef: "atlas", sourceReceipt: { id: "source", sourceCity: "swarm-home", eventId: "event", occurredAt: "2026-10-09T00:00:00Z", standing: "verified" } };
test("international screening executes eight canonical checkpoints in order", async () => {
  const seen = [];
  const result = await screenCrossing(offer, "international", { evaluate: async (checkpoint) => {
    seen.push(checkpoint);
    return { checkpoint, standing: "passed", receiptId: "evidence:" + checkpoint };
  } });
  assert.deepEqual(seen, [...GUNDAM_CHECKPOINTS]);
  assert.equal(result.permitted, true);
  assert.equal(result.correlationId, "trace");
});
test("failed checkpoint stops remaining sequence", async () => {
  const seen = [];
  const result = await screenCrossing(offer, "international", { evaluate: async checkpoint => {
    seen.push(checkpoint);
    return { checkpoint, standing: seen.length === 3 ? "refused" : "passed", receiptId: "receipt" };
  } });
  assert.equal(result.permitted, false);
  assert.equal(seen.length, 3);
  assert.ok(result.reasons.includes("checkpoint_not_verified:atlas-semantic-memory"));
});
test("local crossing uses proportionate checks", async () => {
  const result = await screenCrossing(offer, "local", { evaluate: async checkpoint => ({ checkpoint, standing: "passed", receiptId: "receipt" }) });
  assert.deepEqual(result.screenings.map(x => x.checkpoint), ["atlas-memory-witness", "atlas-continuity"]);
});
test("missing evidence and provider errors fail closed", async () => {
  const result = await screenCrossing(offer, "international", { evaluate: async () => { throw Error("offline"); } });
  assert.equal(result.permitted, false);
  assert.equal(result.screenings[0].standing, "unavailable");
});
