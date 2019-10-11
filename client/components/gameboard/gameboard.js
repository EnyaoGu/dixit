import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Input } from 'antd';
import './gameboard.css';

const noPlayerItem = (key) => <div className='score-item no-player' key={key}>No Player</div>;

const GAMEBOARD = ({ gameState, myName }) => {
  const scoreItems = gameState.players.map((player, index) => {
    const classNames = ['score-item'];
    const scoreItem = gameState.score.find((p_scoreItem) => p_scoreItem.playerId === player.id);

    if (!player.name) { return noPlayerItem(index); }

    if (player.name === myName) {
      classNames.push('is-me');
    }

    if (player.isTeller) {
      classNames.push('is-teller');
    }

    return <div className={classNames.join(' ')} key={index}>
      {player.name}: {scoreItem.score}{scoreItem.roundScore ? `(+${scoreItem.roundScore})`: ''}
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
  myName: PropTypes.string.isRequired,
};

export default GAMEBOARD;