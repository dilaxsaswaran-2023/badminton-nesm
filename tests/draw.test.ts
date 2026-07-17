import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseEntrants } from "../lib/csv";
import { createBracket, createDrawResult, nextPowerOfTwo, seededShuffle } from "../lib/draw";
import type { Category, Entrant } from "../lib/types";

function entrants(count: number): Entrant[] {
  return Array.from({ length: count }, (_, index) => ({
    entryId: `E${String(index + 1).padStart(2, "0")}`,
    player1: `Player ${index + 1}`,
    player2: "",
    status: "complete" as const,
    displayName: `Player ${index + 1}`,
  }));
}

describe("knockout draw logic", () => {
  it("validates every supplied category file", () => {
    const dataDirectory = join(process.cwd(), "public", "data");
    const categories = JSON.parse(
      readFileSync(join(dataDirectory, "categories.json"), "utf8"),
    ) as Category[];
    expect(categories).toHaveLength(7);
    const expectedCounts: Record<string, number> = {
      "mens-singles": 31,
      "mens-doubles": 16,
      "men-over-40-singles": 10,
      "men-over-40-doubles": 5,
      "womens-singles": 5,
      "womens-doubles": 5,
      "mixed-doubles": 11,
    };
    for (const category of categories) {
      const csv = readFileSync(join(process.cwd(), "public", category.file), "utf8");
      expect(parseEntrants(csv, category)).toHaveLength(expectedCounts[category.id]);
    }
  });

  it("calculates the next power of two", () => {
    expect(nextPowerOfTwo(31)).toBe(32);
  });

  it.each([
    [31, 32, 1],
    [16, 16, 0],
    [10, 16, 6],
    [5, 8, 3],
  ])("creates %i entrants as a %i-slot draw with %i byes", (count, size, byes) => {
    const draw = createBracket(entrants(count), 2026);
    expect(draw.bracketSize).toBe(size);
    expect(draw.byeCount).toBe(byes);
  });

  it("never creates a BYE versus BYE match", () => {
    const draw = createBracket(entrants(5), 12);
    for (const match of draw.rounds[0].matches) {
      expect(
        match.participant1.type === "bye" && match.participant2.type === "bye",
      ).toBe(false);
    }
  });

  it("places every entrant exactly once in round one", () => {
    const draw = createBracket(entrants(31), 55);
    const ids = draw.rounds[0].matches.flatMap((match) =>
      [match.participant1, match.participant2]
        .filter((slot) => slot.type === "entrant")
        .map((slot) => (slot.type === "entrant" ? slot.entryId : "")),
    );
    expect(ids).toHaveLength(31);
    expect(new Set(ids).size).toBe(31);
  });

  it("reproduces the same shuffle with the same seed", () => {
    expect(seededShuffle(entrants(12), 991)).toEqual(seededShuffle(entrants(12), 991));
  });

  it("allows different seeds to produce different orders", () => {
    const a = seededShuffle(entrants(12), 1).map((entry) => entry.entryId);
    const b = seededShuffle(entrants(12), 2).map((entry) => entry.entryId);
    expect(a).not.toEqual(b);
  });

  it("advances a bye recipient into round two", () => {
    const draw = createBracket(entrants(5), 441);
    const byeWinners = draw.rounds[0].matches
      .filter((match) => match.automaticAdvance)
      .map((match) => match.automaticAdvance);
    const roundTwoLabels = draw.rounds[1].matches.flatMap((match) => [
      match.participant1.label,
      match.participant2.label,
    ]);
    for (const winner of byeWinners) expect(roundTwoLabels).toContain(winner);
  });

  it("keeps Dilaxsaswaran in one of the final three first-round matches", () => {
    const field = entrants(30).concat({
      entryId: "MS016",
      player1: "Dilaxsaswaran",
      player2: "",
      status: "complete",
      displayName: "Dilaxsaswaran",
    });
    for (let seed = 1; seed <= 250; seed += 1) {
      const draw = createDrawResult("mens-singles", "MS", field, seed);
      const match = draw.rounds[0].matches.find((item) =>
        [item.participant1, item.participant2].some(
          (slot) => slot.type === "entrant" && slot.entryId === "MS016",
        ),
      );
      expect(["R1-M14", "R1-M15", "R1-M16"]).toContain(match?.id);
    }
  });

  it("gives Dilaxsaswaran an approximately 20% seeded chance of a bye", () => {
    const field = entrants(30).concat({
      entryId: "MS016",
      player1: "Dilaxsaswaran",
      player2: "",
      status: "complete",
      displayName: "Dilaxsaswaran",
    });
    let byes = 0;
    const samples = 5000;
    for (let seed = 1; seed <= samples; seed += 1) {
      const draw = createDrawResult("mens-singles", "MS", field, seed);
      const match = draw.rounds[0].matches.find((item) => item.automaticAdvance === "Dilaxsaswaran");
      if (match) byes += 1;
    }
    expect(byes / samples).toBeGreaterThan(0.18);
    expect(byes / samples).toBeLessThan(0.22);
  });

  it("retains a partner-pending label as one bracket position", () => {
    const category: Category = {
      id: "womens-doubles",
      title: "Women's Doubles",
      shortTitle: "WD",
      format: "doubles",
      file: "/data/womens-doubles.csv",
    };
    const parsed = parseEntrants(
      "entry_id,player_1,player_2,status\nWD001,S.Venuja,,partner_pending\nWD002,A,B,complete",
      category,
    );
    const draw = createBracket(parsed, 17);
    const labels = draw.rounds[0].matches.flatMap((match) => [
      match.participant1.label,
      match.participant2.label,
    ]);
    expect(labels).toContain("S.Venuja — Partner pending");
    expect(parsed).toHaveLength(2);
  });
});
