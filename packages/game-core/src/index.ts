import type { MatchSkeleton } from "@lunchtable/shared-types";

export function createMatchSkeleton(): MatchSkeleton {
  return {
    id: "bootstrap-match",
    phase: "bootstrap",
    status: "pending",
    version: 0,
  };
}
