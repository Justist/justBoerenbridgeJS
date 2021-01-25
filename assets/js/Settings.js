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
