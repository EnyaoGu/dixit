import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Input } from 'antd';
import './login.css';

const LOGIN = ({ onConfirm }) => {
  const [userName, setUserName] = useState('');

  return <>
    <div className={'login-wrapper'}>
      <div
        id='title'
      >
        DIXIT
      </div>
      <Input
        id='user-name'
        placeholder='Enter your name'
        size='large'
        onChange={(e) => {
          setUserName(e.target.value);
        }}
        onPressEnter={() => onConfirm(userName)}
      />
      <Button
        type='primary'
        onClick={() => onConfirm(userName)}
        size='large'
      >
        Join!
      </Button>
    </div>
  </>;
};

LOGIN.propTypes = {
  onConfirm: PropTypes.func.isRequired,
};

export default LOGIN;