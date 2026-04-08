// ============================================================================

/**
 * Hide all screen divs
 */
function hideAllScreens() {
   for (const screenId of SCREEN_IDS) {
      const screen = document.getElementById(screenId);
      if (screen) {
         screen.classList.add("hidden");
      }
   }
}

/**
 * Reset all game statistics
 */
function resetGameState() {
   try {
      GameState.reset();
      clearSavedGameState();
      toggleElement(document.getElementById("takeScreenToBidsButton"), true);
      toggleElement(document.getElementById("scoreboardToBidButton"), true);
      toggleElement(document.getElementById("scoreboardToOtherButtons"), false);
      return true;
   } catch (e) {
      alert(`resetGameState: ${ e.message }`);
      return false;
   }
}

/**
 * Update round info display
 */
function updateRoundInfo(bidOrTake) {
   try {
      const id = `${ bidOrTake }ScreenTopInfo`;
      const cardCount = getCurrentCards();
      const cardText = cardCount > 1 ? "kaarten" : "kaart";
      const dealText = bidOrTake === "bid" ? "deelt" : "deelde";

      document.getElementById(id).textContent = formatString(
         "%se ronde, %s %s %s %s",
         GameState.currentRound,
         GameState.players[GameState.currentDealerIndex],
         dealText,
         cardCount,
         cardText
      );

      return updateBidsOrTakesDisplay(bidOrTake);
   } catch (e) {
      alert(`updateRoundInfo: ${ e.message }`);
      return false;
   }
}

/**
 * Navigate to new game screen
 */
function toNewGame(preservePlayers = false) {
   try {
      hideAllScreens();
      if (! preservePlayers) {
         resetGameState();
      } else {
         GameState.currentBids = [];
         GameState.currentTakes = [];
         GameState.bids = { 0 : [] };
         GameState.takes = { 0 : [] };
         GameState.scores = { 0 : [] };
         GameState.spadeTrump = { 0 : false };
         GameState.currentRound = 1;
         GameState.maxRounds = -1;
         GameState.maxCardsThisGame = -1;
      }
      toggleElement(document.getElementById("newGameScreen"), true);

      const now = new Date();
      const dateStr = formatString(
         "%s-%s-%s (%s:%s)",
         String(now.getDate()).padStart(2, "0"),
         String(now.getMonth() + 1).padStart(2, "0"),
         now.getFullYear(),
         String(now.getHours()).padStart(2, "0"),
         String(now.getMinutes()).padStart(2, "0")
      );

      document.getElementById("dateTimeScoreBoard").textContent = `Spel van ${ dateStr }`;

      GameState.jsonFileName = formatString(
         "bb%s_%s_%s_%s_%s",
         now.getFullYear(),
         String(now.getMonth() + 1).padStart(2, "0"),
         String(now.getDate()).padStart(2, "0"),
         String(now.getHours()).padStart(2, "0"),
         String(now.getMinutes()).padStart(2, "0")
      );

      setCurrentScreen("newGameScreen");
      const ready = createPlayersTable();
      if (ready && preservePlayers) {
         restoreNewGameFormFromState();
      }
      return ready;
   } catch (e) {
      alert(`toNewGame: ${ e.toString() }`);
      return false;
   }
}

/**
 * Navigate to bidding screen
 */
function restoreBidOrTakeSelections(bidOrTake) {
   const selectionArray = bidOrTake === "bid" ? GameState.currentBids : GameState.currentTakes;

   for (let playerIndex = 0; playerIndex < selectionArray.length; playerIndex++) {
      const selectedNumber = selectionArray[playerIndex];
      if (selectedNumber === undefined || selectedNumber === null) {
         continue;
      }

      const playerRow = document.getElementById(`${ bidOrTake }Player${ playerIndex }`);
      if (playerRow) {
         clickBidOrTakeButton(playerRow, selectedNumber, playerIndex, bidOrTake);
      }
   }

   return true;
}

function toBids(preserveSelections = false) {
   try {
      hideAllScreens();
      if (! preserveSelections) {
         GameState.currentBids = [];
      }
      toggleElement(document.getElementById("bidScreen"), true);

      const spadeAlert = document.getElementById("spadeTrumpSelectAlert");
      const spadeRadioButtonsP = document.getElementById("spadeRadioButtonsP");
      const spadeRadioButtons = getInputFieldsByType(spadeRadioButtonsP, "radio");

      const spadeDouble = settings.getValue("spadeDouble");
      const isMiddleRound = settings.getValue("roundWithoutTrump") &&
                            (GameState.currentRound === GameState.maxCardsThisGame + 1);
      const shouldHideSpade = (isMiddleRound || ! spadeDouble);

      for (const button of spadeRadioButtons) {
         button.checked = false;
      }

      const restoredTrump = preserveSelections ? GameState.spadeTrump[GameState.currentRound] : undefined;
      if (restoredTrump === true && spadeRadioButtons.length > 0) {
         spadeRadioButtons[0].checked = true;
      } else if (spadeRadioButtons.length > 1) {
         spadeRadioButtons[1].checked = true;
      }

      toggleElement(spadeAlert, false);
      toggleElement(spadeRadioButtonsP, ! shouldHideSpade);
      toggleElement(document.getElementById("middleRoundText"), isMiddleRound);

      const ready = updateRoundInfo("bid") && createBidTable();
      if (ready && preserveSelections) {
         restoreBidOrTakeSelections("bid");
      }
      setCurrentScreen("bidScreen");
      return ready;
   } catch (e) {
      alert(`toBids: ${ e.toString() }`);
      return false;
   }
}

/**
 * Create bid table and headers
 */
function createBidTable() {
   try {
      const table = createBidTakeTable("bid");
      return createStretchTableHead(table, ["Spelers", "Scores", "Bieden"], getCurrentCards() + 1);
   } catch (e) {
      alert(`createBidTable: ${ e.message }`);
      return false;
   }
}

/**
 * Navigate to takes screen
 */
function toTakes(preserveSelections = false) {
   try {
      hideAllScreens();
      if (! preserveSelections) {
         GameState.currentTakes = [];
      }
      toggleElement(document.getElementById("takeScreen"), true);

      const isMiddleRound = settings.getValue("roundWithoutTrump") &&
                            (GameState.currentRound === GameState.maxCardsThisGame + 1);

      toggleElement(document.getElementById("spadeTrumpTakeScreen"), ! isMiddleRound);

      const ready = updateRoundInfo("take") && createTakeTable();
      if (ready && preserveSelections) {
         restoreBidOrTakeSelections("take");
      }
      setCurrentScreen("takeScreen");
      return ready;
   } catch (e) {
      alert(`toTakes: ${ e.toString() }`);
      return false;
   }
}

/**
 * Create take table and headers
 */
function createTakeTable() {
   try {
      const table = createBidTakeTable("take");
      if (GameState.currentRound === GameState.maxRounds) {
         toggleElement(document.getElementById("takeScreenToBidsButton"), false);
      }
      return createStretchTableHead(table,
                                    ["Spelers", "Scores", "Geboden", "Gehaald"],
                                    getCurrentCards() + 1);
   } catch (e) {
      alert(`createTakeTable: ${ e.message }`);
      return false;
   }
}

/**
 * Navigate to scores screen
 */
function toScores() {
   try {
      hideAllScreens();
      const scoresDiv = document.getElementById("scoreboardScreen");
      scoresDiv.classList.remove("hidden");
      setCurrentScreen("scoreboardScreen");
      return createScoreBoard();
   } catch (e) {
      alert(`toScores: ${ e.toString() }`);
      return false;
   }
}

/**
 * Navigate to game rules screen
 */
function toGameRules() {
   try {
      hideAllScreens();
      setCurrentScreen("gameRulesScreen");
      return toggleElement(document.getElementById("gameRulesScreen"), true);
   } catch (e) {
      alert(`toGameRules: ${ e.toString() }`);
      return false;
   }
}

/**
 * Navigate to settings screen
 */
function toSettings() {
   try {
      hideAllScreens();
      setCurrentScreen("settingsScreen");
      return createSettingsScreen();
   } catch (e) {
      alert(`toSettings: ${ e.message }`);
      return false;
   }
}

/**
 * Navigate to overview screen
 */
function toOverview() {
   try {
      hideAllScreens();
      settings = new Settings();
      setCurrentScreen("overviewScreen");
      return loadSettings() && toggleElement(document.getElementById("overviewScreen"), true);
   } catch (e) {
      alert(`toOverview: ${ e.toString() }`);
      return false;
   }
}

// ============================================================================
// INITIALIZATION
