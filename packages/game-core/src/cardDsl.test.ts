import {
  starterCards,
  starterFormat,
  starterKeywordRegistry,
} from "@lunchtable/card-content";
import {
  compileCardDefinition,
  validateCardDefinition,
  validateFormatDefinition,
} from "@lunchtable/game-core";
import { describe, expect, it } from "vitest";

describe("card DSL", () => {
  it("validates the starter format and its card pool", () => {
    const result = validateFormatDefinition(starterFormat);

    expect(result).toEqual({
      ok: true,
      value: starterFormat,
    });
  });

  it("compiles keyword abilities deterministically into card abilities", () => {
    const scout = starterCards.find((card) => card.id === "sky-patrol-scout");
    if (!scout) {
      throw new Error("starter scout card missing");
    }

    const compiled = compileCardDefinition(scout, starterKeywordRegistry);
    if (!compiled.ok) {
      throw new Error(compiled.errors.join(", "));
    }

    expect(compiled.value.abilities.map((ability) => ability.id)).toEqual([
      "sky-patrol-scout:flying",
      "sky-patrol-scout:haste",
    ]);
  });

  it("rejects cards that reference unknown keywords", () => {
    const invalidCard = {
      ...starterCards[0],
      id: "invalid-card",
      keywords: ["made-up-keyword"],
    };

    const result = validateCardDefinition(invalidCard, starterKeywordRegistry);
    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error("expected validation failure");
    }

    expect(result.errors).toContain(
      "invalid-card: unknown keyword made-up-keyword",
    );
  });
});
