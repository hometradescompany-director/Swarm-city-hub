# Twin-city handoff checkpoints

This is the Second City side of the proposed peer relationship with [Swarm Home Hub](https://github.com/hometradescompany-director/Swarm-Home-Hub). No live network pairing or cross-repository deployment is claimed.

## Four checkpoints

| Boundary | Local Breathalyzer check | Separate authority check |
| --- | --- | --- |
| Source departure | Source receipt is verified and references the source city | Origin residence service authorises departure |
| Peer recognition | Peer reference and source evidence are coherent | SwarmHomeFederation/v1 nonce/replay protocol and peer qualification |
| Destination admission | Destination receipt is verified and matches destination city | Destination habitat capacity and Atlas authority reference |
| Destination arrival | Re-evaluate the source and destination receipts, preserve correlation ID | Durable idempotency and transition journal required |

Implementation: [src/handoff.ts](../src/handoff.ts) exposes `inspectHandoffGate` and `mayRecordArrival`. These pure checks are *necessary evidence checks*, not sufficient authorisation. No evidence receipt may confer permission by itself.

## Required federation adapters

- **Existing City A:** `SwarmHomeFederation/v1` peer advertisement and nonce replay protection; `SwarmHomeExternalHandoff/v1` for ready handoffs.
- **City B:** `swarm.city.handoff/v1` offer, explicit accepted/rejected destination decision, and the four Breathalyzer checkpoints.
- **Adapter:** map opaque agent reference, source residence event, evidence receipts and correlation ID without copying personal information or mutable canonical state.
- **Transport:** authenticated peer channel, durable outbox and replay-safe storage. No shared token committed to source.
- **Reconciliation:** both cities retain independent event histories and typed refusal states; a timed-out offer is not admission.

## Conformance matrix

1. Accept a properly evidenced peer offer, then independently admit or reject at destination.
2. Refuse unsupported protocol version, blank references, self-peering, missing evidence and nonce replay.
3. Refuse a source receipt with the wrong city or insufficient evidence standing.
4. Refuse destination admission without an accepted, verified destination receipt.
5. Refuse arrival after timeout or duplicate idempotency key unless a durable replay check proves a prior identical result.
6. Preserve correlation and provenance across refusal and retry.
7. Never let Pub simulation state change authority, readiness or production execution capacity.
8. Confirm a blocked tool or unavailable transport does not erase unrelated local progress.

## Status

The Second City branch includes the contract and evidence gate code. This document records the integration points to implement and validate. It is not proof that the two repositories are connected or that the tests have run.
