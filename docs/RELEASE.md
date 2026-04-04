# Release

Use this flow after the implementation phases are complete and `main` is the
candidate branch.

## Prerequisites

- local dependencies installed with `bun install`
- local Convex auth variables available through `.env.local`
- no uncommitted code changes except the intentional local `SESSION.md` handoff

## Release Proof

Run the self-contained release proof:

```bash
bun run release:proof
```

This does the following in order:

1. syncs local Convex auth variables
2. boots a local Convex backend if one is not already running
3. regenerates Convex bindings with `bunx convex codegen`
4. runs `./scripts/phase-check.sh full`
5. runs `./scripts/phase-check.sh regression`

The script prints the validated commit hash at the end. If the working tree is
dirty, it warns instead of silently treating that state as release-ready.

## Cut A Tag

After `bun run release:proof` passes on the commit you intend to ship:

```bash
git tag -a v0.1.0 -m "Lunch-Table release v0.1.0"
git push origin v0.1.0
```

## Recommended Release Notes

- gameplay/rules changes
- Convex schema or auth changes
- replay or bot parity changes
- CI or release gate changes
- known follow-up items that were intentionally deferred
