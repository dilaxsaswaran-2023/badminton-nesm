import type { DrawResult } from "./types";

const STORAGE_KEY = "nesm-2026-draws-v1";

export function loadDraws(): Record<string, DrawResult> {
  if (typeof window === "undefined") return {};
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value ? (JSON.parse(value) as Record<string, DrawResult>) : {};
  } catch {
    return {};
  }
}

export function saveDraws(draws: Record<string, DrawResult>): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draws));
}
