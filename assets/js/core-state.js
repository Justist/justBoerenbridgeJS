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
