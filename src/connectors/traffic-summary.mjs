/** A bounded city projection of receipts; not a traffic controller. */
export function projectTrafficReceipt(receipt) {
  if (receipt?.contract !== 'traffic-ingest-receipt.v1') throw new TypeError('unsupported contract');
  if (receipt.producer !== 'hometradescompany-director/Traffic-Management-Swarm-Topology-') throw new TypeError('unsupported producer');
  if (receipt.routingReady !== false) throw new TypeError('routingReady must be false for receipt v1');
  if (!Array.isArray(receipt.observations)) throw new TypeError('observations must be an array');
  const seen = new Set();
  const observationRefs = receipt.observations.map(item => {
    for (const field of ['observationRef', 'sourceRef', 'subjectRef']) {
      if (typeof item?.[field] !== 'string' || !item[field].trim()) throw new TypeError(`invalid ${field}`);
    }
    for (const field of ['validAt', 'knownAt', 'ingestedAt']) {
      if (typeof item[field] !== 'string' || !item[field].trim() || Number.isNaN(Date.parse(item[field]))) {
        throw new TypeError(`invalid ${field}`);
      }
    }
    if (!['declared', 'missing', 'unknown'].includes(item.license?.standing)) throw new TypeError('invalid license.standing');
    if (item.license.standing === 'declared' && (typeof item.license.id !== 'string' || !item.license.id.trim())) {
      throw new TypeError('invalid license.id');
    }
    if (!Object.hasOwn(item, 'evidenceRef') || (item.evidenceRef !== null && (typeof item.evidenceRef !== 'string' || !item.evidenceRef.trim()))) {
      throw new TypeError('invalid evidenceRef');
    }
    if (item.mapping?.state !== 'unknown') throw new TypeError('unsupported mapping state');
    if (typeof item.mapping.reason !== 'string' || !item.mapping.reason.trim()) throw new TypeError('invalid mapping.reason');
    if (seen.has(item.observationRef)) throw new TypeError('duplicate observationRef');
    seen.add(item.observationRef);
    return item.observationRef;
  });
  return { contract: 'city-traffic-summary.v1', observationRefs, receivedCount: observationRefs.length,
    routingReady: false, controllerAuthority: false,
    performance: { state: 'not_searched', reason: 'No evaluation result supplied' } };
}
