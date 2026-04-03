import type {
  CardCatalogEntry,
  MatchSeatView,
  MatchSpectatorView,
  MatchView,
  MatchZoneView,
  ZoneKind,
} from "@lunchtable/shared-types";

export type MatchRenderMode = "seat" | "spectator";

export interface ActivatedAbilityAction {
  abilityId: string;
  cardName: string;
  instanceId: string;
  text: string;
}

export function resolveRenderableView(input: {
  preferredMode: MatchRenderMode;
  seatView: MatchSeatView | null;
  spectatorView: MatchSpectatorView | null;
}): {
  mode: MatchRenderMode;
  view: MatchView | null;
} {
  if (input.preferredMode === "seat" && input.seatView) {
    return {
      mode: "seat",
      view: input.seatView,
    };
  }

  if (input.spectatorView) {
    return {
      mode: "spectator",
      view: input.spectatorView,
    };
  }

  return {
    mode: "seat",
    view: input.seatView,
  };
}

export function getZoneView(
  view: MatchView,
  ownerSeat: string,
  zone: ZoneKind,
): MatchZoneView | null {
  return (
    view.zones.find(
      (candidate) =>
        candidate.ownerSeat === ownerSeat && candidate.zone === zone,
    ) ?? null
  );
}

export function listActivatedAbilityActions(
  catalog: CardCatalogEntry[],
  view: MatchSeatView | null,
): ActivatedAbilityAction[] {
  if (!view || !view.availableIntents.includes("activateAbility")) {
    return [];
  }

  const battlefield = getZoneView(view, view.viewerSeat, "battlefield");
  if (!battlefield) {
    return [];
  }

  return battlefield.cards.flatMap((card) => {
    const entry = catalog.find((candidate) => candidate.cardId === card.cardId);
    if (!entry) {
      return [];
    }

    return entry.abilities
      .filter((ability) => ability.kind === "activated")
      .map((ability) => ({
        abilityId: ability.id,
        cardName: entry.name,
        instanceId: card.instanceId,
        text: ability.text,
      }));
  });
}
