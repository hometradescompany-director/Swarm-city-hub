# Causality Gundam as crossing infrastructure

Source of truth: [Skills Foundry Causality Gundam v0.2.0](https://github.com/hometradescompany-director/skills-foundry/tree/main/plugins/causality-gundam). The eight skills retain their canonical identity and doctrine. Second City uses them as infrastructure checkpoints, **not** as an MCP/plugin dependency or a new authority layer.

| Sequence | Canonical skill | Crossing purpose |
| --- | --- | --- |
| 1 | Atlas Working Memory | Smallest task-ready active context |
| 2 | Atlas Episodic Memory | Immutable history and time-aware recovery |
| 3 | Atlas Semantic Memory | Qualified reusable meaning |
| 4 | Atlas Procedural Memory | Versioned method for this handoff |
| 5 | Atlas Memory Witness | Attributable transition and compaction receipts |
| 6 | Atlas Heartbeat | Liveness and stalled-chain evidence |
| 7 | Atlas Continuity | Current-state projection and orchestration |
| 8 | Semantic Gravity | Loss-bounded compact transfer, retaining provenance |

## Policy tiers

- **Local:** Memory Witness + Continuity, plus the baseline Breathalyzer and local authority/admission controls.
- **Regional:** Working Memory, Memory Witness, Heartbeat, Continuity.
- **International:** all eight in canonical order, each producing a verifiable receipt. First failed or unavailable checkpoint stops screening, not unrelated work.

The crossing class is supplied by the host's policy. Geographic labels are metaphors for **handoff risk**, not actual geolocation or nationality profiling. An international-grade transfer can occur between neighbouring processes if its trust boundary warrants it. No identity, origin, nationality or payment tier grants exemption.

Implementation: `src/gundam-checkpoints.ts` and `tests/gundam-checkpoints.test.mjs`.

## Critical limitation

The checkpoint provider is an interface, not an installed runtime for the eight skills. A host must implement each evaluator using the canonical procedures and attach real receipts. The current pure-function runner validates checkpoint ordering, presence and failure handling; it cannot establish authenticity of a self-asserted receipt. The crossing service still separately requires peer authentication, Atlas authority, local admission and durable storage. Breathalyzer tests coherence of claims; it does not grant rights.

Next: bind actual skill evaluators to event journals, run integration fixtures across both cities, and verify against tampered and stale receipts before any live crossing.
