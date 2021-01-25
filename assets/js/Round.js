class Round {
   /*
    * A single round in the game.
    * Contains information about the round, like bids, takes, score, who deals, etc.
    * Some information is available at the start of the round, or only at certain points
    * during the round. Therefore, it should be updated during the round.
    */
   constructor(dealerIndex, roundNumber) {
      this.dealerIndex = dealerIndex; // Known at start of round
      this.roundNumber = roundNumber; // Known at start of round
      this.bids = []; // Known after bidding
      this.spadeTrump = false; // Known after bidding
      this.takes = []; // Known at end of round
      this.scores = []; // Known at end of round
   }
}
