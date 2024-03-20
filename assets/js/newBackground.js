// noinspection DuplicatedCode

class Settings {
   /*
    To add a setting:
    - this.settingName = {
    id: id
    text: text to show on settings screen
    type: type
    value: default value, can be changed by user
    min: minimal allowed value
    max: maximal allowed value
    };
    - testSetting() { restraints on the setting; may have multiple functions per setting; }
    */
   constructor() {
      this.roundWithoutTrump =
         {
            id    : "rwt",
            text  : "Middelste ronde zonder troef: ",
            type  : "boolean",
            value : true
         };
      this.spadeDouble =
         {
            id    : "sd",
            text  : "Schoppen telt dubbel: ",
            type  : "boolean",
            value : true
         };
      this.dealerLast =
         {
            id    : "dl",
            text  : "Deler onderaan bij bieden/halen: ",
            type  : "boolean",
            value : false
         };
      this.minPlayers =
         {
            id    : "minp",
            text  : "Minimum aantal spelers mogelijk: ",
            type  : "number",
            value : 2,
            min   : 1,
            max   : 51
         };
      this.maxPlayers =
         {
            id    : "maxp",
            text  : "Maximum aantal spelers mogelijk: ",
            type  : "number",
            value : 8,
            min   : 1,
            max   : 51
         };
      this.maxCardsPossible =
         {
            id    : "maxc",
            text  : "Maximum aantal kaarten mogelijk: ",
            type  : "number",
            value : 10,
            min   : 1,
            max   : 51
         };
   }

   checkSettings() {
      /*
       Loops over all test functions in this class and returns if all of them return true.
       */
      try {
         let methods = Object.getOwnPropertyNames(Object.getPrototypeOf(this))
                             .filter(name => (name !== "constructor"
                                              && typeof this[name] === "function"));
         for (let m of methods) {
            if (m.startsWith("test") && ! this[m]()) {
                  return false;
            }
         }
         return true;
      } catch (e) {
         alert("checkSettings " + e.message);
         return false;
      }
   }

   getSetting(name) {
      try {
         if (this.hasOwnProperty(name)) {
            return this[name];
         } else {
            return false;
         }
      } catch (e) {
         alert("window.settings.getSetting: " + e.message);
         return false;
      }
   }

   getValue(name) {
      try {
         let setting = this.getSetting(name);
         if (setting) { return setting.value; } else { return false; }
      } catch (e) {
         alert("window.settings.getValue: " + e.message);
         return false;
      }
   }

   testMinPlayersAboveZero() {
      try {
         if (this.minPlayers.value <= 0) {
            alert("%s is minder dan of gelijk aan 0!".format(this.minPlayers.text.slice(0, -2)));
            return false;
         }
         return true;
      } catch (e) {
         alert("window.settings.testMinPlayersAboveZero: " + e.message);
         return false;
      }
   }

   testMaxPlayersAboveZero() {
      try {
         if (this.maxPlayers.value <= 0) {
            alert("%s is minder dan of gelijk aan 0!".format(this.maxPlayers.text.slice(0, -2)));
            return false;
         }
         return true;
      } catch (e) {
         alert("window.settings.testMaxPlayersAboveZero: " + e.message);
         return false;
      }
   }

   testMaxPlayersLargerThanMinPlayers() {
      try {
         if (this.maxPlayers.value < this.minPlayers.value) {
            alert("%s mag niet kleiner zijn dan %s!".format(this.maxPlayers.text.slice(0, -2),
                                                            this.minPlayers.text.slice(0, -2)
                                                                .toLowerCase()));
            return false;
         }
         return true;
      } catch (e) {
         alert("window.settings.testMaxPlayersLargerThanMinPlayers: " + e.message);
         return false;
      }
   }

   testMaxCardsPossibleAboveZero() {
      try {
         if (this.maxCardsPossible.value <= 0) {
            alert("%s is minder dan of gelijk aan 0!".format(this.maxCardsPossible.text.slice(0,
                                                                                              -2)));
            return false;
         }
         return true;
      } catch (e) {
         alert("window.settings.testMaxCardsPossibleAboveZero: " + e.message);
         return false;
      }
   }
}

class Round {
   constructor() {
      this.roundNumber = 0;
      this.bids = [];
      this.trump = "";
      this.takes = [];
      this.scores = [];
   }

   toJSON() {
      return {
         roundNumber: this.roundNumber,
         bids: this.bids,
         trump: this.trump,
         takes: this.takes,
         scores: this.scores
      };
   }

   fromJSON(json) {
      this.roundNumber = json.roundNumber;
      this.bids = json.bids;
      this.trump = json.trump;
      this.takes = json.takes;
      this.scores = json.scores;
   }
}

class RoundHistory {
   constructor() {
      this.rounds = [];
   }

   toJSON() {
      return {
         rounds: this.rounds
      };
   }

   fromJSON(json) {
      this.rounds = json.rounds;
   }

   addRound(round) {
      try {
         this.rounds.push(round);
      } catch (e) {
         alert("window.roundHistory.addRound: " + e.message);
      }
   }

   removeRound() {
      try {
         this.rounds.pop();
      } catch (e) {
         alert("window.roundHistory.removeRound: " + e.message);
      }
   }

   getRound(index) {
      try {
         return this.rounds[index];
      } catch (e) {
         alert("window.roundHistory.getRound: " + e.message);
         return false;
      }
   }

   getLastRound() {
      try {
         return this.rounds[this.rounds.length - 1];
      } catch (e) {
         alert("window.roundHistory.getLastRound: " + e.message);
         return false;
      }
   }

   getRounds() {
      try {
         return this.rounds;
      } catch (e) {
         alert("window.roundHistory.getRounds: " + e.message);
         return false;
      }
   }

   getRoundsLength() {
      try {
         return this.rounds.length;
      } catch (e) {
         alert("window.roundHistory.getRoundsLength: " + e.message);
         return false;
      }
   }

   clearRounds() {
      try {
         this.rounds = [];
      } catch (e) {
         alert("window.roundHistory.clearRounds: " + e.message);
      }
   }
}

class GameData {
   constructor() {
      this.players = [];
      this.roundHistory = new RoundHistory();
      this.settings = new Settings();
   }

   toJSON() {
      return {
         players: this.players,
         roundHistory: this.roundHistory,
         settings: this.settings
      };
   }

   fromJSON(json) {
      this.players = json.players;
      this.roundHistory = json.roundHistory;
      this.settings = json.settings;
   }

   addPlayer(player) {
      try {
         this.players.push(player);
      } catch (e) {
         alert("window.gameData.addPlayer: " + e.message);
      }
   }

   removePlayer(player) {
      try {
         this.players.splice(this.players.indexOf(player), 1);
      } catch (e) {
         alert("window.gameData.removePlayer: " + e.message);
      }
   }

   getPlayers() {
      try {
         return this.players;
      } catch (e) {
         alert("window.gameData.getPlayers: " + e.message);
         return false;
      }
   }

   getPlayersLength() {
      try {
         return this.players.length;
      } catch (e) {
         alert("window.gameData.getPlayersLength: " + e.message);
         return false;
      }
   }

   clearPlayers() {
      try {
         this.players = [];
      } catch (e) {
         alert("window.gameData.clearPlayers: " + e.message);
      }
   }

   getRoundHistory() {
      try {
         return this.roundHistory;
      } catch (e) {
         alert("window.gameData.getRoundHistory: " + e.message);
         return false;
      }
   }

   getSettings() {
      try {
         return this.settings;
      } catch (e) {
         alert("window.gameData.getSettings: " + e.message);
         return false;
      }
   }

   saveSettings() {
      try {
         let keyValue, newValue;
         for (let key in this.settings) {
            if (! this.settings.hasOwnProperty(key)) {
               continue;
            }
            // Bit counterintuitive maybe, but as values are always initialised this is a good way to
            // determine which id to get and how to get the value (checked vs value)
            keyValue = this.settings.getSetting(key);
            if (keyValue.type === "boolean") {
               newValue = document.getElementById(keyValue.id + "radioId1").checked === false;
            } else if (keyValue.type === "number") {
               newValue = document.getElementById(keyValue.id + "numberId").value;
            } else {
               alert("Setting %s has the invalid type of %s! Please fix this.".format(key.toString(),
                                                                                      typeof keyValue.value));
               return false;
            }
            this.settings[key].value = newValue;
         }
         return this.settings.checkSettings() && storeSettings();
      } catch (e) {
         alert("saveSettings " + e.message);
         return false;
      }
   }

}

class Storage {
   constructor() {
      if (Storage.instance == null) {
         Storage.instance = this;
      }

      return Storage.instance;
   }

   saveGameData(gameData) {
      try {
         localStorage.setItem("gameData", gameData.toJSON());
      } catch (e) {
         alert("window.storage.saveGameData: " + e.message);
      }
   }

   loadGameData() {
      try {
         let gameData = localStorage.getItem("gameData");
         if (gameData) {
            return gameData; // Return as JSON so it can be loaded into the GameData object
         }
      } catch (e) {
         alert("window.storage.loadGameData: " + e.message);
      }
   }

   clearGameData() {
      try {
         localStorage.removeItem("gameData");
      } catch (e) {
         alert("window.storage.clearGameData: " + e.message);
      }
   }
}

Storage.instance = null; // Ensure singleton

class Screen {
   constructor(name, title, description, gameData) {
      this.name = name;
      this.title = title;
      this.description = description;
      this.gameData = gameData;
      this.html = "";
   }

   toJSON() {
      return {
         name: this.name,
         title: this.title,
         description: this.description,
         html: this.html
      };
   }

   fromJSON(json) {
      this.name = json.name;
      this.title = json.title;
      this.description = json.description;
      this.html = json.html;
   }

   createHTML() {}

   show() {
      try {
         document.getElementById("mainDiv").innerHTML = this.html;
      } catch (e) {
         alert("window.screen.show: " + e.message);
      }
   }

   hide() {
      try {
         document.getElementById("mainDiv").innerHTML = "";
      } catch (e) {
         alert("window.screen.hide: " + e.message);
      }
   }
}

class OverviewScreen extends Screen {
   constructor(gameData) {
      super("overview", "Welkom bij Boerenbridge!", "Deze app is ontwikkeld door Aad Klaver en Simon Klaver en is bedoeld om scores voor\n"
                                     + "         Boerenbridge in bij te houden. Onder deze tekst kunt u kiezen of u een nieuw spel wil\n"
                                     + "         starten of eerst even de regels wil lezen.<br/> Voordat u begint, wil ik wel nog even\n"
                                     + "         een paar woorden zeggen. En dit zijn ze: Domkop! Blubber! Kleinood! Kriel! Dank u.", gameData);
   }

   createHTML() {
      try {
         let html = "<div class='container'><div class='row'><div class='col-md-12'><h2>%s</h2><p>%s</p></div></div>".format(this.title, this.description);
         html += "<div class='row'><div class='col-md-12'><button id='newGame' class='btn btn-primary'>Nieuw spel</button></div></div></div>";
         html += "<div class='row'><div class='col-md-12'><button id='gameRules' class='btn btn-primary'>Spelregels</button></div></div></div>";
         html += "<div class='row'><div class='col-md-12'><button id='settings' class='btn btn-primary'>Instellingen</button></div></div></div>";
         this.html = html;
      } catch (e) {
         alert("window.overviewScreen.createHTML: " + e.message);
      }
   }

   show() {
      try {
         this.createHTML();
         super.show();
         document.getElementById("newGame").addEventListener("click", function() {
            window.newGameScreen.show();
         });
      } catch (e) {
         alert("window.overviewScreen.show: " + e.message);
      }
   }
}

class SettingsScreen extends Screen {
   constructor(gameData) {
      super("settings", "Instellingen", "Pas de instellingen van het spel aan.", gameData);
   }

   createHTML() {
      try {
         let settings = this.gameData.getSettings();
         let html = "<div class='container'><div class='row'><div class='col-md-12'><h2>%s</h2><p>%s</p></div></div>".format(this.title, this.description);
         for (let setting in settings) {
            if (settings.hasOwnProperty(setting)) {
               let settingObject = settings[setting];
               html += "<div class='row'><div class='col-md-12'><label for='%s'>%s</label>".format(settingObject.id, settingObject.text);
               if (settingObject.type === "boolean") {
                  html += "<input type='checkbox' id='%s' name='%s' %s>".format(settingObject.id, settingObject.id, settingObject.value ? "checked" : "");
               } else if (settingObject.type === "number") {
                  html += "<input type='number' id='%s' name='%s' value='%s' min='%s' max='%s'>".format(settingObject.id, settingObject.id, settingObject.value, settingObject.min, settingObject.max);
               }
               html += "</div></div>";
            }
         }
         html += "<div class='row'><div class='col-md-12'><button id='saveSettings' class='btn btn-primary'>Opslaan</button></div></div></div>";
         this.html = html;
      } catch (e) {
         alert("window.settingsScreen.createHTML: " + e.message);
      }
   }

   show() {
      try {
         this.createHTML();
         super.show();
         document.getElementById("saveSettings").addEventListener("click", function() {
            this.gameData.saveSettings();
         });
      } catch (e) {
         alert("window.settingsScreen.show: " + e.message);
      }
   }
}

window.onload = function() {
   try {
      let storage = new Storage();
      let gameData = new GameData();
      let settingsScreen = new SettingsScreen(gameData);
      settingsScreen.show();
   } catch (e) {
      alert("window.onload: " + e.message);
   }
}
