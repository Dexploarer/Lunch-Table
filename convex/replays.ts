import { v } from "convex/values";

import { query } from "./_generated/server";
import { buildReplaySummary, deserializeReplayFrames } from "./lib/replays";

export const getSummary = query({
  args: {
    matchId: v.string(),
  },
  handler: async (ctx, args) => {
    const matchId = ctx.db.normalizeId("matches", args.matchId);
    if (!matchId) {
      return null;
    }

    const replay = await ctx.db
      .query("replays")
      .withIndex("by_matchId", (queryBuilder) =>
        queryBuilder.eq("matchId", matchId),
      )
      .unique();

    if (!replay) {
      return null;
    }

    return buildReplaySummary({
      completedAt: replay.completedAt ?? null,
      createdAt: replay.createdAt,
      formatId: replay.formatId,
      frames: deserializeReplayFrames(replay.framesJson),
      matchId: replay.matchId,
      ownerUserId: replay.ownerUserId ?? null,
      status: replay.status,
      updatedAt: replay.updatedAt,
      winnerSeat: replay.winnerSeat ?? null,
    });
  },
});

export const getFrames = query({
  args: {
    limit: v.optional(v.number()),
    matchId: v.string(),
    start: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const matchId = ctx.db.normalizeId("matches", args.matchId);
    if (!matchId) {
      return {
        frames: [],
        totalFrames: 0,
      };
    }

    const replay = await ctx.db
      .query("replays")
      .withIndex("by_matchId", (queryBuilder) =>
        queryBuilder.eq("matchId", matchId),
      )
      .unique();

    if (!replay) {
      return {
        frames: [],
        totalFrames: 0,
      };
    }

    const frames = deserializeReplayFrames(replay.framesJson);
    const start = Math.max(0, args.start ?? 0);
    const limit = Math.min(Math.max(args.limit ?? 60, 1), 240);

    return {
      frames: frames.slice(start, start + limit),
      totalFrames: frames.length,
    };
  },
});
