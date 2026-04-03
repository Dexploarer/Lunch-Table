import type { KeywordRegistry } from "@lunchtable/game-core";

export const starterKeywordRegistry: KeywordRegistry = {
  flying: {
    description: "This unit can only be blocked by units with flying.",
    id: "flying",
    reminderText: "Can only be blocked by units with flying.",
    templates: [
      {
        effect: {
          kind: "grantPermission",
          permission: "canBlockFlying",
          target: "self",
        },
        generatedIdSuffix: "flying",
        generatedText: "Flying",
        kind: "static",
        layer: "permissions",
      },
    ],
  },
  haste: {
    description: "This unit can attack on the turn it enters the battlefield.",
    id: "haste",
    reminderText: "Can attack on the turn it enters.",
    templates: [
      {
        effect: {
          kind: "grantPermission",
          permission: "ignoreSummoningSickness",
          target: "self",
        },
        generatedIdSuffix: "haste",
        generatedText: "Haste",
        kind: "static",
        layer: "permissions",
      },
    ],
  },
  ward1: {
    description: "Opponents must pay 1 mana to target this unit.",
    id: "ward1",
    reminderText:
      "Whenever this becomes the target of an opposing effect, counter it unless its controller pays 1.",
    templates: [
      {
        generatedIdSuffix: "ward1",
        generatedText: "Ward 1",
        kind: "replacement",
        replace: {
          amount: 1,
          kind: "imposeTargetingTax",
          resourceId: "mana",
        },
        watches: {
          event: "sourceWouldBeTargeted",
          kind: "event",
        },
      },
    ],
  },
};
