import type { CardDefinition } from "@lunchtable/game-core";

export const starterCards: CardDefinition[] = [
  {
    abilities: [
      {
        costs: [
          {
            amount: 1,
            kind: "resource",
            resourceId: "mana",
          },
        ],
        effect: [
          {
            amount: 1,
            kind: "drawCards",
            target: "controller",
          },
        ],
        id: "study-bolt",
        kind: "activated",
        speed: "slow",
        text: "Pay 1 mana: Draw a card.",
      },
    ],
    cost: 2,
    id: "archive-apprentice",
    keywords: [],
    kind: "unit",
    name: "Archive Apprentice",
    rarity: "common",
    rulesText: ["Pay 1 mana: Draw a card."],
    setId: "core-alpha",
    stats: {
      power: 1,
      toughness: 3,
    },
  },
  {
    abilities: [
      {
        effect: [
          {
            amount: 2,
            kind: "dealDamage",
            target: "opponent",
          },
        ],
        id: "entry-spark",
        kind: "triggered",
        text: "When this enters the battlefield, deal 2 damage to the opposing seat.",
        trigger: {
          event: "selfEntersBattlefield",
          kind: "event",
        },
      },
    ],
    cost: 2,
    id: "ember-summoner",
    keywords: [],
    kind: "unit",
    name: "Ember Summoner",
    rarity: "common",
    rulesText: [
      "When this enters the battlefield, deal 2 damage to the opposing seat.",
    ],
    setId: "core-alpha",
    stats: {
      power: 2,
      toughness: 2,
    },
  },
  {
    abilities: [
      {
        effect: {
          kind: "modifyStats",
          modifier: {
            power: 1,
            toughness: 1,
          },
          target: "friendlyUnits",
        },
        id: "captains-aura",
        kind: "static",
        layer: "statModifiers",
        text: "Other friendly units get +1/+1.",
      },
    ],
    cost: 3,
    id: "banner-captain",
    keywords: [],
    kind: "unit",
    name: "Banner Captain",
    rarity: "uncommon",
    rulesText: ["Other friendly units get +1/+1."],
    setId: "core-alpha",
    stats: {
      power: 2,
      toughness: 4,
    },
  },
  {
    abilities: [],
    cost: 1,
    id: "tidecall-apprentice",
    keywords: [],
    kind: "unit",
    name: "Tidecall Apprentice",
    rarity: "common",
    rulesText: [],
    setId: "core-alpha",
    stats: {
      power: 1,
      toughness: 2,
    },
  },
  {
    abilities: [],
    cost: 2,
    id: "sky-patrol-scout",
    keywords: ["flying", "haste"],
    kind: "unit",
    name: "Sky Patrol Scout",
    rarity: "common",
    rulesText: ["Flying", "Haste"],
    setId: "core-alpha",
    stats: {
      power: 2,
      toughness: 1,
    },
  },
  {
    abilities: [
      {
        costs: [
          {
            amount: 1,
            kind: "resource",
            resourceId: "mana",
          },
        ],
        effect: [
          {
            kind: "grantKeyword",
            keywordId: "haste",
            target: "target",
            until: "endOfTurn",
          },
        ],
        id: "battlefield-orders",
        kind: "activated",
        speed: "slow",
        targets: [
          {
            count: {
              max: 1,
              min: 1,
            },
            selector: "friendlyUnit",
          },
        ],
        text: "Target friendly unit gains haste until end of turn.",
      },
    ],
    cost: 2,
    id: "field-marshal-cadet",
    keywords: [],
    kind: "unit",
    name: "Field Marshal Cadet",
    rarity: "common",
    rulesText: ["Target friendly unit gains haste until end of turn."],
    setId: "core-alpha",
    stats: {
      power: 2,
      toughness: 2,
    },
  },
  {
    abilities: [],
    cost: 3,
    id: "mirror-warden",
    keywords: ["ward1"],
    kind: "unit",
    name: "Mirror Warden",
    rarity: "rare",
    rulesText: ["Ward 1"],
    setId: "core-alpha",
    stats: {
      power: 2,
      toughness: 3,
    },
  },
  {
    abilities: [
      {
        effect: [
          {
            amount: 1,
            kind: "adjustResource",
            resourceId: "mana",
            target: "controller",
          },
        ],
        id: "reserve-mana",
        kind: "triggered",
        text: "When this enters the battlefield, gain 1 mana.",
        trigger: {
          event: "selfEntersBattlefield",
          kind: "event",
        },
      },
    ],
    cost: 3,
    id: "lantern-adept",
    keywords: [],
    kind: "unit",
    name: "Lantern Adept",
    rarity: "common",
    rulesText: ["When this enters the battlefield, gain 1 mana."],
    setId: "core-alpha",
    stats: {
      power: 2,
      toughness: 3,
    },
  },
  {
    abilities: [],
    cost: 4,
    id: "bastion-tortoise",
    keywords: [],
    kind: "unit",
    name: "Bastion Tortoise",
    rarity: "common",
    rulesText: [],
    setId: "core-alpha",
    stats: {
      power: 2,
      toughness: 5,
    },
  },
  {
    abilities: [
      {
        effect: [
          {
            amount: 1,
            kind: "dealDamage",
            target: "opponent",
          },
        ],
        id: "skyfall-volley",
        kind: "triggered",
        text: "When this enters the battlefield, deal 1 damage to the opposing seat.",
        trigger: {
          event: "selfEntersBattlefield",
          kind: "event",
        },
      },
    ],
    cost: 4,
    id: "stormline-harrier",
    keywords: ["flying"],
    kind: "unit",
    name: "Stormline Harrier",
    rarity: "uncommon",
    rulesText: [
      "Flying",
      "When this enters the battlefield, deal 1 damage to the opposing seat.",
    ],
    setId: "core-alpha",
    stats: {
      power: 3,
      toughness: 3,
    },
  },
  {
    abilities: [
      {
        effect: {
          kind: "modifyStats",
          modifier: {
            power: 0,
            toughness: 1,
          },
          target: "friendlyUnits",
        },
        id: "shoreline-aegis",
        kind: "static",
        layer: "statModifiers",
        text: "Other friendly units get +0/+1.",
      },
    ],
    cost: 4,
    id: "shoreline-keeper",
    keywords: [],
    kind: "unit",
    name: "Shoreline Keeper",
    rarity: "uncommon",
    rulesText: ["Other friendly units get +0/+1."],
    setId: "core-alpha",
    stats: {
      power: 1,
      toughness: 4,
    },
  },
  {
    abilities: [
      {
        effect: [
          {
            amount: 2,
            kind: "drawCards",
            target: "controller",
          },
        ],
        id: "scribe-burst",
        kind: "triggered",
        text: "When this enters the battlefield, draw 2 cards.",
        trigger: {
          event: "selfEntersBattlefield",
          kind: "event",
        },
      },
    ],
    cost: 5,
    id: "vault-scribe",
    keywords: [],
    kind: "unit",
    name: "Vault Scribe",
    rarity: "rare",
    rulesText: ["When this enters the battlefield, draw 2 cards."],
    setId: "core-alpha",
    stats: {
      power: 3,
      toughness: 4,
    },
  },
];
