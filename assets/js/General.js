class General {
   /*
    * Class containing 'general' functions.
    * All are static and therefore require no class initialisation and don't use class variables.
    */

   static createRadioButton(name, id, classAddition, checked) {
      try {
         let radioButton = document.createElement("input");
         radioButton.setAttribute("type", "radio");
         radioButton.setAttribute("name", name);
         radioButton.setAttribute("id", id);
         radioButton.checked = checked; // setAttribute does not work for this :(
         radioButton.classList.add(classAddition);
         return radioButton;
      } catch (e) {
         alert("General.createRadioButton " + e.message);
         return false;
      }
   }

   static createStretchTableHead(table, rowData, stretch) {
      try {
         let allButLast = rowData.slice(0, -1);
         let headRow = General.createTableHead(table, allButLast);
         let th = document.createElement("th");
         th.setAttribute("colspan", stretch);
         th.textContent = rowData.slice(-1)[0]; //last element
         headRow.appendChild(th);
         return true;
      } catch (e) {
         alert("General.createStretchTableHead " + e.message);
         return false;
      }
   }

   static createTableHead(table, rowData) {
      try {
         let head = table.createTHead();
         let row = head.insertRow();
         for (let i = 0; i < rowData.length; i++) {
            let th = document.createElement("th");
            th.textContent = rowData[i];
            row.appendChild(th);
         }
         return row;
      } catch (e) {
         alert("General.createTableHead " + e.message);
         return false;
      }
   }

   static hideOrShowElement(element, show) {
      try {
         if (show) {
            if (element.classList.contains("hidden")) { element.classList.remove("hidden"); }
         } else {
            if (! element.classList.contains("hidden")) { element.classList.add("hidden"); }
         }
         return true;
      } catch (e) {
         alert("General.hideOrShowElement " + e.message);
         return false;
      }
   }
}
