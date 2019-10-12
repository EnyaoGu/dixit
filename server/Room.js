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
   PlayerVotes : 'PlayerVotes',
   ReadyForNextTurn : 'ReadyForNextTurn',
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
    console.log('player joined!', this.roomName, this.roomId, client.id, options);
    const newPlayer = new PlayerState();
    this.state.players.push(newPlayer);
    newPlayer.id = client.id;
    newPlayer.name = options.name;
    newPlayer.isTeller = this._shouldAssignInitialTeller();
    if (newPlayer.isTeller) {
      newPlayer.hasBeenTellerForTimes = 1;
    }

    if (this.state.players.length === this.maxClients)
    {
      this.cards.deliverCards(this);
      this.state.gamePhase = GamePhase.TellerSelectingCard;
    }
  }

  onMessage (client, message) {
    console.log('player message', message);
    if (this.locked === false) {
      console.warn('why do we get messages when the room is not locked?'); 
    }
    var currentPlayer = this._getPlayerById(client.id);

    switch (this.state.gamePhase) {
      case GamePhase.TellerSelectingCard:
        if (!this._isMessageValid(message, MessageType.TellerSelectsWord, currentPlayer, true)) { break; }

        if (!message.selectedCard || !message.theWord) {
          console.warn('Message invalid.')
          break;
        }

        if (!this._SetUsingCardAndSplice(currentPlayer, message.selectedCard)) {
          break;
        }
        this.state.theWord = message.theWord;
        this.state.gamePhase = GamePhase.PlayersSelectingCards;
        console.log('teller tells!');

        break;
      
      case GamePhase.PlayersSelectingCards:
        if (!this._isMessageValid(message, MessageType.PlayerSelectsCard, currentPlayer, false)) { break; }

        if (!message.selectedCard) {
          console.warn('invalid card selected.');
          break;
        }
        if (!this._SetUsingCardAndSplice(currentPlayer, message.selectedCard)) {
          break;
        }

        // All players has selected their card.
        if (!this.state.players.some(function (player) { return !player.usingCard; })) {
          this.state.gamePhase = GamePhase.Voting;
        }
        break;
      
      case GamePhase.Voting:
        if (!this._isMessageValid(message, MessageType.PlayerVotes, currentPlayer, false)) { break; }

        if (!message.votedCard) {
          console.warn('invalid vote.');
          break;
        }
        if (message.votedCard === currentPlayer.usingCard) {
          console.warn('you cannot vote yourself.');
          break;
        }
        currentPlayer.votedCard = message.votedCard;
        // find owner and add voter
        var owner = this._findCardOwnerPlayer(currentPlayer.votedCard);
        owner.voters.push(currentPlayer.id);

        // All not-teller players votes
        if (!this.state.players.some(function (player) { return !(player.isTeller || player.votedCard); })) {
          this.state.players.forEach(player => {
            player.isReady = false;
          });
          this._scoreCalculator();
          this.state.gamePhase = GamePhase.GameResult;
        }
        break;

      case GamePhase.GameResult:
        // Now we'll decide whether to start a new round
        if (!message.messageType || message.messageType !== MessageType.ReadyForNextTurn) {
          console.warn('Message type error');
          return;
        }
        currentPlayer.isReady = true;

        if (this.state.players.some(function (player) {return player.isReady === false;}) === false){
          this._initNextRound();
        }
        break;
      default:
        console.warn('messages are not expected here.');
        break;
    }
  }

  onLeave (client, consented) {
    console.log('client left!', this.roomName, this.roomId, client.id);

    const leftPlayerIndex = this.state.players.findIndex((player) => player.id === client.id);
    this.state.players.splice(leftPlayerIndex, 1);

    // Roll back to init state
    this.state.round = 0;
    this.state.gamePhase = GamePhase.Boarding;
    this.state.theWord = '';
    this.state.players.forEach((player) => {
      player.holdingCards.splice(0, player.holdingCards.length);
      player.voters.splice(0, player.voters.length);
      player.usingCard = '';
      player.votedCard = '';
      player.score = 0;
      player.roundScore = 0;
      player.isReady = true;
      player.isTeller = false;
      player.hasBeenTellerForTimes = 0;
    });
    this.cards = new Cards();
  }

  onDispose() {
    console.log('room dispose!', this.roomName, this.roomId);
  }

  _SetUsingCardAndSplice(currentPlayer, selectedCard)
  {
    var index = currentPlayer.holdingCards.indexOf(selectedCard);
    if (index === -1)
    {
      console.warn('you cannot choose a card you dont have.');
      return false;
    }
    currentPlayer.holdingCards.splice(index, 1);
    currentPlayer.usingCard = selectedCard;
    return true;
  }

  _getPlayerById(clientId)
  {
    return this.state.players.find(function (player) {
      return player.id === clientId;
    });
  }

  _shouldAssignInitialTeller() {
    return this.state.players.length === 1;
  }

  _assignNextTeller(){
    const nextTeller = this.state.players.reduce((tellerCadicate, player) => {
      if (player.hasBeenTellerForTimes < tellerCadicate.hasBeenTellerForTimes) {
        return player;
      }
      return tellerCadicate;
    });

    nextTeller.isTeller = true;
  }

  _isMessageValid(message, expectedMessageType, player, shouldBeTeller) {
    if (player.isTeller !== shouldBeTeller) {
      console.warn('your role cannot send message now.');
      return false;
    }

    if (!message.messageType || message.messageType !== expectedMessageType) {
      console.warn('Message type error');
      return false;
    }
    return true;
  }

  _findCardOwnerPlayer(card) {
    return this.state.players.find((player) => player.usingCard === card);
  }

  _scoreCalculator() {
    var host = this.state.players.find(function (player){
      return player.isTeller === true;
    });
    var guests = this.state.players.splice(this.state.players.indexOf(host),1);
    var hostVote = host.voters.length;

    if (hostVote === 0 || hostVote === (this.maxClients  - 1)){
      host.roundScore = 0;
      guests.forEach(function (guest){
        guest.roundScore = 2;
      });
      roundScore = 2;
    }
    else{
      host.roundScore = 3;

      host.voters.forEach(function (voter){
        var player = this._getPlayerById(voter);
        player.roundScore = 3;
      });
    }

    guests.forEach(function (guest){
      guest.roundScore += guest.voters.length;
      });
  }

  _initNextRound() {
    this.state.round += 1;
    this.state.theWord = '';
    this.state.players.forEach(player => {
      player.hasBeenTellerForTimes += player.isTeller ? 1 : 0;
      player.isTeller = false;
      player.isReady = false;
      player.usingCard = '';
      player.votedCard = '';
      player.score += player.roundScore;
      player.roundScore = 0;
      player.voters.splice(0, player.voters.length);
    });
    this._assignNextTeller();
    this.cards.replenishCard(this);
    this.state.gamePhase = GamePhase.TellerSelectingCard;
  }
}