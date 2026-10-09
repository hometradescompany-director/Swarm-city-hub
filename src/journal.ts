import { projectResidence, type ResidenceEvent } from "./residence.js";

export interface ResidenceJournal {
  append(event: ResidenceEvent, expectedLastEventId: string | null): Promise<void>;
  forResidence(residenceId: string): Promise<readonly ResidenceEvent[]>;
}
export class InMemoryResidenceJournal implements ResidenceJournal {
  private readonly events: ResidenceEvent[] = [];
  async forResidence(residenceId: string): Promise<readonly ResidenceEvent[]> {
    return this.events.filter(event => event.residenceId === residenceId).map(event => ({ ...event, evidenceReceiptIds: [...event.evidenceReceiptIds] }));
  }
  async append(event: ResidenceEvent, expectedLastEventId: string | null): Promise<void> {
    if (this.events.some(previous => previous.id === event.id)) throw Error("duplicate_event");
    const history = await this.forResidence(event.residenceId);
    const last = history.at(-1)?.id ?? null;
    if (last !== expectedLastEventId || event.previousEventId !== expectedLastEventId) throw Error("stale_or_broken_predecessor");
    projectResidence([...history, event]);
    this.events.push({ ...event, evidenceReceiptIds: [...event.evidenceReceiptIds] });
  }
}
