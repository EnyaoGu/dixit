const schema = require('@colyseus/schema');
const Schema = schema.Schema;
const ArraySchema = schema.ArraySchema;

class PlayerState {
  constructor () {
    this.id = '';
    this.name = '';
    this.isTeller = false;
    this.isReady = true;
    this.holdingCards = new ArraySchema();
    this.voters = new ArraySchema();
    this.usingCard = '';
    this.votedCard = '';
    this.hasBeenTellerForTimes = 0;
    this.score = 0;
    this.roundScore = 0;
  }
}

class RoomState extends Schema {
  constructor () {
    super();

    this.playerJSONs = new ArraySchema();
  }
}
schema.defineTypes(RoomState, {
  round: 'number',
  gamePhase: 'string',
  playerJSONs: [ 'string' ],
  theWord: 'string', 
});

exports.PlayerState = PlayerState;
exports.RoomState = RoomState;