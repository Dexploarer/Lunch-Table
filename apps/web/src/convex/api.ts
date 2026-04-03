import type {
  CardCatalogEntry,
  CollectionSummary,
  DeckCardEntry,
  DeckId,
  DeckRecord,
  DeckStatus,
  DeckValidationResult,
  MatchSeatView,
  MatchShell,
  MatchSpectatorView,
  MatchStatus,
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
  getCollectionSummary(args: {
    formatId: string;
  }): Promise<CollectionSummary>;
  getMatchShell(args: {
    matchId: string;
  }): Promise<MatchShell | null>;
  getSeatView(args: {
    matchId: string;
  }): Promise<MatchSeatView | null>;
  getSpectatorView(args: {
    matchId: string;
  }): Promise<MatchSpectatorView | null>;
  listCatalog(args: {
    formatId: string;
  }): Promise<CardCatalogEntry[]>;
  listDecks(args: {
    formatId?: string;
    status?: DeckStatus;
  }): Promise<DeckRecord[]>;
  listMyMatches(args: {
    status?: MatchStatus;
  }): Promise<MatchShell[]>;
  validateDeck(args: {
    formatId: string;
    mainboard: DeckCardEntry[];
    sideboard: DeckCardEntry[];
  }): Promise<DeckValidationResult>;
}

export function createConvexWalletAuthTransport(
  client: ConvexReactClient,
): WalletLibraryTransport {
  return {
    archiveDeck(args) {
      return client.mutation(api.decks.archive, args) as Promise<DeckRecord>;
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
    getCollectionSummary(args) {
      return client.query(
        api.collections.getSummary,
        args,
      ) as Promise<CollectionSummary>;
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
    listMyMatches(args) {
      return client.query(api.matches.listMyMatches, args) as Promise<
        MatchShell[]
      >;
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
    validateDeck(args) {
      return client.query(
        api.decks.validate,
        args,
      ) as Promise<DeckValidationResult>;
    },
  };
}
