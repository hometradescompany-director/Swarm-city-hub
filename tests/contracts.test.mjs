import test from "node:test";
import assert from "node:assert/strict";
import { inspectClaim } from "../dist/breathalyzer.js";
import { evaluatePubAdmission } from "../dist/pub.js";
import { mayRecordArrival } from "../dist/handoff.js";
const receipt = (city, standing = "verified") => ({ id: "r", sourceCity: city, eventId: "e", occurredAt: "2026-10-09T00:00:00Z", standing });
test("breathalyzer rejects completion without evidence", () => {
  const r = inspectClaim({ statement: "sent", standing: "sent", evidence: [], failureCodes: [] });
  assert.equal(r.coherent, false); assert.ok(r.failures.includes("I1"));
});
test("breathalyzer does not upgrade sent to verified", () => {
  const r = inspectClaim({ statement: "done", standing: "verified", evidence: [receipt("second-city", "sent")], failureCodes: [] });
  assert.ok(r.failures.includes("P1"));
});
test("pub denies nonconsensual, expired and production sessions", () => {
  const base = { schema: "swarm.pub.session/v1", sessionId: "s", opaqueAgentRef: "a", city: "second-city", consent: true, sandbox: true, simulatedCapacity: .5, startedAt: "2026-10-09T00:00:00Z", expiresAt: "2026-10-09T01:00:00Z", status: "active" };
  assert.equal(evaluatePubAdmission(base, "2026-10-09T00:30:00Z").permitted, true);
  assert.equal(evaluatePubAdmission({ ...base, consent: false }, "2026-10-09T00:30:00Z").permitted, false);
  assert.equal(evaluatePubAdmission({ ...base, sandbox: false }, "2026-10-09T00:30:00Z").permitted, false);
  assert.equal(evaluatePubAdmission(base, "2026-10-09T01:00:00Z").permitted, false);
});
test("arrival requires explicit destination verified acceptance", () => {
  const offer = { schema: "swarm.city.handoff/v1", idempotencyKey: "k", correlationId: "c", sourceCity: "swarm-home", destinationCity: "second-city", opaqueAgentRef: "a", authorityRef: "auth", sourceReceipt: receipt("swarm-home") };
  assert.equal(mayRecordArrival(offer, { decision: "rejected", reason: "no", evidence: receipt("second-city") }), false);
  assert.equal(mayRecordArrival(offer, { decision: "accepted", evidence: receipt("second-city", "unknown") }), false);
  assert.equal(mayRecordArrival(offer, { decision: "accepted", evidence: receipt("second-city") }), true);
});
