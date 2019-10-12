import React, { useState } from 'react';
import './dixit.css'
import * as Colyseus from "colyseus.js";
import LOGIN from '../login/login';
import GAMEBOARD from '../gameboard/gameboard';
import { Spin } from 'antd';

const client = new Colyseus.Client(`ws://${document.location.hostname}:2052`);

const handleConnected = (p_room, { setLogin, setRoom }) => {
  setLogin(false);
  setRoom(p_room);

  // For dev
  window.tempRoom = p_room;

  p_room.onLeave((p_code) => {
    if (p_code > 1000) {
      // Unexpected disconnect
      setLogin(false);
      setRoom(undefined);
  
      client.reconnect(p_room.id, p_room.sessionId)
        .then((p_room) => handleConnected(p_room, { setLogin, setRoom }))
        .catch(() => handleDisconnected({ setLogin, setRoom }));
    } else {
      handleDisconnected({ setLogin, setRoom });
    }
  });
};

const handleDisconnected = ({ setLogin, setRoom }) => {
  setLogin(true);
  setRoom(undefined);
};

const DIXIT = ({}) => {
  const [room, setRoom] = useState(undefined);
  const [login, setLogin] = useState(true);

  return <>{
    login
    ? <LOGIN
    onConfirm={(p_userName) => {
      setLogin(false);
      setRoom(undefined);

      client.joinOrCreate('room', { name: p_userName })
        .then((p_room) => handleConnected(p_room, { setLogin, setRoom }))
        .catch(() => handleDisconnected({ setLogin, setRoom }));
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
