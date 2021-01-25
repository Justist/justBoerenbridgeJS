class Storage {
   /*
    * Class containing all functions with functionality concerning local storage.
    */
   static storageAvailable(type) {
      // As copied from
      // https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
      let storage, x;
      try {
         storage = window[type];
         x = "__storage_test__";
         storage.setItem(x, x);
         storage.removeItem(x);
         return true;
      } catch (e) {
         return e instanceof DOMException && (
                     // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === "QuotaExceededError" ||
            // Firefox
            e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
                // acknowledge QuotaExceededError only if there's something already stored
                (storage && storage.length !== 0);
      }
   }

   static getSettings(settings) {
      try {
         let keyValue;
         for (let key in settings) {
            if (! settings.hasOwnProperty(key)) {
               continue;
            }
            keyValue = getLocal(key);
            if (keyValue) {
               settings[key] = JSON.parse(keyValue);
            }
         }
         return true;
      } catch (e) {
         alert("Storage.getSettings: " + e.message);
         return false;
      }
   }

   static storeSettings(settings) {
      try {
         for (let key in settings) {
            if (! (settings.hasOwnProperty(key) && settings[key])) {
               continue;
            }
            storeLocal(key, JSON.stringify(settings[key]));
         }
         return true;
      } catch (e) {
         alert("Storage.storeSettings: " + e.message);
         return false;
      }
   }
}
