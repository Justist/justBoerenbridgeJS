const { test, expect } = require("@playwright/test");

function screenLocator(page, id) {
  return page.locator(`#${id}`);
}

async function expectScreenActive(page, id) {
  await expect(screenLocator(page, id)).not.toHaveClass(/(^|\s)hidden(\s|$)/);
}

async function setPlayerName(page, index, name) {
  const input = page.locator(`#nameChoice-${index}`);
  await input.fill(name);
  await input.evaluate((el) => el.dispatchEvent(new Event("change", { bubbles: true })));
}

async function startTwoPlayerGame(page) {
  await page.getByRole("button", { name: "Nieuw spel" }).first().click();
  await expectScreenActive(page, "newGameScreen");

  await setPlayerName(page, 0, "Alice");
  await setPlayerName(page, 1, "Bob");
  await page.locator("#radioDealer-0").click();

  await expect(page.locator("#newGameButtonTable")).not.toHaveClass(/(^|\s)hidden(\s|$)/);
  await page.getByRole("button", { name: "Start 1e ronde" }).click();

  await expectScreenActive(page, "bidScreen");
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

test.describe("Boerenbridge regression smoke tests", () => {
  test("loads overview on first visit", async ({ page }) => {
    await page.goto("/");
    await expectScreenActive(page, "overviewScreen");
    await expect(page.getByRole("heading", { name: "Welkom bij Boerenbridge!" })).toBeVisible();
  });

  test("supports exact minimum players and reaches bid screen", async ({ page }) => {
    await page.goto("/");
    await startTwoPlayerGame(page);
    await expect(page.locator("#bidInputTable")).toContainText("Alice");
    await expect(page.locator("#bidInputTable")).toContainText("Bob");
  });

  test("persists active game across refresh", async ({ page }) => {
    await page.goto("/");
    await startTwoPlayerGame(page);

    await page.reload();

    await expectScreenActive(page, "bidScreen");
    await expect(page.locator("#bidInputTable")).toContainText("Alice");
    await expect(page.locator("#bidInputTable")).toContainText("Bob");
  });

  test("give up button asks confirmation and returns to overview", async ({ page }) => {
    await page.goto("/");
    await startTwoPlayerGame(page);

    await page.locator("#bidnumber00").click();
    await page.locator("#bidnumber10").click();
    await page.getByRole("button", { name: "Naar Halen" }).click();

    await expectScreenActive(page, "takeScreen");
    await page.locator("#takenumber01").click();
    await page.locator("#takenumber10").click();
    await page.getByRole("button", { name: "Naar Score" }).click();

    await expectScreenActive(page, "scoreboardScreen");

    page.once("dialog", async (dialog) => {
      await dialog.accept();
    });
    await page.locator(".giveUpButton").click();

    await expectScreenActive(page, "overviewScreen");
    const saved = await page.evaluate(() => localStorage.getItem("justBoerenbridge.currentGame"));
    expect(saved).toBeNull();
  });

  test("rules and settings screens do not render the header back button", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Regels & telling" }).click();
    await expectScreenActive(page, "gameRulesScreen");
    await expect(page.locator("#gameRulesScreen .btn.btn-outline-secondary")).toHaveCount(0);

    await page.getByRole("button", { name: "Terug naar overzicht" }).click();
    await expectScreenActive(page, "overviewScreen");

    await page.getByRole("button", { name: "Instellingen" }).click();
    await expectScreenActive(page, "settingsScreen");
    await expect(page.locator("#settingsScreen .btn.btn-outline-secondary")).toHaveCount(0);
  });

  test("full game scoring matches scripted bid/take choices", async ({ page }) => {
    await page.goto("/");
    await startTwoPlayerGame(page);

    let expectedAlice = 0;
    let expectedBob = 0;

    // Strategy for every round:
    // - bids: Alice 0, Bob 0 (always valid, sum != cards)
    // - takes: Alice cardsInRound, Bob 0 (sum == cards)
    for (let round = 1; round <= 21; round++) {
      const cards = cardsInRound(round);

      await page.locator("#bidnumber00").click();
      await page.locator("#bidnumber10").click();
      await page.locator("#bidScreen").getByRole("button", { name: "Naar Halen" }).click();

      await expectScreenActive(page, "takeScreen");
      await page.locator(`#takenumber0${cards}`).click();
      await page.locator("#takenumber10").click();

      if (round < 21) {
        await page.locator("#takeScreen").getByRole("button", { name: "Naar Bieden" }).click();
        await expectScreenActive(page, "bidScreen");
      } else {
        await page.locator("#takeScreen").getByRole("button", { name: "Naar Score" }).click();
      }

      expectedAlice += -3 * cards;
      expectedBob += 10;
    }

    await expectScreenActive(page, "scoreboardScreen");

    const totals = await page.evaluate(() => {
      const table = document.getElementById("scoreDataTable");
      const headers = Array.from(table.tHead.rows[0].cells).map((cell) => cell.textContent.trim());
      const bodyRows = Array.from(table.tBodies[0].rows);
      const totalsRow = bodyRows.find((row) => row.cells[0].textContent.trim() === "");

      return {
        alice: Number(totalsRow.cells[headers.indexOf("Alice")].textContent),
        bob: Number(totalsRow.cells[headers.indexOf("Bob")].textContent),
      };
    });

    expect(totals.alice).toBe(expectedAlice);
    expect(totals.bob).toBe(expectedBob);
  });
});


