import { v } from "convex/values";

import { query } from "./_generated/server";
import {
  buildCollectionSummary,
  listCollectionEntriesForUser,
} from "./lib/library";
import { requireViewerUser } from "./lib/viewer";

export const getSummary = query({
  args: {
    formatId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireViewerUser(ctx);
    const entries = await listCollectionEntriesForUser(
      ctx.db,
      user._id,
      args.formatId,
    );

    return buildCollectionSummary(args.formatId, entries);
  },
});
