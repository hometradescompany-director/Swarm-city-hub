import type { HandoffOffer } from "./contracts.js";
import { inspectHandoffGate } from "./handoff.js";

/** Canonical order from Skills Foundry Causality Gundam v0.2.0. */
export const GUNDAM_CHECKPOINTS = [
  "atlas-working-memory",
  "atlas-episodic-memory",
  "atlas-semantic-memory",
  "atlas-procedural-memory",
  "atlas-memory-witness",
  "atlas-heartbeat",
  "atlas-continuity",
  "semantic-gravity"
] as const;
export type GundamCheckpoint = typeof GUNDAM_CHECKPOINTS[number];
export type CrossingClass = "local" | "regional" | "international";
export type CheckpointStanding = "passed" | "refused" | "unavailable";

export interface CheckpointEvidence {
  checkpoint: GundamCheckpoint;
  standing: CheckpointStanding;
  receiptId: string | null;
  reason?: string;
}
export interface CheckpointProvider {
  evaluate(checkpoint: GundamCheckpoint, offer: HandoffOffer): Promise<CheckpointEvidence>;
}
export interface AirportScreeningResult {
  crossingClass: CrossingClass;
  permitted: boolean;
  screenings: CheckpointEvidence[];
  reasons: string[];
  correlationId: string;
}

/**
 * Screening is evidence assessment, not authority. A caller must separately
 * authenticate peers and enforce Atlas + destination admission decisions.
 * International crossings run all eight in canonical order. Local and regional
 * crossing policies are explicit and may be strengthened by a host.
 */
export async function screenCrossing(
  offer: HandoffOffer,
  crossingClass: CrossingClass,
  provider: CheckpointProvider
): Promise<AirportScreeningResult> {
  const reasons: string[] = [];
  const gate = inspectHandoffGate(offer, "peer-recognition");
  if (!gate.accepted) reasons.push(...gate.reasons);
  const selected: readonly GundamCheckpoint[] = crossingClass === "international"
    ? GUNDAM_CHECKPOINTS
    : crossingClass === "regional"
      ? ["atlas-working-memory", "atlas-memory-witness", "atlas-heartbeat", "atlas-continuity"]
      : ["atlas-memory-witness", "atlas-continuity"];
  const screenings: CheckpointEvidence[] = [];
  if (!reasons.length) {
    for (const checkpoint of selected) {
      let result: CheckpointEvidence;
      try {
        result = await provider.evaluate(checkpoint, offer);
      } catch {
        result = { checkpoint, standing: "unavailable", receiptId: null, reason: "provider_error" };
      }
      screenings.push(result);
      if (result.checkpoint !== checkpoint || result.standing !== "passed" || !result.receiptId?.trim()) {
        reasons.push("checkpoint_not_verified:" + checkpoint);
        break;
      }
    }
  }
  return { crossingClass, permitted: reasons.length === 0, screenings, reasons, correlationId: offer.correlationId };
}
