import type { Id } from "../_generated/dataModel";
import type { DatabaseReader, DatabaseWriter } from "../_generated/server";
import { deserializeSeatView } from "./matches";
import { isActiveLobbyStatus, isActiveMatchStatus } from "./play";

export async function listActiveLobbiesForUser(
  db: DatabaseReader | DatabaseWriter,
  userId: Id<"users">,
) {
  const [hosted, joined] = await Promise.all([
    db
      .query("lobbies")
      .withIndex("by_hostUserId_and_updatedAt", (index) =>
        index.eq("hostUserId", userId),
      )
      .order("desc")
      .take(10),
    db
      .query("lobbies")
      .withIndex("by_guestUserId_and_updatedAt", (index) =>
        index.eq("guestUserId", userId),
      )
      .order("desc")
      .take(10),
  ]);

  return [...hosted, ...joined].filter((lobby) =>
    isActiveLobbyStatus(lobby.status),
  );
}

export async function listQueuedEntriesForUser(
  db: DatabaseReader | DatabaseWriter,
  userId: Id<"users">,
) {
  return db
    .query("queueEntries")
    .withIndex("by_userId_and_status", (index) =>
      index.eq("userId", userId).eq("status", "queued"),
    )
    .collect();
}

export async function listActiveMatchShellsForUser(
  db: DatabaseReader | DatabaseWriter,
  userId: Id<"users">,
) {
  const seatViews = await db
    .query("matchViews")
    .withIndex("by_viewerUserId_and_updatedAt", (index) =>
      index.eq("viewerUserId", userId),
    )
    .order("desc")
    .take(20);

  const shellsById = new Map<
    string,
    ReturnType<typeof deserializeSeatView>["match"]
  >();
  for (const seatView of seatViews) {
    if (seatView.kind !== "seat") {
      continue;
    }
    const shell = deserializeSeatView(seatView.viewJson).match;
    if (!isActiveMatchStatus(shell.status)) {
      continue;
    }
    shellsById.set(shell.id, shell);
  }

  return [...shellsById.values()];
}

export async function assertUserCanEnterPlaySurface(
  db: DatabaseReader | DatabaseWriter,
  input: {
    actionLabel: string;
    userId: Id<"users">;
  },
) {
  const [activeMatches, queuedEntries, activeLobbies] = await Promise.all([
    listActiveMatchShellsForUser(db, input.userId),
    listQueuedEntriesForUser(db, input.userId),
    listActiveLobbiesForUser(db, input.userId),
  ]);

  if (activeMatches.length > 0) {
    throw new Error(`Finish your current match before ${input.actionLabel}`);
  }
  if (queuedEntries.length > 0) {
    throw new Error(`Leave the active queue before ${input.actionLabel}`);
  }
  if (activeLobbies.length > 0) {
    throw new Error(`Leave your current lobby before ${input.actionLabel}`);
  }
}

export async function hasBlockingMatchmakingParticipation(
  db: DatabaseReader | DatabaseWriter,
  userId: Id<"users">,
) {
  const [activeMatches, activeLobbies] = await Promise.all([
    listActiveMatchShellsForUser(db, userId),
    listActiveLobbiesForUser(db, userId),
  ]);

  return activeMatches.length > 0 || activeLobbies.length > 0;
}
