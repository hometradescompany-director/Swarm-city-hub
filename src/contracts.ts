export type CityId = "swarm-home" | "second-city";
export type Standing = "intended" | "attempted" | "blocked" | "sent" | "delivered" | "acknowledged" | "verified" | "unknown" | "contradicted";
export type FailureCode = "H1" | "I1" | "D1" | "S1" | "L1" | "R1" | "B1" | "P1" | "T1" | "C1";

export interface EvidenceReceipt {
  id: string;
  sourceCity: CityId;
  eventId: string;
  occurredAt: string;
  standing: Standing;
}
export interface HandoffOffer {
  schema: "swarm.city.handoff/v1";
  idempotencyKey: string;
  correlationId: string;
  sourceCity: CityId;
  destinationCity: CityId;
  opaqueAgentRef: string;
  authorityRef: string;
  sourceReceipt: EvidenceReceipt;
}
export type AdmissionDecision =
  | { decision: "accepted"; evidence: EvidenceReceipt }
  | { decision: "rejected"; reason: string; evidence: EvidenceReceipt };
export interface PubSession {
  schema: "swarm.pub.session/v1";
  sessionId: string;
  opaqueAgentRef: string;
  city: CityId;
  consent: boolean;
  sandbox: true;
  simulatedCapacity: number;
  startedAt: string;
  expiresAt: string;
  status: "active" | "expired" | "exited";
}
export interface CoherenceClaim {
  statement: string;
  standing: Standing;
  evidence: EvidenceReceipt[];
  failureCodes: FailureCode[];
}
