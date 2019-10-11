const colyseus = require('colyseus');
const { Cards } = require('./Cards');
const { RoomState, PlayerState } = require('./RoomState');

const GamePhase = {
    Boarding : 'Boarding',
    TellerSelectingCard : 'TellerSelectingCard',
    PlayersSelectingCards : 'PlayerSelectingCards',
    Voting : 'Voting',
    GameResult : 'GameResult'
}

// message from client to server
const MessageType = {
   TellerSelectsWord : 'TellerSelectsWord',
   PlayerSelectsCard : 'PlayerSelectsCard',
   PlayerVotes : 'PlayerVotes'
}

exports.Room = class extends colyseus.Room {
  onCreate (options) {
    console.log('room created!', this.roomName, this.roomId, options);
    this.setState(new RoomState());
    this.state.round = 0;
    this.state.gamePhase = GamePhase.Boarding;
    this.state.theWord = '';

    this.maxClients = 4;
    this.cards = new Cards();
  }

  onJoin (client, options) {
    const newPlayer = new PlayerState();
    newPlayer.id = client.id;
    newPlayer.name = options.name;
    newPlayer.isTeller = this.assignTeller();
    this.state.players.push(newPlayer);

    if(this.clients.length === this.maxClients)
    {
      this.cards.deliverCards(this);
      this.gamePhase = GamePhase.TellerSelectingCard;
    }

    console.log('client joined!', this.roomName, this.roomId, client.id);
  }

  onMessage (client, message) {
    console.log('client message!', this.roomName, this.roomId, client.id, message);
    if (this.locked === false) {
      console.warn('why do we get messages when the room is not locked?'); 
    }
    var currentPlayer = this._getPlayerById(client.id);

    switch (this.state.GamePhase) {
      case GamePhase.TellerSelectingCard:
        if (currentPlayer.isTeller === false) {
          console.warn('Only teller can send message now.');
        }
        if (!message.MessageType || message.MessageType !== MessageType.TellerSelectsWord) {
          console.warn('Message type error');
          return;
        }
        if (!message.selectedCard || !message.theWord) {
          console.warn('Message invalid.');
          return;
        }
        if (!currentPlayer.holdingCards.includes(message.selectedCard)) {
          console.warn('you cannot choose a card you do not have.');
          return;
        }
        this.state.theWord = message.theWord;
        currentPlayer.usingCard = message.selectedCard;
        this.state.gamePhase = GamePhase.PlayersSelectingCards;
        break;
      
      case GamePhase.PlayersSelectingCards:
        break;
      
      case GamePhase.Voting:
        break;

      case GamePhase.Result:
        if (message.MessageType === MessageType.)
        break;

      default:
        break;
    }
  }

  onLeave (client, consented) {
    console.log('client left!', this.roomName, this.roomId, client.id);
  }

  onDispose() {
    console.log('room dispose!', this.roomName, this.roomId);
  }

  _getPlayerById(clientId)
  {
    return this.state.players.find(function (player) {
      return player.id === clientId;
    });
  }

  _assignTeller() {
    return this.clients.length === 1;
  }
}