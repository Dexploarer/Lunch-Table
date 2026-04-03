import type { FormatDefinition } from "@lunchtable/game-core";

import { starterCards } from "./cards";
import { starterKeywordRegistry } from "./keywords";

export const starterFormat: FormatDefinition = {
  banList: [],
  boardModel: "openBoard",
  cardPool: starterCards,
  deckRules: {
    maxCopies: 4,
    minCards: 40,
    sideboardSize: 15,
  },
  formatId: "standard-alpha",
  keywordRegistry: starterKeywordRegistry,
  mulliganModel: "london",
  name: "Standard Alpha",
  resourceModel: "manaCurve",
  timingModel: "fullStack",
  uiHints: {
    accentColor: "#d96c2f",
    featuredKeywords: ["flying", "haste", "ward1"],
    summary:
      "Low-complexity starter format for the first Lunch-Table prototype.",
  },
  victoryModel: "lifeTotal",
};
