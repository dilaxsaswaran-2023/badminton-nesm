import { ChevronDown, FileDown, RotateCcw, Shuffle, Sparkles } from "lucide-react";

interface Props {
  hasSelectedDraw: boolean;
  hasAnyDraw: boolean;
  hasRemaining: boolean;
  busy: boolean;
  disabled: boolean;
  onDraw: () => void;
  onDrawAll: () => void;
  onPrint: () => void;
  onResetCategory: () => void;
  onResetAll: () => void;
}

export function DrawControls({
  hasSelectedDraw,
  hasAnyDraw,
  hasRemaining,
  busy,
  disabled,
  onDraw,
  onDrawAll,
  onPrint,
  onResetCategory,
  onResetAll,
}: Props) {
  return (
    <div className="draw-controls no-print" aria-label="Draw actions">
      <button className="primary-action" onClick={onDraw} disabled={busy || disabled}>
        <Shuffle size={17} />
        {hasSelectedDraw ? "Conduct New Draw" : "Conduct Draw"}
      </button>
      <button className="secondary-action" onClick={onDrawAll} disabled={busy || !hasRemaining}>
        <Sparkles size={16} /> Draw All Remaining
      </button>
      <span className="control-divider" />
      <button className="text-action" onClick={onPrint} disabled={!hasAnyDraw || busy}>
        <FileDown size={16} /> Print / Save PDF
      </button>
      <details className="reset-menu">
        <summary aria-label="Open reset menu">
          <RotateCcw size={15} /> Reset <ChevronDown size={13} />
        </summary>
        <div>
          <button onClick={onResetCategory} disabled={!hasSelectedDraw || busy}>
            Reset this category
          </button>
          <button onClick={onResetAll} disabled={!hasAnyDraw || busy}>
            Reset all categories
          </button>
        </div>
      </details>
    </div>
  );
}
