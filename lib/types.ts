export type EntryStatus = "complete" | "partner_pending";

export interface Category {
  id: string;
  title: string;
  shortTitle: string;
  format: "singles" | "doubles";
  file: string;
}

export interface Entrant {
  entryId: string;
  player1: string;
  player2: string;
  status: EntryStatus;
  displayName: string;
}

export type BracketSlot =
  | { type: "entrant"; label: string; entryId: string }
  | { type: "bye"; label: "BYE" }
  | { type: "placeholder"; label: string };

export interface BracketMatch {
  id: string;
  round: number;
  number: number;
  participant1: BracketSlot;
  participant2: BracketSlot;
  automaticAdvance?: string;
}

export interface BracketRound {
  round: number;
  title: string;
  matches: BracketMatch[];
}

export interface DrawResult {
  categoryId: string;
  seed: number;
  generatedAt: string;
  reference: string;
  entrantCount: number;
  byeCount: number;
  bracketSize: number;
  rounds: BracketRound[];
}

export interface LoadedCategory {
  category: Category;
  entrants: Entrant[];
  error?: string;
}
