// ============================================================================
// GAME STATE & CONFIGURATION
// ============================================================================

const DEBUG = false;

const REGULAR_PLAYERS = [
   "Speler 1", "Speler 2", "Speler 3", "Speler 4",
   "Speler 5", "Speler 6", "Speler 7", "Speler 8"
];

const SCREEN_IDS = [
   "newGameScreen",
   "bidScreen",
   "takeScreen",
   "scoreboardScreen",
   "gameRulesScreen",
   "overviewScreen",
   "settingsScreen"
];

const ACTION_ATTR = "data-action";
const SUBMIT_ACTION_ATTR = "data-submit-action";

// Namespaced game state to avoid window pollution
const GameState = {
   debug              : DEBUG,
   regularPlayers     : REGULAR_PLAYERS,
   bids               : { 0 : [] },
   currentBids        : [],
   currentDealerIndex : -1,
   currentRound       : 1,
   currentTakes       : [],
   maxRounds          : -1,
   maxCardsThisGame   : -1,
   players            : [],
   scores             : { 0 : [] },
   spadeTrump         : { 0 : false },
   takes              : { 0 : [] },
   jsonFileName       : "",

   reset() {
      this.bids = { 0 : [] };
      this.currentBids = [];
      this.currentDealerIndex = -1;
      this.currentRound = 1;
      this.currentTakes = [];
      this.maxRounds = -1;
      this.players = [];
      this.scores = { 0 : [] };
      this.spadeTrump = { 0 : false };
      this.takes = { 0 : [] };
   }
};

// ============================================================================
// STRING UTILITY FUNCTIONS (No prototype extension)
// ============================================================================

/**
 * Formats a string with %s placeholders
 * @param {string} str - Template string with %s placeholders
 * @param {...any} args - Values to substitute
 * @returns {string} Formatted string
 */
function formatString(str, ...args) {
   return args.reduce((result, arg) => result.replace(/%s/, arg), str);
}

// ============================================================================
// SETTINGS CLASS
// ============================================================================

class Settings {
   /**
    * Initialize game settings with configurable options
    * Format: { id, text, type, value, min?, max? }
    */
   constructor() {
      this.roundWithoutTrump = {
         id    : "rwt",
         text  : "Middelste ronde zonder troef: ",
         type  : "boolean",
         value : true
      };

      this.spadeDouble = {
         id    : "sd",
         text  : "Schoppen telt dubbel: ",
         type  : "boolean",
         value : true
      };

      this.dealerLast = {
         id    : "dl",
         text  : "Deler onderaan bij bieden/halen: ",
         type  : "boolean",
         value : false
      };

      this.minPlayers = {
         id    : "minp",
         text  : "Minimum aantal spelers mogelijk: ",
         type  : "number",
         value : 2,
         min   : 1,
         max   : 51
      };

      this.maxPlayers = {
         id    : "maxp",
         text  : "Maximum aantal spelers mogelijk: ",
         type  : "number",
         value : 8,
         min   : 1,
         max   : 51
      };

      this.maxCardsPossible = {
         id    : "maxc",
         text  : "Maximum aantal kaarten mogelijk: ",
         type  : "number",
         value : 10,
         min   : 1,
         max   : 51
      };
   }

   /**
    * Get a setting object by name
    */
   getSetting(name) {
      if (this.hasOwnProperty(name)) {
         return this[name];
      }
      console.warn(`Setting "${ name }" not found`);
      return null;
   }

   /**
    * Get the value of a setting
    */
   getValue(name) {
      const setting = this.getSetting(name);
      return setting ? setting.value : null;
   }

   /**
    * Validate all settings against their constraints
    */
   validateAll() {
      return this._validateMinPlayersAboveZero() &&
             this._validateMaxPlayersAboveZero() &&
             this._validateMaxPlayersLargerThanMinPlayers() &&
             this._validateMaxCardsPossibleAboveZero();
   }

   // Private validation methods
   _validateMinPlayersAboveZero() {
      if (this.minPlayers.value <= 0) {
         alert(`${ this.minPlayers.text.slice(0, -2) } is minder dan of gelijk aan 0!`);
         return false;
      }
      return true;
   }

   _validateMaxPlayersAboveZero() {
      if (this.maxPlayers.value <= 0) {
         alert(`${ this.maxPlayers.text.slice(0, -2) } is minder dan of gelijk aan 0!`);
         return false;
      }
      return true;
   }

   _validateMaxPlayersLargerThanMinPlayers() {
      if (this.maxPlayers.value < this.minPlayers.value) {
         alert(formatString(
            "%s mag niet kleiner zijn dan %s!",
            this.maxPlayers.text.slice(0, -2),
            this.minPlayers.text.slice(0, -2).toLowerCase()
         ));
         return false;
      }
      return true;
   }

   _validateMaxCardsPossibleAboveZero() {
      if (this.maxCardsPossible.value <= 0) {
         alert(`${ this.maxCardsPossible.text.slice(0, -2) } is minder dan of gelijk aan 0!`);
         return false;
      }
      return true;
   }
}

// Initialize settings instance
let settings = new Settings();

let currentScreenId = "overviewScreen";

function setCurrentScreen(screenId) {
   currentScreenId = screenId;
}

function createScreenHeader(title, showBackButton = true) {
   const headerChildren = [];
   if (showBackButton) {
      headerChildren.push(createActionButton("Terug", "goBackOneScreen", "btn btn-outline-secondary btn-sm"));
   }

   headerChildren.push(createNode("h2", { className : `text-center${ showBackButton ? " mt-2" : "" }`, text : title }));
   return createNode("div", { className : "mb-3" }, headerChildren);
}

function restoreNewGameFormFromState() {
   try {
      const playerForm = document.getElementById("newGameForm");
      const buttonElement = document.getElementById("newGameButtonTable");
      const notEnoughPlayersAlert = document.getElementById("notEnoughPlayersAlert");
      const noValidDealerAlert = document.getElementById("noValidDealerAlert");
      const doublePlayerNamesAlert = document.getElementById("doublePlayerNamesAlert");
      const maxPlayers = settings.getValue("maxPlayers");

      for (let i = 0; i < maxPlayers; i++) {
         const row = document.getElementById(`playerRow${ i }`);
         const input = document.getElementById(`nameChoice-${ i }`);
         const radio = document.getElementById(`radioDealer-${ i }`);

         if (i < GameState.players.length) {
            if (row) {
               toggleElement(row, true);
            }
            if (input) {
               input.value = GameState.players[i];
            }
         } else if (row && i > 1) {
            toggleElement(row, false);
         }

         if (radio) {
            radio.checked = i === GameState.currentDealerIndex;
         }
      }

      if (GameState.players.length > 0) {
         updatePlayers(0, document.getElementById("nameChoice-0")?.value || "");
      }

      const dealerValid = checkDealerValidity(GameState.currentDealerIndex);
      const enoughPlayers = GameState.players.length >= settings.getValue("minPlayers");
      const noDuplicatePlayers = checkNoDuplicatePlayers();

      toggleElement(noValidDealerAlert, ! dealerValid);
      toggleElement(notEnoughPlayersAlert, ! enoughPlayers);
      toggleElement(doublePlayerNamesAlert, ! noDuplicatePlayers);
      toggleElement(buttonElement, enoughPlayers && dealerValid && noDuplicatePlayers);

      if (playerForm) {
         playerForm.dataset.restored = "true";
      }

      return true;
   } catch (e) {
      alert(`restoreNewGameFormFromState: ${ e.message }`);
      return false;
   }
}

// ============================================================================
// STORAGE UTILITIES
// ============================================================================

/**
 * Check if localStorage is available
 */
function isStorageAvailable(type = "localStorage") {
   try {
      const storage = window[type];
      const testKey = "__storage_test__";
      storage.setItem(testKey, testKey);
      storage.removeItem(testKey);
      return true;
   } catch (e) {
      return e instanceof DOMException && (
         e.code === 22 || e.code === 1014 ||
         e.name === "QuotaExceededError" || e.name === "NS_ERROR_DOM_QUOTA_REACHED"
      ) && storage && storage.length !== 0;
   }
}

// Storage flag to avoid repeated warnings
const StorageConfig = {
   available    : isStorageAvailable(),
   warningShown : false
};

const GameStateStorage = {
   key     : "justBoerenbridge.currentGame",
   version : 1
};

/**
 * Store item in localStorage with error handling
 */
function storeLocal(itemName, itemData) {
   if (! StorageConfig.available) {
      if (! StorageConfig.warningShown) {
         alert("No local storage available! Changes will not be saved!");
         StorageConfig.warningShown = true;
      }
      return false;
   }

   try {
      window.localStorage.setItem(itemName, itemData);
      return true;
   } catch (e) {
      alert(`storeLocal: ${ e.message }`);
      return false;
   }
}

/**
 * Retrieve item from localStorage
 */
function getLocal(itemName) {
   if (! StorageConfig.available) {
      return null;
   }

   try {
      return window.localStorage.getItem(itemName);
   } catch (e) {
      alert(`getLocal: ${ e.message }`);
      return null;
   }
}

/**
 * Clear all localStorage
 */
function clearLocal() {
   try {
      if (StorageConfig.available) {
         window.localStorage.clear();
      } else {
         alert("Cookies niet beschikbaar, kan ze niet verwijderen!");
      }
      return true;
   } catch (e) {
      alert(`clearLocal: ${ e.message }`);
      return false;
   }
}

function removeLocal(itemName) {
   if (! StorageConfig.available) {
      return false;
   }

   try {
      window.localStorage.removeItem(itemName);
      return true;
   } catch (e) {
      alert(`removeLocal: ${ e.message }`);
      return false;
   }
}

function captureSettingsValues() {
   const values = {};
   for (const key in settings) {
      if (settings.hasOwnProperty(key) && settings[key] && Object.prototype.hasOwnProperty.call(settings[key], "value")) {
         values[key] = settings[key].value;
      }
   }
   return values;
}

function applySettingsValues(values) {
   if (! values || typeof values !== "object") {
      return false;
   }

   for (const key in values) {
      if (settings.hasOwnProperty(key) && settings[key]) {
         settings[key].value = values[key];
      }
   }

   return true;
}

function captureGameState(phase) {
   return {
      version : GameStateStorage.version,
      phase,
      settings : captureSettingsValues(),
      state : {
         bids               : GameState.bids,
         currentBids        : GameState.currentBids,
         currentDealerIndex : GameState.currentDealerIndex,
         currentRound       : GameState.currentRound,
         currentTakes       : GameState.currentTakes,
         jsonFileName       : GameState.jsonFileName,
         maxCardsThisGame   : GameState.maxCardsThisGame,
         maxRounds          : GameState.maxRounds,
         players            : GameState.players,
         scores             : GameState.scores,
         spadeTrump         : GameState.spadeTrump,
         takes              : GameState.takes
      }
   };
}

function saveGameState(phase) {
   try {
      if (! StorageConfig.available || GameState.players.length === 0) {
         return false;
      }

      return storeLocal(GameStateStorage.key, JSON.stringify(captureGameState(phase)));
   } catch (e) {
      alert(`saveGameState: ${ e.message }`);
      return false;
   }
}

function clearSavedGameState() {
   return removeLocal(GameStateStorage.key);
}

function readGameState() {
   try {
      const rawGameState = getLocal(GameStateStorage.key);
      if (! rawGameState) {
         return null;
      }

      const snapshot = JSON.parse(rawGameState);
      const isValidSnapshot = snapshot &&
                              snapshot.version === GameStateStorage.version &&
                              snapshot.phase &&
                              snapshot.state &&
                              Array.isArray(snapshot.state.players) &&
                              snapshot.state.players.length > 0;

      if (! isValidSnapshot) {
         clearSavedGameState();
         return null;
      }

      return snapshot;
   } catch (e) {
      clearSavedGameState();
      return null;
   }
}

function refreshSavedGameStateSettings() {
   const savedGame = readGameState();
   if (! savedGame) {
      return false;
   }

   savedGame.settings = captureSettingsValues();
   return storeLocal(GameStateStorage.key, JSON.stringify(savedGame));
}

function restoreGameState(snapshot) {
   try {
      if (! snapshot) {
         return false;
      }

      settings = new Settings();
      loadSettings();
      applySettingsValues(snapshot.settings);

      GameState.reset();
      Object.assign(GameState, snapshot.state);

      if (snapshot.phase === "bid") {
         return toBids(true);
      }
      if (snapshot.phase === "newGame") {
         return toNewGame(true);
      }
      if (snapshot.phase === "take") {
         return toTakes(true);
      }
      if (snapshot.phase === "score") {
         return toScores();
      }

      clearSavedGameState();
      return false;
   } catch (e) {
      alert(`restoreGameState: ${ e.message }`);
      return false;
   }
}

/**
 * Load settings from localStorage
 */
function loadSettings() {
   try {
      for (const key in settings) {
         if (! settings.hasOwnProperty(key)) {
            continue;
         }

         const keyValue = getLocal(key);
         if (keyValue) {
            settings[key] = JSON.parse(keyValue);
         }
      }
      return true;
   } catch (e) {
      alert(`loadSettings: ${ e.message }`);
      return false;
   }
}

/**
 * Save settings to localStorage
 */
function saveSettings() {
   try {
      for (const key in settings) {
         if (! settings.hasOwnProperty(key) || ! settings[key]) {
            continue;
         }
         storeLocal(key, JSON.stringify(settings[key]));
      }
      refreshSavedGameStateSettings();
      return true;
   } catch (e) {
      alert(`saveSettings: ${ e.message }`);
      return false;
   }
}

// ============================================================================
// DOM UTILITIES
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
