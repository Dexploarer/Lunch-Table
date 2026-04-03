import type {
  GameplayIntent,
  GameplayIntentKind,
  MatchId,
  MatchSeatView,
  SeatId,
} from "@lunchtable/shared-types";

export interface BotDecisionFrame {
  availableIntentKinds: GameplayIntentKind[];
  deadlineAt: number | null;
  matchId: MatchId;
  receivedAt: number;
  seat: SeatId;
  view: MatchSeatView;
}

export interface BotPlannedIntent {
  confidence: number;
  intent: GameplayIntent;
  requestedAt: number;
  seat: SeatId;
}
