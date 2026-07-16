import Papa from "papaparse";
import type { Category, Entrant, EntryStatus, LoadedCategory } from "./types";

interface CsvRow {
  entry_id?: string;
  player_1?: string;
  player_2?: string;
  status?: string;
}

function clean(value: string | undefined): string {
  return value?.trim() ?? "";
}

export function parseEntrants(csv: string, category: Category): Entrant[] {
  const parsed = Papa.parse<CsvRow>(csv, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (header) => header.trim(),
  });
  if (parsed.errors.length > 0) {
    throw new Error(parsed.errors[0].message);
  }

  const seen = new Set<string>();
  return parsed.data.map((row, index) => {
    const entryId = clean(row.entry_id);
    const player1 = clean(row.player_1);
    const player2 = clean(row.player_2);
    const statusText = clean(row.status);
    if (!entryId || !player1) {
      throw new Error(`Row ${index + 2} is missing entry_id or player_1.`);
    }
    if (seen.has(entryId)) {
      throw new Error(`Duplicate entry ID: ${entryId}.`);
    }
    if (statusText !== "complete" && statusText !== "partner_pending") {
      throw new Error(`Row ${index + 2} has an invalid status.`);
    }
    seen.add(entryId);
    const status = statusText as EntryStatus;
    const displayName =
      category.format === "singles"
        ? player1
        : status === "partner_pending"
          ? `${player1} — Partner pending`
          : `${player1} & ${player2}`;
    return { entryId, player1, player2, status, displayName };
  });
}

export async function loadTournamentData(): Promise<LoadedCategory[]> {
  const categoryResponse = await fetch("/data/categories.json");
  if (!categoryResponse.ok) throw new Error("Categories could not be loaded.");
  const categories = (await categoryResponse.json()) as Category[];
  return Promise.all(
    categories.map(async (category) => {
      try {
        const response = await fetch(category.file);
        if (!response.ok) throw new Error(`File returned ${response.status}.`);
        const entrants = parseEntrants(await response.text(), category);
        if (entrants.length === 0) throw new Error("No entrants were found.");
        return { category, entrants };
      } catch (error) {
        return {
          category,
          entrants: [],
          error: error instanceof Error ? error.message : "Invalid entrant file.",
        };
      }
    }),
  );
}
