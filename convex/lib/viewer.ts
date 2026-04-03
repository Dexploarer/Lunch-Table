import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { parseUserSubject } from "./walletAuth";

type ViewerCtx = QueryCtx | MutationCtx;

async function getViewerUser(ctx: ViewerCtx): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  const userId = ctx.db.normalizeId(
    "users",
    parseUserSubject(identity.subject),
  );
  if (!userId) {
    return null;
  }

  return ctx.db.get(userId);
}

export async function requireViewerUser(ctx: ViewerCtx): Promise<Doc<"users">> {
  const user = await getViewerUser(ctx);
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}
