const { test, expect } = require("@playwright/test");

function screenLocator(page, id) {
  return page.locator(`#${id}`);
}

async function expectScreenActive(page, id) {
  const isHidden = await screenLocator(page, id).evaluate((el) => el.classList.contains("hidden"));
  expect(isHidden).toBe(false);
}

async function expectHasHiddenClass(page, selector, expectedHidden) {
  const isHidden = await page.locator(selector).evaluate((el) => el.classList.contains("hidden"));
  expect(isHidden).toBe(expectedHidden);
}

async function setPlayerName(page, index, name) {
  const input = page.locator(`#nameChoice-${index}`);
  await input.fill(name);
  await input.evaluate((el) => el.dispatchEvent(new Event("change", { bubbles: true })));
}

async function openSettings(page) {
  await page.getByRole("button", { name: "Instellingen" }).click();
  await expectScreenActive(page, "settingsScreen");
}

async function setBooleanSetting(page, settingId, value) {
  const radioId = value ? `${settingId}radioId2` : `${settingId}radioId1`;
  await page.locator(`#${radioId}`).check();
}

async function setNumberSetting(page, settingId, value) {
  const locator = page.locator(`#${settingId}numberId`);
  await locator.fill(String(value));
}

async function saveSettings(page) {
  await page.getByRole("button", { name: "Opslaan en terug naar overzicht" }).click();
  await expectScreenActive(page, "overviewScreen");
}

async function startGame(page, names, dealerIndex = 0) {
  await page.getByRole("button", { name: "Nieuw spel" }).first().click();
  await expectScreenActive(page, "newGameScreen");

  for (let i = 0; i < names.length; i++) {
    await setPlayerName(page, i, names[i]);
  }

  await page.locator(`#radioDealer-${dealerIndex}`).click();
  await expectHasHiddenClass(page, "#newGameButtonTable", false);
  await page.getByRole("button", { name: "Start 1e ronde" }).click();
  await expectScreenActive(page, "bidScreen");
}

async function startTwoPlayerGame(page) {
  await startGame(page, ["Alice", "Bob"], 0);
}

function cardsInRound(round) {
  if (round <= 10) {
    return round;
  }
  if (round === 11) {
    return 10;
  }
  return 22 - round;
}

async function completeRound(page, cards, isLastRound, chooseSpadeTrump = false) {
  if (chooseSpadeTrump) {
    const spadeSelectorVisible = await page.evaluate(() => {
      const row = document.getElementById("spadeRadioButtonsP");
      return row && !row.classList.contains("hidden");
    });
    if (spadeSelectorVisible) {
      await page.locator("#spadeRadioButton").check();
    }
  }

  await page.locator("#bidnumber00").click();
  await page.locator("#bidnumber10").click();
  await page.locator("#bidScreen").getByRole("button", { name: "Naar Halen" }).click();

  await expectScreenActive(page, "takeScreen");
  await page.locator(`#takenumber0${cards}`).click();
  await page.locator("#takenumber10").click();

  if (isLastRound) {
    await page.locator("#takeScreen").getByRole("button", { name: "Naar Score" }).click();
    return;
  }

  await page.locator("#takeScreen").getByRole("button", { name: "Naar Bieden" }).click();
  await expectScreenActive(page, "bidScreen");
}

async function readScoreTotals(page) {
  return page.evaluate(() => {
    const table = document.getElementById("scoreDataTable");
    const headers = Array.from(table.tHead.rows[0].cells).map((cell) => cell.textContent.trim());
    const bodyRows = Array.from(table.tBodies[0].rows);
    const totalsRow = bodyRows.find((row) => row.cells[0].textContent.trim() === "");

    return {
      alice: Number(totalsRow.cells[headers.indexOf("Alice")].textContent),
      bob: Number(totalsRow.cells[headers.indexOf("Bob")].textContent),
    };
  });
}

test.describe("Boerenbridge regression smoke tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("loads overview on first visit", async ({ page }) => {
    await expectScreenActive(page, "overviewScreen");
    await expect(page.getByRole("heading", { name: "Welkom bij Boerenbridge!" })).toBeVisible();
  });

  test("supports exact minimum players and reaches bid screen", async ({ page }) => {
    await startTwoPlayerGame(page);
    await expect(page.locator("#bidInputTable")).toContainText("Alice");
    await expect(page.locator("#bidInputTable")).toContainText("Bob");
  });

  test("persists active game across refresh", async ({ page }) => {
    await startTwoPlayerGame(page);

    await page.reload();

    await expectScreenActive(page, "bidScreen");
    await expect(page.locator("#bidInputTable")).toContainText("Alice");
    await expect(page.locator("#bidInputTable")).toContainText("Bob");
  });

  test("back from bid screen goes to score screen from round 2 onward", async ({ page }) => {
    await startTwoPlayerGame(page);

    await page.locator("#bidnumber00").click();
    await page.locator("#bidnumber10").click();
    await page.locator("#bidScreen").getByRole("button", { name: "Naar Halen" }).click();

    await expectScreenActive(page, "takeScreen");
    await page.locator("#takenumber01").click();
    await page.locator("#takenumber10").click();
    await page.locator("#takeScreen").getByRole("button", { name: "Naar Bieden" }).click();

    await expectScreenActive(page, "bidScreen");
    await expect(page.locator("#bidScreenTopInfo")).toContainText("2e ronde");

    await page.locator("#bidScreen").getByRole("button", { name: "Terug" }).click();

    await expectScreenActive(page, "scoreboardScreen");
    await expect(page.locator("#scoreDataTable")).toContainText("Alice");
    await expect(page.locator("#scoreDataTable")).toContainText("Bob");
    await expect(page.locator("#scoreDataTable")).toContainText("-3");
    await expect(page.locator("#scoreDataTable")).toContainText("10");
  });

  test("back from bid screen in first round returns to new game screen", async ({ page }) => {
    await startTwoPlayerGame(page);

    await page.locator("#bidScreen").getByRole("button", { name: "Terug" }).click();

    await expectScreenActive(page, "newGameScreen");
    await expect(page.locator("#nameChoice-0")).toHaveValue("Alice");
    await expect(page.locator("#nameChoice-1")).toHaveValue("Bob");
  });

  test("rules and settings screens do not render the header back button", async ({ page }) => {
    await page.getByRole("button", { name: "Regels & telling" }).click();
    await expectScreenActive(page, "gameRulesScreen");
    await expect(page.locator("#gameRulesScreen .btn.btn-outline-secondary")).toHaveCount(0);

    await page.getByRole("button", { name: "Terug naar overzicht" }).click();
    await expectScreenActive(page, "overviewScreen");

    await page.getByRole("button", { name: "Instellingen" }).click();
    await expectScreenActive(page, "settingsScreen");
    await expect(page.locator("#settingsScreen .btn.btn-outline-secondary")).toHaveCount(0);
  });

  test("setting roundWithoutTrump=false removes middle no-trump round", async ({ page }) => {
    await openSettings(page);
    await setBooleanSetting(page, "rwt", false);
    await saveSettings(page);

    await startTwoPlayerGame(page);
    const values = await page.evaluate(() => ({
      maxCards: GameState.maxCardsThisGame,
      maxRounds: GameState.maxRounds,
    }));

    expect(values.maxCards).toBe(10);
    expect(values.maxRounds).toBe(19);
  });

  test("setting spadeDouble=false hides trump selector on bid screen", async ({ page }) => {
    await openSettings(page);
    await setBooleanSetting(page, "sd", false);
    await saveSettings(page);

    await startTwoPlayerGame(page);
    await expectHasHiddenClass(page, "#spadeRadioButtonsP", true);
  });

  test("setting dealerLast=true is stored and places dealer row last", async ({ page }) => {
    await openSettings(page);
    await setBooleanSetting(page, "dl", true);
    await saveSettings(page);

    await startGame(page, ["Alice", "Bob", "Carol"], 1);
    const bidRowOrder = await page.evaluate(() =>
      Array.from(document.querySelectorAll("#bidInputTable tbody tr")).map((row) => row.id)
    );

    expect(bidRowOrder).toEqual(["bidPlayer2", "bidPlayer0", "bidPlayer1"]);
  });

  test("setting minPlayers enforces minimum required players", async ({ page }) => {
    await openSettings(page);
    await setNumberSetting(page, "minp", 3);
    await saveSettings(page);

    await page.getByRole("button", { name: "Nieuw spel" }).first().click();
    await expectScreenActive(page, "newGameScreen");

    await setPlayerName(page, 0, "Alice");
    await setPlayerName(page, 1, "Bob");
    await page.locator("#radioDealer-0").click();

    await expectHasHiddenClass(page, "#newGameButtonTable", true);
  });

  test("invalid new-game configuration: duplicate names shows alert and blocks start", async ({ page }) => {
    await page.getByRole("button", { name: "Nieuw spel" }).first().click();
    await expectScreenActive(page, "newGameScreen");

    await setPlayerName(page, 0, "Alice");
    await setPlayerName(page, 1, "Alice");
    await page.locator("#radioDealer-0").click();

    await expectHasHiddenClass(page, "#doublePlayerNamesAlert", false);
    await expectHasHiddenClass(page, "#newGameButtonTable", true);
  });

  test("invalid new-game configuration: clearing selected dealer name shows alert and blocks start", async ({ page }) => {
    await page.getByRole("button", { name: "Nieuw spel" }).first().click();
    await expectScreenActive(page, "newGameScreen");

    await setPlayerName(page, 0, "Alice");
    await setPlayerName(page, 1, "Bob");
    await page.locator("#radioDealer-1").click();
    await expectHasHiddenClass(page, "#newGameButtonTable", false);

    await setPlayerName(page, 1, "");

    await expectHasHiddenClass(page, "#noValidDealerAlert", false);
    await expectHasHiddenClass(page, "#newGameButtonTable", true);
  });

  test("setting maxPlayers limits the number of player rows", async ({ page }) => {
    await openSettings(page);
    await setNumberSetting(page, "maxp", 3);
    await saveSettings(page);

    await page.getByRole("button", { name: "Nieuw spel" }).first().click();
    await expectScreenActive(page, "newGameScreen");

    await expect(page.locator("#playerRow0")).toHaveCount(1);
    await expect(page.locator("#playerRow1")).toHaveCount(1);
    await expect(page.locator("#playerRow2")).toHaveCount(1);
    await expect(page.locator("#playerRow3")).toHaveCount(0);
  });

  test("setting maxCardsPossible caps cards and rounds", async ({ page }) => {
    await openSettings(page);
    await setNumberSetting(page, "maxc", 5);
    await saveSettings(page);

    await startTwoPlayerGame(page);
    const values = await page.evaluate(() => ({
      maxCards: GameState.maxCardsThisGame,
      maxRounds: GameState.maxRounds,
    }));

    expect(values.maxCards).toBe(5);
    expect(values.maxRounds).toBe(11);
  });

  test("combined settings apply correctly together", async ({ page }) => {
    await openSettings(page);
    await setBooleanSetting(page, "rwt", false);
    await setBooleanSetting(page, "sd", false);
    await setBooleanSetting(page, "dl", true);
    await setNumberSetting(page, "minp", 3);
    await setNumberSetting(page, "maxp", 4);
    await setNumberSetting(page, "maxc", 5);
    await saveSettings(page);

    await startGame(page, ["Alice", "Bob", "Carol"], 1);

    const settingsAndState = await page.evaluate(() => ({
      roundWithoutTrump: settings.getValue("roundWithoutTrump"),
      spadeDouble: settings.getValue("spadeDouble"),
      dealerLast: settings.getValue("dealerLast"),
      minPlayers: settings.getValue("minPlayers"),
      maxPlayers: settings.getValue("maxPlayers"),
      maxCardsPossible: settings.getValue("maxCardsPossible"),
      maxCardsThisGame: GameState.maxCardsThisGame,
      maxRounds: GameState.maxRounds,
    }));

    expect(settingsAndState.roundWithoutTrump).toBe(false);
    expect(settingsAndState.spadeDouble).toBe(false);
    expect(settingsAndState.dealerLast).toBe(true);
    expect(settingsAndState.minPlayers).toBe(3);
    expect(settingsAndState.maxPlayers).toBe(4);
    expect(settingsAndState.maxCardsPossible).toBe(5);
    expect(settingsAndState.maxCardsThisGame).toBe(5);
    expect(settingsAndState.maxRounds).toBe(9);
    await expectHasHiddenClass(page, "#spadeRadioButtonsP", true);
  });

  test("full game scoring matches scripted bid/take choices", async ({ page }) => {
    await startTwoPlayerGame(page);

    let expectedAlice = 0;
    let expectedBob = 0;

    // Strategy for every round:
    // - bids: Alice 0, Bob 0 (always valid, sum != cards)
    // - takes: Alice cardsInRound, Bob 0 (sum == cards)
    for (let round = 1; round <= 21; round++) {
      const cards = cardsInRound(round);
      await completeRound(page, cards, round === 21);

      expectedAlice += -3 * cards;
      expectedBob += 10;
    }

    await expectScreenActive(page, "scoreboardScreen");

    const totals = await readScoreTotals(page);

    expect(totals.alice).toBe(expectedAlice);
    expect(totals.bob).toBe(expectedBob);
  });

  test("full game scoring matches scripted choices with spade-double rounds", async ({ page }) => {
    await startTwoPlayerGame(page);

    let expectedAlice = 0;
    let expectedBob = 0;

    for (let round = 1; round <= 21; round++) {
      const cards = cardsInRound(round);
      await completeRound(page, cards, round === 21, true);

      const multiplier = round === 11 ? 1 : 2;
      expectedAlice += -3 * cards * multiplier;
      expectedBob += 10 * multiplier;
    }

    await expectScreenActive(page, "scoreboardScreen");

    const totals = await readScoreTotals(page);

    expect(totals.alice).toBe(expectedAlice);
    expect(totals.bob).toBe(expectedBob);
  });
});
