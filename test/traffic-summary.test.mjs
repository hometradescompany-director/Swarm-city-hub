import test from 'node:test';
import assert from 'node:assert/strict';
import { projectTrafficReceipt } from '../src/connectors/traffic-summary.mjs';

const receipt = { contract: 'traffic-ingest-receipt.v1', producer: 'hometradescompany-director/Traffic-Management-Swarm-Topology-', routingReady: false, observations: [{ observationRef: 'event:1', sourceRef: 'source:1', subjectRef: 'road-event:1', validAt: '2026-10-09T01:00:00Z', knownAt: '2026-10-09T01:05:00Z', ingestedAt: '2026-10-09T01:06:00Z', license: { standing: 'declared', id: 'CC-BY-4.0' }, evidenceRef: null, mapping: { state: 'unknown', reason: 'No validated graph-edge mapping supplied' } }] };
test('projects bounded references and unknown metrics without granting control authority', () => {
  const result = projectTrafficReceipt(receipt);
  assert.equal(result.contract, 'city-traffic-summary.v1');
  assert.deepEqual(result.observationRefs, ['event:1']);
  assert.equal(result.routingReady, false);
  assert.deepEqual(result.performance, { state: 'not_searched', reason: 'No evaluation result supplied' });
  assert.equal(result.controllerAuthority, false);
  assert.equal(result.payload, undefined);
});
test('rejects incompatible receipts and fabricated routing readiness', () => {
  assert.throws(() => projectTrafficReceipt({ ...receipt, contract: 'traffic-ingest-receipt.v2' }), /contract/);
  assert.throws(() => projectTrafficReceipt({ ...receipt, routingReady: true }), /routingReady/);
});
test('rejects receipts with incomplete provenance even when display references exist', () => {
  for (const field of ['validAt', 'knownAt', 'ingestedAt', 'license', 'evidenceRef']) {
    const broken = structuredClone(receipt); delete broken.observations[0][field];
    assert.throws(() => projectTrafficReceipt(broken), new RegExp(field));
  }
  const invalidTime = structuredClone(receipt); invalidTime.observations[0].knownAt = 'invalid';
  assert.throws(() => projectTrafficReceipt(invalidTime), /knownAt/);
  const noReason = structuredClone(receipt); delete noReason.observations[0].mapping.reason;
  assert.throws(() => projectTrafficReceipt(noReason), /mapping.reason/);
});
