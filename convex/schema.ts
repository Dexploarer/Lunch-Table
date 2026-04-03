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

  matches: defineTable({
    activeSeat: v.optional(v.string()),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
    formatId: v.string(),
    phase: v.union(
      v.literal("bootstrap"),
      v.literal("mulligan"),
      v.literal("ready"),
      v.literal("upkeep"),
      v.literal("draw"),
      v.literal("main1"),
      v.literal("attack"),
      v.literal("block"),
      v.literal("damage"),
      v.literal("main2"),
      v.literal("end"),
      v.literal("cleanup"),
    ),
    shellJson: v.string(),
    startedAt: v.optional(v.number()),
    status: v.union(
      v.literal("pending"),
      v.literal("active"),
      v.literal("complete"),
      v.literal("cancelled"),
    ),
    turnNumber: v.number(),
    updatedAt: v.number(),
    version: v.number(),
    winnerSeat: v.optional(v.string()),
  })
    .index("by_status_and_updatedAt", ["status", "updatedAt"])
    .index("by_createdAt", ["createdAt"]),

  matchEvents: defineTable({
    at: v.number(),
    eventJson: v.string(),
    kind: v.string(),
    matchId: v.id("matches"),
    seat: v.optional(v.string()),
    sequence: v.number(),
    stateVersion: v.number(),
  }).index("by_matchId_and_sequence", ["matchId", "sequence"]),

  matchPrompts: defineTable({
    kind: v.string(),
    matchId: v.id("matches"),
    ownerSeat: v.string(),
    promptId: v.string(),
    promptJson: v.string(),
    status: v.union(v.literal("pending"), v.literal("resolved")),
    updatedAt: v.number(),
  }).index("by_matchId_and_ownerSeat_and_status", [
    "matchId",
    "ownerSeat",
    "status",
  ]),

  matchStates: defineTable({
    matchId: v.id("matches"),
    snapshotJson: v.string(),
    updatedAt: v.number(),
    version: v.number(),
  }).index("by_matchId", ["matchId"]),

  matchViews: defineTable({
    kind: v.union(v.literal("seat"), v.literal("spectator")),
    matchId: v.id("matches"),
    updatedAt: v.number(),
    viewJson: v.string(),
    viewerSeat: v.optional(v.string()),
    viewerUserId: v.optional(v.id("users")),
  })
    .index("by_matchId_and_kind", ["matchId", "kind"])
    .index("by_matchId_and_viewerUserId_and_kind", [
      "matchId",
      "viewerUserId",
      "kind",
    ])
    .index("by_viewerUserId_and_updatedAt", ["viewerUserId", "updatedAt"]),

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
