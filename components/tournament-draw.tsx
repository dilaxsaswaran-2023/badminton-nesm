"use client";

import { FileWarning, LoaderCircle, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { loadTournamentData } from "../lib/csv";
import { createDrawResult, newSeed } from "../lib/draw";
import { loadDraws, saveDraws } from "../lib/storage";
import type { DrawResult, LoadedCategory } from "../lib/types";
import { ArchivalHeader } from "./archival-header";
import { CategoryIndex } from "./category-index";
import { DrawAnimation } from "./draw-animation";
import { DrawControls } from "./draw-controls";
import { EntrantLedger } from "./entrant-ledger";
import { KnockoutBracket } from "./knockout-bracket";
import { PrintDraw } from "./print-draw";

export function TournamentDraw() {
  const [categories, setCategories] = useState<LoadedCategory[]>([]);
  const [activeId, setActiveId] = useState("");
  const [draws, setDraws] = useState<Record<string, DrawResult>>(() => loadDraws());
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const storageReady = useRef(false);
  const [ceremonyActive, setCeremonyActive] = useState(false);
  const [drawTargets, setDrawTargets] = useState<string[]>([]);
  const [recentlyDrawn, setRecentlyDrawn] = useState("");

  useEffect(() => {
    loadTournamentData()
      .then((loaded) => {
        setCategories(loaded);
        setActiveId(loaded[0]?.category.id ?? "");
      })
      .catch((error: unknown) => {
        setLoadError(error instanceof Error ? error.message : "Tournament data could not be loaded.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (storageReady.current) {
      saveDraws(draws);
    } else {
      storageReady.current = true;
    }
  }, [draws]);

  const active = categories.find(({ category }) => category.id === activeId);
  const drawnIds = useMemo(() => new Set(Object.keys(draws)), [draws]);
  const hasRemaining = categories.some(
    ({ category, entrants, error }) => !draws[category.id] && entrants.length >= 2 && !error,
  );

  const beginCeremony = (targets: string[]) => {
    if (targets.length === 0) return;
    setDrawTargets(targets);
    setCeremonyActive(true);
  };

  const conductSelected = () => {
    if (!active || active.error || active.entrants.length < 2) return;
    if (
      draws[active.category.id] &&
      !window.confirm(
        `A published draw already exists for ${active.category.title}. Conduct a new draw and replace it?`,
      )
    ) return;
    beginCeremony([active.category.id]);
  };

  const conductAll = () => {
    beginCeremony(
      categories
        .filter(({ category, entrants, error }) => !draws[category.id] && entrants.length >= 2 && !error)
        .map(({ category }) => category.id),
    );
  };

  const finishCeremony = useCallback(() => {
    setDraws((current) => {
      const updated = { ...current };
      for (const id of drawTargets) {
        const loaded = categories.find(({ category }) => category.id === id);
        if (!loaded) continue;
        updated[id] = createDrawResult(id, loaded.category.shortTitle, loaded.entrants, newSeed());
      }
      return updated;
    });
    setRecentlyDrawn(drawTargets.length === 1 ? drawTargets[0] : activeId);
    setCeremonyActive(false);
    setDrawTargets([]);
  }, [activeId, categories, drawTargets]);

  const resetCategory = () => {
    if (!active || !draws[active.category.id]) return;
    if (!window.confirm(`Reset the official draw for ${active.category.title}?`)) return;
    setDraws((current) => {
      const updated = { ...current };
      delete updated[active.category.id];
      return updated;
    });
  };

  const resetAll = () => {
    if (!window.confirm("Reset every generated category draw? This cannot be undone.")) return;
    setDraws({});
  };

  if (loading) {
    return (
      <main className="loading-page">
        <div className="loading-ledger">
          <span className="monogram"><strong>N</strong></span>
          <LoaderCircle className="spin" aria-hidden="true" />
          <h1>Opening the official ledger</h1>
          <p>Verifying seven championship entry registers…</p>
        </div>
      </main>
    );
  }

  if (loadError || !active) {
    return (
      <main className="loading-page">
        <div className="fatal-error" role="alert">
          <FileWarning />
          <h1>The tournament ledger could not be opened</h1>
          <p>{loadError || "No categories were found."}</p>
          <button onClick={() => window.location.reload()}>Try again</button>
        </div>
      </main>
    );
  }

  const selectedDraw = draws[active.category.id];
  const animationEntrants =
    categories.find(({ category }) => category.id === (drawTargets[0] ?? activeId))?.entrants ?? active.entrants;

  return (
    <>
      <main className="site-shell">
        <div className="ledger-surface">
          <ArchivalHeader />
          <CategoryIndex categories={categories} activeId={activeId} drawnIds={drawnIds} onSelect={setActiveId} />

          <section className="workspace no-print" id="category-ledger" role="tabpanel">
            <div className="workspace-heading">
              <div>
                <p className="folio-line">Folio {String(categories.findIndex((item) => item.category.id === activeId) + 1).padStart(2, "0")}</p>
                <h2>{active.category.title}</h2>
                <p>{selectedDraw ? "The sealed knockout order is preserved below." : "Review the submitted field, then seal and conduct the draw."}</p>
              </div>
              <span className={`ledger-status ${selectedDraw ? "drawn" : "ready"}`}>
                <ShieldCheck size={15} />
                {selectedDraw ? `Official · ${selectedDraw.reference}` : "Register ready"}
              </span>
            </div>

            <DrawControls
              hasSelectedDraw={Boolean(selectedDraw)}
              hasAnyDraw={drawnIds.size > 0}
              hasRemaining={hasRemaining}
              busy={ceremonyActive}
              disabled={Boolean(active.error) || active.entrants.length < 2}
              onDraw={conductSelected}
              onDrawAll={conductAll}
              onPrint={() => window.print()}
              onResetCategory={resetCategory}
              onResetAll={resetAll}
            />

            {!selectedDraw && (
              <div className="pre-draw-layout">
                <EntrantLedger loaded={active} />
                <aside className="review-advisory">
                  <div className="advisory-heading">
                    <FileWarning size={18} />
                    <div><span>Clerk’s note</span><h3>Data review advisory</h3></div>
                  </div>
                  <p>Before publication, confirm the supplied spelling and identity notes:</p>
                  <ul>
                    <li><b>Brunthavan:</b> “PM.” appears in doubles; “M.” in singles.</li>
                    <li><b>Mixed entries:</b> initials vary for Keerthana, Venuja, Darmi and Thuvaaragan.</li>
                    <li><b>Possible matches:</b> Janarthan / B.Janarthanan and Rajika / T.Rajigaa.</li>
                  </ul>
                  <p className="advisory-foot">Submitted spellings are preserved. Keep entry IDs unchanged after publication.</p>
                </aside>
              </div>
            )}
          </section>

          {selectedDraw && (
            <div className="active-bracket">
              <KnockoutBracket category={active.category} result={selectedDraw} reveal={recentlyDrawn === active.category.id} />
            </div>
          )}
          <footer className="ledger-footer no-print">
            <span>NESM Championship Office</span><i aria-hidden="true" /><span>Official draw register · 2026</span>
          </footer>
        </div>
      </main>
      <DrawAnimation active={ceremonyActive} entrants={animationEntrants} onComplete={finishCeremony} />
      <PrintDraw categories={categories} draws={draws} />
    </>
  );
}
