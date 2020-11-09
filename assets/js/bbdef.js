

function initSpel() {
  var Naam = ["Aad", "Arnold", "Iduna", "Roland", "Simon"];

for (j=1;j<6;j++) {
  document.getElementById("naamKeuze-" + j).options.length = 0;
  Naamkeuze= document.getElementById("naamKeuze-" + j);
  for (var i = 0; i < Naam.length; i++) {

    var opt = document.createElement('option');
    opt.value = Naam[i];
    opt.innerHTML = Naam[i];
    Naamkeuze.appendChild(opt);
    }
}

  // velden leegmaken
  var d = new Date();
document.getElementById("datumEnTijd").innerHTML = "Spel van ";
document.getElementById("datumEnTijd").innerHTML += d.getDate();
document.getElementById("datumEnTijd").innerHTML += " - "; document.getElementById("datumEnTijd").innerHTML += d.getMonth() + 1;
document.getElementById("datumEnTijd").innerHTML += " - ";
document.getElementById("datumEnTijd").innerHTML += d.getFullYear();
document.getElementById("datumEnTijd").innerHTML += " ( ";
document.getElementById("datumEnTijd").innerHTML += d.getHours();
document.getElementById("datumEnTijd").innerHTML += ":";
document.getElementById("datumEnTijd").innerHTML += d.getMinutes();
document.getElementById("datumEnTijd").innerHTML += " ) ";
};

function namenOvernemen(){
/* ophalen uit invoer bij Nieuw spel */
  var gekozenNaam = ["leeg", "leeg", "leeg", "leeg", "leeg", "leeg", "leeg"];
  for (j=1;j<6;j++) {
    gekozenNaam[j] = document.getElementById("naamKeuze-" + j).value;

  }

  for (j=1;j<6;j++) {
    document.getElementById("biedenNaam-" + j).innerHTML = gekozenNaam[j];
    document.getElementById("halenNaam-" + j).innerHTML = gekozenNaam[j];
    document.getElementById("standLijstNaam-" + j).innerHTML = gekozenNaam[j];    document.getElementById("eindeSpelLijstNaam-" + j).innerHTML = gekozenNaam[j];
    }
/* invullen in de overige schermen */


}

function clearBidsPlayer(player) {
   for (let child of player.children) {
      if (child.getAttribute("class")) {
         child.classList.remove("highlighted");
      }
      child.classList.add("unhighlighted");
   }
}

function clickBidButton(parent, number) {
   try {
      clearBidsPlayer(parent);
      let numberAsInt = parseInt(number, 10);
      let indexToHighlight = parent.children[numberAsInt + 2];
      indexToHighlight.classList.remove("unhighlighted");
      indexToHighlight.classList.add("highlighted");
   } catch (e) {
      alert(e.message);
      return false;
   }
   return true;
}






function alleDivsUit () {
  document.getElementById('leegVoorbeeld').style.display='none';
  document.getElementById('rondeHalen').style.display='none';
  document.getElementById('rondeBieden').style.display='none';
  document.getElementById('overzicht').style.display='none';
  document.getElementById('stand').style.display='none';
  document.getElementById('nieuwSpel').style.display='none';
  document.getElementById('eindeSpel').style.display='none';
  document.getElementById('spelregels').style.display='none';

};

function naarNieuwSpel() {
  alleDivsUit ();
  // velden leegmaken
  document.getElementById('nieuwSpel').style.display='block';
  initSpel();
};

function naarEindeSpel() {
  alleDivsUit ();
  // velden leegmaken
  document.getElementById('eindeSpel').style.display='block';
};

function naarBieden() {
  alleDivsUit ();
  // gegevens vorige ronde verwerken en opslaan
  // velden leegmaken
 document.getElementById('rondeBieden').style.display='block';
};

function naarHalen() {
  alleDivsUit ();
  // velden leegmaken
  document.getElementById('rondeHalen').style.display='block';
};

function naarStand() {
  alleDivsUit ();
  // velden verversen

  // of gegevens ophalen uit eerder opgeslagen bestand
  document.getElementById('stand').style.display='block';
};

function naarOverzicht() {
  alleDivsUit ();
  // velden verversen
  document.getElementById('overzicht').style.display='block';
};

function naarSpelregels() {
  document.getElementById('spelregels').style.display='block';
};

function uitSpelregels() {
  document.getElementById('spelregels').style.display='none';
};
