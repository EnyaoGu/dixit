import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { CARDSELECTION, PageType } from '../cardselection/cardselection';
import './gameboard.css';

const noPlayerItem = (key) => <div className='score-item no-player' key={key}>No Player</div>;

const listScoreItems = (players, myId) => {
  const scoreItems = players.map((player, index) => {
    const classNames = ['score-item'];

    if (!player.name) { return noPlayerItem(index); }

    if (player.id === myId) {
      classNames.push('is-me');
    }

    if (player.isTeller) {
      classNames.push('is-teller');
    }

    return <div className={classNames.join(' ')} key={index}>
      {player.name}: {player.score}{player.roundScore ? `(+${player.roundScore})`: ''}
    </div>
  });

  while (scoreItems.length < 4) {
    scoreItems.push(noPlayerItem(scoreItems.length));
  }
  return scoreItems;
};

const GamePhase = {
  Boarding: 'Boarding',
  TellerSelectingCard: 'TellerSelectingCard',
  PlayersSelectingCards: 'PlayerSelectingCards',
  Voting: 'Voting',
  GameResult: 'GameResult',
}

const getPageType = (gamePhase, isTeller) => {
  switch (gamePhase) {
  case GamePhase.TellerSelectingCard:
    return isTeller ? PageType.tellerEnterDescription : PageType.playerWaiting;
  case GamePhase.PlayersSelectingCards:
    return isTeller ? PageType.tellerWaiting : PageType.playerPickCard;
  case GamePhase.Voting:
    return isTeller ? PageType.tellerWaiting : PageType.vote;
  default:
    return;
  }
};

const MessageType = {
  TellerSelectsWord : 'TellerSelectsWord',
  PlayerSelectsCard : 'PlayerSelectsCard',
  PlayerVotes : 'PlayerVotes',
  ReadyForNextTurn : 'ReadyForNextTurn',
}

const generateMessage = (p_pageType, p_selectedCard, p_descriptionWord) => {
  switch (p_pageType) {
  case PageType.tellerEnterDescription:
      return {
        messageType: MessageType.TellerSelectsWord,
        selectedCard: p_selectedCard,
        theWord: p_descriptionWord,
      }
  case PageType.playerPickCard:
    return {
      messageType: MessageType.PlayerSelectsCard,
      selectedCard: p_selectedCard,
    };
  case PageType.vote:
    return {
      messageType: MessageType.PlayerVotes,
      votedCard: p_selectedCard,
    };
  }
};

const getCardsOnTable = (players, disorder = false, exception = undefined) => {
  const orderCards = [];
  players.forEach((p_player) => {
    if (p_player.usingCard) {
      orderCards.push(p_player.usingCard);
    }
  });

  const exceptionIndex = orderCards.findIndex((p_card) => p_card === exception);
  if (exceptionIndex) {
    orderCards.splice(exceptionIndex, 1);
  }

  if (!disorder) { return orderCards };

  // Dis-order cards on table
  const cards = [];
  while (orderCards.length) {
    const index = Math.floor(Math.random() * orderCards.length);
    cards.push(orderCards[index]);
    orderCards.splice(index, 1);
  }
  return cards;
};

const getCards = (pageType, players, myState) => {
  switch (pageType) {
    case PageType.tellerEnterDescription:
    case PageType.playerWaiting:
    case PageType.playerPickCard:
      return myState.holdingCards.map((p_card) => p_card);
    case PageType.tellerWaiting:
      return getCardsOnTable(players);
    case PageType.vote:
      return getCardsOnTable(players, true, myState.usingCard);
  }
  return [];
}

const fakeGameState = {
  players: [
    { id: '1', name: 'Enyao', isTeller: true, score: 12, roundScore: 0 },
    { id: '2', name: 'John', score: 7, roundScore: 1 },
    { id: '3', name: '', score: 0, roundScore: 0},
  ],
};

const GAMEBOARD = ({ room }) => {
  // const [ gameState, setGameState ] = useState(fakeGameState);
  const [ gameState, setGameState ] = useState(room.state.toJSON());
  const [ gameStateThrottle, setGameStateThrottle ] = useState(null);
  room.state.onChange = () => {
    if (gameStateThrottle) { return; }
    const timeout = setTimeout(() => {
      setGameStateThrottle(null);
      setGameState(room.state.toJSON());
    }, 100);
    setGameStateThrottle(timeout);
  };
  window.console.log(gameState);

  const myId = room.sessionId;
  const myState = gameState.players.find((player) => player.id === myId);

  const pageType = getPageType(gameState.gamePhase, myState && myState.isTeller);
  const cards = getCards(pageType, gameState.players, myState);

  return <div className='gameboard-wrapper'>
    <div id='scoreboard'>{listScoreItems(gameState.players, myId)}</div>
    <div id='content-wrapper'>{
      gameState.gamePhase === GamePhase.GameResult
      ? <div></div> // Result page
      : pageType
      ? <CARDSELECTION
          cards={cards}
          theWord={gameState.theWord}
          pageType={pageType}
          onConfirm={(p_selectedCard, p_descriptionWord) => {
            const message = generateMessage(pageType, p_selectedCard, p_descriptionWord);
            if (message) {
              room.send(message);
            } else {
              window.console.error('Invalid card selection confirm');
            }
          }}
      />
      : <div></div> // Waiting for other players join
    }</div>
  </div>;
};

GAMEBOARD.propTypes = {
  room: PropTypes.object.isRequired,
};

export default GAMEBOARD;
