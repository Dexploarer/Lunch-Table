import { describe, expect, it } from "vitest";

import { createMatchSkeleton } from "./index";

describe("createMatchSkeleton", () => {
  it("creates a deterministic bootstrap state", () => {
    expect(createMatchSkeleton()).toEqual({
      activeSeat: null,
      completedAt: null,
      createdAt: 0,
      format: {
        boardModel: "openBoard",
        deckRules: {
          maxCopies: 4,
          minCards: 40,
          sideboardSize: 15,
        },
        id: "core-demo",
        name: "Core Demo",
        resourceModel: "manaCurve",
        timingModel: "fullStack",
        turnModel: "alternating",
        version: "0.0.1",
        victoryModel: "lifeTotal",
      },
      id: "bootstrap-match",
      lastEventNumber: 0,
      phase: "bootstrap",
      prioritySeat: null,
      seats: [
        {
          actorType: "human",
          connected: false,
          deckCount: 0,
          graveyardCount: 0,
          handCount: 0,
          lifeTotal: 20,
          ready: false,
          resourceTotal: 0,
          seat: "seat-0",
          status: "joining",
          userId: null,
          username: null,
          walletAddress: null,
        },
        {
          actorType: "human",
          connected: false,
          deckCount: 0,
          graveyardCount: 0,
          handCount: 0,
          lifeTotal: 20,
          ready: false,
          resourceTotal: 0,
          seat: "seat-1",
          status: "joining",
          userId: null,
          username: null,
          walletAddress: null,
        },
      ],
      spectatorCount: 0,
      startedAt: null,
      status: "pending",
      timers: {
        activeDeadlineAt: null,
        ropeDeadlineAt: null,
        seatTimeRemainingMs: {},
        turnStartedAt: null,
      },
      turnNumber: 0,
      version: 0,
      winnerSeat: null,
    });
  });
});
