import { queryGeneric } from "convex/server";

import type { QueryCtx } from "./lib/dataModel";
import { parseUserSubject } from "./lib/walletAuth";

async function getViewerUser(ctx: QueryCtx, subject: string) {
  const userId = ctx.db.normalizeId("users", parseUserSubject(subject));
  if (!userId) {
    return null;
  }
  return ctx.db.get(userId);
}

export const get = queryGeneric({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await getViewerUser(ctx, identity.subject);
    if (!user) {
      return null;
    }

    const wallet = user.primaryWalletId
      ? await ctx.db.get(user.primaryWalletId)
      : null;

    return {
      email: user.email,
      id: user._id,
      username: user.username,
      walletAddress:
        wallet?.address ??
        (typeof identity.wallet_address === "string"
          ? identity.wallet_address
          : null),
    };
  },
});
