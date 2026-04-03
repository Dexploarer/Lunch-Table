import {
  createGameState,
  createMatchShellFromState,
  createSeatView,
  createSpectatorView,
} from "@lunchtable/game-core";
import type { MatchState } from "@lunchtable/game-core";
import type {
  DeckCardEntry,
  MatchActorType,
  MatchEvent,
  MatchPhase,
  MatchSeatView,
  MatchShell,
  MatchSpectatorView,
  MatchStatus,
  UserId,
} from "@lunchtable/shared-types";

import type { FormatDefinition } from "@lunchtable/game-core";
import type { MutationCtx } from "../_generated/server";

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

export interface MatchParticipantInput {
  actorType: MatchActorType;
  deck: {
    mainboard: DeckCardEntry[];
    sideboard: DeckCardEntry[];
  };
  seat: string;
  userId?: UserId | null;
  username?: string | null;
  walletAddress?: string | null;
}

export interface PersistedMatchBundleInput {
  activeSeat?: string | null;
  createdAt: number;
  format: FormatDefinition;
  matchId: string;
  participants: MatchParticipantInput[];
  phase?: MatchPhase;
  prioritySeat?: string | null;
  startedAt?: number | null;
  status: MatchStatus;
  turnNumber?: number;
}

export interface PersistedSeatViewRecord {
  kind: "seat";
  viewerSeat: string;
  viewerUserId: UserId | null;
  view: MatchSeatView;
}

export interface PersistedMatchBundle {
  events: MatchEvent[];
  shell: MatchShell;
  spectatorView: MatchSpectatorView;
  state: MatchState;
  views: PersistedSeatViewRecord[];
}

export type PracticeMatchBundle = PersistedMatchBundle;

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

function configurePendingState(state: MatchState) {
  for (const seat of Object.values(state.seats)) {
    seat.ready = true;
    seat.status = "ready";
  }
  state.shell.status = "pending";
}

function configureActiveState(
  state: MatchState,
  input: PersistedMatchBundleInput,
) {
  const activeSeat = input.activeSeat ?? input.participants[0]?.seat ?? null;

  for (const seat of Object.values(state.seats)) {
    seat.ready = true;
    seat.status = "active";
  }

  state.shell.activeSeat = activeSeat;
  state.shell.phase = input.phase ?? "ready";
  state.shell.prioritySeat = input.prioritySeat ?? activeSeat;
  state.shell.startedAt = input.startedAt ?? input.createdAt;
  state.shell.status = "active";
  state.shell.turnNumber = input.turnNumber ?? 1;
}

export function buildPersistedMatchBundle(
  input: PersistedMatchBundleInput,
): PersistedMatchBundle {
  const state = createGameState({
    createdAt: input.createdAt,
    matchId: input.matchId,
    seatActors: input.participants.map((participant) => ({
      actorType: participant.actorType,
      seat: participant.seat,
      userId: participant.userId ?? null,
      username: participant.username ?? null,
      walletAddress: participant.walletAddress ?? null,
    })),
    status: input.status,
  });

  state.shell.format = toMatchFormatSummary(input.format);
  for (const participant of input.participants) {
    state.seats[participant.seat].deck = createZoneInstanceIds(
      participant.seat,
      "deck",
      participant.deck.mainboard,
    );
    state.seats[participant.seat].sideboard = createZoneInstanceIds(
      participant.seat,
      "sideboard",
      participant.deck.sideboard,
    );
  }

  if (input.status === "active") {
    configureActiveState(state, input);
  } else {
    configurePendingState(state);
  }

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

export function buildPracticeMatchBundle(
  input: PracticeMatchBundleInput,
): PracticeMatchBundle {
  return buildPersistedMatchBundle({
    createdAt: input.createdAt,
    format: input.format,
    matchId: input.matchId,
    participants: [
      {
        actorType: "human",
        deck: input.primaryDeck,
        seat: "seat-0",
        userId: input.player.userId,
        username: input.player.username,
        walletAddress: input.player.walletAddress,
      },
      {
        actorType: "bot",
        deck: input.primaryDeck,
        seat: "seat-1",
        username: "Table Bot",
      },
    ],
    status: "pending",
  });
}

function toMatchDocument(input: {
  formatId: string;
  shell: MatchShell;
  updatedAt: number;
}) {
  return {
    activeSeat: input.shell.activeSeat ?? undefined,
    completedAt: input.shell.completedAt ?? undefined,
    createdAt: input.shell.createdAt,
    formatId: input.formatId,
    phase: input.shell.phase,
    shellJson: serializeMatchShell(input.shell),
    startedAt: input.shell.startedAt ?? undefined,
    status: input.shell.status,
    turnNumber: input.shell.turnNumber,
    updatedAt: input.updatedAt,
    version: input.shell.version,
    winnerSeat: input.shell.winnerSeat ?? undefined,
  };
}

export async function createPersistedMatch(
  ctx: MutationCtx,
  input: Omit<PersistedMatchBundleInput, "matchId">,
) {
  const matchRef = await ctx.db.insert("matches", {
    createdAt: input.createdAt,
    formatId: input.format.formatId,
    phase: "bootstrap",
    shellJson: "{}",
    status: input.status,
    turnNumber: 0,
    updatedAt: input.createdAt,
    version: 0,
  });

  const bundle = buildPersistedMatchBundle({
    ...input,
    matchId: matchRef,
  });

  await ctx.db.patch(
    matchRef,
    toMatchDocument({
      formatId: input.format.formatId,
      shell: bundle.shell,
      updatedAt: input.createdAt,
    }),
  );
  await ctx.db.insert("matchStates", {
    matchId: matchRef,
    snapshotJson: serializeMatchState(bundle.state),
    updatedAt: input.createdAt,
    version: bundle.shell.version,
  });

  for (const event of bundle.events) {
    await ctx.db.insert("matchEvents", {
      at: event.at,
      eventJson: serializeMatchEvent(event),
      kind: event.kind,
      matchId: matchRef,
      seat: seatFromEvent(event),
      sequence: event.sequence,
      stateVersion: event.stateVersion,
    });
  }

  for (const view of bundle.views) {
    await ctx.db.insert("matchViews", {
      kind: "seat",
      matchId: matchRef,
      updatedAt: input.createdAt,
      viewJson: serializeMatchView(view.view),
      viewerSeat: view.viewerSeat,
      viewerUserId: view.viewerUserId ?? undefined,
    });
  }

  await ctx.db.insert("matchViews", {
    kind: "spectator",
    matchId: matchRef,
    updatedAt: input.createdAt,
    viewJson: serializeMatchView(bundle.spectatorView),
  });

  return bundle;
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
