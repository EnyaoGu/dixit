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

exports.Room = class extends colyseus.Room {
  onCreate (options) {
    console.log('room created!', this.roomName, this.roomId, options);
    this.state = this.setState({
      round: 1,
      gamePhase: GamePhase.Boarding,
      players: [],
      theWord: '',
    })
    this.maxClients = 4;
    this.cards = new Cards();
  }

    onJoin (client, options) {
      this.state.players.push({
        id: client.id,
        name: options.name,
        isTeller: this.assignTeller(),
        holdingCards: [],
        usingCard: '',
        voteCard: '',
        hasBeenTellerForTimes: 0,
        score: 0,
        roundScore: 0,
      });
  
      if(this.clients.length === this.maxClients)
      {
        this.cards.deliverCards(this);
        this.gamePhase = GamePhase.TellerSelectingCard;
      }
  
      console.log('client joined!', this.roomName, this.roomId, client.id);
    }

  onMessage (client, message) {
    if (this.locked === false) {
      console.warn('why do we get messages when the room is not locked?'); 
    }
    var currentPlayer = this._getPlayerById(client.id);

    switch (this.state.GamePhase) {
      case GamePhase.TellerSelectingCard:
        this._isMessageValid(true, MessageType.TellerSelectsWord);
        if (!message.selectedCard || !message.selectedWord) {
          console.warn('Message invalid.')
          return;
        }
        if (this._SetUsingCardAndSplice(currentPlayer, message.selectedCard) == false) {
          return;
        }

        this.state.theWord = message.theWord;
        this.state.gamePhase = GamePhase.PlayersSelectingCards;
        console.log('teller tells!');

        break;
      
      case GamePhase.PlayersSelectingCards:
        if (this._isMessageValid(false, MessageType.PlayerSelectsCard) === false)
        {
          return;
        }
        if (!message.selectedCard) {
          console.warn('invalid card selected.');
          return;
        }
        if (this._SetUsingCardAndSplice(currentPlayer, message.selectedCard) == false) {
          return;
        }

        // if all players has selected their card.
        if (this.state.players.some(function (player) {return player.usingCard == undefined;}) == false) {
          this.state.gamePhase = GamePhase.Voting;
        }
        break;
      
      case GamePhase.Voting:
        this._isMessageValid(undefined, MessageType.PlayerVotes);
        if (!message.votedCard) {
          console.warn('invalid vote.');
          return;
        }

      case GamePhase.GameResult:
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

  _SetUsingCardAndSplice(currentPlayer, selectedCard)
  {
    var index = currentPlayer.indexOf(selectedCard);
    if (index === -1)
    {
      console.warn('you cannot choose a card you dont have.');
      return false;
    }
    currentPlayer.holdingCards.splice(index);
    currentPlayer.usingCard = selectedCard;
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

  _isMessageValid(shouldBeTeller, expectedMessageType)
  {
    if (shouldBeTeller != undefined){
      if (currentPlayer.isTeller != shouldBeTeller) {
        console.warn('your role cannot send message now.');
        return false;
      }
    }
    if (!message.MessageType || message.MessageType !== expectedMessageType) {
      console.warn('Message type error');
      return false;
    }
    return true;
  }
}