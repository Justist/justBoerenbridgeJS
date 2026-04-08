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
