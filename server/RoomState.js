const schema = require('@colyseus/schema');
const Schema = schema.Schema;
const ArraySchema = schema.ArraySchema;

class PlayerState extends Schema {
  constructor (p_player) {
    super();

    this.id = '';
    this.name = '';
    this.isTeller = false;
    this.holdingCards = new ArraySchema();
    this.usingCard = '';
    this.voteCard = '';
    this.hasBeenTellerForTimes = 0;
    this.score = 0;
    this.roundScore = 0;
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