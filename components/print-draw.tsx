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
        <article className={`print-page print-page--${category.id}`} key={category.id}>
          <KnockoutBracket category={category} result={draws[category.id]} printMode />
        </article>
      ))}
    </div>
  );
}
