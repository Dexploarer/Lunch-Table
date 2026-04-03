import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  authAudits: defineTable({
    failureCode: v.optional(v.string()),
    ipHash: v.optional(v.string()),
    purpose: v.union(v.literal("signup"), v.literal("login")),
    success: v.boolean(),
    userAgent: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    walletId: v.optional(v.id("wallets")),
  }).index("by_purpose", ["purpose"]),

  users: defineTable({
    email: v.string(),
    emailNormalized: v.string(),
    primaryWalletId: v.optional(v.id("wallets")),
    status: v.union(v.literal("active"), v.literal("suspended")),
    updatedAt: v.number(),
    username: v.string(),
    usernameNormalized: v.string(),
  })
    .index("by_email", ["emailNormalized"])
    .index("by_username", ["usernameNormalized"]),

  walletChallenges: defineTable({
    address: v.string(),
    addressNormalized: v.string(),
    chainId: v.number(),
    consumedAt: v.optional(v.number()),
    emailSnapshot: v.optional(v.string()),
    expiresAt: v.number(),
    issuedAt: v.string(),
    message: v.string(),
    nonce: v.string(),
    purpose: v.union(
      v.literal("signup"),
      v.literal("login"),
      v.literal("link-wallet"),
    ),
    requestId: v.optional(v.string()),
    usernameSnapshot: v.optional(v.string()),
  })
    .index("by_address", ["addressNormalized"])
    .index("by_address_purpose", ["addressNormalized", "purpose"]),

  wallets: defineTable({
    address: v.string(),
    addressNormalized: v.string(),
    chainId: v.number(),
    custodyModel: v.literal("self-custodied"),
    lastAuthenticatedAt: v.optional(v.number()),
    userId: v.id("users"),
    walletType: v.literal("evm-local"),
  })
    .index("by_address", ["addressNormalized"])
    .index("by_user", ["userId"]),
});
