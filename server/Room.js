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
    const newPlayer = new PlayerState();
    newPlayer.id = client.id;
    newPlayer.name = options.name;
    newPlayer.isTeller = this.assignTeller();
    if (newPlayer.isTeller = this.assignTeller()) {
      newPlayer.hasBeenTellerForTimes +1;
    }
    this.state.players.push(newPlayer);

    if(this.clients.length === this.maxClients)
    {
      this.cards.deliverCards(this);
      this.gamePhase = GamePhase.TellerSelectingCard;
    }
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

        if (this._SetUsingCardAndSplice(currentPlayer, message.selectedCard) === false) {
          return;
        }
        this.state.theWord = message.theWord;
        this.state.gamePhase = GamePhase.PlayersSelectingCards;
        console.log('teller tells!');

        break;
      
      case GamePhase.PlayersSelectingCards:
        if (this._isMessageValid(false, MessageType.PlayerSelectsCard) === false){
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
        // host cannot vote.
        if (this._isMessageValid(false, MessageType.PlayerVotes) == false){
          return;
        }
        if (!message.votedCard) {
          console.warn('invalid vote.');
          return;
        }
        if (message.votedCard === currentPlayer.selectedCard) {
          console.warn('you cannot vote yourself.');
          return;
        }
        currentPlayer.votedCard = message.votedCard;
        // find owner and add voter
        var owner = this._findCardOwner(currentPlayer.votedCard);
        owner.voters.push(currentPlayer.id);

        // if all players votes
        if (this.state.players.some(function (player) {return player.votedCard === undefined;}) === false) {
          this.state.gamePhase = GamePhase.GameResult;
          this.state.players.forEach(player => {
            player.isReady = false;
          });
        }
        break;

        this._scoreCalculator();
        this.GamePhase = GamePhase.GameResult;

      case GamePhase.GameResult:
        // Now we'll decide whether to start a new round
        if (this._isMessageValid(undefined, MessageType.ReadyForNextTurn) == false){
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

  _assignRandomTeller(){
    var index = Math.floor(Math.random()*(this.clients.length));
    var selectedPlayer = this.state.palyers[index];
    selectedPlayer.isTeller = true;
    selectedPlayer.hasBeenTellerForTimes = selectedPlayer.hasBeenTellerForTimes + 1;
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
  _initNextRound(){
    this.players.forEach(player => {
      player.isTeller = false;
      player.holdingCards = [];
      player.usingCard = undefined;
      player.votedCard = undefined;
      player.roundScore = undefined;
    });
  }
}