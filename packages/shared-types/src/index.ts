export const APP_NAME = "Lunch-Table";

export type MatchStatus = "pending" | "active" | "complete";

export interface MatchSkeleton {
  id: string;
  phase: "bootstrap";
  status: MatchStatus;
  version: number;
}
