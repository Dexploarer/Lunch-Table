import { v } from "convex/values";

import { query } from "./_generated/server";
import { listCatalogEntries } from "./lib/library";

export const listCatalog = query({
  args: {
    formatId: v.string(),
  },
  handler: async (_ctx, args) => listCatalogEntries(args.formatId),
});
