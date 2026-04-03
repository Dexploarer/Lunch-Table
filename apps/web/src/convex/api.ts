import type {
  CardCatalogEntry,
  CollectionSummary,
  DeckCardEntry,
  DeckId,
  DeckRecord,
  DeckStatus,
  DeckValidationResult,
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
  getCollectionSummary(args: {
    formatId: string;
  }): Promise<CollectionSummary>;
  listCatalog(args: {
    formatId: string;
  }): Promise<CardCatalogEntry[]>;
  listDecks(args: {
    formatId?: string;
    status?: DeckStatus;
  }): Promise<DeckRecord[]>;
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
    getCollectionSummary(args) {
      return client.query(
        api.collections.getSummary,
        args,
      ) as Promise<CollectionSummary>;
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
