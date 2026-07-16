import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { LoadedCategory } from "../lib/types";

export function EntrantLedger({ loaded }: { loaded: LoadedCategory }) {
  if (loaded.error) {
    return (
      <section className="error-panel" role="alert">
        <AlertTriangle aria-hidden="true" />
        <div>
          <h2>Entry ledger unavailable</h2>
          <p>{loaded.error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="entrant-ledger" aria-labelledby="entrant-heading">
      <div className="ledger-heading-row">
        <div>
          <p className="overline">Verified entry register</p>
          <h2 id="entrant-heading">Entrants awaiting the draw</h2>
        </div>
        <div className="load-state">
          <CheckCircle2 size={16} aria-hidden="true" />
          Source data loaded · {loaded.entrants.length} records
        </div>
      </div>
      <ol className="entry-list">
        {loaded.entrants.map((entrant, index) => (
          <li key={entrant.entryId}>
            <span className="entry-number">{String(index + 1).padStart(2, "0")}</span>
            <span className="entry-name">
              {entrant.status === "partner_pending"
                ? entrant.player1
                : entrant.displayName}
            </span>
            {entrant.status === "partner_pending" && (
              <span className="pending-label">Partner pending</span>
            )}
            <span className="entry-id">{entrant.entryId}</span>
          </li>
        ))}
      </ol>
      <p className="ledger-note">
        Entries are sealed in their submitted form. A partner-pending record remains one
        valid position in the official draw.
      </p>
    </section>
  );
}
