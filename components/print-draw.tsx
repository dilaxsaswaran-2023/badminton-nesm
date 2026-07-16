import type { DrawResult, LoadedCategory } from "../lib/types";
import { KnockoutBracket } from "./knockout-bracket";

interface Props {
  categories: LoadedCategory[];
  draws: Record<string, DrawResult>;
}

export function PrintDraw({ categories, draws }: Props) {
  const generated = categories.filter(({ category }) => draws[category.id]);
  return (
    <div className="print-only print-document" aria-hidden="true">
      {generated.map(({ category }) => (
        <article className="print-page" key={category.id}>
          <header className="print-title">
            <span className="print-monogram">N</span>
            <div>
              <p>Northern Eastern Sports Meet</p>
              <h1>NESM 2026 Badminton Championship</h1>
              <span>Official Knockout Draw Ledger</span>
            </div>
          </header>
          <KnockoutBracket category={category} result={draws[category.id]} printMode />
        </article>
      ))}
    </div>
  );
}
