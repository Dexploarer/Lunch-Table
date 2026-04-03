export const CONTINUOUS_LAYERS = [
  "control",
  "cardType",
  "rulesText",
  "baseStats",
  "statModifiers",
  "permissions",
] as const;

export type ContinuousLayer = (typeof CONTINUOUS_LAYERS)[number];

export const CARD_KINDS = ["unit", "spell", "relic"] as const;
export type CardKind = (typeof CARD_KINDS)[number];

export const CARD_RARITIES = ["common", "uncommon", "rare", "mythic"] as const;
export type CardRarity = (typeof CARD_RARITIES)[number];

export const EFFECT_KINDS = [
  "moveCard",
  "drawCards",
  "discardCards",
  "revealCards",
  "shuffleZone",
  "createToken",
  "adjustResource",
  "dealDamage",
  "heal",
  "destroy",
  "banish",
  "modifyStats",
  "grantKeyword",
  "removeKeyword",
  "changeControl",
  "copyStackObject",
  "counterStackObject",
  "searchZone",
  "attach",
  "detach",
  "createDelayedTrigger",
  "createReplacementEffect",
  "createChoicePrompt",
  "randomSelection",
  "drawFromMulligan",
  "setAutoPass",
] as const;

export type EffectKind = (typeof EFFECT_KINDS)[number];

export interface StatModifier {
  power?: number;
  toughness?: number;
}

export type CostSpec =
  | {
      amount: number;
      kind: "resource";
      resourceId: string;
    }
  | {
      kind: "tapSource";
    }
  | {
      amount: number;
      kind: "discardCard";
      zone: "hand";
    };

export interface TargetSpec {
  count: {
    max: number;
    min: number;
  };
  zone?: string;
  selector:
    | "anyCard"
    | "friendlyUnit"
    | "opposingUnit"
    | "player"
    | "self"
    | "stackObject";
}

export type ConditionNode =
  | {
      kind: "controllerHasResource";
      minimum: number;
      resourceId: string;
    }
  | {
      kind: "sourceHasKeyword";
      keywordId: string;
    }
  | {
      kind: "turnPhaseIs";
      phase:
        | "attack"
        | "block"
        | "cleanup"
        | "draw"
        | "end"
        | "main1"
        | "main2"
        | "mulligan"
        | "ready"
        | "upkeep";
    };

export type EventPattern =
  | {
      event: "selfWouldBeDestroyed";
      kind: "event";
    }
  | {
      event: "sourceWouldTakeDamage";
      kind: "event";
      limit?: "firstEachTurn";
    }
  | {
      event: "sourceWouldBeTargeted";
      kind: "event";
    };

export type TriggerSpec =
  | {
      event: "selfEntersBattlefield";
      kind: "event";
    }
  | {
      event: "selfLeavesBattlefield";
      kind: "event";
    }
  | {
      event: "turnStarts";
      kind: "event";
      seatScope: "controller" | "opponent";
    };

export type EffectNode =
  | {
      amount: number;
      kind: "drawCards";
      target: "controller" | "opponent" | "target";
    }
  | {
      amount: number;
      kind: "adjustResource";
      resourceId: string;
      target: "controller" | "target";
    }
  | {
      amount: number;
      kind: "dealDamage";
      target: "opponent" | "target";
    }
  | {
      kind: "modifyStats";
      modifier: StatModifier;
      target: "self" | "target";
      until?: "endOfTurn" | "permanent";
    }
  | {
      keywordId: string;
      kind: "grantKeyword";
      target: "self" | "target";
      until?: "endOfTurn" | "permanent";
    }
  | {
      amount?: number;
      kind: "destroy";
      target: "self" | "target";
    }
  | {
      destination: string;
      kind: "moveCard";
      source: "self" | "target";
    }
  | {
      kind: "setAutoPass";
      target: "controller";
      value: boolean;
    }
  | {
      kind: "randomSelection";
      options: string[];
      picks: number;
    };

export type ContinuousEffectNode =
  | {
      kind: "grantPermission";
      permission:
        | "canAttackOnEntry"
        | "canBlockFlying"
        | "canCastAtFastSpeed"
        | "ignoreSummoningSickness";
      target: "self" | "friendlyUnits";
    }
  | {
      kind: "modifyStats";
      modifier: StatModifier;
      target: "self" | "friendlyUnits";
    }
  | {
      kind: "grantKeyword";
      keywordId: string;
      target: "self" | "friendlyUnits";
    };

export type ReplacementNode =
  | {
      kind: "preventDamage";
      limit?: number;
    }
  | {
      destination: string;
      kind: "moveInstead";
    }
  | {
      amount: number;
      kind: "imposeTargetingTax";
      resourceId: string;
    };

export interface ActivatedAbility {
  costs: CostSpec[];
  effect: EffectNode[];
  id: string;
  kind: "activated";
  speed: "fast" | "slow";
  targets?: TargetSpec[];
  text: string;
}

export interface TriggeredAbility {
  condition?: ConditionNode;
  effect: EffectNode[];
  id: string;
  kind: "triggered";
  text: string;
  trigger: TriggerSpec;
}

export interface StaticAbility {
  effect: ContinuousEffectNode;
  id: string;
  kind: "static";
  layer: ContinuousLayer;
  text: string;
}

export interface ReplacementAbility {
  id: string;
  kind: "replacement";
  replace: ReplacementNode;
  text: string;
  watches: EventPattern;
}

export type CardAbility =
  | ActivatedAbility
  | ReplacementAbility
  | StaticAbility
  | TriggeredAbility;

export type ActivatedAbilityTemplate = Omit<ActivatedAbility, "id" | "text"> & {
  generatedIdSuffix: string;
  generatedText: string;
};

export type TriggeredAbilityTemplate = Omit<TriggeredAbility, "id" | "text"> & {
  generatedIdSuffix: string;
  generatedText: string;
};

export type StaticAbilityTemplate = Omit<StaticAbility, "id" | "text"> & {
  generatedIdSuffix: string;
  generatedText: string;
};

export type ReplacementAbilityTemplate = Omit<
  ReplacementAbility,
  "id" | "text"
> & {
  generatedIdSuffix: string;
  generatedText: string;
};

export type KeywordAbilityTemplate =
  | ActivatedAbilityTemplate
  | ReplacementAbilityTemplate
  | StaticAbilityTemplate
  | TriggeredAbilityTemplate;

export interface KeywordDefinition {
  description: string;
  id: string;
  reminderText: string;
  templates: KeywordAbilityTemplate[];
}

export type KeywordRegistry = Record<string, KeywordDefinition>;

export interface CardDefinition {
  abilities: CardAbility[];
  cost: number;
  id: string;
  keywords: string[];
  kind: CardKind;
  name: string;
  rarity: CardRarity;
  rulesText: string[];
  setId: string;
  stats?: {
    power: number;
    toughness: number;
  };
}

export interface CompiledCardDefinition
  extends Omit<CardDefinition, "abilities"> {
  abilities: CardAbility[];
}

export interface FormatDeckRules {
  maxCopies: number;
  minCards: number;
  sideboardSize: number;
}

export interface FormatUiHints {
  accentColor: string;
  featuredKeywords: string[];
  summary: string;
}

export interface FormatDefinition {
  banList: string[];
  boardModel: "grid" | "lanes" | "objectives" | "openBoard";
  cardPool: CardDefinition[];
  deckRules: FormatDeckRules;
  formatId: string;
  keywordRegistry: KeywordRegistry;
  mulliganModel: "london" | "partialRedraw" | "singleFree";
  name: string;
  resourceModel: "actionPoints" | "autoRamp" | "energy" | "manaCurve";
  timingModel: "burstOnly" | "fastSlow" | "fullStack" | "noResponses";
  uiHints: FormatUiHints;
  victoryModel: "bossDefeat" | "lifeTotal" | "objectives" | "scoreRace";
}

export interface ValidationSuccess<T> {
  ok: true;
  value: T;
}

export interface ValidationFailure {
  errors: string[];
  ok: false;
}

export type ValidationResult<T> = ValidationFailure | ValidationSuccess<T>;

function validateAbility(
  ability: CardAbility,
  errors: string[],
  cardId: string,
) {
  if (!ability.id.trim()) {
    errors.push(`${cardId}: ability id is required`);
  }
  if (!ability.text.trim()) {
    errors.push(`${cardId}: ability text is required`);
  }

  if (ability.kind === "activated") {
    if (ability.costs.length === 0) {
      errors.push(
        `${cardId}:${ability.id}: activated abilities need at least one cost`,
      );
    }
    if (ability.effect.length === 0) {
      errors.push(
        `${cardId}:${ability.id}: activated abilities need at least one effect node`,
      );
    }
  }

  if (ability.kind === "triggered" && ability.effect.length === 0) {
    errors.push(
      `${cardId}:${ability.id}: triggered abilities need at least one effect node`,
    );
  }
}

export function compileCardDefinition(
  card: CardDefinition,
  keywordRegistry: KeywordRegistry,
): ValidationResult<CompiledCardDefinition> {
  const validation = validateCardDefinition(card, keywordRegistry);
  if (!validation.ok) {
    return validation;
  }

  const keywordAbilities = card.keywords.flatMap((keywordId) => {
    const keyword = keywordRegistry[keywordId];
    return keyword.templates.map((template): CardAbility => {
      const generatedId = `${card.id}:${template.generatedIdSuffix}`;
      const generatedText = template.generatedText;

      switch (template.kind) {
        case "activated":
          return {
            costs: template.costs,
            effect: template.effect,
            id: generatedId,
            kind: "activated",
            speed: template.speed,
            targets: template.targets,
            text: generatedText,
          };
        case "triggered":
          return {
            condition: template.condition,
            effect: template.effect,
            id: generatedId,
            kind: "triggered",
            text: generatedText,
            trigger: template.trigger,
          };
        case "static":
          return {
            effect: template.effect,
            id: generatedId,
            kind: "static",
            layer: template.layer,
            text: generatedText,
          };
        case "replacement":
          return {
            id: generatedId,
            kind: "replacement",
            replace: template.replace,
            text: generatedText,
            watches: template.watches,
          };
      }
    });
  });

  return {
    ok: true,
    value: {
      ...card,
      abilities: [...card.abilities, ...keywordAbilities],
    },
  };
}

export function validateCardDefinition(
  card: CardDefinition,
  keywordRegistry: KeywordRegistry,
): ValidationResult<CardDefinition> {
  const errors: string[] = [];

  if (!card.id.trim()) {
    errors.push("card id is required");
  }
  if (!card.name.trim()) {
    errors.push(`${card.id}: card name is required`);
  }
  if (card.cost < 0) {
    errors.push(`${card.id}: cost must be non-negative`);
  }
  if (card.kind === "unit" && !card.stats) {
    errors.push(`${card.id}: unit cards require stats`);
  }
  if (card.kind !== "unit" && card.stats) {
    errors.push(`${card.id}: only unit cards may define stats`);
  }

  const seenAbilityIds = new Set<string>();
  for (const ability of card.abilities) {
    if (seenAbilityIds.has(ability.id)) {
      errors.push(`${card.id}: duplicate ability id ${ability.id}`);
    }
    seenAbilityIds.add(ability.id);
    validateAbility(ability, errors, card.id);
  }

  for (const keywordId of card.keywords) {
    if (!(keywordId in keywordRegistry)) {
      errors.push(`${card.id}: unknown keyword ${keywordId}`);
    }
  }

  if (errors.length > 0) {
    return {
      errors,
      ok: false,
    };
  }

  return {
    ok: true,
    value: card,
  };
}

export function validateFormatDefinition(
  format: FormatDefinition,
): ValidationResult<FormatDefinition> {
  const errors: string[] = [];
  const cardIds = new Set<string>();

  if (!format.formatId.trim()) {
    errors.push("formatId is required");
  }
  if (Object.keys(format.keywordRegistry).length === 0) {
    errors.push(`${format.formatId}: keyword registry cannot be empty`);
  }
  if (format.cardPool.length === 0) {
    errors.push(`${format.formatId}: card pool cannot be empty`);
  }

  for (const card of format.cardPool) {
    if (cardIds.has(card.id)) {
      errors.push(`${format.formatId}: duplicate card id ${card.id}`);
      continue;
    }
    cardIds.add(card.id);

    const cardValidation = validateCardDefinition(card, format.keywordRegistry);
    if (!cardValidation.ok) {
      errors.push(...cardValidation.errors);
    }
  }

  for (const bannedCardId of format.banList) {
    if (!cardIds.has(bannedCardId)) {
      errors.push(
        `${format.formatId}: banList references unknown card ${bannedCardId}`,
      );
    }
  }

  if (errors.length > 0) {
    return {
      errors,
      ok: false,
    };
  }

  return {
    ok: true,
    value: format,
  };
}
