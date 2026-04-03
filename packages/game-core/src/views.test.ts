import type { MatchEvent } from "@lunchtable/shared-types";
import { describe, expect, it } from "vitest";

import { createGameState } from "./engine";
import { createSeatView, createSpectatorView } from "./views";

function createMatchCreatedEvent(
  matchId: string,
): Extract<MatchEvent, { kind: "matchCreated" }> {
  return {
    at: 0,
    eventId: "event_1",
    kind: "matchCreated",
    matchId,
    payload: {
      shell: createGameState({ matchId }).shell,
    },
    sequence: 1,
    stateVersion: 1,
  };
}

describe("match view projections", () => {
  it("keeps private deck order visible only to the owning seat", () => {
    const state = createGameState({
      matchId: "match_test",
      seatActors: [
        {
          seat: "seat-0",
          username: "alpha",
        },
        {
          seat: "seat-1",
          username: "beta",
        },
      ],
    });

    state.seats["seat-0"].deck = [
      "seat-0:archive-apprentice:deck:1",
      "seat-0:ember-summoner:deck:2",
    ];
    state.seats["seat-1"].deck = ["seat-1:mirror-warden:deck:1"];
    state.shell.seats = state.shell.seats.map((seat) =>
      seat.seat === "seat-0"
        ? { ...seat, deckCount: 2, username: "alpha" }
        : { ...seat, deckCount: 1, username: "beta" },
    );

    const seatView = createSeatView(state, "seat-0", [
      createMatchCreatedEvent(state.shell.id),
    ]);
    const spectatorView = createSpectatorView(state, [
      createMatchCreatedEvent(state.shell.id),
    ]);

    const ownDeck = seatView.zones.find(
      (zone) => zone.ownerSeat === "seat-0" && zone.zone === "deck",
    );
    const opposingDeck = seatView.zones.find(
      (zone) => zone.ownerSeat === "seat-1" && zone.zone === "deck",
    );
    const spectatorDeck = spectatorView.zones.find(
      (zone) => zone.ownerSeat === "seat-0" && zone.zone === "deck",
    );

    expect(ownDeck?.cards).toHaveLength(2);
    expect(ownDeck?.cardCount).toBe(2);
    expect(opposingDeck?.cards).toHaveLength(0);
    expect(opposingDeck?.cardCount).toBe(1);
    expect(spectatorDeck?.cards).toHaveLength(0);
    expect(spectatorDeck?.cardCount).toBe(2);
  });

  it("limits spectator actions while preserving recent event summaries", () => {
    const state = createGameState({
      matchId: "match_test",
    });
    const spectatorView = createSpectatorView(state, [
      createMatchCreatedEvent(state.shell.id),
    ]);

    expect(spectatorView.availableIntents).toEqual([]);
    expect(spectatorView.prompt).toBeNull();
    expect(spectatorView.recentEvents).toEqual([
      {
        kind: "matchCreated",
        label: "Match created",
        seat: null,
        sequence: 1,
      },
    ]);
  });
});
