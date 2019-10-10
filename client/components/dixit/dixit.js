import React from 'react';
import * as Colyseus from "colyseus.js";

const client = new Colyseus.Client('ws://localhost:2052');
window.tempClient = client;

const DIXIT = ({}) => {
  return <>
    <div className={'dixit-wrapper'}></div>
  </>;
};

DIXIT.propTypes = {};

export default DIXIT;