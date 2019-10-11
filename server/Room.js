const colyseus = require('colyseus');
const {cards} = require("./Cards");

const GamePhase = {
    Boarding : 0,
    TellerSelectingCard : 1,
    PlayersSelectingCards : 2,
    Voting : 3,
    GameResult : 4
}

exports.Room = class extends colyseus.Room {
  onCreate (options) {
    console.log('room created!', this.roomName, this.roomId, options);
    this.state = this.setState({
      round: 1,
      gamePhase: GamePhase.Boarding,
      players: [{
        id,
        name,
        isTeller, 
        holdingCards,
        usingCard,
        voteCard,
        hasBeenTellerForTimes
      }],
      theWord,
      roundScore: [{
        playerId,
        numberOfVotes
      }],
    })
    this.maxClients = 4;
  }

  onJoin (client, options) {
    this.state.players.push({
      id = client.id,
      name = options,
      isTeller = this.assignTeller(),
      holdingCards,
      usingCard,
      voteCard,
      hasBeenTellerForTimes
    });

    if(this.locked)
    {
      this.deliverCards();
      this.gamePhase = GamePhase.TellerSelectingCard;
    }

    console.log('client joined!', this.roomName, this.roomId, client.id);
  }

  onMessage (client, message) {
    console.log('client message!', this.roomName, this.roomId, client.id, message);
  }

  onLeave (client, consented) {
    console.log('client left!', this.roomName, this.roomId, client.id);
  }

  onDispose() {
    console.log('room dispose!', this.roomName, this.roomId);
  }

  assignTeller(){
    return this.clients.length == 1;
  }
}