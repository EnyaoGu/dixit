import React, { useState } from 'react';
import './dixit.css'
import * as Colyseus from "colyseus.js";
import LOGIN from '../login/login';
import GAMEBOARD from '../gameboard/gameboard';
import { Spin } from 'antd';

const client = new Colyseus.Client('ws://localhost:2052');

// For dev
window.tempClient = client;
const fakeGameState = {
  players: [
    { id: '1', name: 'Enyao', isTeller: true, score: 12, roundScore: 0 },
    { id: '2', name: 'John', score: 7, roundScore: 1 },
    { id: '3', name: '', score: 0, roundScore: 0},
  ],
};

const DIXIT = ({}) => {
  const [room, setRoom] = useState(undefined);
  const [login, setLogin] = useState(true);
  const [myId, setMyId] = useState('2');

  // For dev
  window.tempRoom = room;

  return <>{
    login
    ? <LOGIN
    onConfirm={(p_userName) => {
      setLogin(false);
      client.joinOrCreate('room', { name: p_userName })
        .then((p_room) => setRoom(p_room))
        .catch(() => setLogin(true));
    }}
    />
    : room
    ? <GAMEBOARD
      gameState={fakeGameState}
      myId={myId}
    />
    : <div className='waiting-spin-overlay'><Spin /></div>
  }</>;
};

DIXIT.propTypes = {};

export default DIXIT;
