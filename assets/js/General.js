class General {
   /*
    * Class containing 'general' functions.
    * All are static and therefore require no class initialisation and don't use class variables.
    */

   /*
    * Taken from https://stackoverflow.com/a/3270648/1762311
    */
   static addEvent(object, eventType, func) {
      try {
         if (object.addEventListener) { // For all major browsers, except IE 8 and earlier
            object.addEventListener(eventType, func, false);
            return true;
         } else if (object.attachEvent) { // For IE 8 and earlier versions
            return object.attachEvent("on" + eventType, func);
         } else {
            throw new Error("Handler could not be attached");
         }
      } catch (e) {
         alert("General.addEvent " + e.message + " on line number " + e.lineNumber);
         return false;
      }
   }

   static addEventToButton(buttonName, func, eventType = "click") {
      try {
         return General.addEvent(document.getElementById(buttonName), eventType, func);
      } catch (e) {
         alert("General.addEventToButton " + e.message + " on line number " + e.lineNumber);
         return false;
      }
   }

   /*static addLastEvent(object, eventType, func) {
      try {
         if (! General.addEvent(object, eventType, func)) { return false; }
         let completeFunc = new function(object, eventType) {
            let checkVar = true;
            for (let eL of object.getEventListeners(eventType)) {
               if (! checkVar) { break; }
               checkVar = eL.listener();
            }
            return checkVar;
         };
         // TODO: Find some way to remove all previous eventListeners
         return General.addEvent(object, eventType, completeFunc);
      } catch (e) {
         alert("General.addLastEvent " + e.message + " on line number " + e.lineNumber);
         return false;
      }
   }

   static addCumulativeEvent(object, eventType, newFunc) {
      try {
         let eventsOnObject = object.getEventListeners(eventType);
         let functionList = [newFunc];
         for (let eL of eventsOnObject) {
            functionList.push(eL.listener);
         }
         return General.addEvent(object, eventType);
      } catch (e) {
         alert("General.addCumulativeEvent " + e.message + " on line number " + e.lineNumber);
         return false;
      }
   }*/

   static createRadioButton(name, id, classAddition, checked) {
      try {
         let radioButton = document.createElement("input");
         radioButton.setAttribute("type", "radio");
         radioButton.setAttribute("name", name);
         radioButton.setAttribute("id", id);
         radioButton.checked = checked; // setAttribute does not work for this :(
         radioButton.classList.add(classAddition);
         return radioButton;
      } catch (e) {
         alert("General.createRadioButton " + e.message + " on line number " + e.lineNumber);
         return false;
      }
   }

   static createStretchTableHead(table, rowData, stretch) {
      try {
         let allButLast = rowData.slice(0, -1);
         let headRow = General.createTableHead(table, allButLast);
         let th = document.createElement("th");
         th.setAttribute("colspan", stretch);
         th.textContent = rowData.slice(-1)[0]; //last element
         headRow.appendChild(th);
         return true;
      } catch (e) {
         alert("General.createStretchTableHead " + e.message + " on line number " + e.lineNumber);
         return false;
      }
   }

   static createTableHead(table, rowData) {
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
         alert("General.createTableHead " + e.message + " on line number " + e.lineNumber);
         return false;
      }
   }

   static getCurrentCards(round = -1) {
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
         alert("General.getCurrentCards " + e.message + " on line number " + e.lineNumber);
         return false;
      }
   }

   static hideOrShowElement(element, show) {
      try {
         if (show) {
            if (element.classList.contains("hidden")) { element.classList.remove("hidden"); }
         } else {
            if (! element.classList.contains("hidden")) { element.classList.add("hidden"); }
         }
         return true;
      } catch (e) {
         alert("General.hideOrShowElement " + e.message + " on line number " + e.lineNumber);
         return false;
      }
   }

   static removeAllContent(parent) {
      try {
         while (parent.firstChild) { parent.removeChild(parent.lastChild); }
         return true;
      } catch (e) {
         alert("General.removeAllContent " + e.message + " on line number " + e.lineNumber);
         return false;
      }
   }

   static setEverythingToNone() {
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
         alert("General.setEverythingToNone " + e.message + " on line number " + e.lineNumber);
         return false;
      }
   }
}
