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
