window.maxPlayerCount = 8; // CHANGE IF NEEDED
window.players = [];
window.jsonFileName = "default.json";
window.bids = {};
window.takes = {};
window.scores = {};
window.spades = {};
window.lastRound = 1; //Start at the first round
window.maxCards = 0; //Should be updated after players are given

window.spadeUnicode = "♠";

function removeBodyContent() {
   const mainDiv = document.getElementById("main");
   while (mainDiv.firstChild) {
      mainDiv.removeChild(mainDiv.lastChild);
   }
}

function createTableHead(table, rowData) {
   let head = table.createTHead();
   let row = head.insertRow();
   for (let i = 0; i < rowData.length; i++) {
      let th = document.createElement("th");
      th.textContent = rowData[i];
      row.appendChild(th);
   }
}

function createSimpleElement(parent, elementType) {
   let element = document.createElement(elementType);
   parent.appendChild(element);
   return element;
}

function createButtonElement(parent, id, value) {
   let button = createElement(parent, "submit", id, "", "", "button");
   button.innerHTML = value;
   return button;
}

function createInputElement(parent, type, id, value, placeholder, onchange) {
   let element = createElement(parent, type, id, value, placeholder, "input");
   if (onchange !== "") { element.setAttribute("onchange", onchange); }
   return element;
}

function createElement(parent, type, id, value, placeholder, elementType) {
   if (elementType === "") {
      alert("elementType is empty!");
      throw new Error("elementType is empty!");
   }
   let element = createSimpleElement(parent, elementType);
   if (type !== "") { element.setAttribute("type", type); }
   if (id !== "") { element.setAttribute("id", id); }
   if (value !== "") { element.setAttribute("value", value); }
   if (placeholder !== "") { element.setAttribute("placeholder", placeholder); }
   return element;
}

function createRow(table, amountOfCells, contentOfCells, returnCellReferences, id) {
   // Assuming the contentOfCells variable is an array
   let row = table.insertRow();
   row.setAttribute("id", id);
   let cellReferences = [];
   let returnValues = [];
   for (let i = 0; i < amountOfCells; i++) {
      let cell = row.insertCell(-1);
      cell.innerHTML = contentOfCells[i];
      cellReferences.push(cell);
   }
   returnValues.push(row);
   if (returnCellReferences) {
      returnValues.push(cellReferences);
   }
   return returnValues;
}

function createCurrentBidsRow(parent, currentBids, cards) {
   return createCurrentBidsOrTakesRow(parent,
                                      currentBids,
                                      cards,
                                      "Geboden",
                                      "currentBidsRow");
}

function createCurrentTakesRow(parent, currentTakes, cards) {
   return createCurrentBidsOrTakesRow(parent,
                                      currentTakes,
                                      cards,
                                      "Gehaald",
                                      "currentTakesRow");
}

function createCurrentBidsOrTakesRow(parent, currentNumber, cards, text, id) {
   return createRow(parent,
                    2,
                    [
                       text,
                       currentNumber.toString()
                       + " / "
                       + cards.toString()
                    ],
                    false,
                    id);
}

function getInputFields(parent) {
   return parent.querySelectorAll("input");
}

function getTypeInputFields(parent, type) {
   return parent.querySelectorAll("input[type=" + type + "]");
}

function sumOfNumberInputFields(parent) {
   let sum = 0;
   let inputFields = getTypeInputFields(parent, "number");
   for (let inField of inputFields) {
      let value = parseInt(inField.value, 10);
      if (value > 0) {
         sum += value;
      }
   }
   return sum;
}

function arrayParseInt(array, base) {
   let newArray = [];
   for (let number of array) {
      newArray.push(parseInt(number, base));
   }
   return newArray;
}

function createForm(parent, method, id, onsubmit) {
   let form = createSimpleElement(parent, "form");
   form.setAttribute("method", method);
   form.setAttribute("id", id);
   form.setAttribute("onsubmit", onsubmit);
   return form;
}

// noinspection JSUnusedGlobalSymbols
function updateRoundSelectorButton(value) {
   try {
      document.getElementById("roundSubmit").innerHTML = "Ga naar ronde " + value;
   } catch (e) {
      alert(e.message);
      return false;
   }
   return true;
}

// noinspection JSUnusedGlobalSymbols
function goToRoundScreen(bidOrTake) {
   let round = document.getElementById("roundSelector").value;
   if (bidOrTake !== "bid" && bidOrTake !== "take") {
      alert("goToRoundScreen called without valid bidOrTake argument, instead: " + bidOrTake.toString());
      return false;
   }
   removeBodyContent();
   if (bidOrTake === "bid") {
      createBidForm(round);
   } else { //it has to be "take" at this point
      createTakeForm(round);
   }
   return true;
}

function createRoundSelector(parent, bidOrTake) {
   let roundDiv = createSimpleElement(parent, "div");
   roundDiv.setAttribute("class", "roundSelectorDiv");
      let roundSelector = createElement(roundDiv,
                                        "",
                                        "roundSelector",
                                        "",
                                        "",
                                        "select");
      roundSelector.setAttribute("onchange", "return updateRoundSelectorButton(this.value)");
      roundSelector.setAttribute("value", "1");
         for (let i = 0; i < window.lastRound; i++) {
            let option = createSimpleElement(roundSelector, "option");
            option.text = (i + 1).toString();
            roundSelector.add(option);
         }
      let button = createButtonElement(roundDiv, "roundSubmit", "Ga naar ronde 1");
      button.setAttribute("onclick", "return goToRoundScreen(" + bidOrTake + ")");

   return roundDiv;
}

function createPlayersForm() {
   const mainDiv = document.getElementById("main");
   let form = createForm(mainDiv,
                         "POST",
                         "playersForm",
                         "return storePlayers(this)");
   let title = document.createTextNode("Spelers:");
   form.appendChild(title);
   form.appendChild(document.createElement("br"));

   for (let i = 0; i < window.maxPlayerCount; i++) {
      createInputElement(form, "text", "player" + i.toString(),
                         "", "Speler " + (i + 1).toString(), "");
      form.appendChild(document.createElement("br"));
   }
   createButtonElement(form, "playerSubmit", "Naar Bieden");
}

// noinspection JSUnusedGlobalSymbols
function storePlayers(formData) {
   for (let key in formData.children) {
      let name = formData[key].value;
      if (name === "" || name === "Naar Bieden") {
         break;
      }
      window.players.push(name);
   }
   window.jsonFileName = window.players.join("");
   window.maxCards = Math.floor(52 / window.players.length);
   removeBodyContent();
   createBidForm();
}

function createBidForm(round = 1) {
   const mainDiv = document.getElementById("main");
   let cards = round;
   if (round > window.maxCards) {
      cards = 2 * window.maxCards - round;
   }

   createRoundSelector(mainDiv, "bid");

   let bidForm = createForm(mainDiv, "POST", "bidForm",
                            "return storeBids(this, " + round.toString() + ")");

   let bidTable = createSimpleElement(bidForm, "table");
   // Checkbox for 'schoppenrondje' (spade is the trump and all points are doubled)
   let spadeRow = bidTable.insertRow();
   let spadeCell = spadeRow.insertCell(-1);
   let checkboxDiv = createSimpleElement(spadeCell, "div");
   let checkboxLabel = createSimpleElement(checkboxDiv, "label");
   checkboxLabel.setAttribute("for", "checkboxSpade");
   checkboxLabel.innerHTML = window.spadeUnicode;
   createElement(checkboxDiv,
                 "checkbox",
                 "checkboxSpade",
                 false,
                 "",
                 "input");

   for (let i = 0; i < window.players.length; i++) {
      let row = bidTable.insertRow();
      let rowFirstCell = row.insertCell(-1);
      let rowSecondCell = row.insertCell(-1);
      rowFirstCell.innerHTML = window.players[i];

      let value = "0";
      if (round in window.bids) {
         value = window.bids[round][i];
      }
      let input = createInputElement(rowSecondCell,
                                     "number",
                                     "bidPlayer" + i.toString(),
                                     value,
                                     "",
                                     "changeCurrentBids("
                                     + cards.toString()
                                     + ")"
      );
      if (round < window.lastRound) {
         input.readOnly = true;
      }
   }
   // Create an extra cell with info on how many bids are bet
   createCurrentBidsRow(bidTable, 0, cards);

   // Create THead at the end so insertRow works on TBody
   createTableHead(bidTable, ["Spelers", "Geboden"]);
   createButtonElement(bidForm, "bidSubmit", "Naar Halen");
}

// noinspection JSUnusedGlobalSymbols
function changeCurrentBids(cards) {
   // This should already exist once the input fields are being changed by the user
   let currentBidsRow = document.getElementById("currentBidsRow");
   let parent = currentBidsRow.parentNode;
   parent.removeChild(currentBidsRow);
   let currentBids = sumOfNumberInputFields(parent);
   createCurrentBidsRow(parent, currentBids, cards);
}

// noinspection JSUnusedGlobalSymbols
function storeBids(formData, round) {
   if (round === window.lastRound) {
      const form = document.getElementById("bidForm");
      let cards = round;
      if (round > window.maxCards) {
         cards = 2 * window.maxCards - round;
      }

      if (sumOfNumberInputFields(form) === cards) {
         alert("Aantal geboden slagen mag niet gelijk zijn aan totaal te halen slagen!");
         return false;
      }

      let inputFields = Array.from(getTypeInputFields(form, "number"));
      let values = inputFields.map(a => a.value);
      window.bids[round] = arrayParseInt(values, 10);
   } else {
      alert("Deze ronde wordt momenteel niet gespeeld en kun je daarom niet opslaan!");
   }
   removeBodyContent();
   createTakeForm(round);
}

function createTakeForm(round = 1) {
   const mainDiv = document.getElementById("main");
   let cards = round;
   if (cards > window.maxCards) {
      cards = 2 * window.maxCards - round;
   }

   createRoundSelector(mainDiv, "take");

   let takeForm = createForm(mainDiv, "POST", "takeForm",
                             "return storeTakes(this, " + round.toString() + ")");

   let takeTable = createSimpleElement(takeForm, "table");

   for (let i = 0; i < window.players.length; i++) {
      let row = takeTable.insertRow();
      let cell1 = row.insertCell(-1);
      cell1.textContent = window.players[i];
      let cell2 = row.insertCell(-1);
      let value = "0";
      if (round in window.takes) {
         value = window.takes[round][i];
      }
      let input = createInputElement(cell2,
                                     "number",
                                     "takePlayer" + i.toString(),
                                     value,
                                     "",
                                     "changeCurrentTakes("
                                     + cards.toString()
                                     + ")"
      );
      if (round < window.lastRound) {
         input.readOnly = true;
      }
   }
   // Create an extra cell with info on how many takes are got
   createCurrentTakesRow(takeTable, 0, cards);

   createTableHead(takeTable, ["Spelers", "Gehaald", "Geboden"]);
   createButtonElement(takeForm, "takeSubmit", "Naar Score");
}

// noinspection JSUnusedGlobalSymbols
function changeCurrentTakes(cards) {
   // This should already exist once the input fields are being changed by the user
   let currentTakesRow = document.getElementById("currentTakesRow");
   let parent = currentTakesRow.parentNode;
   parent.removeChild(currentTakesRow);
   let currentTakes = sumOfNumberInputFields(parent);
   createCurrentTakesRow(parent, currentTakes, cards);
}

// noinspection JSUnusedGlobalSymbols
function storeTakes(formData, round) {
   if (round === window.lastRound) {
      const form = document.getElementById("takeForm");
      let cards = round;
      if (round > window.maxCards) {
         cards = 2 * window.maxCards - round;
      }

      if (sumOfNumberInputFields(form) !== cards) {
         alert("Aantal gehaalde slagen is niet gelijk aan totaal te halen slagen!");
         return false;
      }

      let inputFields = Array.from(getTypeInputFields(form, "number"));
      let values = inputFields.map(a => a.value);
      window.takes[round] = arrayParseInt(values, 10);
   } else {
      alert("Deze ronde wordt momenteel niet gespeeld en kun je daarom niet opslaan!");
   }
   removeBodyContent();
   updateScores(round);
   createScoreBoard();
}

function updateScores(round) {
   let scores = [];
   for (let i = 0; i < window.bids[round].length; i++) {
      if (window.bids[round][i] === window.takes[round][i]) {
         scores.push(10 + window.bids[round][i] * 3);
      } else {
         scores.push(-Math.abs(window.bids[round][i] - window.takes[round][i]) * 3);
      }
   }
   window.scores[round] = scores;
}

// To be used when reading out a save file
function updateAllScores() {
   for (let i = 0; i < window.lastRound; i++) {
      updateScores(i);
   }
}

function createScoreBoard() {
   const mainDiv = document.getElementById("main");
   let scoreBoardTable = createSimpleElement(mainDiv, "table");
   createRow(scoreBoardTable,
             window.players.length + 2,
             ["Rounds", ""].concat(Array(window.players.length).fill("")),
             false,
             "roundRowScoreTable");
   for (let round in window.scores) {
      createRow(scoreBoardTable,
                window.scores[round].length + 2,
                [round, window.spades[round]
                        ? window.spadeUnicode
                        : ""].concat(window.scores[round]),
                false,
                "scoreBoardRow" + round.toString()
      );
   }
   createTableHead(scoreBoardTable, ["Spelers: ", ""].concat(window.players));
}

window.onload = function() {
   while (document.body == null) {
   } //dunno if necessary
   //TODO: When JSON is implemented, something to check for gamestate to restore
   createPlayersForm();
};
