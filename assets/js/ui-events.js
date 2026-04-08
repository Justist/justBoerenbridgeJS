function clickSpadeRadioButton() {
   GameState.spadeTrump[GameState.currentRound] = document.getElementById("spadeRadioButton").checked;
   saveGameState("bid");
   return updateBidsOrTakesDisplay("bid");
}

function goBackOneScreen() {
   try {
      switch (currentScreenId) {
         case "bidScreen": {
            if (GameState.currentRound <= 1) {
               const result = toNewGame(true);
               if (result) {
                  saveGameState("newGame");
               }
               return result;
            }

            const result = toScores();
            if (result) {
               saveGameState("score");
            }
            return result;
         }
         case "takeScreen":
            if (toBids(true)) {
               saveGameState("bid");
               return true;
            }
            return false;
         case "scoreboardScreen":
            if (GameState.currentRound > 1) {
               GameState.currentRound--;
               GameState.currentDealerIndex = (GameState.currentDealerIndex - 1 + GameState.players.length) % GameState.players.length;
               GameState.currentBids = Array.isArray(GameState.bids[GameState.currentRound]) ? [...GameState.bids[GameState.currentRound]] : [];
               GameState.currentTakes = Array.isArray(GameState.takes[GameState.currentRound]) ? [...GameState.takes[GameState.currentRound]] : [];
            }
            if (toTakes(true)) {
               saveGameState("take");
               return true;
            }
            return false;
         case "newGameScreen":
            clearSavedGameState();
            return toOverview();
         case "settingsScreen":
         case "gameRulesScreen":
         default:
            return toOverview();
      }
   } catch (e) {
      alert(`goBackOneScreen: ${ e.message }`);
      return false;
   }
}

function createActionMap() {
   return new Map([
      ["applySettingsAndOverview", () => applySettings() && toOverview()],
      ["clearLocalAndOverview", () => clearLocal() && toOverview()],
      ["clickSpadeRadioButton", clickSpadeRadioButton],
      ["forceReload", () => window.location.reload(true)],
      ["goBackOneScreen", goBackOneScreen],
      ["storeBids", storeBids],
      ["storePlayers", storePlayers],
      ["storeTakesToBids", () => storeTakes(true)],
      ["storeTakesToScores", () => storeTakes(false)],
      ["toBids", toBids],
      ["toGameRules", toGameRules],
      ["toNewGame", toNewGame],
      ["toOverview", toOverview],
      ["toScores", toScores],
      ["toSettings", toSettings]
   ]);
}

function shouldPreventDefaultOnClick(trigger) {
   const inputType = (trigger.getAttribute("type") || "").toLowerCase();
   const isCheckableInput = trigger.tagName === "INPUT" &&
                            (inputType === "radio" || inputType === "checkbox");
   return ! isCheckableInput;
}

function bindDelegatedEvents() {
   const app = document.getElementById("app");
   if (! app || app.dataset.eventsBound === "true") {
      return true;
   }

   const actionMap = createActionMap();

   app.addEventListener("click", (event) => {
      const trigger = event.target.closest(`[${ ACTION_ATTR }]`);
      if (! trigger || ! app.contains(trigger)) {
         return;
      }

      const actionName = trigger.getAttribute(ACTION_ATTR);
      const action = actionMap.get(actionName);
      if (! action) {
         return;
      }

      if (shouldPreventDefaultOnClick(trigger)) {
         event.preventDefault();
      }
      action();
   });

   app.addEventListener("submit", (event) => {
      event.preventDefault();

      const submitActionName = event.target.getAttribute(SUBMIT_ACTION_ATTR);
      const submitAction = submitActionName ? actionMap.get(submitActionName) : null;
      if (submitAction) {
         submitAction();
      }
   });

   app.dataset.eventsBound = "true";

   return true;
}

function initializeApp() {
   try {
      renderAppShell();
      bindDelegatedEvents();

      settings = new Settings();
      loadSettings();

      const savedGame = readGameState();
      if (savedGame) {
         return restoreGameState(savedGame);
      }

      return toOverview();
   } catch (e) {
      alert(`initializeApp: ${ e.message }`);
      return false;
   }
}

// ============================================================================
