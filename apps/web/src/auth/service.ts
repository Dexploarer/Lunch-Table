import type {
  ViewerIdentity,
  WalletAuthSession,
} from "@lunchtable/shared-types";

import type { WalletAuthTransport } from "../convex/api";
import type { LocalBscWallet } from "./wallet";
import {
  createLocalBscWallet,
  importLocalBscWallet,
  signChallenge,
} from "./wallet";

export interface SignupInput {
  email: string;
  username: string;
}

export interface WalletAuthResult {
  session: WalletAuthSession;
  wallet: LocalBscWallet;
}

async function completeSignedChallenge(
  wallet: LocalBscWallet,
  message: string,
): Promise<`0x${string}`> {
  return signChallenge(wallet.privateKey, message);
}

export async function signUpWithGeneratedWallet(
  transport: WalletAuthTransport,
  input: SignupInput,
): Promise<WalletAuthResult> {
  const wallet = createLocalBscWallet();
  const challenge = await transport.requestSignupChallenge({
    address: wallet.address,
    email: input.email.trim(),
    username: input.username.trim(),
  });

  const signature = await completeSignedChallenge(wallet, challenge.message);
  const session = await transport.completeWalletSignup({
    challengeId: challenge.challengeId,
    signature,
  });

  return {
    session,
    wallet,
  };
}

export async function signInWithPrivateKey(
  transport: WalletAuthTransport,
  privateKeyInput: string,
): Promise<WalletAuthResult> {
  const wallet = importLocalBscWallet(privateKeyInput);
  const challenge = await transport.requestLoginChallenge({
    address: wallet.address,
  });

  const signature = await completeSignedChallenge(wallet, challenge.message);
  const session = await transport.completeWalletLogin({
    challengeId: challenge.challengeId,
    signature,
  });

  return {
    session,
    wallet,
  };
}

export async function loadViewerIdentity(
  transport: WalletAuthTransport,
): Promise<ViewerIdentity | null> {
  return transport.getViewer();
}
