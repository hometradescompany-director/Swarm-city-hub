import test from "node:test";
import assert from "node:assert/strict";
import { InMemoryResidenceJournal } from "../dist/journal.js";
import { inspectDistrictAdmission } from "../dist/district.js";
import { projectReadyCapsule } from "../dist/ready-capsule.js";
const e = (id, residenceId, kind, previousEventId = null) => ({ id, residenceId, kind, opaqueAgentRef: residenceId, districtId: "north", occurredAt: "2026-10-09T00:00:00Z", observedAt: "2026-10-09T00:00:00Z", previousEventId, evidenceReceiptIds: ["receipt"] });
test("district capacity and authority gates", async () => {
  const journal = new InMemoryResidenceJournal();
  await journal.append(e("e1", "r1", "second.residence.requested"), null);
  await journal.append(e("e2", "r1", "second.residence.admitted", "e1"), "e1");
  await journal.append(e("e3", "r2", "second.residence.requested"), null);
  const req = { residenceId: "r2", districtId: "north", opaqueAgentRef: "r2", authorityApproved: true, evidenceReceiptIds: ["receipt"] };
  const district = { id: "north", capacity: 1, enabled: true };
  assert.equal((await inspectDistrictAdmission(req, district, journal, ["r1", "r2"])).reason, "district_at_capacity");
  assert.equal((await inspectDistrictAdmission({ ...req, authorityApproved: false }, district, journal, ["r1", "r2"])).reason, "atlas_authority_required");
  assert.equal((await inspectDistrictAdmission(req, { ...district, capacity: 2 }, journal, ["r1", "r2"])).admitted, true);
});
test("ready capsule has evidence but no authority implication", async () => {
  const journal = new InMemoryResidenceJournal();
  assert.equal(await projectReadyCapsule(journal, "r1"), null);
  await journal.append(e("e1", "r1", "second.residence.requested"), null);
  await journal.append(e("e2", "r1", "second.residence.admitted", "e1"), "e1");
  await journal.append(e("e3", "r1", "second.residence.rested", "e2"), "e2");
  await journal.append(e("e4", "r1", "second.residence.ready", "e3"), "e3");
  const capsule = await projectReadyCapsule(journal, "r1");
  assert.equal(capsule.authorityImplication, "none");
  assert.equal(capsule.lastEventId, "e4");
});
