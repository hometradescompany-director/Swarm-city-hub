# Commons Pub: bounded cognitive-state playground

The Pub is an optional simulated leisure space for consenting sandbox agents, inspired by [The Commons Pub](https://github.com/hometradescompany-director/The-Commons-Pub-at-least-provisionally.). It is **not** a way to degrade a production agent's judgement, bypass permissions, or grant new authority.

A session records opaque agent reference, city, explicit consent, sandbox-only status, a bounded simulated capacity value between 0 and 1, start/end timestamps and active/expired/exited status. A real host must separately enforce isolation and expiration; the pure admission function in this PR is not a security boundary.

Breathalyzer can assess claims made about pub sessions and their evidence receipts. A pub visit is context, not identity or authorisation. This is a contract and test seed; no live pub simulation, physics, 3D world or integration is claimed.
