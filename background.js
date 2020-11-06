window.players = [];
window.bids = {0: []}
window.takes = {0: []}
window.currentBids = [];
window.currentRound = 1;

function setEverythingToNone() {
   for (let page of ["startScreen", "playerScreen", "bidScreen", "takeScreen", "scoreBoard"]) {
      let div = document.getElementById(page);
      div.setAttribute("style", "display:none");
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
   document.getElementById("bidRoundNumberTitle").innerHTML = "Ronde " + window.currentRound.toString();
}

function hideUnavailableBidOptions() {
   let bid = document.getElementById("bidScreen");

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
   updateBidRoundLabels();
   hideUnavailableBidOptions();
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

function clearBidsPlayer(player) {
   let imageOff = "./images/nummer-knoppen-blauw-leeg-off.jpg";
   let style = "background: url(\'" + imageOff + "\') center / contain no-repeat;color:"
               + " #ffffff;";
   for (let child of player.children) {
      if (child.style.background.includes("nummer")) {
         child.setAttribute("style", style);
      }
   }
}

function clickBidButton(parent, number) {
   try {
      clearBidsPlayer(parent);
      let numberAsInt = parseInt(number, 10);
      window.currentBids[parent.getAttribute("playerId")] = numberAsInt;
      updateBidsPlaced();
      let imageToFlip = parent.children[numberAsInt + 1];
      let imageOn = "./images/nummer-knoppen-blauw-leeg-on.jpg";
      let style = "background: url(\'" + imageOn + "\') center / contain no-repeat;color:"
                  + " #ffffff;";
      imageToFlip.setAttribute("style", style);
   } catch (e) {
      alert(e.message);
      return false;
   }
   return true;
}

function updateBidsPlaced() {
   let bidsPlaced = document.getElementById("bidsPlaced");
   let sumBids = 0;
   for (let bid of window.currentBids) {
      if (bid) { sumBids += bid; }
   }
   bidsPlaced.innerHTML = sumBids.toString();
   return true;
}

window.onload = function() {
   // Check for existing save game

}
