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

  collectionEntries: defineTable({
    cardId: v.string(),
    formatId: v.string(),
    ownedCount: v.number(),
    source: v.union(v.literal("starterGrant")),
    updatedAt: v.number(),
    userId: v.id("users"),
  })
    .index("by_user_card", ["userId", "cardId"])
    .index("by_user_format", ["userId", "formatId"]),

  decks: defineTable({
    createdAt: v.number(),
    formatId: v.string(),
    mainboard: v.array(
      v.object({
        cardId: v.string(),
        count: v.number(),
      }),
    ),
    name: v.string(),
    sideboard: v.array(
      v.object({
        cardId: v.string(),
        count: v.number(),
      }),
    ),
    status: v.union(v.literal("active"), v.literal("archived")),
    updatedAt: v.number(),
    userId: v.id("users"),
  })
    .index("by_user_status_updated", ["userId", "status", "updatedAt"])
    .index("by_user_updated", ["userId", "updatedAt"]),

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
