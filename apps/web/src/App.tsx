import { createMatchSkeleton } from "@lunchtable/game-core";
import type { ViewerIdentity } from "@lunchtable/shared-types";
import { APP_NAME } from "@lunchtable/shared-types";
import { useEffect, useState } from "react";

import type { LocalBscWallet } from "./auth";
import {
  clearAuthToken,
  getStoredAuthToken,
  loadViewerIdentity,
  signInWithPrivateKey,
  signUpWithGeneratedWallet,
  storeAuthToken,
} from "./auth";
import { convexWalletAuthTransport, syncConvexAuth } from "./convex/client";

const bootstrapChecklist = [
  "Bun workspace configured",
  "React web shell online",
  "Convex wallet auth scaffolded",
  "Rules package under test",
];

type NoticeTone = "error" | "neutral" | "success" | "warning";

interface Notice {
  body: string;
  title: string;
  tone: NoticeTone;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unexpected error";
}

function StatusBanner({ notice }: { notice: Notice | null }) {
  if (!notice) {
    return null;
  }

  return (
    <output className={`status-banner status-banner-${notice.tone}`}>
      <p className="status-title">{notice.title}</p>
      <p className="status-body">{notice.body}</p>
    </output>
  );
}

function SessionPanel({
  canSignOut,
  viewer,
  onSignOut,
  loading,
}: {
  canSignOut: boolean;
  loading: boolean;
  onSignOut: () => void;
  viewer: ViewerIdentity | null;
}) {
  return (
    <section className="utility-panel">
      <p className="eyebrow">Current Seat</p>
      <h3>Auth session</h3>
      {loading ? (
        <p className="support-copy">Restoring your session from Convex.</p>
      ) : viewer ? (
        <>
          <dl className="identity-list">
            <div>
              <dt>Username</dt>
              <dd>{viewer.username}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{viewer.email}</dd>
            </div>
            <div>
              <dt>Wallet</dt>
              <dd>{viewer.walletAddress ?? "Unavailable"}</dd>
            </div>
          </dl>
          <button
            className="action secondary-action"
            disabled={!canSignOut}
            onClick={onSignOut}
            type="button"
          >
            Sign out
          </button>
        </>
      ) : (
        <p className="support-copy">
          No active session yet. Create a wallet or restore access with your
          saved private key.
        </p>
      )}
    </section>
  );
}

function PrivateKeyReveal({
  copied,
  onCopy,
  onDismiss,
  wallet,
}: {
  copied: boolean;
  onCopy: () => void;
  onDismiss: () => void;
  wallet: LocalBscWallet | null;
}) {
  return (
    <section className="utility-panel utility-panel-highlight">
      <p className="eyebrow">Recovery Material</p>
      <h3>Private key reveal</h3>
      {wallet ? (
        <>
          <p className="support-copy">
            This key is shown only after signup. Save it before leaving this
            screen. Lunch-Table cannot recover it for you.
          </p>
          <div className="key-box">
            <p className="key-label">Wallet address</p>
            <code>{wallet.address}</code>
            <p className="key-label">Private key</p>
            <code>{wallet.privateKey}</code>
          </div>
          <div className="inline-actions">
            <button className="action" onClick={onCopy} type="button">
              {copied ? "Private key copied" : "Copy private key"}
            </button>
            <button
              className="action secondary-action"
              onClick={onDismiss}
              type="button"
            >
              I saved it
            </button>
          </div>
        </>
      ) : (
        <p className="support-copy">
          Your next successful signup will reveal the generated BSC private key
          exactly in this recovery slot.
        </p>
      )}
    </section>
  );
}

export function App() {
  const match = createMatchSkeleton();
  const [signupEmail, setSignupEmail] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [loginPrivateKey, setLoginPrivateKey] = useState("");
  const [notice, setNotice] = useState<Notice | null>(
    convexWalletAuthTransport
      ? {
          body: "Create an account with email and username, or restore a seat with your saved private key.",
          title: "Wallet auth ready",
          tone: "neutral",
        }
      : {
          body: "Set VITE_CONVEX_URL before using signup or login. The auth UI is wired and waiting for a Convex deployment.",
          title: "Convex connection missing",
          tone: "warning",
        },
  );
  const [viewer, setViewer] = useState<ViewerIdentity | null>(null);
  const [viewerLoading, setViewerLoading] = useState(
    Boolean(convexWalletAuthTransport && getStoredAuthToken()),
  );
  const [pendingAction, setPendingAction] = useState<"login" | "signup" | null>(
    null,
  );
  const [revealedWallet, setRevealedWallet] = useState<LocalBscWallet | null>(
    null,
  );
  const [copiedPrivateKey, setCopiedPrivateKey] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function hydrateViewer() {
      if (!convexWalletAuthTransport || !getStoredAuthToken()) {
        if (!cancelled) {
          setViewer(null);
          setViewerLoading(false);
        }
        return;
      }

      try {
        const nextViewer = await loadViewerIdentity(convexWalletAuthTransport);
        if (!cancelled) {
          setViewer(nextViewer);
        }
      } catch (error) {
        clearAuthToken();
        syncConvexAuth();
        if (!cancelled) {
          setViewer(null);
          setNotice({
            body: getErrorMessage(error),
            title: "Stored session expired",
            tone: "warning",
          });
        }
      } finally {
        if (!cancelled) {
          setViewerLoading(false);
        }
      }
    }

    void hydrateViewer();

    return () => {
      cancelled = true;
    };
  }, []);

  async function refreshViewer() {
    if (!convexWalletAuthTransport) {
      setViewer(null);
      return;
    }

    setViewerLoading(true);
    try {
      const nextViewer = await loadViewerIdentity(convexWalletAuthTransport);
      setViewer(nextViewer);
    } finally {
      setViewerLoading(false);
    }
  }

  async function handleSignupSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!convexWalletAuthTransport) {
      setNotice({
        body: "Add VITE_CONVEX_URL to the web app environment before creating accounts.",
        title: "Convex not configured",
        tone: "warning",
      });
      return;
    }

    setPendingAction("signup");
    setCopiedPrivateKey(false);
    setNotice({
      body: "Generating a local wallet, requesting a signup challenge, and signing it in-browser.",
      title: "Creating wallet seat",
      tone: "neutral",
    });

    try {
      const result = await signUpWithGeneratedWallet(
        convexWalletAuthTransport,
        {
          email: signupEmail,
          username: signupUsername,
        },
      );

      storeAuthToken(result.session.token);
      syncConvexAuth();
      setRevealedWallet(result.wallet);
      setSignupEmail("");
      setSignupUsername("");
      setLoginPrivateKey("");
      await refreshViewer();
      setNotice({
        body: "Save the revealed private key now. It never passed through Convex and will be needed to restore access on a new device.",
        title: "Signup complete",
        tone: "success",
      });
    } catch (error) {
      setNotice({
        body: getErrorMessage(error),
        title: "Signup failed",
        tone: "error",
      });
    } finally {
      setPendingAction(null);
    }
  }

  async function handleLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!convexWalletAuthTransport) {
      setNotice({
        body: "Add VITE_CONVEX_URL to the web app environment before restoring a session.",
        title: "Convex not configured",
        tone: "warning",
      });
      return;
    }

    setPendingAction("login");
    setNotice({
      body: "Importing the private key locally, requesting a login challenge, and signing it in-browser.",
      title: "Restoring wallet session",
      tone: "neutral",
    });

    try {
      const result = await signInWithPrivateKey(
        convexWalletAuthTransport,
        loginPrivateKey,
      );

      storeAuthToken(result.session.token);
      syncConvexAuth();
      setLoginPrivateKey("");
      await refreshViewer();
      setNotice({
        body: `Seat restored for ${result.session.username}. The private key stayed local to this browser session.`,
        title: "Login complete",
        tone: "success",
      });
    } catch (error) {
      setNotice({
        body: getErrorMessage(error),
        title: "Login failed",
        tone: "error",
      });
    } finally {
      setPendingAction(null);
    }
  }

  function handleSignOut() {
    clearAuthToken();
    syncConvexAuth();
    setViewer(null);
    setNotice({
      body: "The local JWT was cleared. Use your saved private key to restore access again.",
      title: "Signed out",
      tone: "neutral",
    });
  }

  async function handleCopyPrivateKey() {
    if (
      !revealedWallet ||
      typeof navigator === "undefined" ||
      !navigator.clipboard
    ) {
      setNotice({
        body: "Clipboard access is unavailable in this browser. Copy the key manually before leaving this screen.",
        title: "Copy unavailable",
        tone: "warning",
      });
      return;
    }

    await navigator.clipboard.writeText(revealedWallet.privateKey);
    setCopiedPrivateKey(true);
    setNotice({
      body: "The private key is now in your clipboard. Store it in a password manager or hardware wallet workflow.",
      title: "Private key copied",
      tone: "success",
    });
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Phase 2 Wallet Auth</p>
          <h1>{APP_NAME}</h1>
          <p className="lede">
            Email and username create the player record. A fresh BSC wallet is
            generated in-browser, challenged by Convex, and signed locally so
            the private key never leaves the player’s machine.
          </p>
          <p className="support-copy">
            Human users and AI agents will share the same canonical user,
            wallet, and match surfaces. This step locks the human path first.
          </p>
        </div>
        <div className="hero-metrics">
          <div className="metric-card">
            <span className="metric-label">Convex</span>
            <strong>
              {convexWalletAuthTransport ? "Connected" : "Awaiting URL"}
            </strong>
          </div>
          <div className="metric-card">
            <span className="metric-label">Auth model</span>
            <strong>Challenge + signature</strong>
          </div>
          <div className="metric-card">
            <span className="metric-label">Private key</span>
            <strong>Browser only</strong>
          </div>
        </div>
      </section>

      <section className="workspace">
        <div className="workspace-header">
          <div>
            <p className="eyebrow">Player Access</p>
            <h2>Create or restore a seat</h2>
          </div>
          <p className="support-copy">
            Signup only asks for email and username. Login only asks for the
            saved private key and recreates the wallet locally before signing.
          </p>
        </div>

        <StatusBanner notice={notice} />

        <div className="auth-grid">
          <form className="auth-panel" onSubmit={handleSignupSubmit}>
            <p className="panel-kicker">New player</p>
            <h3>Create account + wallet</h3>
            <label className="field">
              <span>Email</span>
              <input
                autoComplete="email"
                disabled={pendingAction !== null}
                onChange={(event) => setSignupEmail(event.target.value)}
                placeholder="mage@lunchtable.gg"
                required
                type="email"
                value={signupEmail}
              />
            </label>
            <label className="field">
              <span>Username</span>
              <input
                autoCapitalize="off"
                autoComplete="username"
                disabled={pendingAction !== null}
                maxLength={24}
                minLength={3}
                onChange={(event) => setSignupUsername(event.target.value)}
                pattern="[A-Za-z0-9_]{3,24}"
                placeholder="tablemage"
                required
                type="text"
                value={signupUsername}
              />
            </label>
            <p className="microcopy">
              Submitting this form generates a new BSC keypair in the browser
              and creates the canonical user + wallet records through Convex.
            </p>
            <button
              className="action"
              disabled={pendingAction !== null}
              type="submit"
            >
              {pendingAction === "signup"
                ? "Creating wallet seat..."
                : "Create wallet seat"}
            </button>
          </form>

          <form
            className="auth-panel auth-panel-dark"
            onSubmit={handleLoginSubmit}
          >
            <p className="panel-kicker">Returning player</p>
            <h3>Restore with private key</h3>
            <label className="field">
              <span>Private key</span>
              <textarea
                autoCapitalize="off"
                disabled={pendingAction !== null}
                onChange={(event) => setLoginPrivateKey(event.target.value)}
                placeholder="0x..."
                required
                rows={6}
                value={loginPrivateKey}
              />
            </label>
            <p className="microcopy">
              The key is imported only in this browser session, the address is
              derived locally, and only the signed challenge goes to Convex.
            </p>
            <button
              className="action action-contrast"
              disabled={pendingAction !== null}
              type="submit"
            >
              {pendingAction === "login"
                ? "Restoring session..."
                : "Restore wallet session"}
            </button>
          </form>
        </div>

        <div className="utility-grid">
          <SessionPanel
            canSignOut={pendingAction === null}
            loading={viewerLoading}
            onSignOut={handleSignOut}
            viewer={viewer}
          />
          <PrivateKeyReveal
            copied={copiedPrivateKey}
            onCopy={handleCopyPrivateKey}
            onDismiss={() => {
              setRevealedWallet(null);
              setCopiedPrivateKey(false);
            }}
            wallet={revealedWallet}
          />
        </div>
      </section>

      <section className="panel panel-secondary">
        <div>
          <p className="eyebrow">Engine baseline</p>
          <h2>Current match kernel</h2>
          <dl className="stats">
            <div>
              <dt>Status</dt>
              <dd>{match.status}</dd>
            </div>
            <div>
              <dt>Version</dt>
              <dd>{match.version}</dd>
            </div>
            <div>
              <dt>Phase</dt>
              <dd>{match.phase}</dd>
            </div>
          </dl>
        </div>
        <div>
          <p className="eyebrow">Delivery gates</p>
          <h2>Bootstrap checklist</h2>
          <ul className="checklist">
            {bootstrapChecklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
