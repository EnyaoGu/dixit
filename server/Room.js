const colyseus = require('colyseus');
const { Cards } = require('./Cards');
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

const MessageFormat = {
  messageType,
  selectedCard,
  selectedWord,
  votedCard
}

exports.Room = class extends colyseus.Room {
  onCreate (options) {
    console.log('room created!', this.roomName, this.roomId, options);
    this.state = this.setState({
      round: -1,
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
    console.log('client joined!', this.roomName, this.roomId, client.id);
  }

  onMessage (client, message) {
    console.log('client message!', this.roomName, this.roomId, client.id, message);
    if (this.locked == false) {
      console.warn('why do we get messages when the room is not locked?'); 
    }
    var currentPlayer = this.getPlayerById(client.id);

    switch (this.state.GamePhase) {
      case GamePhase.TellerSelectingCard:
        if (currentPlayer.isTeller == false) {
          console.warn('Only teller can send message now.');
        }
        if (message.MessageType != MessageType.TellerSelectsWord) {
          console.warn('Message type error');
        }
        if (message.selectedCard == undefined || message.selectedWord == undefined) {
          console.warn('Message invalid.')
        }
        if (currentPlayer.holdingCards.find(function (card) {return card == message.selectedCard}) == undefined) {
          console.warn('you cannot choose a card you do not have.');
        }
        this.state.theWord = message.selectedWord;
        currentPlayer.usingCard = message.selectedCard;
        this.state.gamePhase = GamePhase.PlayersSelectingCards;
        break;
      
      case GamePhase.PlayersSelectingCards:
        break;
      
      case GamePhase.Voting:
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
      return player.id == clientId
    });
  }
}

