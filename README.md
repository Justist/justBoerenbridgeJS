# justBoerenbridgeJS

Boerenbridge score app (static frontend, GitHub Pages friendly).

## Automated Regression Testing

This project includes Playwright end-to-end tests to detect functional regressions in core flows:

- first-load overview rendering
- new-game setup and minimum-player behavior
- game state restore after refresh
- score-screen give-up flow with confirmation
- rules/settings header button behavior

### Install

```bash
npm install
npx playwright install chromium
```

### Run tests

```bash
npm run test:e2e
```

### Run headed (local debugging)

```bash
npm run test:e2e:headed
```

### CI mode

```bash
npm run test:e2e:ci
```

