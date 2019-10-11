import React, { useState } from 'react';
import './dixit.css'
import * as Colyseus from "colyseus.js";
import LOGIN from '../login/login';
import GAMEBOARD from '../gameboard/gameboard'

const client = new Colyseus.Client('ws://localhost:2052');
window.tempClient = client;

// For dev
const fakeGameState = {
  players: [
    { id: '1', name: 'Enyao', isTeller: true },
    { id: '2', name: 'John' },
    { id: '3', name: '' },
  ],
  score:[
    { playerId: '1', score: 12, roundScore: 0 },
    { playerId: '2', score: 7, roundScore: 1 },
    { playerId: '3', score: 0, roundScore: 0 },
    { playerId: '4', score: 0, roundScore: 0 },
  ]
};

const DIXIT = ({}) => {
  const [room, setRoom] = useState(undefined);
  const [myName, setMyName] = useState('');

  return <>{
    room
    ? <GAMEBOARD
      gameState={fakeGameState}
      myName={myName}
    />
    : <LOGIN
      onConfirm={(p_userName) => {
        window.console.log(p_userName);
        setMyName(p_userName);
        setRoom(true);
      }}
    />
  }</>;
};

DIXIT.propTypes = {};

export default DIXIT;
