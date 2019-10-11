const schema = require('@colyseus/schema');
const Schema = schema.Schema;
const ArraySchema = schema.ArraySchema;

class PlayerState extends Schema {
  constructor (p_player) {
    super();

    this.holdingCards = new ArraySchema();
  }
}
schema.defineTypes(PlayerState, {
  id: 'string',
  name: 'string',
  isTeller: 'boolean', 
  holdingCards: [ 'string' ],
  usingCard: 'string',
  voteCard: 'string',
  hasBeenTellerForTimes: 'number',
  score: 'number',
  roundScore: 'number',
});

class RoomState extends Schema {
  constructor () {
    super();

    this.players = new ArraySchema();
  }
}
schema.defineTypes(RoomState, {
  round: 'number',
  gamePhase: 'string',
  players: [ PlayerState ],
  theWord: 'string', 
});

exports.PlayerState = PlayerState;
exports.RoomState = RoomState;