class GameState {
   constructor() {
      this.players = [];
      this.History = new History();
      this.overallScore = [];
      this.currentRound = null; // Becomes a round object later
   }
}
