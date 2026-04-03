import { starterFormat } from "@lunchtable/card-content";
import { describe, expect, it } from "vitest";

import {
  buildCollectionSummary,
  listCatalogEntries,
  validateDeckForUserCollection,
} from "../convex/lib/library";

describe("convex library helpers", () => {
  it("falls back to the seeded starter collection when no collection docs exist", () => {
    const summary = buildCollectionSummary(starterFormat.formatId, []);

    expect(summary.formatId).toBe(starterFormat.formatId);
    expect(summary.entries).toHaveLength(12);
    expect(summary.totalUniqueCards).toBe(12);
    expect(summary.totalOwnedCards).toBe(48);
  });

  it("validates the default starter deck against the starter collection grant", () => {
    const catalog = listCatalogEntries(starterFormat.formatId);
    const validation = validateDeckForUserCollection({
      collectionEntries: [],
      formatId: starterFormat.formatId,
      mainboard: catalog.map((card) => ({
        cardId: card.cardId,
        count: starterFormat.deckRules.maxCopies,
      })),
      sideboard: [],
    });

    expect(validation.isLegal).toBe(true);
    expect(validation.mainboardCount).toBe(48);
  });
});
