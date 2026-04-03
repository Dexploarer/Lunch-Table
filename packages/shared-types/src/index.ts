export const APP_NAME = "Lunch-Table";

export type MatchStatus = "pending" | "active" | "complete";

export interface MatchSkeleton {
  id: string;
  phase: "bootstrap";
  status: MatchStatus;
  version: number;
}

export {
  BSC_CHAIN_ID,
  buildWalletChallengeMessage,
} from "./auth";

export type {
  UserId,
  ViewerIdentity,
  WalletAuthSession,
  WalletChallengeId,
  WalletChallengeResponse,
  WalletChallengeMessageInput,
  WalletChallengePurpose,
} from "./auth";
