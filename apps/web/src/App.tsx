import { createMatchSkeleton } from "@lunchtable/game-core";
import { APP_NAME } from "@lunchtable/shared-types";

const bootstrapChecklist = [
  "Bun workspace configured",
  "React web shell online",
  "Bot runner package scaffolded",
  "Rules package under test",
];

export function App() {
  const match = createMatchSkeleton();

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Phase 1 Bootstrap</p>
        <h1>{APP_NAME}</h1>
        <p className="lede">
          The repository skeleton is live. Next up is Convex auth, match shell
          persistence, and the first authoritative gameplay mutation.
        </p>
      </section>

      <section className="panel">
        <h2>Current Match Skeleton</h2>
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
      </section>

      <section className="panel">
        <h2>Bootstrap Checklist</h2>
        <ul className="checklist">
          {bootstrapChecklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
