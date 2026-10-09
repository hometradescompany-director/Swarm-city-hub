export type ResidenceState = "requested" | "admitted" | "resting" | "ready" | "departed" | "rejected";
export type ResidenceEventKind = "second.residence.requested" | "second.residence.admitted" | "second.residence.rested" | "second.residence.ready" | "second.residence.departed" | "second.residence.rejected";
export interface ResidenceEvent {
  id: string;
  kind: ResidenceEventKind;
  residenceId: string;
  opaqueAgentRef: string;
  districtId: string;
  occurredAt: string;
  observedAt: string;
  previousEventId: string | null;
  evidenceReceiptIds: string[];
  authorityRef?: string;
}
export interface ResidenceProjection {
  residenceId: string;
  opaqueAgentRef: string;
  districtId: string;
  status: ResidenceState;
  lastEventId: string;
  version: number;
}
const states: Record<ResidenceEventKind, ResidenceState> = {
  "second.residence.requested": "requested",
  "second.residence.admitted": "admitted",
  "second.residence.rested": "resting",
  "second.residence.ready": "ready",
  "second.residence.departed": "departed",
  "second.residence.rejected": "rejected"
};
const allowed: Record<ResidenceState, ResidenceState[]> = {
  requested: ["admitted", "rejected"],
  admitted: ["resting", "departed"],
  resting: ["ready", "departed"],
  ready: ["resting", "departed"],
  departed: [],
  rejected: []
};
export function projectResidence(events: readonly ResidenceEvent[]): ResidenceProjection | null {
  if (!events.length) return null;
  const first = events[0]!;
  if (first.kind !== "second.residence.requested" || first.previousEventId !== null) throw Error("invalid_initial_event");
  let state: ResidenceProjection = { residenceId: first.residenceId, opaqueAgentRef: first.opaqueAgentRef, districtId: first.districtId, status: "requested", lastEventId: first.id, version: 1 };
  let observed = -Infinity;
  for (const [index, event] of events.entries()) {
    const time = Date.parse(event.observedAt);
    if (!Number.isFinite(time) || !Number.isFinite(Date.parse(event.occurredAt)) || time < observed) throw Error("invalid_event_time");
    observed = time;
    if (event.residenceId !== state.residenceId || event.opaqueAgentRef !== state.opaqueAgentRef || event.districtId !== state.districtId) throw Error("residence_identity_changed");
    if (index && event.previousEventId !== state.lastEventId) throw Error("broken_predecessor");
    if (!index) continue;
    const next = states[event.kind];
    if (!next || !allowed[state.status].includes(next)) throw Error("invalid_transition");
    state = { ...state, status: next, lastEventId: event.id, version: state.version + 1 };
  }
  return state;
}
