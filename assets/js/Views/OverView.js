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
         alert("toOverview " + e.message + " on line number " + e.lineNumber);
         return false;
      }
   }
}
