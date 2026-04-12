# justBoerenbridgeJS

Boerenbridge score app built with JavaScript.

Hosted at: [Github Pages](https://justist.github.io/justBoerenbridgeJS/)

## What it does

- Renders the app screens dynamically from JavaScript (single-page flow, no page reloads).
- Supports full game flow: setup, bidding, taking, and score overview.
- Includes configurable rules/settings (players, cards, trump behavior, dealer behavior).
- Persists active game and settings in `localStorage` so a refresh can restore state.

## Project structure (high level)

- `index.html`: minimal shell.
- `assets/js/`: split by feature (`core-*`, `game-*`, `ui-*`, bootstrap).
- `tests/e2e/app.spec.js`: Playwright regression suite.

## Local setup

```bash
npm install
npm run test:e2e:install
```

## Run tests

```bash
npm run test:e2e
npm run test:e2e:firefox
npm run test:e2e:webkit
npm run test:e2e:ci
```

## Debugging

```bash
npm run test:e2e:headed
npm run test:e2e:ui
```

CI runs in GitHub Actions (`.github/workflows/e2e-regression.yml`) on Chromium, Firefox, and WebKit.

