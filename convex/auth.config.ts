import type { AuthConfig } from "convex/server";

import { buildJwksDataUri } from "./lib/jwt";

export default {
  providers: [
    {
      algorithm: "ES256",
      applicationID: process.env.JWT_AUDIENCE ?? "lunchtable-web",
      issuer: process.env.JWT_ISSUER ?? "https://auth.lunchtable.invalid",
      jwks: buildJwksDataUri(),
      type: "customJwt",
    },
  ],
} satisfies AuthConfig;
