import {
  createCatalogEntriesForFormat,
  starterFormat,
  validateDeckForFormat,
} from "@lunchtable/card-content";
import type {
  CardCatalogEntry,
  CollectionSummary,
  DeckCardEntry,
  DeckRecord,
  DeckValidationResult,
} from "@lunchtable/shared-types";

import type { Doc, Id } from "../_generated/dataModel";
import type { DatabaseReader, DatabaseWriter } from "../_generated/server";

export const DEFAULT_COLLECTION_CARD_COPIES = 4;

export function getFormatDefinition(formatId: string) {
  if (formatId === starterFormat.formatId) {
    return starterFormat;
  }
  throw new Error(`Unsupported format: ${formatId}`);
}

export function listCatalogEntries(formatId: string): CardCatalogEntry[] {
  return createCatalogEntriesForFormat(getFormatDefinition(formatId));
}

export async function listCollectionEntriesForUser(
  db: DatabaseReader | DatabaseWriter,
  userId: Id<"users">,
  formatId: string,
) {
  return db
    .query("collectionEntries")
    .withIndex("by_user_format", (query) =>
      query.eq("userId", userId).eq("formatId", formatId),
    )
    .collect();
}

function buildDefaultCollectionCounts(
  formatId: string,
): Record<string, number> {
  if (formatId !== starterFormat.formatId) {
    return {};
  }

  return Object.fromEntries(
    listCatalogEntries(formatId).map((card) => [
      card.cardId,
      DEFAULT_COLLECTION_CARD_COPIES,
    ]),
  );
}

export function buildCollectionCountMap(
  formatId: string,
  entries: Array<Pick<Doc<"collectionEntries">, "cardId" | "ownedCount">>,
): Record<string, number> {
  const counts = buildDefaultCollectionCounts(formatId);

  for (const entry of entries) {
    counts[entry.cardId] = entry.ownedCount;
  }

  return counts;
}

export function buildCollectionSummary(
  formatId: string,
  entries: Doc<"collectionEntries">[],
): CollectionSummary {
  const catalog = listCatalogEntries(formatId);
  const ownedCounts = buildCollectionCountMap(formatId, entries);
  const summaryEntries = catalog.map((card) => ({
    card,
    ownedCount: ownedCounts[card.cardId] ?? 0,
  }));

  return {
    entries: summaryEntries,
    formatId,
    totalOwnedCards: summaryEntries.reduce(
      (total, entry) => total + entry.ownedCount,
      0,
    ),
    totalUniqueCards: summaryEntries.filter((entry) => entry.ownedCount > 0)
      .length,
  };
}

export function validateDeckForUserCollection(input: {
  collectionEntries: Doc<"collectionEntries">[];
  formatId: string;
  mainboard: DeckCardEntry[];
  sideboard: DeckCardEntry[];
}): DeckValidationResult {
  const format = getFormatDefinition(input.formatId);
  return validateDeckForFormat({
    catalog: listCatalogEntries(input.formatId),
    collectionCounts: buildCollectionCountMap(
      input.formatId,
      input.collectionEntries,
    ),
    format,
    mainboard: input.mainboard,
    sideboard: input.sideboard,
  });
}

export function toDeckRecord(
  deck: Doc<"decks">,
  validation: DeckValidationResult,
): DeckRecord {
  return {
    formatId: deck.formatId,
    id: deck._id,
    mainboard: deck.mainboard,
    name: deck.name,
    sideboard: deck.sideboard,
    status: deck.status,
    updatedAt: deck.updatedAt,
    validation,
  };
}

export async function ensureStarterCollectionEntries(
  db: DatabaseWriter,
  userId: Id<"users">,
  now: number,
) {
  const existingEntries = await listCollectionEntriesForUser(
    db,
    userId,
    starterFormat.formatId,
  );
  const existingCardIds = new Set(existingEntries.map((entry) => entry.cardId));

  for (const card of listCatalogEntries(starterFormat.formatId)) {
    if (existingCardIds.has(card.cardId)) {
      continue;
    }

    await db.insert("collectionEntries", {
      cardId: card.cardId,
      formatId: starterFormat.formatId,
      ownedCount: DEFAULT_COLLECTION_CARD_COPIES,
      source: "starterGrant",
      updatedAt: now,
      userId,
    });
  }
}
