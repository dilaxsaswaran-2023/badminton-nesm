import { Check, CircleDashed, Users } from "lucide-react";
import type { LoadedCategory } from "../lib/types";

interface Props {
  categories: LoadedCategory[];
  activeId: string;
  drawnIds: Set<string>;
  onSelect: (id: string) => void;
}

export function CategoryIndex({ categories, activeId, drawnIds, onSelect }: Props) {
  return (
    <nav className="category-index no-print" aria-label="Tournament categories">
      <div className="section-label">
        <span>Index of events</span>
        <small>Select a ledger</small>
      </div>
      <div className="category-tabs" role="tablist" aria-label="Draw categories">
        {categories.map(({ category, entrants, error }, index) => {
          const isDrawn = drawnIds.has(category.id);
          return (
            <button
              key={category.id}
              type="button"
              role="tab"
              aria-selected={activeId === category.id}
              aria-controls="category-ledger"
              className={`category-tab ${activeId === category.id ? "active" : ""}`}
              onClick={() => onSelect(category.id)}
            >
              <span className="tab-number">{String(index + 1).padStart(2, "0")}</span>
              <span className="tab-copy">
                <strong>{category.title}</strong>
                <small>
                  <Users size={12} aria-hidden="true" /> {entrants.length} entrants
                </small>
              </span>
              <span className={`tab-state ${isDrawn ? "complete" : "pending"}`}>
                {isDrawn ? <Check size={13} /> : <CircleDashed size={13} />}
                {error ? "Error" : isDrawn ? "Drawn" : "Pending"}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
