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

   static getSettings(settings, localStorage) {
      try {
         let keyValue;
         for (let key in settings) {
            if (! settings.hasOwnProperty(key)) {
               continue;
            }
            keyValue = Storage.getLocal(key, localStorage);
            if (keyValue) {
               settings[key] = JSON.parse(keyValue);
            }
         }
         return true;
      } catch (e) {
         console.log("Storage.getSettings: " + e.message + " on line number " + e.lineNumber);
         throw e; //throw it higher to get more logs
      }
   }

   static storeSettings(settings) {
      try {
         for (let key in settings) {
            if (! (settings.hasOwnProperty(key) && settings[key])) {
               continue;
            }
            Storage.storeLocal(key, JSON.stringify(settings[key]));
         }
         return true;
      } catch (e) {
         console.log("Storage.storeSettings: " + e.message);
         return false;
      }
   }

   static storeLocal(itemName, itemData) {
      try {
         if (! Storage.storageAvailable("localStorage")) {
            // This should be changed to not be an alert on every try, like a static message
            // somewhere
            alert("No local storage available! Changes will not be saved!");
            // Then fail silently
            return true;
         }
         window.localStorage.setItem(itemName, itemData);
         return true;
      } catch (e) {
         console.log("Storage.storeLocal: " + e.message + " on line number " + e.lineNumber);
         throw e; //throw it higher to get more logs
      }
   }

   static getLocal(itemName, localStorage) {
      try {
         if (! Storage.storageAvailable("localStorage")) {
            // This should be changed to not be an alert on every try, like a static message
            // somewhere
            alert("No local storage available! Changes will not be saved!");
            // Then fail silently
            return true;
         }
         return localStorage.getItem(itemName);
      } catch (e) {
         console.log("Storage.getLocal: " + e.message + " on line number " + e.lineNumber);
         throw e; //throw it higher to get more logs
      }
   }

   static clearLocal(localStorage) {
      try {
         if (Storage.storageAvailable("localStorage")) {
            localStorage.clear();
         } else {
            alert("Cookies niet beschikbaar, kan ze niet verwijderen!");
         }
         return true;
      } catch (e) {
         console.log("Storage.clearLocal: " + e.message + " on line number " + e.lineNumber);
         throw e; //throw it higher to get more logs
      }
   }
}
