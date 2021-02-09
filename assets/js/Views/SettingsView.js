class SettingsView {
   // TODO: Make this not static
   constructor() {

   }

   toSettings(settingsObject) {
      try {
         General.setEverythingToNone();
         return this.createSettingsScreen(settingsObject);
      } catch (e) {
         alert("SettingsView.toSettings " + e.message);
         return false;
      }
   }

   createSettingsScreen(settingsObject) {
      try {
         let settingsTable = document.getElementById("settingsTable");
         General.removeAllContent(settingsTable);
         let row = settingsTable.insertRow();
         let cell1 = row.insertCell(0);
         cell1.innerText = "Instelling:";
         let cell2 = row.insertCell(1);
         cell2.innerText = "Uit";
         let cell3 = row.insertCell(2);
         cell3.innerText = "Aan";
         for (let key in settingsObject) {
            if (! settingsObject.hasOwnProperty(key)) {
               continue;
            }
            let keyValue = settingsObject.getSetting(key);
            row = settingsTable.insertRow();
            cell1 = row.insertCell(0);
            cell1.innerText = keyValue.text;
            cell2 = row.insertCell(1);
            if (keyValue.type === "boolean") {
               cell3 = row.insertCell(2);
               cell2.appendChild(General.createRadioButton(keyValue.id + "radio",
                                                           keyValue.id + "radioId1",
                                                           "alignLeft",
                                                           keyValue.value === false));
               cell3.appendChild(General.createRadioButton(keyValue.id + "radio",
                                                           keyValue.id + "radioId2",
                                                           "alignLeft",
                                                           keyValue.value === true));
            } else if (keyValue.type === "number") {
               cell2.setAttribute("colspan", "2");
               let numberInput = document.createElement("input");
               numberInput.setAttribute("type", "number");
               numberInput.setAttribute("id", keyValue.id + "numberId");
               numberInput.setAttribute("value", keyValue.value);
               // These don't seem to work
               numberInput.setAttribute("min", keyValue.min);
               numberInput.setAttribute("max", keyValue.max);
               cell2.appendChild(numberInput);
            }
         }
         return General.hideOrShowElement(document.getElementById("settingsScreen"), true);
      } catch (e) {
         alert("SettingsView.createSettingsScreen " + e.message);
         return false;
      }
   }
}
