import { describe, expect, it } from "vitest";

import { createMatchSkeleton } from "@lunchtable/game-core";

describe("replay contract", () => {
  it("starts from a stable versioned snapshot", () => {
    const match = createMatchSkeleton();

    expect(match.version).toBe(0);
    expect(match.status).toBe("pending");
  });
});
