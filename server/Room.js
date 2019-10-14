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

const roomNumberPool = [];
for (let number = 0; number < 10000; number += 1) {
  roomNumberPool.push(new String(Math.floor(number)).padStart(4, '0'));
}

const pickOutRoomNumberFromPool = () => {
  if (!roomNumberPool.length) { return null; }
  const index = Math.floor(Math.random() * roomNumberPool.length);
  return roomNumberPool.splice(index, 1)[0];
};

exports.Room = class extends colyseus.Room {
  onCreate (options) {
    const roomNumber = pickOutRoomNumberFromPool();
    if (!roomNumber) {
      console.log('can not create room since server out of room number');
      this.disconnect();
      return;
    }
    this.metadata.roomNumber = roomNumber;

    this.setState(new RoomState());
    this.state.round = 0;
    this.state.gamePhase = GamePhase.Boarding;
    this.state.theWord = '';
    this.players = [];
    this._updatePlayerJSONs();

    this.maxClients = 4;
    this.cards = new Cards();

    console.log('room created!', this.roomName, this.roomId, roomNumber, options);
  }

  _updatePlayerJSONs() {
    this.players.forEach((player, index) => {
      this.state.playerJSONs[index] = JSON.stringify(player);
    });
    this.state.playerJSONs.splice(this.players.length);
  }

  onJoin (client, options) {
    console.log('player joined!', this.roomName, this.roomId, client.id, options);
    const newPlayer = new PlayerState();
    newPlayer.id = client.id;
    newPlayer.name = options.name;
    this.players.push(newPlayer);
    
    if (this.players.length === this.maxClients)
    {
      this._assignNextTeller();
      this.cards.deliverCards(this);
      this.state.gamePhase = GamePhase.TellerSelectingCard;
    }

    this._updatePlayerJSONs();
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
        if (!this.players.some(function (player) { return !player.usingCard; })) {
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
        this._updatePlayerJSONs();

        // All not-teller players votes
        if (!this.players.some(function (player) { return !(player.isTeller || player.votedCard); })) {
          this.players.forEach(player => {
            player.isReady = false;
          });
          this._updatePlayerJSONs();
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

        if (!this.players.some(function (player) { return !player.isReady; })){
          this._initNextRound();
        }
        break;
      default:
        console.warn('messages are not expected here.');
        break;
    }
  }

  onLeave(client, consented) {
    if (!consented) {
      console.log('abnormal client disconnect', this.roomName, this.roomId, client.id);
      this.allowReconnection(client, 20)
        .then(() => {
          console.log('client reconnected', this.roomName, this.roomId, client.id);

          if (this.clients.length === this.maxClients) { this.lock (); }
        })
        .catch(() => this._handlePlayerActualLeave(client));
      return;
    }

    this._handlePlayerActualLeave(client);
  }

  _handlePlayerActualLeave(client) {
    console.log('client left!', this.roomName, this.roomId, client.id);

    const leftPlayerIndex = this.players.findIndex((player) => player.id === client.id);
    this.players.splice(leftPlayerIndex, 1);

    // Roll back to init state
    this.state.round = 0;
    this.state.gamePhase = GamePhase.Boarding;
    this.state.theWord = '';
    this.players.forEach((player) => {
      player.holdingCards.splice(0, player.holdingCards.length);
      player.voters.splice(0, player.voters.length);
      player.usingCard = '';
      player.votedCard = '';
      player.score = 0;
      player.roundScore = 0;
      player.isTeller = false;
      player.hasBeenTellerForTimes = 0;
    });
    this._updatePlayerJSONs();
    this.cards = new Cards();

    this.unlock ();
  }

  onDispose() {
    console.log('room dispose!', this.roomName, this.roomId);

    // Return back the roomNumber into pool
    pickOutRoomNumberFromPool.push(this.metadata.roomNumber);
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
    this._updatePlayerJSONs();
    return true;
  }

  _getPlayerById(clientId)
  {
    return this.players.find(function (player) {
      return player.id === clientId;
    });
  }

  _assignNextTeller(){
    const nextTeller = this.players.reduce((tellerCadicate, player) => {
      if (player.hasBeenTellerForTimes < tellerCadicate.hasBeenTellerForTimes) {
        return player;
      }
      return tellerCadicate;
    });

    nextTeller.isTeller = true;
    this._updatePlayerJSONs();
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
    return this.players.find((player) => player.usingCard === card);
  }

  _scoreCalculator() {
    var hostIndex = this.players.findIndex(function (player){
      return player.isTeller === true;
    });
    var host = this.players[hostIndex];
    var guests = this.players.slice();
    guests.splice(hostIndex, 1);
    var hostVote = host.voters.length;

    if (hostVote === 0 || hostVote === (this.maxClients  - 1)){
      host.roundScore = 0;
      guests.forEach(function (guest){
        guest.roundScore = 2;
      });
    }
    else{
      host.roundScore = 3;

      host.voters.forEach((voter) => {
        var player = this._getPlayerById(voter);
        player.roundScore = 3;
      });
    }

    guests.forEach(function (guest) {
      guest.roundScore += guest.voters.length;
    });

    this._updatePlayerJSONs();
  }

  _initNextRound() {
    console.log('start next rount');
    this.state.round = this.state.round + 1;
    this.state.theWord = '';
    this.players.forEach(player => {
      player.hasBeenTellerForTimes = player.hasBeenTellerForTimes + (player.isTeller ? 1 : 0);
      player.isTeller = false;
      player.usingCard = '';
      player.votedCard = '';
      player.score = player.score + player.roundScore;
      player.roundScore = 0;
      player.voters.splice(0, player.voters.length);
    });

    this._assignNextTeller();
    this.cards.replenishCard(this);
    this.state.gamePhase = GamePhase.TellerSelectingCard;

    this._updatePlayerJSONs();
  }
}