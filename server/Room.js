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

    this.maxClients = 2;
    this.cards = new Cards();
  }

  onJoin (client, options) {
    console.log('player joined!', this.roomName, this.roomId, client.id, options);
    const newPlayer = new PlayerState();
    newPlayer.id = client.id;
    newPlayer.name = options.name;
    newPlayer.isTeller = this._assignTeller();
    if (newPlayer.isTeller = this._assignTeller()) {
      newPlayer.hasBeenTellerForTimes +1;
    }
    this.state.players.push(newPlayer);

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

        // if all players has selected their card.
        if (this.state.players.some(function (player) {return player.usingCard == undefined;}) == false) {
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
        var owner = this._findCardOwner(currentPlayer.votedCard);
        owner.voters.push(currentPlayer.id);

        // if all not-teller players votes
        if (!this.state.players.some(function (player) { return !(player.isTeller || player.votedCard); })) {
          this.state.gamePhase = GamePhase.GameResult;
          this.state.players.forEach(player => {
            player.isReady = false;
          });
        }
        
        this._scoreCalculator();
        this.GamePhase = GamePhase.GameResult;
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
          this._assignRandomTeller();
          this.cards.replenishCard(this);
          this.state.gamePhase = GamePhase.TellerSelectingCard;
        }
        break;

      default:
        console.warn('messages are not expected here.');
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

  _assignTeller() {
    return this.clients.length === 0;
  }

  _assignRandomTeller(){
    var index = Math.floor(Math.random()*(this.clients.length));
    var selectedPlayer = this.state.palyers[index];
    selectedPlayer.isTeller = true;
    selectedPlayer.hasBeenTellerForTimes = selectedPlayer.hasBeenTellerForTimes + 1;
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

  _findCardOwner(card)
  {
    return this.state.palyers.find(function (player) {
      return player.holdingCards.includes(card);
    });
  }

  _scoreCalculator() {
    var host = this.state.players.find(function (player){
      return player.isTeller === true;
    });
    var guests = this.state.players.splice(this.state.players.indexOf(host),1);
    var hostVote = host.voters.length;

    if (hostVote === 0 || hostVote === 3){
      host.roundScore = 0;
      guests.forEach(guest =>{
        guest.roundScore = 2;
      });
      roundScore = 2;
    }
    else{
      host.roundScore = hostVote * 3;

      host.voters.forEach(voter => {
        var player = this._getPlayerById(voter);
        player.roundScore = 3;
      });
    }

    guests.forEach(guest =>{
      if (owner = this._findCardOwner(guest.votedCard) != host){
        owner.roundScore + 1;
      }
    });

    this.state.players.forEach(player =>{
      player.score += player.roundScore;
    });
  }

  _initNextRound() {
    this.state.players.forEach(player => {
      player.isTeller = false;
      player.holdingCards = [];
      player.usingCard = undefined;
      player.votedCard = undefined;
      player.roundScore = undefined;
    });
  }
}