import {
  createGameState,
  createMatchShellFromState,
  createSeatView,
  createSpectatorView,
} from "@lunchtable/game-core";
import type { MatchState } from "@lunchtable/game-core";
import type {
  DeckCardEntry,
  MatchEvent,
  MatchSeatView,
  MatchShell,
  MatchSpectatorView,
  UserId,
} from "@lunchtable/shared-types";

import type { FormatDefinition } from "@lunchtable/game-core";

export interface PracticeMatchBundleInput {
  createdAt: number;
  format: FormatDefinition;
  matchId: string;
  player: {
    userId: UserId;
    username: string;
    walletAddress: string | null;
  };
  primaryDeck: {
    mainboard: DeckCardEntry[];
    sideboard: DeckCardEntry[];
  };
}

export interface PersistedSeatViewRecord {
  kind: "seat";
  viewerSeat: string;
  viewerUserId: UserId | null;
  view: MatchSeatView;
}

export interface PracticeMatchBundle {
  events: MatchEvent[];
  shell: MatchShell;
  spectatorView: MatchSpectatorView;
  state: MatchState;
  views: PersistedSeatViewRecord[];
}

function toMatchFormatSummary(format: FormatDefinition): MatchShell["format"] {
  return {
    boardModel: format.boardModel,
    deckRules: {
      ...format.deckRules,
    },
    id: format.formatId,
    name: format.name,
    resourceModel: format.resourceModel,
    timingModel: format.timingModel,
    turnModel: "alternating",
    version: "alpha-1",
    victoryModel: format.victoryModel,
  };
}

function createZoneInstanceIds(
  seat: string,
  zone: "deck" | "sideboard",
  entries: DeckCardEntry[],
): string[] {
  const instanceIds: string[] = [];

  for (const entry of entries) {
    for (let copyIndex = 0; copyIndex < entry.count; copyIndex += 1) {
      instanceIds.push(`${seat}:${entry.cardId}:${zone}:${copyIndex + 1}`);
    }
  }

  return instanceIds;
}

function createMatchCreatedEvent(
  shell: MatchShell,
): Extract<MatchEvent, { kind: "matchCreated" }> {
  return {
    at: shell.createdAt,
    eventId: "event_1",
    kind: "matchCreated",
    matchId: shell.id,
    payload: {
      shell,
    },
    sequence: 1,
    stateVersion: shell.version,
  };
}

export function buildPracticeMatchBundle(
  input: PracticeMatchBundleInput,
): PracticeMatchBundle {
  const state = createGameState({
    createdAt: input.createdAt,
    matchId: input.matchId,
    seatActors: [
      {
        actorType: "human",
        seat: "seat-0",
        userId: input.player.userId,
        username: input.player.username,
        walletAddress: input.player.walletAddress,
      },
      {
        actorType: "bot",
        seat: "seat-1",
        username: "Table Bot",
      },
    ],
    status: "pending",
  });

  state.shell.format = toMatchFormatSummary(input.format);
  state.seats["seat-0"].deck = createZoneInstanceIds(
    "seat-0",
    "deck",
    input.primaryDeck.mainboard,
  );
  state.seats["seat-0"].sideboard = createZoneInstanceIds(
    "seat-0",
    "sideboard",
    input.primaryDeck.sideboard,
  );
  state.seats["seat-1"].deck = createZoneInstanceIds(
    "seat-1",
    "deck",
    input.primaryDeck.mainboard,
  );
  state.seats["seat-1"].sideboard = createZoneInstanceIds(
    "seat-1",
    "sideboard",
    input.primaryDeck.sideboard,
  );
  state.seats["seat-0"].ready = true;
  state.seats["seat-0"].status = "ready";
  state.seats["seat-1"].ready = true;
  state.seats["seat-1"].status = "ready";
  state.eventSequence = 1;
  state.shell = createMatchShellFromState(state);

  const events = [createMatchCreatedEvent(state.shell)];
  const views: PersistedSeatViewRecord[] = Object.values(state.seats).map(
    (seat) => ({
      kind: "seat",
      viewerSeat: seat.seat,
      viewerUserId: seat.userId,
      view: createSeatView(state, seat.seat, events),
    }),
  );

  return {
    events,
    shell: state.shell,
    spectatorView: createSpectatorView(state, events),
    state,
    views,
  };
}

export function serializeMatchShell(shell: MatchShell): string {
  return JSON.stringify(shell);
}

export function deserializeMatchShell(shellJson: string): MatchShell {
  return JSON.parse(shellJson) as MatchShell;
}

export function serializeMatchState(state: MatchState): string {
  return JSON.stringify(state);
}

export function deserializeMatchState(snapshotJson: string): MatchState {
  return JSON.parse(snapshotJson) as MatchState;
}

export function serializeMatchEvent(event: MatchEvent): string {
  return JSON.stringify(event);
}

export function deserializeMatchEvent(eventJson: string): MatchEvent {
  return JSON.parse(eventJson) as MatchEvent;
}

export function serializeMatchView(
  view: MatchSeatView | MatchSpectatorView,
): string {
  return JSON.stringify(view);
}

export function deserializeSeatView(viewJson: string): MatchSeatView {
  return JSON.parse(viewJson) as MatchSeatView;
}

export function deserializeSpectatorView(viewJson: string): MatchSpectatorView {
  return JSON.parse(viewJson) as MatchSpectatorView;
}

export function seatFromEvent(event: MatchEvent): string | undefined {
  if ("seat" in event.payload && typeof event.payload.seat === "string") {
    return event.payload.seat;
  }
  return undefined;
}
