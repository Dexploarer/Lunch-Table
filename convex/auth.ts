import { mutationGeneric } from "convex/server";
import { v } from "convex/values";

import type { MutationCtx, UserId, WalletId } from "./lib/dataModel";
import { issueWalletAuthToken } from "./lib/jwt";
import {
  AUTH_CHAIN_ID,
  createWalletChallengeRecord,
  normalizeAddress,
  normalizeEmail,
  normalizeUsername,
  verifyWalletChallengeSignature,
} from "./lib/walletAuth";

function getAuthPresentationConfig() {
  return {
    domain: process.env.AUTH_DOMAIN ?? "lunchtable.gg",
    uri: process.env.AUTH_URI ?? "https://lunchtable.gg",
  };
}

async function findUserByEmail(ctx: MutationCtx, emailNormalized: string) {
  return ctx.db
    .query("users")
    .withIndex("by_email", (query) =>
      query.eq("emailNormalized", emailNormalized),
    )
    .unique();
}

async function findUserByUsername(
  ctx: MutationCtx,
  usernameNormalized: string,
) {
  return ctx.db
    .query("users")
    .withIndex("by_username", (query) =>
      query.eq("usernameNormalized", usernameNormalized),
    )
    .unique();
}

async function findWalletByAddress(
  ctx: MutationCtx,
  addressNormalized: string,
) {
  return ctx.db
    .query("wallets")
    .withIndex("by_address", (query) =>
      query.eq("addressNormalized", addressNormalized),
    )
    .unique();
}

async function recordAudit(
  ctx: MutationCtx,
  input: {
    failureCode?: string;
    purpose: "signup" | "login";
    success: boolean;
    userId?: UserId;
    walletId?: WalletId;
  },
) {
  await ctx.db.insert("authAudits", {
    failureCode: input.failureCode,
    purpose: input.purpose,
    success: input.success,
    userId: input.userId,
    walletId: input.walletId,
  });
}

export const requestSignupChallenge = mutationGeneric({
  args: {
    address: v.string(),
    email: v.string(),
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const emailNormalized = normalizeEmail(args.email);
    const usernameNormalized = normalizeUsername(args.username);
    const address = normalizeAddress(args.address);
    const addressNormalized = address.toLowerCase();

    const [existingEmail, existingUsername, existingWallet] = await Promise.all(
      [
        findUserByEmail(ctx, emailNormalized),
        findUserByUsername(ctx, usernameNormalized),
        findWalletByAddress(ctx, addressNormalized),
      ],
    );

    if (existingEmail) {
      throw new Error("Email is already registered");
    }
    if (existingUsername) {
      throw new Error("Username is already registered");
    }
    if (existingWallet) {
      throw new Error("Wallet is already registered");
    }

    const presentation = getAuthPresentationConfig();
    const challenge = createWalletChallengeRecord({
      address,
      domain: presentation.domain,
      email: args.email.trim(),
      purpose: "signup",
      statement: "Create your Lunch-Table account.",
      uri: `${presentation.uri}/signup`,
      username: args.username.trim(),
    });

    const challengeId = await ctx.db.insert("walletChallenges", {
      address: challenge.address,
      addressNormalized: challenge.addressNormalized,
      chainId: challenge.chainId,
      emailSnapshot: args.email.trim(),
      expiresAt: challenge.expiresAt,
      issuedAt: challenge.issuedAt,
      message: challenge.message,
      nonce: challenge.nonce,
      purpose: "signup",
      usernameSnapshot: args.username.trim(),
    });

    return {
      address: challenge.address,
      chainId: AUTH_CHAIN_ID,
      challengeId,
      expiresAt: challenge.expiresAt,
      message: challenge.message,
      nonce: challenge.nonce,
    };
  },
});

export const requestLoginChallenge = mutationGeneric({
  args: {
    address: v.string(),
  },
  handler: async (ctx, args) => {
    const address = normalizeAddress(args.address);
    const wallet = await findWalletByAddress(ctx, address.toLowerCase());

    if (!wallet) {
      throw new Error("Wallet not registered");
    }

    const user = await ctx.db.get(wallet.userId);
    const presentation = getAuthPresentationConfig();
    const challenge = createWalletChallengeRecord({
      address,
      domain: presentation.domain,
      email: user?.email,
      purpose: "login",
      statement: "Sign in to your Lunch-Table account.",
      uri: `${presentation.uri}/login`,
      username: user?.username,
    });

    const challengeId = await ctx.db.insert("walletChallenges", {
      address: challenge.address,
      addressNormalized: challenge.addressNormalized,
      chainId: challenge.chainId,
      emailSnapshot: user?.email,
      expiresAt: challenge.expiresAt,
      issuedAt: challenge.issuedAt,
      message: challenge.message,
      nonce: challenge.nonce,
      purpose: "login",
      usernameSnapshot: user?.username,
    });

    return {
      address: challenge.address,
      chainId: AUTH_CHAIN_ID,
      challengeId,
      expiresAt: challenge.expiresAt,
      message: challenge.message,
      nonce: challenge.nonce,
    };
  },
});

export const completeWalletSignup = mutationGeneric({
  args: {
    challengeId: v.id("walletChallenges"),
    signature: v.string(),
  },
  handler: async (ctx, args) => {
    const challenge = await ctx.db.get(args.challengeId);
    if (!challenge || challenge.purpose !== "signup") {
      throw new Error("Invalid signup challenge");
    }
    if (challenge.consumedAt) {
      throw new Error("Challenge already used");
    }
    if (challenge.expiresAt < Date.now()) {
      throw new Error("Challenge expired");
    }

    const verified = await verifyWalletChallengeSignature({
      address: normalizeAddress(challenge.address),
      message: challenge.message,
      signature: args.signature as `0x${string}`,
    });

    if (!verified) {
      await recordAudit(ctx, {
        failureCode: "invalid_signature",
        purpose: "signup",
        success: false,
      });
      throw new Error("Invalid wallet signature");
    }

    const email = challenge.emailSnapshot;
    const username = challenge.usernameSnapshot;
    if (!email || !username) {
      throw new Error("Challenge is missing signup identity");
    }

    const emailNormalized = normalizeEmail(email);
    const usernameNormalized = normalizeUsername(username);
    const address = normalizeAddress(challenge.address);
    const addressNormalized = address.toLowerCase();

    const [existingEmail, existingUsername, existingWallet] = await Promise.all(
      [
        findUserByEmail(ctx, emailNormalized),
        findUserByUsername(ctx, usernameNormalized),
        findWalletByAddress(ctx, addressNormalized),
      ],
    );

    if (existingEmail || existingUsername || existingWallet) {
      throw new Error("Signup identity already exists");
    }

    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      email,
      emailNormalized,
      status: "active",
      updatedAt: now,
      username,
      usernameNormalized,
    });

    const walletId = await ctx.db.insert("wallets", {
      address,
      addressNormalized,
      chainId: AUTH_CHAIN_ID,
      custodyModel: "self-custodied",
      lastAuthenticatedAt: now,
      userId,
      walletType: "evm-local",
    });

    await ctx.db.patch(userId, {
      primaryWalletId: walletId,
      updatedAt: now,
    });
    await ctx.db.patch(args.challengeId, { consumedAt: now });
    await recordAudit(ctx, {
      purpose: "signup",
      success: true,
      userId,
      walletId,
    });

    const token = await issueWalletAuthToken({
      email,
      userId,
      username,
      walletAddress: address,
    });

    return {
      address,
      chainId: AUTH_CHAIN_ID,
      token,
      userId,
      username,
    };
  },
});

export const completeWalletLogin = mutationGeneric({
  args: {
    challengeId: v.id("walletChallenges"),
    signature: v.string(),
  },
  handler: async (ctx, args) => {
    const challenge = await ctx.db.get(args.challengeId);
    if (!challenge || challenge.purpose !== "login") {
      throw new Error("Invalid login challenge");
    }
    if (challenge.consumedAt) {
      throw new Error("Challenge already used");
    }
    if (challenge.expiresAt < Date.now()) {
      throw new Error("Challenge expired");
    }

    const address = normalizeAddress(challenge.address);
    const verified = await verifyWalletChallengeSignature({
      address,
      message: challenge.message,
      signature: args.signature as `0x${string}`,
    });

    if (!verified) {
      await recordAudit(ctx, {
        failureCode: "invalid_signature",
        purpose: "login",
        success: false,
      });
      throw new Error("Invalid wallet signature");
    }

    const wallet = await findWalletByAddress(ctx, address.toLowerCase());
    if (!wallet) {
      throw new Error("Wallet not registered");
    }
    const user = await ctx.db.get(wallet.userId);
    if (!user) {
      throw new Error("User record missing");
    }

    const now = Date.now();
    await ctx.db.patch(wallet._id, { lastAuthenticatedAt: now });
    await ctx.db.patch(args.challengeId, { consumedAt: now });
    await recordAudit(ctx, {
      purpose: "login",
      success: true,
      userId: user._id,
      walletId: wallet._id,
    });

    const token = await issueWalletAuthToken({
      email: user.email,
      userId: user._id,
      username: user.username,
      walletAddress: address,
    });

    return {
      address,
      chainId: AUTH_CHAIN_ID,
      token,
      userId: user._id,
      username: user.username,
    };
  },
});
