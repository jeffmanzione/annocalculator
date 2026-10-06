# End-to-end checks

Playwright scripts that drive a **built** copy of the app in headless Chromium. They exist because `ngc`/type-checking can't catch runtime behavior: both regressions found during the WorldStore migration (removing a middle island crashing, trade-route rows breaking after an edit) type-checked cleanly.

There's no test runner involved: each script is plain Node, prints PASS/FAIL (or SAME/DIFF) lines, and exits non-zero on failure.

## One-time setup

```sh
npm install
npx playwright install chromium
```

To use a Chromium other than the one Playwright installed (for example one preinstalled in a sandbox that doesn't match this Playwright version), set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to its path. In Claude's cloud sandbox that's `/opt/pw-browsers/chromium`.

## Build first

Both scripts serve an already-built `dist` folder; they don't build anything.

```sh
npx ng build --configuration development
```

To avoid silently testing old code, they refuse to run if the build's `index.html` is older than the newest file in the matching `src/` folder, and tell you to rebuild. Set `E2E_ALLOW_STALE=1` to test an old build on purpose. The check applies to any folder with the standard `<repo>/dist/annocalculator/browser` layout, so it covers baseline builds in a `git worktree` too; builds copied elsewhere skip it.

The development configuration is enough for these checks, and it avoids the production build's Google Fonts inlining (which needs network access to fonts.googleapis.com).

## `npm run e2e:smoke` — does the app still work?

```sh
npm run e2e:smoke                    # uses dist/annocalculator/browser
node e2e/smoke.mjs path/to/browser   # or any other build
```

Starts from the default world in a fresh browser profile and checks, among other things:

- renaming an island and editing a building count persist to localStorage, and the summary panel updates;
- adding an island keeps the existing `<island>` components alive (not destroyed and recreated), and the new island's edits persist;
- a specialist that substitutes an input good (the Baker swapping a Bakery's Flour for Grain) puts a glow on that icon and explains it in the tooltip, and taking the specialist off removes the glow;
- trade-route dropdowns: origin/destination exclude each other, pick up islands added or renamed elsewhere, list the origin island's goods; editing and then deleting a route works;
- removing the last island and a middle island removes the right one by id, and leaves the others' components alive;
- reloading restores the saved world; the trade-union bonus persists; no store-internal fields (`islandId`) leak into the saved JSON;
- no uncaught errors or console errors (network "Failed to load resource" messages are ignored).

## `npm run e2e:layout` — do the island tables fit?

```sh
npm run e2e:layout                    # uses dist/annocalculator/browser
node e2e/layout.mjs path/to/browser   # or any other build
```

Renders the default world at several desktop widths (1440 to 2560 px) in each language (English, German, Dutch, Chinese) and checks that no header word is wider than its column (a header breaking mid-word) that no computed value is clipped, and that each floating field label is a solid, fully edged plate in its field's fill, with the border running unbroken behind it and the plate staying within the field. The tables size their columns from their content rather than fixed pixel widths, so this is what catches a translation or a new column that no longer fits.

## `npm run e2e:label-edges` — does a field label's plate show both edges?

```sh
npm run e2e:label-edges                    # uses dist/annocalculator/browser
node e2e/label-edges.mjs path/to/browser   # or any other build
```

A floating field label sits in a small plate across the field's top border. A one-pixel line at a fractional position can vanish from one side on some displays, so this renders the page at display scales from 1x to 3x (including 1.25x and 1.5x) and reads the actual pixels where the plate stands against the panel, requiring a clearly darker edge on both the left and the right.

## `npm run e2e:tracking` — is the visit counting wired up?

```sh
npm run e2e:tracking                    # uses dist/annocalculator/browser
node e2e/tracking.mjs path/to/browser   # or any other build
```

Serves the built app to the browser as `https://annocalculator.com` (the only address the counter runs on) and replaces GoatCounter's script with a stub that records what it is asked to count, so nothing is ever sent and no test visits reach the real dashboard. Checks that the script is loaded and configured for the right site, that the first page and then each page navigated to are reported by path, and that a visitor sending Do Not Track or Global Privacy Control, or running the app from a local address, is not counted.

## `npm run e2e:diff -- <baseline> <candidate>` — did a refactor change what's saved?

```sh
npm run e2e:diff -- path/to/baseline/browser path/to/candidate/browser
```

Runs the same 15-step edit sequence (renames, a building count, toggling a trade union, changing a region, adding an island and a production line, editing/adding/removing trade routes, removing an island, the Palace prestige level) against both builds, and deep-diffs the saved world after every step. Ids are pseudorandom, so they're replaced with labels in first-seen order before comparing. Exits 1 if any step differs or either build logs an error. Key order counts: the saved text must match, not just the values.

To check that worlds saved by older versions still load and save the same, add `--seed <file>` (repeatable). Each file is put in localStorage before the app first loads, and the saved JSON after loading and after a reload is compared between the builds. Ready-made old saves are in `src/app/shared/mvc/__fixtures__/legacy-saves/`:

```sh
F=src/app/shared/mvc/__fixtures__/legacy-saves
npm run e2e:diff -- path/to/baseline/browser dist/annocalculator/browser --seed $F/no-ids-with-trade-union-bonus.json --seed $F/with-ids-and-explicit-defaults.json --seed $F/empty-world.json
```

To get a baseline build to compare against, copy a known-good `dist/annocalculator/browser` somewhere outside the repo (a copy outside the standard layout skips the stale-build check), or build an older commit in a `git worktree`.

A convenient way to get a baseline build of `main` without disturbing your checkout:

```sh
git worktree add ../annocalculator-baseline main
cd ../annocalculator-baseline
npm install            # or symlink/junction node_modules from the main checkout
npx ng build --configuration development
cd -
npm run e2e:diff -- ../annocalculator-baseline/dist/annocalculator/browser dist/annocalculator/browser
git worktree remove ../annocalculator-baseline
```

A `DIFF` isn't automatically a bug. It's a prompt to check whether the change was intended. For example, comparing against builds from before commit `31af495` shows newly added production lines saving `inputGoods: []` where the old code omitted the field. That's harmless, since every read falls back to `[]`.

## Notes

- Selectors rely on the app's current markup (`island`, `trade-routes-panel`, `aria-label`s on inputs, button text such as "Add Island"). Update them alongside UI changes.
- `settle()` is a fixed 300 ms pause after each action. If a check turns flaky on a slow machine, raising it in `support.mjs` is the first thing to try.
