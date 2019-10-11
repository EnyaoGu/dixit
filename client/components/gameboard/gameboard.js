import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Input } from 'antd';
import './gameboard.css';

const noPlayerItem = (key) => <div className='score-item no-player' key={key}>No Player</div>;

const GAMEBOARD = ({ gameState, myId }) => {
  const scoreItems = gameState.players.map((player, index) => {
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

  return <div className='gameboard-wrapper'>
    <div id='scoreboard'>{scoreItems}</div>
    <div>
      {JSON.stringify(gameState)}
    </div>
  </div>;
};

GAMEBOARD.propTypes = {
  gameState: PropTypes.object.isRequired,
  myId: PropTypes.string.isRequired,
};

export default GAMEBOARD;
