import { createMatchSkeleton } from "@lunchtable/game-core";
import { APP_NAME } from "@lunchtable/shared-types";

const match = createMatchSkeleton();

console.log(
  `[${APP_NAME}] bot runner scaffold ready for match version ${match.version}.`,
);
