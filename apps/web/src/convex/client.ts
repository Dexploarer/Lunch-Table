import { ConvexReactClient } from "convex/react";

import { getStoredAuthToken } from "../auth/session";

const convexUrl = import.meta.env.VITE_CONVEX_URL;

export const convexClient = convexUrl ? new ConvexReactClient(convexUrl) : null;

if (convexClient) {
  convexClient.setAuth(async () => getStoredAuthToken());
}
