import { describe, expect, it } from "vitest";

import {
  AUTH_CHAIN_ID,
  buildWalletChallengeMessage,
  createWalletChallengeRecord,
  normalizeAddress,
  normalizeEmail,
  normalizeUsername,
  parseUserSubject,
} from "../convex/lib/walletAuth";

describe("convex wallet auth helpers", () => {
  it("normalizes email, username, and address", () => {
    expect(normalizeEmail("  Test@Example.com ")).toBe("test@example.com");
    expect(normalizeUsername("Table_Mage")).toBe("table_mage");
    expect(normalizeAddress("0xAbCdefabcdefabcdefabcdefabcdefabcdefabcd")).toBe(
      "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    );
  });

  it("creates a bounded challenge record", () => {
    const challenge = createWalletChallengeRecord({
      address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      domain: "lunchtable.gg",
      email: "test@example.com",
      now: Date.UTC(2026, 3, 3, 0, 0, 0),
      purpose: "signup",
      statement: "Create your Lunch-Table account.",
      uri: "https://lunchtable.gg/signup",
      username: "tablemage",
    });

    expect(challenge.chainId).toBe(AUTH_CHAIN_ID);
    expect(challenge.expiresAt).toBe(Date.UTC(2026, 3, 3, 0, 5, 0));
    expect(challenge.message).toContain("Chain ID: 56");
    expect(challenge.message).toContain("Username: tablemage");
    expect(challenge.message).toContain("Email: test@example.com");
  });

  it("parses wallet subjects", () => {
    expect(parseUserSubject("user:abc123")).toBe("abc123");
    expect(() => parseUserSubject("wallet:abc123")).toThrow(
      "Invalid auth subject",
    );
  });

  it("builds a deterministic raw challenge message", () => {
    const message = buildWalletChallengeMessage({
      address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      domain: "lunchtable.gg",
      issuedAt: "2026-04-03T00:00:00.000Z",
      nonce: "nonce-xyz",
      purpose: "login",
      statement: "Sign in to your Lunch-Table account.",
      uri: "https://lunchtable.gg/login",
      username: "tablemage",
    });

    expect(message).toContain("nonce-xyz");
    expect(message).toContain("Sign in to your Lunch-Table account.");
  });
});
