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
    { id: '1', name: 'Enyao', isTeller: true, score: 12, roundScore: 0 },
    { id: '2', name: 'John', score: 7, roundScore: 1 },
    { id: '3', name: '', score: 0, roundScore: 0},
  ],
};

const DIXIT = ({}) => {
  const [room, setRoom] = useState(undefined);
  const [myId, setMyId] = useState('1');

  return <>{
    room
    ? <GAMEBOARD
      gameState={fakeGameState}
      myId={myId}
    />
    : <LOGIN
      onConfirm={(p_userName) => {
        setRoom(true);
      }}
    />
  }</>;
};

DIXIT.propTypes = {};

export default DIXIT;
