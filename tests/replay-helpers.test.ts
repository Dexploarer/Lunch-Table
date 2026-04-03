import { starterFormat } from "@lunchtable/card-content";
import { describe, expect, it } from "vitest";

import {
  buildPersistedIntentResult,
  buildPersistedMatchBundle,
} from "../convex/lib/matches";
import {
  appendReplayFrame,
  buildReplaySummary,
  createReplayFrame,
  selectReplayAnchorEvent,
} from "../convex/lib/replays";

function createBundle() {
  return buildPersistedMatchBundle({
    activeSeat: "seat-0",
    createdAt: Date.UTC(2026, 3, 3, 12, 0, 0),
    format: starterFormat,
    matchId: "match_replay_1",
    participants: [
      {
        actorType: "human",
        deck: {
          mainboard: starterFormat.cardPool.map((card) => ({
            cardId: card.id,
            count: starterFormat.deckRules.maxCopies,
          })),
          sideboard: [],
        },
        seat: "seat-0",
        userId: "user_host" as never,
        username: "host",
        walletAddress: "0x1111111111111111111111111111111111111111",
      },
      {
        actorType: "human",
        deck: {
          mainboard: starterFormat.cardPool.map((card) => ({
            cardId: card.id,
            count: starterFormat.deckRules.maxCopies,
          })),
          sideboard: [],
        },
        seat: "seat-1",
        userId: "user_guest" as never,
        username: "guest",
        walletAddress: "0x2222222222222222222222222222222222222222",
      },
    ],
    startedAt: Date.UTC(2026, 3, 3, 12, 0, 0),
    status: "active",
    turnNumber: 1,
  });
}

describe("replay helpers", () => {
  it("creates a spectator-safe seed frame and summary", () => {
    const bundle = createBundle();
    const initialFrame = createReplayFrame({
      event: bundle.events[0] ?? null,
      fallbackLabel: "Match created",
      frameIndex: 0,
      recordedAt: bundle.shell.createdAt,
      view: bundle.spectatorView,
    });

    const summary = buildReplaySummary({
      completedAt: bundle.shell.completedAt ?? null,
      createdAt: bundle.shell.createdAt,
      formatId: starterFormat.formatId,
      frames: [initialFrame],
      matchId: bundle.shell.id,
      ownerUserId: "user_host" as never,
      status: bundle.shell.status,
      updatedAt: bundle.shell.createdAt,
      winnerSeat: bundle.shell.winnerSeat ?? null,
    });

    expect(initialFrame.eventKind).toBe("matchCreated");
    expect(initialFrame.view.kind).toBe("spectator");
    expect(
      initialFrame.view.zones.find((zone) => zone.zone === "deck")?.cards,
    ).toEqual([]);
    expect(summary.totalFrames).toBe(1);
    expect(summary.lastEventSequence).toBe(1);
  });

  it("appends only distinct post-intent checkpoints", () => {
    const bundle = createBundle();
    const initialFrame = createReplayFrame({
      event: bundle.events[0] ?? null,
      fallbackLabel: "Match created",
      frameIndex: 0,
      recordedAt: bundle.shell.createdAt,
      view: bundle.spectatorView,
    });

    const keepSeat0 = buildPersistedIntentResult({
      events: bundle.events,
      intent: {
        intentId: "intent_keep_replay_1",
        kind: "keepOpeningHand",
        matchId: bundle.shell.id,
        payload: {},
        seat: "seat-0",
        stateVersion: bundle.shell.version,
      },
      state: bundle.state,
    });

    const checkpoint = createReplayFrame({
      event: selectReplayAnchorEvent(keepSeat0.appendedEvents),
      fallbackLabel: "Replay checkpoint",
      frameIndex: 1,
      recordedAt: keepSeat0.shell.createdAt,
      view: keepSeat0.spectatorView,
    });

    const frames = appendReplayFrame([initialFrame], checkpoint);
    const duplicate = appendReplayFrame(frames, checkpoint);

    expect(frames).toHaveLength(2);
    expect(duplicate).toHaveLength(2);
    expect(frames[1]?.label).toBe("seat-0 kept their opening hand.");
    expect(frames[1]?.eventSequence).toBe(4);
  });
});
