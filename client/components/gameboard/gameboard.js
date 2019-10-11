import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Input } from 'antd';
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
  room.onStateChange(() => setGameState(room.state.toJSON()));

  const myId = room.sessionId;
  const myState = gameState.players.find((player) => player.id === myId);

  return <div className='gameboard-wrapper'>
    <div id='scoreboard'>{listScoreItems(gameState.players, myId)}</div>
    <CARDSELECTION
        cards={['../../resources/1.png', '../../resources/2.png', '../../resources/3.png', '../../resources/4.png', '../../resources/5.png']}
        pageType={myState && myState.isTeller ? PageType.tellerEnterDescription : PageType.playerWaiting}
        onCardSelected={(p_cardSelected, p_cardDescription) => {
          window.console.log(`${p_cardSelected} is selected`);
          if (p_cardDescription) {
            window.console.log(`card description is ${p_cardDescription}`);
          }
        }}
    />
  </div>;
};

GAMEBOARD.propTypes = {
  room: PropTypes.object.isRequired,
};

export default GAMEBOARD;
