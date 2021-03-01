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

   getSetting(name) {
      try {
         if (this.hasOwnProperty(name)) {
            return this[name];
         } else {
            return false;
         }
      } catch (e) {
         alert("window.settings.getSetting: " + e.message + " on line number " + e.lineNumber);
         return false;
      }
   }

   getValue(name) {
      try {
         let setting = this.getSetting(name);
         if (setting) { return setting.value; } else { return false; }
      } catch (e) {
         alert("window.settings.getValue: " + e.message + " on line number " + e.lineNumber);
         return false;
      }
   }

   checkSettings() {
      /*
       * Loops over all test functions in the settings class and returns if all of them return true.
       * Probably possible to do this shorter or more readable, but this works at least.
       */
      try {
         let methods = Object.getOwnPropertyNames(Object.getPrototypeOf(this))
                             .filter(name => (name !== "constructor"
                                              && typeof this[name] === "function"));
         for (let m of methods) {
            if (m.startsWith("test")) {
               if (! this[m]()) {
                  return false;
               }
            }
         }
         return true;
      } catch (e) {
         alert("checkSettings " + e.message + " on line number " + e.lineNumber);
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
         alert("window.settings.testMinPlayersAboveZero: "
               + e.message
               + " on line number "
               + e.lineNumber);
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
         alert("window.settings.testMaxPlayersAboveZero: "
               + e.message
               + " on line number "
               + e.lineNumber);
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
         alert("window.settings.testMaxPlayersLargerThanMinPlayers: "
               + e.message
               + " on line number "
               + e.lineNumber);
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
         alert("window.settings.testMaxCardsPossibleAboveZero: "
               + e.message
               + " on line number "
               + e.lineNumber);
         return false;
      }
   }

}
