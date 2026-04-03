import { v } from "convex/values";

import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import {
  getFormatDefinition,
  listCollectionEntriesForUser,
  validateDeckForUserCollection,
} from "./lib/library";
import {
  createPersistedMatch,
  deserializeMatchShell,
  deserializeSeatView,
  deserializeSpectatorView,
} from "./lib/matches";
import { assertUserCanEnterPlaySurface } from "./lib/participation";
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
    await assertUserCanEnterPlaySurface(ctx.db, {
      actionLabel: "creating a practice match",
      userId: user._id,
    });
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
    const wallet = user.primaryWalletId
      ? await ctx.db.get(user.primaryWalletId)
      : null;
    const bundle = await createPersistedMatch(ctx, {
      createdAt: now,
      format: getFormatDefinition(deck.formatId),
      participants: [
        {
          actorType: "human",
          deck: {
            mainboard: deck.mainboard,
            sideboard: deck.sideboard,
          },
          seat: "seat-0",
          userId: user._id,
          username: user.username,
          walletAddress: wallet?.address ?? null,
        },
        {
          actorType: "bot",
          deck: {
            mainboard: deck.mainboard,
            sideboard: deck.sideboard,
          },
          seat: "seat-1",
          username: "Table Bot",
        },
      ],
      status: "pending",
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
