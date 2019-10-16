import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './gamelist.css';
import { Radio, Button, Spin } from 'antd';

const refreshRooms = ({ listGetter, setRooms, setRefreshing }) => {
  setRefreshing(true);
  listGetter().then((p_rooms) => {
    setRooms(p_rooms);
    setRefreshing(false);
  });
};

const GAMELIST = ({ userName, listGetter, onConfirm, onCancel }) => {
  const [rooms, setRooms] = useState([]);
  const [refreshing, setRefreshing] = useState(true);
  const roomSelectorRef = useRef();

  useEffect(() => refreshRooms({listGetter, setRooms, setRefreshing}), [listGetter]);

  const [disableJoin, setDisableJoin] = useState(true);

  const roomItems = rooms.map((p_room, index) => <Radio.Button
    key={index}
    value={p_room.roomId}
  >
    <span className='room-info'>
      <span><b>{p_room.metadata.roomNumber}</b></span>
      <span>({p_room.clients}/{p_room.maxClients})</span>
    </span>
  </Radio.Button>);
  return <div className="game-list-wrapper">
    <div id='user-name'>Name: <b>{userName}</b></div>
    <div id='list-header'>
      <span>Room number</span>
      <span>Clients</span>
    </div>
    <div id='list' className={refreshing ? 'refreshing' : ''}>
      <Radio.Group
        ref={roomSelectorRef}
        buttonStyle='solid'
        defaultValue=''
        onChange={(e) => {
          setDisableJoin(!(e.target.value));
        }}
      >
        {roomItems}
      </Radio.Group>  
      <div id='refreashing-overlay'><Spin /></div>
    </div>
    <div id='buttons'>
      <Button
        onClick={() => refreshRooms({listGetter, setRooms, setRefreshing})}
      >Refresh</Button>
      <Button
        type='primary'
        disabled={disableJoin}
        onClick={() => {
          onConfirm(roomSelectorRef.current.state.value);
        }}
      >Join</Button>
      <Button
        onClick={() => onCancel()}
      >Cancel</Button>
    </div>
  </div>
};

GAMELIST.propTypes = {
  userName: PropTypes.string.isRequired,
  listGetter: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default GAMELIST;