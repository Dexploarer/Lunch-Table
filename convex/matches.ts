import { v } from "convex/values";

import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import {
  getFormatDefinition,
  listCollectionEntriesForUser,
  validateDeckForUserCollection,
} from "./lib/library";
import {
  buildPracticeMatchBundle,
  deserializeMatchShell,
  deserializeSeatView,
  deserializeSpectatorView,
  seatFromEvent,
  serializeMatchEvent,
  serializeMatchShell,
  serializeMatchState,
  serializeMatchView,
} from "./lib/matches";
import { requireViewerUser } from "./lib/viewer";

async function getDeckOrThrow(
  ctx: { db: { get: (id: Id<"decks">) => Promise<Doc<"decks"> | null> } },
  deckId: Id<"decks">,
) {
  const deck = await ctx.db.get(deckId);
  if (!deck) {
    throw new Error("Deck not found");
  }
  return deck;
}

function assertDeckOwner(deck: Doc<"decks">, userId: Id<"users">) {
  if (deck.userId !== userId) {
    throw new Error("Deck not found");
  }
}

function toMatchDocument(input: {
  formatId: string;
  shell: ReturnType<typeof deserializeMatchShell>;
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

async function getMatchByStringId(
  ctx: {
    db: {
      get: (id: Id<"matches">) => Promise<Doc<"matches"> | null>;
      normalizeId: (tableName: "matches", id: string) => Id<"matches"> | null;
    };
  },
  matchId: string,
) {
  const normalized = ctx.db.normalizeId("matches", matchId);
  if (!normalized) {
    return null;
  }
  return ctx.db.get(normalized);
}

export const createPractice = mutation({
  args: {
    deckId: v.id("decks"),
  },
  handler: async (ctx, args) => {
    const user = await requireViewerUser(ctx);
    const deck = await getDeckOrThrow(ctx, args.deckId);
    assertDeckOwner(deck, user._id);

    if (deck.status !== "active") {
      throw new Error("Only active decks can create matches");
    }

    const collectionEntries = await listCollectionEntriesForUser(
      ctx.db,
      user._id,
      deck.formatId,
    );
    const validation = validateDeckForUserCollection({
      collectionEntries,
      formatId: deck.formatId,
      mainboard: deck.mainboard,
      sideboard: deck.sideboard,
    });

    if (!validation.isLegal) {
      throw new Error(
        validation.issues.map((issue) => issue.message).join(" "),
      );
    }

    const now = Date.now();
    const matchRef = await ctx.db.insert("matches", {
      createdAt: now,
      formatId: deck.formatId,
      phase: "bootstrap",
      shellJson: "{}",
      status: "pending",
      turnNumber: 0,
      updatedAt: now,
      version: 0,
    });

    const wallet = user.primaryWalletId
      ? await ctx.db.get(user.primaryWalletId)
      : null;
    const bundle = buildPracticeMatchBundle({
      createdAt: now,
      format: getFormatDefinition(deck.formatId),
      matchId: matchRef,
      player: {
        userId: user._id,
        username: user.username,
        walletAddress: wallet?.address ?? null,
      },
      primaryDeck: {
        mainboard: deck.mainboard,
        sideboard: deck.sideboard,
      },
    });

    await ctx.db.patch(
      matchRef,
      toMatchDocument({
        formatId: deck.formatId,
        shell: bundle.shell,
        updatedAt: now,
      }),
    );
    await ctx.db.insert("matchStates", {
      matchId: matchRef,
      snapshotJson: serializeMatchState(bundle.state),
      updatedAt: now,
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
        kind: view.kind,
        matchId: matchRef,
        updatedAt: now,
        viewJson: serializeMatchView(view.view),
        viewerSeat: view.viewerSeat,
        viewerUserId: view.viewerUserId ?? undefined,
      });
    }

    await ctx.db.insert("matchViews", {
      kind: "spectator",
      matchId: matchRef,
      updatedAt: now,
      viewJson: serializeMatchView(bundle.spectatorView),
    });

    return bundle.shell;
  },
});

export const listMyMatches = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("active"),
        v.literal("complete"),
        v.literal("cancelled"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireViewerUser(ctx);
    const seatViews = await ctx.db
      .query("matchViews")
      .withIndex("by_viewerUserId_and_updatedAt", (query) =>
        query.eq("viewerUserId", user._id),
      )
      .order("desc")
      .take(20);

    const shellsById = new Map<
      string,
      ReturnType<typeof deserializeMatchShell>
    >();
    for (const seatView of seatViews) {
      if (seatView.kind !== "seat") {
        continue;
      }
      const shell = deserializeSeatView(seatView.viewJson).match;
      if (args.status && shell.status !== args.status) {
        continue;
      }
      shellsById.set(shell.id, shell);
    }

    return [...shellsById.values()];
  },
});

export const getShell = query({
  args: {
    matchId: v.string(),
  },
  handler: async (ctx, args) => {
    const match = await getMatchByStringId(ctx, args.matchId);
    if (!match) {
      return null;
    }

    return deserializeMatchShell(match.shellJson);
  },
});

export const getSeatView = query({
  args: {
    matchId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireViewerUser(ctx);
    const normalizedMatchId = ctx.db.normalizeId("matches", args.matchId);
    if (!normalizedMatchId) {
      return null;
    }

    const seatView = await ctx.db
      .query("matchViews")
      .withIndex("by_matchId_and_viewerUserId_and_kind", (query) =>
        query
          .eq("matchId", normalizedMatchId)
          .eq("viewerUserId", user._id)
          .eq("kind", "seat"),
      )
      .unique();

    if (!seatView) {
      return null;
    }

    return deserializeSeatView(seatView.viewJson);
  },
});

export const getSpectatorView = query({
  args: {
    matchId: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedMatchId = ctx.db.normalizeId("matches", args.matchId);
    if (!normalizedMatchId) {
      return null;
    }

    const spectatorView = await ctx.db
      .query("matchViews")
      .withIndex("by_matchId_and_kind", (query) =>
        query.eq("matchId", normalizedMatchId).eq("kind", "spectator"),
      )
      .unique();

    if (!spectatorView) {
      return null;
    }

    return deserializeSpectatorView(spectatorView.viewJson);
  },
});
