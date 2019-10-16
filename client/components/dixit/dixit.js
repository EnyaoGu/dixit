import React, { useState, useEffect } from 'react';
import './dixit.css'
import * as Colyseus from "colyseus.js";
import LOGIN, { confirmTypes } from '../login/login';
import GAMELIST from '../gamelist/gamelist';
import GAMEBOARD from '../gameboard/gameboard';
import { Spin } from 'antd';

const client = new Colyseus.Client(`ws://${document.location.hostname}:2052`);
window.client = client;

const pageTypes = Object.freeze({
  login: 'login',
  gameList: 'gameList',
  gaming: 'gamming',
  waiting: 'waiting',
});

const handleConnected = (p_room, { setPage, setRoom }) => {
  setRoom(p_room);
  setPage(pageTypes.gaming);

  // For dev
  window.tempRoom = p_room;

  p_room.onLeave((p_code) => {
    if (p_code > 1000) {
      // Unexpected disconnect
      setPage(pageTypes.waiting);
      setRoom(undefined);
  
      client.reconnect(p_room.id, p_room.sessionId)
        .then((p_room) => handleConnected(p_room, { setPage, setRoom }))
        .catch(() => handleDisconnected({ setPage, setRoom }));
    } else {
      handleDisconnected({ setPage, setRoom });
    }
  });
};

const handleDisconnected = ({ setPage, setRoom }) => {
  setPage(pageTypes.login);
  setRoom(undefined);
};

const DIXIT = ({}) => {
  const [page, setPage] = useState(pageTypes.login);
  const [room, setRoom] = useState(undefined);
  const [userName, setUserName] = useState('');
  useEffect(() => {
    if (!room) { return; }

    const disconnectRoom = () => room.leave();
    window.addEventListener('beforeunload', disconnectRoom);
    return () => window.removeEventListener('beforeunload', disconnectRoom);
  }, [room]);

  return <div className={`dixit-wrapper ${page === pageTypes.login ? 'login' : ''}`} >{
    page === pageTypes.login
    ? <LOGIN
      onConfirm={(p_confirmType, p_userName) => {
        setUserName(p_userName);

        switch (p_confirmType) {
        case confirmTypes.new:
          setPage(pageTypes.waiting);
          client.create('room', { name: p_userName })
            .then((p_room) => handleConnected(p_room, { setPage, setRoom }))
            .catch(() => handleDisconnected({ setPage, setRoom }));
          break;
        case confirmTypes.join:
          setPage(pageTypes.gameList);
          break;
        }
      }}
    />
    : page === pageTypes.gameList
    ? <GAMELIST
      listGetter={() => client.getAvailableRooms()}
      userName={userName}
      onConfirm={(p_roomId) => {
        setPage(pageTypes.waiting);

        client.joinById(p_roomId, { name: userName })
          .then((p_room) => handleConnected(p_room, { setPage, setRoom }))
          .catch(() => handleDisconnected({ setPage, setRoom }));
      }}
      onCancel={() => setPage(pageTypes.login)}
    />
    : page === pageTypes.gaming
    ? <GAMEBOARD
      room={room}
    />
    : page === pageTypes.waiting
    ? <div className='waiting-spin-overlay'><Spin /></div>
    : <div className='error-overlay'>Error. Please refresh the page</div>
  }</div>;
};

DIXIT.propTypes = {};

export default DIXIT;
