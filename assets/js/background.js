// TODO Set to false before pushing to main!
window.DEBUG = false;

window.regularPlayers =
   ["Speler 1", "Speler 2", "Speler 3", "Speler 4", "Speler 5", "Speler 6", "Speler 7", "Speler 8"];

class Settings {
   constructor() {
      this.roundWithoutTrump =
         { id : "rwt", text : "Middelste ronde zonder troef: ", type : "boolean", value : true };
      this.spadeDouble =
         { id : "sd", text : "Schoppen telt dubbel: ", type : "boolean", value : true };
      this.dealerLast =
         { id : "dl", text : "Deler onderaan bij bieden/halen: ", type : "boolean", value : false };
      this.minPlayers =
         { id : "minp", text : "Minimum aantal spelers mogelijk: ", type : "number", value : 2 };
      this.maxPlayers =
         { id : "maxp", text : "Maximum aantal spelers mogelijk: ", type : "number", value : 8 };
      this.maxCardsPossible =
         { id : "maxc", text : "Maximum aantal kaarten mogelijk: ", type : "number", value : 10 };
   }

   getSetting(name) {
      try {
         if (this.hasOwnProperty(name)) {
            return this[name];
         } else {
            return false;
         }
      } catch (e) {
         alert("window.settings.getSetting: " + e.message);
         return false;
      }
   }

   getValue(name) {
      try {
         let setting = this.getSetting(name);
         if (setting) { return setting.value; } else { return false; }
      } catch (e) {
         alert("window.settings.getValue: " + e.message);
         return false;
      }
   }
}

//  deepcode ignore no-extend-native: I like format()
String.prototype.format = function() {
   try {
      //  deepcode ignore prefer-rest-params: doesn't work otherwise
      return [...arguments].reduce((p, c) => p.replace(/%s/, c), this);
   } catch (e) {
      alert("String.prototype.format " + e.message);
      return false;
   }
};

function storageAvailable(type) {
   // As copied from
   // https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
   let storage, x;
   try {
      storage = window[type];
      x = "__storage_test__";
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
   } catch (e) {
      return e instanceof DOMException && (
                  // everything except Firefox
         e.code === 22 ||
         // Firefox
         e.code === 1014 ||
         // test name field too, because code might not be present
         // everything except Firefox
         e.name === "QuotaExceededError" ||
         // Firefox
         e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
             // acknowledge QuotaExceededError only if there's something already stored
             (storage && storage.length !== 0);
   }
}

function storeLocal(itemName, itemData) {
   try {
      if (! storageAvailable("localStorage")) {
         // This should be changed to not be an alert on every try, like a static message somewhere
         alert("No local storage available! Changes will not be saved!");
         // Then fail silently
         return true;
      }
      window.localStorage.setItem(itemName, itemData);
      return true;
   } catch (e) {
      alert("storeLocal: " + e.message);
      return false;
   }
}

function getLocal(itemName) {
   try {
      if (! storageAvailable("localStorage")) {
         // This should be changed to not be an alert on every try, like a static message somewhere
         alert("No local storage available! Changes will not be saved!");
         // Then fail silently
         return true;
      }
      return window.localStorage.getItem(itemName);
   } catch (e) {
      alert("getLocal: " + e.message);
      return false;
   }
}

function clearLocal() {
   try {
      if (storageAvailable("localStorage")) {
         window.localStorage.clear();
      } else {
         alert("Cookies niet beschikbaar, kan ze niet verwijderen!");
      }
      return true;
   } catch (e) {
      alert("clearLocal: " + e.message);
      return false;
   }
}

function getSettings() {
   try {
      let keyValue;
      for (let key in window.settings) {
         if (! window.settings.hasOwnProperty(key)) {
            continue;
         }
         keyValue = getLocal(key);
         if (keyValue) {
            window.settings[key] = JSON.parse(keyValue);
         }
      }
      return true;
   } catch (e) {
      alert("getSettings: " + e.message);
      return false;
   }
}

function storeSettings() {
   try {
      for (let key in window.settings) {
         if (! (window.settings.hasOwnProperty(key) && window.settings[key])) {
            continue;
         }
         storeLocal(key, JSON.stringify(window.settings[key]));
      }
      return true;
   } catch (e) {
      alert("storeSettings: " + e.message);
      return false;
   }
}

function removeAllContent(parent) {
   try {
      while (parent.firstChild) { parent.removeChild(parent.lastChild); }
      return true;
   } catch (e) {
      alert("removeAllContent " + e.message);
      return false;
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
                        "settingsScreen"])
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

      return hideOrShowElement(document.getElementById("takeScreenToBidsButton"), true)
             && hideOrShowElement(document.getElementById("scoreboardToBidButton"), true)
             && hideOrShowElement(document.getElementById("scoreboardToOtherButtons"), false);
   } catch (e) {
      alert("resetAllStats " + e.message);
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

function toNewGame() {
   try {
      setEverythingToNone();
      resetAllStats();
      hideOrShowElement(document.getElementById("newGameScreen"), true);

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

function toBids() {
   try {
      setEverythingToNone();
      window.currentBids = [];
      let alert = document.getElementById("spadeTrumpSelectAlert");
      hideOrShowElement(document.getElementById("bidScreen"), true);
      let spadeRadioButtons =
             getTypeInputFields(document.getElementById("spadeRadioButtonsP"), "radio");
      for (let button of spadeRadioButtons) { button.checked = false; }
      let spadeDouble = window.settings.getValue("spadeDouble");
      if ((window.settings.getValue("roundWithoutTrump")
           && (window.currentRound === window.maxCardsThisGame + 1))
          || (! spadeDouble))
      {
         hideOrShowElement(alert, false);
         hideOrShowElement(document.getElementById("spadeRadioButtonsP"), false);
         hideOrShowElement(document.getElementById("middleRoundText"), spadeDouble);
         spadeRadioButtons[1].checked = true;
      } else {
         hideOrShowElement(alert, true);
         hideOrShowElement(document.getElementById("spadeRadioButtonsP"), true);
         hideOrShowElement(document.getElementById("middleRoundText"), false);
      }
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
      hideOrShowElement(document.getElementById("takeScreen"), true);
      if (window.settings.getValue("roundWithoutTrump")
          && (window.currentRound === window.maxCardsThisGame + 1))
      {
         hideOrShowElement(document.getElementById("spadeTrumpTakeScreen"), false);
      } else {
         hideOrShowElement(document.getElementById("spadeTrumpTakeScreen"), true);
      }
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
      return createScoreBoard();
   } catch (e) {
      alert("toScores " + e.toString());
      return false;
   }
}

function toGameRules() {
   try {
      setEverythingToNone();
      return hideOrShowElement(document.getElementById("gameRulesScreen"), true);
   } catch (e) {
      alert("toGameRules " + e.toString());
      return false;
   }
}

function toSettings() {
   try {
      setEverythingToNone();
      return createSettingsScreen();
   } catch (e) {
      alert("toSettings " + e.message);
      return false;
   }
}

function toOverview() {
   try {
      setEverythingToNone();
      window.settings = new Settings();
      return getSettings() && hideOrShowElement(document.getElementById("overviewScreen"), true);
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

function createRadioButton(name, id, classAddition, checked) {
   try {
      let radioButton = document.createElement("input");
      radioButton.setAttribute("type", "radio");
      radioButton.setAttribute("name", name);
      radioButton.setAttribute("id", id);
      radioButton.checked = checked; // setAttribute does not work for this :(
      radioButton.classList.add(classAddition);
      return radioButton;
   } catch (e) {
      alert("createRadioButton " + e.message);
      return false;
   }
}

function getCurrentCards(round = -1) {
   try {
      if (round === -1) { round = window.currentRound; }
      let currentCards = round;
      if (window.settings.getValue("roundWithoutTrump")
          && (currentCards === (window.maxCardsThisGame + 1)))
      {
         currentCards = window.maxCardsThisGame;
      } else if (currentCards > window.maxCardsThisGame) {
         currentCards =
            ((window.maxCardsThisGame + (window.settings.getValue("roundWithoutTrump") ? 1 : 0))
             * 2) - round;
      }

      return currentCards;
   } catch (e) {
      alert("getCurrentCards " + e.message);
      return false;
   }
}

function clickDealerRadiobutton(playerIndex) {
   try {
      document.getElementById("radioDealer-" + playerIndex.toString()).checked = true;
      return true;
   } catch (e) {
      alert("clickDealerRadiobutton " + e.message);
      return false;
   }
}

function createPlayersTable() {
   try {
      let playerTable = document.getElementById("newGameInputTable");
      removeAllContent(playerTable);

      for (let playerIndex = 0;
           playerIndex < window.settings.getValue("maxPlayers");
           playerIndex++)
      {
         let row = playerTable.insertRow();
         if (playerIndex > 1) { hideOrShowElement(row, false); }
         row.setAttribute("id", "playerRow" + playerIndex);
         let dealerCell = row.insertCell(0);
         dealerCell.classList.add("vertCenter");
         dealerCell.setAttribute("onclick",
                                 "return updatePlayers(" + playerIndex.toString() + ", \"-1\")");

         dealerCell.appendChild(createRadioButton("firstDealer",
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
         hideOrShowElement(document.getElementById("debugSetMaxCardsDiv"), true);
      }
      return createTableHead(playerTable, ["Eerste deler", "Namen spelers"]);
   } catch (e) {
      alert("createPlayersTable " + e.message);
      return false;
   }
}

function hideAllNextPlayerFields(number) {
   try {
      for (let i = number + 1; i < window.settings.getValue("maxPlayers"); i++) {
         hideOrShowElement(document.getElementById("playerRow" + i.toString()), false);
      }
      return true;
   } catch (e) {
      alert("hideAllNextPlayerFields " + e.message);
      return false;
   }
}

function findFirstHiddenNameField() {
   try {
      let i;
      for (i = 0; i < window.settings.getValue("maxPlayers"); i++) {
         if (document.getElementById("playerRow" + i.toString()).classList.contains("hidden")) {
            break;
         }
      }
      // Even if the loop doesn't break, we still get a number
      return i;
   } catch (e) {
      alert("findFirstHiddenNameField " + e.message);
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
      alert("checkDoublePlayers " + e.message);
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
      alert("checkPlayerValidity " + e.message);
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
             && hideOrShowElement(noValidDealerAlert, ! conditionValidDealer)
             && hideOrShowElement(notEnoughPlayersAlert, ! conditionEnoughPlayers)
             && hideOrShowElement(doublePlayerNamesAlert, ! conditionNoDoublePlayers)
             && hideOrShowElement(buttonElement,
             conditionEnoughPlayers && conditionValidDealer && conditionNoDoublePlayers);
   } catch (e) {
      alert("updatePlayers " + e.message);
      return false;
   }
}

function showAllNextPlayerFields(index, value) {
   // with values, of course
   try {
      if (value) {
         for (let i = index + 1; i < window.settings.getValue("maxPlayers"); i++) {
            hideOrShowElement(document.getElementById("playerRow" + i.toString()), true);
            // Only show one empty line
            if (document.getElementById("nameChoice-" + i.toString()).value === "") { break; }
         }
         return true;
      } else { return hideAllNextPlayerFields(index); }
   } catch (e) {
      alert("showAllNextPlayerFields " + e.message);
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
      alert("anyRadioFilled " + e.message);
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
      let row;
      for (let i = 0; i < window.players.length; i++) {
         if (window.settings.hasOwnProperty("dealerLast")
             && window.settings["dealerLast"].value
             === true)
         {
            row = formTable.insertRow(i <= window.currentDealerIndex ? -1 : i
                                                                            - (window.currentDealerIndex
                                                                               + 1));
         } else {
            row = formTable.insertRow();
         }
         row.setAttribute("id", playerId + i.toString());

         let nameCell = row.insertCell(0);
         nameCell.classList.add(cellName);
         nameCell.innerHTML = window.players[i].toString(); //Just to prevent warnings, this should
                                                            // contain strings
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
      alert("createBidTakeTable " + e.message);
      return false;
   }
}

function createBidTable() {
   try {
      let formTable = createBidTakeTable("bid");
      return createStretchTableHead(formTable,
                                    ["Spelers", "Scores", "Bieden"],
                                    (getCurrentCards() + 1));
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

function clickSpadeRadioButton() {
   try {
      return updateBidsOrTakesPlaced("bid");
   } catch (e) {
      alert("clickSpadeRadioButton " + e.message);
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
      (bidOrTake === "bid")
      ? window.currentBids[playerIndexInt] = numberAsInt
      : window.currentTakes[playerIndexInt] =
         numberAsInt;
      return updateBidsOrTakesPlaced(bidOrTake);
   } catch (e) {
      alert("clickBidOrTakeButton " + e.message);
      return false;
   }
}

function hideOrShowElement(element, show) {
   try {
      if (show) {
         if (element.classList.contains("hidden")) { element.classList.remove("hidden"); }
      } else {
         if (! element.classList.contains("hidden")) { element.classList.add("hidden"); }
      }
      return true;
   } catch (e) {
      alert("hideOrShowElement " + e.message);
      return false;
   }
}

function updateBidsOrTakesPlaced(bidOrTake) {
   try {
      let infoRow = document.getElementById(bidOrTake === "bid" ? "bidInfoRow" : "takeInfoRow");
      let sum = 0;
      let currentCards = getCurrentCards();
      for (let num of bidOrTake === "bid" ? window.currentBids : window.currentTakes) {
         if (num) { sum += num; }
      }
      infoRow.innerHTML = sum.toString() + " / " + currentCards.toString();
      let buttonElement = document.getElementById(bidOrTake + "ScreenButtonsTable");
      let equalAlert  = document.getElementById(bidOrTake + "sEqualAlert"),
          filledAlert = document.getElementById(bidOrTake + "sFilledAlert"),
          spadeAlert  = document.getElementById("spadeTrumpSelectAlert");

      let equalCheck = (sum === currentCards);
      // Filter to make sure not to count empty elements
      let amountInputsFilled = (bidOrTake === "bid"
                                ? window.currentBids
                                : window.currentTakes).filter(function(value) {
         return typeof (value !== "undefined")
                && (value !== null);
      }).length;
      let spadeRadioChecked = true;
      if (bidOrTake === "bid") {
         spadeRadioChecked =
            (anyRadioFilled(document.getElementById("spadeRadioButtonsP")) !== -1);
      }
      let allFilledIn = (window.players.length === amountInputsFilled);
      return hideOrShowElement(equalAlert, (bidOrTake === "bid" ? equalCheck : (! equalCheck)))
             && hideOrShowElement(filledAlert, (! allFilledIn))
             && (bidOrTake === "bid" ? hideOrShowElement(spadeAlert, (! spadeRadioChecked)) : true)
             && hideOrShowElement(buttonElement,
             (bidOrTake === "bid" ? (! equalCheck) : equalCheck)
             && allFilledIn
             && spadeRadioChecked);
   } catch (e) {
      alert("updateBidsOrTakesPlaced " + e.message);
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
      alert("storeBids " + e.message);
      return false;
   }
}

function createTakeTable() {
   try {
      let formTable = createBidTakeTable("take");

      if (window.currentRound === window.maxRounds) {
         hideOrShowElement(document.getElementById("takeScreenToBidsButton"), false);
      }
      return createStretchTableHead(formTable,
                                    ["Spelers", "Scores", "Geboden", "Gehaald"],
                                    (getCurrentCards() + 1));
   } catch (e) {
      alert("createTakeTable " + e.message);
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
      alert("calculateTotalScores " + e.message);
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
      alert("updateScores " + e.message);
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
      alert("storeTakes " + e.message);
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
      alert("clickScoreCell " + e.message);
      return false;
   }
}

function createScoreBoard() {
   try {
      let scoreTable = document.getElementById("scoreDataTable");
      removeAllContent(scoreTable);
      let totalScores = calculateTotalScores();
      let spadeDouble = window.settings.getValue("spadeDouble");
      for (let round = 0; round < window.currentRound; round++) {
         let scoreRow = scoreTable.insertRow();
         let roundCell = scoreRow.insertCell(0);
         roundCell.innerHTML = round === 0 ? "" : round.toString();
         let cardsCell = scoreRow.insertCell(1);
         cardsCell.innerHTML = round === 0 ? "" : getCurrentCards(round).toString();
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
         hideOrShowElement(document.getElementById("scoreboardToBidButton"), false);
         hideOrShowElement(document.getElementById("scoreboardToOtherButtons"), true);
      }
      let rowData = ["Ronde", "Kaarten", ...window.players];
      if (spadeDouble) { rowData = ["Ronde", "Kaarten", "♠", ...window.players]; }
      return createTableHead(scoreTable, rowData);
   } catch (e) {
      alert("createScoreBoard " + e.message);
      return false;
   }
}

function createSettingsScreen() {
   try {
      let settingsTable = document.getElementById("settingsTable");
      removeAllContent(settingsTable);
      let row = settingsTable.insertRow();
      let cell1 = row.insertCell(0);
      cell1.innerText = "Instelling:";
      let cell2 = row.insertCell(1);
      cell2.innerText = "Uit";
      let cell3 = row.insertCell(2);
      cell3.innerText = "Aan";
      for (let key in window.settings) {
         if (! window.settings.hasOwnProperty(key)) {
            continue;
         }
         let keyValue = window.settings.getSetting(key);
         row = settingsTable.insertRow();
         cell1 = row.insertCell(0);
         cell1.innerText = keyValue.text;
         cell2 = row.insertCell(1);
         if (keyValue.type === "boolean") {
            cell3 = row.insertCell(2);
            cell2.appendChild(createRadioButton(keyValue.id + "radio",
                                                keyValue.id + "radioId1",
                                                "alignLeft",
                                                keyValue.value === false));
            cell3.appendChild(createRadioButton(keyValue.id + "radio",
                                                keyValue.id + "radioId2",
                                                "alignLeft",
                                                keyValue.value === true));
         } else if (keyValue.type === "number") {
            cell2.setAttribute("colspan", "2");
            let numberInput = document.createElement("input");
            numberInput.setAttribute("type", "number");
            numberInput.setAttribute("id", keyValue.id + "numberId");
            numberInput.setAttribute("value", keyValue.value);
            cell2.appendChild(numberInput);
         }
      }
      return hideOrShowElement(document.getElementById("settingsScreen"), true);
   } catch (e) {
      alert("createSettingsScreen " + e.message);
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
      return storeSettings();
   } catch (e) {
      alert("saveSettings " + e.message);
      return false;
   }
}

window.onload = function() {
   while (! document.getElementById("overviewScreen")) { }
   //TODO Check for existing save game
   toOverview();
};
