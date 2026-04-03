import type {
  MatchSeatView,
  MatchShell,
  MatchSpectatorView,
} from "@lunchtable/shared-types";
import { useConvexConnectionState, useQuery } from "convex/react";

import { api } from "../../../../convex/_generated/api";

export interface LiveMatchState {
  connectionLabel: string;
  isLoading: boolean;
  isReconnecting: boolean;
  seatView: MatchSeatView | null;
  shell: MatchShell | null;
  spectatorView: MatchSpectatorView | null;
}

export function describeConnectionLabel(input: {
  hasEverConnected: boolean;
  hasInflightRequests: boolean;
  isWebSocketConnected: boolean;
}) {
  if (input.isWebSocketConnected && input.hasInflightRequests) {
    return "Syncing";
  }

  if (input.isWebSocketConnected) {
    return "Live";
  }

  if (input.hasEverConnected) {
    return "Reconnecting";
  }

  return "Connecting";
}

export function useSeatView(
  matchId: string | null,
  enabled: boolean,
): LiveMatchState {
  const connectionState = useConvexConnectionState();
  const rawShell = useQuery(
    api.matches.getShell,
    matchId ? { matchId } : "skip",
  );
  const rawSeatView = useQuery(
    api.matches.getSeatView,
    enabled && matchId ? { matchId } : "skip",
  );
  const rawSpectatorView = useQuery(
    api.matches.getSpectatorView,
    matchId ? { matchId } : "skip",
  );
  const shell =
    rawSeatView?.match ?? rawSpectatorView?.match ?? rawShell ?? null;
  const seatView = rawSeatView ?? null;
  const spectatorView = rawSpectatorView ?? null;

  return {
    connectionLabel: describeConnectionLabel(connectionState),
    isLoading:
      Boolean(matchId) &&
      (rawShell === undefined ||
        rawSpectatorView === undefined ||
        (enabled && rawSeatView === undefined)),
    isReconnecting:
      connectionState.hasEverConnected && !connectionState.isWebSocketConnected,
    seatView,
    shell,
    spectatorView,
  };
}
