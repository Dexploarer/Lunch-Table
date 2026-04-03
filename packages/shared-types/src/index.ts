export const APP_NAME = "Lunch-Table";

export {
  CARD_LIBRARY_KINDS,
  CARD_LIBRARY_RARITIES,
  DECK_STATUSES,
} from "./library";
export {
  BSC_CHAIN_ID,
  buildWalletChallengeMessage,
} from "./auth";
export {
  AUTHORITATIVE_INTENT_KINDS,
  MATCH_EVENT_KINDS,
} from "./gameplay";
export {
  MATCH_ACTOR_TYPES,
  MATCH_BOARD_MODELS,
  MATCH_PHASES,
  MATCH_PROMPT_KINDS,
  MATCH_RESOURCE_MODELS,
  MATCH_SEAT_STATUSES,
  MATCH_STATUSES,
  MATCH_TIMING_MODELS,
  MATCH_TURN_MODELS,
  MATCH_VISIBILITIES,
  MATCH_VICTORY_MODELS,
  MATCH_ZONE_KINDS,
} from "./match";
export { MATCH_TELEMETRY_EVENT_NAMES } from "./telemetry";

export type {
  UserId,
  ViewerIdentity,
  WalletAuthSession,
  WalletChallengeId,
  WalletChallengeResponse,
  WalletChallengeMessageInput,
  WalletChallengePurpose,
} from "./auth";
export type {
  CardCatalogEntry,
  CardLibraryKind,
  CardLibraryRarity,
  CollectionCardEntry,
  CollectionSummary,
  DeckCardEntry,
  DeckId,
  DeckRecord,
  DeckStatus,
  DeckValidationIssue,
  DeckValidationResult,
} from "./library";
export type {
  GameplayIntent,
  GameplayIntentBase,
  GameplayIntentKind,
  MatchEvent,
  MatchEventBase,
  MatchEventKind,
} from "./gameplay";
export type {
  CardInstanceId,
  MatchActorType,
  MatchCardStatLine,
  MatchCardView,
  MatchDeckRulesSummary,
  MatchEventSummary,
  MatchFormatSummary,
  MatchId,
  MatchPhase,
  MatchPromptChoiceView,
  MatchPromptKind,
  MatchPromptView,
  MatchSeatStatus,
  MatchSeatSummary,
  MatchSeatView,
  MatchShell,
  MatchSkeleton,
  MatchSpectatorView,
  MatchStackItemView,
  MatchStatus,
  MatchTimerSnapshot,
  MatchView,
  MatchVisibility,
  MatchZoneView,
  PromptId,
  SeatId,
  SeatResourceView,
  SeatStateView,
  StackObjectId,
  ZoneKind,
} from "./match";
export type {
  MatchTelemetryEvent,
  MatchTelemetryEventName,
} from "./telemetry";
