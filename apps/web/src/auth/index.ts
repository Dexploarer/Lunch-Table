export { BSC_CHAIN_ID } from "@lunchtable/shared-types";
export {
  buildSignupChallengeMessage,
  createLocalBscWallet,
  importLocalBscWallet,
  normalizePrivateKey,
  signChallenge,
  verifyChallengeSignature,
} from "./wallet";

export type { LocalBscWallet, WalletChallengePayload } from "./wallet";
