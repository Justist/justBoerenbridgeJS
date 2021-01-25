class History {
   /*
    * Collection of Rounds, creates the option of going back.
    */
   constructor() {
      this.rounds = [];
      this.roundAmount = 0;
   }

   addRound(round, number = -1) {
      try {
         if (number > -1 && number < this.roundAmount) {
            // This means we are updating an existing round
            this.rounds[number] = round;
         } else {
            this.rounds.push(round);
            this.roundAmount++;
         }
         return true;
      } catch (e) {
         alert("addRound: " + e.message);
         return false;
      }
   }

}
