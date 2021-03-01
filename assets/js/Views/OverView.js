class OverView {
   constructor() {

   }

   toOverview(settingsObject, localStorage) {
      try {
         General.setEverythingToNone();
         return Storage.getSettings(settingsObject, localStorage)
                && General.hideOrShowElement(document.getElementById("overviewScreen"),
                                             true);
      } catch (e) {
         console.log("toOverview " + e.message + " on line number " + e.lineNumber);
         throw e; //throw it higher to get more logs
      }
   }
}
