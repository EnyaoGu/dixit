const http = require('http');
const express = require('express');
const cors = require('cors');
const colyseus = require('colyseus');
const { Room } = require('./Room');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const gameServer = new colyseus.Server({
  server: server,
  express: app,
});

// register room handlers
gameServer.define('room', Room);

const port = process.env.PORT || 2052;
gameServer.listen(port);
console.log(`Listening on ws://localhost:${port}`)
