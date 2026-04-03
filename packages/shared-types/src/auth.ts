export const BSC_CHAIN_ID = 56 as const;

export type WalletChallengePurpose = "signup" | "login" | "link-wallet";

export interface WalletChallengeMessageInput {
  address: `0x${string}`;
  domain: string;
  email?: string;
  issuedAt: string;
  nonce: string;
  requestId?: string;
  statement: string;
  uri: string;
  username?: string;
}

export function buildWalletChallengeMessage(
  input: WalletChallengeMessageInput,
): string {
  return [
    `${input.domain} wants you to sign in with your BSC account:`,
    input.address,
    "",
    input.statement,
    input.username ? `Username: ${input.username}` : undefined,
    input.email ? `Email: ${input.email}` : undefined,
    `URI: ${input.uri}`,
    "Version: 1",
    `Chain ID: ${BSC_CHAIN_ID}`,
    `Nonce: ${input.nonce}`,
    `Issued At: ${input.issuedAt}`,
    input.requestId ? `Request ID: ${input.requestId}` : undefined,
  ]
    .filter(Boolean)
    .join("\n");
}
