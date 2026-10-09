import test from "node:test";
import assert from "node:assert/strict";
import { InMemoryResidenceJournal } from "../dist/journal.js";
import { projectResidence } from "../dist/residence.js";
const event = (id, kind, previousEventId = null) => ({ id, kind, residenceId: "r1", opaqueAgentRef: "a1", districtId: "north", occurredAt: "2026-10-09T00:00:00Z", observedAt: "2026-10-09T00:00:00Z", previousEventId, evidenceReceiptIds: ["receipt"] });
test("append-only residence lifecycle projects requested admitted resting ready", async () => {
  const journal = new InMemoryResidenceJournal();
  await journal.append(event("e1", "second.residence.requested"), null);
  await journal.append(event("e2", "second.residence.admitted", "e1"), "e1");
  await journal.append(event("e3", "second.residence.rested", "e2"), "e2");
  await journal.append(event("e4", "second.residence.ready", "e3"), "e3");
  const snapshot = projectResidence(await journal.forResidence("r1"));
  assert.equal(snapshot.status, "ready");
  assert.equal(snapshot.version, 4);
});
test("rejects stale predecessor and invalid transition without appending", async () => {
  const journal = new InMemoryResidenceJournal();
  await journal.append(event("e1", "second.residence.requested"), null);
  await assert.rejects(journal.append(event("e2", "second.residence.ready", "e1"), "e1"), /invalid_transition/);
  await assert.rejects(journal.append(event("e3", "second.residence.admitted", "wrong"), "wrong"), /stale_or_broken_predecessor/);
  assert.equal((await journal.forResidence("r1")).length, 1);
});
test("rejects identity mutation inside one residence", () => {
  assert.throws(() => projectResidence([event("e1", "second.residence.requested"), { ...event("e2", "second.residence.admitted", "e1"), opaqueAgentRef: "different" }]), /residence_identity_changed/);
});
