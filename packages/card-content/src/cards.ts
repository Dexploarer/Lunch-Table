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
];
