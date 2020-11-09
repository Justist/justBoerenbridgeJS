function initSpel() {
  // velden leegmaken

};

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
