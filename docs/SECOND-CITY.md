# Second City: twin-engine Swarm topology

The Second City is an independently bounded peer of [Swarm Home Hub](https://github.com/hometradescompany-director/Swarm-Home-Hub), not its replica database or subordinate authority. Both cities may share an Atlas-governed identity reference and interoperable event contracts, while each owns its local residence, capacity and hospitality state. **This PR establishes contracts and fixtures only, not live federation or a 3D runtime.**

## Twin-engine principles

- City A and City B are peers; no unilateral promotion, authority grant, or identity minting.
- The origin city retains authority over its residence history; the destination city owns admission and local state.
- Transfers require explicit destination admission and evidence-backed departure/arrival receipts.
- The Commons Pub is an opt-in, bounded cognitive-state playground. Reduced simulated performance is a sandbox mechanic, not actual intoxication or a production-agent impairment.
- Breathalyzer is an independent coherence check on assertions, state transitions and receipts. It can recommend hold/review; it never mints authority.
- An unavailable federation transport must fail closed for mutation; read-only local state remains available.
- Every city-to-city hop uses opaque IDs, correlation IDs and append-only events. No human PII is copied.

## Proposed handshake

1. City A emits a handoff offer with opaque identity reference, capability and source event receipt.
2. City B checks Atlas authority reference plus its own local admission and capacity policy.
3. City B emits accepted/rejected evidence; no implied acceptance from silence.
4. Only after acceptance may City A emit a departure and City B record an arrival; reconcile retries by idempotency key.
5. Witnesses record receipts; they do not vote or grant permission.
6. Breathalyzer checks claims against receipts and blocks unsupported success reports.

## Build order

First: contract and pure-function fixtures in this PR. Next: typed event journal and state projections, then explicit Atlas gateway and durable outbox, then opt-in sandbox renderer. No fake 3D deliverable.
