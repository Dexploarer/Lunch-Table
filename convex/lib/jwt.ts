import { SignJWT, importPKCS8 } from "jose";

const JWT_ALGORITHM = "ES256" as const;

interface WalletAuthTokenInput {
  email: string;
  userId: string;
  username: string;
  walletAddress: `0x${string}`;
}

let cachedPrivateKeyPromise: Promise<CryptoKey> | null = null;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getJwtSettings() {
  return {
    audience: requireEnv("JWT_AUDIENCE"),
    issuer: requireEnv("JWT_ISSUER"),
    keyId: process.env.JWT_KEY_ID,
    publicJwkJson: requireEnv("JWT_PUBLIC_JWK_JSON"),
  };
}

async function getPrivateKey(): Promise<CryptoKey> {
  if (!cachedPrivateKeyPromise) {
    cachedPrivateKeyPromise = importPKCS8(
      requireEnv("JWT_PRIVATE_KEY_PKCS8"),
      JWT_ALGORITHM,
    );
  }
  return cachedPrivateKeyPromise;
}

export function buildJwksDataUri(): string {
  const settings = getJwtSettings();
  const jwk = JSON.parse(settings.publicJwkJson) as Record<string, unknown>;
  if (settings.keyId && !jwk.kid) {
    jwk.kid = settings.keyId;
  }
  return `data:application/json,${encodeURIComponent(
    JSON.stringify({ keys: [jwk] }),
  )}`;
}

export async function issueWalletAuthToken(
  input: WalletAuthTokenInput,
): Promise<string> {
  const settings = getJwtSettings();
  const privateKey = await getPrivateKey();
  const jwt = new SignJWT({
    chain_id: 56,
    email: input.email,
    preferred_username: input.username,
    wallet_address: input.walletAddress,
  })
    .setProtectedHeader({
      alg: JWT_ALGORITHM,
      ...(settings.keyId ? { kid: settings.keyId } : {}),
    })
    .setAudience(settings.audience)
    .setExpirationTime("7d")
    .setIssuedAt()
    .setIssuer(settings.issuer)
    .setSubject(`user:${input.userId}`);

  return jwt.sign(privateKey);
}
