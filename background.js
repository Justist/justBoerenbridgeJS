function setEverythingToNone() {
   for (let page of ["startScreen", "playerScreen", "bidScreen", "takeScreen", "scoreBoard"]) {
      let div = document.getElementById(page);
      div.setAttribute("style", "display:none");
   }
}

function toPlayers() {
   setEverythingToNone();
   let play = document.getElementById("playerScreen");
   play.setAttribute("style", "display:block");
   return true;
}

function toBids() {
   setEverythingToNone();
   let bid = document.getElementById("bidScreen");
   bid.setAttribute("style", "display:block");
   return true;
}

function toTakes() {
   setEverythingToNone();
   let bid = document.getElementById("takeScreen");
   bid.setAttribute("style", "display:block");
   return true;
}

function toScores() {
   setEverythingToNone();
   let bid = document.getElementById("scoreBoard");
   bid.setAttribute("style", "display:block");
   return true;
}

function showProceedGameButton() {
   let fileChooser = document.getElementById("fileInput");
   let button = document.getElementById("proceedGameButton");
   if (fileChooser.value) {
      button.setAttribute("style", "display:block");
   } else {
      button.setAttribute("style", "display:none");
   }
}

function openExistingGame() {
   return false;
}

function showNextPlayerField(number, value) {
   let nextField;
   try {
      nextField = document.getElementById("player" + (number + 1).toString());
   } catch (e) {
      return false;
   }

   if (value) { nextField.setAttribute("style", "display:block"); }
   else { nextField.setAttribute("style", "display:none"); }
   return true;
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

function updateBidsPlaced() {
   let bidsPlaced = document.getElementById("bidsPlaced");
   let parent = document.getElementById("bidScreen");
   bidsPlaced.innerHTML = sumOfNumberInputFields(parent).toString();
   return true;
}

window.onload = function() {
   // Check for existing save game
}
