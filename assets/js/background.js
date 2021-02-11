// TODO Set to false before pushing to main!
window.DEBUG = false;

window.regularPlayers =
   ["Speler 1", "Speler 2", "Speler 3", "Speler 4", "Speler 5", "Speler 6", "Speler 7", "Speler 8"];

//  deepcode ignore no-extend-native: I like format()
String.prototype.format = function() {
   try {
      //  deepcode ignore prefer-rest-params: doesn't work otherwise
      return [...arguments].reduce((p, c) => p.replace(/%s/, c), this);
   } catch (e) {
      alert("String.prototype.format " + e.message + " on line " + e.lineNumber);
      return false;
   }
};

function resetAllStats() {
   try {
      // Content is mostly just for default values, as the first round is 1
      window.bids = { 0 : [] };
      window.currentBids = [];
      window.currentDealerIndex = -1; // Updated later on
      window.currentRound = 1;
      window.currentTakes = [];
      window.maxRounds = -1;
      window.players = [];
      window.scores = { 0 : [] };
      window.spadeTrump = { 0 : false };
      window.takes = { 0 : [] };

      return General.hideOrShowElement(document.getElementById("takeScreenToBidsButton"), true)
             && General.hideOrShowElement(document.getElementById("scoreboardToBidButton"), true)
             && General.hideOrShowElement(document.getElementById("scoreboardToOtherButtons"),
                                          false);
   } catch (e) {
      alert("resetAllStats " + e.message + " on line " + e.lineNumber);
      return false;
   }
}

function updateRoundInfo(bidOrTake) {
   try {
      let id = bidOrTake + "ScreenTopInfo";
      document.getElementById(id).innerHTML =
         "%se ronde, %s deel%s %s kaart%s".format(window.currentRound.toString(),
                                                  window.players[window.currentDealerIndex],
                                                  bidOrTake === "bid" ? "t" : "de",
                                                  General.getCurrentCards().toString(),
                                                  General.getCurrentCards() > 1 ? "en" : "");
      return updateBidsOrTakesPlaced(bidOrTake);
   } catch (e) {
      alert("updateRoundInfo " + e.message + " on line " + e.lineNumber);
      return false;
   }
}

function toNewGame() {
   try {
      General.setEverythingToNone();
      resetAllStats();
      General.hideOrShowElement(document.getElementById("newGameScreen"), true);

      let dateTimeScoreBoard = document.getElementById("dateTimeScoreBoard");
      let dateTime = new Date();
      dateTimeScoreBoard.innerHTML =
         "Spel van %s - %s - %s (%s:%s)".format(("00" + dateTime.getDate().toString()).slice(-2),
                                                ("00" + (dateTime.getMonth() + 1).toString()).slice(
                                                   -2),
                                                dateTime.getFullYear().toString(),
                                                ("00" + dateTime.getHours().toString()).slice(-2),
                                                ("00" + dateTime.getMinutes()
                                                                .toString()).slice(-2));

      window.jsonFileName =
         "bb%s_%s_%s_%s_%s".format(dateTime.getFullYear().toString(),
                                   ("00" + (dateTime.getMonth()
                                    + 1).toString()).slice(-2),
                                   ("00" + dateTime.getDate()
                                                   .toString()).slice(-2),
                                   ("00" + dateTime.getHours().toString()).slice(
                                      -2),
                                   ("00" + dateTime.getMinutes()
                                                   .toString()).slice(-2));

      return createPlayersTable();
   } catch (e) {
      alert("toNewGame " + e.toString());
      return false;
   }
}

function toTakes() {
   try {
      General.setEverythingToNone();
      window.currentTakes = [];
      General.hideOrShowElement(document.getElementById("takeScreen"), true);
      if (window.settings.getValue("roundWithoutTrump")
          && (window.currentRound === window.maxCardsThisGame + 1))
      {
         General.hideOrShowElement(document.getElementById("spadeTrumpTakeScreen"), false);
      } else {
         General.hideOrShowElement(document.getElementById("spadeTrumpTakeScreen"), true);
      }
      return updateRoundInfo("take") && createTakeTable();
   } catch (e) {
      alert("toTakes " + e.toString());
      return false;
   }
}

function toScores() {
   try {
      General.setEverythingToNone();
      let scores = document.getElementById("scoreboardScreen");
      scores.classList.remove("hidden");
      return createScoreBoard();
   } catch (e) {
      alert("toScores " + e.toString());
      return false;
   }
}

function toGameRules() {
   try {
      General.setEverythingToNone();
      return General.hideOrShowElement(document.getElementById("gameRulesScreen"), true);
   } catch (e) {
      alert("toGameRules " + e.toString());
      return false;
   }
}

function clickDealerRadiobutton(playerIndex) {
   try {
      document.getElementById("radioDealer-" + playerIndex.toString()).checked = true;
      return true;
   } catch (e) {
      alert("clickDealerRadiobutton " + e.message + " on line " + e.lineNumber);
      return false;
   }
}

function createPlayersTable() {
   try {
      let playerTable = document.getElementById("newGameInputTable");
      General.removeAllContent(playerTable);

      for (let playerIndex = 0;
           playerIndex < window.settings.getValue("maxPlayers");
           playerIndex++)
      {
         let row = playerTable.insertRow();
         if (playerIndex > 1) { General.hideOrShowElement(row, false); }
         row.setAttribute("id", "playerRow" + playerIndex.toString());
         let dealerCell = row.insertCell(0);
         dealerCell.classList.add("vertCenter");
         dealerCell.setAttribute("onclick",
                                 "return updatePlayers(" + playerIndex.toString() + ", \"-1\")");

         dealerCell.appendChild(General.createRadioButton("firstDealer",
                                                          "radioDealer-" + playerIndex.toString(),
                                                          "vertCenter",
                                                          false));

         let nameChoiceCell = row.insertCell(1);
         nameChoiceCell.classList.add("vertCenter");

         let nameSelectElement = document.createElement("input");
         nameSelectElement.classList.add("form-control");
         nameSelectElement.setAttribute("id",
                                        "nameChoice-" + playerIndex.toString());
         nameSelectElement.setAttribute("list", "nameList");
         nameSelectElement.setAttribute("placeholder",
                                        "Kies een speler of typ een naam");
         nameSelectElement.setAttribute("onchange",
                                        "return updatePlayers("
                                        + playerIndex.toString()
                                        + ", this.value)");
         nameChoiceCell.appendChild(nameSelectElement);

         let nameList = document.createElement("datalist");
         nameList.setAttribute("id", "nameList");
         for (let nameIndex = 0; nameIndex < window.regularPlayers.length; nameIndex++) {
            let option = document.createElement("option");
            option.setAttribute("value", window.regularPlayers[nameIndex]);
            option.textContent = window.regularPlayers[nameIndex];
            nameList.appendChild(option);
         }
         nameChoiceCell.appendChild(nameList);
      }
      if (window.DEBUG) {
         General.hideOrShowElement(document.getElementById("debugSetMaxCardsDiv"), true);
      }
      return General.createTableHead(playerTable, ["Eerste deler", "Namen spelers"]);
   } catch (e) {
      alert("createPlayersTable " + e.message + " on line " + e.lineNumber);
      return false;
   }
}

function hideAllNextPlayerFields(number) {
   try {
      for (let i = number + 1; i < window.settings.getValue("maxPlayers"); i++) {
         General.hideOrShowElement(document.getElementById("playerRow" + i.toString()), false);
      }
      return true;
   } catch (e) {
      alert("hideAllNextPlayerFields " + e.message + " on line " + e.lineNumber);
      return false;
   }
}

function findFirstHiddenNameField() {
   /*
    Either finds the first hidden field or the first empty field.
    If no such field is found, return i+1 so checks using this function will still return true
    */
   try {
      let i, allFilled = true;
      for (i = 0; i < window.settings.getValue("maxPlayers"); i++) {
         if (document.getElementById("playerRow" + i.toString()).classList.contains("hidden")
             || document.getElementById("nameChoice-" + i.toString()).value === "")
         {
            allFilled = false;
            break;
         }
      }
      // If the loop ends, return the last known number +1, to show there are no hidden fields
      return i + 1;
   } catch (e) {
      alert("findFirstHiddenNameField " + e.message + " on line " + e.lineNumber);
      return false;
   }
}

function checkNoDoublePlayers() {
   try {
      let currentPlayers = [];
      let value;
      for (let i = 0; i < window.settings.getValue("maxPlayers"); i++) {
         value = document.getElementById("nameChoice-" + i.toString()).value;
         if (value === "") {
            break; //Only players before the first empty cell should be considered
         } else if (currentPlayers.includes(value)) {
            return false;
         } else {
            currentPlayers.push(value);
         }
      }
      return true;
   } catch (e) {
      alert("checkDoublePlayers " + e.message + " on line " + e.lineNumber);
      return false;
   }
}

function checkDealerValidity(index) {
   try {
      if (index === -1) { return false; }
      return (document.getElementById("nameChoice-" + index.toString()).value !== "")
             &&
             (index < findFirstHiddenNameField());
   } catch (e) {
      alert("checkPlayerValidity " + e.message + " on line " + e.lineNumber);
      return false;
   }
}

// noinspection JSUnusedGlobalSymbols
function updatePlayers(index, value) {
   try {
      let result;
      let currentDealer = index;

      let notEnoughPlayersAlert = document.getElementById("notEnoughPlayersAlert");
      let noValidDealerAlert = document.getElementById("noValidDealerAlert");
      let doublePlayerNamesAlert = document.getElementById("doublePlayerNamesAlert");
      let buttonElement = document.getElementById("newGameButtonTable");

      if (value === "-1") {
         //checkbox got checked
         result = clickDealerRadiobutton(index);
      } else {
         // Playername got changed
         currentDealer = anyRadioFilled(document.getElementById("newGameForm"));
         result = showAllNextPlayerFields(index, value);
      }
      // These should be initialised after the if/else!
      let conditionValidDealer = checkDealerValidity(currentDealer);
      let conditionEnoughPlayers = findFirstHiddenNameField() >
                                   window.settings.getValue("minPlayers");
      let conditionNoDoublePlayers = checkNoDoublePlayers();
      return result
             && General.hideOrShowElement(noValidDealerAlert, ! conditionValidDealer)
             && General.hideOrShowElement(notEnoughPlayersAlert, ! conditionEnoughPlayers)
             && General.hideOrShowElement(doublePlayerNamesAlert, ! conditionNoDoublePlayers)
             && General.hideOrShowElement(buttonElement,
             conditionEnoughPlayers && conditionValidDealer && conditionNoDoublePlayers);
   } catch (e) {
      alert("updatePlayers " + e.message + " on line " + e.lineNumber);
      return false;
   }
}

function showAllNextPlayerFields(index, value) {
   // with values, of course
   try {
      if (value) {
         for (let i = index + 1; i < window.settings.getValue("maxPlayers"); i++) {
            General.hideOrShowElement(document.getElementById("playerRow" + i.toString()), true);
            // Only show one empty line
            if (document.getElementById("nameChoice-" + i.toString()).value === "") { break; }
         }
         return true;
      } else { return hideAllNextPlayerFields(index); }
   } catch (e) {
      alert("showAllNextPlayerFields " + e.message + " on line " + e.lineNumber);
      return false;
   }
}

function anyRadioFilled(parent) {
   try {
      let radioFields = getTypeInputFields(parent, "radio");
      for (let fieldIndex in radioFields) {
         // I assume there is only one radio checked. If not, change this to your needs
         if (radioFields[fieldIndex].checked) {
            // Apparently this is a string, and it works with that, but I am very confused
            return parseInt(fieldIndex, 10);
         }
      }
      return -1;
   } catch (e) {
      alert("anyRadioFilled " + e.message + " on line " + e.lineNumber);
      return false;
   }
}

// noinspection JSUnusedGlobalSymbols
function storePlayers() {
   let localPlayers = new Set();
   let localDealerIndex = 0;
   try {
      let playerForm = document.getElementById("newGameForm");
      localDealerIndex = anyRadioFilled(playerForm);

      let selectFields = getElementTypeFields(playerForm, "input[list]");
      let fieldIndex;
      for (fieldIndex = 0; fieldIndex < selectFields.length; fieldIndex++) {
         let name = selectFields[fieldIndex].value;
         if (name) { localPlayers.add(name); }
         //If there is an empty field followed by filled in fields, ignore those
         else { break; }
      }

      window.players = Array.from(localPlayers);
      window.currentDealerIndex = localDealerIndex;
      if (window.DEBUG) {
         let maxCardsInput = document.getElementById("debugSetMaxCardsInput").value;
         if (maxCardsInput) { window.maxCardsThisGame = parseInt(maxCardsInput, 10); }
      } else {
         let maxCardsBasedOnPlayers = Math.floor(52 / window.players.length)
                                      // If no cards would be left at the highest round, deal 1
                                      // card less
                                      - (52 % window.players.length === 0 ? 1 : 0);
         window.maxCardsThisGame =
            Math.min(maxCardsBasedOnPlayers, window.settings.getValue("maxCardsPossible"));
      }

      window.maxRounds =
         (window.maxCardsThisGame * 2) + (window.settings.getValue("roundWithoutTrump") ? 1 : -1);
      for (let _ of window.players) {
         window.scores[0].push(0);
      }
      return window.bidView.toBids(window.settings, window.currentRound, window.maxCardsThisGame);
   } catch (e) {
      alert("storePlayers " + e.message + " on line " + e.lineNumber);
      return false;
   }
}

function getElementTypeFields(parent, elementType) {
   try {
      return parent.querySelectorAll(elementType.toString());
   } catch (e) {
      alert("getElementTypeFields " + e.message + " on line " + e.lineNumber);
      return false;
   }
}

function getTypeInputFields(parent, type) {
   try {
      return getElementTypeFields(parent, "input[type=" + type + "]");
   } catch (e) {
      alert("getTypeInputFields " + e.message + " on line " + e.lineNumber);
      return false;
   }
}

function createBidTakeTable(bidOrTake) {
   let table, playerId, cellName;
   try {
      table = bidOrTake + "InputTable";
      playerId = bidOrTake + "Player";
      cellName = bidOrTake + "Name";

      let formTable = document.getElementById(table);
      General.removeAllContent(formTable);
      let currentCards = General.getCurrentCards();

      let currentScores = calculateTotalScores();
      let row;
      for (let i = 0; i < window.players.length; i++) {
         if (window.settings.hasOwnProperty("dealerLast")
             && window.settings["dealerLast"].value
             === true)
         {
            row = formTable.insertRow(i <= window.currentDealerIndex ? -1 : i
                                                                            - (window.currentDealerIndex
                                                                               + 1));
         } else { row = formTable.insertRow(); }
         row.setAttribute("id", playerId + i.toString());

         let nameCell = row.insertCell(0);
         nameCell.classList.add(cellName);
         nameCell.innerHTML = window.players[i].toString(); //Just to prevent warnings, this should
                                                            //already contain strings
         if (i === window.currentDealerIndex) {
            nameCell.innerHTML += "*";
         }
         let scoreCell = row.insertCell(1);
         let score = currentScores[i];
         if (score) { scoreCell.innerHTML = score.toString(); } else { scoreCell.innerHTML = "0"; }

         if (bidOrTake === "take") {
            let bidCell = row.insertCell(2);
            bidCell.innerHTML = window.bids[window.currentRound][i];
         }

         for (let number = 0; number <= currentCards; number++) {
            let numberCell = row.insertCell(-1);
            numberCell.setAttribute("id", bidOrTake + "number" + i.toString() + number.toString());
            numberCell.setAttribute("onclick",
                                    "return clickBidOrTakeButton(this.parentNode, "
                                    + number.toString()
                                    + ", "
                                    + i.toString()
                                    + ", \'"
                                    + bidOrTake.toString()
                                    + "\')");
            numberCell.innerHTML = number.toString();
         }
      }

      if (bidOrTake === "take") {
         let spadeText = document.getElementById("spadeTrumpTakeScreen");
         spadeText.innerHTML =
            "<strong>%s</strong>".format(window.spadeTrump[window.currentRound]
                                         ? "Schoppenrondje!"
                                         : "Normale ronde");
      }

      return formTable;
   } catch (e) {
      alert("createBidTakeTable " + e.message + " on line " + e.lineNumber);
      return false;
   }
}

function createBidTable() {
   try {
      let formTable = createBidTakeTable("bid");
      return General.createStretchTableHead(formTable,
                                            ["Spelers", "Scores", "Bieden"],
                                            (General.getCurrentCards() + 1));
   } catch (e) {
      alert("createBidTable " + e.message + " on line " + e.lineNumber);
      return false;
   }

}

function clearHighLightsPlayerIndex(playerIndex, bidOrTake) {
   try {
      let numberCell;
      for (let number = 0; number <= General.getCurrentCards(); number++) {
         numberCell = document.getElementById(bidOrTake + "number" + playerIndex + number);
         if (numberCell.getAttribute("class")) {
            numberCell.classList.remove("highlighted");
         }
         numberCell.classList.add("unhighlighted");
      }
      return true;
   } catch (e) {
      alert("clearHighLightsPlayerIndex " + e.message + " on line " + e.lineNumber);
      return false;
   }
}

function clearHighLightsPlayer(player) {
   try {
      for (let child of player.children) {
         if (child.getAttribute("class")) {
            child.classList.remove("highlighted");
         }
         child.classList.add("unhighlighted");
      }
      return true;
   } catch (e) {
      alert("clearHighLightsPlayer " + e.message + " on line " + e.lineNumber);
      return false;
   }
}

function clickSpadeRadioButton() {
   try {
      return updateBidsOrTakesPlaced("bid");
   } catch (e) {
      alert("clickSpadeRadioButton " + e.message + " on line " + e.lineNumber);
      return false;
   }
}

// noinspection JSUnusedGlobalSymbols
function clickBidOrTakeButton(parent, numberString, playerIndexString, bidOrTake) {
   try {
      clearHighLightsPlayer(parent);
      let numberAsInt = parseInt(numberString, 10);
      let playerIndexInt = parseInt(playerIndexString, 10);
      let offset = bidOrTake === "bid" ? 2 : 3;
      if (bidOrTake === "bid") {
         window.currentBids[playerIndexInt] = numberAsInt;
      } else {
         window.currentTakes[playerIndexInt] = numberAsInt;
      }
      let indexToHighlight = parent.children[numberAsInt + offset];
      indexToHighlight.classList.remove("unhighlighted");
      indexToHighlight.classList.add("highlighted");

      return updateBidsOrTakesPlaced(bidOrTake);
   } catch (e) {
      alert("clickBidOrTakeButton " + e.message + " on line " + e.lineNumber);
      return false;
   }
}

function updateBidsOrTakesPlaced(bidOrTake) {
   try {
      let infoRow = document.getElementById(bidOrTake === "bid" ? "bidInfoRow" : "takeInfoRow");
      let sum = 0;
      let currentCards = General.getCurrentCards();
      for (let num of bidOrTake === "bid" ? window.currentBids : window.currentTakes) {
         if (num) { sum += num; }
      }
      infoRow.innerHTML = sum.toString() + " / " + currentCards.toString();
      let buttonElement = document.getElementById(bidOrTake + "ScreenButtonsTable"),
          equalAlert    = document.getElementById(bidOrTake + "sEqualAlert"),
          filledAlert   = document.getElementById(bidOrTake + "sFilledAlert"),
          spadeAlert    = document.getElementById("spadeTrumpSelectAlert");

      let equalCheck = (sum === currentCards);
      // Filter to make sure not to count empty elements
      let amountInputsFilled = (bidOrTake === "bid"
                                ? window.currentBids
                                : window.currentTakes).filter(function(value) {
         return typeof (value !== "undefined") && (value !== null);
      }).length;
      let spadeRadioChecked = true;
      if (bidOrTake === "bid") {
         spadeRadioChecked =
            (anyRadioFilled(document.getElementById("spadeRadioButtonsP")) !== -1);
      }
      let allFilledIn = (window.players.length === amountInputsFilled);
      return General.hideOrShowElement(equalAlert,
                                       (bidOrTake === "bid" ? equalCheck : (! equalCheck)))
             && General.hideOrShowElement(filledAlert, (! allFilledIn))
             && (bidOrTake === "bid"
                 ? General.hideOrShowElement(spadeAlert, (! spadeRadioChecked))
                 : true)
             && General.hideOrShowElement(buttonElement,
             (bidOrTake === "bid" ? (! equalCheck) : equalCheck)
             && allFilledIn
             && spadeRadioChecked);
   } catch (e) {
      alert("updateBidsOrTakesPlaced " + e.message + " on line " + e.lineNumber);
      return false;
   }
}

function storeBids() {
   try {
      window.bids[window.currentRound] = window.currentBids;

      window.spadeTrump[window.currentRound] = document
         .getElementById("spadeRadioButton")
         .checked;

      return toTakes();
   } catch (e) {
      alert("storeBids " + e.message + " on line " + e.lineNumber);
      return false;
   }
}

function createTakeTable() {
   try {
      let formTable = createBidTakeTable("take");

      if (window.currentRound === window.maxRounds) {
         General.hideOrShowElement(document.getElementById("takeScreenToBidsButton"), false);
      }
      return General.createStretchTableHead(formTable,
                                            ["Spelers", "Scores", "Geboden", "Gehaald"],
                                            (General.getCurrentCards() + 1));
   } catch (e) {
      alert("createTakeTable " + e.message + " on line " + e.lineNumber);
      return false;
   }
}

function calculateTotalScores() {
   let totalScores = [], sum;
   try {
      for (let playerIndex = 0; playerIndex < window.players.length; playerIndex++) {
         sum = 0;
         for (let round = 0; round < window.currentRound; round++) {
            sum += window.scores[round][playerIndex];
         }
         totalScores[playerIndex] = sum;
      }
      return totalScores;
   } catch (e) {
      alert("calculateTotalScores " + e.message + " on line " + e.lineNumber);
      return false;
   }
}

function updateScores() {
   try {
      let localScores = [];
      for (let playerIndex = 0; playerIndex < window.players.length; playerIndex++) {
         if (window.currentBids[playerIndex] === window.currentTakes[playerIndex]) {
            localScores[playerIndex] =
               10 + (window.currentBids[playerIndex] * 3);
         } else {
            localScores[playerIndex] =
               (-Math.abs(window.currentBids[playerIndex] - window.currentTakes[playerIndex]) * 3);
         }
         if (window.settings.getValue("spadeDouble")
             && window.spadeTrump[window.currentRound])
         { localScores[playerIndex] *= 2; }
      }
      window.scores[window.currentRound] = localScores;
      return true;
   } catch (e) {
      alert("updateScores " + e.message + " on line " + e.lineNumber);
      return false;
   }
}

function storeTakes(bidButtonPressed) {
   try {
      window.takes[window.currentRound] = window.currentTakes;
      let updatedScores = updateScores();
      window.currentRound++;
      window.currentDealerIndex++;
      window.currentDealerIndex %= window.players.length;
      return updatedScores && (bidButtonPressed && (window.currentRound <= window.maxRounds)
                               ? toBids()
                               : toScores());
   } catch (e) {
      alert("storeTakes " + e.message + " on line " + e.lineNumber);
      return false;
   }
}

// noinspection JSUnusedGlobalSymbols
function clickScoreCell(element, round, playerIndex) {
   try {
      let clicked = element.getAttribute("clicked");
      if (clicked === "true") {
         element.innerHTML = window.scores[round][playerIndex];
         element.setAttribute("clicked", "false");
      } else if (clicked === "false") {
         element.innerHTML =
            "%s / %s".format(window.bids[round][playerIndex], window.takes[round][playerIndex]);
         element.setAttribute("clicked", "true");
      } else {
         alert(
            "clickScoreCell The clicked attribute of scoreCell should not be something else than true or false!");
         return false;
      }
      return true;
   } catch (e) {
      alert("clickScoreCell " + e.message + " on line " + e.lineNumber);
      return false;
   }
}

function createScoreBoard() {
   try {
      let scoreTable = document.getElementById("scoreDataTable");
      General.removeAllContent(scoreTable);
      let totalScores = calculateTotalScores();
      let spadeDouble = window.settings.getValue("spadeDouble");
      for (let round = 0; round < window.currentRound; round++) {
         let scoreRow = scoreTable.insertRow();
         let roundCell = scoreRow.insertCell(0);
         roundCell.innerHTML = round === 0 ? "" : round.toString();
         let cardsCell = scoreRow.insertCell(1);
         cardsCell.innerHTML = round === 0 ? "" : General.getCurrentCards(round).toString();
         if (spadeDouble) {
            let spadeCell = scoreRow.insertCell(2);
            spadeCell.innerHTML =
               (window.settings.getValue("roundWithoutTrump")
                && (round === window.maxCardsThisGame + 1))
               ? "NVT"
               : window.spadeTrump[round] ? "♠" : "";
         }
         for (let playerIndex = 0; playerIndex < window.players.length; playerIndex++) {
            let scoreCell = scoreRow.insertCell(-1);

            if (round === 0) {
               scoreCell.innerHTML = "<strong>" + totalScores[playerIndex].toString() + "</strong>";
            } else {
               scoreCell.innerHTML = window.scores[round][playerIndex];
               scoreCell.setAttribute("clicked", "false");
               scoreCell.setAttribute("onclick",
                                      "return clickScoreCell(this, "
                                      + round.toString()
                                      + ", "
                                      + playerIndex.toString()
                                      + ")");
            }
         }
      }
      if (window.currentRound > window.maxRounds) {
         General.hideOrShowElement(document.getElementById("scoreboardToBidButton"), false);
         General.hideOrShowElement(document.getElementById("scoreboardToOtherButtons"), true);
      }
      let rowData = ["Ronde", "Kaarten", ...window.players];
      if (spadeDouble) { rowData = ["Ronde", "Kaarten", "♠", ...window.players]; }
      return General.createTableHead(scoreTable, rowData);
   } catch (e) {
      alert("createScoreBoard " + e.message + " on line " + e.lineNumber);
      return false;
   }
}

function saveSettings() {
   try {
      let keyValue, newValue;
      for (let key in window.settings) {
         if (! window.settings.hasOwnProperty(key)) {
            continue;
         }
         // Bit counterintuitive maybe, but as values are always initialised this is a good way to
         // determine which id to get and how to get the value (checked vs value)
         keyValue = window.settings.getSetting(key);
         if (keyValue.type === "boolean") {
            newValue = document.getElementById(keyValue.id + "radioId1").checked === false;
         } else if (keyValue.type === "number") {
            newValue = document.getElementById(keyValue.id + "numberId").value;
         } else {
            alert("Setting %s has the invalid type of %s! Please fix this.".format(key.toString(),
                                                                                   typeof keyValue.value));
            return false;
         }
         window.settings[key].value = newValue;
      }
      return window.settings.checkSettings() && Storage.storeSettings(window.settings);
   } catch (e) {
      alert("saveSettings " + e.message + " on line " + e.lineNumber);
      return false;
   }
}

function createViews() {
   try {
      window.settings = new Settings();

      window.bidView = new BidView();
      window.overView = new OverView();
      window.scoreView = new ScoreView();
      window.settingsView = new SettingsView();
      window.takeView = new TakeView();
      return true;
   } catch (e) {
      alert("createViews " + e.message + " on line " + e.lineNumber);
      return false;
   }
}

function connectButtons() {
   try {
      // SettingsView Buttons
      let settingsFunc = function() { return window.settingsView.toSettings(window.settings); };
      General.addEventToButton("toSettingsFromOverviewButton", settingsFunc);

      // Overview Buttons
      let overviewFunc = function() { return window.overView.toOverview(window.settings); };
      General.addEventToButton("toOverviewFromGameRulesButton", overviewFunc);
      General.addEventToButton("toOverviewFromScoreboardButton", overviewFunc);
      General.addEventToButton("clearCookiesButton", function() { return Storage.clearLocal(); });
      General.addEventToButton("clearCookiesButton", overviewFunc);
      /*General.addEventToButton("saveSettingsButton", function() { return saveSettings(); });
      General.addEventToButton("saveSettingsButton", overviewFunc);*/

      /*document.getElementById("clearCookiesButton").onclick =
         function() { return Storage.clearLocal() && window.overView.toOverview(window.settings); };*/
      document.getElementById("saveSettingsButton").onclick =
         function() { return saveSettings() && window.overView.toOverview(window.settings); };

      // BidView Buttons
      let bidviewFunc = function() {
         window.overView.toBids(window.settings,
                                window.currentRound,
                                window.maxCardsThisGame);
      };
      document.getElementById("toBidsScoreboardButton").onclick = bidviewFunc;

      // New Game Buttons
      let newGameFunc = function() { return toNewGame(); };
      document.getElementById("toNewGameFromScoreboardButton").onclick = newGameFunc;
      document.getElementById("toNewGameFromOverviewButton").onclick = newGameFunc;

      return true;
   } catch (e) {
      alert("connectButtons " + e.message + " on line " + e.lineNumber);
      return false;
   }
}

window.onload = function() {
   while (! document.getElementById("overviewScreen")) { }
   //TODO Check for existing save game
   createViews();
   connectButtons();
   window.overView.toOverview();
};
