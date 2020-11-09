window.maxPlayers = 8;
window.players = [];
window.bids = { 0 : [] };
window.takes = { 0 : [] };
window.scores = { 0 : [] };
window.currentBids = [];
window.currentRound = 1;
window.maxCards = -1; //Updated later on

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
      return true;
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
      createBidTable();
      return true;
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
      let scores = document.getElementById("scoreBoard");
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

function showNextPlayerField(number, value) {
   let nextField;
   try {
      nextField = document.getElementById("trNameInputPlayer" + (number + 1).toString());
      if (value) { nextField.classList.remove("hidden"); } else { hideAllNextPlayerFields(number); }
   } catch (e) {
      return false;
   }
}

// noinspection JSUnusedGlobalSymbols
function storePlayers() {
   try {
      let playerForm = document.getElementById("newGameForm");
      let inputFields = getTypeInputFields(playerForm, "text");
      console.log(inputFields);
      for (let field of inputFields) {
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
