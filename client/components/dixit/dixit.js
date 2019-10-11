import React, { useState } from 'react';
import './dixit.css'
import * as Colyseus from "colyseus.js";
import LOGIN from '../login/login';
import GAMEBOARD from '../gameboard/gameboard';
import { Spin } from 'antd';

const client = new Colyseus.Client('ws://localhost:2052');

const DIXIT = ({}) => {
  const [room, setRoom] = useState(undefined);
  const [login, setLogin] = useState(true);
  const [myId, setMyId] = useState('2');

  return <>{
    login
    ? <LOGIN
    onConfirm={(p_userName) => {
      setLogin(false);
      client.joinOrCreate('room', { name: p_userName })
        .then((p_room) => {
          setRoom(p_room);

          p_room.onLeave(() => {
            setLogin(true);
            setRoom(undefined);
          });

          // For dev
          window.tempRoom = p_room;
        })
        .catch(() => setLogin(true));
    }}
    />
    : room
    ? <GAMEBOARD
      room={room}
    />
    : <div className='waiting-spin-overlay'><Spin /></div>
  }</>;
};

DIXIT.propTypes = {};

export default DIXIT;
