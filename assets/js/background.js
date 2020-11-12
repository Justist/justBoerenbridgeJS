window.maxPlayers = 8;
window.players = [];
window.currentDealerIndex = -1; // Updated later on
// Content is mostly just for show, as the first round is 1
window.bids = { 0 : [] };
window.takes = { 0 : [] };
window.scores = { 0 : [] };
window.spadeTrump = { 0 : false };
window.currentBids = [];
window.currentTakes = [];
window.currentRound = 1;
window.roundWithoutTrump = true;
window.maxCards = -1; //Updated later on

window.regularPlayers =
   ["Speler 1", "Speler 2", "Speler 3", "Speler 4", "Speler 5", "Speler 6", "Speler 7", "Speler 8"];

String.prototype.format = function() {
   return [...arguments].reduce((p, c) => p.replace(/%s/, c), this);
};

function removeAllContent(parent) {
   try {
      while (parent.firstChild) { parent.removeChild(parent.lastChild); }
   } catch (e) {
      alert("removeAllContent " + e.message);
   }
}

function setEverythingToNone() {
   try {
      for (let page of ["newGameScreen",
                        "bidScreen",
                        "takeScreen",
                        "scoreboardScreen",
                        "gameRulesScreen",
                        "overviewScreen",
                        "endOfGameScreen"])
      {
         let div = document.getElementById(page);
         div.classList.add("hidden");
      }
      return true;
   } catch (e) {
      alert("setEverythingToNone " + e.toString());
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
                                                  getCurrentCards().toString(),
                                                  getCurrentCards() > 1 ? "en" : "");
      return updateBidsOrTakesPlaced(bidOrTake);
   } catch (e) {
      alert("updateRoundInfo " + e.message);
      return false;
   }
}

/*function hideUnavailableBidOptions() {
 let bid = document.getElementById("bidScreen");
 }*/

function toNewGame() {
   try {
      setEverythingToNone();
      let newGame = document.getElementById("newGameScreen");
      newGame.classList.remove("hidden");

      let dateTimeScoreBoard = document.getElementById("dateTimeScoreBoard");
      let dateTime = new Date();
      dateTimeScoreBoard.innerHTML =
         "Spel van %s - %s - %s (%s:%s)".format(("00" + dateTime.getDate().toString()).slice(-2),
                                                ("00" + (dateTime.getMonth() + 1).toString()).slice(-2),
                                                dateTime.getFullYear().toString(),
                                                ("00" + dateTime.getHours().toString()).slice(-2),
                                                ("00" + dateTime.getMinutes().toString()).slice(-2));

      // TODO: Fix this string to make it readable and have singular length values have leading zeroes
      window.jsonFileName = "bb%s_%s_%s_%s_%s".format(dateTime.getFullYear().toString(),
                                                      ("00" + (dateTime.getMonth() + 1).toString()).slice(-2),
                                                      ("00" + dateTime.getDate().toString()).slice(-2),
                                                      ("00" + dateTime.getHours().toString()).slice(-2),
                                                      ("00" + dateTime.getMinutes().toString()).slice(-2));

      return createPlayersTable();
   } catch (e) {
      alert("toNewGame " + e.toString());
      return false;
   }
}

function toBids() {
   try {
      setEverythingToNone();
      window.currentBids = [];
      let screen = document.getElementById("bidScreen");
      screen.classList.remove("hidden");
      return updateRoundInfo("bid") && createBidTable();
   } catch (e) {
      alert("toBids " + e.toString());
      return false;
   }
}

function toTakes() {
   try {
      setEverythingToNone();
      window.currentTakes = [];
      let take = document.getElementById("takeScreen");
      take.classList.remove("hidden");
      return updateRoundInfo("take") && createTakeTable();
   } catch (e) {
      alert("toTakes " + e.toString());
      return false;
   }
}

function toScores() {
   try {
      setEverythingToNone();
      let scores = document.getElementById("scoreboardScreen");
      scores.classList.remove("hidden");
      return true;
   } catch (e) {
      alert("toScores " + e.toString());
      return false;
   }
}

function toGameRules() {
   try {
      setEverythingToNone();
      let rules = document.getElementById("gameRulesScreen");
      rules.classList.remove("hidden");
      return true;
   } catch (e) {
      alert("toGameRules " + e.toString());
      return false;
   }
}

function toOverview() {
   try {
      setEverythingToNone();
      let overview = document.getElementById("overviewScreen");
      overview.classList.remove("hidden");
      return true;
   } catch (e) {
      alert("toOverview " + e.toString());
      return false;
   }
}

function createTableHead(table, rowData) {
   try {
      let head = table.createTHead();
      let row = head.insertRow();
      for (let i = 0; i < rowData.length; i++) {
         let th = document.createElement("th");
         th.textContent = rowData[i];
         row.appendChild(th);
      }
      return row;
   } catch (e) {
      alert("createTableHead " + e.message);
      return false;
   }
}

function createStretchTableHead(table, rowData, stretch) {
   try {
      let allButLast = rowData.slice(0, -1);
      let headRow = createTableHead(table, allButLast);
      let th = document.createElement("th");
      th.setAttribute("colspan", stretch);
      th.textContent = rowData.slice(-1)[0]; //last element
      headRow.appendChild(th);
      return true;
   } catch (e) {
      alert("createStretchTableHead " + e.message);
      return false;
   }
}

function showProceedGameButton() {
   let fileChooser = document.getElementById("fileInput");
   let button = document.getElementById("proceedGameButton");
   if (fileChooser.value) {
      button.classList.remove("hidden");
   } else {
      button.classList.add("hidden");
   }
}

function getCurrentCards() {
   try {
      let currentCards = window.currentRound;
      if (window.roundWithoutTrump && currentCards === window.maxCards + 1) {
         currentCards = window.maxCards;
      } else if (currentCards > window.maxCards) {
         currentCards = ((window.maxCards + (window.roundWithoutTrump ? 1 : 0)) * 2) - window.currentRound;
      }
      return currentCards;
   } catch (e) {
      alert("getCurrentCards " + e.message);
      return false;
   }
}

function unCheckOtherRadioButtons(parent) {
   try {
      let radioButtons = getTypeInputFields(parent, "radio");
      for (let button of radioButtons) {
         button.checked = false;
      }
      return true;
   } catch (e) {
      alert("unCheckOtherRadioButtons " + e.message);
      return false;
   }
}

// noinspection JSUnusedGlobalSymbols
function clickRadioButton(number) {
   try {
      let clickedButton = document.getElementById("radioDealer-" + number.toString());
      let playerTable = document.getElementById("newGameInputTable");
      unCheckOtherRadioButtons(playerTable);
      clickedButton.checked = true;
      return true;
   } catch (e) {
      alert("clickRadioButton " + e.message);
      return false;
   }
}

function createPlayersTable() {
   try {
      let playerTable = document.getElementById("newGameInputTable");
      removeAllContent(playerTable);

      for (let playerIndex = 0; playerIndex < 8; playerIndex++) {
         let row = playerTable.insertRow();
         if (playerIndex > 1) { row.classList.add("hidden"); }
         row.setAttribute("id", "playerRow" + playerIndex);
         let dealerCell = row.insertCell(0);
         dealerCell.classList.add("vertCenter");
         //dealerCell.setAttribute("onclick", "return clickRadioButton(" + playerIndex.toString() + ")");

         let radioButton = document.createElement("input");
         radioButton.setAttribute("type", "radio");
         radioButton.setAttribute("name", "firstDealer");
         radioButton.setAttribute("id", "radioDealer-" + playerIndex.toString());
         radioButton.classList.add("vertCenter");
         dealerCell.appendChild(radioButton);

         let nameChoiceCell = row.insertCell(1);
         nameChoiceCell.classList.add("vertCenter");

         let nameSelectElement = document.createElement("input");
         nameSelectElement.classList.add("form-control");
         nameSelectElement.setAttribute("id", "nameChoice-" + playerIndex.toString());
         nameSelectElement.setAttribute("list", "nameList");
         nameSelectElement.setAttribute("placeholder", "Kies een speler of typ een naam");
         nameSelectElement.setAttribute("onchange",
                                        "return showNextPlayerField("
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
      return true;
   } catch (e) {
      alert("createPlayersTable " + e.message);
      return false;
   }
}

function hideAllNextPlayerFields(number) {
   let field;
   try {
      for (let i = number + 1; i < window.maxPlayers; i++) {
         field = document.getElementById("playerRow" + i.toString());
         field.classList.add("hidden");
      }
      return true;
   } catch (e) {
      alert("hideAllNextPlayerFields " + e.message);
      return false;
   }
}

// noinspection JSUnusedGlobalSymbols
function showNextPlayerField(index, value) {
   let nextField;
   try {
      nextField = document.getElementById("playerRow" + (index + 1).toString());
      if (value) { nextField.classList.remove("hidden"); } else { hideAllNextPlayerFields(index); }
      return true;
   } catch (e) {
      return false;
   }
}

// noinspection JSUnusedGlobalSymbols
function storePlayers() {
   let localPlayers = new Set();
   let localDealerIndex = 0;
   try {
      let playerForm = document.getElementById("newGameForm");
      let radioFields = getTypeInputFields(playerForm, "radio");
      let anySelected = false;
      for (let fieldIndex in radioFields) {
         if (radioFields[fieldIndex].checked) {
            localDealerIndex = fieldIndex;
            anySelected = true;
         }
      }

      let selectFields = getElementTypeFields(playerForm, "input[list]");
      let fieldIndex;
      for (fieldIndex = 0; fieldIndex < selectFields.length; fieldIndex++) {
         let name = selectFields[fieldIndex].value;
         if (name) { localPlayers.add(name); }
         //If there is an empty field followed by filled in fields, ignore those
         else { break; }
      }

      console.log(fieldIndex);
      console.log(localPlayers.size);
      // localPlayers is a set, so if there are duplicate names fieldIndex is larger than the set
      if (fieldIndex > localPlayers.size) {
         alert("Dubbele namen zijn niet toegestaan!");
         return false;
      }

      if (! anySelected || localDealerIndex > localPlayers.size) {
         alert("Geen (valide) beginspeler gekozen!");
         return false;
      }

      window.players = Array.from(localPlayers);
      window.currentDealerIndex = localDealerIndex;
      window.maxCards = Math.floor(52 / window.players.length);
      for (let _ of window.players) {
         window.scores[0].push(0);
      }
      return toBids();
   } catch (e) {
      alert("storePlayers " + e.message);
      return false;
   }
}

function getElementTypeFields(parent, elementType) {
   try {
      return parent.querySelectorAll(elementType.toString());
   } catch (e) {
      alert("getElementTypeFields " + e.message);
      return false;
   }
}

function getTypeInputFields(parent, type) {
   try {
      return getElementTypeFields(parent, "input[type=" + type + "]");
   } catch (e) {
      alert("getTypeInputFields " + e.message);
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
      removeAllContent(formTable);
      let currentCards = getCurrentCards();

      let currentScores = calculateTotalScores();

      for (let i = 0; i < window.players.length; i++) {
         let row = formTable.insertRow();
         row.setAttribute("id", playerId + i.toString());

         let nameCell = row.insertCell(0);
         nameCell.classList.add(cellName);
         nameCell.innerHTML = window.players[i].toString(); //Just to prevent warnings, this should contain strings

         let scoreCell = row.insertCell(1);
         let score = currentScores[i];
         if (score) { scoreCell.innerHTML = score.toString(); } else { scoreCell.innerHTML = "0"; }

         if (bidOrTake === "take") {
            let bidCell = row.insertCell(2);
            bidCell.innerHTML = window.bids[window.currentRound][i];
         }

         for (let number = 0; number <= currentCards; number++) {
            let numberCell = row.insertCell(-1);
            numberCell.setAttribute("onclick", "return clickBidOrTakeButton(this.parentNode, "
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
            "<strong>%s</strong>".format(window.spadeTrump[window.currentRound] ? "Schoppenrondje!" : "Normale ronde");
      }

      return formTable;
   } catch (e) {
      alert("createBidTakeTable " + e.message);
      return false;
   }
}

function createBidTable() {
   try {
      let formTable = createBidTakeTable("bid");
      createStretchTableHead(formTable, ["Spelers", "Scores", "Bieden"], (getCurrentCards() + 1));
      return true;
   } catch (e) {
      alert("createBidTable " + e.message);
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
      alert("clearHighLightsPlayer " + e.message);
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
      let indexToHighlight = parent.children[numberAsInt + offset];
      indexToHighlight.classList.remove("unhighlighted");
      indexToHighlight.classList.add("highlighted");
      (bidOrTake === "bid") ? window.currentBids[playerIndexInt] = numberAsInt : window.currentTakes[playerIndexInt] =
         numberAsInt;
      return updateBidsOrTakesPlaced(bidOrTake);
   } catch (e) {
      alert("clickBidOrTakeButton " + e.message);
      return false;
   }
}

function updateBidsOrTakesPlaced(bidOrTake) {
   try {
      let infoRow = document.getElementById(bidOrTake === "bid" ? "bidInfoRow" : "takeInfoRow");
      let sum = 0;
      for (let num of bidOrTake === "bid" ? window.currentBids : window.currentTakes) {
         if (num) { sum += num; }
      }
      infoRow.innerHTML = sum.toString() + " / " + getCurrentCards().toString();
      return true;
   } catch (e) {
      alert("updateBidsOrTakesPlaced " + e.message);
      return false;
   }
}

function storeBids() {
   try {
      window.bids[window.currentRound] = window.currentBids;
      let spadeField = document.getElementById("spadeRadioButton");
      window.spadeTrump[window.currentRound] = spadeField.checked;
      return toTakes();
   } catch (e) {
      alert("storeBids " + e.message);
      return false;
   }
}

function createTakeTable() {
   try {
      let formTable = createBidTakeTable("take");
      createStretchTableHead(formTable, ["Spelers", "Scores", "Geboden", "Gehaald"], (getCurrentCards() + 1));
      return true;
   } catch (e) {
      alert("createTakeTable " + e.message);
      return false;
   }
}

function calculateTotalScores() {
   let totalScores = [], sum;
   try {
      for (let playerIndex in window.players) {
         sum = 0;
         for (let round in window.scores) {
            sum += window.scores[round][playerIndex];
         }
         totalScores[playerIndex] = sum;
      }
      return totalScores;
   } catch (e) {
      alert("calculateTotalScores " + e.message);
      return false;
   }
}

function updateScores() {
   try {
      let localScores = [];
      for (let playerIndex in window.players) {
         if (window.currentBids[playerIndex] === window.currentTakes[playerIndex]) {
            localScores[playerIndex] =
               10 + (window.currentBids[playerIndex] * 3);
         } else {
            localScores[playerIndex] =
               (-Math.abs(window.currentBids[playerIndex] - window.currentTakes[playerIndex]) * 3);
         }
         if (window.spadeTrump[window.currentRound]) { localScores[playerIndex] *= 2; }
      }
      window.scores[window.currentRound] = localScores;
      return true;
   } catch (e) {
      alert("updateScores " + e.message);
      return false;
   }
}

function storeTakes() {
   try {
      window.takes[window.currentRound] = window.currentTakes;
      let updatedScores = updateScores();
      window.currentRound++;
      window.currentDealerIndex++;
      window.currentDealerIndex %= window.players.length;
      return updatedScores && toBids();
   } catch (e) {
      alert("storeTakes " + e.message);
      return false;
   }
}

window.onload = function() {
   while (! document.getElementById("newGameScreen")) { }
   //TODO Check for existing save game
   toNewGame();
};
