import { describe, expect, it } from "vitest";

import { createMatchSkeleton } from "./index";

describe("createMatchSkeleton", () => {
  it("creates a deterministic bootstrap state", () => {
    expect(createMatchSkeleton()).toEqual({
      id: "bootstrap-match",
      phase: "bootstrap",
      status: "pending",
      version: 0,
    });
  });
});
