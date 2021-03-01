class BidView extends NumberSelectView {
   constructor() {
      super();
      this.currentBids = [];
   }

   toBids(settingsObject, currentRound, maxCardsThisGame) {
      try {
         General.setEverythingToNone();
         this.currentBids = [];
         let alert = document.getElementById("spadeTrumpSelectAlert");
         General.hideOrShowElement(document.getElementById("bidScreen"), true);
         let spadeRadioButtons =
                getTypeInputFields(document.getElementById("spadeRadioButtonsP"), "radio");
         for (let button of spadeRadioButtons) { button.checked = false; }
         let spadeDouble = settingsObject.getValue("spadeDouble");
         if ((settingsObject.getValue("roundWithoutTrump")
              && (currentRound === maxCardsThisGame + 1))
             || (! spadeDouble))
         {
            General.hideOrShowElement(alert, false);
            General.hideOrShowElement(document.getElementById("spadeRadioButtonsP"), false);
            General.hideOrShowElement(document.getElementById("middleRoundText"), spadeDouble);
            spadeRadioButtons[1].checked = true;
         } else {
            General.hideOrShowElement(alert, true);
            General.hideOrShowElement(document.getElementById("spadeRadioButtonsP"), true);
            General.hideOrShowElement(document.getElementById("middleRoundText"), false);
         }
         return updateRoundInfo("bid") && createBidTable();
      } catch (e) {
         alert("toBids " + e.message + " on line number " + e.lineNumber);
         return false;
      }
   }
}
