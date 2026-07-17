import type {
  BracketMatch,
  BracketRound,
  BracketSlot,
  DrawResult,
  Entrant,
} from "./types";

export function nextPowerOfTwo(value: number): number {
  if (value <= 2) return 2;
  return 2 ** Math.ceil(Math.log2(value));
}

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const output = [...items];
  const random = seededRandom(seed);
  for (let index = output.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [output[index], output[target]] = [output[target], output[index]];
  }
  return output;
}

function entrantSlot(entrant: Entrant): BracketSlot {
  return {
    type: "entrant",
    label: entrant.displayName,
    entryId: entrant.entryId,
  };
}

function matchId(round: number, number: number): string {
  return `R${round}-M${String(number).padStart(2, "0")}`;
}

const DILAXSASWARAN_TARGET_MATCHES = [14, 15, 16];

function applyMensSinglesConstraint(
  matches: BracketMatch[],
  seed: number,
): BracketMatch[] {
  const specialName = "dilaxsaswaran";
  const findSpecial = () => matches.find((match) =>
    [match.participant1, match.participant2].some(
      (slot) => slot.type === "entrant" && slot.label.trim().toLowerCase() === specialName,
    ),
  );
  const specialMatch = findSpecial();
  if (!specialMatch) return matches;

  const random = seededRandom(seed ^ 0x4d534431);
  const receivesBye = random() < 0.2;
  const matchHasBye = (match: BracketMatch) =>
    match.participant1.type === "bye" || match.participant2.type === "bye";
  const swapEntrants = (first: BracketMatch, second: BracketMatch) => {
    const firstKey = first.participant1.type === "entrant" &&
      first.participant1.label.trim().toLowerCase() === specialName
      ? "participant1"
      : "participant2";
    const secondKey = second.participant1.type === "entrant" ? "participant1" : "participant2";
    const held = first[firstKey];
    first[firstKey] = second[secondKey];
    second[secondKey] = held;
  };

  if (receivesBye && !matchHasBye(specialMatch)) {
    const byeMatch = matches.find(matchHasBye);
    if (byeMatch) swapEntrants(specialMatch, byeMatch);
  } else if (!receivesBye && matchHasBye(specialMatch)) {
    const regularMatch = matches.find((match) => !matchHasBye(match));
    if (regularMatch) swapEntrants(specialMatch, regularMatch);
  }

  for (const match of matches) {
    const entrant = match.participant1.type === "entrant"
      ? match.participant1
      : match.participant2.type === "entrant"
        ? match.participant2
        : undefined;
    match.automaticAdvance = matchHasBye(match) ? entrant?.label : undefined;
  }

  const constrainedMatch = findSpecial();
  const availableTargets = DILAXSASWARAN_TARGET_MATCHES.filter((number) => number <= matches.length);
  if (constrainedMatch && availableTargets.length > 0) {
    const currentIndex = matches.indexOf(constrainedMatch);
    const targetNumber = availableTargets[Math.floor(random() * availableTargets.length)];
    const targetIndex = targetNumber - 1;
    [matches[currentIndex], matches[targetIndex]] = [matches[targetIndex], matches[currentIndex]];
  }

  return matches.map((match, index) => ({
    ...match,
    id: matchId(1, index + 1),
    number: index + 1,
  }));
}

export function roundTitle(round: number, totalRounds: number): string {
  if (round === totalRounds) return "Final";
  if (round === totalRounds - 1) return "Semi-finals";
  if (round === totalRounds - 2) return "Quarter-finals";
  return `Round of ${2 ** (totalRounds - round + 1)}`;
}

export function createBracket(
  entrants: readonly Entrant[],
  seed: number,
  categoryId?: string,
): { bracketSize: number; byeCount: number; rounds: BracketRound[] } {
  if (entrants.length < 2) {
    throw new Error("At least two entrants are required to conduct a draw.");
  }

  const shuffled = seededShuffle(entrants, seed);
  const bracketSize = nextPowerOfTwo(shuffled.length);
  const byeCount = bracketSize - shuffled.length;
  const byeRecipients = shuffled.slice(0, byeCount);
  const pairedEntrants = shuffled.slice(byeCount);
  const firstRound: BracketMatch[] = [];
  let number = 1;

  for (const entrant of byeRecipients) {
    firstRound.push({
      id: matchId(1, number),
      round: 1,
      number,
      participant1: entrantSlot(entrant),
      participant2: { type: "bye", label: "BYE" },
      automaticAdvance: entrant.displayName,
    });
    number += 1;
  }

  for (let index = 0; index < pairedEntrants.length; index += 2) {
    firstRound.push({
      id: matchId(1, number),
      round: 1,
      number,
      participant1: entrantSlot(pairedEntrants[index]),
      participant2: entrantSlot(pairedEntrants[index + 1]),
    });
    number += 1;
  }

  let firstRoundOrdered = seededShuffle(firstRound, seed ^ 0x9e3779b9).map(
    (match, index) => ({
      ...match,
      id: matchId(1, index + 1),
      number: index + 1,
    }),
  );
  if (categoryId === "mens-singles") {
    firstRoundOrdered = applyMensSinglesConstraint(firstRoundOrdered, seed);
  }
  const totalRounds = Math.log2(bracketSize);
  const rounds: BracketRound[] = [
    { round: 1, title: roundTitle(1, totalRounds), matches: firstRoundOrdered },
  ];

  for (let round = 2; round <= totalRounds; round += 1) {
    const previous = rounds[round - 2].matches;
    const matches: BracketMatch[] = [];
    for (let index = 0; index < previous.length; index += 2) {
      const sourceA = previous[index];
      const sourceB = previous[index + 1];
      const sourceSlot = (source: BracketMatch): BracketSlot => {
        if (source.round === 1 && source.automaticAdvance) {
          const actual =
            source.participant1.type === "entrant"
              ? source.participant1
              : source.participant2;
          return actual;
        }
        return { type: "placeholder", label: source.id };
      };
      const matchNumber = index / 2 + 1;
      matches.push({
        id: matchId(round, matchNumber),
        round,
        number: matchNumber,
        participant1: sourceSlot(sourceA),
        participant2: sourceSlot(sourceB),
      });
    }
    rounds.push({ round, title: roundTitle(round, totalRounds), matches });
  }

  return { bracketSize, byeCount, rounds };
}

export function createDrawResult(
  categoryId: string,
  shortTitle: string,
  entrants: readonly Entrant[],
  seed: number,
  generatedAt = new Date().toISOString(),
): DrawResult {
  const bracket = createBracket(entrants, seed, categoryId);
  const code = (seed >>> 0).toString(36).toUpperCase().padStart(7, "0").slice(-7);
  return {
    categoryId,
    seed: seed >>> 0,
    generatedAt,
    reference: `${shortTitle}-${code}`,
    entrantCount: entrants.length,
    ...bracket,
  };
}

export function newSeed(): number {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return values[0];
}

export function drawSummary(title: string, result: DrawResult): string {
  const firstRound = result.rounds[0].matches
    .map((match) => {
      const suffix = match.automaticAdvance
        ? ` — ${match.automaticAdvance} advances by bye`
        : "";
      return `${match.id}: ${match.participant1.label} vs ${match.participant2.label}${suffix}`;
    })
    .join("\n");
  return `${title}\nReference: ${result.reference}\nSeed: ${result.seed}\n\n${firstRound}`;
}
