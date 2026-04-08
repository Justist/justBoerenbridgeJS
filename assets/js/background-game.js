// UI CREATION FUNCTIONS
// ============================================================================

/**
 * Create table header
 */
function createTableHead(table, rowData) {
   try {
      const head = table.createTHead();
      const row = head.insertRow();
      for (const data of rowData) {
         const th = document.createElement("th");
         th.textContent = data;
         row.appendChild(th);
      }
      return row;
   } catch (e) {
      alert(`createTableHead: ${ e.message }`);
      return null;
   }
}

/**
 * Create table header with colspan for last column
 */
function createStretchTableHead(table, rowData, colspanCount) {
   try {
      const headRow = createTableHead(table, rowData.slice(0, -1));
      const th = document.createElement("th");
      th.setAttribute("colspan", colspanCount);
      th.textContent = rowData[rowData.length - 1];
      headRow.appendChild(th);
      return true;
   } catch (e) {
      alert(`createStretchTableHead: ${ e.message }`);
      return false;
   }
}

/**
 * Create players table for new game setup
 */
function createPlayersTable() {
   try {
      const playerTable = document.getElementById("newGameInputTable");
      clearElement(playerTable);

      const maxPlayers = settings.getValue("maxPlayers");
      for (let playerIndex = 0; playerIndex < maxPlayers; playerIndex++) {
         const row = playerTable.insertRow();
         if (playerIndex > 1) {
            toggleElement(row, false);
         }
         row.id = `playerRow${ playerIndex }`;

         // Dealer radio button cell
         const dealerCell = row.insertCell(0);
         dealerCell.classList.add("vertCenter");
         dealerCell.addEventListener("click", () => {
            updatePlayers(playerIndex, "-1");
         });

         const radioButton = createRadioButton(
            "firstDealer",
            `radioDealer-${ playerIndex }`,
            "vertCenter",
            false
         );
         dealerCell.appendChild(radioButton);

         // Name input cell
         const nameCell = row.insertCell(1);
         nameCell.classList.add("vertCenter");

         const nameInput = document.createElement("input");
         nameInput.classList.add("form-control");
         nameInput.id = `nameChoice-${ playerIndex }`;
         nameInput.setAttribute("list", "nameList");
         nameInput.setAttribute("placeholder", "Kies een speler of typ een naam");
         nameInput.addEventListener("change", (e) => {
            updatePlayers(playerIndex, e.target.value);
         });
         nameCell.appendChild(nameInput);

         // Datalist for suggestions
         const nameList = document.createElement("datalist");
         nameList.id = "nameList";
         for (const playerName of GameState.regularPlayers) {
            const option = document.createElement("option");
            option.value = playerName;
            option.textContent = playerName;
            nameList.appendChild(option);
         }
         nameCell.appendChild(nameList);
      }

      if (GameState.debug) {
         toggleElement(document.getElementById("debugSetMaxCardsDiv"), true);
      }

      return createTableHead(playerTable, ["Eerste deler", "Namen spelers"]);
   } catch (e) {
      alert(`createPlayersTable: ${ e.message }`);
      return false;
   }
}

/**
 * Show player fields from given index onwards
 */
function showNextPlayerFields(index) {
   try {
      const maxPlayers = settings.getValue("maxPlayers");
      for (let i = index + 1; i < maxPlayers; i++) {
         const row = document.getElementById(`playerRow${ i }`);
         toggleElement(row, true);

         // Only show one empty line
         const input = document.getElementById(`nameChoice-${ i }`);
         if (input.value === "") {
            break;
         }
      }
      return true;
   } catch (e) {
      alert(`showNextPlayerFields: ${ e.message }`);
      return false;
   }
}

/**
 * Hide player fields from given index onwards
 */
function hideNextPlayerFields(index) {
   try {
      const maxPlayers = settings.getValue("maxPlayers");
      for (let i = index + 1; i < maxPlayers; i++) {
         const row = document.getElementById(`playerRow${ i }`);
         toggleElement(row, false);
      }
      return true;
   } catch (e) {
      alert(`hideNextPlayerFields: ${ e.message }`);
      return false;
   }
}

/**
 * Create bid/take input table
 */
function createBidTakeTable(bidOrTake) {
   try {
      const table = document.getElementById(`${ bidOrTake }InputTable`);
      clearElement(table);

      const currentCards = getCurrentCards();
      const currentScores = calculateTotalScores();

      for (let i = 0; i < GameState.players.length; i++) {
         let row;

         // Keep dealer in the last row by placing post-dealer players before existing rows.
         if (settings.getSetting("dealerLast")?.value === true) {
            if (i > GameState.currentDealerIndex) {
               const insertIndex = i - GameState.currentDealerIndex - 1;
               row = table.insertRow(insertIndex);
            } else {
               row = table.insertRow(table.rows.length);
            }
         }
         else {
            row = table.insertRow();
         }

         row.id = `${ bidOrTake }Player${ i }`;

         // Player name cell
         const nameCell = row.insertCell(0);
         nameCell.classList.add(`${ bidOrTake }Name`);
         nameCell.textContent = GameState.players[i];
         if (i === GameState.currentDealerIndex) {
            nameCell.textContent += "*";
         }

         // Score cell
         const scoreCell = row.insertCell(1);
         scoreCell.textContent = currentScores[i] || 0;

         // Bid cell (for takes)
         if (bidOrTake === "take") {
            const bidCell = row.insertCell(2);
            bidCell.textContent = GameState.bids[GameState.currentRound][i];
         }

         // Number cells (0 to currentCards)
         for (let cell_number = 0; cell_number <= currentCards; cell_number++) {
            const numberCell = row.insertCell(-1);
            numberCell.id = `${ bidOrTake }number${ i }${ cell_number }`;
            numberCell.textContent = `${ cell_number }`;
            numberCell.addEventListener("click", () => {
               clickBidOrTakeButton(row, cell_number, i, bidOrTake);
            });
         }
      }

      // Update spade trump display for takes
      if (bidOrTake === "take") {
         const spadeText = document.getElementById("spadeTrumpTakeScreen");
         spadeText.textContent = GameState.spadeTrump[GameState.currentRound]
                                 ? "Schoppenrondje!"
                                 : "Normale ronde";
      }

      return table;
   } catch (e) {
      alert(`createBidTakeTable: ${ e.message }`);
      return null;
   }
}

/**
 * Clear highlighting for a player's bid/take selections
 */
function clearHighlights(playerIndex, bidOrTake) {
   try {
      const currentCards = getCurrentCards();
      for (let number = 0; number <= currentCards; number++) {
         const cell = document.getElementById(`${ bidOrTake }number${ playerIndex }${ number }`);
         if (cell.classList.contains("highlighted")) {
            cell.classList.remove("highlighted");
         }
         cell.classList.add("unhighlighted");
      }
      return true;
   } catch (e) {
      alert(`clearHighlights: ${ e.message }`);
      return false;
   }
}

// ============================================================================
// EVENT HANDLERS & NAVIGATION
// ============================================================================

/**
 * Update player fields based on name change or dealer selection
 */
function updatePlayers(index, value) {
   try {
      let result;
      let currentDealer = index;

      const notEnoughPlayersAlert = document.getElementById("notEnoughPlayersAlert");
      const noValidDealerAlert = document.getElementById("noValidDealerAlert");
      const doublePlayerNamesAlert = document.getElementById("doublePlayerNamesAlert");
      const buttonElement = document.getElementById("newGameButtonTable");

      if (value === "-1") {
         // Dealer radio button clicked
         document.getElementById(`radioDealer-${ index }`).checked = true;
         result = true;
      } else {
         // Player name changed
         currentDealer = getCheckedRadioIndex(document.getElementById("newGameForm"));
         result = value ? showNextPlayerFields(index) : hideNextPlayerFields(index);
      }

      const conditionValidDealer = checkDealerValidity(currentDealer);
      const conditionEnoughPlayers =
         findFirstHiddenNameField() >= settings.getValue("minPlayers");
      const conditionNoDoublePlayers = checkNoDuplicatePlayers();

      return result &&
             toggleElement(noValidDealerAlert, ! conditionValidDealer) &&
             toggleElement(notEnoughPlayersAlert, ! conditionEnoughPlayers) &&
             toggleElement(doublePlayerNamesAlert, ! conditionNoDoublePlayers) &&
             toggleElement(buttonElement,
             conditionEnoughPlayers && conditionValidDealer && conditionNoDoublePlayers);
   } catch (e) {
      alert(`updatePlayers: ${ e.message }`);
      return false;
   }
}

/**
 * Store player selections and move to bidding screen
 */
function storePlayers() {
   try {
      const localPlayers = new Set();
      const playerForm = document.getElementById("newGameForm");
      const currentDealerIndex = getCheckedRadioIndex(playerForm);
      const selectFields = getElementsBySelector(playerForm, "input[list]");

      for (let i = 0; i < selectFields.length; i++) {
         const name = selectFields[i].value;
         if (name) {
            localPlayers.add(name);
         } else {
            break; // Stop at first empty field
         }
      }

      GameState.players = Array.from(localPlayers);
      GameState.currentDealerIndex = currentDealerIndex;

      // Calculate max cards
      if (GameState.debug) {
         const maxCardsInput = document.getElementById("debugSetMaxCardsInput").value;
         if (maxCardsInput) {
            GameState.maxCardsThisGame = parseInt(maxCardsInput, 10);
         }
      } else {
         const cardsPerPlayer = Math.floor(52 / GameState.players.length);
         const shouldReduceByOne = 52 % GameState.players.length === 0 ? 1 : 0;
         GameState.maxCardsThisGame = Math.min(
            cardsPerPlayer - shouldReduceByOne,
            settings.getValue("maxCardsPossible")
         );
      }

      GameState.maxRounds = (GameState.maxCardsThisGame * 2) +
                            (settings.getValue("roundWithoutTrump") ? 1 : -1);

      // Initialize scores array
      for (let _ of GameState.players) {
         GameState.scores[0].push(0);
      }

      saveGameState("bid");
      return toBids();
   } catch (e) {
      alert(`storePlayers: ${ e.message }`);
      return false;
   }
}

/**
 * Handle bid or take button click
 */
function clickBidOrTakeButton(playerRow, number, playerIndex, bidOrTake) {
   try {
      clearHighlights(playerIndex, bidOrTake);

      const offset = bidOrTake === "bid" ? 2 : 3;
      if (bidOrTake === "bid") {
         GameState.currentBids[playerIndex] = number;
      } else {
         GameState.currentTakes[playerIndex] = number;
      }

      const cellToHighlight = playerRow.children[number + offset];
      cellToHighlight.classList.remove("unhighlighted");
      cellToHighlight.classList.add("highlighted");

      saveGameState(bidOrTake);
      return updateBidsOrTakesDisplay(bidOrTake);
   } catch (e) {
      alert(`clickBidOrTakeButton: ${ e.message }`);
      return false;
   }
}

/**
 * Update bid/take display and button visibility
 */
function updateBidsOrTakesDisplay(bidOrTake) {
   try {
      const isBidScreen = bidOrTake === "bid";
      const infoRowId = isBidScreen ? "bidInfoRow" : "takeInfoRow";
      const infoRow = document.getElementById(infoRowId);
      const currentArray = isBidScreen ? GameState.currentBids : GameState.currentTakes;
      const currentCards = getCurrentCards();

      // Calculate sum and number of selected values in one pass.
      let sum = 0;
      let filledCount = 0;
      for (const num of currentArray) {
         if (num !== undefined && num !== null) {
            sum += num;
            filledCount++;
         }
      }

      infoRow.textContent = `${ sum } / ${ currentCards }`;

      const equalSum = sum === currentCards;
      const allFilled = filledCount === GameState.players.length;
      const spadeRadioChecked = isBidScreen
                                ? getCheckedRadioIndex(document.getElementById("spadeRadioButtonsP"))
                                  !== -1
                                : true;

      const equalAlert = document.getElementById(`${ bidOrTake }sEqualAlert`);
      const filledAlert = document.getElementById(`${ bidOrTake }sFilledAlert`);
      const spadeAlert = document.getElementById("spadeTrumpSelectAlert");
      const buttonElement = document.getElementById(`${ bidOrTake }ScreenButtonsTable`);

      const shouldShowEqualAlert = isBidScreen ? equalSum : ! equalSum;
      const shouldEnableButton = (isBidScreen ? ! equalSum : equalSum)
                                 && allFilled
                                 && spadeRadioChecked;

      toggleElement(equalAlert, shouldShowEqualAlert);
      toggleElement(filledAlert, ! allFilled);
      if (isBidScreen) {
         toggleElement(spadeAlert, ! spadeRadioChecked);
      }
      toggleElement(buttonElement, shouldEnableButton);

      return true;
   } catch (e) {
      alert(`updateBidsOrTakesDisplay: ${ e.message }`);
      return false;
   }
}

/**
 * Store bids and move to takes screen
 */
function storeBids() {
   try {
      GameState.bids[GameState.currentRound] = GameState.currentBids;
      GameState.spadeTrump[GameState.currentRound] =
         document.getElementById("spadeRadioButton").checked;
      saveGameState("take");
      return toTakes();
   } catch (e) {
      alert(`storeBids: ${ e.message }`);
      return false;
   }
}

/**
 * Store takes and move to scores or back to bids
 */
function storeTakes(bidButtonPressed) {
   try {
      GameState.takes[GameState.currentRound] = GameState.currentTakes;
      const scoresUpdated = updateScores();

      GameState.currentRound++;
      GameState.currentDealerIndex++;
      GameState.currentDealerIndex %= GameState.players.length;

      const continueGame = bidButtonPressed && (GameState.currentRound <= GameState.maxRounds);
      saveGameState(continueGame ? "bid" : "score");
      return scoresUpdated && (continueGame ? toBids() : toScores());
   } catch (e) {
      alert(`storeTakes: ${ e.message }`);
      return false;
   }
}

/**
 * Handle score cell click to toggle display
 */
function clickScoreCell(element, round, playerIndex) {
   try {
      const clicked = element.getAttribute("clicked");

      if (clicked === "true") {
         element.textContent = GameState.scores[round][playerIndex];
         element.setAttribute("clicked", "false");
      } else if (clicked === "false") {
         element.textContent = formatString(
            "%s / %s",
            GameState.bids[round][playerIndex],
            GameState.takes[round][playerIndex]
         );
         element.setAttribute("clicked", "true");
      } else {
         alert("Invalid clicked attribute value!");
         return false;
      }

      return true;
   } catch (e) {
      alert(`clickScoreCell: ${ e.message }`);
      return false;
   }
}

/**
 * Create scoreboard for current game state
 */
function createScoreBoard() {
   try {
      const scoreTable = document.getElementById("scoreDataTable");
      clearElement(scoreTable);

      const totalScores = calculateTotalScores();
      const spadeDouble = settings.getValue("spadeDouble");

      for (let round = 0; round < GameState.currentRound; round++) {
         const scoreRow = scoreTable.insertRow();

         // Round number
         const roundCell = scoreRow.insertCell(0);
         roundCell.textContent = round === 0 ? "" : round;

         // Card count
         const cardsCell = scoreRow.insertCell(1);
         cardsCell.textContent = round === 0 ? "" : getCurrentCards(round);

         // Spade trump indicator
         if (spadeDouble) {
            const spadeCell = scoreRow.insertCell(2);
            const isMiddleRound = settings.getValue("roundWithoutTrump") &&
                                  (round === GameState.maxCardsThisGame + 1);
            spadeCell.textContent =
               isMiddleRound ? "NVT" : (GameState.spadeTrump[round] ? "\u2660" : "");
         }

         // Player scores
         for (let playerIndex = 0; playerIndex < GameState.players.length; playerIndex++) {
            const scoreCell = scoreRow.insertCell(-1);

            if (round === 0) {
               scoreCell.textContent = totalScores[playerIndex];
            } else {
               scoreCell.textContent = GameState.scores[round][playerIndex];
               scoreCell.setAttribute("clicked", "false");
               scoreCell.addEventListener("click", () => {
                  clickScoreCell(scoreCell, round, playerIndex);
               });
            }
         }
      }

      // Update button visibility
      if (GameState.currentRound > GameState.maxRounds) {
         toggleElement(document.getElementById("scoreboardToBidButton"), false);
         toggleElement(document.getElementById("scoreboardToOtherButtons"), true);
      }

      const rowData = ["Ronde", "Kaarten", ...GameState.players];
      if (spadeDouble) {
         rowData.splice(2, 0, "\u2660");
      }

      return createTableHead(scoreTable, rowData);
   } catch (e) {
      alert(`createScoreBoard: ${ e.message }`);
      return false;
   }
}

/**
 * Create settings UI
 */
function createSettingsScreen() {
   try {
      const settingsTable = document.getElementById("settingsTable");
      clearElement(settingsTable);

      // Header row
      const headerRow = settingsTable.insertRow();
      headerRow.insertCell(0).textContent = "Instelling:";
      headerRow.insertCell(1).textContent = "Uit";
      headerRow.insertCell(2).textContent = "Aan";

      // Settings rows
      for (const key in settings) {
         if (! settings.hasOwnProperty(key)) {
            continue;
         }

         const setting = settings.getSetting(key);
         const row = settingsTable.insertRow();

         row.insertCell(0).textContent = setting.text;

         if (setting.type === "boolean") {
            const offCell = row.insertCell(1);
            const onCell = row.insertCell(2);

            offCell.appendChild(createRadioButton(
               `${ setting.id }radio`,
               `${ setting.id }radioId1`,
               "alignLeft",
               setting.value === false
            ));

            onCell.appendChild(createRadioButton(
               `${ setting.id }radio`,
               `${ setting.id }radioId2`,
               "alignLeft",
               setting.value === true
            ));
         } else if (setting.type === "number") {
            const inputCell = row.insertCell(1);
            inputCell.setAttribute("colspan", "2");

            const numberInput = document.createElement("input");
            numberInput.type = "number";
            numberInput.id = `${ setting.id }numberId`;
            numberInput.value = setting.value;
            numberInput.min = setting.min;
            numberInput.max = setting.max;

            inputCell.appendChild(numberInput);
         }
      }

      return toggleElement(document.getElementById("settingsScreen"), true);
   } catch (e) {
      alert(`createSettingsScreen: ${ e.message }`);
      return false;
   }
}

/**
 * Apply settings from UI to settings object
 */
function applySettings() {
   try {
      for (const key in settings) {
         if (! settings.hasOwnProperty(key)) {
            continue;
         }

         const setting = settings.getSetting(key);
         let newValue;

         if (setting.type === "boolean") {
            newValue = document.getElementById(`${ setting.id }radioId2`).checked;
         } else if (setting.type === "number") {
            newValue = parseInt(document.getElementById(`${ setting.id }numberId`).value, 10);

            // Validate number input
            if (isNaN(newValue) || newValue < setting.min || newValue > setting.max) {
               alert(formatString(
                  "%s must be between %s and %s",
                  setting.text.slice(0, -2),
                  setting.min,
                  setting.max
               ));
               return false;
            }
         } else {
            console.warn(`Unknown setting type: ${ setting.type }`);
            continue;
         }

         settings[key].value = newValue;
      }

      return settings.validateAll() && saveSettings();
   } catch (e) {
      alert(`applySettings: ${ e.message }`);
      return false;
   }
}

// ============================================================================
// SCREEN NAVIGATION
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

function giveUpToOverview() {
   try {
      return resetGameState() && toOverview();
   } catch (e) {
      alert(`giveUpToOverview: ${ e.message }`);
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
// ============================================================================

if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", initializeApp);
} else {
   initializeApp();
}
