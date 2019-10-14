import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Input } from 'antd';
import './login.css';

export const confirmTypes = Object.freeze({
  new: 'new',
  join: 'join',
});

const LOGIN = ({ onConfirm }) => {
  const [userName, setUserName] = useState('');

  return <div className={'login-wrapper'}>
    <Input
      id='user-name'
      placeholder='Enter your name'
      size='large'
      value={userName}
      onChange={(e) => {
        setUserName(e.target.value);
      }}
    />
    <div
      id='button-row'
    >
      <Button
        type='primary'
        onClick={() => onConfirm(confirmTypes.new, userName)}
        size='large'
        disabled={!userName}
      >
        New game
      </Button>
      <Button
        type='primary'
        onClick={() => onConfirm(confirmTypes.join, userName)}
        size='large'
        disabled={!userName}
      >
        Join game
      </Button>
    </div>
  </div>;
};

LOGIN.propTypes = {
  onConfirm: PropTypes.func.isRequired,
};

export default LOGIN;
