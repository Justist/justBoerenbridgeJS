// STORAGE UTILITIES
// ============================================================================

/**
 * Check if localStorage is available
 */
function isStorageAvailable(type = "localStorage") {
   const storage = window[type];

   try {
      const testKey = "__storage_test__";
      storage.setItem(testKey, testKey);
      storage.removeItem(testKey);
      return true;
   } catch (e) {
      if (! (e instanceof DOMException)) {
         return false;
      }

      const isQuotaError = e.name === "QuotaExceededError" ||
                           e.name === "NS_ERROR_DOM_QUOTA_REACHED";
      return isQuotaError && storage && storage.length !== 0;
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
