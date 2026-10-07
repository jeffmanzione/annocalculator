# AnnoCalculator.com

A web-based production calculator for **Anno 1800** and **Anno 117: Pax Romana** that helps players model and optimize their supply chains—including all the complicated boosts, items and extra goods modifiers. Each game has its own tab with its own rules, and its own saved plan.

Built with ❤️ by a fan who got tired of using spreadsheets.

## 🌐 Live Site

Visit the tool here: [https://AnnoCalculator.com](https://AnnoCalculator.com)

## 🚀 Features

- 📦 **Production Planning** — Calculate how many buildings you need for each good, with every boost, item, cultural set and policy applied
- 🏛️ **Anno 117: Pax Romana** — Plan Latium and Albion: aqueducts, silos (and the extra goods they make), fuel, items and their boosted forms, discoveries (including the repeatable Beneath Bedrock, in 5% steps), patron deities with devotion, events, and fertilities an island may lack
- 🧱 **Anno 1800** — The Old World, Cape Trelawney, the New World and Enbesa, with the Palace's prestige level applying its Trade Union bonus to every line that has one
- 🛠️ **Bonus Simulation** — Stack boosts, items, cultural sets and extra goods; in Anno 117 a boosted item replaces its plain effect, exactly as in the game
- 🔍 **Every Number Explained** — Hover (or tap) an efficiency or a goods-per-minute figure to see each bonus that adds up to it, with the arithmetic, in both games
- 🧮 **Extra Goods** — A table under each production line lists what else it makes and from what (a silo's extra pig every third cycle, a specialist's chocolate), with its rate
- 🔁 **Input Substitution** — Items and specialists that swap an input good show both goods with their icons, and the substituted input glows
- 🌐 **Multi-Island Planning** — Balance production across islands with trade routes; the summary shows total and net production of every good and flags shortfalls
- 🎨 **Two Themes** — Anno 117's marble and wine (the default) or Anno 1800's parchment and brass, one click in the toolbar; your choice is remembered
- 📱 **Works on Your Phone** — A layout made for narrow screens: the page shows the islands, the summary or the trade routes one at a time, each production line is a card, tooltips open on a tap and targets are made for fingers. On a computer nothing changes
- 💾 **JSON Import/Export** — Save your setups or share them with others; your plan is also kept in your browser automatically, separately for each game
- 🌍 **Four Languages** — English, German, Dutch and Chinese

## 🖼️ Screenshots

![The Anno 117 calculator with three islands: discoveries, a patron, aqueducts, a silo with its extra goods, the summary and trade routes](https://github.com/jeffmanzione/annocalculator/blob/main/screenshots/anno117_whole.jpg 'The Anno 117 calculator')

### Two games, two looks

Each game has its own tab, its own rules and its own saved plan. Choose the look in the toolbar: Anno 117's marble and wine, or Anno 1800's parchment and brass. Either look works with either calculator.

|                                                                Anno 117 theme (default)                                                                 |                                                                       Anno 1800 theme                                                                        |
| :-----------------------------------------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------: |
| ![The Anno 117 calculator in its marble theme](https://github.com/jeffmanzione/annocalculator/blob/main/screenshots/theme_anno117.jpg 'Anno 117 theme') | ![The Anno 117 calculator in the parchment theme](https://github.com/jeffmanzione/annocalculator/blob/main/screenshots/theme_anno1800.jpg 'Anno 1800 theme') |

![The Anno 1800 calculator with three islands, the Palace prestige level, the summary and trade routes](https://github.com/jeffmanzione/annocalculator/blob/main/screenshots/whole_app.jpg 'The Anno 1800 calculator')

### See where every number comes from

Hover an efficiency or a goods-per-minute figure (tap it on a phone). The breakdown lists each bonus, and for goods per minute the base output with the arithmetic and what each extra of the same good adds, such as a silo. Both games work this way.

|                                                                                   Anno 117 efficiency                                                                                    |                                                                                        Anno 117 goods per minute                                                                                         |
| :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| ![A Pig Farm's 260%: base productivity, a silo and Mars's Armamentum](https://github.com/jeffmanzione/annocalculator/blob/main/screenshots/anno117_efficiency.png 'Anno 117 efficiency') | ![A Pig Farm's 13.9 a minute: its base production and what the silo adds](https://github.com/jeffmanzione/annocalculator/blob/main/screenshots/anno117_goods_per_minute.png 'Anno 117 goods per minute') |

|                                                                                         Anno 1800 efficiency                                                                                         |                                                                            Palace prestige level                                                                             |
| :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| ![Tooltip listing base productivity, the Palace Trade Union bonus and an item](https://github.com/jeffmanzione/annocalculator/blob/main/screenshots/efficiency_breakdown.png 'Efficiency breakdown') | ![The Palace prestige level dropdown with each level's bonus](https://github.com/jeffmanzione/annocalculator/blob/main/screenshots/palace_level.png 'Palace prestige level') |

### Plan each island (Anno 1800)

Add production lines, pick boosts, items and cultural sets, and read the efficiency, process time and output of every line. Extra goods (like the Fine Cake Decorator's chocolate) are listed under the line that produces them.

![An island with its production lines and a substituted input explained](https://github.com/jeffmanzione/annocalculator/blob/main/screenshots/island_editor.png 'Island editor')

### Specialists that swap inputs

When a specialist substitutes an input good, the good glows and its tooltip says what it replaces and which specialist does it, with both goods' icons.

![A glowing Grain input with a tooltip: replaces Flour, specialist Baker](https://github.com/jeffmanzione/annocalculator/blob/main/screenshots/substituted_input.png 'A substituted input')

### Totals and trade between islands

The summary shows total and net production of every good across all your islands (a shortfall turns red). Trade routes move goods between islands, and the net figures account for them.

![The summary of goods and the trade routes between islands](https://github.com/jeffmanzione/annocalculator/blob/main/screenshots/summary.png 'Summary and trade routes')

### On your phone

On a narrow screen the page shows one part at a time (Islands, Summary or Trade Routes), each production line is a labelled card with its extra goods beneath it, a tap opens a tooltip, and a tap on a good in the summary opens its islands.

|                                                                       The islands                                                                        |                                                                          A production line                                                                           |                                                                   A tap shows the breakdown                                                                   |                                                                            The summary                                                                            |
| :------------------------------------------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| ![The top of the Anno 117 page on a phone](https://github.com/jeffmanzione/annocalculator/blob/main/screenshots/mobile_top.jpg 'The islands on a phone') | ![A production line as a card, with its extra goods](https://github.com/jeffmanzione/annocalculator/blob/main/screenshots/mobile_cards.jpg 'A production line card') | ![A tooltip opened by a tap](https://github.com/jeffmanzione/annocalculator/blob/main/screenshots/mobile_tooltip.jpg 'A tap shows where a number comes from') | ![The summary on a phone, with one good opened](https://github.com/jeffmanzione/annocalculator/blob/main/screenshots/mobile_summary.jpg 'The summary on a phone') |

### In your language

English, German, Dutch and Chinese.

|                                                        Deutsch                                                        |                                                           中文                                                           |
| :-------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------: |
| ![The calculator in German](https://github.com/jeffmanzione/annocalculator/blob/main/screenshots/german.jpg 'German') | ![The calculator in Chinese](https://github.com/jeffmanzione/annocalculator/blob/main/screenshots/chinese.jpg 'Chinese') |

## 🧑‍💻 Tech Stack

- [Angular](https://angular.dev/) 22 — Standalone components, signals, zoneless change detection, `OnPush`
- [Angular Material](https://material.angular.dev/) — Form controls and tables, restyled with two Anno themes (the colours are CSS custom properties, so the theme can change while the app runs)
- [TypeScript](https://www.typescriptlang.org/) — Strict typing
- [SCSS](https://sass-lang.com/) — Styling
- [Vitest](https://vitest.dev/) + jsdom — Unit and component tests (run through `ng test`)
- [Playwright](https://playwright.dev/) — End-to-end checks of a built copy of the app
- Hosted as static files on AWS (S3 behind CloudFront). There is no backend: everything runs in the browser.

## 🗺️ What's in the Project

```
src/
  app/
    app.*                       Root component, routes (Anno 1800, Anno 117 and About pages) and app config
    games/                      What belongs to one game (see "Two games, one app" below)
      game.ts                   The GameDefinition contract and the GAME token the shared panels use
      anno1800/, anno117/       One folder per game, laid out the same way:
        <game>-page.*           The calculator page
        <game>-game.ts          The game's GameDefinition
        island/                 The island editor and its production line table
        model/                  The world's shape, its store, controllers and starter world
        game/                   The game's rules and facts (Anno 1800: enums, facts, icons, Palace; Anno 117: data types, data, rules)
        tooltips/               What the game's hover cards say
        data/                   The game's data (Anno 117's is generated; see "Data tools")
    components/                 Reusable UI pieces
      app-bar/                  The toolbar: site title, page tabs, language picker, version
      button/, card/            Themed button and panel
      enum-select/, enum-row/   A dropdown over enum values with icons and tooltips
      info-tooltip/             The hover card both games use (a game describes its thing as a TooltipModel)
      mobile-section-tabs/      The switch between the islands, the summary and the trade routes (shown on a phone only)
      stepper-input/            A number field with up/down arrows (a line's count, a repeatable discovery's %)
      extra-goods-table/        The table under a production line that lists its extra goods
      island-editor/            What both island editors share: the settings row, the Add Production Line button, the scrolling table area
      composite-number/         A number that explains how it was computed (hover for the breakdown)
      formatted-number/         Number formatting
      json-input/               Text box used by import/export
      text/                     The textLoc directive that renders localized text
    pages/
      about/                    About page
      calculator/               What both games' calculator pages share
        calculator-column/      The page's left column: default actions, global parameters card, island list
        calculator-page.*       Base class (local-storage key, saving on change, copy/edit/reset/clear) and the page layout styles
        summary-panel/          Totals across all islands, plus the warnings tooltip
        trade-routes-panel/     Goods moved between islands
        save-dialog/            Import / export of the whole world
    services/
      l10n/                     Current language and text lookup
      local-storage/            Typed wrapper over localStorage
      theme/                    The look the visitor chose (Anno 1800 parchment or Anno 117 marble), kept in the browser
    shared/
      engine/                   The game-independent parts of a world: the store (BaseWorldStore) and its controllers (BaseWorldController, ControllerCache)
      l10n/                     Every translated string, keyed by its English text
  tools/                        One-off maintenance scripts, not part of the app (see "Data tools")
  _mobile.scss                  Where the phone layout starts (windows under 900px wide); all of its styles sit inside it
  _anno-themes.scss             The colours and fonts of each theme; they become CSS custom properties
  _anno-palette.scss            Names for those colours that component styles use (they follow the chosen theme)
  _anno-material.scss           Angular Material theme overrides built from it
  styles.scss                   Global styles
public/                         Static files copied as-is: logo, fonts, and the game icons
e2e/                            Playwright checks of a built app (see e2e/README.md)
scripts/                        Deployment script and the AWS policy it needs
docs/reference/                 Design reference images
screenshots/                    Images used in this README
```

### Two games, one app

- **Each game is a folder under `src/app/games/`** with its own data, rules and saved format. Both are laid out the same way (see the tree above): Anno 1800's lives in `games/anno1800/`, Anno 117's in `games/anno117/`.
- **`GameDefinition`** (`games/game.ts`) is what the pieces both games share ask a game for: its goods, their icons and names in the language shown, and any goods a production line uses besides its recipe (Anno 1800's Silo and Fertilizer; Anno 117's coal and silo feed). The calculator page provides its game through the `GAME` token, and the shared summary and trade-route panels read it from there.
- **Routes.** Each game's calculator has its own address, `/anno-117-calculator` and `/anno-1800-calculator`, and is loaded only when someone opens it, so neither adds to the first download. `/calculator` (the Anno 1800 calculator's original address, which people have linked to), the site's front address and any unknown address lead to the Anno 117 calculator, unless the visitor has a saved Anno 1800 world and no Anno 117 one, who is taken to the Anno 1800 calculator (`defaultCalculator()` in `app.routes.ts`).
- **Saves are separate.** Anno 1800 keeps its original localStorage key and its bare-world JSON format exactly as before. Anno 117 uses its own key and a labelled, versioned envelope (`{ "game": "anno117", "version": 1, "world": ... }`) that is checked before it is used, so a world pasted into the wrong game is refused with a message instead of breaking the page. The language setting is shared.
- **`BaseWorldStore`** (`shared/engine/`) holds what any game's store needs: islands, lines and trade routes in id-keyed signal maps. Anno 117's store (`games/anno117/model/world-store-117.ts`) is built on it. Anno 1800's store (`games/anno1800/model/world-store-1800.ts`) is built on it too, and the two games' world controllers share a base class (`shared/engine/base-controllers.ts`).

### How Anno 117's numbers work

The rules are pure functions in `games/anno117/game/rules.ts`, checked in `rules.spec.ts` against numbers worked out by hand from the game data:

- **Productivity** = fertility × (100 + base bonuses) × (100 + productivity bonuses) / 10000. A building makes `60 / cycle time × productivity` cycles a minute.
- **Where bonuses come from:** items on the line (and their boosted form), the aqueduct, the silo, researched discoveries, the island's patron (an effect scaled by the devotion milestone reached), and events switched on for the island.
- **Fertility.** A building that needs a fertility the island lacks gets nothing, unless a discovery provides part of it.
- **Inputs and outputs.** Items can swap an input; some buffs add an extra output every few cycles (the silo's extra animal every third cycle).
- **Fuel.** Buildings that burn coal use one per 120 seconds, longer with fuel-saving buffs. The community calculator the data comes from works this out slightly differently (it scales with the cycle time); this is the one rule whose game behaviour has not been confirmed, so check it against the game.

### How the Anno 1800 calculator is put together

- **The world** is the user's whole plan: islands, each with production lines, plus trade routes and the Palace's prestige level. Its shape is defined in `src/app/games/anno1800/model/models.ts`.
- **`WorldStore1800`** (`model/world-store-1800.ts`) is the single source of truth while the page is open. It keeps islands, production lines and trade routes in flat, id-keyed signal maps. `fromWorld()` and `toWorld()` are the load/save boundary.
- **Controllers and views** (`model/world-controllers.ts`, `model/world-views.ts`) are what components talk to. Controllers can read and write; views are read-only and compute everything derived, such as efficiency, buildings needed and goods per minute.
- **Persistence.** The world is saved to the browser's `localStorage` whenever it changes and reloaded on the next visit. Real users have saved worlds, so **anything that changes the saved shape must still load old saves** (and `fromWorld()` is where that conversion happens). For example, worlds saved with a Trade Union bonus percentage are converted to a Palace prestige level on load. Defaults are left out of what is saved, to keep it small.
- **Localization.** All text lives in `src/app/shared/l10n/l10n.ts` as a key (the English text) mapped to English, German, Dutch and Chinese. Templates use `textLoc="Some Key"`. Adding a string means adding its key to the `L10nKey` type and all four translations.
- **Styling.** The theme is a set of Angular Material overrides over an Anno palette (`_anno-palette.scss`, `_anno-material.scss`). Table columns size themselves from their content rather than fixed widths, so translations fit; the e2e layout check guards this.

### Phones

Phones (windows under 900px wide) get their own layout; a desktop window looks exactly as it did before it existed. Everything for phones sits inside the `mobile` mixin of `src/_mobile.scss`, so it cannot reach a wider window.

- The toolbar becomes three short rows, and the page shows one part at a time (Islands, Summary or Trade Routes), chosen with a bar of tabs that stays at the top.
- Each production line is a card with labelled fields instead of a row of a wide table (the same cards for both games). The labels are hidden on a desktop.
- A finger cannot hover: a tap shows a tooltip, and a tap elsewhere hides it. Targets are made bigger.
- `e2e/mobile.mjs` (`npm run e2e:mobile`) checks that a phone-sized window never scrolls sideways, that the tabs, cards and tooltips work, and that targets are big enough. `e2e/desktop-shots.mjs` proves the desktop is untouched: take its screenshots before a change and after it, then compare. The screenshots in this README are made by `e2e/readme-screenshots.mjs` (build first, then run it), so that they can be taken again whenever the look changes.

## 🛠️ Development

### Prerequisites

- [Node.js](https://nodejs.org/) 26 or later
- [Git](https://git-scm.com/)
- For deploying only: the [AWS CLI](https://aws.amazon.com/cli/) with credentials (see [Deploying](#-deploying))

The Angular CLI is installed with the project dependencies; run it as `npx ng ...` or through the npm scripts.

### Setup

```bash
git clone https://github.com/jeffmanzione/annocalculator.git
cd annocalculator
npm install
```

### Running Locally

```bash
npm start
```

Open http://localhost:4200/. The page reloads as you edit. Your plan is stored in the browser, so a refresh keeps it; use the reset button in the app (or clear the site's storage) to start again from the default world.

### Testing

```bash
npm test                          # unit tests (Vitest via ng test); watches when run in a terminal
npm test -- --watch=false         # run once
```

Unit tests live beside the code they cover as `*.spec.ts` files. Some tests compare against saved snapshots in `__snapshots__/`; if you change a calculation on purpose, review the snapshot diff before accepting it.

End-to-end checks drive a **built** copy of the app in a headless browser. They catch things the type checker and unit tests can't, such as layout in each language or the page crashing after an edit:

```bash
npx playwright install chromium            # once
npx ng build --configuration development
npm run e2e:smoke                          # does the app still work end to end?
npm run e2e:layout                         # do the tables and field labels fit in every language and width?
npm run e2e:label-edges                    # do field label plates show both edges at different display scales?
npm run e2e:smoke-117                      # does the Anno 117 calculator work, and leave the Anno 1800 save alone?
npm run e2e:tracking                       # is the visit counting wired up (without sending any visits)?
```

See [`e2e/README.md`](e2e/README.md) for what each one checks. Rebuild before running them: they refuse to test a build that is older than the source.

### Formatting

The repository uses [Prettier](https://prettier.io/) (configuration in `.prettierrc`). Format the files you change:

```bash
npx prettier --write path/to/file
```

Format only the files you touched; running it over whole folders can reformat unrelated files and bury your change in noise.

### Data tools

`src/tools/` holds scripts that were used to build the Anno 1800 game data in `src/app/games/anno1800/data` and the icons in `public/icons` (for example `copy-items.ts` downloads item icons, and `produce-items.ts` turns raw item data into `items.json`). They are not part of the app or its build. Run one with `npx tsx src/tools/<script>.ts` from the repository root; most read local JSON files and some download from the web, so read a script before running it.

**Anno 117's data is generated.** `src/tools/anno117/convert-params.ts` builds `src/app/games/anno117/data/anno117-data.json` and the icons in `public/icons/anno117/` from the community Anno 117 calculator's `params.js`, keeping only what a production calculator uses. See [`NOTICE.md`](src/app/games/anno117/data/NOTICE.md) there for how to regenerate it after a game patch, and for the credits and licenses (the game's names, icons and values are © Ubisoft). `src/app/games/anno117/game/data.spec.ts` checks that a regeneration did not leave anything pointing at something that is missing.

## 📦 Building for Production

```bash
npm run build
```

The output is in `dist/annocalculator/browser`: an `index.html`, one hashed `main-*.js`, one hashed `styles-*.css`, and the static files from `public/`. To try the production build locally:

```bash
npm run serve-prod
```

The build has size budgets (`angular.json`). Exceeding the **warning** limits (1 MB initial bundle, 4 kB per component stylesheet) prints a warning and is currently normal; exceeding the **error** limits (1.5 MB, 8 kB) fails the build. Watch the component stylesheet budget when adding styles to a large component.

The production build inlines Google Fonts, so it needs network access to `fonts.googleapis.com`.

## 🚢 Releases and Branches

### Branching model

- **`main`** is the development branch. Everything lands here first. Its `package.json` version is always `0.0.0`; a local or dev build shows "v0.0.0" in the toolbar.
- **Release branches** are named `v<major>.<minor>.x` (`v2.1.x`, for example). Each is cut from `main` at the moment of the release, and its only extra commit is **"Set version to X.Y.Z"**, tagged `X.Y.Z`. Production is always deployed from a release branch, never from `main`, so the toolbar shows the real version.
- Day-to-day work happens on short-lived topic branches off `main`, one per change, with a descriptive name (`fix-field-label-backing`, `palace-prestige-level`). Merge to `main` as a fast-forward (rebase the topic branch onto `main` first if it has fallen behind, or squash it), push, and delete the topic branch.
- **Tags** are plain version numbers without a `v` (`2.1.0`); **branches** have the `v` and an `x` (`v2.1.x`).

Versions follow semantic versioning: **patch** (2.1.1) for bug fixes only, **minor** (2.2.0) for new features that keep old saved worlds working, **major** (3.0.0) for large or breaking changes.

### Cutting a release

From an up-to-date, clean `main` whose changes you want to ship:

```bash
git checkout main
git pull
npm test -- --watch=false                      # everything green first

git checkout -b v2.2.x                          # new release branch for the new minor version
npm version 2.2.0 --no-git-tag-version          # sets "version" in package.json and package-lock.json
git commit -am "Set version to 2.2.0"
git tag 2.2.0
npm run build                                   # confirm the production build works
```

Then [deploy](#-deploying), and publish:

```bash
git push origin v2.2.x
git push origin 2.2.0
gh release create 2.2.0 --verify-tag --title "2.2.0" --notes-file notes.md --latest
```

Write the release notes from the commits since the previous tag (`git log --oneline 2.1.0..2.2.0`), grouped as new features and fixes, in plain language for players.

### Bug fixes on a released version (cherry-picks)

Fix bugs on `main` first, so the fix is never lost from future releases, then bring the fix to the release branch that is live:

```bash
# 1. Fix it on main as usual (topic branch -> merge -> push) and note the commit hash.
git log --oneline -5                            # e.g. 5d3f2a1 Fix the thing

# 2. Apply it to the live release branch.
git checkout v2.1.x
git cherry-pick 5d3f2a1                         # repeat for each fix; use -x to record the original hash
npm test -- --watch=false                       # test on the release branch itself

# 3. Bump the patch version, tag, build.
npm version 2.1.1 --no-git-tag-version
git commit -am "Set version to 2.1.1"
git tag 2.1.1
npm run build

# 4. Deploy (below), then publish the branch, tag and release notes.
git push origin v2.1.x
git push origin 2.1.1
```

Notes:

- Only cherry-pick **fixes**. New features wait for the next minor release cut from `main`.
- If a cherry-pick conflicts, resolve it, `git add` the files and run `git cherry-pick --continue`. A conflict usually means the release branch is missing an earlier change the fix depends on; prefer cherry-picking that one too over rewriting the fix.
- The release branch can also carry a fix that doesn't apply to `main` any more (rare). Say so in the commit message.
- Release branches cut before a tooling change don't have it. For example, a release branch created before `npm run deploy` existed needs `git cherry-pick c6461a0` once to gain the deploy script.
- Start from the latest release branch unless you need to patch an older one on purpose.

### Rolling back

Each deploy records the previous `index.html` S3 version. To undo a release, restore that version of `index.html` and invalidate CloudFront again (below). The previous hashed bundles are still in the bucket.

## 🚀 Deploying

The site is a set of static files in an S3 bucket (`annocalculator-com`, region `us-east-2`) served through CloudFront. A deploy has an order that matters:

1. Upload the new hashed `main-*.js` and `styles-*.css` with a one-year immutable cache header. The old page keeps working while these land.
2. Upload any other changed static files (icons, fonts).
3. Upload `index.html` **last**, with `no-cache`. This is the switch: it is what points visitors at the new bundles.
4. Invalidate CloudFront (`/*`) so visitors see the new `index.html` right away.

### One-time setup

1. Install the AWS CLI.
2. Create credentials limited to this site. `scripts/deploy-policy.json` is the policy to attach: it can read and write the one bucket and invalidate the one distribution, and nothing else.

   ```bash
   aws iam create-user --user-name annocalculator-deploy
   aws iam put-user-policy --user-name annocalculator-deploy --policy-name deploy --policy-document file://scripts/deploy-policy.json
   aws iam create-access-key --user-name annocalculator-deploy
   aws configure --profile annocalculator-deploy
   ```

3. Use that profile when deploying (`AWS_PROFILE=annocalculator-deploy`). Never commit access keys to this repository.

### Deploying a release

Check out the release branch (a clean tree, version set):

```bash
git checkout v2.2.x
npm install
npm run deploy -- --dry-run      # builds, then lists what would be uploaded; changes nothing
npm run deploy                   # builds, uploads in the order above, invalidates, checks the live site
```

The script refuses to run with uncommitted changes, at version `0.0.0`, or if the build doesn't contain the version number. It prints the rollback target before uploading and, at the end, confirms the live site is serving the new bundles. Use `--skip-build` to deploy the existing `dist/` as it is.

### Checking a deploy

- Open https://annocalculator.com and confirm the version in the toolbar's upper right corner. Hard-refresh if you still see the old one.
- Click through the Calculator and About pages, change a count, and switch a language.

### Rolling back a deploy

```bash
# the version id was printed by the deploy; it can also be listed:
aws s3api list-object-versions --bucket annocalculator-com --prefix index.html --region us-east-2

aws s3api copy-object --bucket annocalculator-com --key index.html --region us-east-2 \
  --copy-source "annocalculator-com/index.html?versionId=<previous-version-id>" \
  --cache-control no-cache --content-type text/html --metadata-directive REPLACE
aws cloudfront create-invalidation --distribution-id E212U9B15HNWT6 --paths "/*"
```

## 📊 Usage Statistics

The live site counts visits with [GoatCounter](https://www.goatcounter.com): page views and the visitor's country, with no cookies and no personal data. The counts are on the dashboard at https://annocalculator.goatcounter.com.

- The code is in `src/app/services/analytics/analytics.ts`. It only runs on annocalculator.com, so local development, previews and the e2e checks are never counted, and it skips visitors who send Do Not Track or Global Privacy Control.
- `npm run e2e:tracking` checks the wiring without sending any real visits (see [`e2e/README.md`](e2e/README.md)).
- The dashboard is set up once at goatcounter.com: sign up with the site code `annocalculator` (the `GOATCOUNTER_CODE` constant) and the domain `annocalculator.com`. If you ever use a different code, change the constant.
- The About page tells visitors about this, in all four languages. Update that text if the tracking ever changes.

## 🐛 Contributing / Bug Reports

If you spot a bug or have an idea for a new feature:

1. Open an issue in this repo
2. Or submit a pull request
3. Or just email/message me—I'm always open to feedback!

For a pull request: branch from `main`, keep the change focused, add or update tests, run `npm test -- --watch=false` and the relevant `e2e:*` scripts, and format the files you touched with Prettier. If you change what is saved in the browser, make sure worlds saved by the previous version still load.

## 🙏 Credits

The Anno 117 game data comes from the community Anno 117 calculator by NiHoel and the [anno-mods](https://github.com/anno-mods/anno-117-calculator) project, which extracted it from the game (code under the MIT License; the game's names, icons and values belong to Ubisoft). Thank you to everyone who built and shared it.

## 📄 License

GNU GPL 3.0 License. See [LICENSE](https://github.com/jeffmanzione/annocalculator/blob/main/LICENSE) for more details.

## 🎮 About the Creator

I'm a long-time Anno player who built this tool after finding spreadsheets too limiting for managing complex production chains. This project is purely fan-made and not affiliated with Ubisoft.

> Anno is a trademark of Ubisoft. This tool is not endorsed by or associated with Ubisoft in any way.
