// ============================================================================

/**
 * Remove all children from a DOM element
 */
function clearElement(parent) {
   try {
      parent.textContent = "";
      return true;
   } catch (e) {
      alert(`clearElement: ${ e.message }`);
      return false;
   }
}

/**
 * Toggle element visibility by adding/removing hidden class
 */
function toggleElement(element, show) {
   try {
      const isHidden = element.classList.contains("hidden");
      if (show && isHidden) {
         element.classList.remove("hidden");
      } else if (! show && ! isHidden) {
         element.classList.add("hidden");
      }
      return true;
   } catch (e) {
      alert(`toggleElement: ${ e.message }`);
      return false;
   }
}

/**
 * Get input fields of a specific type from a parent element
 */
function getInputFieldsByType(parent, type) {
   try {
      return parent.querySelectorAll(`input[type=${ type }]`);
   } catch (e) {
      alert(`getInputFieldsByType: ${ e.message }`);
      return [];
   }
}

/**
 * Get all elements matching a selector from a parent
 */
function getElementsBySelector(parent, selector) {
   try {
      return parent.querySelectorAll(selector);
   } catch (e) {
      alert(`getElementsBySelector: ${ e.message }`);
      return [];
   }
}

/**
 * Create a radio button element
 */
function createRadioButton(name, id, className, checked = false) {
   try {
      const radioButton = document.createElement("input");
      radioButton.type = "radio";
      radioButton.name = name;
      radioButton.id = id;
      radioButton.checked = checked;
      if (className) {
         radioButton.classList.add(className);
      }
      return radioButton;
   } catch (e) {
      alert(`createRadioButton: ${ e.message }`);
      return null;
   }
}

// ============================================================================
// GAME LOGIC UTILITIES
// ============================================================================

/**
 * Get current number of cards in play for a given round
 */
function getCurrentCards(round = -1) {
   try {
      if (round === -1) {
         round = GameState.currentRound;
      }

      let currentCards = round;
      const maxCards = GameState.maxCardsThisGame;
      const roundWithoutTrump = settings.getValue("roundWithoutTrump");

      if (roundWithoutTrump && currentCards === (maxCards + 1)) {
         currentCards = maxCards;
      } else if (currentCards > maxCards) {
         const totalWithRoundWithoutTrump = maxCards + (roundWithoutTrump ? 1 : 0);
         currentCards = (totalWithRoundWithoutTrump * 2) - round;
      }

      return currentCards;
   } catch (e) {
      alert(`getCurrentCards: ${ e.message }`);
      return 0;
   }
}

/**
 * Find first hidden or empty player field index
 * Returns index + 1 if all visible fields are filled
 */
function findFirstHiddenNameField() {
   try {
      const maxPlayers = settings.getValue("maxPlayers");
      for (let i = 0; i < maxPlayers; i++) {
         const row = document.getElementById(`playerRow${ i }`);
         const input = document.getElementById(`nameChoice-${ i }`);

         if (row.classList.contains("hidden") || input.value === "") {
            return i;
         }
      }
      return maxPlayers;
   } catch (e) {
      alert(`findFirstHiddenNameField: ${ e.message }`);
      return 0;
   }
}

/**
 * Check if no duplicate player names exist
 */
function checkNoDuplicatePlayers() {
   try {
      const seenNames = new Set();
      const maxPlayers = settings.getValue("maxPlayers");

      for (let i = 0; i < maxPlayers; i++) {
         const input = document.getElementById(`nameChoice-${ i }`);
         const { value } = input;

         if (value === "") {
            break; // Only check filled fields
         } else if (seenNames.has(value)) {
            return false;
         }
         seenNames.add(value);
      }
      return true;
   } catch (e) {
      alert(`checkNoDuplicatePlayers: ${ e.message }`);
      return false;
   }
}

/**
 * Check if dealer selection is valid
 */
function checkDealerValidity(index) {
   try {
      if (index === -1) {
         return false;
      }

      const input = document.getElementById(`nameChoice-${ index }`);
      const isVisible = ! document.getElementById(`playerRow${ index }`)
                                  .classList
                                  .contains("hidden");
      const hasName = input.value !== "";

      return hasName && isVisible && index < findFirstHiddenNameField();
   } catch (e) {
      alert(`checkDealerValidity: ${ e.message }`);
      return false;
   }
}

/**
 * Get the index of the checked radio button, or -1 if none
 */
function getCheckedRadioIndex(parent) {
   try {
      const radioFields = getInputFieldsByType(parent, "radio");
      for (let i = 0; i < radioFields.length; i++) {
         if (radioFields[i].checked) {
            return i;
         }
      }
      return -1;
   } catch (e) {
      alert(`getCheckedRadioIndex: ${ e.message }`);
      return -1;
   }
}

/**
 * Calculate total scores up to current round
 */
function calculateTotalScores() {
   try {
      const totalScores = [];
      for (let playerIndex = 0; playerIndex < GameState.players.length; playerIndex++) {
         let sum = 0;
         for (let round = 0; round < GameState.currentRound; round++) {
            sum += GameState.scores[round][playerIndex];
         }
         totalScores[playerIndex] = sum;
      }
      return totalScores;
   } catch (e) {
      alert(`calculateTotalScores: ${ e.message }`);
      return [];
   }
}

/**
 * Update scores for current round based on bids and takes
 */
function updateScores() {
   try {
      const localScores = [];
      for (let playerIndex = 0; playerIndex < GameState.players.length; playerIndex++) {
         const bid = GameState.currentBids[playerIndex];
         const take = GameState.currentTakes[playerIndex];

         if (bid === take) {
            localScores[playerIndex] = 10 + (bid * 3);
         } else {
            localScores[playerIndex] = (-Math.abs(bid - take) * 3);
         }

         const isSpadeTrump = GameState.spadeTrump[GameState.currentRound];
         if (settings.getValue("spadeDouble") && isSpadeTrump) {
            localScores[playerIndex] *= 2;
         }
      }

      GameState.scores[GameState.currentRound] = localScores;
      return true;
   } catch (e) {
      alert(`updateScores: ${ e.message }`);
      return false;
   }
}

// ============================================================================
