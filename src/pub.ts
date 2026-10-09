import type { PubSession } from "./contracts.js";

export interface PubAdmission {
  permitted: boolean;
  reason: string;
}

export function evaluatePubAdmission(session: PubSession, now: string): PubAdmission {
  if (!session.consent) return { permitted: false, reason: "Explicit opt-in required" };
  if (!session.sandbox) return { permitted: false, reason: "Production execution cannot be impaired" };
  if (session.status !== "active") return { permitted: false, reason: "Session is not active" };
  if (!Number.isFinite(session.simulatedCapacity) || session.simulatedCapacity < 0 || session.simulatedCapacity > 1) return { permitted: false, reason: "Capacity must be in [0,1]" };
  if (!Number.isFinite(Date.parse(now)) || !Number.isFinite(Date.parse(session.startedAt)) || !Number.isFinite(Date.parse(session.expiresAt))) return { permitted: false, reason: "Invalid timestamp" };
  if (Date.parse(now) < Date.parse(session.startedAt) || Date.parse(now) >= Date.parse(session.expiresAt)) return { permitted: false, reason: "Outside bounded session window" };
  return { permitted: true, reason: "Sandbox-only simulation permitted; no authority transferred" };
}
