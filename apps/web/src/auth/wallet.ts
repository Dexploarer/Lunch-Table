import {
  BSC_CHAIN_ID,
  type WalletChallengeMessageInput,
  buildWalletChallengeMessage,
} from "@lunchtable/shared-types";
import { isHex, verifyMessage } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

export interface LocalBscWallet {
  address: `0x${string}`;
  chainId: typeof BSC_CHAIN_ID;
  privateKey: `0x${string}`;
}

export type WalletChallengePayload = WalletChallengeMessageInput;

export function createLocalBscWallet(): LocalBscWallet {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);

  return {
    address: account.address,
    chainId: BSC_CHAIN_ID,
    privateKey,
  };
}

export function importLocalBscWallet(privateKeyInput: string): LocalBscWallet {
  const privateKey = normalizePrivateKey(privateKeyInput);
  const account = privateKeyToAccount(privateKey);

  return {
    address: account.address,
    chainId: BSC_CHAIN_ID,
    privateKey,
  };
}

export function normalizePrivateKey(value: string): `0x${string}` {
  const trimmed = value.trim();
  const prefixed = trimmed.startsWith("0x")
    ? (trimmed as `0x${string}`)
    : (`0x${trimmed}` as `0x${string}`);

  if (!isHex(prefixed, { strict: true }) || prefixed.length !== 66) {
    throw new Error("Invalid private key format");
  }

  return prefixed;
}

export function buildSignupChallengeMessage(
  payload: WalletChallengePayload,
): string {
  return buildWalletChallengeMessage(payload);
}

export async function signChallenge(
  privateKey: `0x${string}`,
  message: string,
): Promise<`0x${string}`> {
  const account = privateKeyToAccount(privateKey);

  return account.signMessage({ message });
}

export async function verifyChallengeSignature(input: {
  address: `0x${string}`;
  message: string;
  signature: `0x${string}`;
}): Promise<boolean> {
  return verifyMessage({
    address: input.address,
    message: input.message,
    signature: input.signature,
  });
}
