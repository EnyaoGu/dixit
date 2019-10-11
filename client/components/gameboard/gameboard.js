import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Input } from 'antd';
import { CARDSELECTION, PageType } from '../cardselection/cardselection';
import './gameboard.css';

const noPlayerItem = (key) => <div className='score-item no-player' key={key}>No Player</div>;

const GAMEBOARD = ({ gameState, myId }) => {
  let iAmTeller = false;
  const scoreItems = gameState.players.map((player, index) => {
    const classNames = ['score-item'];

    if (!player.name) { return noPlayerItem(index); }

    if (player.id === myId) {
      classNames.push('is-me');
    }

    if (player.isTeller) {
      classNames.push('is-teller');
    }

    if (player.id === myId && player.isTeller) {
      iAmTeller = true;
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
    <CARDSELECTION
        cards={['../../resources/1.png', '../../resources/2.png', '../../resources/3.png', '../../resources/4.png', '../../resources/5.png']}
        pageType={iAmTeller ? PageType.tellerEnterDescription : PageType.playerWaiting}
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
  gameState: PropTypes.object.isRequired,
  myId: PropTypes.string.isRequired,
};

export default GAMEBOARD;
