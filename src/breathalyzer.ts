import type { CoherenceClaim, FailureCode, Standing } from "./contracts";

export interface BreathalyzerResult {
  coherent: boolean;
  reviewRequired: boolean;
  failures: FailureCode[];
  reason: string;
}

const completed: ReadonlySet<Standing> = new Set(["sent", "delivered", "acknowledged", "verified"]);
const evidenceRequired: ReadonlySet<Standing> = new Set(["sent", "delivered", "acknowledged", "verified"]);

export function inspectClaim(claim: CoherenceClaim): BreathalyzerResult {
  const failures = new Set<FailureCode>(claim.failureCodes);
  if (evidenceRequired.has(claim.standing) && claim.evidence.length === 0) failures.add("I1");
  if (claim.standing === "verified" && !claim.evidence.some(e => e.standing === "verified")) failures.add("P1");
  if (claim.evidence.some(e => e.standing === "contradicted")) failures.add("H1");
  const reviewRequired = failures.size > 0 || claim.standing === "contradicted";
  return {
    coherent: !reviewRequired,
    reviewRequired,
    failures: [...failures],
    reason: reviewRequired ? "Review claim against authoritative receipts before reporting completion." : completed.has(claim.standing) ? "Claim has receipts; external outcome still requires independent verification." : "No immediate contradiction; claim remains at its stated maturity."
  };
}
