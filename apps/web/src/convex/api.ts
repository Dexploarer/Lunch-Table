import type {
  CardCatalogEntry,
  CollectionSummary,
  DeckCardEntry,
  DeckId,
  DeckRecord,
  DeckStatus,
  DeckValidationResult,
  LobbyMutationResult,
  LobbyRecord,
  MatchSeatView,
  MatchShell,
  MatchSpectatorView,
  MatchStatus,
  QueueEntryId,
  QueueEntryRecord,
  QueueMutationResult,
  ViewerIdentity,
  WalletAuthSession,
  WalletChallengeId,
  WalletChallengeResponse,
} from "@lunchtable/shared-types";
import type { ConvexReactClient } from "convex/react";

import { api } from "../../../../convex/_generated/api";

export interface WalletAuthTransport {
  completeWalletLogin(args: {
    challengeId: WalletChallengeId;
    signature: `0x${string}`;
  }): Promise<WalletAuthSession>;
  completeWalletSignup(args: {
    challengeId: WalletChallengeId;
    signature: `0x${string}`;
  }): Promise<WalletAuthSession>;
  getViewer(): Promise<ViewerIdentity | null>;
  requestLoginChallenge(args: {
    address: `0x${string}`;
  }): Promise<WalletChallengeResponse>;
  requestSignupChallenge(args: {
    address: `0x${string}`;
    email: string;
    username: string;
  }): Promise<WalletChallengeResponse>;
}

export interface WalletLibraryTransport extends WalletAuthTransport {
  archiveDeck(args: {
    deckId: DeckId;
  }): Promise<DeckRecord>;
  createPrivateLobby(args: {
    deckId: DeckId;
  }): Promise<LobbyMutationResult>;
  cloneDeck(args: {
    deckId: DeckId;
    name?: string;
  }): Promise<DeckRecord>;
  createDeck(args: {
    formatId: string;
    mainboard: DeckCardEntry[];
    name: string;
    sideboard: DeckCardEntry[];
  }): Promise<DeckRecord>;
  createPracticeMatch(args: {
    deckId: DeckId;
  }): Promise<MatchShell>;
  dequeueCasualQueue(args: {
    entryId: QueueEntryId;
  }): Promise<QueueMutationResult>;
  getCollectionSummary(args: {
    formatId: string;
  }): Promise<CollectionSummary>;
  getLobbyByCode(args: {
    code: string;
  }): Promise<LobbyRecord | null>;
  getMatchShell(args: {
    matchId: string;
  }): Promise<MatchShell | null>;
  getSeatView(args: {
    matchId: string;
  }): Promise<MatchSeatView | null>;
  getSpectatorView(args: {
    matchId: string;
  }): Promise<MatchSpectatorView | null>;
  joinPrivateLobby(args: {
    code: string;
    deckId: DeckId;
  }): Promise<LobbyMutationResult>;
  listCatalog(args: {
    formatId: string;
  }): Promise<CardCatalogEntry[]>;
  listDecks(args: {
    formatId?: string;
    status?: DeckStatus;
  }): Promise<DeckRecord[]>;
  listMyLobbies(): Promise<LobbyRecord[]>;
  listMyMatches(args: {
    status?: MatchStatus;
  }): Promise<MatchShell[]>;
  listMyQueueEntries(args: {
    status?: "cancelled" | "matched" | "queued";
  }): Promise<QueueEntryRecord[]>;
  enqueueCasualQueue(args: {
    deckId: DeckId;
  }): Promise<QueueMutationResult>;
  leaveLobby(args: {
    lobbyId: LobbyRecord["id"];
  }): Promise<LobbyMutationResult>;
  validateDeck(args: {
    formatId: string;
    mainboard: DeckCardEntry[];
    sideboard: DeckCardEntry[];
  }): Promise<DeckValidationResult>;
  setLobbyReady(args: {
    lobbyId: LobbyRecord["id"];
    ready: boolean;
  }): Promise<LobbyMutationResult>;
}

export function createConvexWalletAuthTransport(
  client: ConvexReactClient,
): WalletLibraryTransport {
  return {
    archiveDeck(args) {
      return client.mutation(api.decks.archive, args) as Promise<DeckRecord>;
    },
    createPrivateLobby(args) {
      return client.mutation(
        api.lobbies.createPrivate,
        args,
      ) as Promise<LobbyMutationResult>;
    },
    cloneDeck(args) {
      return client.mutation(api.decks.clone, args) as Promise<DeckRecord>;
    },
    completeWalletLogin(args) {
      return client.action(
        api.auth.completeWalletLogin,
        args,
      ) as Promise<WalletAuthSession>;
    },
    completeWalletSignup(args) {
      return client.action(
        api.auth.completeWalletSignup,
        args,
      ) as Promise<WalletAuthSession>;
    },
    createDeck(args) {
      return client.mutation(api.decks.create, args) as Promise<DeckRecord>;
    },
    createPracticeMatch(args) {
      return client.mutation(
        api.matches.createPractice,
        args,
      ) as Promise<MatchShell>;
    },
    dequeueCasualQueue(args) {
      return client.mutation(
        api.matchmaking.dequeue,
        args,
      ) as Promise<QueueMutationResult>;
    },
    getCollectionSummary(args) {
      return client.query(
        api.collections.getSummary,
        args,
      ) as Promise<CollectionSummary>;
    },
    getLobbyByCode(args) {
      return client.query(
        api.lobbies.getByCode,
        args,
      ) as Promise<LobbyRecord | null>;
    },
    getMatchShell(args) {
      return client.query(
        api.matches.getShell,
        args,
      ) as Promise<MatchShell | null>;
    },
    getSeatView(args) {
      return client.query(
        api.matches.getSeatView,
        args,
      ) as Promise<MatchSeatView | null>;
    },
    getSpectatorView(args) {
      return client.query(
        api.matches.getSpectatorView,
        args,
      ) as Promise<MatchSpectatorView | null>;
    },
    joinPrivateLobby(args) {
      return client.mutation(
        api.lobbies.join,
        args,
      ) as Promise<LobbyMutationResult>;
    },
    getViewer() {
      return client.query(api.viewer.get, {}) as Promise<ViewerIdentity | null>;
    },
    listCatalog(args) {
      return client.query(api.cards.listCatalog, args) as Promise<
        CardCatalogEntry[]
      >;
    },
    listDecks(args) {
      return client.query(api.decks.list, args) as Promise<DeckRecord[]>;
    },
    listMyLobbies() {
      return client.query(api.lobbies.listMine, {}) as Promise<LobbyRecord[]>;
    },
    listMyMatches(args) {
      return client.query(api.matches.listMyMatches, args) as Promise<
        MatchShell[]
      >;
    },
    listMyQueueEntries(args) {
      return client.query(api.matchmaking.listMine, args) as Promise<
        QueueEntryRecord[]
      >;
    },
    enqueueCasualQueue(args) {
      return client.mutation(
        api.matchmaking.enqueue,
        args,
      ) as Promise<QueueMutationResult>;
    },
    leaveLobby(args) {
      return client.mutation(
        api.lobbies.leave,
        args,
      ) as Promise<LobbyMutationResult>;
    },
    requestLoginChallenge(args) {
      return client.mutation(
        api.auth.requestLoginChallenge,
        args,
      ) as Promise<WalletChallengeResponse>;
    },
    requestSignupChallenge(args) {
      return client.mutation(
        api.auth.requestSignupChallenge,
        args,
      ) as Promise<WalletChallengeResponse>;
    },
    setLobbyReady(args) {
      return client.mutation(
        api.lobbies.setReady,
        args,
      ) as Promise<LobbyMutationResult>;
    },
    validateDeck(args) {
      return client.query(
        api.decks.validate,
        args,
      ) as Promise<DeckValidationResult>;
    },
  };
}
