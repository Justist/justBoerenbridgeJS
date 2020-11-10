window.maxPlayers = 8;
window.players = [];
window.bids = { 0 : [] };
window.takes = { 0 : [] };
window.scores = { 0 : [] };
window.currentBids = [];
window.currentRound = 1;
window.maxCards = -1; //Updated later on

window.regularPlayers =
   ["Speler 1", "Speler 2", "Speler 3", "Speler 4", "Speler 5", "Speler 6", "Speler 7", "Speler 8"];

String.prototype.format = function() {
   return [...arguments].reduce((p, c) => p.replace(/%s/, c), this);
};

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

function updateBidRoundLabels() {
   let maxCards = Math.floor(52 / window.players.length);
   let currentCards = window.currentRound;
   if (window.currentRound === maxCards + 1) {
      currentCards = maxCards;
   } else if (window.currentRound > maxCards + 1) {
      currentCards = (2 * (maxCards + 1)) - window.currentRound;
   }
   document.getElementById("cardsThisRoundBidForm").innerHTML = currentCards.toString();
   document.getElementById("bidRoundNumberTitle").innerHTML =
      "Ronde " + window.currentRound.toString();
}

function hideUnavailableBidOptions() {
   let bid = document.getElementById("bidScreen");

}

function toNewGame() {
   try {
      setEverythingToNone();
      let newGame = document.getElementById("newGameScreen");
      newGame.classList.remove("hidden");

      let dateTimeScoreBoard = document.getElementById("dateTimeScoreBoard");
      let dateTime = new Date();
      dateTimeScoreBoard.innerHTML =
         "Spel van %s - %s - %s (%s:%s)".format(dateTime.getDate().toString(),
                                                (dateTime.getMonth() + 1).toString(),
                                                dateTime.getFullYear().toString(),
                                                dateTime.getHours().toString(),
                                                dateTime.getMinutes().toString());
      return createPlayersTable();
   } catch (e) {
      alert("toNewGame " + e.toString());
      return false;
   }
}

function toBids() {
   try {
      setEverythingToNone();
      let bid = document.getElementById("bidScreen");
      bid.classList.remove("hidden");
      return createBidTable();
   } catch (e) {
      alert("toBids " + e.toString());
      return false;
   }
}

function toTakes() {
   try {
      setEverythingToNone();
      let take = document.getElementById("takeScreen");
      take.classList.remove("hidden");
      return true;
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
      //TODO Change this so it also works if there is no round without trump
      if (currentCards === window.maxCards + 1) {
         currentCards = window.maxCards;
      } else if (currentCards > window.maxCards) {
         currentCards = ((window.maxCards + 1) * 2) - window.currentRound;
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

      for (let playerIndex = 0; playerIndex < 8; playerIndex++) {
         let row = playerTable.insertRow();
         if (playerIndex > 1) { row.classList.add("hidden"); }
         row.setAttribute("id", "playerRow" + playerIndex);
         let dealerCell = row.insertCell(0);
         dealerCell.classList.add("vertCenter");
         dealerCell.setAttribute("onclick",
                                 "return clickRadioButton(" + playerIndex.toString() + ")");

         let radioButton = document.createElement("input");
         radioButton.setAttribute("type", "radio");
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
      for (let i = number + 1; i <= window.maxPlayers; i++) {
         field = document.getElementById("trNameInputPlayer" + i.toString());
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
   try {
      let playerForm = document.getElementById("newGameForm");
      let selectFields = getElementTypeFields(playerForm, "input[list]");
      console.log(selectFields);
      for (let field of selectFields) {
         let name = field.value;
         console.log("name: " + name);
         if (name) { window.players.push(name); } else { break; } //If there is an empty field
                                                                  // followed by filled in fields,
                                                                  // ignore those
      }
      window.jsonFileName = window.players.join("");
      window.maxCards = Math.floor(52 / window.players.length);
      for (let player of window.players) {
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
      return parent.querySelectorAll("input[type=" + type + "]");
   } catch (e) {
      alert("getTypeInputFields " + e.message);
      return false;
   }
}

function createBidTable() {
   try {
      let formTable = document.getElementById("bidInputTable");
      let currentCards = getCurrentCards();

      for (let i = 0; i < window.players.length; i++) {
         let row = formTable.insertRow();
         row.setAttribute("id", "bidPlayer" + i);

         let nameCell = row.insertCell(0);
         nameCell.classList.add("bidName");
         nameCell.innerHTML = window.players[i];

         let scoreCell = row.insertCell(1);
         let score = window.scores[window.currentRound - 1][i];
         if (score) { scoreCell.innerHTML = score.toString(); } else { scoreCell.innerHTML = "0"; }

         for (let number = 0; number <= currentCards; number++) {
            let numberCell = row.insertCell(-1);
            numberCell.setAttribute("onclick", "return clickBidButton(this.parentNode,"
                                               + " this.innerHTML.trim(), " + i.toString() + ")");
            numberCell.innerHTML = number.toString();
         }
      }
      createStretchTableHead(formTable, ["Spelers", "Scores", "Bieden"], (currentCards + 1));
      return true;
   } catch (e) {
      alert("createBidTable " + e.message);
      return false;
   }

}

function clearBidsPlayer(player) {
   try {
      for (let child of player.children) {
         if (child.getAttribute("class")) {
            child.classList.remove("highlighted");
         }
         child.classList.add("unhighlighted");
      }
      return true;
   } catch (e) {
      alert("clearBidsPlayer " + e.message);
      return false;
   }
}

function clickBidButton(parent, numberString, playerIndexString) {
   try {
      clearBidsPlayer(parent);
      let numberAsInt = parseInt(numberString, 10);
      let playerIndexInt = parseInt(playerIndexString, 10);
      let indexToHighlight = parent.children[numberAsInt + 2];
      indexToHighlight.classList.remove("unhighlighted");
      indexToHighlight.classList.add("highlighted");
      window.currentBids[playerIndexInt] = numberAsInt;
      updateBidsPlaced();
      return true;
   } catch (e) {
      alert("clickBidButton " + e.message);
      return false;
   }
}

function updateBidsPlaced() {
   try {
      let bidInfoRow = document.getElementById("bidInfoRow");
      let sumBids = 0;
      let currentCards = getCurrentCards();
      for (let bid of window.currentBids) {
         if (bid) { sumBids += bid; }
      }
      bidInfoRow.innerHTML = sumBids.toString() + " / " + currentCards.toString();
      return true;
   } catch (e) {
      alert("updateBidsPlaced " + e.message);
      return false;
   }
}

window.onload = function() {
   while (!document.getElementById("newGameScreen")) { }
   //TODO Check for existing save game
   toNewGame();
};
