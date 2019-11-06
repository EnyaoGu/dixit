const http = require('http');
const express = require('express');
const cors = require('cors');
const colyseus = require('colyseus');
const { Room } = require('./Room');
const config = require('./config');

// Start client distribution
const distribution = express();
distribution.use('/', express.static(`${__dirname}/../dist`));
distribution.all('/', (req, res) => res.redirect('/index.html'))

distribution.listen(config.distPort);
console.log(`Client distribution listens on port:${config.distPort}`);

// Start game server
const game = express();
game.use(cors());
game.use(express.json());

const gameServer = new colyseus.Server({
  server: http.createServer(game),
  express: game,
});

// Register room handlers
gameServer.define('room', Room);

gameServer.listen(config.gamePort);
console.log(`Game server listens on port:${config.gamePort}`);
