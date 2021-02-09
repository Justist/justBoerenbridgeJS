class OverView {
   constructor() {

   }

   toOverview(settingsObject) {
      try {
         General.setEverythingToNone();
         return Storage.getSettings(settingsObject)
                && General.hideOrShowElement(document.getElementById("overviewScreen"),
                                             true);
      } catch (e) {
         alert("toOverview " + e.toString());
         return false;
      }
   }
}
