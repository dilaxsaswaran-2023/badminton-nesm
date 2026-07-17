import { Check, Copy, ScrollText } from "lucide-react";
import { motion } from "motion/react";
import { useState, type CSSProperties } from "react";
import { drawSummary } from "../lib/draw";
import type { BracketMatch, BracketSlot, Category, DrawResult } from "../lib/types";

function Slot({ slot }: { slot: BracketSlot }) {
  return (
    <span className={`match-slot ${slot.type}`}>
      <span>{slot.label}</span>
      {slot.type === "bye" && <small>automatic passage</small>}
    </span>
  );
}

function MatchCard({
  match,
  roundIndex,
  matchIndex,
  reveal,
}: {
  match: BracketMatch;
  roundIndex: number;
  matchIndex: number;
  reveal: boolean;
}) {
  return (
    <motion.article
      className={`match-card ${roundIndex > 0 ? "has-incoming" : ""}`}
      aria-label={`${match.id}: ${match.participant1.label} versus ${match.participant2.label}`}
      initial={reveal ? { opacity: 0, scale: 0.98, y: 4 } : false}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: Math.min(matchIndex * 0.055, 0.7), duration: 0.28 }}
    >
      <div className="match-label">
        <span>{match.id}</span>
        {match.automaticAdvance && <em>Bye awarded</em>}
      </div>
      <Slot slot={match.participant1} />
      <Slot slot={match.participant2} />
      {match.automaticAdvance && (
        <div className="advance-note">Advances: {match.automaticAdvance}</div>
      )}
    </motion.article>
  );
}

interface Props {
  category: Category;
  result: DrawResult;
  printMode?: boolean;
  reveal?: boolean;
}

export function KnockoutBracket({ category, result, printMode = false, reveal = false }: Props) {
  const [copied, setCopied] = useState(false);
  const generated = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(result.generatedAt));
  const bracketStyle = {
    "--first-round-count": result.rounds[0].matches.length,
    "--round-count": result.rounds.length,
  } as CSSProperties;

  const copy = async () => {
    await navigator.clipboard.writeText(drawSummary(category.title, result));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section className={`bracket-result ${printMode ? "print-bracket" : ""}`} aria-labelledby={`bracket-${category.id}`}>
      <div className="bracket-document-head">
        <div>
          <p className="overline">Official category draw</p>
          <h2 id={`bracket-${category.id}`}>{category.title}</h2>
          <p className="generated-line">Generated {generated}</p>
        </div>
        <dl className="draw-metadata">
          <div><dt>Reference</dt><dd>{result.reference}</dd></div>
          <div><dt>Seed</dt><dd>{result.seed}</dd></div>
          <div><dt>Entrants</dt><dd>{result.entrantCount}</dd></div>
          <div><dt>Byes</dt><dd>{result.byeCount}</dd></div>
        </dl>
        <div className="official-seal" aria-label="Official draw seal">
          <span>NESM</span>
          <strong>Official</strong>
          <small>DRAW · 2026</small>
        </div>
      </div>

      {!printMode && (
        <div className="bracket-toolbar no-print">
          <p><ScrollText size={15} /> Scroll across to inspect every round</p>
          <button type="button" onClick={copy}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Summary copied" : "Copy draw summary"}
          </button>
        </div>
      )}

      <div className="bracket-scroll" tabIndex={0} aria-label={`${category.title} knockout bracket`}>
        <div className="bracket-grid" style={bracketStyle}>
          {result.rounds.map((round, roundIndex) => {
            const span = 2 ** roundIndex;
            return (
              <section className="round-column" key={round.round} aria-labelledby={`${category.id}-round-${round.round}`}>
                <h3 id={`${category.id}-round-${round.round}`}>{round.title}</h3>
                <div className="round-matches">
                  {round.matches.map((match, matchIndex) => {
                    const position = 1 + matchIndex * span;
                    return (
                      <div
                        className="match-position"
                        key={match.id}
                        style={{ gridRow: `${position} / span ${span}` }}
                      >
                        <MatchCard
                          match={match}
                          roundIndex={roundIndex}
                          matchIndex={matchIndex}
                          reveal={reveal && roundIndex === 0}
                        />
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
</section>
  );
}
