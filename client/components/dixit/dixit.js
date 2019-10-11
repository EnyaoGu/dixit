import React from 'react';
import * as Colyseus from "colyseus.js";
import LOGIN from '../login/login';
import './dixit.css'

const client = new Colyseus.Client('ws://localhost:2052');
window.tempClient = client;

const DIXIT = ({}) => {
  return <>
    <LOGIN
      onConfirm={(p_userName) => {
        window.console.log(p_userName)
      }}
    />
  </>;
};

DIXIT.propTypes = {};

export default DIXIT;
